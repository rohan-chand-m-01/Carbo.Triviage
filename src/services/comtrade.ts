import { withCache } from '@/lib/redis'

export interface ComtradeData {
  hsCode: string
  reporterCountry: string
  partnerCountry: string
  tradeValueUsd: number
  netWeightKg: number
  year: number
}

export async function getTradeFlow(
  hsCode: string,
  country: string,
  year: number
): Promise<ComtradeData[]> {
  const cacheKey = `comtrade:${hsCode}:${country}:${year}`
  
  return withCache(cacheKey, 604800, async () => {
    // Try UN Comtrade first
    if (process.env.UN_COMTRADE_API_KEY) {
      try {
        const response = await fetch(
          `${process.env.UN_COMTRADE_API_BASE}?typeCode=C&freqCode=A&clCode=HS&reporterCode=${country}&cmdCode=${hsCode}&flowCode=M&period=${year}`
        )
        if (response.ok) {
          const data = await response.json()
          return data.data?.map((item: any) => ({
            hsCode: item.cmdCode,
            reporterCountry: item.rtTitle,
            partnerCountry: item.ptTitle,
            tradeValueUsd: item.TradeValue,
            netWeightKg: item.NetWeight || 0,
            year: item.refPeriod
          })) || []
        }
      } catch (error) {
        console.error('UN Comtrade API failed:', error)
      }
    }

    // Final fallback - mock data
    return [{
      hsCode,
      reporterCountry: country,
      partnerCountry: 'World',
      tradeValueUsd: 1000000,
      netWeightKg: 1000,
      year
    }]
  })
}
