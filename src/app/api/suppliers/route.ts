import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  hsCode: z.string().length(6).optional(),
  carbonIntensity: z.number().positive().optional(),
  intensitySource: z.string().optional(),
  tier: z.number().int().min(1).max(5).default(1)
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        orgId: user.orgId,
        ...validatedData,
        intensityUpdatedAt: validatedData.carbonIntensity ? new Date() : null
      }
    })

    return NextResponse.json(supplier, { status: 201 })

  } catch (error) {
    console.error('Supplier creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const tier = searchParams.get('tier') ? parseInt(searchParams.get('tier')!) : undefined

    // Build where clause
    const where: any = { orgId: user.orgId }
    if (country) where.country = country
    if (tier) where.tier = tier

    // Fetch suppliers
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(suppliers)

  } catch (error) {
    console.error('Supplier fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}
