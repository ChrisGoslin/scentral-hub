# CLAUDE.md — nota. System Memory

> **Living factual memory for the nota. product.** Created 2026-07-04 (Phase 0 of pre-launch audit).
> **Updated 2026-07-08:** scentral + scentral-hub consolidated into nota (Phase 6).
> Where this disagrees with older docs (AGENTS.md branding, PRODUCT_TRUTH.md, executive-suite), **this wins** — except AGENTS.md §8–§9 operational lessons (L1–L17), git hygiene, and deploy [...]
> Update this file at the end of every working phase. Never assert a fact you haven't verified against repo, DB, or deploy.

## 1. Identity & doctrine

- **Product:** **nota.** — lowercase, with the dot. A personal scent identity system: understands, reflects, and evolves a user's scent identity over time. NOT a marketplace/review site/influence[...]
- **Core rule:** "If it's not personalised, it shouldn't exist."
- **Emotional loop:** understands me → reflects me → evolves me → connects me to others.
- **Tone:** calm, intelligent, observational, slightly playful, restrained. No hype, no luxury clichés, no generic AI language.
- **2036 test:** reject anything trendy or clever-for-its-own-sake.
- **Rebrand history:** the current user-facing brand is **nota.** (2026-07-04, per founder brief; the brief is the doctrine source). Older names may still exist in archived history, but should not be reintroduced into current product surfaces.
- **Consolidation (2026-07-08):** Two repos (`scentral`, `scentral-hub`) merged into single canonical repo. `scentral` archived (read-only). See MERGE_SUMMARY.md.
- **Rebrand debt (RESOLVED 2026-07-08):** All display strings updated to nota. Current product surfaces should not reintroduce retired names.

## 2. Stack (verified from repo, 2026-07-04; updated 2026-07-08 post-merge)

Next.js 16.2.9 (App Router, route groups `(main)` `(community)` `(account)`), React 19.2.7, Tailwind 4 + CSS variables, Supabase JS 2.110 + `@supabase/ssr`, `@anthropic-ai/sdk` 0.110, `@google/genai` 2.10, Playwright 1.60 (e2e). TypeScript 6.
**Domain:** `notalabs.io` purchased 2026-07-04 via Shopify — NOT yet pointed at Vercel. Until DNS cutover, code fallback = `nota.vercel.app` (post-consolidation); after cutover, set `NEXT_PUBLIC_SITE_URL=https://notalabs.io` in Vercel env.

## 3. Identity model — ⚠️ MIXED, needs resolution

- **New system (current):** real Supabase Auth via `@supabase/ssr` cookies (`utils/supabase/server.ts`, `app/login`). All nota-era tables key on `user_id uuid` → `auth.users`.
- **Legacy system:** `scentral_anon_id` localStorage UUID; `user_xp` / `user_streaks` still key on `anon_id text`. Wishlist exists BOTH as `scentral_wishlist` localStorage AND `collections.status=[...]
- Signed-out users get empty-state Shelf (`ShelfClient slots=[] isSignedIn={false}`).

## 4. Route surface (verified `find app -name page.tsx`, 2026-07-04)

**nota. core:** `/read` (The Read — feeling-chip flow → Haiku identity reveal), `/noseprint` (identity artefact + OG share `app/api/og/noseprint`), `/shelf` (Top-N ranked shelf) + `/shelf/blin[...]
**Catalogue:** `/discover`, `/collection` + `/collection/[id]` (Living Wardrobe, dnd-kit — `cabinetSnapshot` CustomEvent must NEVER be removed), `/compare`, `/clones`, `/notes`, `/ingredients/[s[...]
**Engagement/commerce:** `/spritz` (XP/streaks), `/boxes` + `/boxes/[slug]` (discovery boxes → Shopify), `/social`, `/wear-and-share`, `/creators/[username]`, `/creator`, `/schedule` (legacy), `[...]
**System:** `/`, `/onboarding`, `/login`, `/learning`, `/ritual/[id]`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer`, `/admin/enrichment`, `/admin/feedback`.
**~58 API routes** under `app/api/` incl. `read/generate`, `shelf`, `blind-ranking/{session,place,reveal}`, `traces`, `trails/progress`, `temptations`, `evolution/detect`, `insights`, `aura`, `og/[...]

## 5. Database (live schema verified via Supabase MCP, 2026-07-04; table count re-verified 2026-07-27)

**41 public tables** (was 37 as of 2026-07-04; drifted undetected for weeks — see `docs/lessons.md` L69 and the `db-table-usage-audit` skill for the per-table usage audit this correction came from), all RLS-enabled. `fragrances` = **127,595 rows** (`plain_description`, `inspired_by`, `family`, `projection`, `optimal_season`, `use_case`, `lean`, `image_url`, `popularity_rank`[...]

**nota-era tables (all `user_id uuid`):**
- `noseprints` — name, descriptor, read_text, signals jsonb, matches uuid[], stretch_note, status ('current').
- `shelf_items` — fragrance_id, **rank int (±20, ≠0 — negative = transient during two-phase reorder)**, `tier` text GENERATED from rank (S 1–5 / A 6–10 / B 11–15 / C 16–20), `blind_[...]
- `shelf_events` — audit trail (added/removed/rank_changed/replaced/returned).
- `blind_ranking_sessions` (fragrance_pool uuid[], revealed_at) + `blind_ranking_choices` (placed_rank).
- `traces` (trace_type, body, image_url) + `trace_reactions`.
- `trails` (slug, published) + `trail_steps` (position, step_type, content jsonb) + `trail_progress`.
- `temptations` (reason, status shown/resolved), `evolution_events` (from/to_noseprint, choice, trigger_signals), `interactions` (event_type/entity/metadata — general event log), `insights_cache[...]
- `houses`, `profiles` (username, house_id, onboarding_completed_at).

**Legacy-era:** `collections` (status enum includes **'owned'/'wishlist'/'tested'/'past_purchase'** — confirmed live via `supabase/migrations/20260704_db001_collections_status_enum.sql`; the "no tested/past_purchase" claim that used to live on this line was wrong, per this doc's own Phase 0 correction log below — don't reintroduce it; wear_state, shelf_tier int default 2, affinity_score int default 50, scent_memory), `wear_logs` ([...]

**⚠️ Two competing shelf models:** `shelf_items.rank` (nota Shelf) vs `collections.shelf_tier` + `affinity_score` (Living Wardrobe). Both live. Seeding bridges them (`app/(main)/shelf/page.tsx[...]

## 6. My Shelf — current implementation vs. spec

- **Current (corrected 2026-07-27 — was stale, said 10):** **20 slots** — `SHELF_SIZE=20` confirmed live in both `app/(main)/shelf/page.tsx:15` and `app/api/shelf/route.ts:13`. Seeded once: top-3 noseprint matches + owned collections by tier/affinity. Actions: add/remove/[...]
- **Spec (founder brief):** **20 slots in 4 tiers** — S (1–5), A (6–10), B (11–15), C (16–20, at-risk). Eligibility: only Tested/Own/Past-Purchase fragrances, **enforced in data model**.[...]
- **Gap (RESOLVED 2026-08-24 — was stale, previously said tier/blind_buy were never wired):** DB layer is DONE (tiers, BB, eligibility trigger, ±20 ranks), app-layer SHELF_SIZE is 20, matching spec, and `shelf_items.tier`/`shelf_items.blind_buy` are now selected and rendered end-to-end — confirmed live in `app/(main)/shelf/page.tsx` (select + thread through `buildSlots`/`normalizeFragrance`) and `app/(main)/shelf/ShelfClient.tsx` (four tier-labeled S/A/B/C section rows via `tierForRank()`, "Blind buy" stamp on `FilledSlot` when `blind_buy` is true). Landed in commit `8904a79` ("Wire shelf_items.tier and blind_buy into the Shelf UI") on `main` — verify with `grep -n "tier\|blind_buy" "app/(main)/shelf/page.tsx" "app/(main)/shelf/ShelfClient.tsx"` if this drifts again. `app/api/shelf/route.ts` GET now also returns the current user's eligible fragrance ids (owned/tested/past_purchase) for the search-sheet eligibility UX.

## 7. LLM / cost posture (verified)

- **The Read:** 1× Claude Haiku call per user per Read (`app/api/read/generate`) — acceptable.
- **Aura advisory:** moved to Supabase Edge Function (`supabase/functions/aura-advisory/`), cached in `aura_cache` (24h TTL).
- **Insights:** `insights_cache` precomputed pattern. Chemist/Sommelier: cached tables.
- **Rule:** no per-fragrance LLM calls, no per-request LLM in UI paths. Batch/queue heavy work (`description_enrichment_queue` + `/admin/enrichment` review UI exist).
- **Images at 127k:** bulk URL-guess enrichment yields ~0.09% (53k-row run, 2026-07-03; miss log `scripts/data/image-misses.txt`, 249k entries). **Default = family gradients** (`lib/familyGradient[...]

## 8. Design primitives (verified in code)

- **Fonts:** **IBM Plex Sans** is the body/UI font (`app/layout.tsx` imports `IBM_Plex_Sans` and exposes `--font-ibm-plex`; `app/globals.css` maps `--font-body`/`--font-ui` to it). **Instrument Serif** remains the emotional/display font via `--font-display`, falling back to self-hosted Cormorant Garamond woff2 then Georgia if Instrument Serif fails to load. Verified 2026-08-11 against `app/layout.tsx` and `app/globals.css`.
- **Colour:** light parchment palette in `:root` (`--color-bg #F7F3EE`, primary gold `#B8913A`) but `app/layout.tsx` hardcodes `data-theme="dark"` → effective default is dark slate `#0F172A` + g[...]
- **Motion tokens:** `--motion-instant` 80ms / `--motion-responsive` 200ms / `--motion-ceremonial` 480ms / `--motion-organic` 800ms (+ legacy `--motion-fast/base`). Brief's motion verbs: reveal, d[...]
- **Other:** glassmorphism (`--glass-*`), 8-layer `--shadow-object`, radius `--r-card 12px`/pill buttons, spacing `--sp-1..5`, fluid type scale (`--text-display` etc.), family gradient tokens.
- **UI kit:** `components/ui/` (Button, Sheet, Card, Chip, EmptyState, ProGate, ErrorInline, LoadingShimmer, CompareBar…), Temptations (`components/temptations/`), Aura (`components/aura/`).

## 9. Monetisation wiring (verified)

- **AWIN affiliate** (`lib/affiliates.ts`): publisher ID 2955445 approved 2026-06-28; merchant IDs Notino/Douglas/FeelUnique = 'PENDING' → links fall back to plain search URLs (functional, no co[...]
- **Shopify Storefront** (`lib/shopify.ts`): env-driven (`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_KEY`), graceful null when unconfigured. Consumed by `/boxes`.
- **Pro gating:** `getIsPro()` is a global `NEXT_PUBLIC_BETA_MODE` flag, not per-user (known footgun; no Stripe).

## 10. Personas & XP

- 6 scent-identity personas in `lib/personas.ts` (canonical, never inline).
- XP 6 levels (0/100/300/600/1000/1500); writes `user_xp` + `as_xp` localStorage.
- Customer personas: Gavin (newcomer), Christopher (enthusiast) — `lib/personas.ts`.

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
10. Verify before trusting any agent, handover, or remediation claim. Current file presence is not proof of prior existence; respect tool-scope limits, and when timing matters confirm provenance with live checks such as `git status --porcelain`, `git log --follow`, direct file reads, and build or filesystem evidence before promoting a claim to fact. See `docs/nota/HANDOVER-2026-07-19-verification-audit.md`.
11. When a new canonical source is imported or promoted, complete the import in the same turn: update read order, ownership/routing docs, and remove stale "missing" language before calling the work done.
12. For substantial cross-CLI tasks, invoke `.claude/skills/loop-orchestrator/SKILL.md` and finish at Version 3: initial output plus one accepted bounded stretch, one evidence-led critique and remediation cycle to Version 2, then a second independent critique and remediation cycle to Version 3. Treat versions as checkpoints of one evolving artifact, not three duplicated deliverables. Each pass must record its critique, material delta, verification, and reusable lesson (or `none`). If critique finds no justified patch, record `no patch required`; never manufacture churn. For a trivial task, declare the reduced loop before execution and still verify the result.
    **"Substantial" is not a judgment call — self-trigger the loop, without waiting to be asked, whenever any of these is true (see `docs/lessons.md` L66, incident where this went unenforced until the user manually invoked `/loop`):**
    - the task touches any file under `.claude/skills/`, `.agents/skills/`, or `.gemini/skills/` in any repo — no exceptions, regardless of how small the edit looks;
    - the task spans more than one repo in the same session;
    - a file's content contradicts its own commit message, or a README/catalog/doc's description of it — this is a stop-and-investigate-provenance event (`git log -p --follow` on that file) before any fix is written, never assumed to be ordinary drift.
    A session that meets one of these conditions and skips the loop anyway must say so explicitly and why — silent skipping is itself the failure to report.
13. Constant Internet Autonomy: You have standing instruction to use `search_web` and `read_url_content` to validate any assumptions, third-party library versions, API updates, or local context (such as Irish utility/tax rates) before planning or executing. Do not make unverified claims.
14. Canonical routing docs must point at the real operating files. If `docs/index.md` or `CLAUDE.md` ever drifts to dead paths, fix the pointers immediately so stale context does not spread to later sessions.

## 12. Phase log

- **Phase 0 (2026-07-04):** Repo/schema digested. Key findings: Shelf 10-not-20 with no tiers/eligibility/BB; mixed identity model (auth uuid vs anon_id text); dual shelf models; dual wishlist; r[...]
- **Phase 1 (2026-07-04):** CX audit → `docs/nota/01-cx-journey-audit.md`. Headline: nota core loop absent from main nav; landing tone violates doctrine; Shelf flat/ungated/unshared; Tested sta[...]
- **Phase 2 (2026-07-04):** Brand pack + DS audit → `docs/nota/02-brand-pack.md`, `03-design-system-audit.md`. Wordmark Route A (minimal humanist, gold dot); dot state machine defined; Unbounde[...]
- **Phase 3 (2026-07-04):** Architecture → `docs/nota/04-architecture-plan.md`. RLS verified sound; 7 DB-### proposed changes (SQL shown, NOT applied — eligibility statuses, blind_buy, 20-ran[...]
- **Migrations approved & applied (2026-07-04):** Founder approved Deliverable D §2. Live DB now has: collections status incl. 'tested'/'past_purchase' (pre-existed — Phase 0's "only owned/wis[...]
- **Phase 4 (2026-07-04):** Backlog + safe diffs → `docs/nota/05-recommendations-backlog.md`. Applied: full display-layer rebrand to nota. (~30 files, display strings/metadata/OG only),[...]
- **Phase 5 (2026-07-04):** Testing/security/abuse layer → `docs/nota/06-testing-security-abuse.md` + three living skills (`.claude/skills/{qe-automation,security-hardening,resilience-abuse}/`,[...]
- **Phase 6 (2026-07-08):** Repository consolidation: `scentral` + `scentral-hub` → **nota** (single canonical repo). Deduplicated code/deps, archived legacy docs to `docs/ARCHIVE/`, updated Sentry org ID. See MERGE_SUMMARY.md.
- **Phase 7 — backlog clearance, six-agent sibling effort (2026-08-26):** Six sibling agents (Tracks A–F) each cleared a slice of `docs/nota/05-recommendations-backlog.md` on branch `claude/backlog-clearance-sibling-agents-7zt8vb`; this entry records the combined final verification pass. **Verified clean:** `npm run build` (0 errors), `npm run test:unit` (28 pass / 6 fail — all 6 failures pre-existing in `tests/spikes/*.ts`, unrelated broken cross-imports, known-expected per prior track report). **Confirmed cleared this effort:** Shelf tier/blind_buy UI (was already shipped, doc corrected); security headers + rate limiting on `/api/og/template` and `/api/og/shelf`; RLS adversarial suite (`scripts/rls-adversarial-suite.mjs`); GDPR minimum items; CI Stage 2 (build) + Stage 3 (chromium e2e) live; 6 new Playwright specs (Shelf capacity/eligibility, Shelf reorder persistence, blind-ranking lock, Read happy path, Read regen cap, Trace post); portability preview API integration tests + build-backup `.gitignore` entries; Shelf share OG artefact (`app/api/og/shelf/route.tsx`); "I tried something" Tested-capture flow (`TriedSomethingSheet.tsx` + `/api/collection/tested`); server-side Read regen cap confirmed done. **Pending explicit human approval — NOT applied:** DB-004 (wishlist consolidation) and DB-005 (swap schema) migration SQL, drafted in `docs/nota/pending-migrations/`. **Still fully blocked on human dashboard action:** notalabs.io domain cutover (Vercel/Shopify DNS steps, §1b of the backlog doc) — no code change possible from this side. **Flagged for follow-up, not fixed (Rule 6 — needs approval/decision):** two RLS gaps Track B's adversarial suite found — (1) `feedback` table policy named "own feedback" but `qual=true` (actually public-read; needs a founder decision on rename-vs-restrict), (2) `user_xp`/`user_streaks` legacy anon-keyed `USING(true)` SELECT policies (known pre-existing consequence of the dual identity model, now has an automated regression check). Diff reviewed end-to-end against `main`: confirmed no font-family, marquee-copy, nav-restructure, or palette changes — all deferred items in `05-recommendations-backlog.md` §1 rows 3–4 and §2 remain untouched. Full detail in `docs/nota/05-recommendations-backlog.md` (updated same date).
