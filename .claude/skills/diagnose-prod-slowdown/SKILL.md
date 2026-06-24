---
name: diagnose-prod-slowdown
description: "Root-cause a slow or timing-out production API route in scentral-hub (Next.js on Vercel + Supabase Postgres). Runbook: Vercel runtime logs -> Postgres error/EXPLAIN ANALYZE -> targeted fix -> re-verify cost -> live curl check. Use this instead of guessing or re-architecting blind."
---

# Skill: diagnose-prod-slowdown

## Why this exists
On 2026-06-24, `/api/search?q=rose` had a recurring prod timeout across multiple smoke-test
runs, "not yet root-caused" for some time. Once actually investigated with this sequence, the
real cause (`search_by_note_similarity` doing a full sequential scan of 127k rows per call,
called in parallel up to 20x per request) took about 10 minutes to find and fix. The lesson:
don't theorize about Next.js/Vercel timing issues from first principles — go straight to the
database, because in this stack that's almost always where the cost actually is.

## When to invoke
- A smoke test or user report says an API route times out, 500s intermittently, or is "slow"
- Before proposing any code-level fix (caching, reducing payload, retries) for a perf issue —
  rule out a missing index or an O(n) query first, those are usually the real cause

## Procedure

### 1. Get the real error from Vercel runtime logs — don't guess from the route code alone
```
mcp__plugin_vercel_vercel__get_runtime_logs
  projectId: <from .vercel/project.json>
  teamId: <from .vercel/project.json>
  environment: production
  level: ["error", "fatal"]
  query: <route name, e.g. "search">
  since: "2h"
```
Look for a Postgres error code in the log body, e.g. `57014` = `canceling statement due to
statement timeout`. This tells you it's a real DB cost problem, not a network/cold-start issue.

### 2. Reproduce the cost directly against Postgres
Use the Supabase MCP `execute_sql` tool (not the app) to run `EXPLAIN (ANALYZE, BUFFERS,
TIMING)` on the exact query or RPC the route calls, with realistic input (a common search
term, not an edge case). Look for:
- `Seq Scan` on a large table where you'd expect an index scan
- A function called once per row, especially with `unnest`/array operations — these can't use
  a btree/GIN index unless the underlying column itself is indexed for that operation
- The actual row count being scanned vs. how many rows the query logically needs

### 3. Check whether the route calls the expensive thing more than once per request
Grep the route handler for `Promise.all` / `.map(...)` around any DB call. A single 500ms
query is tolerable; the same query fired 20x in parallel per request is not — and this is easy
to miss when reading the code top-to-bottom instead of asking "how many times does this run
for one user request?"

### 4. Fix in order of effort, ship the cheap one immediately
1. **App-side bound** (no migration, no risk): cap how many times the expensive path runs per
   request (e.g. top-N seeds instead of all matches). Ship and deploy this first — it bounds
   the worst case immediately while you work on the real fix.
2. **DB-side fix** (needs a migration, needs explicit user approval per AGENTS.md): add the
   right index for the actual access pattern. For array-overlap queries, that's a GIN index on
   a normalized array column with `&&` as a pre-filter before any per-row scoring logic — don't
   try to index your way around `unnest()`/`DISTINCT` subqueries directly, restructure the
   query so the expensive part only runs on a small pre-filtered candidate set.

### 5. Verify the fix actually worked — both layers
```bash
# DB layer: re-run EXPLAIN ANALYZE, compare cost/timing to step 2's baseline
# App layer: hit the live endpoint for several inputs, not just the one that was reported
curl -s -o /dev/null -w "HTTP %{http_code} %{time_total}s\n" "https://<prod-url>/api/<route>?q=<term>"
```
Try multiple search terms / inputs — a fix that only works for the one term in the bug report
can still be wrong for others with different result-set sizes.

### 6. Clean up any test data and update memory
If verification involved writing test rows to a live table, delete them. Record the root
cause and fix in project memory (or `AGENTS.md` lessons-learned) with the actual `EXPLAIN`
numbers — "before: 551ms full scan, after: 6.8ms bitmap index scan" is far more useful to a
future session than "fixed the search bug."

## Anti-patterns to avoid
- Adding a cache/retry/timeout-increase without finding the underlying cost — this masks the
  problem under load instead of fixing it, and the next traffic spike reintroduces it.
- Assuming Vercel function cold-starts or edge runtime are the cause without checking logs
  first — in this stack, a Postgres statement timeout (`57014`) almost always means a missing
  index or an O(n)-per-call pattern, not a platform issue.
- Applying a DB migration without showing the SQL and getting explicit approval first (see
  AGENTS.md §3) — even when you're confident, this is a hard-to-reverse shared-system change.
