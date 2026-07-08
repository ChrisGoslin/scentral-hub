---
name: Resilience & Abuse Protection
description: This skill should be used when adding any public endpoint to scentral-hub (nota.), when investigating traffic spikes, 429/5xx errors, scraping, or bot activity, and when the user mentions "rate limit", "bots", "scrapers", "competitors stealing data", "abuse", "DDoS", or "site is slow/down". Encodes the edge/data/detection defence ladder for protecting the 127k-fragrance catalogue and LLM cost surface; grows via LESSONS.md.
version: 0.1.0
---

# Resilience & Abuse Protection (nota. / scentral-hub)

**Read `LESSONS.md` in this directory first — it records real abuse events and what worked.**

Companion doc: `docs/nota/06-testing-security-abuse.md` §3 (threat model, code snippets, budgets).

## Threat model (fixed until evidence says otherwise)

- **Primary:** rivals scraping the enriched `fragrances` catalogue (127,595 rows — `plain_description`, `inspired_by`, metadata). Identity features are auth-gated; the catalogue is the exposed asset.
- **Secondary:** LLM cost abuse (`/api/read/generate`, `/api/formulate`), credential stuffing on `/login`.
- **Doctrine constraint:** nota. is calm. No captchas or challenges on normal browsing — friction only escalates from detected suspicion.

## Defence ladder (apply in this order — cheapest first)

1. **Vercel Firewall (dashboard, zero code):** managed rulesets + bot-challenge rules; per-path rate rules on `/api/search`, `/discover`. Check it's still enabled before writing any code defence.
2. **Per-route rate limits** via the shared Upstash pattern (`lib/rate-limit.ts`, spec in 06 §3.1; live example: `app/api/formulate/route.ts`). Identity = `user.id` if signed in, else client IP. Graceful allow-all when Upstash env is absent (local dev). Budgets: read/generate 2 per 24h/user; search 30/min/IP; list endpoints 60/min/IP; og/* 20/min/IP; auth 10/min/IP. **Never rate-limit globally in `proxy.ts`** — Redis on every navigation is self-inflicted latency.

### Corrections (2026-07-05)
The budgets line above states the *target* posture, not what's wired up everywhere yet. Verified adoption:
- `app/api/formulate/route.ts` — inline limiter, 10/min (not via the `lib/rate-limit.ts` helper).
- `app/api/og/noseprint/route.tsx` — uses `lib/rate-limit.ts` (`makeLimiter`/`enforce`/`clientIp`), 20/min/IP — matches its budget exactly.
- `app/api/read/generate`, `app/api/search`, `/api/dna-match`, `/api/sommelier`, `/api/chemist` — **no rate-limit import found**. The read/generate 2-per-24h and search 30/min budgets are backlog, not shipped guards, as of this date.
Re-verify per route: `grep -n "rate-limit\|Ratelimit" app/api/<route>/route.ts`.
3. **Query shaping:** no dump-all endpoints; server-enforced `limit ≤ 50`; enriched fields (plain_description, inspired_by, projection/season metadata) require a session — anonymous search gets name/brand/family/image only.
4. **Escalation for a confirmed abuser:** tighten that route's limit → Firewall challenge for IP/ASN → block. Never jump straight to block. Log every escalation as a `RES-n` lesson.

## Detection runbook (weekly, or on any anomaly)

1. Vercel logs: top IPs by request count on `/api/search` and list endpoints.
2. Scraper signature: high fragrance-page coverage + zero identity writes (no shelf/read/trace rows in `interactions` for that session).
3. Upstash analytics: 429 counts per prefix — a rising prefix means a limit is being probed.
4. Supabase `get_logs` (api) for error spikes; `get_advisors` for perf regressions under load.
5. Anything actionable → defence ladder + lesson entry.

## Resilience rules for new code

- Every external call (Upstash, Shopify, AWIN, Anthropic) degrades gracefully: absent env or a failed call must produce a calm fallback, never a 500 (pattern precedents: `lib/shopify.ts` null-when-unconfigured, `lib/affiliates.ts` search-URL fallback, formulate's allow-when-no-Redis).
- New public endpoint → pagination cap + rate-limit decision **in the same PR**, not later.
- Batch scripts keep the yield circuit-breaker rule (<1% hit rate after ~1k rows → stop).

## Learning loop (mandatory)

After any abuse event, outage, spike, or degradation incident, append to `LESSONS.md`:

```
## RES-<n> (<date>) — <one-line title>
**What happened:** <signal observed, route, volume>
**Response & guard:** <ladder step taken; permanent guard added>
```

If the incident revealed a missing defence class, add it to the ladder or runbook above.

## When NOT to use this skill

For RLS, secrets, GDPR, and migration-safety checks (not abuse/traffic), use `security-hardening`. For test-layer/CI policy, use `qe-automation`. For batch-script yield circuit-breakers specifically, see `ai-orchestration-playbook` (cross-project) — this skill covers the *product endpoint* defence ladder, not one-off enrichment scripts.

## See also

- `nota-architecture-contract` — the 54-ish API route inventory this skill's per-route budgets apply to.
- `nota-config-and-flags` — where `UPSTASH_REDIS_REST_URL`/`TOKEN` and other env gates live.
- `nota-failure-archaeology` — the 53k-row/0.09%-yield batch incident referenced in the yield circuit-breaker rule, in full narrative form.

## Provenance and maintenance

Derived from: `docs/nota/06-testing-security-abuse.md` §3, `lib/rate-limit.ts`, `app/api/formulate/route.ts`, `app/api/og/noseprint/route.tsx`, `LESSONS.md` in this directory.

Re-verify when picking this skill back up:
- Which routes actually rate-limit: `grep -rln "rate-limit\|Ratelimit" app/api/*/route.ts app/api/*/route.tsx`.
- Shared limiter helper still shaped the same way: `cat lib/rate-limit.ts`.
- Catalogue row count (context for "why this table matters"): ask Supabase MCP `execute_sql: SELECT count(*) FROM fragrances` — do not hardcode a number here, it has changed multiple times.
- Vercel Firewall still enabled: check the Vercel dashboard directly (not verifiable from the repo).
