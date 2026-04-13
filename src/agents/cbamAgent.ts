import { prisma } from '@/lib/prisma'
import { neo4jSession } from '@/lib/neo4j'
// ECB service not available - using fallback data
import { getCountryCO2Data } from '@/services/worldBank'
import { CURRENCY, CBAM, EMISSIONS } from '@/lib/constants'

export interface CbamLineItem {
  hsCode: string
  originCountry: string
  quantity: number
  unit: string
  embeddedCarbonTco2e: number
  cbamLiability: number
  originCarbonPrice: number
  etsPrice: number
}

export interface CbamResult {
  declarationId: string
  totalEmissions: number
  totalLiability: number
  lineItems: CbamLineItem[]
  auditNodeId: string
  status: 'DRAFT' | 'INCOMPLETE' | 'READY'
  warnings: string[]
}

export async function generateCbamDeclaration(
  orgId: string,
  declarationYear: number,
  quarter: number
): Promise<CbamResult> {
  const warnings: string[] = []
  const lineItems: CbamLineItem[] = []
  let totalEmissions = 0
  let totalLiability = 0

  try {
    // Get current ETS price - using fallback data since ECB API not available
    const etsPrice = CBAM.CARBON_PRICE_THRESHOLDS.HIGH_EMISSIONS_PRICE // 25 EUR/ton fallback

    // Fetch emission records for the period (Scope 3 - imported goods)
    const period = `${declarationYear}-Q${quarter}`
    const emissionRecords = await prisma.emissionRecord.findMany({
      where: {
        orgId,
        scope: 3,
        period,
        category: {
          in: ['imported_goods', 'purchased_goods', 'transport']
        }
      },
      include: {
        facility: true
      }
    })

    if (emissionRecords.length === 0) {
      warnings.push('No emission records found for the specified period')
      return {
        declarationId: '',
        totalEmissions: 0,
        totalLiability: 0,
        lineItems: [],
        auditNodeId: '',
        status: 'INCOMPLETE',
        warnings: ['No emission data available for CBAM calculation']
      }
    }

    // Get organization's suppliers for additional context
    const suppliers = await prisma.supplier.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        country: true,
        hsCode: true,
        carbonIntensity: true
      }
    })

    // Process each emission record as a CBAM line item
    for (const record of emissionRecords) {
      try {
        // Find matching supplier
        const supplier = suppliers.find(s => 
          s.country && record.facility?.country === s.country
        )

        const originCountry = supplier?.country || record.facility?.country || 'Unknown'
        const hsCode = supplier?.hsCode || CBAM.DEFAULT_HS_CODE

        // Get origin country carbon price (fallback to World Bank data)
        let originCarbonPrice = 0
        try {
          const countryData = await getCountryCO2Data(originCountry)
          // Use configurable thresholds for carbon pricing determination
          originCarbonPrice = countryData.co2KilotonnesTotal > CBAM.CARBON_PRICE_THRESHOLDS.HIGH_EMISSIONS 
            ? CBAM.CARBON_PRICE_THRESHOLDS.HIGH_EMISSIONS_PRICE 
            : CBAM.CARBON_PRICE_THRESHOLDS.DEFAULT_PRICE
        } catch (error) {
          warnings.push(`Could not determine carbon price for ${originCountry}`)
          originCarbonPrice = CBAM.CARBON_PRICE_THRESHOLDS.DEFAULT_PRICE
        }

        // Calculate CBAM liability
        const embeddedCarbonTco2e = record.value
        const priceDifferential = Math.max(0, etsPrice - originCarbonPrice)
        const cbamLiability = embeddedCarbonTco2e * priceDifferential

        const lineItem: CbamLineItem = {
          hsCode,
          originCountry,
          quantity: CBAM.QUANTITY_DEFAULT,
          unit: CBAM.UNIT,
          embeddedCarbonTco2e,
          cbamLiability,
          originCarbonPrice,
          etsPrice
        }

        lineItems.push(lineItem)
        totalEmissions += embeddedCarbonTco2e
        totalLiability += cbamLiability

      } catch (error) {
        warnings.push(`Failed to process emission record ${record.id}: ${error}`)
      }
    }

    // Create CBAM declaration record
    const declaration = await prisma.cbamDeclaration.create({
      data: {
        orgId,
        declarationYear,
        quarter,
        importedGoods: JSON.parse(JSON.stringify(lineItems)),
        totalEmissions,
        totalLiabilityEur: totalLiability,
        status: 'DRAFT'
      }
    })

    // Create Neo4j audit trail
    let auditNodeId = ''
    const session = neo4jSession()
    try {
      const result = await session.run(
        `
        CREATE (decl:CbamDeclaration {
          id: $declarationId,
          orgId: $orgId,
          year: $year,
          quarter: $quarter,
          totalEmissions: $totalEmissions,
          totalLiability: $totalLiability,
          etsPrice: $etsPrice,
          createdAt: $createdAt
        })
        RETURN decl.id as nodeId
        `,
        {
          declarationId: declaration.id,
          orgId,
          year: declarationYear,
          quarter,
          totalEmissions,
          totalLiability: totalLiability,
          etsPrice: etsPrice,
          createdAt: new Date().toISOString()
        }
      )
      
      if (result.records.length > 0) {
        auditNodeId = result.records[0].get('nodeId')
        
        // Update declaration with audit node reference
        await prisma.cbamDeclaration.update({
          where: { id: declaration.id },
          data: { auditNodeId }
        })
      }

      // Link emission records to declaration
      for (const record of emissionRecords) {
        await session.run(
          `
          MATCH (decl:CbamDeclaration {id: $declarationId})
          MATCH (em:EmissionRecord {id: $emissionId})
          CREATE (decl)-[:BASED_ON]->(em)
          `,
          {
            declarationId: declaration.id,
            emissionId: record.id
          }
        )
      }

    } finally {
      await session.close()
    }

    // Determine status
    let status: 'DRAFT' | 'INCOMPLETE' | 'READY' = 'READY'
    if (warnings.length > 0) {
      status = 'DRAFT'
    }
    if (lineItems.length === 0) {
      status = 'INCOMPLETE'
    }

    return {
      declarationId: declaration.id,
      totalEmissions,
      totalLiability,
      lineItems,
      auditNodeId,
      status,
      warnings
    }

  } catch (error) {
    throw new Error(`CBAM declaration generation failed: ${error}`)
  }
}
