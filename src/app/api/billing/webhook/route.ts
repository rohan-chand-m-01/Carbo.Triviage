import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle idempotency
  const processedKey = `stripe_webhook:${event.id}`
  const alreadyProcessed = await redis.get(processedKey)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { orgId, userId, priceId } = session.metadata || {}

        if (!orgId || !priceId) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Handle subscription creation
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Determine tier based on price
          let tier: 'PRO' | 'ENTERPRISE'
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            tier = 'PRO'
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            tier = 'ENTERPRISE'
          } else if (priceId === process.env.STRIPE_AUDITOR_PRICE_ID) {
            tier = 'PRO' // Auditor tier uses PRO subscription
          } else {
            tier = 'PRO' // Default
          }

          // Update organization subscription
          await prisma.organisation.update({
            where: { id: orgId },
            data: { 
              subscriptionTier: tier,
              stripeCustomerId: session.customer as string
            }
          })

          console.log(`Updated org ${orgId} to ${tier} tier`)
        }

        // Handle one-time payment (CBAM declaration)
        else if (session.mode === 'payment') {
          if (priceId === process.env.STRIPE_CBAM_DECLARATION_PRICE_ID) {
            // Update CBAM declaration with payment ID
            await prisma.cbamDeclaration.updateMany({
              where: { 
                orgId,
                status: 'DRAFT',
                stripePaymentId: null
              },
              data: { 
                stripePaymentId: session.payment_intent as string,
                status: 'SUBMITTED',
                filedAt: new Date()
              }
            })

            console.log(`CBAM declaration payment completed for org ${orgId}`)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        // Find organization by Stripe customer ID
        const org = await prisma.organisation.findUnique({
          where: { stripeCustomerId: customerId as string }
        })

        if (org) {
          // Downgrade to FREE tier
          await prisma.organisation.update({
            where: { id: org.id },
            data: { subscriptionTier: 'FREE' }
          })

          console.log(`Downgraded org ${org.id} to FREE tier`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer

        // Find organization and flag for grace period
        const org = await prisma.organisation.findUnique({
          where: { stripeCustomerId: customerId as string }
        })

        if (org) {
          // Set grace period flag in Redis
          const graceKey = `grace_period:${org.id}`
          await redis.setex(graceKey, 7 * 24 * 60 * 60, '1') // 7 days

          console.log(`Payment failed for org ${org.id}, grace period activated`)
        }

        break
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    // Mark webhook as processed
    await redis.setex(processedKey, 24 * 60 * 60, '1') // 24 hours

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
