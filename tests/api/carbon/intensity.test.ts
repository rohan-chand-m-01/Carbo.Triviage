import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/carbon/intensity/route'
import { NextRequest } from 'next/server'

// Mock the service
const mockGetGridCarbonIntensity = vi.fn()
vi.mock('@/services/gridCarbon', () => ({
  getGridCarbonIntensity: mockGetGridCarbonIntensity
}))

describe('/api/carbon/intensity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return grid carbon intensity data', async () => {
    const mockData = {
      zone: 'DE',
      carbonIntensity: 285,
      datetime: '2024-01-01T12:00:00Z',
      source: 'electricity_maps' as const
    }

    mockGetGridCarbonIntensity.mockResolvedValue(mockData)

    const request = new NextRequest('http://localhost:3000/api/carbon/intensity?zone=DE')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockData)
    expect(mockGetGridCarbonIntensity).toHaveBeenCalledWith('DE')
  })

  it('should use default zone when none provided', async () => {
    const mockData = {
      zone: 'DE',
      carbonIntensity: 285,
      datetime: '2024-01-01T12:00:00Z',
      source: 'electricity_maps' as const
    }

    mockGetGridCarbonIntensity.mockResolvedValue(mockData)

    const request = new NextRequest('http://localhost:3000/api/carbon/intensity')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.zone).toBe('DE')
  })

  it('should handle service errors gracefully', async () => {
    mockGetGridCarbonIntensity.mockRejectedValue(new Error('Service unavailable'))

    const request = new NextRequest('http://localhost:3000/api/carbon/intensity?zone=DE')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch grid carbon intensity')
  })
})
