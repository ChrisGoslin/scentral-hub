# nota. — Engineering Handover

> Written 2026-07-04 for the incoming lead engineer. Everything here is verified against the live repo/DB unless marked otherwise. Read this first, then `CLAUDE.md` (system memory), then the audit suite (`docs/nota/01–06`) as reference material.

## 0. Orientation in 60 seconds

- **Product:** nota. — a personal scent identity system (NOT a fragrance catalogue/marketplace; the catalogue is substrate). Doctrine, tone, and the "2036 test" are in `CLAUDE.md` §1.
- **Names:** display = **nota.** · repo = `scentral-hub` · DB = `scentral-mvp` (Supabase `lrkdwobnemczvhpixpky`) · prod = `scentral-hub.vercel.app` · new domain = `notalabs.io` (bought, **not yet DNS-pointed**).
- **Stack:** Next.js 16 App Router, React 19, Supabase (auth + Postgres + edge functions), Vercel, Tailwind 4 + CSS-variable tokens, Claude Haiku for the single LLM feature.
- **Sources of truth, in order:** live DB > repo code > `CLAUDE.md` > `AGENTS.md` (operational lessons — binding) > everything else in `docs/` (much of it stale; `docs/PRODUCT_TRUTH.md` is superseded).
- **Open PR:** #47 `nota-rebrand-and-audit` — display-layer rebrand + audit suite + two migration mirrors. Merge this before starting new work.

## 1. ⚠️ The one thing to fix first (live rough edge)

The `enforce_shelf_eligibility` DB trigger is **live in production** as of 2026-07-04: inserting/updating `shelf_items.fragrance_id` fails unless the user has a `collections` row for that fragrance with status `owned`/`tested`/`past_purchase`. The app hasn't caught up:

- `app/(main)/shelf/ShelfClient.tsx` search sheet still offers all 127k fragrances → ineligible picks now die in `app/api/shelf/route.ts`'s catch-all as a **generic 500**.
- Interim fix (hours, not days): in `/api/shelf` handleAdd/handleReplace, catch the Postgres exception (message contains `not eligible for shelf`) → return 409 with friendly copy; in the search sheet, either filter to the user's collection or auto-offer "Mark as tested and add?" (product call — the second matches the real-world flow better).
- Real fix is Shelf v2 (§3, item 1), which subsumes this.

There are currently **0 rows in `shelf_items`** and ~1 real user, so blast radius is minimal — but don't launch with it.

## 2. Current DB state (post-approved-migrations, verified)

`shelf_items`: rank ±20 (≠0; negatives are transient two-phase-reorder states — see `handleReorder`), `tier` GENERATED (S 1–5/A 6–10/B 11–15/C 16–20), `blind_buy` bool, eligibility trigger, `set_blind_buy_on_reveal` trigger. `collections.status`: owned/tested/past_purchase/wishlist. `swap_offers`: exists with participant-scoped RLS (UI is post-launch). All 37 tables RLS-on; policies verified sound but **never adversarially tested** (see §4).

Migration workflow used here: apply via Supabase MCP **after explicit founder approval**, then mirror the SQL into `supabase/migrations/` in the same PR. Two sessions were applying from the same plan on 2026-07-04 — always `SELECT` the live schema before applying anything (constraint/column may already exist).

## 3. The build sequence (dependency-ordered; full detail in `05-recommendations-backlog.md` §1)

1. **Shelf v2** — the flagship. SHELF_SIZE 10→20 in `app/(main)/shelf/page.tsx` + `app/api/shelf/route.ts`; tier-row UI (S visually elevated; C labelled "On the edge."); BB stamp; eligibility-filtered search; friendly 409s; seed-flow still works (seeding inserts noseprint matches — **backfill those into `collections` as 'tested' or seeding will now hit the trigger**; check `seedShelfItems`).
2. **Nav rebuild** — the core loop (Read/Noseprint/My Shelf/Traces/You) is unreachable from the nav today; it still reads DISCOVER/WARDROBE/LAB/BRIEF/IDENTITY. Proposed: `Today / Discover / My Shelf / Traces / You`. Needs the founder's call on Wardrobe-vs-Collection naming (UX-008).
3. **Landing detox** — keep the identity hero, relocate the price-comparison "Inspired By Engine" to `/clones`, rewrite the marquee (current copy is off-doctrine).
4. **Shelf share artefact** — OG route exists (`app/api/og/*`); wire "share to Traces" + a completion moment.
5. **Security/GDPR floor before DNS cutover** — headers, rate limits, PostHog consent (see §4).
6. **Domain cutover** — checklist in `05` §1b; one env var (`NEXT_PUBLIC_SITE_URL`) flips everything; unblocks AWIN merchant apps + `/boxes` Shopify envs.

## 4. Testing & security reality (from Deliverable F — read `06-testing-security-abuse.md` in full)

- **No unit test runner. Zero e2e coverage of nota-core flows** (Read, Shelf, Blind Ranking, Traces). 8 legacy Playwright specs exist. CI = tsc+lint only (Stage 1, added 2026-07-04); build/e2e stages need repo secrets.
- **Rate limiting exists on exactly 1 of ~58 routes** (`/api/formulate`, Upstash sliding window — copy this pattern). Priority targets: `/api/read/generate` (LLM spend), `/api/search`, `/api/og/*` (render cost).
- **No security headers at all** (`next.config.ts` has no `headers()`; `proxy.ts` is session-refresh only).
- **RLS never adversarially tested** — write the two-user cross-access suite before launch.
- Three living skills exist in `.claude/skills/` (`qe-automation`, `security-hardening`, `resilience-abuse`) with append-only `LESSONS.md` files — the working agreement is every confirmed bug/vuln ends as a lesson + regression test. Whether you keep that convention is your call, but the content is good.

## 5. Architecture debt worth knowing (not urgent, will bite eventually)

1. **Mixed identity model:** nota-era tables key on `auth.users` uuid; `user_xp`/`user_streaks` still key on legacy `anon_id` text (localStorage `scentral_anon_id`). Plan: silent claim-on-login, then retire the anon path (DB-006, post-launch).
2. **Two shelf paradigms:** `shelf_items.rank` (nota Shelf) vs `collections.shelf_tier`+`affinity_score` (Living Wardrobe at `/collection`). Both live, bridged only by first-visit seeding. Long-term: Shelf = ranked identity, Collection = inventory; don't let them drift further.
3. **Dual wishlist:** localStorage `scentral_wishlist` AND `collections.status='wishlist'`. Consolidate to DB (one-time client sync) before Swap ships.
4. **~130 hardcoded hex values** in `app/**.tsx`; ReadClient (the flagship screen) is fully detached from the token system. Add a lint rule, sweep opportunistically.
5. **`getIsPro()` is a global env flag**, not per-user — fine for open beta, a footgun the day you charge money.
6. **`interactions` grows unbounded** (append-only event log, bigint PK) — add retention/partitioning within ~6 months of real traffic.
7. **Route sprawl:** ~43 pages, many pre-nota (`/spritz`, `/schedule`, `/wheel`, `/social`, `/wear-and-share`, `/creator*`, `/ritual`). Nothing is broken, but each is surface area for the 2036 test. Recommend an explicit keep/fold/kill pass after launch — candidates and rationale in `01-cx-journey-audit.md` §6.
8. **Images:** URL-guess enrichment against the 127k catalogue converges at ~0.09% hit rate — don't re-run bulk scrapes (the script now has a <1%-yield circuit breaker; `--force` overrides). Strategy is family-gradient default + targeted top-N enrichment via the existing admin queue (`04` §4). A concurrent workstream is doing retailer-verified Shopify enrichment (`scripts/enrich-images-shopify.mjs` + its skill) — coordinate, don't duplicate.

## 6. Operational rules that have burned people before (AGENTS.md L1–L17 distilled)

- Hooks live in `.husky/` (`core.hooksPath=.husky`) — a hook in `.git/hooks/` silently never runs. Fresh clone: run the two "Local Dev Setup" commands in AGENTS.md.
- `npm run build` locally before pushing to main; the pre-push hook catches tsc failures + module-scope `createClient()` in `app/api` (that class of bug broke 19 consecutive Vercel builds once, and `tsc` alone does NOT catch it).
- Deploy explicitly: `npx vercel --prod`, then read the `▲ Aliased` line — the GitHub webhook goes silent, and stale aliases (`scentral-seven`) have bitten share links already.
- Every new external image hostname → `next.config.ts` remotePatterns **in the same commit** — next/image throws at render time and the ErrorBoundary takes the whole page down (happened with wikimedia).
- E2e: `getByRole`, never copy-string selectors — copy churns.
- **Concurrent agent sessions edit this repo simultaneously.** Never `git add -A`, never plain `git commit`, never `git reset --hard`; stage and commit by explicit pathspec; check `git status` for foreign staged work first (`.claude/skills/safe-commit-shared-repo/`).
- DB migrations: show SQL, get explicit approval, apply, mirror the file. Check live schema first (two sessions, one plan — see §2).

## 7. What I'd improve that nobody has asked for yet

1. **Server-render `/discover`'s first page** — it's client-fetched today; on a 127k catalogue this is the SEO front door and it renders empty HTML.
2. **Server-side cap on `/api/read/generate`** — the regen limit lives only in the client; one curl loop = unbounded Haiku spend. Cheap fix: count `interactions.event_type='read_generated'` per user per hour. (Also on Deliverable F's list.)
3. **Admin routes** (`/admin/enrichment`, `/admin/feedback`) — verify they're actually gated by more than obscurity before public traffic; I did not confirm an auth check on them. **[Unverified — check first]**
4. **Delete or archive the superseded docs** (`docs/PRODUCT_TRUTH.md`, `docs/executive-suite/`, old sprint briefs) — they contradict CLAUDE.md and will mislead any agent or human who lands on them first. AGENTS.md itself still says "BaseNote" and should get a header note pointing at CLAUDE.md.
5. **Recognition micro-moment** (`05` §2.2): one serif line on the third visit to the same fragrance detail. Data's already in `interactions`; it's a day of work and it's the cheapest possible proof of "this understands me" — worth doing before any bigger delight work.
6. **The Read's 'close' reaction** currently saves identically to 'that's me' — the single highest-leverage UX refinement in the identity loop once Shelf v2 lands.

## 8. Key file map

| Concern | Where |
|---|---|
| System memory / doctrine | `CLAUDE.md` (root) |
| Operational lessons | `AGENTS.md` §8–§9 |
| Audit suite (A–F) | `docs/nota/01–06` |
| Shelf | `app/(main)/shelf/{page,ShelfClient,types}.tsx`, `app/api/shelf/route.ts` |
| The Read | `app/read/ReadClient.tsx`, `app/api/read/generate/route.ts` |
| Noseprint | `app/noseprint/`, `app/api/og/noseprint/` |
| Blind ranking | `app/(main)/shelf/blind/`, `app/shelf/blind/[sessionId]/`, `app/api/blind-ranking/*` |
| Design tokens | `app/globals.css` + `lib/design/tokens.css` (tokens.css loads second and bridges) |
| Affiliates / Shopify | `lib/affiliates.ts` (AWIN, merchant IDs PENDING), `lib/shopify.ts` |
| Edge functions | `supabase/functions/{aura-advisory,compute-insights-nightly,detect-noseprint-evolution,enrich-descriptions-batch}` |
| Rate-limit pattern to copy | `app/api/formulate/route.ts` |
| Auth | `utils/supabase/server.ts`, `app/login`, `proxy.ts` |
