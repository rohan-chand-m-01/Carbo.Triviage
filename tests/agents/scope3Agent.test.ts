import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateScope3Emissions } from '@/agents/scope3Agent'
import { prisma } from '@/lib/prisma'
import { neo4jSession } from '@/lib/neo4j'

// Mock dependencies
vi.mock('@/lib/prisma')
vi.mock('@/lib/neo4j')
vi.mock('@/services/comtrade')
vi.mock('@/services/worldBank')
vi.mock('@/services/gridCarbon')

const mockPrisma = vi.mocked(prisma)
const mockNeo4jSession = vi.mocked(neo4jSession)

describe('scope3Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate scope 3 emissions for an organization', async () => {
    // Mock supplier data
    mockPrisma.supplier.findMany.mockResolvedValue([
      {
        id: 'supplier1',
        name: 'Test Supplier',
        country: 'DE',
        hsCode: '870323',
        carbonIntensity: 0.5,
        intensitySource: 'user_provided',
        intensityUpdatedAt: new Date()
      }
    ])

    // Mock trade flow data
    const { getTradeFlow } = await import('@/services/comtrade')
    vi.mocked(getTradeFlow).mockResolvedValue([
      {
        hsCode: '870323',
        reporterCountry: 'Germany',
        partnerCountry: 'China',
        tradeValueUsd: 1000000,
        netWeightKg: 10000,
        year: 2023
      }
    ])

    // Mock Neo4j session
    const mockSession = {
      run: vi.fn().mockResolvedValue({
        records: [{ get: vi.fn().mockReturnValue('node123') }]
      }),
      close: vi.fn()
    }
    mockNeo4jSession.mockReturnValue(mockSession)

    // Mock emission record creation
    mockPrisma.emissionRecord.create.mockResolvedValue({
      id: 'emission1',
      orgId: 'org1',
      scope: 3,
      category: 'purchased_goods',
      value: 5000,
      unit: 'tCO2e',
      period: '2024-Q1'
    })

    const result = await calculateScope3Emissions('org1', '2024-Q1')

    expect(result.totalScope3Tco2e).toBe(5000)
    expect(result.bySupplier).toHaveLength(1)
    expect(result.bySupplier[0].supplierName).toBe('Test Supplier')
    expect(result.warnings).toHaveLength(0)
  })

  it('should handle missing supplier data gracefully', async () => {
    mockPrisma.supplier.findMany.mockResolvedValue([])

    const result = await calculateScope3Emissions('org1', '2024-Q1')

    expect(result.totalScope3Tco2e).toBe(0)
    expect(result.bySupplier).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('should use fallback emission factors when supplier data is incomplete', async () => {
    mockPrisma.supplier.findMany.mockResolvedValue([
      {
        id: 'supplier1',
        name: 'Test Supplier',
        country: 'DE',
        hsCode: null,
        carbonIntensity: null,
        intensitySource: null,
        intensityUpdatedAt: null
      }
    ])

    const result = await calculateScope3Emissions('org1', '2024-Q1')

    expect(result.warnings).toContain(
      expect.stringContaining('Using industry average for Test Supplier')
    )
  })
})
