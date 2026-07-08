# Original User Request

## 2026-07-08T01:26:25Z

Implement a comprehensive design and experience sweep to imbue the "perfumery's workshop" vibe (notes, sketches, post-its, tablets, moodboards) into the core of nota. Every interaction, font, and imagery (except for the actual fragrance bottles) must be personalized to the user's Scent Identity to push this to be a world-leading experiential application.

Working directory: /Users/christophergoslin/Projects/scentral-hub
Integrity mode: development (no restrictions, aim for highest quality)

## Requirements

### R1. Deep Personalization & "Atelier" Vibe Integration
Update core views (`DiscoverGrid`, `WardrobeShelf`, `InsightsPanel`, Empty States) to utilize the "ink, clay, brass, and smoked glass" aesthetic. Introduce new primitive components (e.g., `PostItNote`, `SketchAnnotation`) that dynamically render handwritten (`Caveat` font) insights drawn from the user's `Persona` and `Read`.

### R2. Moodboard Layout
Transform rigid UI structures (like the Discover grid) into a tactile, staggered, or overlapping moodboard layout. Let the agent team decide the right balance of physical scrapbook elements versus clean modern UI.

### R3. Modern Web Guidelines
Follow the `/modern-web-guidance` principles for CSS layouts. Ensure responsive, robust structures using modern features (grid, subgrid, container queries) without relying on heavy JS DOM manipulation where CSS suffices.

## Acceptance Criteria

### Functional Quality
- [ ] No new TypeScript or ESLint errors are introduced.
- [ ] Existing Playwright end-to-end tests (`discover.spec.ts`, `onboarding.spec.ts`) pass successfully.
- [ ] The app builds successfully (`npm run build`).

### Design Execution
- [ ] The Discover view clearly departs from a standard grid, adopting a moodboard or staggered aesthetic.
- [ ] At least two views (e.g., Empty States, Insights Panel) surface personalized text using a handwritten/sketch style.
- [ ] The core functionality (viewing fragrances, adding to shelf, reading insights) remains fully intact.
