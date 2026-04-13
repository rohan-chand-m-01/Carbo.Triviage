import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { EmissionRecordSchema } from '@/lib/validation'
import { withErrorHandling, ValidationError, AuthenticationError, Logger } from '@/lib/errorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authenticate user
  const { userId } = auth()
  if (!userId) {
    throw new AuthenticationError()
  }

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!user || !user.orgId) {
    throw new ValidationError('Organization not found')
  }

  // Parse and validate request body
  const body = await request.json()
  const validatedData = EmissionRecordSchema.parse(body)

  Logger.info('Creating emission record', {
    orgId: user.orgId,
    scope: validatedData.scope,
    category: validatedData.category,
    value: validatedData.value
  })

  // Create emission record
  const emissionRecord = await prisma.emissionRecord.create({
    data: {
      orgId: user.orgId,
      ...validatedData
    }
  })

  return NextResponse.json(emissionRecord, { status: 201 })
})

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
    const scope = searchParams.get('scope') ? parseInt(searchParams.get('scope')!) : undefined
    const period = searchParams.get('period')
    const category = searchParams.get('category')

    // Build where clause
    const where: any = { orgId: user.orgId }
    if (scope) where.scope = scope
    if (period) where.period = period
    if (category) where.category = category

    // Fetch emission records
    const emissions = await prisma.emissionRecord.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(emissions)

  } catch (error) {
    console.error('Emission fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emission records' },
      { status: 500 }
    )
  }
}
