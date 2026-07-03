# Description Enrichment Pipeline — Implementation Checklist

## What Was Built

### 1. Database Migration
**File:** `supabase/migrations/20260703_description_enrichment.sql`

Creates `description_enrichment_queue` table:
- `id` (uuid, PK)
- `fragrance_id` (uuid, UNIQUE FK to fragrances)
- `generated_description` (text) — AI-generated 2-3 sentence nota-tone description
- `status` (text) — one of: `pending_review`, `approved`, `rejected`
- `reviewed_by` (text) — admin identifier (optional)
- `reviewed_at` (timestamp) — when reviewed
- `created_at`, `updated_at` (timestamps)

Indexes: status, fragrance_id, created_at, status+created_at composite

Apply via: `supabase db push`

---

### 2. Supabase Edge Function
**File:** `supabase/functions/enrich-descriptions-batch/index.ts`

**Endpoint:** `POST https://<project-ref>.supabase.co/functions/v1/enrich-descriptions-batch`

**Authentication:** Bearer token (via Authorization header)

**Logic:**
1. Query fragrances where `plain_description IS NULL`, ordered by `interaction_count DESC`
2. Limit: 50 per run (configurable via `limit` param in request body)
3. For each fragrance:
   - Fetch notes from `fragrance_notes` table
   - Call Claude Haiku with nota-tone prompt
   - Insert into `description_enrichment_queue` with status `pending_review`
4. Skip fragrances already in queue
5. Return summary: created, skipped, errored counts

**Cost:** ~$0.035 per run (50 frags × 450 tokens average)

**Trigger options:**
- Manual HTTP POST (easiest for MVP)
- pg_cron scheduled job (daily at 2 AM UTC)
- Vercel cron via API route wrapper

---

### 3. Admin Review UI
**File:** `app/admin/enrichment/page.tsx`

**Route:** `/admin/enrichment`

**Features:**
- **Stats bar** (top): Pending count, Approved today, Rejected count
- **Fragrance cards** (main): 
  - Bottle image (100px × 140px)
  - Brand name + fragrance name
  - Generated description in grey box
  - Approve/Reject buttons
  - Created date
- **Pagination:** 10 records per page with Previous/Next buttons
- **Loading & error states**
- **Styling:** CSS variables only (--bg, --text, --accent, --surface, --line, etc.)

**Client-side auth:** Simple token check (optional, for prod add stricter auth)

---

### 4. API Routes

#### A. Approve/Reject
**File:** `app/api/admin/enrichment/approve/route.ts`
**Endpoint:** `POST /api/admin/enrichment/approve`

**Request body:**
```json
{
  "queue_id": "uuid",
  "action": "approve" | "reject"
}
```

**On approve:**
- Writes `generated_description` to `fragrances.plain_description`
- Updates queue record: `status = 'approved'`, `reviewed_at = now()`

**On reject:**
- Updates queue record: `status = 'rejected'`, `reviewed_at = now()`
- Does NOT write to fragrances table

**Auth:** Bearer token (ADMIN_ENRICHMENT_TOKEN env var)

---

#### B. List Pending
**File:** `app/api/admin/enrichment/list/route.ts`
**Endpoint:** `GET /api/admin/enrichment/list?page=1&per_page=10`

**Response:**
```json
{
  "data": [
    {
      "id": "queue-id",
      "fragrance_id": "frag-id",
      "fragrance_name": "Oud for Glory",
      "fragrance_brand": "Creed",
      "fragrance_image": "url",
      "generated_description": "...",
      "status": "pending_review",
      "created_at": "ISO-8601"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 10
}
```

Joins enrichment queue with fragrances table to fetch name, brand, image for UI display.

---

#### C. Stats
**File:** `app/api/admin/enrichment/stats/route.ts`
**Endpoint:** `GET /api/admin/enrichment/stats`

**Response:**
```json
{
  "pending": 42,
  "approved_today": 8,
  "rejected": 3
}
```

Counts by status. "approved_today" filters by `reviewed_at >= today 00:00:00`.

---

### 5. Local Test Script
**File:** `scripts/test-enrichment.mjs`

**Usage:**
```bash
node scripts/test-enrichment.mjs [--limit=N] [--dry-run]
```

**Flags:**
- `--limit=5` — process only 5 fragrances (default: 5)
- `--dry-run` — show what would be processed, don't insert

**Requires:**
- `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `ANTHROPIC_API_KEY`

**Output:** Summary of created, skipped, errored records

---

### 6. Documentation
**File:** `docs/ENRICHMENT_PIPELINE_GUIDE.md`

Covers:
- Database setup (migration)
- Environment configuration (secrets, tokens)
- Triggering methods (manual, cron, script)
- Admin UI usage
- Monitoring via Supabase SQL
- Cost estimation (~$1/month)
- Deployment checklist
- Rollback procedures

---

## Environment Variables Required

### Server-side (.env.local / Vercel):
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (already set)
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` ✅ (already set)
- `ADMIN_ENRICHMENT_TOKEN` (new — set to any secret)
- `ANTHROPIC_API_KEY` (new — Supabase Vault only, NOT in .env)

### Client-side (.env.local / Vercel):
- `NEXT_PUBLIC_ADMIN_TOKEN` (optional — for admin UI client-side auth)

### Supabase Edge Function Secrets:
- `ANTHROPIC_API_KEY` (via `supabase secrets set`)

---

## Deployment Steps

1. **Apply migration:**
   ```bash
   supabase db push
   ```

2. **Set Edge Function secret:**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
   ```

3. **Set admin token (local & Vercel):**
   ```bash
   # .env.local
   ADMIN_ENRICHMENT_TOKEN=<your-token>
   
   # Vercel
   npx vercel env add ADMIN_ENRICHMENT_TOKEN
   ```

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```

5. **Verify:**
   - Visit `/admin/enrichment` → should load with 0 pending (or cached from earlier runs)
   - Manually trigger via `/api/admin/enrichment/stats` to test connectivity

---

## Nota-Tone Description Format

Example (generated for "Oud for Glory" by Creed):

> "Opens with a bright burst of lemon and spice, announcing itself before settling into a heart of tobacco leaf and oud. The drydown clings softly as warm amber and sandalwood anchor the composition."

**Style guide:**
- Opening (top notes): 1 sentence
- Heart (middle notes): 1 sentence
- Drydown (base notes): 1 sentence
- Sensory, never technical ("bright," "clings," NOT "citral compound," "tenacity")
- No marketing speak ("luxury," "exclusive," "iconic")
- Length: 2–3 sentences, ~150–200 characters total

---

## Known Limitations

1. **No batch deletion:** If many descriptions are rejected, there's no bulk-reject button (single-record only)
2. **No regeneration:** Once rejected, a fragrance won't be re-queued automatically (manual re-trigger needed)
3. **No versioning:** Only one pending description per fragrance at a time (UNIQUE constraint on fragrance_id)
4. **Admin auth:** MVP uses simple token only; upgrade to session/RBAC if needed
5. **No audit trail:** Approved descriptions don't store original queue record history (consider archival table)

---

## Testing Checklist

- [ ] Migration applies cleanly: `supabase db push`
- [ ] Edge Function deploys: `supabase functions list`
- [ ] Admin page loads: `/admin/enrichment`
- [ ] Approve route works: POST to `/api/admin/enrichment/approve` with valid token
- [ ] List route works: GET `/api/admin/enrichment/list`
- [ ] Stats route works: GET `/api/admin/enrichment/stats`
- [ ] Fragrance description written on approval (check DB)
- [ ] Local test script works: `node scripts/test-enrichment.mjs --dry-run`

---

## Next Steps (Post-MVP)

1. **Bulk operations:** Add approve-all-on-page and reject-all buttons
2. **Quality scoring:** Rank descriptions by LLM confidence; flag low-scoring ones
3. **A/B testing:** Store multiple descriptions per fragrance, test with users
4. **Scheduling:** Set up pg_cron trigger for daily auto-runs
5. **Audit log:** Archive approved descriptions + reviewer metadata
6. **Regen workflow:** Mark rejected descriptions for re-processing with modified prompt
