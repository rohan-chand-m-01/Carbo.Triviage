import { NextRequest, NextResponse } from 'next/server'
import { CBAM } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const history = searchParams.get('history') === 'true'

  try {
    // Return fallback data since ECB API is not available
    if (history) {
      const data = [
        { date: '2024-01-01', price: 65 },
        { date: '2024-02-01', price: 68 },
        { date: '2024-03-01', price: 72 },
        { date: '2024-04-01', price: 75 }
      ]
      return NextResponse.json(data)
    } else {
      const data = {
        priceEur: CBAM.CARBON_PRICE_THRESHOLDS.HIGH_EMISSIONS_PRICE,
        date: new Date().toISOString(),
        source: 'fallback'
      }
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('ETS price error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ETS price data' },
      { status: 500 }
    )
  }
}
