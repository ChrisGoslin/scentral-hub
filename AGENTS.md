<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Operating rules for ALL CLI agents on Scentral (Claude Code, Antigravity, Gemini, etc.)

**Owner:** Christopher. **Purpose:** prevent invented facts, paths, keys, and scope.
This is the SINGLE canonical instructions file. `CLAUDE.md` and `GEMINI.md` point here. Read this FIRST, every session, before acting. Begin your first reply by stating in one line what you grounded yourself in.
**Supplementary reading:** `skills/grounded-agent-guardrails/SKILL.md` — expands the five safeguards with verification commands, known fabrications list, and a session-start checklist.

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
"300+ fragrances" (canonical count is 282), "Next.js 16" (assert only if package.json confirms), "Agent Luna / Sovereign Focus Group",
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

## 6. Self-check before finishing any task
1. Did I verify every factual claim (paths, versions, capabilities, schema)? How?
2. Any secrets in my output? (must be no)
3. Did I stay within source-of-truth scope?
4. Did I label assumptions vs verified facts?
Fix any unsatisfactory answer before declaring done.
