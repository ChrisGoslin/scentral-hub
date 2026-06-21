# AnotherSense — Master Product Specification (June 2026)

> ⚠️ Previous vision ("Sensory Sovereignty", "Morocco Sprint", "Resonance Engine") is retired.
> This document reflects the AnotherSense rebrand and 4-week App Store sprint locked 2026-06-20.
> Full spec + Epic prompts: `docs/specs/AnotherSense_Final_UX_Overhaul.md`
> Sprint plan + daily session map: `docs/AnotherSense_Execution_Brief.md`

---

## 🏛️ Vision: "The Product That Remembers How You Smell"

AnotherSense is a daily scent ritual app. It remembers your collection, recommends what to wear today (Aura), and maps your olfactory identity over time. The core loop is a dating-app-style swipe card that earns XP — habit-forming, Duolingo-meets-Tinder for fragrance.

**Target persona:** Gavin — the curious newcomer who has 3–10 bottles and wants to feel confident about wearing fragrance. Not the collector hobbyist. The person who bought a bottle and doesn't know when to wear it.

---

## 1. Current State (Live — as of 2026-06-21)

### Core Features (Shipped)
- **My Bottles (Collection):** Apothecary Grid shelf. 4 affinity tiers. dnd-kit drag-drop. `cabinetSnapshot` vision hook. `OptimizedBottleCard` (full-bleed image, family gradient, ombre overlay).
- **Discover:** Search + filter 282 fragrances. Persona-filtered recommendations. Sort by projection, season, family.
- **Layering Lab:** Dual-essence pairing canvas with harmony scoring.
- **Social:** Curated TikTok/YouTube fragrance content (no auth required).
- **Onboarding:** 3-step persona quiz (velvet_intellectual / solar_minimalist / dark_alchemist).
- **Typography:** Instrument Serif italic + Unbounded, both wired in `app/layout.tsx`.
- **Fonts + shadows:** Volumetric 8-layer shadow stack, haptics utility (`lib/haptics.ts`).

### Database (Supabase `scentral-mvp` — verified 2026-06-21)
| Table | Status | Notes |
|---|---|---|
| `fragrances` | ✅ 282 rows | Core catalogue |
| `collections` | ✅ + `scent_memory` | User bottle inventory |
| `wear_logs` | ✅ | Timezone-aware streak logic |
| `spritz_schedules` | ✅ | Reused by Epic 9 |
| `user_xp` | ✅ NEW | XP + level, keyed on `scentral_anon_id` |
| `user_streaks` | ✅ NEW | Daily wear streaks |
| `profiles`, `waitlist` | ✅ | Existing |

---

## 2. Active Sprint — 4 Weeks to App Store (12 Epics)

**Critical path:** Epic 0 → 1 → 12 → 9 → 10. These five must not slip.

| Epic | Name | Week | Status |
|---|---|---|---|
| 0 | AnotherSense rebrand (display strings, manifest, --aura tokens) | 1 | ⬜ TONIGHT |
| 1 | Motion + material foundation (CSS tokens, .surface-glass, shadows) | 1 | ⬜ |
| 12 | ToastProvider + ButtonAsync + AuraBubble | 1 | ⬜ |
| 2 | PresenceNav (floating pill, scroll-aware collapse) | 1 | ⬜ |
| 5 | Onboarding ceremony (arc progress, Aura reveal, confetti) | 2 | ⬜ |
| 3 | Apothecary Grid shelf polish (fluid level, drag physics, presets) | 2 | ⬜ |
| 6 | Scent Memory (long-press input, stored in `scent_memory` column) | 2 | ⬜ |
| 9 | Spritz Schedule (Aura card, swipe, XP engine, /spritz route) | 3 | ⬜ |
| 10 | Fragrance Wheel (9-axis SVG, gap analysis, share PNG, /wheel) | 3 | ⬜ |
| 4 | Mood Canvas (4-quadrant intent overlay) | 4 | ⬜ |
| 8 | Temporal theming (time-of-day CSS tokens) | 4 | ⬜ |
| 7 | Editorial cards + Feature Cards (AnatomyIndicator as hero) | 4 | ⬜ |
| 11 | Aura Edge Function (Claude Haiku copy) + App Store submission | 4 | ⬜ |

---

## 3. Key Product Decisions (Locked 2026-06-20)

| Decision | Answer |
|---|---|
| AI cost model | Hybrid: rules-based Aura logic (free) + Claude Haiku for italic copy (~£9/month at 1K DAU) |
| Auth strategy | No auth for MVP. Identity via `scentral_anon_id` localStorage UUID |
| Video content | OUT. `AnatomyIndicator` SVG replaces video in Feature Cards (more on-brand, zero production cost) |
| Shelf paradigm | Apothecary Grid (3-col, 2:3 ratio, drag physics) |
| Gamification | Supabase `user_xp` + `user_streaks` via `scentral_anon_id` |
| Rebrand scope | Display-layer only. Repo, DB, tables: unchanged |

---

## 4. Design System — AnotherSense Aura Design Language

All tokens in `app/globals.css` or `lib/design/tokens.css`. No hardcoded hex. Ever.

**Aura tokens:** `--aura: oklch(0.72 0.08 60)` · `--aura-surface` · `--aura-border` · `--xp-color: oklch(0.78 0.14 85)`
**Motion:** `--motion-instant` (80ms) · `--motion-responsive` (200ms) · `--motion-ceremonial` (480ms) · `--motion-organic` (800ms)
**Typography:** Instrument Serif italic (Aura voice, emotional copy) + Unbounded (nav, functional)
**Material:** `.surface-glass` — warm translucency with amber-shifted `backdrop-filter`
**Shadows:** `--shadow-object` (8-layer ambient occlusion) · `--shadow-elevated` (with Aura accent ring)

---

## 5. Governance

- **The Golden Source:** `AGENTS.md` + `docs/specs/AnotherSense_Final_UX_Overhaul.md`
- **cabinetSnapshot:** The `CustomEvent('cabinetSnapshot')` in `WardrobeShelf.tsx` is sacred. Never remove.
- **No secrets in code:** Keys in `.env.local`. `ANTHROPIC_API_KEY` in Supabase Vault only.
- **CSS variables only:** No hardcoded hex in any new or edited file.
- **One Epic per Claude Code session:** Never mix Epics — causes untraceable regressions.
- **Build check:** Every session ends with `npm run build` + `npx vercel --prod`.
