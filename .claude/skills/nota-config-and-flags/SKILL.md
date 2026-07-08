---
name: nota-config-and-flags
description: >
  Catalog of every environment variable and feature flag in nota. (repo
  scentral-hub) — what each does, whether it's production/experimental/disabled,
  what breaks silently without it, and how to add a new one safely. Load this
  BEFORE adding or changing any env var or flag, when asked "why is Pro locked
  for everyone", when debugging affiliate links falling back to plain search
  (zero commission), when Shopify calls return null/empty, or when changing
  rate-limit behaviour on any /api route. Does NOT cover
  RLS/schema/migrations (see the `supabase` skill or repo
  `docs/nota/04-architecture-plan.md`), Next.js/Supabase stack mechanics (see
  `nextjs16-supabase-conventions`), or UI/UX standards (see
  `ux-interaction-standard`). Scope: scentral-hub repo only.
---

# nota. config and flags

Plain-language framing: nota. is controlled almost entirely by environment
variables, not a database-backed flag system. There is no admin panel for
flags — a flag is "on" if a variable is set in Vercel/`.env.local`, and "off"
(usually silently, not with an error) if it's missing. That silence is the
main risk this skill guards against: several features degrade gracefully to
a fallback instead of failing loud, which is good for uptime but bad for
noticing you forgot to configure something.

## 1. Full environment variable catalog

Verified 2026-07-05 against `.env.example` and `grep -rn "process\.env\." app/ lib/ scripts/`.
Re-run that grep before trusting this table — it drifts.

| Variable | Status | Where used | Guard / fallback | What breaks without it |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production | everywhere (`utils/supabase/*`) | none — required | App cannot reach Supabase at all. Hard failure. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production | `utils/supabase/client.ts`, `server.ts`, `middleware.ts` | falls back to this if `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` unset | Same as above — no client works. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production, undocumented in `.env.example` | `utils/supabase/{client,server,middleware}.ts`, `app/api/spritz/generate/route.ts` | `?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` | Nothing breaks — it's an optional newer-style key name that falls back to the anon key. Not in `.env.example`; add it there if you standardize on it. |
| `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | production, undocumented in `.env.example` | admin/server-only routes (grep for exact call sites before using — two names exist, check which the route you're touching expects) | none | Server-side admin operations (bypassing RLS) fail. Never expose to client bundles. |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | production | analytics init | PostHog silently no-ops if key missing | No analytics, no error. GDPR consent gate added 2026-07-04 (commit `8432a7a`) sits in front of this — check that gate before assuming "no events" means "no key". |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_EMAIL` | production | `app/api/push/*`, web-push setup | push subscribe fails without public key on client | Push notifications silently unavailable. |
| `PUSH_BROADCAST_SECRET` | production, undocumented in `.env.example` | `app/api/push/send/route.ts:7` | route checks this secret before broadcasting | Anyone could trigger a broadcast push if this were unset and the check were skipped — verify the route actually 401s when missing, don't assume. |
| `ADMIN_PASSCODE` | production | `/admin/feedback` triage gate | none documented beyond `.env.example` comment | Admin feedback/contributions triage page inaccessible. |
| `NEXT_PUBLIC_ADMIN_EMAIL` | production | admin UI (email display/allowlist) | — | Admin identity check may fail open or closed — verify at the call site before relying on it as a security boundary. |
| `NEXT_PUBLIC_SITE_URL` | production, undocumented in `.env.example` | `app/layout.tsx` metadataBase, `NoseprintClient` share links | falls back to `scentral-hub.vercel.app` per repo `CLAUDE.md` §2 | Share links point at the Vercel domain instead of `notalabs.io` post-DNS-cutover. Repo CLAUDE.md flags this as a pending post-cutover task — check `CLAUDE.md` §2 before assuming it's set. |
| `NEXT_PUBLIC_AWIN_PUBLISHER_ID` | production (approved), see §2 | `lib/affiliates.ts:19` | defaults to hardcoded `'2955445'` in code even if unset | Affiliate links still work (fallback constant matches the real approved ID) — but treat the hardcoded fallback as a footgun if the ID ever needs to rotate; update `lib/affiliates.ts:19` too, not just Vercel env. |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | experimental/partial | `lib/shopify.ts`, `app/(main)/boxes/[slug]/BoxDetailClient.tsx` | see §4 | `/boxes` product data and cart links break gracefully to null/console.warn, not a crash. |
| `SHOPIFY_STOREFRONT_API_KEY` | experimental/partial | `lib/shopify.ts` | see §4 | Same as above. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | production for the routes that use it | `lib/rate-limit.ts`, `app/api/formulate/route.ts`, `app/api/og/noseprint/route.tsx` | `lib/rate-limit.ts` returns `null` limiter (allow-all) if either is unset — explicit designed fallback for local dev | In production, if these are unset, rate limiting on `/api/formulate` and `/api/og/noseprint` silently disables (no error, just unlimited requests). See §5 — do not assume "rate limited" applies repo-wide. |
| `ANTHROPIC_API_KEY` | production | every Haiku call site (`app/api/read/generate/route.ts`, chemist, sommelier, dna-match, smells-like, clone-confidence, pros-cons) | none — required per route, will throw on the Anthropic SDK call | Those routes 500 when called. |
| `GEMINI_API_KEY` | legacy/experimental | `@google/genai` call sites — grep before trusting any route still uses it; most LLM routes migrated to Haiku per incident #8 in project history | — | Whatever legacy route still reads it fails; low blast radius since migration mostly done. |
| `NEXT_PUBLIC_BETA_MODE` | production but see §3 (footgun) | `app/page.tsx:44`, `lib/subscription.ts:8` | `=== 'true'` string check, else Pro off | Currently `false` in the live dossier snapshot — Pro features gated off for everyone. See §3 before touching this. |
| `GOOGLE_CSE_API_KEY` / `GOOGLE_CSE_CX` | disabled (service closed) | `scripts/enrich-images-google.mjs` | script exits with a console error if unset | Script only — not a runtime app path. Google Custom Search closed to new projects 2026-01-20 (see repo incident history); DuckDuckGo fallback already exists in `scripts/fetch-fragrance-images.mjs` — use that script, not this env var, for new work. |
| `GOOGLE_CUSTOM_SEARCH_API_KEY` / `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` | disabled (service closed) | `scripts/fetch-fragrance-images.mjs` | `console.warn` if unset, script has a non-Google fallback path — check the script before assuming it's dead | Same closed-service caveat as above. |
| `BASE_URL` | production (scripts only) | `scripts/smoke-test.mjs:11` | defaults to `https://scentral-hub.vercel.app` | Smoke tests target the wrong host if you meant to point at a preview deploy or `notalabs.io` post-cutover. |
| `NODE_ENV` | framework-managed | multiple | Next.js sets this; don't set manually in `.env.local` | — |

Fence explicitly: `.env.example` (as of 2026-07-05) documents only 8 of the ~26
variables actually read by the code. Do not treat `.env.example` as a
complete list — always cross-check with the grep in §7.

## 2. AWIN affiliate — states and the zero-commission fallback

Plain language: AWIN is the affiliate network nota. uses to earn commission
when someone clicks through to buy a fragrance. Every retailer link needs
two IDs to earn money: nota.'s own publisher ID (works today) and a
per-retailer "merchant ID" (still pending approval per-retailer).

- Publisher ID `2955445` — approved 2026-06-28. Hardcoded as the fallback
  default in `lib/affiliates.ts:19`, also settable via
  `NEXT_PUBLIC_AWIN_PUBLISHER_ID`.
- Merchant IDs for Notino, Douglas, Feel Unique — all three literal strings
  `'PENDING'` in `lib/affiliates.ts:22-24`.
- `isActive` per retailer is computed as `AWIN_MID_X !== 'PENDING'`
  (`lib/affiliates.ts:50,60,70`) — currently false for all three.
- Effect right now: `buildAffiliateLink` / the product-page link builder
  checks `AWIN_PUBLISHER_ID !== 'PENDING'` (it's never pending) but the
  per-merchant `isActive` gate means links fall back to a **plain search URL**
  — functional for the user, but **zero commission** for nota. This is a
  silent, by-design fallback, not a bug — but it means the affiliate revenue
  path is fully wired and simply waiting on AWIN's separate merchant-level
  approval for each retailer.
- To activate a retailer: get the merchant ID from that programme's page in
  the AWIN dashboard, replace the matching `AWIN_MID_*` constant in
  `lib/affiliates.ts` (not an env var — it's a code constant per retailer).

Re-verify: `grep -n "AWIN_MID_\|isActive" lib/affiliates.ts`

## 3. NEXT_PUBLIC_BETA_MODE — the global Pro-gate footgun

This is the single highest-risk flag in the app. Read this before touching
Pro/paywall logic.

- `lib/subscription.ts:8`: `getIsPro()` returns
  `process.env.NEXT_PUBLIC_BETA_MODE === 'true' ? true : false`.
- This is a **global on/off switch for every user**, not a per-user
  entitlement. There is no Stripe integration, no subscriptions table, no
  per-user Pro flag anywhere in the schema (confirmed: dossier + repo
  `CLAUDE.md` §9 both state "no Stripe").
- Consequence: if someone flips `NEXT_PUBLIC_BETA_MODE=true` in Vercel to
  test Pro features, **every signed-in and signed-out visitor gets Pro for
  free**, instantly, sitewide. There is no way to grant Pro to one user
  without granting it to all.
- Why is Pro locked? Because this flag is `false` in production (verified in
  dossier snapshot 2026-07-05) — that's the entire gating mechanism. If a
  user says "I should have Pro" or "why can't I access X", the answer is
  never a per-user DB check — it's this one global flag.
- Before shipping any real paywall: this needs replacing with a per-user
  entitlement (Stripe customer + webhook + a `profiles` or dedicated table
  column), not a patch to this flag. Treat `NEXT_PUBLIC_BETA_MODE` as a
  temporary open-beta switch, not a monetization primitive.

Re-verify: `grep -n "BETA_MODE\|getIsPro" lib/subscription.ts app/page.tsx`

## 4. Shopify — graceful-null behavior

- Both `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_API_KEY`
  must be set for `lib/shopify.ts` to do anything.
- `getShopifyProduct()` (`lib/shopify.ts:29-33`): if either is missing, it
  `console.warn('Shopify Storefront API not configured')` and **returns
  `null`** — it does not throw.
- Callers must handle `null` explicitly. `/boxes/[slug]` falls back to the
  static `box.slug`-based link when `shopifyProduct` is falsy
  (`app/(main)/boxes/[slug]/BoxDetailClient.tsx:45-46`).
- Practical effect: if Shopify env vars are unset in an environment (e.g. a
  preview deploy without secrets), `/boxes` pages still render, just without
  live Shopify product data/pricing/cart links — no crash, no error banner
  unless you added one.
- Before adding a new Shopify-dependent feature: follow the same
  null-check pattern, do not assume the API key is present. See the
  sibling skill `shopify-image-enrichment` for verifying a brand's storefront
  before scripting against it — that skill covers the enrichment-script use
  case, this one covers the runtime `/boxes` integration.

Re-verify: `grep -n "SHOPIFY_STOREFRONT_API_KEY\|not configured" lib/shopify.ts`

## 5. Rate limiting — Upstash, and exactly which routes it covers

Fencing a stale claim: an earlier dossier snapshot (2026-07-05) asserted
`/api/read/generate` is "the only rate-limited route" via Upstash. **That is
wrong as of this verification.** Do not repeat it. Ground truth, verified
directly in code and confirmed by the repo's own `CLAUDE.md` §7/§12
(Phase 5 testing/security audit):

| Route | Mechanism | Limit | Notes |
|---|---|---|---|
| `app/api/formulate/route.ts` | inline `Ratelimit` (own instance, not the shared lib) | 10 requests / 1 minute, keyed on `user.id` | The original rate-limited route (repo CLAUDE.md Phase 5: "rate limiting existed only on `/api/formulate`" as of that audit). |
| `app/api/og/noseprint/route.tsx` | shared `lib/rate-limit.ts` (`makeLimiter`/`enforce`/`clientIp`) | 20 requests / 1 minute, keyed on client IP | Added after the Phase 5 audit — uses the newer shared module, prefix `og-noseprint`. |
| `app/api/read/generate/route.ts` | **not Upstash at all** — a direct Supabase count query against `interactions` (`event_type = 'read_generated'`, `created_at >= now() - 1h`) | 1 per hour per signed-in user | Returns HTTP 429 `{ error: 'Rate limited. Try again later.' }` if `recentReads >= 1`. This route has no Upstash/Redis dependency — it works even if `UPSTASH_REDIS_REST_URL/TOKEN` are unset. |

- `lib/rate-limit.ts` is the shared, newer, per-route limiter factory
  (`makeLimiter(prefix, tokens, window)`), designed to replace ad-hoc inline
  limiters like the one still in `/api/formulate`. As of this verification
  only `app/api/og/noseprint/route.tsx` uses it — `/api/formulate` has not
  yet been migrated to it (still has its own inline `Ratelimit` instance).
- **Unguarded LLM routes** (per repo `CLAUDE.md` §7 open-problems and the
  dossier): `dna-match`, `sommelier`, `chemist`, `smells-like`,
  `clone-confidence`, `pros-cons` call Anthropic directly with no rate limit
  of any kind. This is a known, named cost-exposure gap, not an oversight
  you need to "discover" — but also not yet fixed. If asked to add
  protection to one of these, prefer `lib/rate-limit.ts` (the shared module)
  over another inline `Ratelimit` instance, to avoid a third bespoke pattern.
- Local dev without Upstash env vars: `lib/rate-limit.ts`'s `redis` is `null`,
  `makeLimiter` returns `null`, `enforce()` returns `true` unconditionally —
  rate limiting is a deliberate no-op locally, not a bug.

Re-verify:
```
grep -rn "Ratelimit\|makeLimiter\|enforce(" app/api/formulate/route.ts app/api/og/noseprint/route.tsx lib/rate-limit.ts
grep -n "recentReads\|Rate limited" app/api/read/generate/route.ts
```

## 6. Image strategy — image_url with family-gradient fallback

- `fragrances.image_url` is nullable. Roughly 53k of 127,595 rows have a
  real image (per dossier/CLAUDE.md — re-verify row count with a live query
  if it matters for a decision, this drifts constantly as enrichment scripts
  run).
- Fallback: `lib/familyGradients.ts` → `getFamilyGradient(family)`. Matches
  the free-text `family` string by substring against a fixed keyword list
  (floral, fresh/aqua/marine/citrus, woody, oriental/amber/spicy,
  fougere/aromatic, musk/powder, green/herbal, gourmand/sweet, oud) and
  returns a CSS `linear-gradient` built from `--family-*` CSS variables
  (`lib/design/tokens.css`), falling back further to `DEFAULT_GRADIENT` if no
  keyword matches or `family` is null.
- Consumers: `components/ui/GradientPlaceholder.tsx`,
  `components/discover/FragranceCardMedia.tsx`,
  `components/collection/OptimizedBottleCard.tsx`,
  `components/brief/OccasionPicker.tsx`. Any new fragrance-card component
  must go through one of these, not a raw `<img>` with no fallback — that
  will render a broken image icon for the ~74k rows still without
  `image_url`.
- `image_url` is the override, not the norm — repo `CLAUDE.md` §7 states this
  explicitly. Do not build a feature that assumes `image_url` is always
  present.
- Any new external image host reaching `image_url` needs an entry in
  `next.config.ts` `remotePatterns` in the *same commit* — the pre-push hook
  (`.husky/pre-push`) blocks pushes where a script has an
  `@image-domains:` comment listing a hostname not present in
  `remotePatterns`. See sibling skill `shopify-image-enrichment` for the
  enrichment-script side of this.

Re-verify: `grep -n "FAMILY_CATEGORIES\|DEFAULT_GRADIENT" lib/familyGradients.ts`

## 7. The disabled Vertex Imagen route

- `app/api/generate-image/route.ts` — originally built to call Google Cloud
  Vertex AI Imagen 3.0 for on-demand fragrance image generation.
- Disabled in commit `205b64c` ("fix(api): disable Vertex AI image
  generation route — stops Google billing"), with a follow-up copy edit in
  `d13bf7a`.
- Current behavior: the route still exists and still has the full Vertex
  AI/OAuth2/GCS code path above the return, but every request short-circuits
  to:
  ```
  return NextResponse.json(
    { success: false, error: 'Image generation disabled in MVP.' },
    ...
  )
  ```
  (verified at `app/api/generate-image/route.ts:186-187`).
- Not called from anywhere in `app/` or `components/` — confirmed via grep,
  zero UI call sites. It is dead code from the UI's perspective; only
  reachable if someone calls the API route directly.
- Do not re-enable by deleting the early return without first checking:
  (a) whether Google Cloud billing for this project is still a concern, and
  (b) whether OAuth2 credentials (`~/.gemini/oauth_creds.json` per the file's
  own header comment) are even valid anymore. This is a "someone made an
  explicit decision to stop paying for this" disablement, not a leftover.

Re-verify: `git log --oneline -- app/api/generate-image/route.ts` and `grep -n "disabled in MVP" app/api/generate-image/route.ts`

## 8. Checklist — adding a new env var or flag

1. Add it to `.env.example` with a placeholder value and a one-line comment
   — this file is the map for the next engineer/agent; several current vars
   (`NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_KEY`, `PUSH_BROADCAST_SECRET`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) are missing from it today — don't
   repeat that gap.
2. Decide the fallback behavior explicitly before writing the code: does the
   feature (a) hard-fail loudly, (b) no-op silently, or (c) fall back to a
   default? Prefer (a) for anything security- or billing-relevant, (c) for
   anything cosmetic (see `familyGradients.ts` as the good pattern).
3. If it's a `NEXT_PUBLIC_*` flag gating a paid/premium feature: stop and
   check whether it's global (affects all users) or should be per-user. A
   global flag controlling monetization is the exact footgun in §3 — do not
   add a second one without a per-user entitlement design.
4. If the feature calls an external paid API (Anthropic, Google, AWIN,
   Shopify, Upstash): add rate limiting via `lib/rate-limit.ts`
   (`makeLimiter`/`enforce`) rather than a new inline `Ratelimit` instance —
   don't add a fourth bespoke pattern alongside `/api/formulate`'s inline one.
5. If the new var/flag introduces a new external image host: add it to
   `next.config.ts` `remotePatterns` in the same commit, and to any script's
   `@image-domains:` comment if applicable — the pre-push hook enforces this.
6. Update this table (§1) in the same PR. A config skill that's out of date
   is worse than no skill — it will be trusted and wrong.
7. Run the re-verification grep in §9 before merging to confirm nothing else
   already reads the same name with different casing/prefix (e.g. the
   `SUPABASE_SERVICE_KEY` vs `SUPABASE_SERVICE_ROLE_KEY` duplication already
   in this repo — don't add a third name for the same secret).

## 9. When NOT to use this skill

- Schema/RLS/migration questions → `supabase` skill or repo
  `docs/nota/04-architecture-plan.md`.
- Next.js/Supabase SSR mechanics (cookies, middleware vs proxy, image
  hostname errors) → `nextjs16-supabase-conventions`.
- UI/UX state design (loading/error/empty states) → `ux-interaction-standard`.
- Fragrance domain facts (families, projection enum, personas) →
  `fragrance-domain-reference`.
- Past incidents / "why did X break before" → `nota-failure-archaeology`.
- Shopify brand-catalog matching for enrichment scripts →
  `shopify-image-enrichment` (that skill is about verifying a brand's
  storefront before scripting; this skill's §4 is about the runtime
  graceful-null contract in `lib/shopify.ts`).

## Provenance and maintenance

Derived from, 2026-07-05:
- `.env.example`
- `lib/affiliates.ts`, `lib/subscription.ts`, `lib/shopify.ts`,
  `lib/rate-limit.ts`, `lib/familyGradients.ts`
- `app/api/formulate/route.ts`, `app/api/og/noseprint/route.tsx`,
  `app/api/read/generate/route.ts`, `app/api/generate-image/route.ts`,
  `app/api/push/send/route.ts`, `app/api/spritz/generate/route.ts`
- `app/page.tsx`, `app/(main)/boxes/[slug]/BoxDetailClient.tsx`
- `utils/supabase/{client,server,middleware}.ts`
- `scripts/smoke-test.mjs`, `scripts/enrich-images-google.mjs`,
  `scripts/fetch-fragrance-images.mjs`
- repo `CLAUDE.md` §2, §7, §9, §12 (Phase 5 rate-limiting baseline)
- `git log` on `app/api/generate-image/route.ts` (commits `205b64c`,
  `d13bf7a`)

Re-verification commands (run all before trusting this file after drift):
```
# Full env var inventory — the ground truth for §1
grep -rn "process\.env\." --include="*.ts" --include="*.tsx" --include="*.mjs" app/ lib/ scripts/ | grep -oE "process\.env\.[A-Z0-9_]+" | sort -u

# AWIN state
grep -n "AWIN_MID_\|isActive\|AWIN_PUBLISHER_ID" lib/affiliates.ts

# Pro gate
grep -n "BETA_MODE\|getIsPro" lib/subscription.ts app/page.tsx

# Shopify graceful null
grep -n "STOREFRONT_API_KEY\|not configured" lib/shopify.ts

# Rate limiting — which routes actually use which mechanism
grep -rln "Ratelimit\|makeLimiter\|enforce(" app/api/ lib/rate-limit.ts
grep -n "recentReads\|Rate limited" app/api/read/generate/route.ts

# Image fallback
grep -n "FAMILY_CATEGORIES\|DEFAULT_GRADIENT" lib/familyGradients.ts

# Vertex Imagen disable status
grep -n "disabled in MVP" app/api/generate-image/route.ts
git log --oneline -- app/api/generate-image/route.ts
```

If any of these commands produce output that contradicts a table row above,
trust the command output, not this file — then fix this file in the same
change.
