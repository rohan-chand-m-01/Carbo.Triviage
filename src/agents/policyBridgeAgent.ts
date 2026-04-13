import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { embeddingModel } from '@/lib/gemini'
import { generateWithTimeout } from '@/lib/gemini'
import { API, AI } from '@/lib/constants'

export interface PolicyAlert {
  id: string
  title: string
  jurisdiction: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  summary: string
  sourceUrl: string
  publishedAt: string
  createdAt: string
}

export interface PolicyBridgeResult {
  alerts: PolicyAlert[]
  newDocumentsIngested: number
  lastCheckTime: string
}

export async function checkPolicyUpdates(
  orgId: string,
  jurisdictions: string[] = ['EU', 'UN', 'US']
): Promise<PolicyBridgeResult> {
  const alerts: PolicyAlert[] = []
  const newDocumentsIngested = 0
  const lastCheckTime = new Date().toISOString()

  try {
    // Check if we've recently checked for this org
    const lastCheckKey = `policy_last_check:${orgId}`
    const lastCheck = await redis.get(lastCheckKey)
    
    if (lastCheck) {
      const hoursSinceCheck = (Date.now() - parseInt(lastCheck as string)) / (1000 * 60 * 60)
      if (hoursSinceCheck < 12) {
        // Return existing alerts if checked recently
        const existingAlerts = await redis.lrange(`policy_alerts:${orgId}`, 0, -1)
        return {
          alerts: existingAlerts.map(alert => JSON.parse(alert as string)),
          newDocumentsIngested: 0,
          lastCheckTime: new Date(parseInt(lastCheck as string)).toISOString()
        }
      }
    }

    // Mock policy documents for now - in production would fetch from EUR-Lex, UNFCCC
    const mockDocuments = [
      {
        title: 'EU CBAM Regulation Update - Phase 2 Implementation',
        type: 'REGULATION',
        jurisdiction: 'EU',
        sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0956',
        publishedAt: new Date().toISOString(),
        content: 'The EU Carbon Border Adjustment Mechanism enters Phase 2 with expanded scope...'
      },
      {
        title: 'CSRD ESRS Standards Amendment',
        type: 'DIRECTIVE', 
        jurisdiction: 'EU',
        sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0123',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        content: 'European Sustainability Reporting Standards updated with new climate disclosure requirements...'
      }
    ]

    // Get org's emission profile for context
    const orgEmissions = await prisma.emissionRecord.findMany({
      where: { orgId },
      select: { scope: true, category: true, value: true, period: true },
      orderBy: { period: 'desc' },
      take: 10
    })

    const orgProfile = {
      totalEmissions: orgEmissions.reduce((sum, e) => sum + e.value, 0),
      scopeBreakdown: orgEmissions.reduce((acc, e) => {
        acc[e.scope] = (acc[e.scope] || 0) + e.value
        return acc
      }, {} as Record<number, number>),
      mainCategories: Array.from(new Set(orgEmissions.map(e => e.category)))
    }

    // Process each document
    for (const doc of mockDocuments) {
      // Check if already processed
      const seenKey = `policy_doc_seen:${doc.sourceUrl}`
      const alreadySeen = await redis.get(seenKey)
      
      if (alreadySeen) continue

      // Generate embedding for the document
      try {
        const embeddingResult = await embeddingModel.embedContent(doc.content)
        const embedding = embeddingResult.embedding

        // Store in database (without embedding for now - requires vector extension)
        await prisma.policyDocument.create({
          data: {
            sourceUrl: doc.sourceUrl,
            title: doc.title,
            type: doc.type,
            jurisdiction: doc.jurisdiction,
            publishedAt: new Date(doc.publishedAt),
            content: doc.content,
          }
        })

        // Generate impact alert using Gemini
        const prompt = `
        Analyze this regulation and explain in 2 sentences how it affects a company with these emissions:
        
        Company Profile:
        - Total emissions: ${orgProfile.totalEmissions.toFixed(2)} tCO2e
        - Scope breakdown: ${JSON.stringify(orgProfile.scopeBreakdown)}
        - Main categories: ${orgProfile.mainCategories.join(', ')}
        
        Regulation: ${doc.title}
        Content: ${doc.content}
        
        Focus on compliance requirements and potential costs.
        `

        const result = await generateWithTimeout(prompt) as any
        const summary = result.response?.text() || 'Analysis unavailable'

        // Determine severity
        let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
        if (doc.title.toLowerCase().includes('cbam') || doc.title.toLowerCase().includes('csrd')) {
          severity = 'HIGH'
        } else if (doc.title.toLowerCase().includes('guideline')) {
          severity = 'LOW'
        }

        const alert: PolicyAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: doc.title,
          jurisdiction: doc.jurisdiction,
          severity,
          summary,
          sourceUrl: doc.sourceUrl,
          publishedAt: doc.publishedAt,
          createdAt: new Date().toISOString()
        }

        alerts.push(alert)

        // Store in Redis with 7-day TTL
        await redis.lpush(`policy_alerts:${orgId}`, JSON.stringify(alert))
        await redis.ltrim(`policy_alerts:${orgId}`, 0, 49) // Keep only 50 most recent
        await redis.expire(`policy_alerts:${orgId}`, API.CACHE_TTL.LONG) // 7 days

        // Mark as seen
        await redis.setex(seenKey, API.CACHE_TTL.LONG * API.SEEN_ALERT_DAYS, '1') // 30 days

      } catch (error) {
        console.error(`Failed to process document ${doc.title}:`, error)
      }
    }

    // Update last check time
    await redis.set(lastCheckKey, Date.now().toString())

    return {
      alerts,
      newDocumentsIngested: mockDocuments.length,
      lastCheckTime
    }

  } catch (error) {
    throw new Error(`Policy bridge agent failed: ${error}`)
  }
}
