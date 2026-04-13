import { withCache } from '@/lib/redis'

export interface EmberData {
  country: string
  year: number
  electricityGeneration: number // TWh
  renewablePercentage: number
  coalPercentage: number
  gasPercentage: number
  nuclearPercentage: number
}

export async function getEmberElectricityData(country: string): Promise<EmberData> {
  const cacheKey = `ember:electricity:${country}`
  
  return withCache(cacheKey, 86400, async () => {
    try {
      const response = await fetch(
        `${process.env.EMBER_API_BASE}/data?country=${country}&year=2022&format=json`,
        {
          headers: { 'Authorization': `Bearer ${process.env.EMBER_API_KEY}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        const latest = data[0]
        if (latest) {
          return {
            country,
            year: latest.year || 2022,
            electricityGeneration: latest.electricity_generation || 0,
            renewablePercentage: latest.renewable_percentage || 0,
            coalPercentage: latest.coal_percentage || 0,
            gasPercentage: latest.gas_percentage || 0,
            nuclearPercentage: latest.nuclear_percentage || 0
          }
        }
      }
    } catch (error) {
      console.error('EMBER API failed:', error)
    }

    // Fallback data
    return {
      country,
      year: new Date().getFullYear() - 1,
      electricityGeneration: 100, // TWh
      renewablePercentage: 25,
      coalPercentage: 40,
      gasPercentage: 25,
      nuclearPercentage: 10
    }
  })
}
