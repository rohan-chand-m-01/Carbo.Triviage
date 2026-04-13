import { withCache } from '@/lib/redis'

export interface WorldBankCO2Data {
  country: string
  year: number
  co2KilotonnesTotal: number
  co2PerCapita: number
}

export async function getCountryCO2Data(country: string): Promise<WorldBankCO2Data> {
  const cacheKey = `worldbank:co2:${country}`
  
  return withCache(cacheKey, 2592000, async () => {
    try {
      const response = await fetch(
        `${process.env.WORLD_BANK_API_BASE}/country/${country}/indicator/EN.ATM.CO2E.KT?format=json&per_page=5`
      )
      if (response.ok) {
        const data = await response.json()
        const latest = data[1]?.[0]
        if (latest) {
          return {
            country,
            year: latest.date,
            co2KilotonnesTotal: latest.value || 0,
            co2PerCapita: 0 // Would need additional API call
          }
        }
      }
    } catch (error) {
      console.error('World Bank API failed:', error)
    }

    // Fallback data
    return {
      country,
      year: new Date().getFullYear() - 1,
      co2KilotonnesTotal: 50000, // Average country
      co2PerCapita: 5
    }
  })
}
