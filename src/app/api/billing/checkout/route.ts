import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  priceId: z.string(),
  orgId: z.string()
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
    const { priceId, orgId } = checkoutSchema.parse(body)

    // Validate price ID against allowed prices
    const allowedPrices = [
      process.env.STRIPE_PRO_PRICE_ID,
      process.env.STRIPE_ENTERPRISE_PRICE_ID,
      process.env.STRIPE_AUDITOR_PRICE_ID,
      process.env.STRIPE_CBAM_DECLARATION_PRICE_ID
    ]

    if (!allowedPrices.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { org: true }
    })

    if (!user || !user.orgId || user.orgId !== orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = user.org?.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { orgId: user.orgId }
      })
      customerId = customer.id

      // Update organization with customer ID
      await prisma.organisation.update({
        where: { id: user.orgId },
        data: { stripeCustomerId: customerId }
      })
    }

    // Determine checkout mode based on price type
    const isCbamDeclaration = priceId === process.env.STRIPE_CBAM_DECLARATION_PRICE_ID
    const mode = isCbamDeclaration ? 'payment' : 'subscription'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`,
      metadata: {
        orgId: user.orgId,
        userId,
        priceId
      }
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
