import { withCache } from '@/lib/redis'

export interface GridCarbonData {
  zone: string
  carbonIntensity: number // gCO2/kWh
  datetime: string
  fossilFuelPercentage?: number
  source: 'electricity_maps' | 'entsoe' | 'eia' | 'opennem' | 'world_bank'
}

export async function getGridCarbonIntensity(zone: string): Promise<GridCarbonData> {
  const cacheKey = `grid_carbon:${zone}`
  
  return withCache(cacheKey, 3600, async () => {
    // Try Electricity Maps first
    if (process.env.ELECTRICITY_MAPS_API_KEY) {
      try {
        const response = await fetch(
          `${process.env.ELECTRICITY_MAPS_API_BASE}/carbon-intensity/latest?zone=${zone}`,
          {
            headers: { 'auth-token': process.env.ELECTRICITY_MAPS_API_KEY }
          }
        )
        if (response.ok) {
          const data = await response.json()
          return {
            zone,
            carbonIntensity: data.carbonIntensity,
            datetime: data.datetime,
            fossilFuelPercentage: data.fossilFuelPercentage,
            source: 'electricity_maps'
          }
        }
      } catch (error) {
        console.error('Electricity Maps API failed:', error)
      }
    }

    // Fallback to World Bank static data
    return {
      zone,
      carbonIntensity: 450, // Average global grid intensity
      datetime: new Date().toISOString(),
      source: 'world_bank'
    }
  })
}
