import { prisma } from '@/lib/prisma'
import { neo4jSession } from '@/lib/neo4j'
import { getTradeFlow } from '@/services/comtrade'
import { getCountryCO2Data } from '@/services/worldBank'
import { getGridCarbonIntensity } from '@/services/gridCarbon'
import { API, CONVERSION_FACTORS, DATA_FRESHNESS, BUSINESS_RULES } from '@/lib/constants'

export interface SupplierEmission {
  supplierId: string
  supplierName: string
  country: string
  hsCode?: string
  embeddedCarbonTco2e: number
  emissionFactor: number
  emissionSource: string
  tradeVolumeKg: number
}

export interface Scope3Result {
  totalScope3Tco2e: number
  bySupplier: SupplierEmission[]
  evidenceRefs: string[]
  period: string
  warnings: string[]
}

export async function calculateScope3Emissions(
  orgId: string,
  period: string
): Promise<Scope3Result> {
  const warnings: string[] = []
  const evidenceRefs: string[] = []
  const bySupplier: SupplierEmission[] = []
  let totalScope3Tco2e = 0

  try {
    // Fetch all suppliers for the organization
    const suppliers = await prisma.supplier.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        country: true,
        hsCode: true,
        carbonIntensity: true,
        intensitySource: true,
        intensityUpdatedAt: true,
      }
    })

    const year = parseInt(period.split('-')[0] || new Date().getFullYear().toString())

    for (const supplier of suppliers) {
      try {
        let emissionFactor = 0
        let emissionSource = 'unknown'
        let tradeVolumeKg = 0

        // Get trade flow data if HS code is available
        if (supplier.hsCode) {
          const tradeData = await getTradeFlow(supplier.hsCode, supplier.country, year)
          tradeVolumeKg = tradeData.reduce((sum, item) => sum + item.netWeightKg, 0)
        }

        // Determine emission factor with waterfall strategy
        if (supplier.carbonIntensity && supplier.intensityUpdatedAt) {
          const daysSinceUpdate = (Date.now() - supplier.intensityUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceUpdate <= DATA_FRESHNESS.DAYS) {
            emissionFactor = supplier.carbonIntensity
            emissionSource = supplier.intensitySource || 'user_provided'
          }
        }

        // Fallback 1: Grid carbon intensity
        if (emissionFactor === 0) {
          try {
            const gridData = await getGridCarbonIntensity(supplier.country)
            emissionFactor = gridData.carbonIntensity * CONVERSION_FACTORS.GCO2_TO_TCO2 // Convert gCO2/kWh to tCO2/MWh
            emissionSource = 'grid_intensity'
          } catch (error) {
            warnings.push(`Grid intensity unavailable for ${supplier.name}`)
          }
        }

        // Fallback 2: World Bank country average
        if (emissionFactor === 0) {
          try {
            const countryData = await getCountryCO2Data(supplier.country)
            emissionFactor = countryData.co2KilotonnesTotal * CONVERSION_FACTORS.KILOTONNES_TO_TONNES // Convert to tCO2e
            emissionSource = 'world_bank_average'
          } catch (error) {
            warnings.push(`Country data unavailable for ${supplier.name}`)
          }
        }

        // Final fallback: use industry average
        if (emissionFactor === 0) {
          emissionFactor = CONVERSION_FACTORS.INDUSTRY_AVERAGE_EMISSION_FACTOR // tCO2e per unit (industry average)
          emissionSource = 'industry_average'
          warnings.push(`Using industry average for ${supplier.name} - no specific data available`)
        }

        // Calculate embedded carbon
        const embeddedCarbonTco2e = tradeVolumeKg > BUSINESS_RULES.MIN_TRADE_VOLUME_KG ? tradeVolumeKg * emissionFactor : 0

        // Create emission record
        if (embeddedCarbonTco2e > 0) {
          const emissionRecord = await prisma.emissionRecord.create({
            data: {
              orgId,
              scope: 3,
              category: 'purchased_goods',
              value: embeddedCarbonTco2e,
              unit: 'tCO2e',
              period,
              sourceUrl: supplier.hsCode ? `https://comtrade.un.org/data/${supplier.hsCode}` : undefined,
            }
          })

          evidenceRefs.push(emissionRecord.id)
          totalScope3Tco2e += embeddedCarbonTco2e
        }

        // Create Neo4j audit trail
        const session = neo4jSession()
        try {
          const result = await session.run(
            `
            CREATE (org:Organisation {id: $orgId})
            CREATE (sup:Supplier {id: $supplierId, name: $supplierName, country: $country})
            CREATE (em:EmissionRecord {id: $emissionId, value: $value, source: $source})
            CREATE (org)-[:SOURCED_FROM]->(sup)
            CREATE (sup)-[:EMITTED]->(em)
            RETURN em.id as nodeId
            `,
            {
              orgId,
              supplierId: supplier.id,
              supplierName: supplier.name,
              country: supplier.country,
              emissionId: evidenceRefs[evidenceRefs.length - 1],
              value: embeddedCarbonTco2e,
              source: emissionSource
            }
          )
          
          if (result.records.length > 0) {
            evidenceRefs.push(result.records[0].get('nodeId'))
          }
        } finally {
          await session.close()
        }

        bySupplier.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          country: supplier.country,
          hsCode: supplier.hsCode || undefined,
          embeddedCarbonTco2e,
          emissionFactor,
          emissionSource,
          tradeVolumeKg
        })

      } catch (error) {
        warnings.push(`Failed to calculate emissions for ${supplier.name}: ${error}`)
      }
    }

    return {
      totalScope3Tco2e,
      bySupplier,
      evidenceRefs,
      period,
      warnings
    }

  } catch (error) {
    throw new Error(`Scope 3 calculation failed: ${error}`)
  }
}
