import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/errorHandling'

// Clerk webhook event types
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      Logger.error('CLERK_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Get Svix headers for verification
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      Logger.error('Missing Svix headers for Clerk webhook')
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 })
    }

    // Get the raw body
    const body = await request.text()

    // Create Svix instance with webhook secret
    const wh = new Webhook(webhookSecret)

    // Verify the webhook payload
    let event: any
    try {
      event = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      Logger.error('Error verifying Clerk webhook', { error: err })
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    // Handle different webhook events
    const eventType = event.type
    const eventData = event.data

    Logger.info('Clerk webhook received', { type: eventType, userId: eventData.id })

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(eventData)
        break

      case 'user.updated':
        await handleUserUpdated(eventData)
        break

      case 'user.deleted':
        await handleUserDeleted(eventData)
        break

      case 'organization.created':
        await handleOrganizationCreated(eventData)
        break

      case 'organization.updated':
        await handleOrganizationUpdated(eventData)
        break

      case 'organization.deleted':
        await handleOrganizationDeleted(eventData)
        break

      case 'organizationMembership.created':
        await handleOrganizationMembershipCreated(eventData)
        break

      case 'organizationMembership.updated':
        await handleOrganizationMembershipUpdated(eventData)
        break

      case 'organizationMembership.deleted':
        await handleOrganizationMembershipDeleted(eventData)
        break

      default:
        Logger.warn('Unhandled Clerk webhook event', { type: eventType })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    Logger.error('Error processing Clerk webhook', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleUserCreated(userData: any) {
  try {
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email: userData.email_addresses[0]?.email_address || '',
        role: 'PUBLIC', // Default role, will be updated based on organization
        orgId: null, // Will be set when user joins an organization
        aiQueryCount: 0,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date()
      }
    })

    Logger.info('User created successfully', { userId: user.id, clerkUserId: userData.id })

    // If user has pending organization invitation, handle it
    await handlePendingInvitation(userData.email_addresses[0]?.email_address, user.id)

  } catch (error) {
    Logger.error('Error creating user', { clerkUserId: userData.id, error })
    throw error
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userData.id }
    })

    if (!user) {
      Logger.warn('User not found for update', { clerkUserId: userData.id })
      return
    }

    await prisma.user.update({
      where: { clerkUserId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || user.email,
        updatedAt: new Date()
      }
    })

    Logger.info('User updated successfully', { userId: user.id, clerkUserId: userData.id })

  } catch (error) {
    Logger.error('Error updating user', { clerkUserId: userData.id, error })
    throw error
  }
}

async function handleUserDeleted(userData: any) {
  try {
    // Delete user from our database (cascade delete will handle related records)
    const deletedUser = await prisma.user.delete({
      where: { clerkUserId: userData.id }
    })

    Logger.info('User deleted successfully', { userId: deletedUser.id, clerkUserId: userData.id })

  } catch (error) {
    Logger.error('Error deleting user', { clerkUserId: userData.id, error })
    throw error
  }
}

async function handleOrganizationCreated(orgData: any) {
  try {
    // Create organization in our database
    const organization = await prisma.organisation.create({
      data: {
        clerkOrgId: orgData.id,
        name: orgData.name || '',
        logoUrl: orgData.image_url || '',
        subscriptionTier: 'FREE',
        stripeCustomerId: null,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date()
      }
    })

    Logger.info('Organization created successfully', { orgId: organization.id, clerkOrgId: orgData.id })

  } catch (error) {
    Logger.error('Error creating organization', { clerkOrgId: orgData.id, error })
    throw error
  }
}

async function handleOrganizationUpdated(orgData: any) {
  try {
    const organization = await prisma.organisation.findUnique({
      where: { clerkOrgId: orgData.id }
    })

    if (!organization) {
      Logger.warn('Organization not found for update', { clerkOrgId: orgData.id })
      return
    }

    await prisma.organisation.update({
      where: { clerkOrgId: orgData.id },
      data: {
        name: orgData.name || organization.name,
        logoUrl: orgData.image_url || organization.logoUrl,
        updatedAt: new Date()
      }
    })

    Logger.info('Organization updated successfully', { orgId: organization.id, clerkOrgId: orgData.id })

  } catch (error) {
    Logger.error('Error updating organization', { clerkOrgId: orgData.id, error })
    throw error
  }
}

async function handleOrganizationDeleted(orgData: any) {
  try {
    // Delete organization from our database (cascade delete will handle related records)
    const deletedOrg = await prisma.organisation.delete({
      where: { clerkOrgId: orgData.id }
    })

    Logger.info('Organization deleted successfully', { orgId: deletedOrg.id, clerkOrgId: orgData.id })

  } catch (error) {
    Logger.error('Error deleting organization', { clerkOrgId: orgData.id, error })
    throw error
  }
}

async function handleOrganizationMembershipCreated(membershipData: any) {
  try {
    // Update user's organization reference
    await prisma.user.update({
      where: { clerkUserId: membershipData.user.id },
      data: {
        orgId: membershipData.organization.id,
        updatedAt: new Date()
      }
    })

    Logger.info('Organization membership created', {
      userId: membershipData.user.id,
      orgId: membershipData.organization.id,
      role: membershipData.role
    })

  } catch (error) {
    Logger.error('Error creating organization membership', { 
      userId: membershipData.user.id, 
      orgId: membershipData.organization.id, 
      error 
    })
    throw error
  }
}

async function handleOrganizationMembershipUpdated(membershipData: any) {
  try {
    // Handle role changes if needed
    Logger.info('Organization membership updated', {
      userId: membershipData.user.id,
      orgId: membershipData.organization.id,
      role: membershipData.role
    })

  } catch (error) {
    Logger.error('Error updating organization membership', { 
      userId: membershipData.user.id, 
      orgId: membershipData.organization.id, 
      error 
    })
    throw error
  }
}

async function handleOrganizationMembershipDeleted(membershipData: any) {
  try {
    // Remove user's organization reference
    await prisma.user.update({
      where: { clerkUserId: membershipData.user.id },
      data: {
        orgId: null,
        updatedAt: new Date()
      }
    })

    Logger.info('Organization membership deleted', {
      userId: membershipData.user.id,
      orgId: membershipData.organization.id
    })

  } catch (error) {
    Logger.error('Error deleting organization membership', { 
      userId: membershipData.user.id, 
      orgId: membershipData.organization.id, 
      error 
    })
    throw error
  }
}

async function handlePendingInvitation(email: string, userId: string) {
  try {
    // TODO: Implement invitation system when needed
    // For now, users will be added to organizations through direct membership
    Logger.info('User created - invitation handling not yet implemented', { email, userId })
  } catch (error) {
    Logger.error('Error handling pending invitation', { email, userId, error })
  }
}
