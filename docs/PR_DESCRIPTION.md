# PR: landing-scent-bloom-plus-audio

This PR layers premium polish onto the landing hero and demo flows: refined hero layout, interactive scent bloom, and an optional audio chord micro-interaction—plus supporting docs and small accessibility improvements.

Key changes

- Landing hero: two-column sensory hero and refined CTAs (`app/page.tsx`)
- Decorative art: `public/images/landing-art.svg`
- Demo save flow: `app/components/DemoSave.tsx` + `app/api/demo/save/route.ts`
- Shared toast system: `app/components/ToastProvider.tsx`, `app/components/useToast.tsx`
- Micro-interaction: `app/components/ScentBloom.tsx` with CSS in `app/globals.css` (pointer-follow radial bloom, subtle parallax tilt)
- Optional audio micro-interaction: `app/components/AudioChord.tsx` (toggleable WebAudio soft pad)
- Small global styles: animations, focus rings, reduced-motion respects (`app/globals.css`)
- Docs: `docs/ux/scentral-landing-spec.md`, `docs/ux/scentral-landing-checklist.md`, updated `PROJECTS.md`

Files to review

- `app/page.tsx`
- `app/components/DemoSave.tsx`
- `app/components/ToastProvider.tsx`
- `app/components/ScentBloom.tsx`
- `app/components/AudioChord.tsx`
- `app/globals.css`
- `app/api/demo/save/route.ts`
- `docs/ux/scentral-landing-spec.md`
- `docs/ux/scentral-landing-checklist.md`
- `PROJECTS.md`

Reviewer checklist / How to test

1. Local dev build

```bash
cd scentral
npm install
npm run dev
```

## Basic checks (desktop + small viewport)

- Hero layout renders and is responsive across breakpoints
- CTAs (Layering Lab, Collection) work and have hover/focus styles
- Decorative art is visible on large screens and does not overlap content

## Demo save + toast

- Click the Demo Save control and verify a network POST to `/api/demo/save`
- Confirm toast appears and disappears

## Scent bloom interaction

- Move the pointer over the hero art: radial glow should follow pointer and image should subtly tilt
- On pointer leave, bloom resets
- Verify reduced-motion: enable OS reduced motion and confirm bloom/float animations are disabled

## Audio chord (optional)

- Toggle the audio button top-right to enable audio (user gesture required to activate AudioContext)
- When enabled, pointer movement over the art triggers a soft pad (throttled); toggle persists via localStorage
- Audio is muted by default for safe testing

## Accessibility

- All interactive controls have visible focus styles and ARIA labels
- Toast announcements: verify screen-reader announcement if possible (simple visual fallback provided)

Notes for reviewers

- Audio uses WebAudio and requires a user gesture to enable; it is intentionally optional and persisted in localStorage.
- The demo save endpoint is a lightweight UI demo and does not persist real user data.

Suggested branch/PR commands

```bash
git checkout -b scentral/landing-scent-bloom-plus-audio
git add app/components/ScentBloom.tsx app/components/AudioChord.tsx app/components/DemoSave.tsx app/page.tsx app/globals.css PROJECTS.md docs/ux/scentral-landing-spec.md docs/ux/scentral-landing-checklist.md
git commit -m "scentral: add scent-bloom + optional audio chord, landing polish, demo save"
git push -u origin scentral/landing-scent-bloom-plus-audio
# open a PR on GitHub and paste this description
```

Optional follow-ups (good to include in PR description or as tasks):
- Add unit / E2E tests for DemoSave / toast flow
- Add visual regression snapshots for hero on key breakpoints
- Add Playwright test that toggles audio and simulates pointer move (mock AudioContext if needed)
