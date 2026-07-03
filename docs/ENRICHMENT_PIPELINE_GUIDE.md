# Description Enrichment Pipeline — Setup & Deployment Guide

## Overview

The enrichment pipeline generates AI-powered nota-tone descriptions for fragrances with `null plain_description`. It consists of:

- **Supabase Edge Function** (`enrich-descriptions-batch`): Calls Claude Haiku to generate descriptions
- **Queue Table** (`description_enrichment_queue`): Stores pending descriptions awaiting review
- **Admin Review UI** (`/admin/enrichment`): Interface to approve/reject generated descriptions
- **API Routes**: Backend for approval workflow and admin stats

## Database Setup

Apply the migration to create the enrichment queue table:

```bash
cd ~/Projects/scentral-hub
supabase migration list
supabase db push  # Applies all pending migrations, including 20260703_description_enrichment.sql
```

Verify the table exists:

```bash
supabase status
# Then in Supabase UI: Database > description_enrichment_queue should appear
```

## Environment Setup

### 1. Supabase Edge Function Secrets

The Edge Function needs `ANTHROPIC_API_KEY`. Add it via Supabase CLI or UI:

```bash
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

Verify:

```bash
supabase secrets list
```

### 2. Admin API Authentication

The approval route (`/api/admin/enrichment/approve`) uses token-based auth. Set an environment variable:

**.env.local** (local dev):
```
ADMIN_ENRICHMENT_TOKEN=your-secret-token-here
```

**Vercel** (production):
```bash
npx vercel env add ADMIN_ENRICHMENT_TOKEN
# Enter your token when prompted
```

The client-side code also needs to know this token for browser calls (optional security concern):

**.env.local** (dev):
```
NEXT_PUBLIC_ADMIN_TOKEN=your-secret-token-here
```

**Vercel**:
```bash
npx vercel env add NEXT_PUBLIC_ADMIN_TOKEN
# Use the same token or a different one
```

## Triggering Batch Generation

### Option A: Manual HTTP Trigger (via cURL or script)

```bash
# Get your Edge Function URL from Supabase:
# https://<project-ref>.supabase.co/functions/v1/enrich-descriptions-batch

curl -X POST https://<project-ref>.supabase.co/functions/v1/enrich-descriptions-batch \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "offset": 0}'
```

### Option B: pg_cron Scheduled Trigger (Daily at 2 AM UTC)

Create a Supabase SQL function + cron job:

```sql
-- supabase/migrations/20260704_enrichment_cron.sql
create extension if not exists pg_cron;

CREATE OR REPLACE FUNCTION trigger_enrichment_batch()
RETURNS void AS $$
BEGIN
  -- Invoke Edge Function via HTTP (requires Edge Function to be callable)
  SELECT
    net.http_post(
      url := 'https://<project-ref>.supabase.co/functions/v1/enrich-descriptions-batch',
      headers := '{"Authorization": "Bearer ' || current_setting('app.enrichment_token', true) || '", "Content-Type": "application/json"}',
      body := '{"limit": 50}'
    ) AS request_id;
END;
$$ LANGUAGE plpgsql;

-- Schedule for 2 AM UTC daily
SELECT cron.schedule('enrichment-batch-daily', '0 2 * * *', 'SELECT trigger_enrichment_batch()');
```

**Note:** This approach requires careful secret management. For MVP, manual triggering is safer.

### Option C: Local Testing Script

```bash
cd ~/Projects/scentral-hub
node scripts/test-enrichment.mjs
```

Script template (`scripts/test-enrichment.mjs`):

```javascript
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const anthropicApiKey = process.env.ANTHROPIC_API_KEY

if (!supabaseUrl || !supabaseKey || !anthropicApiKey) {
  console.error('❌ Missing required env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Invoke Edge Function locally
const token = process.env.ADMIN_ENRICHMENT_TOKEN || 'test-token'
const baseUrl = process.env.SUPABASE_URL
const projectRef = new URL(baseUrl).hostname.split('.')[0]

const res = await fetch(
  `https://${projectRef}.supabase.co/functions/v1/enrich-descriptions-batch`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ limit: 5 })
  }
)

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
```

## Admin Review UI

Access at: `https://your-app.com/admin/enrichment`

### Features

- **Pending count** (top bar): Shows how many descriptions await review
- **Approved today**: Count of approved descriptions in the last 24 hours
- **Rejected count**: Lifetime rejected descriptions
- **Pagination**: 10 records per page
- **Approve/Reject buttons**: Per-record actions
  - **Approve**: Writes `generated_description` to `fragrances.plain_description`
  - **Reject**: Marks queue record as rejected (no write to fragrances)

### Authentication

The admin page is unprotected in this MVP implementation. To add auth, add a simple check:

```typescript
// app/admin/enrichment/page.tsx (top of component)
const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
const urlParams = new URL(typeof window !== 'undefined' ? window.location.href : '').searchParams
const suppliedToken = urlParams.get('token')

if (adminToken && adminToken !== suppliedToken) {
  return <div>Unauthorized. Pass ?token=... in URL.</div>
}
```

## Monitoring & Logs

### Check queue status

```sql
-- In Supabase SQL editor
SELECT status, COUNT(*) FROM description_enrichment_queue GROUP BY status;
```

### View recent approvals

```sql
SELECT fragrance_id, status, reviewed_at
FROM description_enrichment_queue
WHERE status = 'approved'
ORDER BY reviewed_at DESC
LIMIT 10;
```

### Edge Function logs

```bash
supabase functions list
supabase functions logs enrich-descriptions-batch
```

## Cost Estimation

- **Claude Haiku**: ~$0.80 / 1M input tokens, ~$4.00 / 1M output tokens
  - ~300 tokens input per request
  - ~150 tokens output per request
  - ~50 fragrances per run × 450 tokens ≈ 22,500 tokens
  - Cost per run: ~$0.035
  - Daily (50 frags): ~$1.05 / month

## Deployment Checklist

- [ ] Migration applied: `supabase db push`
- [ ] Edge Function secrets set: `ANTHROPIC_API_KEY`
- [ ] Admin token set: `ADMIN_ENRICHMENT_TOKEN`
- [ ] Admin page tested: `/admin/enrichment`
- [ ] Approval route tested: `/api/admin/enrichment/approve`
- [ ] Trigger method chosen (manual HTTP, cron, or script)
- [ ] Deployed to Vercel: `npx vercel --prod`

## Rollback

If the enrichment queue needs to be cleared:

```sql
-- WARNING: This deletes all pending descriptions
DELETE FROM description_enrichment_queue WHERE status = 'pending_review';
```

To restore from rejected state:

```sql
UPDATE description_enrichment_queue
SET status = 'pending_review'
WHERE status = 'rejected';
```
