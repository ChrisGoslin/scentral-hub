# Scentral Hub — Session Handover

**Date:** 2026-06-18  
**Purpose:** Paste this into a new Claude/Cowork chat to bootstrap full project context immediately.

---

## What Scentral is

A fragrance wardrobe PWA targeting App Store + Play Store launch. Think "Letterboxd for fragrance."
- **Live:** https://scentral-hub.vercel.app
- **Repo:** ~/Projects/scentral-hub
- **Stack:** Next.js 16.2.9 · React 19.2.4 · Supabase (project: scentral-mvp) · Vercel · TypeScript
- **Architecture lock:** NO AUTH for MVP · `isPro = false` · do not touch `/intelligence`, `/dna-match`, `/schedule`

---

## Phases complete (on main as of 2026-06-18)

| Phase | What shipped |
|---|---|
| 0 | Bug fixes — PWA manifest, dvh, safe-area, image contain, DB filter values |
| 1-A | Sanctuary Profiler — 4-step onboarding quiz → persona reveal → `/discover?persona=id` |
| 1-B | Persona-aware Discover — banner, bgGradient, pre-filtered feel chip on mount |
| 2-B | Ambient feel-filter colour wash overlay in DiscoverClient |
| 3-A | Living Wardrobe shelf — bottle portrait orientation, drop shadows |
| 5-A | Landing page overhaul — hero, how-it-works strip, persona teasers |
| CSS | globals.css brand token system + `[data-theme="dark"]` block |
| DB fix | FEEL_PROJECTIONS + LONGEVITY_PROJECTIONS corrected to real DB enum values |

> ⚠️ **Verify before trusting**: run `git log --oneline -20` to confirm what actually landed on main.
> The sandbox cannot write to `.git` — all commits must be run manually by Christopher in Terminal:
> ```bash
> cd ~/Projects/scentral-hub
> git add -A && git commit -m "feat: <description>" && git push origin main
> ```

---

## Next tasks (in priority order)

1. **Phase 6-A — PostHog analytics**  
   Add `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local`, install `posthog-js`, wrap app in `PostHogProvider`, fire `page_view`, `feel_filter_applied`, `persona_set`, `wishlist_toggled` events.

2. **Phase 7-A — Legal pages**  
   `/privacy` and `/terms` — required before App Store submission. Plain Next.js pages, no DB.

3. **Real app icons**  
   `public/icons/icon-192.png` and `icon-512.png` are 1×1 placeholder PNGs. Generate real brand icons (amber resin colour `#A0622A` on parchment `#F7F3EE`).

4. **Social proof counts**  
   "X own this · Y wishlisted" on Discover cards + detail page. Pure Supabase COUNT query — no new columns needed if `wishlist` table exists.

5. **Billing / Pro unlock**  
   `isPro` is hardcoded `false`. Wire Stripe or similar when ready.

---

## Architecture constraints (must never violate)

- **CSS variables only** — `var(--accent)`, `var(--surface)`, `var(--text)`, `var(--text-muted)`, `var(--line)`, `var(--font-display)`, `var(--color-primary)`, `var(--bg)`. No hardcoded hex colours anywhere.
- **No secrets in code** — keys go in `.env.local` (gitignored), referenced via `process.env.*`.
- **`cabinetSnapshot` JSON event** in `WardrobeShelf.tsx` — never remove. Feeds a future CV pipeline.
- **DB projection values** — ONLY valid: `Beast Mode`, `Strong`, `Moderate`, `Medium`, `Weak`. The values `Light`, `Soft`, `Whisper`, `Heavy`, `Massive` DO NOT EXIST in the DB. Any filter code using these will return 0 results.
- **Legacy `scentral_vibe` bridge** in DiscoverClient — `VIBE_TO_FEEL` map must not be removed.
- **`min-h-[100dvh]`** + `env(safe-area-inset-bottom)` on all full-screen containers.

---

## Key files

| File | What it does |
|---|---|
| `lib/personas.ts` | Single source of truth for persona engine. Exports `Persona`, `PERSONAS`, `getPersonaById`, `getPersonaByInputs` |
| `app/onboarding/page.tsx` | 4-step Sanctuary Profiler. Writes to localStorage, routes to `/discover?persona=id` |
| `app/(main)/discover/DiscoverClient.tsx` | Heaviest client component. Persona banner, ambient glow, feel/longevity/brand filters, wishlist |
| `app/page.tsx` | Landing page — sync Server Component, uses `PERSONAS` from lib/personas.ts |
| `app/globals.css` | Brand token system — `--color-primary: #A0622A`, `--color-bg: #F7F3EE`, dark mode block |
| `public/manifest.json` | PWA manifest — background_color=#F7F3EE, theme_color=#A0622A |
| `AGENTS.md` | Ground truth for the codebase. Read §1 before making any change. §0 lists known fabrications. |
| `PROJECTS.md` | Live build status. Only mark [x] after `git log` confirms it landed. |
| `LAUNCH_PLAN.md` | Full App Store launch plan and phase roadmap |

---

## Persona engine

Three personas, defined entirely in `lib/personas.ts`:

| ID | Name | Families |
|---|---|---|
| `velvet_intellectual` | The Velvet Intellectual | Leather, Tobacco, Oud, Smoky, Resinous |
| `solar_minimalist` | The Solar Minimalist | Citrus, Aquatic, Green, Fresh Spicy |
| `dark_alchemist` | The Dark Alchemist | Amber, Oriental, Woody Oriental, Gourmand |

localStorage keys: `scentral_persona` (id), `scentral_persona_name`, `scentral_onboarded`, `scentral_wishlist`, `scentral_discover_sort`

---

## localStorage keys

| Key | Value |
|---|---|
| `scentral_persona` | persona id string |
| `scentral_persona_name` | display name string |
| `scentral_onboarded` | `"true"` |
| `scentral_wishlist` | JSON array of fragrance IDs |
| `scentral_discover_sort` | sort key string |
| `scentral_vibe` | legacy — still bridged via `VIBE_TO_FEEL` map in DiscoverClient |

---

## Sandbox constraints

- Cowork sandbox has **no outbound network** — scripts that call external services must run locally in Christopher's Terminal.
- Sandbox cannot write to `.git` — all commits must run in Terminal.
- Verification gate before declaring any task done: `tsc --noEmit --skipLibCheck` must return 0 errors.

---

## Known fabrications (never reintroduce)

Phrases written by an earlier hallucinating agent that do NOT represent real features. Treat as red flags:

> Hegemony · Olfactory NFTs · Invisible Commerce · Shadow Branching · Enshrinement Shelf · Dynamic Aura · Reinforcement Sommelier · Sillage telemetry network · Accord Creator v2

Full list in `AGENTS.md §0`.

---

## How to start the next session

1. Read `AGENTS.md §1` (ground truth).
2. Run `git log --oneline -10` to see what actually landed.
3. Update `PROJECTS.md` Completed / In progress to match reality.
4. Pick the top task from "Next tasks" above.
5. Run `tsc --noEmit --skipLibCheck` before and after any code change.
