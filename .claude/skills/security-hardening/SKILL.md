---
name: Security Hardening
description: This skill should be used before any migration, new API route, new third-party service, auth change, or data-handling change in scentral-hub (nota.), and when the user asks about "security", "RLS", "GDPR", "privacy", "secrets", "headers", or "is this safe". Encodes nota.'s security posture — Supabase RLS verification, secrets rules, security headers, LLM safety, GDPR duties — and grows via LESSONS.md.
version: 0.1.0
---

# Security Hardening (nota. / scentral-hub)

**Read `LESSONS.md` in this directory first — it is the record of what has actually bitten this project. This file is the checklist; that file is the memory.**

Companion doc with full rationale and code snippets: `docs/nota/06-testing-security-abuse.md` §2.

## When this skill fires

- Before applying **any migration** (in addition to the "SHOW SQL, wait for approved" rule).
- When creating or modifying **any API route** under `app/api/`.
- When adding **any third-party service, SDK, or env var**.
- On any change to auth, cookies, `proxy.ts`, or `utils/supabase/*`.
- Quarterly review (or when the user asks for a security pass).

## Fixed facts (verify before assuming they changed)

- All 37 public tables are RLS-enabled; user-scoped tables key on `user_id uuid → auth.users`. `auth.uid()` is canonical; `scentral_anon_id` is legacy/terminal — never store new personal data keyed by anon_id.
- Service-role key is server-scripts/Edge-Functions only. Gate: `grep -r "SERVICE_ROLE" app/` must be empty.
- No module-scope Supabase clients in API routes (husky-enforced, L15).
- LLM rules: no PII in prompts; every LLM route needs a server-side rate cap; no per-request LLM in UI paths; enrichment text reaches prompts only via `/admin/enrichment` human review.

## Checklists

### New/changed API route
1. Session check via `utils/supabase/server` inside the handler (request-scoped client).
2. Inputs validated: length caps, type checks; OG/unauthenticated routes treat every param as hostile.
3. Does it return catalogue data? Enforce pagination cap (`limit ≤ 50` server-side) + field shaping for anonymous callers (see resilience-abuse skill).
4. Does it call an LLM? Rate cap via `lib/rate-limit.ts` pattern (or the formulate route's inline pattern until that helper exists) + no PII in the prompt.
5. Errors: return 4xx with a calm message; never leak stack traces or SQL.

### Migration (runs after founder approval, before apply)
1. New table → RLS enabled + policies in the same migration; user-scoped → `auth.uid() = user_id` on select/insert/update/delete.
2. New FK to a user-owned table → `on delete cascade` (GDPR erasure depends on this).
3. After apply: run Supabase advisors (security + performance) via MCP; run the RLS adversarial suite if it exists (`e2e/security/rls.spec.ts`).
4. Mirror SQL in `supabase/migrations/`.

### New third-party service
1. Keys in Vercel env / `.env.local` only; never in code.
2. Add to the processor list on `/privacy`.
3. Does it receive personal data? If yes → GDPR check below.

### GDPR quick check (any feature touching personal data)
- Personal data in this app includes: emails, usernames, `noseprints.read_text` (profile-like — sensitive-adjacent), `interactions`, `traces`, `collections`, `wear_logs`, `feedback`, `waitlist`.
- New personal data → must be reachable by the DSAR delete path (cascade from `auth.users`) and the export traversal.
- New analytics/tracking → consent-gated for EU.
- Retention: don't create unbounded logs without a stated retention policy.

## Learning loop (mandatory)

After **any** security finding — a vuln, a bad advisor result, a leaked key, a rejected design, a near-miss — append one entry to `LESSONS.md`:

```
## SEC-<n> (<date>) — <one-line title>
**What happened:** <fact, 1–2 lines>
**Guard now in place:** <test/rule/config that prevents recurrence>
```

Then, if the guard is a rule an agent must follow, add one line to the relevant checklist above. Keep entries factual — no narrative.
