import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { embeddingModel } from '@/lib/gemini'

export interface RAGIngestionResult {
  docsProcessed: number
  chunksEmbedded: number
  skippedDueToLimit: number
  errors: string[]
}

export async function ingestPolicyDocuments(): Promise<RAGIngestionResult> {
  let docsProcessed = 0
  let chunksEmbedded = 0
  let skippedDueToLimit = 0
  const errors: string[] = []

  try {
    // Check last run time
    const lastRun = await redis.get('rag_last_run') as string | null
    const lookbackHours = 48 // 2 days lookback
    const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)

    // Check daily embedding limits
    const today = new Date().toISOString().split('T')[0]
    const dailyCount = (await redis.get(`embedding_daily:${today}`) as string) || '0'
    const dailyLimit = 1400 // Leave buffer under 1500 free limit

    if (parseInt(dailyCount) >= dailyLimit) {
      return {
        docsProcessed: 0,
        chunksEmbedded: 0,
        skippedDueToLimit: 0,
        errors: ['Daily embedding limit reached']
      }
    }

    // Mock documents to ingest - in production would fetch from real sources
    const mockDocuments = [
      {
        sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0956',
        title: 'Regulation (EU) 2023/956 on CBAM',
        type: 'REGULATION',
        jurisdiction: 'EU',
        publishedAt: new Date().toISOString(),
        content: `
        The European Union has established a Carbon Border Adjustment Mechanism (CBAM) 
        to prevent carbon leakage and ensure fair competition. The mechanism applies to 
        imports of certain goods from non-EU countries. Importers must declare embedded 
        emissions and surrender corresponding CBAM certificates. The price is based on 
        the EU Emissions Trading System allowance price.
        
        Key sectors covered: iron and steel, aluminum, cement, fertilizers, electricity, 
        hydrogen, and organic chemicals. The transitional phase runs from 2023-2025, 
        with reporting obligations only. The definitive phase begins in 2026 with 
        financial obligations.
        
        Calculation methodology follows the EU ETS price minus any carbon price paid 
        in the country of origin. Reporting is quarterly with detailed data on 
        embedded emissions by product category.
        `.trim()
      },
      {
        sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0123',
        title: 'Corporate Sustainability Reporting Directive (CSRD)',
        type: 'DIRECTIVE',
        jurisdiction: 'EU',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        content: `
        The CSRD expands the scope of sustainability reporting requirements for companies 
        operating in the EU. Large companies must report according to European Sustainability 
        Reporting Standards (ESRS). Climate-related disclosures follow ESRS E1 requirements.
        
        Companies must disclose: governance, strategy, risk management, and metrics related 
        to climate change. This includes Scope 1, 2, and 3 emissions, reduction targets, 
        and alignment with Paris Agreement goals.
        
        Reporting requires third-party verification and must be included in the annual 
        management report. The directive applies to all EU-listed companies, large EU 
        companies, and non-EU companies with significant EU operations.
        `.trim()
      }
    ]

    for (const doc of mockDocuments) {
      try {
        // Check if already processed
        const existing = await prisma.policyDocument.findUnique({
          where: { sourceUrl: doc.sourceUrl }
        })

        if (existing) continue

        // Split content into chunks (800 tokens, 150 token overlap)
        const chunks = splitIntoChunks(doc.content, 800, 150)
        
        for (const chunk of chunks) {
          // Check daily limit again
          const currentCount = parseInt(await redis.get(`embedding_daily:${today}`) || '0')
          if (currentCount >= dailyLimit) {
            skippedDueToLimit += chunks.length - chunksEmbedded
            break
          }

          try {
            // Generate embedding
            const embeddingResult = await embeddingModel.embedContent(chunk)
            const embedding = embeddingResult.embedding

            // Store chunk as separate document for RAG
            await prisma.policyDocument.create({
              data: {
                sourceUrl: `${doc.sourceUrl}#chunk-${chunksEmbedded}`,
                title: `${doc.title} - Chunk ${chunksEmbedded + 1}`,
                type: doc.type,
                jurisdiction: doc.jurisdiction,
                publishedAt: new Date(doc.publishedAt),
                content: chunk,
              }
            })

            // Update daily counter
            await redis.incr(`embedding_daily:${today}`)
            await redis.expire(`embedding_daily:${today}`, 24 * 60 * 60) // 24 hours

            chunksEmbedded++

          } catch (error) {
            errors.push(`Failed to embed chunk for ${doc.title}: ${error}`)
          }
        }

        docsProcessed++

      } catch (error) {
        errors.push(`Failed to process ${doc.title}: ${error}`)
      }
    }

    // Update last run time
    await redis.set('rag_last_run', Date.now().toString())

    return {
      docsProcessed,
      chunksEmbedded,
      skippedDueToLimit,
      errors
    }

  } catch (error) {
    throw new Error(`RAG ingestion failed: ${error}`)
  }
}

function splitIntoChunks(text: string, maxTokens: number, overlapTokens: number): string[] {
  // Simple word-based chunking (in production would use proper tokenizer)
  const words = text.split(/\s+/)
  const chunks: string[] = []
  
  let start = 0
  while (start < words.length) {
    const end = Math.min(start + maxTokens, words.length)
    const chunk = words.slice(start, end).join(' ')
    chunks.push(chunk)
    start = end - overlapTokens
  }
  
  return chunks
}
