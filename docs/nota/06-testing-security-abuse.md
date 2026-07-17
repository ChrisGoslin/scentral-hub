# nota. — Testing, Security & Abuse Protection (Deliverable F)

> Created 2026-07-04 (Phase 5 of pre-launch audit). Grounded in verified repo state, not aspiration.
> Living companions: `.claude/skills/qe-automation/`, `.claude/skills/security-hardening/`, `.claude/skills/resilience-abuse/` — each has a `LESSONS.md` that grows as bugs and incidents are found. **Every confirmed bug, vuln, or abuse event ends its life as a lesson entry + a regression test.**

## 0. Verified starting point (what exists today)

| Area | Reality (verified 2026-07-04) |
|---|---|
| Unit tests | **None.** No Vitest/Jest installed. |
| E2E | Playwright 1.60, 4 browser projects, 8 specs in `e2e/` — all legacy-era surfaces (collection, discover, layering, onboarding, you-tab). **Zero nota-core coverage** (Read, Shelf, Noseprint, Blind Ranking, Traces). |
| Smoke | `scripts/smoke-test.mjs` (`npm run test:smoke`). URL precedence: `SITE_URL` > `BASE_URL` > `NEXT_PUBLIC_SITE_URL` > `https://scentral-hub.vercel.app`. `test:smoke:prod` supplies `BASE_URL` from `NEXT_PUBLIC_SITE_URL` (falling back to `scentral-hub.vercel.app`). |
| CI | `.github/workflows/security-audit.yml` — `npm audit --audit-level=high` only. No tsc, lint, build, or test in CI. |
| Local gates | Husky pre-push: tsc + module-scope `createClient()` check (L15). `npm run build` before push (L14) is convention, not enforced. |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` installed. Used in **exactly one** of ~58 API routes: `app/api/formulate/route.ts` (sliding window 10/min per user, graceful no-op without env vars). |
| Middleware | `proxy.ts` (Next 16) — Supabase session refresh only. **No security headers, no rate limiting, no bot logic.** |
| Security headers | None. `next.config.ts` has no `headers()`; no CSP/HSTS/X-Frame-Options anywhere. |
| RLS | All 37 public tables RLS-enabled; policies verified sound in Phase 3 (`04-architecture-plan.md`). **Never adversarially tested.** |

---

## 1. Testing strategy

### 1.1 Layers

**Unit (add Vitest — the one new dev dependency this plan requires).**
Pure-function tests for domain logic that must not depend on the DB trigger being right:
- Shelf eligibility + tier math: rank→tier mapping (S 1–5 / A 6–10 / B 11–15 / C 16–20), eligibility (`tested`/`owned`/`past_purchase` only), blind-buy stamping rules. Mirror of the `enforce_shelf_eligibility` trigger — the trigger is the enforcement, the unit test is the spec.
- Insight/aura helpers: classification, thresholds, "third time you've come back to this one" mappers over `interactions` shapes.
- `lib/affiliates.ts` `isActive` fallback behaviour (PENDING merchant → plain search URL, never broken link).
- Config: `vitest` + `npm run test:unit`; colocate as `*.test.ts` next to `lib/` sources.

**Integration / API (Playwright `request` context or Vitest + fetch against `next dev`).**
- `POST /api/read/generate` — happy path writes `noseprints` + `interactions`; regen cap returns saved Read instead of new LLM call once the server-side cap lands (Phase 3 item).
- `/api/shelf` — add beyond capacity → rejected; add non-eligible fragrance → rejected by trigger (assert the 4xx surfaces cleanly, not a 500); reorder persists ranks; blind-buy flag set on reveal.
- Swap lifecycle (`swap_offers`): create → accept/decline transitions; cannot act on another user's offer.
- **RLS adversarial suite** — see §2.1. This is an API-layer test, run with two real auth users.

**E2E (Playwright — extend the existing 8 specs).**
Coverage map: the 7 nota-core specs from `05-recommendations-backlog.md` §4 are the priority list. Target state:

| Flow | Spec | Status |
|---|---|---|
| The Read → Noseprint reveal | `e2e/read.spec.ts` | ❌ to write |
| Shelf capacity/reorder/persist | `e2e/shelf.spec.ts` | ❌ to write |
| Blind ranking full loop | `e2e/blind-ranking.spec.ts` | ❌ to write |
| Trace post → feed → reaction | `e2e/traces.spec.ts` | ❌ to write |
| Signed-out shelf empty state | `e2e/shelf.spec.ts` | ❌ to write |
| Discover, Collection, Onboarding, You, Layering | existing 8 specs | ✅ keep, prefer `getByRole` (L17) |

Rules: `getByRole` over text selectors (L17); run `--project=chromium` in CI (4-browser matrix stays local/pre-release); every copy change re-runs e2e.

### 1.2 CI wiring (GitHub → Vercel), staged so it never blocks on missing secrets

**Stage 1 — applied now** (`.github/workflows/ci.yml`, created in this phase): typecheck + lint on every PR/push to main. Needs zero secrets, cannot flake.

**Stage 2 — enable when you add repo secrets** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`): production build job.

```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**Stage 3 — e2e in CI** (same secrets + a dedicated test user):

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**Vercel gating:** keep the current discipline — production deploys only via `npx vercel --prod` after local build passes (L14). Once Stage 2/3 are green and stable, flip to "Require CI checks" on the GitHub main branch protection and let CI be the gate. Optional: enable CodeQL (GitHub → Security → Code scanning → default setup) — free for the repo, scans the ~58 API routes for injection patterns.

**Post-deploy:** `npm run test:smoke:prod` after every production deploy (repoint the URL at domain cutover, per CLAUDE.md §2).

### 1.3 The bug→test loop (the actual QE framework)

Every confirmed bug follows one path, no exceptions:
1. Reproduce → write the failing test at the cheapest layer that catches it (unit > API > e2e).
2. Fix → test goes green.
3. Append a lesson to `.claude/skills/qe-automation/LESSONS.md` (ID `QE-n`) — one line on the class of bug and the guard now in place.

This is how the suite grows to fit *this* app instead of a generic checklist.

---

## 2. Security & privacy hardening

### 2.1 RLS — from "verified sound" to "adversarially proven"

Phase 3 read the policies; nobody has yet *attacked* them. Add `e2e/security/rls.spec.ts` (API-level, two seeded test users A and B):

- As B, `select` A's rows via the anon-key client on every user-scoped table: `noseprints`, `shelf_items`, `shelf_events`, `blind_ranking_*`, `traces` (private fields), `temptations`, `evolution_events`, `interactions`, `insights_cache`, `collections`, `trail_progress`, `swap_offers`. Assert **empty set**, not error.
- As B, `insert`/`update`/`delete` with `user_id = A`. Assert rejection.
- Unauthenticated client on the same tables. Assert empty/rejected.
- `fragrances`, `trails`, `houses`, `discovery_boxes` remain publicly readable (intended catalogue surface).

Run this suite after **every migration touching policies** — wire it into the migration checklist in `.claude/skills/security-hardening/`.

Also: run Supabase advisors (`get_advisors` via MCP, security + performance) at the end of every phase; findings become `SEC-n` lessons.

### 2.2 Identity model lock

Decision (already implicit in Phase 3, now explicit): **`auth.uid()` is canonical; `scentral_anon_id` is legacy and terminal.**
- The claim/migration path (`scripts/ops-claim-legacy-data.sh` sketch) moves `user_xp`/`user_streaks` (anon_id text) onto `user_id uuid`; wishlist consolidates into `collections.status='wishlist'` (DB-approved migration set).
- Until migrated, treat anon-keyed tables as **non-sensitive gamification data only** — never store anything personal keyed by anon_id.

### 2.3 Secrets & surface area

- All keys (Supabase service role, Anthropic, AWIN, Shopify, Upstash, web-push VAPID) live in Vercel env / `.env.local` only — already the rule (CLAUDE.md §11.7). Add: **rotate on any suspected leak and quarterly for service-role + Anthropic**; note rotations in `LESSONS.md`.
- Vercel project access: restrict to your GitHub account; no team-wide tokens.
- The Supabase **service-role key must never appear in any `app/` code path** — only server scripts and Edge Functions. Grep gate: `grep -r "SERVICE_ROLE" app/` must return nothing (add to repo-tidy skill runs).

### 2.4 Security headers (concrete change, `next.config.ts`)

```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
```

CSP is deferred deliberately: Next inline hydration + PostHog + Sentry + Vercel toolbar make a strict CSP a project of its own. Start with `Content-Security-Policy-Report-Only` after launch, tighten from real reports. Do not ship a blocking CSP untested.

OG routes (`app/api/og/*`): treat every query param as hostile — length-cap, whitelist characters for names/descriptors, never interpolate user text into anything but the ImageResponse text nodes. (Scanner `/api/og` params are the highest-risk input surface because they're unauthenticated by design.)

### 2.5 LLM safety posture (codifying what's already partly true)

- **No PII in prompts.** The Read sends feeling-chips + catalogue data — keep it that way. Username, email, or free-text user bios never enter a prompt; if a future feature needs user text, tokenize (`[USER]`, `[FRAGRANCE_42]`) server-side.
- **Server-side caps on every LLM route.** `/api/formulate` has one (Upstash 10/min). `/api/read/generate` needs the same + the regen cap (max 2 generations per user per 24h via `interactions` count) — this was Phase 3's one flagged LLM gap.
- No per-request LLM in UI paths; cache-or-queue everything else (already the rule, CLAUDE.md §7).
- Prompt-injection surface: fragrance `plain_description` is enrichment-pipeline text that gets fed into prompts. The enrichment review UI (`/admin/enrichment`) is the gate — never auto-approve enriched text into prompt-reachable columns.

### 2.6 GDPR (you have EU users the moment notalabs.io is live)

**What counts as personal data here:** `auth.users` (email), `profiles` (username), `noseprints` (read_text is a psychological-style profile — treat as sensitive-adjacent), `interactions` (behavioural log), `traces` (UGC), `collections`, `wear_logs`, `feedback`, `waitlist` (emails). That's most of the DB.

Minimum viable compliance, in priority order:
1. **DSAR delete (right to erasure).** One script/Edge Function: given a user_id, delete or anonymise across all user-scoped tables + `auth.users`. Supabase `on delete cascade` FKs get you most of it — **verify every nota-era FK actually cascades** (add to the RLS test suite as a teardown assertion). Target: deletion within 30 days of request; a `mailto:` on `/privacy` is an acceptable request channel at this scale.
2. **DSAR export (right of access).** Same traversal, JSON out. Ship as a script first; a `/you` self-serve button post-launch.
3. **Consent for analytics.** PostHog + Sentry currently load unconditionally. For EU: PostHog needs consent-gating (or switch to its cookieless mode); Sentry error data should have `sendDefaultPii: false`. A calm one-line banner fits the doctrine better than a cookie-wall — "nota. uses minimal analytics to improve itself. Okay / No thanks."
4. **Privacy page truthing.** `/privacy` exists — audit it against reality: name the processors (Supabase, Vercel, Anthropic, PostHog, Sentry, Shopify, AWIN), state retention, state the deletion channel. Anthropic API does not train on API data — say so; it's a trust asset for a scent-identity product.
5. **Data residency.** Check the Supabase project region; if not EU and EU launch matters, note it in the privacy policy (transfer mechanism: SCCs via Supabase's DPA — link their DPA and Vercel's).
6. **Retention.** `interactions` grows forever by design (it powers Insights). Set a policy now: e.g. raw interactions >24 months old are aggregated-then-deleted. Cheap to promise, painful to retrofit.

Not needed at this scale: DPO, EU representative (until systematically targeting EU at volume), records-of-processing beyond a one-page table in this doc's future revision.

---

## 3. Bot & scraper protection

**Threat model:** the crown jewel is the 127,595-row enriched `fragrances` catalogue (`plain_description`, `inspired_by`, `family` metadata). Rivals scraping it is the realistic attack; credential stuffing and LLM-cost abuse are secondary. Identity features (Shelf, Noseprints, Insights) are already auth-gated — a scraper gets catalogue, not product.

### 3.1 Edge layer (Vercel — cheapest wins first)

1. **Vercel Firewall (dashboard, zero code):** enable managed rulesets + "AI bot" / "unverified bot" challenge rules. Add per-path rate rules for `/api/search` and `/discover`. Do this before writing any middleware.
2. **Vercel BotID** (GA product): challenge-on-suspicion for the search and OG endpoints if Firewall rules prove insufficient.
3. **Shared rate-limit helper** — generalise the existing formulate pattern into `lib/rate-limit.ts`:

```ts
// lib/rate-limit.ts — one Redis client, per-route limiters by prefix.
// Falls back to allow-all when Upstash env is absent (local dev), same as formulate.
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

export function makeLimiter(prefix: string, tokens: number, window: `${number} ${'s'|'m'|'h'}`) {
  return redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), prefix, analytics: true })
    : null;
}

// identity: user.id when signed in, else the Vercel-provided client IP.
export async function enforce(limiter: Ratelimit | null, identity: string): Promise<boolean> {
  if (!limiter) return true;
  return (await limiter.limit(identity)).success;
}
```

Apply per-route (not globally in `proxy.ts` — a Redis call on every page navigation is latency you don't need). Priority routes and starting budgets: `read/generate` 2/24h per user (the regen cap), `search` 30/min per IP, any list endpoint 60/min per IP, `og/*` 20/min per IP, auth endpoints 10/min per IP.

### 3.2 Data layer (query shaping)

- **No dump-all endpoints.** Every catalogue list API requires pagination with a hard cap (`limit ≤ 50` enforced server-side, not by the client's word) and at least one filter for deep pages. Audit the ~58 routes for any that return unbounded fragrance sets — each is a `RES-n` lesson.
- **Field shaping for anonymous callers:** signed-out search returns name/brand/family/image; the enriched fields (`plain_description`, `inspired_by`, projection/season/use-case metadata) require a session. That makes the scrape target worth ~nothing without 127k authenticated requests, which the rate limits then own.
- RLS already prevents cross-user reads; this section is purely about the *public* catalogue surface.

### 3.3 Detection (use what you already log)

`interactions` + Vercel/Supabase logs are the heatmap. A weekly (later: scheduled) check, encoded in `.claude/skills/resilience-abuse/`:
- Top IPs by request count on `/api/search` and list endpoints (Vercel logs).
- Sessions with high fragrance-page coverage and **zero** identity actions (no shelf/read/trace writes) — the scraper signature.
- 429 counts per route (Upstash analytics is already on).
Response ladder: observe → tighten that route's limit → Firewall challenge for the ASN/IP → block. Never jump straight to block; log the event as a `RES-n` lesson.

### 3.4 Front-end friction (doctrine-compatible)

No captchas on normal browsing — nota. is calm. The doctrine already does the work:
- Progressive disclosure and paging (cognitive-load rules) naturally bound per-page yield.
- Value-creating actions (Shelf, Traces, Trails, Read) require sign-in — bots get diminishing returns.
- Explicit challenges only fire from the detection ladder (§3.3), never by default.

---

## 4. Ownership & the living-skill wiring

| Concern | Skill | Lesson prefix | Fires when |
|---|---|---|---|
| Tests, CI, bug→test loop | `.claude/skills/qe-automation/` | `QE-n` | any bug found; any new feature shipped; any CI change |
| RLS, secrets, headers, GDPR, LLM safety | `.claude/skills/security-hardening/` | `SEC-n` | any migration; any new API route; any new third-party service; quarterly review |
| Rate limits, bots, incidents, degradation | `.claude/skills/resilience-abuse/` | `RES-n` | any abuse signal; any 429/5xx spike; any new public endpoint |

The contract: **skills are consulted before the relevant work and appended after it.** They exist so this doc can go stale gracefully — the lessons files are the ground truth of what actually bit us.

## 5. Pre-launch additions to the critical path (feeds `05-recommendations-backlog.md` §1)

1. CI Stage 1 (tsc + lint) — **done this phase** (`.github/workflows/ci.yml`).
2. Security headers in `next.config.ts` (§2.4) — 15 minutes, do with the next code change.
3. Vercel Firewall managed rules + bot challenge (§3.1.1) — dashboard-only, do today.
4. Regen cap + rate limit on `/api/read/generate` (§2.5) — before any public traffic.
5. RLS adversarial suite (§2.1) — before the Shelf v2 migrations ship.
6. PostHog consent gating + privacy-page truthing (§2.6.3–4) — before notalabs.io DNS cutover.
7. DSAR delete script (§2.6.1) — before first real EU signup; verify FK cascades.
