import { z } from 'zod'
import { VALIDATION, EMISSIONS } from './constants'

// Production-grade validation schemas
export const EmissionRecordSchema = z.object({
  facilityId: z.string().uuid().optional(),
  scope: z.enum(['1', '2', '3']).transform(val => parseInt(val)),
  category: z.enum([
    EMISSIONS.CATEGORIES.PURCHASED_GOODS,
    EMISSIONS.CATEGORIES.IMPORTED_GOODS,
    EMISSIONS.CATEGORIES.TRANSPORT
  ]),
  value: z.number().positive(),
  unit: z.string().default(EMISSIONS.UNITS.TCO2E),
  period: z.string().regex(/^\d{4}-Q[1-4]$/, 'Invalid period format. Use YYYY-Q1-4'),
  sourceUrl: z.string().url().optional(),
  isContributedToMarketplace: z.boolean().default(false)
})

export const SupplierSchema = z.object({
  name: z.string().min(1).max(255),
  country: z.string().length(VALIDATION.ISO_COUNTRY_LENGTH),
  hsCode: z.string().length(VALIDATION.HS_CODE_LENGTH).optional(),
  carbonIntensity: z.number().positive().optional(),
  intensitySource: z.string().optional(),
  tier: z.number().int().min(1).max(5).default(1)
})

export const CbamDeclarationSchema = z.object({
  declarationYear: z.number().int().min(2020).max(new Date().getFullYear() + 1),
  quarter: z.number().int().min(1).max(4)
})

export const OrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  subscriptionTier: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  stripeCustomerId: z.string().optional()
})

// Input sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function validateHsCode(hsCode: string): boolean {
  return /^[0-9]{6}$/.test(hsCode)
}

export function validateIsoCountry(country: string): boolean {
  return /^[A-Z]{2}$/.test(country)
}

export function validatePeriod(period: string): boolean {
  return /^\d{4}-Q[1-4]$/.test(period)
}

// Rate limiting validation
export function validateRateLimit(current: number, limit: number): boolean {
  return current < limit
}

// Data integrity checks
export function validateEmissionsData(data: any[]): boolean {
  return data.every(item => {
    try {
      EmissionRecordSchema.parse(item)
      return true
    } catch {
      return false
    }
  })
}

export function validateSupplierData(data: any[]): boolean {
  return data.every(item => {
    try {
      SupplierSchema.parse(item)
      return true
    } catch {
      return false
    }
  })
}
