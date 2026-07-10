# BRAND-AUDIT.md — Phase 0 sweep (Master Prompt v2)

**Date:** 2026-07-10 · **Branch:** `brand/sensory-sanctuary` · **Baseline commit:** 476c604

## 0. Headline: this is a DELTA campaign, not a from-scratch build

Commit 476c604 (2026-07-10, "brand design handover, ambient mode, and architecture updates")
already shipped on main, un-flagged:

| Master Prompt phase | Status on main | Evidence |
|---|---|---|
| P1 tokens (palette, grain, motion) | ✅ Largely done | `app/globals.css:13–19` (ivory/stone/charcoal/olive/moss/taupe), fractalNoise grain `app/globals.css:191` |
| P1 amber token | ⚠️ **DRIFT** | Code has `--amber-glow: #B98A58` (`app/globals.css:19`); locked spec is `--amber: #A0622A` |
| P2 fonts | ✅ Done | Instrument Serif + Unbounded/Satoshi fallback, `lib/design/tokens.css:53–54` |
| P2 copy registry | ✅ Exists | `lib/rebrand.ts` — BRANDED_ROUTE_CONFIG, SECTION_COPY_REGISTRY, SOCIAL_SUPPRESSION_COPY |
| P2 voice middleware + CI copy-lint | ❌ Missing | No lint gate; registry not enforced on all surfaces |
| P3 Dot (4 states, reduced-motion) | ✅ Exists | `components/ui/Dot.tsx` |
| P3 spinner kill | ⚠️ 1 stray | `components/aura/AuraAdvisory.tsx:101` (Loader2 animate-spin) |
| P4 routes + 308 redirects | ✅ Done | `proxy.ts` LEGACY_ROUTE_REDIRECTS (/discover→/study etc.); pages exist under app/(main)/{study,cabinet,archive,lab,ritual} |
| P4 ink icon set | ✅ Partial | BottomNav uses ReadInk/Noseprint/Shelf/Traces/You ink icons |
| P4.5 asset pack | ❌ **HARD BLOCKED** | `public/brand/assets/` does not exist; `nota-imagery-briefs.md` not in repo |
| P5 Read choreography | ✅ Largely done | `app/read/ReadClient.tsx` rebuilt in 476c604 (charcoal descent, reaction trio present); exact timings need verify pass |
| P6 surface 3-layer copy | ✅ Partial | SECTION_COPY_REGISTRY covers study/cabinet/archive/lab/ritual; per-surface personalisation not wired |
| P7 sensory contract | ✅ Exists | `app/hooks/useSymphonicSensory.ts` (haptic 5-event semantic API); acoustic layer stub only |
| P8 Morning/Evening modes | ✅ Exists | `lib/experience.ts` PresenceMode + `app/components/AmbientModeController.tsx` |
| P0 feature flag `nota_sanctuary` | ❌ Deliberately skipped | Rebrand already live on main un-flagged; a flag now would gate nothing. Recorded as deviation. |

Companion files status: `docs/nota/09-brand-design-handover.md` ✅ in repo.
`nota-tokens.css`, `nota-handoff-spec.md`, `nota-imagery-briefs.md`, `lottie/*.json`,
`nota-app-icon.svg`, `nota-accord-artifact-v2.svg` ❌ NOT in repo (pre-flight steps 1–2 not done).

## 1. Hardcoded pure white/black (33 hits)

Rule: never #FFFFFF / #000000. Most are `#fff` inline styles on secondary surfaces.

- app/waitlist/page.tsx:31,33,40 — `#ffffff` (also off-palette `#06070a`, `#0a0c12`)
- app/components/AuraShareCard.tsx:32,119,201 — canvas `ctx.fillStyle = '#ffffff'`
- app/api/og/route.tsx:24 — `color: '#ffffff'`
- app/(main)/clones/ClonesClient.tsx:113,133
- app/(main)/collection/[id]/GiftThis.tsx:109
- app/(main)/wheel/WheelClient.tsx:424
- app/(main)/notes/page.tsx:169
- app/(main)/ingredients/[slug]/page.tsx:221
- app/(main)/boxes/BoxesClient.tsx:115,135
- app/(main)/boxes/[slug]/BoxDetailClient.tsx:110
- app/onboarding/PersonaRevealOverlay.tsx:86
- app/onboarding/page.tsx:97,145,530,794
- components/ads/AffiliateButton.tsx:74
- components/ui/NoseReportSheet.tsx:66,72,82,89,99
- components/collection/OptimizedBottleCard.tsx:354
- components/discover/FragranceCardMedia.tsx:109,170,242
- components/brief/OccasionPicker.tsx:193,211
- app/globals.css:1098 — `@apply bg-white` (+ stone-* Tailwind grays 1090–1102, legacy block)

Fix: replace with `var(--ivory)` / `var(--charcoal)` (or color-mix). Canvas/OG contexts
use the literal hex values of the tokens, not CSS vars.

## 2. "user" in contributor-facing copy (near-clean)

- app/(main)/terms/page.tsx:5,100,151 + app/(main)/privacy/page.tsx:71 — legal pages;
  Settings-stays-Settings rule applies, but "User Agreement" in the meta description
  (terms:5) can soften. Low priority.
- app/(main)/wheel/WheelClient.tsx:267 — `'User ID not found'` error string → registry error voice.
- app/(main)/you/page.tsx:36 — test stub, not user-facing. Leave.

## 3. Spinners

- components/aura/AuraAdvisory.tsx:101 — `Loader2 animate-spin` → replace with `<Dot state="active"/>` + registry line.
- app/welcome/WelcomeClient.tsx:158 — false positive (copy that *mentions* "No spinners").

## 4. Easing / motion

- app/globals.css:1208 (`text-flash 1.5s ease-in-out`), :1306 (`nota-breathe 2400ms ease-in-out`) —
  breathe is arguably fine (symmetric breath), but spec easing is cubic-bezier(0.16,1,0.3,1) reveals /
  (0.22,1,0.36,1) settles. Review, don't blanket-replace.
- No bounce/overshoot/wiggle easings found.

## 5. Off-palette colours (spot findings, non-exhaustive)

- app/globals.css:90–94 — oklch moss-* variants (derived, acceptable if intentional)
- app/waitlist/page.tsx — bespoke dark navy palette, pre-dates handover
- app/globals.css:1090–1102 — legacy Tailwind stone-*/white block
- components/aura/AuraAdvisory.tsx — `text-amber-600` (Tailwind amber ≠ brand amber)

## 6. Gaps that need NO missing assets (workable next)

1. Amber token reconciliation (#B98A58 vs locked #A0622A) — needs founder ruling; the
   handover doc §4 doesn't list amber at all, the master prompt does.
2. Kill the AuraAdvisory spinner.
3. Sweep the 33 white/black hits.
4. CI copy-lint (brand lint script + pre-push wire-in).
5. Acoustic stub loader (silent-by-default) in useSymphonicSensory.
6. Read timing verification vs spec (2400/900/1200/1400ms).

## 6b. Read is behind the auth gate (spec violation)

Observed 2026-07-10 (signed-out, local dev): `/read` and `/welcome` both redirect to
`/login?next=/welcome`; `/study`, `/cabinet`, `/archive`, `/lab` redirect to `/onboarding`.
Master Prompt Phase 5: "Runs BEFORE the auth gate. Auth copy: 'Come back to your shelf.'"
This is the CCO's value-before-the-gate ruling and is currently violated. Needs a decision
on how much of The Read runs anonymous (generate then gate the save, most likely).

Baseline screenshots: `.brand-review/2026-07-10-*.png` (7 routes, signed-out, 390×844).

## 7. HARD BLOCKS (require Christopher — pre-flight steps 1–2 of the master prompt)

- Generate the 8 asset briefs (Firefly/Midjourney) → drop into `public/brand/assets/`
  with `assets.json` manifest per `nota-imagery-briefs.md`.
- Copy into repo (suggest `docs/brand/`): `nota-tokens.css`, `nota-handoff-spec.md`,
  `nota-imagery-briefs.md`, `nota-sensory-sanctuary.html`, `nota-accord-artifact-v2.svg`,
  `nota-app-icon.svg`, `lottie/` folder.
- Without these, Phase 4.5 and all downstream visual phases stay STOPPED per the
  prompt's own gate ("do not substitute code-drawn placeholders").
