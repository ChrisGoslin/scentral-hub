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
