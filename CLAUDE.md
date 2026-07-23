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
- **Rebrand history:** Scentral → BaseNote → AnotherSense (docs only) → **nota.** (2026-07-04, per founder brief; the brief is the doctrine source — no separate handover doc exists in-repo[...])
- **Consolidation (2026-07-08):** Two repos (`scentral`, `scentral-hub`) merged into single canonical repo. `scentral` archived (read-only). See MERGE_SUMMARY.md.
- **⚠️ Rebrand debt (RESOLVED 2026-07-08):** All display strings updated to nota. (was: BaseNote in metadata, lib/affiliates.ts; AnotherSense in docs).

## 2. Stack (verified from repo, 2026-07-04; updated 2026-07-16 post-DNS-cutover)

Next.js 16.2.9 (App Router, route groups `(main)` `(community)` `(account)`), React 19.2.7, Tailwind 4 + CSS variables, Supabase JS 2.110 + `@supabase/ssr`, `@anthropic-ai/sdk` 0.110, `@google/genai` 2.10, Playwright 1.60 (e2e). TypeScript 6.

**Domain & DNS:**
- `notalabs.io` purchased 2026-07-04 via Shopify; DNS hosted on Google Cloud (Shopify infrastructure, inaccessible to our GCP account).
- **A record:** Changed 2026-07-16 from Shopify IP (23.227.38.73) → Vercel IP (216.198.79.1). Live at authoritative nameservers; HTTP works; HTTPS TLS pending cert issuance.
- **⚠️ Cleanup pending:** AAAA record still points to Shopify (2620:127:f00f:d::). www CNAME still points to shops.myshopify.com. Update via Shopify admin if IPv6 or www should land on Vercel.
- **Action:** Once HTTPS cert live, set `NEXT_PUBLIC_SITE_URL=https://notalabs.io` in Vercel env. Verify with `npx vercel domains inspect notalabs.io`.

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

## 5. Database (live schema verified via Supabase MCP, 2026-07-04)

37 public tables, all RLS-enabled. `fragrances` = **127,595 rows** (`plain_description`, `inspired_by`, `family`, `projection`, `optimal_season`, `use_case`, `lean`, `image_url`, `popularity_rank`[...]

**nota-era tables (all `user_id uuid`):**
- `noseprints` — name, descriptor, read_text, signals jsonb, matches uuid[], stretch_note, status ('current').
- `shelf_items` — fragrance_id, **rank int (±20, ≠0 — negative = transient during two-phase reorder)**, `tier` text GENERATED from rank (S 1–5 / A 6–10 / B 11–15 / C 16–20), `blind_[...]
- `shelf_events` — audit trail (added/removed/rank_changed/replaced/returned).
- `blind_ranking_sessions` (fragrance_pool uuid[], revealed_at) + `blind_ranking_choices` (placed_rank).
- `traces` (trace_type, body, image_url) + `trace_reactions`.
- `trails` (slug, published) + `trail_steps` (position, step_type, content jsonb) + `trail_progress`.
- `temptations` (reason, status shown/resolved), `evolution_events` (from/to_noseprint, choice, trigger_signals), `interactions` (event_type/entity/metadata — general event log), `insights_cache[...]
- `houses`, `profiles` (username, house_id, onboarding_completed_at).

**Legacy-era:** `collections` (status 'owned'|'wishlist' only — **no 'tested'/'past_purchase'**; wear_state, shelf_tier int default 2, affinity_score int default 50, scent_memory), `wear_logs` ([...]

**⚠️ Two competing shelf models:** `shelf_items.rank` (nota Shelf) vs `collections.shelf_tier` + `affinity_score` (Living Wardrobe). Both live. Seeding bridges them (`app/(main)/shelf/page.tsx[...]

## 6. My Shelf — current implementation vs. spec

- **Current:** 10 slots (SHELF_SIZE=10 in `app/(main)/shelf/page.tsx` AND `app/api/shelf/route.ts`). Seeded once: top-3 noseprint matches + owned collections by tier/affinity. Actions: add/remove/[...]
- **Spec (founder brief):** **20 slots in 4 tiers** — S (1–5), A (6–10), B (11–15), C (16–20, at-risk). Eligibility: only Tested/Own/Past-Purchase fragrances, **enforced in data model**.[...]
- **Gap (updated post-migrations 2026-07-04):** DB layer is DONE (tiers, BB, eligibility trigger, ±20 ranks). Remaining is ALL app-layer: SHELF_SIZE 10→20 in both files, tier-row UI, BB stamp r[...]

## 7. LLM / cost posture (verified)

- **The Read:** 1× Claude Haiku call per user per Read (`app/api/read/generate`) — acceptable.
- **Aura advisory:** moved to Supabase Edge Function (`supabase/functions/aura-advisory/`), cached in `aura_cache` (24h TTL).
- **Insights:** `insights_cache` precomputed pattern. Chemist/Sommelier: cached tables.
- **Rule:** no per-fragrance LLM calls, no per-request LLM in UI paths. Batch/queue heavy work (`description_enrichment_queue` + `/admin/enrichment` review UI exist).
- **Images at 127k:** bulk URL-guess enrichment yields ~0.09% (53k-row run, 2026-07-03; miss log `scripts/data/image-misses.txt`, 249k entries). **Default = family gradients** (`lib/familyGradient[...]

## 8. Design primitives (verified in code)

- **Fonts:** Unbounded + Space Grotesk (nav/functional, next/font) + **Instrument Serif** (emotional/display, next/font/google, `--font-display`), falling back to self-hosted **Cormorant Garamond italic** (woff2) then Georgia if Instrument Serif fails to load. Verified 2026-07-23 directly against `app/layout.tsx` (`Instrument_Serif`, `Space_Grotesk`, `Unbounded` imports) and `app/globals.css` (`--font-display: var(--font-instrument-serif, "Instrument Serif", "Cormorant Garamond", Georgia, serif)`; `--font-body: var(--font-unbounded), var(--font-space), "Satoshi", sans-serif`) — this line previously had it backwards (claimed Cormorant Garamond was primary and Instrument Serif was the "older docs" name); Instrument Serif is what actually renders.
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
- Customer personas: Gavin (newcomer), Christopher (enthusiast) — `SCENTRAL_PERSONAS.md`.

## 11. Operational rules (binding, from AGENTS.md — do not relearn these the hard way)

1. Pre-push hook in `.husky/` + `core.hooksPath=.husky` (blocks tsc failures & module-scope `createClient()` in `app/api` — L15).
2. `npm run build` locally before any push to main. Deploy = `npx vercel --prod`, check `▲ Aliased` line (L14).
3. New external image domains → `next.config.ts` remotePatterns in the same commit (L16).
4. E2e text selectors break on copy changes — prefer `getByRole` (L17); run `npm run test:e2e -- --project=chromium` after copy changes.
5. Never `git reset --hard` without checking `git status` (L15). Never module-level Supabase clients in API routes.
6. Migrations: SHOW SQL, wait for explicit "approved" before applying. See `docs/nota/12-migration-patterns-playbook.md` for idempotency, phantom-object, RLS, and constraint-ordering discipline.
7. No secrets in code; `.env.local` only. Scripts follow §8.5 security rules in AGENTS.md.
8. Never remove the `cabinetSnapshot` CustomEvent in WardrobeShelf.
9. Batch scripts need a yield circuit-breaker (enrich-images.mjs pattern: <1% hit rate after 1k rows → stop).
10. **Empirical Handshake:** Always verify live schema via Supabase MCP `execute_sql` before trusting migration comments or prior claims. Schema drift is common and silent.
11. **Stale `.next` artifact trap:** On long-running work with multiple `tsc --noEmit` checks, clear `.next/` before re-running typecheck. False failures occur from cached old route references.
12. **Git safety discipline:** Before every commit, `git fetch` and compare `HEAD` vs `FETCH_HEAD` to detect concurrent-session divergence. If diverged, `git rebase FETCH_HEAD` (never force-push). Verify `git status` and `git diff --stat` before any destructive action.
13. **Handover Verification:** Before finalizing a handover doc, memory update, or skill creation, verify all claimed artifacts exist in live filesystem. Run `ls` on target directories; cross-check claimed vs. actual files. Never assert existence without empirical verification — handovers are public claims that must be auditable.
14. **State Claim Verification Loop:** Never make absolute claims about compilation, lint status, test passes, or git state (e.g., "aligned with origin", "clean working tree") without explicitly running the verification tool in the current step (e.g., `git status`, `git diff --stat`, test runners). If uncommitted or untracked changes exist in the local workspace, they MUST be explicitly detailed in the report rather than asserting clean alignment. Every status statement must cite the exact command outputs.

## 12. Phase log

- **Phase 0 (2026-07-04):** Repo/schema digested. Key findings: Shelf 10-not-20 with no tiers/eligibility/BB; mixed identity model (auth uuid vs anon_id text); dual shelf models; dual wishlist; r[...]
- **Phase 1 (2026-07-04):** CX audit → `docs/nota/01-cx-journey-audit.md`. Headline: nota core loop absent from main nav; landing tone violates doctrine; Shelf flat/ungated/unshared; Tested sta[...]
- **Phase 2 (2026-07-04):** Brand pack + DS audit → `docs/nota/02-brand-pack.md`, `03-design-system-audit.md`. Wordmark Route A (minimal humanist, gold dot); dot state machine defined; Unbounde[...]
- **Phase 3 (2026-07-04):** Architecture → `docs/nota/04-architecture-plan.md`. RLS verified sound; 7 DB-### proposed changes (SQL shown, NOT applied — eligibility statuses, blind_buy, 20-ran[...]
- **Migrations approved & applied (2026-07-04):** Founder approved Deliverable D §2. Live DB now has: collections status incl. 'tested'/'past_purchase' (pre-existed — Phase 0's "only owned/wis[...]
- **Phase 4 (2026-07-04):** Backlog + safe diffs → `docs/nota/05-recommendations-backlog.md`. Applied: full display-layer rebrand BaseNote→nota. (~30 files, display strings/metadata/OG only),[...]
- **Phase 5 (2026-07-04):** Testing/security/abuse layer → `docs/nota/06-testing-security-abuse.md` + three living skills (`.claude/skills/{qe-automation,security-hardening,resilience-abuse}/`,[...]
- **Phase 6 (2026-07-08):** Repository consolidation: `scentral` + `scentral-hub` → **nota** (single canonical repo). Deduplicated code/deps, archived legacy docs to `docs/ARCHIVE/`, updated Sentry org ID. See MERGE_SUMMARY.md.
- **Lint zero-error baseline (2026-07-10, PR #54):** All 231 lint errors fixed (99 `any`s properly typed, 58 JSX entities escaped, 3 CJS scripts → `.mjs`, unused vars cleared, dead Vertex AI pipeline in `app/api/generate-image` removed). CI `lint` check green on main. Two open items: (1) react-hooks React Compiler rules (`set-state-in-effect` ×45 etc.) downgraded to **warnings** in `eslint.config.mjs` — fixing needs behavioral component refactors, own PR; (2) 11 chromium e2e failures pre-exist on 476c604 (brand-handover copy vs text selectors — L17 again), NOT caused by lint work; (3) `Supabase Preview` CI check fails on any PR touching `supabase/**` because migration 001 references `layering_combinations` which no migration creates — needs a guarded migration fix.
- **Phase 7 (2026-07-16):** Domain & infrastructure — DNS A record for notalabs.io moved from Shopify to Vercel (216.198.79.1). HTTPS TLS cert pending issuance. Three diagnostic skills added to `.claude/skills/`: claude-in-chrome-bridge-diagnostics, dns-propagation-under-cache-interference, vercel-domain-tls-workflow. Browser native-host config fixed (Claude Code CLI only, not Cowork). AAAA + www records still Shopify-bound — pending cleanup.
- **Phase 8 (2026-07-16):** Domain cutover readiness finalized. Prod + GDPR + DNS infrastructure complete. **Verified:** No hardcoded *primary* domain references in tests/code — reads `NEXT_PUBLIC_SITE_URL` first. An intentional `https://scentral-hub.vercel.app` historical fallback still exists in `app/layout.tsx`, `app/noseprint/NoseprintClient.tsx`, and `scripts/smoke-test.mjs` for when that env var is unset. **Pending:** (1) HTTPS cert live verification (`npx vercel domains inspect notalabs.io`), (2) AAAA/www DNS cleanup via Shopify admin if needed, (3) `NEXT_PUBLIC_SITE_URL=https://notalabs.io` set in Vercel post-HTTPS-live, (4) OG/share link retest. **Blockers resolved:** ABunDance webhook clarification (nota. and household-finance remain separate), TypeScript warnings non-blocking (runtime works), dev server flakiness non-blocking (tested working). Ready for: asset generation → legal Privacy Policy review → final domain verification.
- **Phase 9 (2026-07-16):** Repo-name/domain decoupling follow-through. `test:smoke:prod` now follows `NEXT_PUBLIC_SITE_URL` with `scentral-hub.vercel.app` as the verified fallback, scheduled smoke-test reporting uses the same source, app-store screenshot capture no longer points at stale `scentral-seven`, and handover docs now flag repo/domain lines as re-verification points during the nota. rename + `notalabs.io` cutover.
- **Phase 10 (2026-07-16):** Customer, competitor, and acquisition teardown -> `docs/nota/10-customer-competitor-acquisition-teardown.md`. Current verdict: protect nota. as a standalone private scent-intelligence product; consolidate identity, collection, recurring-use, and community models; repair privacy/schema/rights trust blockers; prove retention and recommendation calibration before native-scale, advertising, partnership, or acquisition claims. The June `COMPETITIVE_INTELLIGENCE.md` remains historical context and is superseded where this dated refresh conflicts.
- **Phase 11 (2026-07-19):** Portability Concierge foundation -> `docs/nota/11-portability-concierge.md`. Added deterministic no-write CSV/TSV/paste parsing and catalogue match previews, a reusable repo skill, and unit-test command. Hardened `/api/wear-log` so authenticated identity and RLS replace caller-supplied `user_id` and service-role insertion. No migration, customer-facing import UI, database commit path, connector, deployment, or cross-project integration was added. Legacy Spritz wear/note identity remains a separately gated follow-up.
- **Phase 12 (2026-07-19):** CI-response loop on PR #55 & PR #64. Fixed 40+ migration bugs: phantom objects (profiles, houses, collections, layering_combinations, traces), re-versioned idempotency gaps (DB-003, DB-006, shelf_events, temptations, insights_cache, trace_reactions), RLS policy scoping (removed `USING(true)` policies, scoped user writes), constraint ordering (drop policies before columns, drop constraints before remapping), index immutability (timezone normalization, week-boundary alignment), data preservation (retained `anon_id` for orphaned rows). Created `migration-safety-audit` skill (global, `~/.claude/skills/`) and `docs/nota/12-migration-patterns-playbook.md` documenting phantom-object, idempotency, RLS, and constraint-ordering patterns. Added to §11 Operational Rules: Empirical Handshake, stale `.next` artifact trap, git safety discipline. Duplication gate (3.3% → 1.6%) resolved via neutralizing dead-code migration. Both PRs pass Quality Gate; awaiting final Codex findings on remaining P1/P2 items.
- **Phase 12 correction (2026-07-19, Cowork audit):** The Phase 12 handover claimed `.github/workflows/migration-audit.yml` was already deployed and running in CI — it was not; the file did not exist in the repo. Verified empirically (Empirical Handshake) rather than trusting the handover doc, then created it. It now runs the 6-category audit (phantom objects, re-versioned idempotency, RLS scoping, index immutability, constraint ordering, data preservation) against diffed `supabase/migrations/**` files on every PR, posts/updates one PR comment with findings, and fails CI on P1 findings only. Everything else in the Phase 12 handover (CLAUDE.md §11/§12, `docs/nota/12-migration-patterns-playbook.md`, PR-75 follow-up docs, phantom-object guards in 24 migration files) was verified present and accurate. Global skill file and global project-memory files (`~/.claude/skills/`, `~/.claude/projects/.../memory/`) could not be verified from this session — confirm directly in Claude Code CLI.
- **PR #75 Follow-Up (2026-07-19, Antigravity):** Consolidated duplicate code by extracting custom `useProsCons` hook and `lib/insightsQueries.ts`. Removed trace limit from insights queries. Addressed CodeRabbit P1 findings: corrected error state persistence in hook, insights empty state checks, verdict validation, wear note date validation, Gemini API client initialization/validation, outer catch 503 response codes, user ID redaction/pagination in compute-insights-nightly Edge function. Finalized trace reactions migration with notice logs and NOT NULL constraints. Verified build, typecheck, lint, and unit tests pass successfully.
