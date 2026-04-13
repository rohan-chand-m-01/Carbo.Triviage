import type { ComtradeData } from '@/services/comtrade'

export const mockComtradeData: ComtradeData[] = [
  {
    hsCode: '870323',
    reporterCountry: 'Germany',
    partnerCountry: 'China',
    tradeValueUsd: 1500000,
    netWeightKg: 50000,
    year: 2023
  },
  {
    hsCode: '870323',
    reporterCountry: 'Germany',
    partnerCountry: 'Japan',
    tradeValueUsd: 800000,
    netWeightKg: 25000,
    year: 2023
  }
]

export function mockGetTradeFlow(
  hsCode: string,
  country: string,
  year: number
): Promise<ComtradeData[]> {
  return Promise.resolve(
    mockComtradeData.map(item => ({
      ...item,
      hsCode,
      reporterCountry: country,
      year,
      tradeValueUsd: item.tradeValueUsd * (0.5 + Math.random()),
      netWeightKg: item.netWeightKg * (0.5 + Math.random())
    }))
  )
}
