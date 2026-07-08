<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Operating rules for ALL CLI agents on nota. (Claude Code, Antigravity, Gemini, etc.)
# ⚠️  REBRAND: Display name = "nota.". Repo stays `scentral-hub`. DB stays `scentral-mvp`. All internal names unchanged.
# 📋 LATEST HANDOVER: docs/HANDOVER.md — nota. pre-launch implementation, launched Tier 1 & 2.
# 🎯 ACTIVE BRAND/ARCHITECTURE NOTES: docs/nota/ — journey audit, brand pack, design audit, architecture plan, backlog, testing, handover.

**Owner:** Christopher. **Purpose:** prevent invented facts, paths, keys, and scope.
This is the SINGLE canonical instructions file. `CLAUDE.md` and `GEMINI.md` point here. Read this FIRST, every session, before acting. Begin your first reply by stating in one line what you grounded yourself in.
**Supplementary reading:** `.claude/skills/grounded-agent-guardrails/SKILL.md` — expands the five safeguards with verification commands, known fabrications list, and a session-start checklist. See also `.claude/skills/safe-commit-shared-repo/SKILL.md` (git hygiene given concurrent sessions) and `.claude/skills/diagnose-prod-slowdown/SKILL.md` (perf-incident runbook).
**Critical operating rules:** §8 (script execution + network constraint), §9 (lessons learned), §10 (self-check).

## Local Dev Setup (run once after clone or new session)
```
git config core.hooksPath .husky
cp scripts/hooks/pre-push .husky/pre-push && chmod +x .husky/pre-push
```
Installs a pre-push hook that blocks pushes to `main` if `tsc --noEmit` fails or a module-level
`createClient()` is found in `app/api` — the exact bug class that broke 19+ consecutive Vercel
builds on 2026-06-25 (see §9, L15). **Must go in `.husky/`, not `.git/hooks/`**, AND
`core.hooksPath` must be set — both are local-only `.git/config`/working-tree state, never
committed, so every fresh clone needs both commands (confirmed the hard way: an install at
`.git/hooks/` silently never fired because this repo's local config already pointed elsewhere).

## Session start checklist
Before doing anything:
1. `npm run test:smoke:prod`
2. `cat AGENTS.md`
3. If `git config --get core.hooksPath` doesn't print `.husky`, or `.husky/pre-push` doesn't exist: run the two commands under "Local Dev Setup" above.

## 0. Why this file exists
Prior agent runs produced confident "breakthrough" output full of fabricated detail (fake repo paths,
fictional features, lore like "Agent Luna / Hegemony / Shadow Branching", and hardcoded keys). Root cause =
**confident invention**: stating things as fact without verifying. The failure mode to guard against is not
"being wrong" — it's "sounding certain while being wrong."

## 1. Ground truth (the ONLY accepted facts unless re-verified)
- **Display name:** nota. **Repo:** `scentral-hub` (GitHub: `ChrisGoslin/scentral`). **DB:** `scentral-mvp` (`lrkdwobnemczvhpixpky`). Display-layer rebrand only — do NOT rename repo, DB, or tables.
- **Brand history:** Scentral Hub → AnotherSense → BaseNote → nota. You may still see `Scentral`, `AnotherSense`, and `BaseNote` in archived docs, old prompts, localStorage keys, repo names, database names, or internal implementation details. Treat `nota.` as the current user-facing brand unless a source-of-truth doc explicitly says otherwise.
- **Data:** 127,195 fragrances (bulk-imported from 3 Kaggle datasets — 2026-06-24, IMPORT COMPLETE). Key columns: `plain_description`, `inspired_by`, `family`, `projection`, `optimal_season`, `use_case`, `lean`, `image_url` (populated by backfill scripts — may be null for some rows).
- **Stack:** Next.js 16.2.9 (App Router, route groups like `(main)`), React 19.2.4, Supabase JS 2.x, Vercel, Tailwind CSS, `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (Living Wardrobe). Always re-verify version from `package.json` if in doubt — do NOT assert from memory.
- **Architecture:** Single product. No auth for MVP — identity via `scentral_anon_id` (localStorage UUID, generated on first load).
- **Routes:**
  - `/` (Landing page — "nota." branding)
  - `/discover` (Search and explore catalogue)
  - `/collection` (Apothecary Grid shelf — user inventory)
  - `/collection/[id]` (Fragrance detail view)
  - `/layering` (Lab — combine scents)
  - `/social` (Community — curated TikTok/YouTube fragrance content, no auth)
  - `/you` (User profile and insights)
  - `/dna-match` (Resonance — find similar scents)
  - `/intelligence` (Wardrobe Intelligence — gated)
  - `/schedule` (Legacy daily ritual planner)
  - `/spritz` ← NEW — Spritz Schedule (Aura swipe card, XP engine, AnatomyIndicator)
  - `/wheel` ← NEW — Fragrance Wheel (9-axis polar SVG, gap analysis, share as PNG)
  - `/boxes` ← NEW — Discovery Box Storefront (curated sample sets → Shopify checkout)
  - `/boxes/[slug]` ← NEW — Box detail view (contents, "Add to Cart" CTA)
  - `/ritual/[id]` (Public shareable ritual page)
  - `/onboarding` (3-step new user guide with ceremony arc animation)
  - `/learning` (Guides and tips)
  - `/profile` (User settings)
  - `/disclaimer` (Legal)
  - `/waitlist` (Lead gen)
- **API Routes:** `/api/affinity`, `/api/aura`, `/api/chemist`, `/api/demo`, `/api/dna-match`, `/api/formulate`, `/api/fragrances`, `/api/generate-image`, `/api/layering`, `/api/scan`, `/api/schedule`, `/api/search`, `/api/sommelier`, `/api/waitlist`.
  - `/api/search` (app/api/search/route.ts) — parallel Promise.all ILIKE queries + conditional note-similarity RPC for clone detection (optimized 2026-06-24)
  - Future: `/api/aura-copy` (Supabase Edge Function — Claude Haiku copy for Spritz Schedule)
- **UI Component Library:** `Button`, `Disclosure`, `LoadingShimmer`, `Sheet`, `Card`, `EmptyState`, `ProGate`, `Chip`, `ErrorInline`, `SensoryAnatomy`.
  - Incoming (Epic 12): `ToastProvider`, `useToast`, `Toast`, `ButtonAsync`, `AuraBubble`
  - Incoming (Epics 9–10): `AnatomyIndicator`, `SpritzCard`, `FragranceWheel`
- **Collection / Living Wardrobe components** (all in `app/(main)/collection/`, except `OptimizedBottleCard`): `WardrobeShelf` (walnut-cabinet shelf container), `ShelfTier` (individual 3D shelf row — items laid out in a CSS grid, dnd-kit `rectSortingStrategy`), `OptimizedBottleCard` (`components/collection/OptimizedBottleCard.tsx` — full-bleed image/family-gradient card with ombre overlay, dnd-kit sortable; `BottleCard.tsx` is dead code, no longer imported anywhere), `WardrobeSidebar` (view-mode toggle: All / By House / By Season / Wishlist).
- **Tables (ALL LIVE — verified 2026-06-24):**
  - `fragrances` (127,195 rows) — GIN trigram indexes: idx_fragrances_name_trgm, idx_fragrances_brand_trgm, idx_fragrances_plain_description_trgm, idx_fragrances_inspired_by_trgm (created 2026-06-24 for /api/search optimization)
  - `collections` + `scent_memory text` column ← NEW (added 2026-06-20)
  - `wear_logs`
  - `layering_combinations` (`layer_recipes` does NOT exist — was listed here in error, removed 2026-07-04 after schema verification)
  - `spritz_schedules` (EXISTS — Epic 9 reuses this, do NOT recreate)
  - `profiles`, `waitlist`
  - `user_xp` ← NEW: `anon_id text PK`, `total_xp int DEFAULT 0`, `level int DEFAULT 1`
  - `user_streaks` ← NEW: `anon_id text PK`, `current_streak int DEFAULT 0`, `longest_streak int DEFAULT 0`, `last_worn_date date`
  - `discovery_boxes` ← NEW: `id uuid PK`, `name text`, `slug text UNIQUE`, `description text`, `fragrance_ids text[]`, `shopify_product_id text`, `theme text`, `tier text`
- **Free/Pro split:** Free = Discover, My Bottles, Layering, You, Spritz, Wheel. Pro = gated behind `components/ui/ProGate.tsx` (`isPro = false`). Do NOT remove gates.
- **localStorage keys:**
  - `scentral_anon_id` — UUID identity key (PK for all Supabase user tables)
  - `scentral_onboarded`, `scentral_persona`, `scentral_persona_name`, `scentral_wishlist`
  - `scentral_discover_sort`, `scentral-environment`, `scentral-use-cases`
  - `as_xp` ← NEW — local XP cache (optimistic UI, mirrors `user_xp` in Supabase)
  - `as_streak` ← NEW — local streak cache
  - Note: `scentral_vibe` (legacy) still bridged via `VIBE_TO_FEEL` map in DiscoverClient — do not remove the bridge.
- **Persona engine:** `lib/personas.ts` — single source of truth. 6 personas: `velvet_intellectual`, `solar_minimalist`, `dark_alchemist`, `ritual_keeper`, `rebel_experimentalist`, `comfort_seeker`. Import `getPersonaById` or `PERSONAS` from here; never duplicate persona data inline.
- **DB projection column — VALID VALUES ONLY:** `Beast Mode`, `Strong`, `Moderate`, `Medium`, `Weak`. Values `Light`, `Soft`, `Whisper`, `Heavy`, `Massive` do NOT exist in the DB. Any filter using these will return 0 results.
- **Living Wardrobe (Collection page):**
  - Shelf paradigm: **Apothecary Grid** — 3-column grid, 2:3 aspect ratio, drag physics with `--motion-organic`.
  - Shelf layout — 4 tiers, ordered top-to-bottom by affinity score:
    - *Top Signatures* (affinity 16–20)
    - *Occasion Modifiers* (affinity 8–15)
    - *Base Anchors* (affinity 1–7)
    - *Holding Zone* (unrated)
  - Drag-and-drop reorder via dnd-kit; every drop emits a `cabinetSnapshot` JSON event (vision pipeline hook — **NEVER REMOVE THIS HOOK**).
  - Sidebar view modes: All, By House, By Season, Wishlist.
  - Visual style: walnut-cabinet shelf chrome per tier; bottle items are full-bleed `OptimizedBottleCard` tiles in a responsive grid.
- **Aura:** AI curation character. Rules-based schedule logic + Claude Haiku for italic copy text. Cost: ~£9/month at 1K DAU. Never prescriptive. Writes in Instrument Serif italic.
- **XP system (6 levels):** The Curious (0), The Enthusiast (100), The Collector (300), The Connoisseur (600), The Curator (1000), The Auteur (1500). Values: swipe-right worn +10 XP, scent memory +5 XP, wishlist add +5 XP, onboarding complete +20 XP.
- **Design tokens (add to `app/globals.css` or `lib/design/tokens.css`):**
  - `--aura: oklch(0.72 0.08 60)` — amber-gold glow
  - `--aura-surface: oklch(0.18 0.04 60 / 0.6)` — dark amber glass
  - `--aura-border: oklch(0.45 0.06 60 / 0.3)` — subtle amber rim
  - `--xp-color: oklch(0.78 0.14 85)` — warm gold for XP indicators
  - `--motion-instant: 80ms cubic-bezier(0.4, 0, 0.2, 1)`
  - `--motion-responsive: 200ms cubic-bezier(0.2, 0.6, 0.2, 1)`
  - `--motion-ceremonial: 480ms cubic-bezier(0.16, 1, 0.3, 1)`
  - `--motion-organic: 800ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Typography:** Instrument Serif italic (emotional/narrative copy, Aura voice) + Unbounded (functional/navigational). Both font variables on the `html` element in `app/layout.tsx`.
- **Personas:** See `SCENTRAL_PERSONAS.md`. Gavin (newcomer, plain language). Christopher (enthusiast, expert).
- **Source-of-truth docs:** `AGENTS.md` (this file), `docs/HANDOVER.md` (latest launch handover), `docs/nota/` (current nota. audits and plans), `SCENTRAL_PERSONAS.md`. Older BaseNote/AnotherSense docs are historical unless referenced by the latest handover.

If a "fact" is not in these docs, the repo, or the database, it is NOT a fact yet — verify it or label it unverified.

### Known fabrications — never reintroduce
"Morocco Marketplace Demo", "Resonance Engine / pgvector" (unless referring to the `/dna-match` route), "Alchemist Knowledge Base / dossiers",
"300+ fragrances" (canonical count is now 127,195 after Kaggle bulk import), "Agent Luna / Sovereign Focus Group",
"Hegemony / Sovereignty", "Shadow Branching / autopilot-shadow", "Olfactory NFTs", "Invisible Commerce",
"Shadow Inventory", "Black Market API", and any "Elite Council breakthrough" framing.

## 2. The five safeguards (hard rules)
- **S1 — Verify before asserting.** Never state a version, API capability, path, table/column, or third-party
  feature as fact without checking (read the file, run `list_tables`, or web-search with a source).
- **S2 — No secrets in code or docs, ever.** Keys go in `.env.local` (gitignored), referenced via
  `process.env`. If you SEE a hardcoded secret, stop and flag it for rotation — never copy or echo it.
- **S3 — Real paths only.** Confirm a path exists before referencing it. Never invent a plausible directory.
- **S4 — No scope/feature invention.** Build only what the source-of-truth docs specify. Propose, don't build.
- **S5 — Flag confidence honestly.** Label every material claim Verified / Assumption / Unknown. No hype framing.

## 3. Required behaviours
- **Start of session:** read this file + `SCENTRAL_PERSONAS.md` + run the branch hygiene checklist at `.claude/skills/branch-hygiene/SKILL.md`. If `.husky/pre-push` doesn't exist, install it (see "Local Dev Setup" above). State what you grounded on in your first reply.
- **Before writing any code:** check if the feature already exists on main (`git log`, `find app -name "page.tsx"`).
- Before DB/auth changes: inspect first; SHOW the migration/SQL and wait for explicit "approved" before applying.
- Before claiming a third-party tool does X: web-search and cite, or say it's unverified.
- When unsure: ask one specific question. Do not guess and proceed.

## 4. Forbidden without explicit approval
Hardcoding secrets · inventing paths/features/versions · applying migrations · deleting files · force-push ·
touching existing working routes beyond a task's scope · presenting unverified claims as fact.

## 5. Branch and merge hygiene (read before creating any branch)

**Before creating a new branch:**
1. Run `git fetch --all && git log --oneline -5` to see what's already on main.
2. Run `git branch -a` to list all branches.
3. Check if the feature you're about to build already exists: `find app -name "page.tsx" | sort`
4. If a file you're about to create already exists on main, **stop** — do not duplicate it on a new branch. Either work directly on main or extend the existing file.

**Branch creation rule:**
- Only create a branch if the work is genuinely experimental or risky (DB migrations, major refactors).
- For additive features (new pages, new components, copy changes), commit directly to main.
- Never create a branch for work that duplicates something already on main.

**Before finishing:**
- Run `git diff main --stat` to confirm your branch only touches files relevant to the task.
- If you see files that already exist on main in your diff with additions only (no deletions), you may be duplicating — verify before committing.
- Merge to main immediately after the task is complete. Do not leave branches open.

## 6. Prompt delegation and agent batching (read before running parallel agents)

When multiple prompts are delegated in one session, order them by dependency — do not run all in parallel:

**Dependency order:**
1. **Foundation first** — schema changes, new API routes, shared components must land on main before anything consumes them.
2. **Consumers second** — UI pages, hooks, and client components that import from step 1.
3. **Polish last** — copy, empty states, animations that build on step 2.

**One agent per prompt.** Each prompt goes to exactly one agent. Agents should not be asked to "also do X while you're there" — that causes scope sprawl, duplicate branches, and wasted context.

**Verify before the next batch.** After each round of agents finishes, check `git log --oneline -5` and confirm everything landed on main before writing the next batch of prompts. Avoid writing 10 prompts upfront when earlier ones might block later ones.

**Compact each session early.** Any CLI agent session that has run more than ~5 tasks should compact before continuing. Cowork conversations should compact at natural milestones (end of a feature batch), not when the context runs out.

## 7. Deploying to production

**GitHub auto-deploy is not reliable.** The Vercel webhook on `scentral-hub` has a history of going silent. Do not assume a `git push` will deploy.

**Always deploy explicitly after merging to main:**
```bash
cd ~/Projects/scentral-hub && bin/deploy
```

The `bin/deploy` script enforces:
1. ✓ You are on `main` branch
2. ✓ Working tree is clean (no uncommitted changes)
3. ✓ `npm run build` passes locally
4. ✓ `vercel deploy --prod` succeeds and waits for READY state
5. ✓ `npm run test:smoke:prod` passes post-deployment (health check)

If any step fails, the script exits with a clear error. Smoke test failure is a loud alarm — deployment has succeeded but health check failed, which requires investigation.

## 8. Script execution rules (critical — read before running any script)

**The Cowork/sandbox bash environment has NO outbound network.** Any script that calls external services
(Supabase, Parfumo, Fragrantica, Vercel, OpenAI, etc.) will fail with `EAI_AGAIN` or `ECONNREFUSED`.

**Rule: never run external-network scripts from bash.** Instead, give Christopher the exact local command:
```bash
cd ~/Projects/scentral-hub
node scripts/<script-name>.mjs [--dry-run] [--limit=N]
```

**Scripts that MUST run locally (not in sandbox):**
- `scripts/backfill-parfumo-images.mjs` — Playwright + Parfumo (primary) + Fragrantica (fallback) image scraping
- `scripts/migrate-images-to-storage.mjs` — copies external image URLs into Supabase `fragrance-images` bucket
- `scripts/backfill-descriptions.mjs` — OpenAI calls
- `scripts/smoke-test.mjs` — hits live Vercel URL
- Any script importing `@supabase/supabase-js` and making DB calls

**Scripts that CAN run in bash sandbox** (no network needed):
- Syntax checks: `node --check scripts/foo.mjs`
- File manipulation, local transformations, JSON parsing
- `npm run build` (if dependencies are installed)

**Playwright prerequisite** (first time only, run locally):
```bash
npx playwright install chromium
```

**Image pipeline run order:**
```bash
node scripts/backfill-parfumo-images.mjs --dry-run --limit=5   # verify first
node scripts/backfill-parfumo-images.mjs                        # full backfill
node scripts/migrate-images-to-storage.mjs --dry-run --limit=5 # verify
node scripts/migrate-images-to-storage.mjs                      # move to Supabase Storage
```

## 9. Lessons learned — don't repeat these mistakes

**L1 — Parfumo 404 false-positive:** `html.includes('/404')` returns true on EVERY valid Parfumo page
because their nav contains `/404`. Always use `/<title>\s*404\s*<\/title>/i.test(html)` instead.

**L2 — Parfumo slug convention:** Most names use lowercase-hyphen (`rare-carbon`, `9pm`). Some older
entries use Title_Case_underscores (`Interlude_Man`). Script must try lowercase-hyphen first, fall back
to Title_Case on 404. Use `NAME_OVERRIDES` for confirmed exceptions.

**L3 — Cowork Edit tool race condition:** If Claude Code is actively modifying a file, the Edit tool
will fail with "File has been modified since read." Fix: use `mcp__workspace__bash` with a heredoc
(`cat > file << 'EOF'`) to write files atomically. Never rely on Edit/Write for files Claude Code owns.

**L4 — Verify CLI agent output before reporting done:** Claude Code returns confident "Done!" summaries
that can be wrong (logic not applied, import added without wiring, etc.). Always read the actual file
after delegation. Use `verify-cli-claims` skill for high-stakes work.

**L5 — Server components can't use React hooks for responsive sizing.** Use CSS math functions:
`min(45vw, 200px)`, `clamp(1rem, 4vw, 2rem)`. Only add `'use client'` if interactivity is needed.

**L6 — Horizontal scroll strips clip the last item.** `paddingRight` on a flex scroll container doesn't
extend past the last child. Add `<div style={{ flexShrink: 0, width: 16 }} />` as trailing spacer.

**L7 — isMobile hook pattern (client components only):**
```tsx
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 480)
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
}, [])
```
Threshold `< 480` for phone, `< 768` for tablet. Never put this in a server component.

**L8 — Responsive grid pattern.** Never use `repeat(N, 1fr)` — it breaks on narrow screens.
Use `repeat(auto-fit, minmax(80px, 1fr))` so columns collapse naturally to 1 on mobile.

**L9 — Multi-source image scraping.** Single-source scraping creates hard dependency risk.
`backfill-parfumo-images.mjs` tries Parfumo first (Middle Eastern/niche brands), then Fragrantica
(Western/designer brands). If adding new brands, check which source has better coverage first.

**L10 — LLM briefing block divergence risk.** §10 summarises §1 for paste-out. When updating §1
(stack, routes, schema), also update §10 to match. They are NOT auto-synced.

**L11 — §8's "sandbox has no outbound network" claim needs re-verification.** On 2026-06-16, Claude Code's
Bash tool ran `backfill-parfumo-images.mjs` (Playwright + live Parfumo/Fragrantica requests),
`migrate-images-to-storage.mjs` (Supabase Storage uploads), and `npx vercel --prod` directly —
all succeeded with no `EAI_AGAIN`/`ECONNREFUSED`. This contradicts §8's blanket rule. [Unverified]
whether this was environment-specific (Claude Code Bash tool vs. the original "Cowork" sandbox §8 was
written for) — re-check network access at the start of a session before assuming you must hand scripts
to Christopher; don't take §8 on faith either way.

**L12 — Git lock files from background script runs.** Running a script via `run_in_background` (or any
backgrounded git/node process) can leave stale `.git/HEAD.lock` / `.git/index.lock` files if the process
was killed mid-write. Symptom: `fatal: cannot lock ref 'HEAD'`. Fix: `rm -f .git/HEAD.lock .git/index.lock`
before retrying — safe as long as no git process is actually still running (`ps aux | grep git` to confirm).

**L13 — Accented characters break Parfumo/Fragrantica slug generation.** `toLowercaseHyphen()` strips any
non-`[a-z0-9]` character to a hyphen, turning `è`/`é`/etc. into a stray `-` instead of being dropped
(`Bibliothèque` → `biblioth-que` instead of `bibliotheque`). Fix: `.normalize('NFD').replace(/[̀-ͯ]/g, '')`
before lowercasing, to fold accented letters to their base ASCII form first.

**L14 — `scentral-seven.vercel.app` is STALE, do not trust on faith.** Verified 2026-06-22: it 404s on
routes that have shipped since (`/spritz`), while the deploy's actual `▲ Aliased` output pointed at
`scentral-hub.vercel.app`, which served the route fine. All hardcoded references (`scripts/smoke-test.mjs`,
`package.json` `test:smoke:prod`, `app/layout.tsx` `metadataBase`, §1, §7) were repointed to
`scentral-hub.vercel.app`. Aliases can silently drift — after any `npx vercel --prod`, check the `▲ Aliased`
line in the deploy output rather than assuming the URL in this doc is still current.

**L15 — 19+ consecutive Vercel build failures, 2026-06-25, from 3 separate commits, none caught locally.**
`scripts/extend-library.ts` imported `cheerio` (never added to `package.json`) and wasn't excluded from
`tsconfig.json`. `app/api/debug/image-audit/route.ts` and `app/api/reels/route.ts` both called
`createClient()` at module scope, which throws `supabaseKey is required` if env vars aren't present during
Next.js's build-time module evaluation. Root cause wasn't the bugs themselves — it's that nothing ran
`npm run build` (or any check) locally before pushing to `main`, so Vercel was the first thing to ever catch
each one. Fixed two ways: (1) `branch-hygiene` skill now has a mandatory `npm run build` step before
`git push origin main`; (2) a git pre-push hook (`scripts/hooks/pre-push`, installed via "Local Dev Setup"
above, **must go in `.husky/pre-push` — this repo uses `core.hooksPath=.husky`, not `.git/hooks/`**) blocks
pushes to `main` on `tsc --noEmit` failure OR a column-0 `const x = createClient(...)` match in `app/api`
(an early line-number-relative-to-export heuristic false-positived on a helper function in
`app/api/generate-image/route.ts` — column-0 indentation is the reliable signal for true module scope in
this codebase's style). Note `tsc --noEmit` alone does NOT catch the `createClient()` class — verified
empirically, it type-checks fine since the throw only happens at actual module evaluation.
**Second lesson from building this fix itself:** while testing the hook, `git reset --hard HEAD~1` was used
to drop a local-only test commit — `--hard` also wiped unrelated uncommitted edits to this very file that
hadn't been committed yet. Use `git reset HEAD~1` (mixed, the default) to drop an unwanted commit without
touching the working tree, never `--hard`, unless you've confirmed via `git status` there's nothing
uncommitted you want to keep.

**L16 — Every new external image source needs a `next.config.ts` remotePatterns entry.** On 2026-06-28,
`scripts/enrich-images-wikidata.mjs` backfilled `image_url` with `upload.wikimedia.org` URLs. The hostname
was not added to `next.config.ts` remotePatterns. `next/image` throws a runtime error on unconfigured
hostnames — it doesn't degrade gracefully. The React ErrorBoundary caught it and rendered "Something went
wrong" for the entire Discover page (all users, all sessions). The fix is one line in next.config.ts, but
the bug is invisible to `npm run build` and `tsc --noEmit` because next/image validates hostnames at render
time, not compile time. **Rule: whenever a script writes external `image_url` values, immediately add the
source domain to `next.config.ts` remotePatterns in the same commit.** The pre-push hook (`.husky/pre-push`)
now greps scripts that touch `image_url` and blocks the push if any new domain is absent from the whitelist.

**L17 — E2e tests with text-based selectors must be updated whenever UI copy changes.** On 2026-06-28,
`e2e/discover.spec.ts` asserted `'Fresh & Clean'` (old vibe chip label, since renamed to `'Fresh'`) and
`e2e/you-tab.spec.ts` asserted `'See your scent profile.'` (old You-page copy, replaced with
`'Your identity is waiting.'`). Both had silently drifted and were failing since the copy changed — caught
only when the full suite was run. Two safeguards: (1) prefer `getByRole()` / `aria-label` selectors over
literal text wherever possible — they survive copy rewrites; (2) the branch-hygiene SKILL.md now lists
running `npm run test:e2e -- --project=chromium` as a mandatory step before pushing whenever UI copy,
headings, or placeholder text was changed.

## 10. LLM briefing block (copy-paste into Claude Code / Cursor / other agents)

Use this block at the start of every new CLI agent session. Summary of §1 — update both when §1 changes. Last verified: 2026-06-29.

**Token hygiene:** `.claudeignore` is active — excludes `.next/`, `node_modules/`, `.claude/worktrees/`, `scripts/data/`, `scripts/archived/` from all file searches. Do not grep these paths manually.

**Pending work:** Sprint 8 — 5 parallel sessions in `CLAUDE_CODE_PROMPTS.md` (Shake Randomizer, Scent Journal, AI Pros/Cons, Discovery Box seeding, Lighthouse audit).

```
# nota. — Project Briefing
# Repo: scentral-hub | DB: scentral-mvp | Display name: nota. (display-layer only, all internal names unchanged)

## Must-read docs before writing any code
- AGENTS.md — ground truth, safeguards, lessons learned (READ THIS FIRST)
- docs/HANDOVER.md — latest launched state and remaining deferred work
- docs/nota/ — current nota. journey, brand, design, architecture, backlog, testing, and engineering handover

## Stack (verified from package.json)
- Next.js 16.2.9 (App Router, route groups like `(main)`)
- React 19.2.4
- Supabase JS 2.x — project scentral-mvp (lrkdwobnemczvhpixpky)
- Deployed on Vercel → scentral-hub.vercel.app
- Tailwind CSS + CSS variables for all colours (NO hardcoded hex — ever)
- @dnd-kit/core + @dnd-kit/sortable for Living Wardrobe drag-and-drop

## Design system — nota. brand language
CSS variables only (app/globals.css + lib/design/tokens.css):
- Base: var(--bg), var(--surface), var(--surface-2), var(--text), var(--text-muted), var(--accent), var(--line)
- Aura: --aura (oklch 0.72 0.08 60), --aura-surface, --aura-border, --xp-color (oklch 0.78 0.14 85)
- Motion: --motion-instant (80ms), --motion-responsive (200ms), --motion-ceremonial (480ms), --motion-organic (800ms)
- Shadows: --shadow-object (8-layer ambient), --shadow-elevated (with --aura accent ring)
- Material: .surface-glass { background: oklch(.../0.82); backdrop-filter: blur(20px) saturate(1.6) }
Typography: Instrument Serif italic (Aura/emotional) + Unbounded (nav/functional). Both on html element.

## Architecture rules
- Server components for all data fetching. "use client" only when hooks or browser APIs are needed.
- No auth for MVP. Identity via scentral_anon_id (localStorage UUID, generated on first load).
- isMobile: useEffect + window.innerWidth < 480 (client components only).
- Server sizing: CSS math — min(45vw, 200px), clamp() — not hooks.
- Horizontal scroll: add <div style={{ flexShrink: 0, width: 16 }} /> as trailing spacer.
- iOS safe area: paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)'
- Responsive grids: repeat(auto-fit, minmax(Npx, 1fr)) — never repeat(N, 1fr).
- overflow-x: hidden on html, body.

## Routes
Free: / (landing), /discover, /collection, /collection/[id], /layering, /social, /you
NEW this sprint: /spritz (Spritz Schedule + XP), /wheel (Fragrance Wheel)
Pro (gated, do not touch): /intelligence, /dna-match
Legacy (do not remove): /schedule, /onboarding, /ritual/[id], /waitlist

## Database tables (ALL LIVE — verified 2026-06-24)
fragrances (127,195 rows) — plain_description, inspired_by, family, projection, optimal_season, use_case, lean, image_url. GIN trigram indexes on name, brand, plain_description, inspired_by for /api/search.
collections — fragrance_id, affinity_score (int 1-20), maceration_started_at, status, scent_memory text (NEW)
wear_logs — streak calculation is timezone-aware, do not break
user_xp — anon_id (PK), total_xp int, level int 1-6  ← NEW, keyed on scentral_anon_id
user_streaks — anon_id (PK), current_streak, longest_streak, last_worn_date  ← NEW
spritz_schedules — EXISTS, reuse for Epic 9 (do not recreate)
layering_combinations, profiles, waitlist (layer_recipes does NOT exist)

## localStorage keys
scentral_anon_id — UUID identity key (PK for all Supabase user tables)
scentral_onboarded, scentral_persona, scentral_persona_name, scentral_wishlist
scentral_discover_sort, scentral-environment, scentral-use-cases
as_xp — local XP cache (optimistic UI mirror of user_xp)  ← NEW
as_streak — local streak cache  ← NEW
(scentral_vibe is legacy — bridged via VIBE_TO_FEEL in DiscoverClient, do not remove)

## Persona engine
lib/personas.ts — 6 personas: velvet_intellectual, solar_minimalist, dark_alchemist, ritual_keeper, rebel_experimentalist, comfort_seeker.
Import getPersonaById or PERSONAS. Never inline persona data.

## DB projection values (VERIFIED — only these exist)
Beast Mode, Strong, Moderate, Medium, Weak
DO NOT use: Light, Soft, Whisper, Heavy, Massive — not in DB.

## Critical business logic
- affinity_score 16-20 = Top Signatures, 8-15 = Occasion Modifiers, 1-7 = Base Anchors, null/0 = Holding Zone
- NEVER remove cabinetSnapshot CustomEvent from WardrobeShelf.tsx — feeds future vision pipeline
- rating in DB is 0-10; display as 5-star: Math.round(rating / 2)
- isPro = false — ProGate is active. Do NOT touch gated routes.
- XP writes to Supabase user_xp AND as_xp localStorage (optimistic)
- Spritz Schedule: rules-based Aura logic (lib/aura.ts). Haiku copy via Supabase Edge Function.

## No secrets in code
.env.local only: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY (server-side only).
ANTHROPIC_API_KEY in Supabase Vault — never echoed, never committed.

## 8.5. Script Security (Critical for data scripts)

**All scripts that read/write data must follow these rules:**

1. **Load credentials from .env.local only** — never accept secrets as CLI env vars or arguments
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config({ path: '.env.local' });
   const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
   ```

2. **Exit with clear error if credentials missing** — do not proceed silently
   ```javascript
   if (!supabaseKey) {
     console.error('❌ Missing SUPABASE_SERVICE_KEY in .env.local');
     process.exit(1);
   }
   ```

3. **Never log credential values** — not even masked or abbreviated
   ```javascript
   // ❌ BAD: console.log(`URL: ${supabaseUrl}`)
   // ✅ GOOD: console.log('✅ Connected to Supabase')
   ```

4. **Validate external URLs beyond HTTP status** — check redirects and final URL
   ```javascript
   // HEAD requests don't catch soft-404s. Use GET with redirect: 'follow'
   // and check final URL for /404 patterns.
   ```

5. **Always dry-run before full batch** — `--limit=5 --dry-run` is mandatory
   - Validates credentials, network, and logic before touching production data
   - Tests must pass before any DB writes

6. **Commit the script (with .env.local.example) before first run** — never run untested code against prod

## Session end checklist
npm run build must pass. Commit: feat: epic-N <description>. Deploy: npx vercel --prod
```

## 11. Self-check before finishing any task
1. Did I verify every factual claim (paths, versions, capabilities, schema)? How?
2. Any secrets in my output? (must be no)
3. Did I stay within source-of-truth scope?
4. Did I label assumptions vs verified facts?
5. Does my script need the network? If yes — did I give Christopher the local run command instead of running it myself?
Fix any unsatisfactory answer before declaring done.
