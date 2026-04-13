import type { GridCarbonData } from '@/services/gridCarbon'

export const mockGridCarbonData: GridCarbonData = {
  zone: 'DE',
  carbonIntensity: 350,
  datetime: new Date().toISOString(),
  fossilFuelPercentage: 45,
  source: 'electricity_maps'
}

export function mockGetGridCarbonIntensity(zone: string): Promise<GridCarbonData> {
  return Promise.resolve({
    ...mockGridCarbonData,
    zone,
    carbonIntensity: 200 + Math.random() * 300, // 200-500 gCO2/kWh
    fossilFuelPercentage: 20 + Math.random() * 60, // 20-80%
  })
}
