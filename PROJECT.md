# Project: nota. Design & Experience Sweep (Perfumery's Workshop Vibe)

## Architecture
nota. is a Next.js 16 app with Tailwind CSS 4, utilizing a Supabase backend and Tailwind CSS variables for its design system.
The core views to update are:
- `DiscoverGrid` (`app/(main)/discover/DiscoverGrid.tsx`) - Rebuild as staggered/overlapping tactile moodboard layout.
- `WardrobeShelf` (`app/(main)/collection/WardrobeShelf.tsx`) - Personalize to user's Scent Identity, integrating ink, clay, brass, and smoked glass elements.
- `InsightsPanel` (`app/(main)/you/InsightsPanel.tsx`) - Integrate handwritten post-its/sketches using Caveat font.
- `EmptyState` (`components/ui/EmptyState.tsx`) - Infuse with handwritten style and personalized hints.

Design Tokens & Fonts:
- **The Vessel (Display font)**: Instrument Serif Italic (~10%, emotional/display, `--font-instrument-serif`)
- **The Instrument (Sans font)**: Geist (~90%, body/labels, `--font-geist` or standard sans)
- **Handwritten font**: Caveat (handwritten/sketches, `--font-handwritten` or standard imports, for annotations)
- **Palette**: Ivory paper (`--surface` #F7F4EE), Charcoal ink (`--on-surface` #2B2926), Taupe (`--secondary-ink` #766E64), Olive (`--alignment` #6B7250), Moss (`--evolution` #4A5940), Amber (`--primary` #A0622A).
- **Tactile Physics**: 2% SVG fractal noise grain, 0px structural radius, `mix-blend-multiply` for stamps.

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
