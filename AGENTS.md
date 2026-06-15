<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Operating rules for ALL CLI agents on Scentral (Claude Code, Antigravity, Gemini, etc.)

**Owner:** Christopher. **Purpose:** prevent invented facts, paths, keys, and scope.
This is the SINGLE canonical instructions file. `CLAUDE.md` and `GEMINI.md` point here. Read this FIRST, every session, before acting. Begin your first reply by stating in one line what you grounded yourself in.
**Supplementary reading:** `skills/grounded-agent-guardrails/SKILL.md` — expands the five safeguards with verification commands, known fabrications list, and a session-start checklist.
**Critical operating rules:** §8 (script execution + network constraint), §9 (lessons learned), §10 (self-check).

## 0. Why this file exists
Prior agent runs produced confident "breakthrough" output full of fabricated detail (fake repo paths,
fictional features, lore like "Agent Luna / Hegemony / Shadow Branching", and hardcoded keys). Root cause =
**confident invention**: stating things as fact without verifying. The failure mode to guard against is not
"being wrong" — it's "sounding certain while being wrong."

## 1. Ground truth (the ONLY accepted facts unless re-verified)
- **Repo:** `ChrisGoslin/scentral` (local folder may be named `scentral-hub` — same repo)
- **Supabase:** project `scentral-mvp` (`lrkdwobnemczvhpixpky`)
- **Data:** 282 fragrances. Columns include: plain_description, inspired_by, family, projection, optimal_season, use_case, lean.
- **Stack:** Next.js App Router, Supabase, Vercel, Tailwind, `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (Living Wardrobe). (Verify the exact Next.js version from
  package.json / node_modules — do NOT assert a version from memory.)
- **Architecture:** Single product.
- **Routes:**
  - `/` (Landing page)
  - `/discover` (Search and explore catalogue)
  - `/collection` (My Bottles — user inventory)
  - `/collection/[id]` (Fragrance detail view)
  - `/layering` (Lab — combine scents)
  - `/you` (User profile and insights)
  - `/dna-match` (Resonance — find similar scents)
  - `/intelligence` (Wardrobe Intelligence — gated)
  - `/schedule` (Daily ritual planner)
  - `/ritual/[id]` (Public shareable ritual page)
  - `/onboarding` (3-step new user guide)
  - `/learning` (Guides and tips)
  - `/profile` (User settings)
  - `/disclaimer` (Legal)
  - `/waitlist` (Lead gen)
- **API Routes:** `/api/aura`, `/api/chemist`, `/api/demo`, `/api/dna-match`, `/api/formulate`, `/api/fragrances`, `/api/generate-image`, `/api/layering`, `/api/scan`, `/api/schedule`, `/api/sommelier`, `/api/waitlist`.
- **UI Component Library:** `Button`, `Disclosure`, `LoadingShimmer`, `Sheet`, `Card`, `EmptyState`, `ProGate`, `Chip`, `ErrorInline`, `SensoryAnatomy`.
- **Collection / Living Wardrobe components** (all in `app/(main)/collection/`): `WardrobeShelf` (walnut-cabinet shelf container), `ShelfTier` (individual 3D shelf row), `BottleCard` (draggable bottle card — dnd-kit sortable), `WardrobeSidebar` (view-mode toggle: All / By House / By Season / Wishlist).
- **Tables:** `fragrances`, `collections`, `wear_logs`, `layering_combinations`, `layer_recipes`, `spritz_schedules`, `profiles`, `waitlist`.
- **Free/Pro split:** Free = Discover, My Bottles, Layering, You. Pro = gated behind `components/ui/ProGate.tsx` (`isPro = false`). Do NOT remove gates.
- **localStorage keys:** `scentral_onboarded`, `scentral_vibe`, `scentral_discover_sort`, `scentral_wishlist`, `scentral-environment`, `scentral-use-cases`.
- **Living Wardrobe (Collection page):**
  - Shelf layout — 4 tiers, ordered top-to-bottom by affinity score:
    - *Top Signatures* (affinity 16–20)
    - *Occasion Modifiers* (affinity 8–15)
    - *Base Anchors* (affinity 1–7)
    - *Holding Zone* (unrated)
  - Drag-and-drop reorder via dnd-kit; every drop emits a `cabinetSnapshot` JSON event (vision pipeline hook for future computer-vision shelf detection — do NOT remove this hook).
  - Sidebar view modes: All, By House, By Season, Wishlist.
  - Visual style: walnut cabinet aesthetic; 3D shelf depth per row.
- **Personas:** See `SCENTRAL_PERSONAS.md`. Gavan (newcomer, plain language). Christopher (enthusiast, expert).
- **Source-of-truth docs:** `AGENTS.md` (this file), `SCENTRAL_PERSONAS.md`.

If a "fact" is not in these docs, the repo, or the database, it is NOT a fact yet — verify it or label it unverified.

### Known fabrications — never reintroduce
"Morocco Marketplace Demo", "Resonance Engine / pgvector" (unless referring to the `/dna-match` route), "Alchemist Knowledge Base / dossiers",
"300+ fragrances" (canonical count is 282), "Agent Luna / Sovereign Focus Group",
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
- **Start of session:** read this file + `SCENTRAL_PERSONAS.md` + run the branch hygiene checklist at `skills/branch-hygiene/SKILL.md`. State what you grounded on in your first reply.
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
cd ~/Projects/scentral-hub && npx vercel --prod
```

This takes ~60s and aliases directly to `scentral-seven.vercel.app`. Confirm READY state before declaring a task done.

## 8. Script execution rules (critical — read before running any script)

**The Cowork/sandbox bash environment has NO outbound network.** Any script that calls external services
(Supabase, Parfumo, Fragrantica, Vercel, OpenAI, etc.) will fail with `EAI_AGAIN` or `ECONNREFUSED`.

**Rule: never run external-network scripts from bash.** Instead, give Christopher the exact local command:
```bash
cd ~/Projects/scentral-hub
node scripts/<script-name>.mjs [--dry-run] [--limit=N]
```

**Scripts that MUST run locally (not in sandbox):**
- `scripts/backfill-parfumo-images.mjs` — Playwright + Parfumo/Fragrantica image scraping
- `scripts/migrate-images-to-storage.mjs` — Supabase Storage upload
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

## 10. LLM briefing block (copy-paste into Cursor / ChatGPT / other agents)

Use this block when starting a new LLM session on Scentral. It is the canonical summary — keep it in sync when architecture changes.

```
# Scentral — Project Briefing

## Stack (verified from package.json)
- Next.js 16.2.9 (App Router, route groups like `(main)`)
- React 19.2.4
- Supabase JS 2.x — project `scentral-mvp` (lrkdwobnemczvhpixpky)
- Deployed on Vercel → scentral-seven.vercel.app
- Tailwind CSS + CSS variables for all colours (NO hardcoded hex values)
- @dnd-kit/core + @dnd-kit/sortable for Living Wardrobe drag-and-drop

## Aesthetic
"Quiet luxury" — off-white/stone backgrounds, Fragrance Gold accent (#c49a3c via var(--accent)),
editorial typography, generous whitespace. CSS variables only: var(--bg), var(--surface),
var(--surface-2), var(--text), var(--text-muted), var(--accent), var(--line), var(--r-card), var(--r-btn).

## Architecture rules
- Server components for all data fetching. Add "use client" only when hooks or browser APIs are needed.
- isMobile: useEffect + window.innerWidth < 480 resize listener (client components only).
- Server component responsive sizing: use CSS math — min(45vw, 200px), clamp() — not hooks.
- Horizontal scroll strips: add <div style={{ flexShrink: 0, width: 16 }} /> as trailing spacer.
- iOS safe area: paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)'
- Responsive grids: repeat(auto-fit, minmax(Npx, 1fr)) — never repeat(N, 1fr) hardcoded.
- Global CSS font scaling: clamp() on --font-size-display / --font-size-body / --font-size-label.
- overflow-x: hidden on html, body to prevent horizontal scroll on mobile.

## Database tables
fragrances (282 rows) — plain_description, inspired_by, family, projection, optimal_season, use_case, lean, image_url
collections — fragrance_id, affinity_score (int 1-20), maceration_started_at, status
wear_logs — streak calculation is timezone-aware, do not break
layering_combinations, layer_recipes, spritz_schedules, profiles, waitlist

## localStorage keys
scentral_onboarded, scentral_vibe, scentral_discover_sort, scentral_wishlist,
scentral-environment, scentral-use-cases

## Critical business logic
- affinity_score 16-20 = Top Signatures, 8-15 = Occasion Modifiers, 1-7 = Base Anchors, null/0 = Holding Zone
- Every dnd-kit drag-drop MUST emit cabinetSnapshot JSON event — feeds future vision pipeline, do not remove
- rating in DB is 0-10; display as 5-star: Math.round(rating / 2)
- isPro = false — ProGate is active. Do NOT touch /intelligence, /dna-match, /schedule pages.

## Free/Pro split
Free: /discover, /collection, /collection/[id], /layering, /you
Pro (gated): /intelligence, /dna-match, /schedule

## Scripts (run locally — sandbox has no outbound network)
node scripts/backfill-parfumo-images.mjs --dry-run --limit=5   # Playwright, Parfumo + Fragrantica
node scripts/migrate-images-to-storage.mjs --dry-run --limit=5 # copy images to Supabase Storage
node scripts/smoke-test.mjs                                     # hits live Vercel URL

## No secrets in code. Keys in .env.local only. NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY.
```

## 11. Self-check before finishing any task
1. Did I verify every factual claim (paths, versions, capabilities, schema)? How?
2. Any secrets in my output? (must be no)
3. Did I stay within source-of-truth scope?
4. Did I label assumptions vs verified facts?
5. Does my script need the network? If yes — did I give Christopher the local run command instead of running it myself?
Fix any unsatisfactory answer before declaring done.
