import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { requireSubscription } from '@/lib/utils'
import { generateCbamDeclaration } from '@/agents/cbamAgent'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { org: true }
    })

    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Require PRO subscription
    await requireSubscription(user.orgId, ['PRO', 'ENTERPRISE'])

    // Parse request body
    const body = await request.json()
    const { declarationYear, quarter } = body

    if (!declarationYear || !quarter) {
      return NextResponse.json(
        { error: 'declarationYear and quarter are required' },
        { status: 400 }
      )
    }

    // Generate CBAM declaration
    const result = await generateCbamDeclaration(user.orgId, declarationYear, quarter)

    return NextResponse.json(result)

  } catch (error) {
    console.error('CBAM calculation error:', error)
    
    if (error instanceof Error && error.message.includes('Subscription tier')) {
      return NextResponse.json(
        { error: error.message, upgradeRequired: true },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate CBAM declaration' },
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

    // Fetch existing CBAM declarations
    const declarations = await prisma.cbamDeclaration.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json(declarations)

  } catch (error) {
    console.error('CBAM fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CBAM declarations' },
      { status: 500 }
    )
  }
}
