import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'carbonlens',
  credential: {
    key: process.env.INNGEST_EVENT_KEY!,
    url: process.env.INNGEST_SIGNING_KEY ? undefined : undefined,
  },
})

// Export all functions for easy importing
export const functions = {
  ingestPolicyDocs: inngest.createFunction(
    { id: 'ingest-policy-docs' },
    { cron: '0 2 * * *' }, // Daily at 2 AM UTC
    async () => {
      console.log('Ingesting policy documents...')
    }
  ),
  
  syncComtradeData: inngest.createFunction(
    { id: 'sync-comtrade-data' },
    { cron: '0 3 * * 0' }, // Weekly on Sunday at 3 AM UTC
    async () => {
      console.log('Syncing Comtrade data...')
    }
  ),
  
  aggregateMarketplaceData: inngest.createFunction(
    { id: 'aggregate-marketplace-data' },
    { cron: '0 3 * * 0' }, // Weekly on Sunday at 3:30 AM UTC
    async () => {
      console.log('Aggregating marketplace data...')
    }
  ),
  
  generateCsrdDraft: inngest.createFunction(
    { id: 'generate-csrd-draft' },
    { event: 'carbonlens/csrd.draft.requested' },
    async ({ event }) => {
      console.log('Generating CSRD draft for org:', event.data.orgId)
    }
  ),
}
