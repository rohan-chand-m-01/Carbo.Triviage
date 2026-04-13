import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { requireSubscription } from '@/lib/utils'
import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  portalContext: z.object({
    portal: z.string(),
    orgId: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { messages, portalContext } = chatSchema.parse(body)

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { org: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limiting by organization
    if (user.orgId) {
      const month = new Date().toISOString().slice(0, 7) // YYYY-MM
      const rateLimitKey = `ai_queries:${user.orgId}:${month}`
      const currentCount = parseInt((await redis.get(rateLimitKey) as string) || '0')
      
      // Check subscription limits
      const tier = user.org?.subscriptionTier || 'FREE'
      const limits = { FREE: 50, PRO: 500, ENTERPRISE: Infinity }
      
      if (currentCount >= limits[tier as keyof typeof limits]) {
        return NextResponse.json(
          { error: `AI query limit exceeded for ${tier} tier` },
          { status: 429 }
        )
      }

      // Increment counter
      await redis.incr(rateLimitKey)
      await redis.expire(rateLimitKey, 30 * 24 * 60 * 60) // 30 days
    }

    // Build system prompt based on portal context
    let systemPrompt = `You are CarbonLens AI, a carbon accounting and compliance expert. 
    Provide accurate, helpful information about carbon emissions, regulations, and sustainability.
    If you are uncertain about specific numbers or regulations, say so clearly.
    Do not invent emission factors or regulatory text.
    Focus on practical guidance for carbon management and compliance.`

    if (portalContext?.orgId && user.orgId === portalContext.orgId) {
      // Add organization-specific context
      const orgEmissions = await prisma.emissionRecord.findMany({
        where: { orgId: portalContext.orgId },
        select: { scope: true, category: true, value: true, period: true },
        orderBy: { period: 'desc' },
        take: 10
      })

      const totalEmissions = orgEmissions.reduce((sum, e) => sum + e.value, 0)
      const scopeBreakdown = orgEmissions.reduce((acc, e) => {
        acc[e.scope] = (acc[e.scope] || 0) + e.value
        return acc
      }, {} as Record<number, number>)

      systemPrompt += `\n\nOrganization Context:
      - Total recent emissions: ${totalEmissions.toFixed(2)} tCO2e
      - Scope breakdown: ${JSON.stringify(scopeBreakdown)}
      - Current portal: ${portalContext.portal}
      
      Provide advice relevant to this context.`
    }

    // Add portal-specific instructions
    if (portalContext?.portal) {
      const portalInstructions = {
        corporate: 'Focus on CSRD reporting, SBTi targets, and internal carbon management.',
        'supply-chain': 'Focus on supplier emissions, CBAM liability, and supply chain decarbonization.',
        policy: 'Focus on regulatory compliance, policy updates, and risk management.',
        analyst: 'Focus on benchmarking, market analysis, and ESG investment insights.',
        auditor: 'Focus on audit trails, verification standards, and evidence requirements.',
        public: 'Provide general carbon information without sensitive business data.'
      }

      systemPrompt += `\n${portalInstructions[portalContext.portal as keyof typeof portalInstructions] || ''}`
    }

    // Call Gemini AI
    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('AI chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
