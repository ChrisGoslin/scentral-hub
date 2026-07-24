# PR #75 Follow-Up: Critical Fixes & Duplication Resolution

**Base:** main → **Branch:** `fix/pr75-critical-blockers`  
**Scope:** Consolidate code duplication (7% → <3%) and fix P1/Major CodeRabbit findings  
**Effort:** ~4–6 hours (3 focused phases)  
**Status:** Blocked on Codex credit refresh

---

## Phase 1: Code Duplication Consolidation (SonarQube Gate)

### Root Cause
Repeated patterns across insights, ProsCons, and pros-cons routes cause 7% duplication. Three consolidation opportunities:

### 1.1 ProsCons Fetch-State Consolidation (NOT full component merge — verified 2026-07-19)
**Files:** `app/(main)/collection/[id]/ProsCons.tsx` + `components/collection/ProsCons.tsx`

**Issue:** Both components duplicate the same loading/error/fetch-lifecycle boilerplate (`useState` ×4, try/catch/finally, the "reject if both empty" check). **They are NOT calling the same endpoint with the same payload** — do not unify them into one hook with one signature.
- `app/(main)/collection/[id]/ProsCons.tsx` posts `{fragranceId, brand, name, description}` to `/api/pros-cons` (Chemist), renders a two-column grid, copy "AI Verdict".
- `components/collection/ProsCons.tsx` posts `{fragranceId}` to `/api/proscons` (Sommelier), renders a single-column italic list, copy "The Verdict".

**Fix:**
- Create a generic `hooks/useVerdictFetch.ts` parameterized on `endpoint: string` and `body: object`, returning `{ loading, error, pros, cons, retry }`. It owns only the fetch-lifecycle boilerplate (state resets, try/catch/finally, "unavailable" mapping) — not the endpoint, payload shape, or rendering.
- Each `ProsCons.tsx` calls the hook with its own endpoint + body and keeps its own JSX/copy.
- Do not merge the two components, routes, or cache tables (see 1.3 — they are separate features: Chemist vs Sommelier).

**Validation:** Both files import the same hook but pass different `endpoint`/`body` args; JSX and copy remain distinct per file.

### 1.2 Insights Query Consolidation
**Files:** `app/(main)/insights/page.tsx` + `app/api/insights/route.ts` + `supabase/functions/compute-insights-nightly/index.ts`

**Issue:** Three near-identical traces queries with `.limit(100)`:
```ts
const { data: traces } = await supabase
  .from('traces')
  .select('id, user_id, body, sentiment')
  .eq('user_id', userId)
  .limit(100)  // ← shared cap, wrong
  .order('created_at', { ascending: false })
```

**Fix:**
- Extract shared query builder → `lib/insightsQueries.ts`:
  ```ts
  export async function fetchUserTraces(supabase, userId) {
    return supabase
      .from('traces')
      .select('id, user_id, body, sentiment')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      // NO limit — full history
  }
  
  export async function fetchUserCollections(supabase, userId) { ... }
  ```
- Import in all three files; remove inline duplicate queries
- **Remove `.limit(100)` (see Phase 2.3)**

**Validation:** All three files call the same query builder; only orchestration logic differs.

### 1.3 Pros-Cons Route Boilerplate Extraction (NOT route deduplication — verified 2026-07-19)
**Files:** `app/api/pros-cons/route.ts` + `app/api/proscons/route.ts`

**⚠️ CORRECTED:** These are two distinct product features, not duplicate routes — do not merge, alias, or delete either one. CLAUDE.md §7 names them "Chemist" (`pros-cons` → `chemist_cache`, no TTL, caller supplies fragrance fields) and "Sommelier" (`proscons` → `sommelier_cache`, explicit 30-day TTL re-fetch, route looks up fragrance fields itself from `fragrances`). Different cache tables, different data sourcing, different prompts. Collapsing them into one canonical route would silently delete a live feature and its cache table.

**Issue:** What genuinely duplicates is the boilerplate around each: rate-limiter setup, `Anthropic` client init, `claude-haiku-4-5-20251001` call shape, and the try/catch → `{success:false, unavailable:true}` fallback.

**Fix:**
- Extract only the shared boilerplate → `lib/haikuVerdict.ts`, e.g. `callHaikuForVerdict(prompt: string): Promise<{pros: string[], cons: string[]} | null>` wrapping the Anthropic call + `parseVerdict`.
- Each route keeps its own rate limiter name, cache table, cache-key/TTL logic, and prompt construction; each just calls the shared helper for the LLM round-trip.

**Validation:** Both routes still write to their own cache table with their own TTL semantics; only the Anthropic call/parse plumbing is shared.

---

## Phase 2: Critical P1/Major CodeRabbit Findings

### 2.1 ProsCons Error State (P1 Correctness) — 2 files
**Lines:** `app/(main)/collection/[id]/ProsCons.tsx:29–37` + `components/collection/ProsCons.tsx:26–34`

**Finding:** Fetch error state persists across requests; UI stays stuck on unavailable after one failure.

**Fix:** (Apply to hook from 1.1)
```ts
const fetchPros = async () => {
  setError(null);  // ← Clear on start
  setLoading(true);
  try {
    const result = await /* fetch */;
    setError(null);  // ← Clear on success
    setPros(result);
  } catch (err) {
    setError(err);  // Only set on actual failure
  } finally {
    setLoading(false);
  }
};
```

### 2.2 Insights Empty State (P1 Correctness) — `app/(main)/insights/InsightsClient.tsx:71`
**Finding:** `computeInsights` returns non-null even when all collections are empty. Renders blank page instead of onboarding.

**Fix:**
```ts
// Current (wrong):
{(state === 'no-data' || state === 'unavailable') && (
  <EmptyState variant={state === 'unavailable' ? 'unavailable' : 'empty'} />
)}

// Fixed:
{(state === 'no-data' || (state === 'hydrated' && !notEmpty) || state === 'unavailable') && (
  <EmptyState variant={state === 'unavailable' ? 'unavailable' : 'empty'} />
)}

// Also update notEmpty calculation to include trajectory data:
const notEmpty = 
  (collections && collections.length > 0) ||
  (trajectory && trajectory.length > 0);  // ← Add this
```

### 2.3 Remove 100-Trace Limit (P1 Correctness) — 3 files
**Lines:** `app/(main)/insights/page.tsx:130` + `app/api/insights/route.ts:115` + `supabase/functions/compute-insights-nightly/index.ts:87`

**Finding:** `.limit(100)` caps trace history; insight calculations (your_impact, best_traces, nightly cache) become incomplete for users with >100 traces.

**Fix:** (Apply to `fetchUserTraces` from 1.2)
```ts
// Remove this line:
.limit(100)

// Full history queries are required for accurate insights
```

**Validation:** Insight calculations should process every trace, not just the latest 100.

### 2.4 Parse Verdict Validation (P1 Correctness) — `lib/parseVerdict.ts:13`
**Finding:** `{ pros: [], cons: [] }` passes validation; both routes can return/cache empty verdicts. UI hits `return null` instead of unavailable state.

**Fix:**
```ts
export function parseVerdict(text: string): VerdictResult | null {
  // ... existing JSON parse logic ...
  const parsed = JSON.parse(stripped);
  
  // Reject empty verdicts
  if (!Array.isArray(parsed.pros) || !Array.isArray(parsed.cons)) return null;
  if (parsed.pros.length === 0 && parsed.cons.length === 0) return null;  // ← Add
  
  return { success: true, pros: parsed.pros, cons: parsed.cons };
}
```

### 2.5 Wear-Note Date Validation (P1 Correctness) — `app/(main)/you/YouClient.tsx:205`
**Finding:** Non-date strings pass validation; `NaN` can become stored "latest" timestamp, blocking valid notes.

**Fix:**
```ts
const wearNotes = parseStoredArray<WearNoteEntry>(
  'scentral_wear_notes',
  (entry): entry is WearNoteEntry =>
    !!entry &&
    typeof entry === 'object' &&
    typeof (entry as WearNoteEntry).fragrance_id === 'string' &&
    typeof (entry as WearNoteEntry).note === 'string' &&
    typeof (entry as WearNoteEntry).date === 'string' &&
    Number.isFinite(Date.parse((entry as WearNoteEntry).date))  // ← Add
);
```

### 2.6 Gemini API Key Check (P1 Stability) — `app/api/embeddings/route.ts:7`
**Finding:** Missing key hides misconfiguration; returns provider auth failure for every request instead of 503.

**Fix:**
```ts
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Embedding service unavailable' },
      { status: 503 }
    );
  }
  
  const genAI = new GoogleGenerativeAI({ apiKey });
  // ... rest of handler
}
```

### 2.7 Pros-Cons Error Status (P1 Stability) — 2 files
**Lines:** `app/api/pros-cons/route.ts:64` + `app/api/proscons/route.ts:93`

**Finding:** Outer catch handlers return HTTP 200 for exceptions (malformed requests, DB failures, provider outages).

**Fix:** (Apply to canonical handler from 1.3)
```ts
try {
  // ... existing logic that returns { success: true, verdict, unavailable }
} catch (error) {
  if (error instanceof AIUnavailable) {
    return NextResponse.json({ unavailable: true }, { status: 200 });
  }
  // Unexpected errors → 503
  return NextResponse.json(
    { error: 'Service unavailable' },
    { status: 503 }
  );
}
```

---

## Phase 3: Secondary P2/Minor & Documentation Updates

### 3.1 Insights Error Handling (P1 Data Integrity) — 8 sites
**Lines:** Multiple across `page.tsx`, `route.ts`, `compute-insights-nightly/index.ts`

**Finding:** Several calls still fall back to empty data or proceed after failures. Can produce incorrect insights and hide cache failures.

**Fix:**
- `getUser()` failures → propagate error (distinguish auth failure from unauthenticated user)
- Cache lookup failures → propagate (don't silently use empty)
- Cache upsert failures → throw (don't just log)
- Failed insight reads → propagate (don't turn into `[]`)

### 3.2 Trace Pagination (P1 Performance) — `supabase/functions/compute-insights-nightly/index.ts:53`
**Finding:** `profiles` query hits Supabase's 1000-row default cap; sequential processing times out as user base grows.

**Fix:**
- Paginate profiles scan in 500-row batches
- Process each batch's users in bounded concurrency (~5–10 parallel)
- Continue until no profiles remain
- Preserve empty-result response for initially empty scan

### 3.3 Logging & User ID Redaction (P1 Security) — 3 sites
**Lines:** `route.ts:242`, `compute-insights-nightly/index.ts:68,214`

**Finding:** Logging raw authenticated user IDs.

**Fix:** Use correlation ID or redacted identifier instead of raw UUID.

### 3.4 Privacy Copy Accuracy (P1 Security) — Multiple

**`app/(main)/privacy/page.tsx:39–40`:** Local/guest privacy claim conflicts with legacy `scentral_anon_id` server persistence.  
**Fix:** Describe the legacy XP/streak persistence or remove it.

**`app/(main)/privacy/page.tsx:71–82`:** PostHog session recording with `maskAllInputs: false` + passthrough mask can still record emails/IDs.  
**Fix:** Soften copy or mask those fields before claiming they're never sent.

**`app/(main)/privacy/page.tsx:71–73`:** Gate PostHog on consent before describing it as off by default.  
**Fix:** Add consent gate to `PageTracker.tsx` + `lib/posthog.ts`; ensure re-init on consent-changed.

### 3.5 Embedding Validation (P2 Data Integrity) — `app/api/embeddings/route.ts:22`
**Finding:** Empty embeddings `[]` pass validation; truthy check can return unusable vectors.

**Fix:**
```ts
if (!embedding || embedding.length === 0 || !embedding.every(Number.isFinite)) {
  return NextResponse.json({ unavailable: true }, { status: 503 });
}
```

### 3.6 Migration Notices (P1 Data Integrity) — `supabase/migrations/20260717_align_trace_reactions_contract.sql:39–49`
**Finding:** Two destructive DELETEs don't report counts of malformed/orphaned rows being dropped.

**Fix:** Add notices before each DELETE:
```sql
DO $$
BEGIN
  RAISE NOTICE 'Trace reactions: deleting % malformed rows', 
    (SELECT COUNT(*) FROM public.trace_reactions 
     WHERE trace_id !~ '^[a-f0-9\-]{36}$');
END $$;

DELETE FROM public.trace_reactions WHERE trace_id !~ ...;
```

### 3.7 Migration Schema Alignment (P1 Data Integrity) — `supabase/migrations/20260717_align_trace_reactions_contract.sql:171`
**Finding:** Legacy rows may have nullable `created_at`, but migration never backfills or applies NOT NULL constraint.

**Fix:**
```sql
UPDATE public.trace_reactions SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE public.trace_reactions
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;
```

---

## Validation Checklist

- [ ] **Duplication gate:** SonarQube reports ≤3% on new code
- [ ] **ProsCons:** Error state clears on fetch start/success (hook tested)
- [ ] **Insights empty state:** Renders onboarding for hydrated && !notEmpty
- [ ] **Trace limit removed:** All three insights queries process full history
- [ ] **Verdict parsing:** Rejects `{pros:[],cons:[]}`
- [ ] **Wear-note validation:** Date.parse() called before storing
- [ ] **Gemini key check:** Returns 503 when missing, not provider error
- [ ] **Pros-cons errors:** Outer catch returns 503 for unexpected exceptions
- [ ] **Privacy copy:** Accurate disclosure of analytics & data persistence
- [ ] **Migrations:** Notices logged, nulls backfilled, constraints applied
- [ ] **npm run build:** Clean build locally
- [ ] **TypeScript:** `npx tsc --noEmit -p .` passes
- [ ] **Lint:** `npm run lint` passes

---

## Commit Strategy

1. **Commit 1:** Consolidate ProsCons hook + insights queries + route deduplication
   ```
   refactor: consolidate duplicate code across ProsCons, insights, pros-cons
   
   - Extract ProsCons logic to hooks/useProsCons.ts
   - Consolidate traces/collections queries to lib/insightsQueries.ts
   - Deduplicate pros-cons routes (canonical + alias)
   ```

2. **Commit 2:** Fix P1 correctness issues (error state, empty state, validation)
   ```
   fix: address CodeRabbit P1 findings — error state, validation, schema alignment
   
   - Clear error state on fetch start/success in ProsCons
   - Render empty state for hydrated && !notEmpty in insights
   - Reject empty verdicts in parseVerdict
   - Validate wear-note dates before storing
   - Check GEMINI_API_KEY before init
   - Return 503 for unexpected exceptions
   ```

3. **Commit 3:** Remove 100-trace limit + fix insights error handling
   ```
   fix: remove trace limit and harden insights error handling
   
   - Remove .limit(100) from all traces queries
   - Propagate getUser/cache/read failures instead of silent fallback
   - Validate cache upsert before reporting success
   - Paginate profiles scan and process in batches
   ```

4. **Commit 4:** Fix privacy accuracy + logging + migrations
   ```
   fix: harden privacy disclosures, redact user IDs, finalize migrations
   
   - Update privacy copy for analytics consent gating
   - Describe or remove legacy XP/streak persistence
   - Redact user IDs in logging
   - Add migration notices for deleted rows
   - Backfill and constrain created_at in trace_reactions
   ```

---

## Notes

- **Codex Refresh:** Request credits before merging; this PR has many nuanced copy & schema decisions that benefit from AI review.
- **Supabase Preview:** Defer (known platform quirk); will pass once migrations are deployed to production.
- **Test Coverage:** Run `npm run test:e2e -- --project=chromium` after ProsCons/insights changes to verify UI rendering.
- **Smoke Test:** Run `npm run test:smoke:prod` against staging to verify insights pipeline end-to-end.

