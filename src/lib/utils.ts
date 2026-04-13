import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { prisma } from './prisma'
import { redis } from './redis'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCO2(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' tCO2e'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function requireSubscription(
  orgId: string,
  requiredTiers: string[]
) {
  const cacheKey = `org_tier:${orgId}`
  let tier = await redis.get(cacheKey)

  if (!tier) {
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { subscriptionTier: true }
    })
    tier = org?.subscriptionTier || 'FREE'
    await redis.setex(cacheKey, 300, tier) // 5 minute cache
  }

  if (!requiredTiers.includes(tier as string)) {
    throw new Error(`Subscription tier ${tier} not supported. Required: ${requiredTiers.join(', ')}`)
  }

  return tier
}
