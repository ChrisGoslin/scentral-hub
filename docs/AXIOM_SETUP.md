# Axiom Log Drain Setup (Vercel)

Axiom provides structured log aggregation for Vercel deployments — free for up to 10GB/month.

## Steps
1. Create a free account at https://axiom.co
2. Create a new dataset called `scentral-logs` (or `foresight-logs`)
3. Go to Settings → API Tokens → New API Token → copy it
4. In Vercel project: Settings → Log Drains → Add Drain
   - URL: https://api.axiom.co/v1/datasets/<your-dataset>/ingest
   - Add header: Authorization: Bearer <your-api-token>
5. Deploy once to activate

## What you'll see
- All server-side Next.js logs
- API route errors and response times
- Supabase query errors (if logged via console.error)
