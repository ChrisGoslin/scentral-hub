# Project Plan — Scentral Hub Design & Experience Sweep

## Objective
Imbue the "perfumery's workshop" vibe (ink, clay, brass, smoked glass, handwritten Caveat font, moodboard layout) into Scentral Hub (nota.), personalized to the user's Scent Identity.

## Milestones

### Milestone 1: Exploration & Research
- **Goal**: Research components, fonts (Caveat), tailwind config, existing layout, and modern-web-guidance. Propose exact styling approach.
- **Verification**: Exploration report containing file paths, component analysis, and guidance.
- **Status**: COMPLETED

### Milestone 2: Primitives & Tokens Setup
- **Goal**: Introduce/update CSS variables for the "perfumery's workshop" palette (ink, clay, brass, smoked glass). Ensure Caveat font is integrated. Build and verify new primitives like `PostItNote` and `SketchAnnotation` components.
- **Verification**: Primitives build correctly, TypeScript/ESLint check passes.
- **Status**: COMPLETED

### Milestone 3: Moodboard DiscoverGrid Implementation
- **Goal**: Refactor the rigid `DiscoverGrid` into a tactile, staggered/overlapping moodboard layout using modern CSS (Grid/Flex/Subgrid/Container queries). Personalize layouts/graphics based on user's Scent Identity.
- **Verification**: Discover view compiles, UI matches spec, and tests pass.
- **Status**: COMPLETED

### Milestone 4: Personalization Sweep (WardrobeShelf, InsightsPanel, Empty States)
- **Goal**: Implement atelier aesthetic and hand-written annotations inside `WardrobeShelf`, `InsightsPanel`, and `EmptyStates`. Incorporate user Scent Identity.
- **Verification**: Layouts look cohesive, personalization works, all UI components build.
- **Status**: COMPLETED

### Milestone 5: E2E Verification & Adversarial Hardening
- **Goal**: Run all Playwright E2E tests (`discover.spec.ts`, `onboarding.spec.ts`) and ensure they pass. Fix any breaks. Run Forensic Auditor.
- **Verification**: 100% test pass, green build, forensic audit reports CLEAN.
- **Status**: COMPLETED
