# Phase 2 Handover — Scentral Discovery & DNA-Match Polish

**Status:** Phase 1 complete and **greenlit**. Phase 2 (execution) not started.
**Grounded on:** `AGENTS.md` ground truth, `app/globals.css`, `lib/design/tokens.css`, and direct reads of every file listed below (paths + line numbers verified on read).
**For the executing agent:** Read `AGENTS.md` FIRST (five safeguards). Then this file. Everything you need to ship is here — you do not need to re-derive the analysis.

---

## 0. Hard constraints (do not violate)

- **Stack (verified):** Next.js App Router, React, TypeScript, Tailwind v4, Supabase SSR. Verify the Next.js version from `package.json` / `node_modules` before asserting it — do **not** claim "Next.js 16" from memory (it's a known fabrication per `AGENTS.md`).
- **DO NOT touch** `app/api/dna-match/route.ts` or any file under `supabase/migrations/`. Schema + API are locked.
- **No new packages, no new DBs, no new AI providers.** `lucide-react` is already a dependency and exports `Dna` — use it.
- **No secrets in code.** Env via `process.env` only.
- Every logical group of changes must pass **`npm run build`** before moving on.
- Match the existing visual language: design tokens in `lib/design/tokens.css` (`--accent: #c49a3c`, `--bg`, `--surface`, `--text`, `--text-muted`, `--line`, `--font-display` = Fraunces serif, `--font-ui` = Inter). Collection (`The Wardrobe`) and You pages use a **flush header** pattern: `px-4 pt-8 pb-4` header with `borderBottom: 1px solid var(--line)`, scrollable body. DNA Match must be rewritten to match this — it currently does not.

---

## 1. The 5 changes (in recommended execution order)

### CHANGE 1 — Move DNA Match into the `(main)` route group
**Why:** `app/dna-match/` sits OUTSIDE `app/(main)/`, so it gets no `BottomNav` and none of the `pb-20` shell. A core AI feature is unreachable from primary nav.

- Move `app/dna-match/page.tsx` → `app/(main)/dna-match/page.tsx`
- Move `app/dna-match/DNAMatchClient.tsx` → `app/(main)/dna-match/DNAMatchClient.tsx`
- **Import fix:** `DNAMatchClient.tsx:5` imports `AudioChord` via `'../components/AudioChord'`. From the old location `app/dna-match/`, `../components` = `app/components` ✓. From the new location `app/(main)/dna-match/`, `../components` = `app/(main)/components` ✗ (does not exist). Change it to `'@/app/components/AudioChord'` (the `@/` alias maps to repo root — confirm in `tsconfig.json` before relying on it; `ChemistPanel` is already imported as `'@/components/ChemistPanel'` so the alias is in use).
- `page.tsx` imports `./DNAMatchClient` (relative, moves cleanly) and `@/utils/supabase/server` (alias, unaffected). No change needed beyond the move.
- The `(main)/layout.tsx` wraps children in `<main className="flex-1 pb-20">` + `<BottomNav />`, so the route gains nav + bottom padding for free. **Remove** the now-redundant outer `<div className="min-h-screen">` wrapper in `page.tsx` only if it conflicts with the shell; otherwise leave it.
- After moving, delete the empty `app/dna-match/` directory.

### CHANGE 2 — Add 5th nav tab + accessibility fix in `BottomNav`
**File:** `app/components/BottomNav.tsx`
**Current problems:** 4 tabs; label `fontSize: 8` (below legible floor); grid is `repeat(4, 1fr)`; long labels ("The Wardrobe", "The Atelier").

- Import `Dna` from `lucide-react` (add to existing `import { Archive, FlaskConical, Calendar, User } from 'lucide-react'`).
- Add nav item: `{ label: 'Resonance', href: '/dna-match', Icon: Dna }`. Decide placement — recommended order: `Wardrobe · Lab · Resonance · Ritual · You` (Resonance center). Shorten labels to single words: `Wardrobe`, `Lab`, `Resonance`, `Ritual`, `You`.
- Change grid from `repeat(4, 1fr)` → `repeat(5, 1fr)`.
- Bump label `fontSize: 8` → `10`.
- Add active-state micro-feedback: a `transform: scale(1.12)` (or similar) on the active `<Icon>`, transitioning via the existing `var(--motion-fast)`.
- Keep the existing `isActive` logic (`pathname === href || pathname.startsWith(\`${href}/\`)`), `aria-current`, and `min-h-[44px]` touch target.

### CHANGE 3 — Pre-seed DNA Match picker from `?a=<id>` (deep-link support)
**File:** `app/(main)/dna-match/DNAMatchClient.tsx`
**Why:** the picker currently ignores all query params; it must accept an incoming fragrance ID and pre-select Essence Alpha.

- Import `useSearchParams` from `next/navigation` (`useRouter` is already imported).
- On mount (`useEffect`), read `searchParams.get('a')`. If present, find the matching fragrance in the `fragrances` prop by `id` and `setFragA(match)`. Guard against null (id not found → no-op).
- This pairs with CHANGE 5. Use `?a=<id>` as the contract (NOT `?search=`).

### CHANGE 4 — Fix picker close-on-outside-tap + expose editorial note + add result header
**File:** `app/(main)/dna-match/DNAMatchClient.tsx`

1. **Click-outside close:** `FragrancePicker` (defined at `:199`) has local `open` state that only clears on item select (`:248`). Add a `useRef` on the picker's outer wrapper `<div>` and a `useEffect` registering a `mousedown`/`pointerdown` listener that sets `open=false` when the click target is outside the ref. Clean up the listener on unmount. Apply to BOTH picker instances (it's one reusable component, so the fix lands once).
2. **Editorial note shown by default:** Remove the `expanded` toggle (`:32`, `:163-176`). Render `result.narrative` always-visible inside the result card (keep the `italic leading-relaxed` styling). Drop the "Read Editorial Note ▼ / Hide ▲" button entirely.
3. **Two-fragrance result header:** Inside the result card (`:142`), above the `ScoreRing`, add a compact row showing both selected fragrances (brand uppercase + name) side by side with a `×` or `→` between them, so the user never loses context of what was compared. Pull from `fragA` / `fragB` state (both are guaranteed non-null when a result exists).

### CHANGE 5 — Fix the Collection → DNA Match handoff link
**File:** `app/(main)/collection/CollectionClient.tsx:124`
**Current (broken):** `href={\`/dna-match?search=${encodeURIComponent(f.family)}\`}` — `DNAMatchClient` never reads `?search`, so the link lands on a blank picker.
**Change to:** `href={\`/dna-match?a=${f.id}\`}` — lands with Essence Alpha pre-filled (via CHANGE 3). One tap to a half-complete comparison instead of a dead end.

---

## 2. Mobile layout rewrite (part of CHANGE 1/4, same file)

`DNAMatchClient.tsx:95` is desktop-first: `max-w-4xl mx-auto px-6 py-16 space-y-12` with a `md:grid-cols-2` picker grid (`:101`). On a 390px phone this is wrong.

- Replace the page-level padding with the app's mobile pattern: a flush header (`px-4 pt-8 pb-4`, `borderBottom: 1px solid var(--line)`, `<h1>` in `var(--font-display)` ~28px) + a `px-4 py-4` body. Drop `py-16`.
- Keep `md:grid-cols-2` for the two pickers on wide screens but ensure it stacks cleanly (`grid-cols-1`) and the gap shrinks on mobile (`gap-4` not `gap-12`).
- The `AudioChord` `<aside className="fixed bottom-8 right-8">` (`:192`) now overlaps the BottomNav (which the route gains in CHANGE 1). Raise it to `bottom-24` (or position it above the 56px nav + safe-area inset) so it doesn't sit under the nav bar.

---

## 3. File-by-file change map

| File | Action |
|---|---|
| `app/dna-match/page.tsx` | **Move** → `app/(main)/dna-match/page.tsx`. No code change (imports are `./` + `@/`). Drop redundant `min-h-screen` wrapper if it fights the shell. |
| `app/dna-match/DNAMatchClient.tsx` | **Move** → `app/(main)/dna-match/`. Fix `AudioChord` import to `@/app/components/AudioChord`. Apply CHANGES 3, 4, and §2 layout rewrite. |
| `app/dna-match/` (dir) | **Delete** once empty. |
| `app/components/BottomNav.tsx` | CHANGE 2: 5th tab (`Dna`/Resonance), `repeat(5,1fr)`, font 8→10, shorten labels, active-icon scale transition. |
| `app/(main)/collection/CollectionClient.tsx` | CHANGE 5: line 124 `?search=${family}` → `?a=${f.id}`. |

**Untouched (verify you did not edit):** `app/api/dna-match/route.ts`, all `supabase/migrations/*`, `lib/design/tokens.css`, `app/globals.css` (unless a tiny nav-grid tweak is unavoidable — prefer inline style in the component).

---

## 4. Verification checklist (before declaring done)

1. `npm run build` passes clean after each logical group (at minimum: after the move+imports; after BottomNav; after DNAMatchClient rewrite; final).
2. `/dna-match` renders inside the phone shell **with** BottomNav visible and "Resonance" tab active.
3. Collection card "See similar profiles" → lands on `/dna-match` with Essence Alpha pre-filled.
4. Tapping outside an open picker dropdown closes it; both dropdowns can't get stuck open.
5. A computed result shows: two-fragrance header, score ring, category pill, and the editorial narrative **visible without a toggle**.
6. BottomNav labels legible (10px), 5 columns even, active icon has scale feedback.
7. No `?search=` references to `/dna-match` remain (grep to confirm). No edits to locked files (`git diff --stat`).
8. Open a single PR with all changes (the prompt asks for one PR at completion). Use `scripts/create-pr.sh` if it fits the repo's flow; otherwise standard `gh pr create`.

---

## 5. Self-check (from AGENTS.md §5)
Before finishing: confirm every path above still exists (they were verified at handover time but re-check after the move), no secrets introduced, scope held to these 5 changes, and assumptions labeled. The `@/` alias is **verified**: `tsconfig.json` declares `"paths": { "@/*": ["./*"] }`, so `@/app/components/AudioChord` resolves to `app/components/AudioChord`. Everything in this doc is **verified** unless explicitly labeled otherwise.
