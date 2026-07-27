# Project: nota. Design & Experience Sweep (Perfumery's Workshop Vibe)

## Architecture
nota. is a Next.js 16 app with Tailwind CSS 4, utilizing a Supabase backend and Tailwind CSS variables for its design system.
The core views to update are:
- `DiscoverGrid` (`app/(main)/discover/DiscoverGrid.tsx`) - Rebuild as staggered/overlapping tactile moodboard layout.
- `WardrobeShelf` (`app/(main)/collection/WardrobeShelf.tsx`) - Personalize to user's Scent Identity, integrating ink, clay, brass, and smoked glass elements.
- `InsightsPanel` (`app/(main)/you/InsightsPanel.tsx`) - Integrate handwritten post-its/sketches using Caveat font.
- `EmptyState` (`components/ui/EmptyState.tsx`) - Infuse with handwritten style and personalized hints.

Design Tokens & Fonts:
- **Display font**: Cormorant Garamond (emotional/display, `--font-display`)
- **Handwritten font**: Caveat (handwritten/sketches, `--font-handwritten` or standard imports)
- **Palette**: Ink, clay, brass, smoked glass on top of Stone-50 background and Fragrance Gold accent.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Exploration & Research | Run codebase search, modern-web-guidance analysis, and document setup plan | None | DONE |
| M2 | Primitives & Tokens Setup | Install/verify Caveat font, add theme variables, construct PostItNote & SketchAnnotation | M1 | DONE |
| M3 | Moodboard DiscoverGrid | Transform discover grid into staggered/tactile moodboard using subgrid/container queries | M2 | DONE |
| M4 | Personalization Sweep | Apply workshop vibes & annotations to WardrobeShelf, InsightsPanel, Empty States | M3 | DONE |
| M5 | Verification & Hardening | Run builds, Playwright tests (`discover.spec.ts`, `onboarding.spec.ts`), adversarial tests, and Forensic Audit | M4 | DONE |

## Interface Contracts
### `PostItNote` / `SketchAnnotation` Components
- Render custom thoughts or insights dynamically using the user's `Persona` and `Read`.
- Configurable color accents (clay, ink, brass, smoked glass) matching Scent Identity.

## Code Layout
- `app/` - App router pages, routes, layout, global css.
- `components/` - Shared components (UI primitives, temptations, aura).
- `e2e/` - Playwright integration test suites.
