import { NextRequest, NextResponse } from 'next/server'
import { getGridCarbonIntensity } from '@/services/gridCarbon'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zone = searchParams.get('zone') || 'DE' // Default to Germany

  try {
    const data = await getGridCarbonIntensity(zone)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Grid carbon intensity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grid carbon intensity' },
      { status: 500 }
    )
  }
}
