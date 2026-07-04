# Security Lessons — nota. / scentral-hub

> Append-only record. Format: see SKILL.md "Learning loop". Newest at the bottom.

## SEC-1 (2026-07-04) — Rate limiting existed in exactly one route
**What happened:** `@upstash/ratelimit` was installed and wired into `/api/formulate` only; the other ~57 API routes (including the LLM-calling `/api/read/generate`) had no caps.
**Guard now in place:** `docs/nota/06-testing-security-abuse.md` §3.1 defines the shared `lib/rate-limit.ts` pattern and per-route budgets; the security-hardening checklist requires a cap on every LLM route.

## SEC-2 (2026-07-04) — No security headers anywhere
**What happened:** `next.config.ts` had no `headers()`; `proxy.ts` only refreshes Supabase sessions. No HSTS/X-Frame-Options/nosniff shipped to production.
**Guard now in place:** Header block specified in 06 §2.4 (backlog item); CSP deliberately deferred to Report-Only post-launch — do not ship a blocking CSP untested.

## SEC-3 (2026-07-04) — RLS "verified" meant "read", not "attacked"
**What happened:** Phase 3 verified policies by reading them; no test ever attempted cross-user reads/writes.
**Guard now in place:** RLS adversarial suite specified (06 §2.1); migration checklist requires running it after any policy-touching migration.

## SEC-4 (2026-07-04) — Analytics load unconditionally (GDPR gap)
**What happened:** PostHog and Sentry initialise for all visitors with no consent gate, ahead of an EU-facing domain launch.
**Guard now in place:** Consent gating + privacy-page truthing added to the pre-launch critical path (06 §2.6, backlog §1); new-service checklist requires processor listing + consent review.
