# CLAUDE.md — nota. System Memory

> **Living factual memory for the nota. product.** Created 2026-07-04 (Phase 0 of pre-launch audit).
> Where this disagrees with older docs (AGENTS.md branding, PRODUCT_TRUTH.md, executive-suite), **this wins** — except AGENTS.md §8–§9 operational lessons (L1–L17), git hygiene, and deploy rules, which remain binding and are incorporated by reference. Read AGENTS.md for those.
> Update this file at the end of every working phase. Never assert a fact you haven't verified against repo, DB, or deploy.

## 1. Identity & doctrine

- **Product:** **nota.** — lowercase, with the dot. A personal scent identity system: understands, reflects, and evolves a user's scent identity over time. NOT a marketplace/review site/influencer platform.
- **Core rule:** "If it's not personalised, it shouldn't exist."
- **Emotional loop:** understands me → reflects me → evolves me → connects me to others.
- **Tone:** calm, intelligent, observational, slightly playful, restrained. No hype, no luxury clichés, no generic AI language.
- **2036 test:** reject anything trendy or clever-for-its-own-sake.
- **Rebrand history:** Scentral → BaseNote → AnotherSense (docs only) → **nota.** (2026-07-04, per founder brief; the brief is the doctrine source — no separate handover doc exists in-repo). Repo stays `scentral-hub`, DB stays `scentral-mvp` (`lrkdwobnemczvhpixpky`), internal names unchanged.
- **⚠️ Rebrand debt (verified 2026-07-04):** `app/layout.tsx` metadata still says "BaseNote"; `lib/affiliates.ts` header says BaseNote; `docs/PRODUCT_TRUTH.md` says AnotherSense and claims 282 fragrances (live count: 127,595). The Read prompt (`app/api/read/generate/route.ts:61`) already says "nota." — the only place the new name exists in code.

## 2. Stack (verified from repo, 2026-07-04)

Next.js 16.2.9 (App Router, route groups `(main)` `(community)` `(account)`), React 19.2, Tailwind 4 + CSS variables, Supabase JS 2.110 + `@supabase/ssr`, `@anthropic-ai/sdk` 0.110, `@google/genai`, dnd-kit, framer-motion, Sentry, PostHog, web-push. Vercel → `scentral-hub.vercel.app` (deploy explicitly: `npx vercel --prod`; webhook unreliable). PWA (manifest + splash icons).
**Domain:** `notalabs.io` purchased 2026-07-04 via Shopify — NOT yet pointed at Vercel. Until DNS cutover, all code fallbacks stay on `scentral-hub.vercel.app`; after cutover, set `NEXT_PUBLIC_SITE_URL=https://notalabs.io` in Vercel env (used by `app/layout.tsx` metadataBase + `NoseprintClient` share links) and repoint `scripts/smoke-test.mjs` / `package.json` `test:smoke:prod`.

## 3. Identity model — ⚠️ MIXED, needs resolution

- **New system (current):** real Supabase Auth via `@supabase/ssr` cookies (`utils/supabase/server.ts`, `app/login`). All nota-era tables key on `user_id uuid` → `auth.users`.
- **Legacy system:** `scentral_anon_id` localStorage UUID; `user_xp` / `user_streaks` still key on `anon_id text`. Wishlist exists BOTH as `scentral_wishlist` localStorage AND `collections.status='wishlist'`.
- Signed-out users get empty-state Shelf (`ShelfClient slots=[] isSignedIn={false}`).

## 4. Route surface (verified `find app -name page.tsx`, 2026-07-04)

**nota. core:** `/read` (The Read — feeling-chip flow → Haiku identity reveal), `/noseprint` (identity artefact + OG share `app/api/og/noseprint`), `/shelf` (Top-N ranked shelf) + `/shelf/blind` + `/shelf/blind/[sessionId]` (blind ranking), `/traces` (community posts), `/trails` + `/trails/[slug]` (guided journeys, TrailPlayer), `/insights`, `/you`.
**Catalogue:** `/discover`, `/collection` + `/collection/[id]` (Living Wardrobe, dnd-kit — `cabinetSnapshot` CustomEvent must NEVER be removed), `/compare`, `/clones`, `/notes`, `/ingredients/[slug]`, `/dna-match`, `/wheel`, `/layering`, `/scanner`.
**Engagement/commerce:** `/spritz` (XP/streaks), `/boxes` + `/boxes/[slug]` (discovery boxes → Shopify), `/social`, `/wear-and-share`, `/creators/[username]`, `/creator`, `/schedule` (legacy), `/intelligence`, `/pro`, `/profile`.
**System:** `/`, `/onboarding`, `/login`, `/learning`, `/ritual/[id]`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer`, `/admin/enrichment`, `/admin/feedback`.
**~58 API routes** under `app/api/` incl. `read/generate`, `shelf`, `blind-ranking/{session,place,reveal}`, `traces`, `trails/progress`, `temptations`, `evolution/detect`, `insights`, `aura`, `og/*`.

## 5. Database (live schema verified via Supabase MCP, 2026-07-04)

37 public tables, all RLS-enabled. `fragrances` = **127,595 rows** (`plain_description`, `inspired_by`, `family`, `projection`, `optimal_season`, `use_case`, `lean`, `image_url`, `popularity_rank`; GIN trigram indexes on name/brand/description/inspired_by). `projection` valid values ONLY: Beast Mode, Strong, Moderate, Medium, Weak.

**nota-era tables (all `user_id uuid`):**
- `noseprints` — name, descriptor, read_text, signals jsonb, matches uuid[], stretch_note, status ('current').
- `shelf_items` — fragrance_id, **rank int (1–10)**, source ('noseprint_match'|'manual'|'blind_ranking'), locked bool. **No tier column, no blind_buy, no eligibility constraint.**
- `shelf_events` — audit trail (added/removed/rank_changed/replaced/returned).
- `blind_ranking_sessions` (fragrance_pool uuid[], revealed_at) + `blind_ranking_choices` (placed_rank).
- `traces` (trace_type, body, image_url) + `trace_reactions`.
- `trails` (slug, published) + `trail_steps` (position, step_type, content jsonb) + `trail_progress`.
- `temptations` (reason, status shown/resolved), `evolution_events` (from/to_noseprint, choice, trigger_signals), `interactions` (event_type/entity/metadata — general event log), `insights_cache` (payload jsonb per user+period), `aura_cache` (fragrance_id+context, 24h expiry).
- `houses`, `profiles` (username, house_id, onboarding_completed_at).

**Legacy-era:** `collections` (status 'owned'|'wishlist' only — **no 'tested'/'past_purchase'**; wear_state, shelf_tier int default 2, affinity_score int default 50, scent_memory), `wear_logs` (keyed collection_id), `user_xp`/`user_streaks` (anon_id text PK), `spritz_schedules`, `wear_posts`, `post_likes`, `creator_reels`, `layering_*`, `chemist_cache`, `sommelier_cache`, `discovery_boxes` (9 rows), `fragrance_notes` (56), `description_enrichment_queue`, `pending_contributions`, `feedback`, `waitlist`.

**⚠️ Two competing shelf models:** `shelf_items.rank` (nota Shelf) vs `collections.shelf_tier` + `affinity_score` (Living Wardrobe). Both live. Seeding bridges them (`app/(main)/shelf/page.tsx:seedShelfItems`).

## 6. My Shelf — current implementation vs. spec

- **Current:** 10 slots (SHELF_SIZE=10 in `app/(main)/shelf/page.tsx` AND `app/api/shelf/route.ts`). Seeded once: top-3 noseprint matches + owned collections by tier/affinity. Actions: add/remove/reorder (two-phase negative-rank update)/replace, all audited to `shelf_events` + `interactions`.
- **Spec (founder brief):** **20 slots in 4 tiers** — S (1–5), A (6–10), B (11–15), C (16–20, at-risk). Eligibility: only Tested/Own/Past-Purchase fragrances, **enforced in data model**. Blind-buy = distinct BB stamp. Shareable to Traces now, social OG later.
- **Gap:** size 10→20, no tiers, no eligibility statuses in `collections.status`, no BB flag, no DB constraint.

## 7. LLM / cost posture (verified)

- **The Read:** 1× Claude Haiku call per user per Read (`app/api/read/generate`) — acceptable.
- **Aura advisory:** moved to Supabase Edge Function (`supabase/functions/aura-advisory/`), cached in `aura_cache` (24h TTL).
- **Insights:** `insights_cache` precomputed pattern. Chemist/Sommelier: cached tables.
- **Rule:** no per-fragrance LLM calls, no per-request LLM in UI paths. Batch/queue heavy work (`description_enrichment_queue` + `/admin/enrichment` review UI exist).
- **Images at 127k:** bulk URL-guess enrichment yields ~0.09% (53k-row run, 2026-07-03; miss log `scripts/data/image-misses.txt`, 249k entries). **Default = family gradients** (`lib/familyGradients.ts` + `--family-*` tokens); `image_url` is the override, not the norm. Every new image host needs `next.config.ts` remotePatterns (L16).

## 8. Design primitives (verified in code)

- **Fonts:** Unbounded (nav/functional, next/font) + **Cormorant Garamond italic** (emotional/display, self-hosted woff2, `--font-display`). NOTE: older docs say Instrument Serif — code says Cormorant Garamond.
- **Colour:** light parchment palette in `:root` (`--color-bg #F7F3EE`, primary gold `#B8913A`) but `app/layout.tsx` hardcodes `data-theme="dark"` → effective default is dark slate `#0F172A` + gold. Tokens bridged: `lib/design/tokens.css` aliases `--bg/--surface/--text/--accent` to `--color-*` in `app/globals.css`.
- **Motion tokens:** `--motion-instant` 80ms / `--motion-responsive` 200ms / `--motion-ceremonial` 480ms / `--motion-organic` 800ms (+ legacy `--motion-fast/base`). Brief's motion verbs: reveal, drift, morph, fade, settle, breathe.
- **Other:** glassmorphism (`--glass-*`), 8-layer `--shadow-object`, radius `--r-card 12px`/pill buttons, spacing `--sp-1..5`, fluid type scale (`--text-display` etc.), family gradient tokens.
- **UI kit:** `components/ui/` (Button, Sheet, Card, Chip, EmptyState, ProGate, ErrorInline, LoadingShimmer, CompareBar…), Temptations (`components/temptations/`), Aura (`components/aura/`).

## 9. Monetisation wiring (verified)

- **AWIN affiliate** (`lib/affiliates.ts`): publisher ID 2955445 approved 2026-06-28; merchant IDs Notino/Douglas/FeelUnique = 'PENDING' → links fall back to plain search URLs (functional, no commission). Clean `isActive` abstraction.
- **Shopify Storefront** (`lib/shopify.ts`): env-driven (`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_KEY`), graceful null when unconfigured. Consumed by `/boxes`.
- **Pro gating:** `getIsPro()` is a global `NEXT_PUBLIC_BETA_MODE` flag, not per-user (known footgun; no Stripe).

## 10. Personas & XP

- 6 scent-identity personas in `lib/personas.ts` (canonical, never inline).
- XP 6 levels (0/100/300/600/1000/1500); writes `user_xp` + `as_xp` localStorage.
- Customer personas: Gavin (newcomer), Christopher (enthusiast) — `SCENTRAL_PERSONAS.md`.

## 11. Operational rules (binding, from AGENTS.md — do not relearn these the hard way)

1. Pre-push hook in `.husky/` + `core.hooksPath=.husky` (blocks tsc failures & module-scope `createClient()` in `app/api` — L15).
2. `npm run build` locally before any push to main. Deploy = `npx vercel --prod`, check `▲ Aliased` line (L14).
3. New external image domains → `next.config.ts` remotePatterns in the same commit (L16).
4. E2e text selectors break on copy changes — prefer `getByRole` (L17); run `npm run test:e2e -- --project=chromium` after copy changes.
5. Never `git reset --hard` without checking `git status` (L15). Never module-level Supabase clients in API routes.
6. Migrations: SHOW SQL, wait for explicit "approved" before applying.
7. No secrets in code; `.env.local` only. Scripts follow §8.5 security rules in AGENTS.md.
8. Never remove the `cabinetSnapshot` CustomEvent in WardrobeShelf.
9. Batch scripts need a yield circuit-breaker (enrich-images.mjs pattern: <1% hit rate after 1k rows → stop).

## 12. Phase log

- **Phase 0 (2026-07-04):** Repo/schema digested. Key findings: Shelf 10-not-20 with no tiers/eligibility/BB; mixed identity model (auth uuid vs anon_id text); dual shelf models; dual wishlist; rebrand debt (BaseNote metadata); typography drift (Cormorant Garamond vs documented Instrument Serif); PRODUCT_TRUTH.md stale (282 vs 127,595 fragrances); affiliate/Shopify abstractions clean and launch-ready pending IDs.
- **Phase 1 (2026-07-04):** CX audit → `docs/nota/01-cx-journey-audit.md`. Headline: nota core loop absent from main nav; landing tone violates doctrine; Shelf flat/ungated/unshared; Tested state missing. 14 UX findings.
- **Phase 2 (2026-07-04):** Brand pack + DS audit → `docs/nota/02-brand-pack.md`, `03-design-system-audit.md`. Wordmark Route A (minimal humanist, gold dot); dot state machine defined; Unbounded off-doctrine; ~130 hardcoded hex; lean `--nota-*` token proposal. 8 DS findings.
- **Phase 3 (2026-07-04):** Architecture → `docs/nota/04-architecture-plan.md`. RLS verified sound; 7 DB-### proposed changes (SQL shown, NOT applied — eligibility statuses, blind_buy, 20-rank tier model + trigger, wishlist consolidation, swap tables); 3-tier image strategy; LLM posture clean (one server-side regen cap needed).
- **Migrations approved & applied (2026-07-04):** Founder approved Deliverable D §2. Live DB now has: collections status incl. 'tested'/'past_purchase' (pre-existed — Phase 0's "only owned/wishlist" was code usage, not the constraint); shelf_items.blind_buy + tier (generated) + rank_range ±20 + enforce_shelf_eligibility trigger + set_blind_buy_on_reveal trigger (applied by a concurrent session working the same plan); legacy 1–10 rank check dropped + swap_offers table w/ RLS (applied this session, mirrored in supabase/migrations/20260704_*). App still SHELF_SIZE=10 — Shelf v2 (20-slot tiers UI, eligibility-filtered search) is the next build item.
- **Phase 4 (2026-07-04):** Backlog + safe diffs → `docs/nota/05-recommendations-backlog.md`. Applied: full display-layer rebrand BaseNote→nota. (~30 files, display strings/metadata/OG only), "My Shelf" heading rename. Verified: `tsc --noEmit` + `npm run build` pass; live preview shows zero "BaseNote" on landing. NOT done (need approval): all migrations, nav rebuild, font swap, marquee rewrite.
