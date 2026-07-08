## 2026-07-08T01:34:24Z

You are the Personalization Sweep Worker for Milestone 4.
Your working directory is `/Users/christophergoslin/Projects/scentral-hub/.agents/worker_m4`.

Please complete the following tasks:
1. Update `/Users/christophergoslin/Projects/scentral-hub/app/(main)/collection/WardrobeShelf.tsx` to integrate our custom primitive components:
   - Import `PostItNote` and `SketchAnnotation`.
   - Implement client-safe state loading for the user's scent persona from localStorage (hydration-safe, similar to the DiscoverGrid component).
   - Render a handwritten scrapbook-style `PostItNote` (using variant "brass" or "clay") and a `SketchAnnotation` at the bottom of the cabinet view (e.g. after the shelf tiers inside the cabinet container frame). The note should display user-personalized text (e.g. the active persona's name, tagline, and custom layering tips for their wardrobe).
2. Update `/Users/christophergoslin/Projects/scentral-hub/app/(main)/you/InsightsPanel.tsx` to incorporate personalization and workshop vibes:
   - Import `PostItNote` and `SketchAnnotation`.
   - Implement client-safe state loading for the user's scent persona.
   - Add a personalized `PostItNote` (e.g. variant "ink" or "smoked-glass") inside the Weekly Stats or Rotation Intelligence sections rendering user-specific profile taglines and rotation tips.
   - Decorate section headers (such as "THIS WEEK" or "MY WISHLIST") with organic `SketchAnnotation` handwritten notes or sketchy arrow markers.
3. Verify that the project builds and compiles cleanly by running `npx tsc --noEmit` and `npm run build`.
4. Run Playwright tests (`e2e/you-tab.spec.ts`, `e2e/collection.spec.ts`) to ensure that all core features function perfectly and tests pass.
5. Write your handoff.md inside your directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT
hardcode test results, create dummy/facade implementations, or
circumvent the intended task. A Forensic Auditor will independently
verify your work. Integrity violations WILL be detected and your
work WILL be rejected.
