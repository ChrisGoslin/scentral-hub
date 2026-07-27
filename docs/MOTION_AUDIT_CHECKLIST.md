# Motion Audit Checklist — nota. Phase 7

**Purpose:** Verify every animation serves clarity or emphasis, never gratuitous distraction. Map each to motion tokens and confirm easing/duration support user intent.

**Tested:** July 2026 (Phase 7)
**Scope:** All pages: /discover, /collection, /you, /insights, /spritz, /wheel, /traces, /trails, /onboarding

---

## Motion System Reference

From `app/globals.css` and `lib/design/tokens.css`:

| Token | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `--motion-instant` | 80ms | cubic-bezier(0.4, 0, 0.2, 1) | State changes (toggle, check), micro-interactions, no delay expected |
| `--motion-responsive` | 200ms | cubic-bezier(0.2, 0.6, 0.2, 1) | Standard UI transitions (hover, focus, modal open), snappy but not jarring |
| `--motion-ceremonial` | 480ms | cubic-bezier(0.16, 1, 0.3, 1) | Page transitions, entrance animations, moments worth savoring |
| `--motion-organic` | 800ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Celebratory moments (level up, collection milestone), physics-based bounce |

---

## Animation Categories

Every animation must map to exactly ONE of:

| Category | Purpose | Typical Token | Examples |
|----------|---------|----------------|----------|
| **Reveal** | Show content that was hidden; draw attention | `--motion-responsive` or `--motion-ceremonial` | Fade in, slide up, scale enter, modal backdrop fade |
| **Drift** | Continuous or loop-based movement; no interaction | `--motion-organic` (2–3s loop) | Breathing heartbeat, gentle floating, pulsing badge |
| **Morph** | Shape/color/size change in response to input | `--motion-instant` or `--motion-responsive` | Button hover scale, background color shift, icon rotation |
| **Fade** | Opacity transition; de-emphasize or hide | `--motion-responsive` | Subtle fadeOut, loading shimmer fade, blur intensity |
| **Settle** | After a user action, content "settles" into place | `--motion-responsive` | Card placement after drag, shelf re-sort animation, XP toast exit |
| **Breathe** | Rhythmic, meditative pulsing; draws calm attention | `--motion-organic` (2.5–4s loop) | Idle state pulse, aura glow breathing, meditational load states |

---

## Audit Template

For each component/animation, fill:

```
[Component Name]
├─ Animation: [Reveal/Drift/Morph/Fade/Settle/Breathe]
├─ Trigger: [hover/focus/click/load/scroll/page-transition]
├─ Token: [--motion-instant/responsive/ceremonial/organic]
├─ Duration: [80ms/200ms/480ms/800ms/custom]
├─ Easing: [from token or custom]
├─ Keyframes: [fade-up, scale, rotate, etc.]
├─ A11y Check: [respects prefers-reduced-motion? Yes/No/N/A]
├─ Verdict: [✓ Keep / ⚠ Refine / ✗ Remove]
└─ Notes: [clarity served? distraction? over-animated?]
```

---

## Full Audit by Page

### **Landing Page (`/` + root layout)**

#### fade-up entrance
- **Animation:** Reveal
- **Trigger:** Page load
- **Token:** `--motion-ceremonial` (480ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1) [custom in globals.css]
- **Keyframes:** opacity 0 → 1, transform translateY(12px) → 0
- **A11y:** ✓ respects `prefers-reduced-motion` (line 1101)
- **Verdict:** ✓ Keep — entrance on load serves narrative, not gratuitous
- **Notes:** Slightly long (480ms) for simple text; consider breaking into staggered child animations per section

#### button-press-active
- **Animation:** Morph
- **Trigger:** Click/active state
- **Token:** `--motion-organic` (300ms in keyframes, but should match system)
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) [bouncy, correct]
- **Keyframes:** scale 0.96 → 1.04 → 1.00 (3-point bounce)
- **A11y:** ✓ respects `prefers-reduced-motion` (line 1185)
- **Verdict:** ✓ Keep — celebratory bounce for primary actions (good UX)
- **Notes:** Used on CTA buttons. Consider using `--motion-responsive` (200ms) for secondary buttons to reduce emphasis.

#### card-hover
- **Animation:** Morph
- **Trigger:** Hover (desktop)
- **Token:** `--motion-responsive` (180ms hardcoded, should be --motion-responsive 200ms)
- **Easing:** Inferred as `ease` (not specified; defaults to `ease-in-out`)
- **Keyframes:** scale 1 → 1.02, box-shadow elevation
- **A11y:** ✓ respects `prefers-reduced-motion` (line 1185)
- **Verdict:** ⚠ Refine — durations should use token, not hardcoded; easing should be explicit
- **Notes:** Applied to fragrance cards on /discover. On mobile (touch), hover doesn't fire; scale effect won't appear. This is acceptable (no motion on touch), but verify no competing active state.

#### chip-pulse
- **Animation:** Drift (loop)
- **Trigger:** Load (badge/notification)
- **Token:** `--motion-responsive` (400ms hardcoded, not a token)
- **Easing:** ease-out (not cubic-bezier)
- **Keyframes:** box-shadow 0 → 8px blur, opacity 1 → 0 (pulse-out)
- **A11y:** ✗ Does NOT respect `prefers-reduced-motion` (no guard)
- **Verdict:** ✗ Remove or refine — no a11y guard; 400ms doesn't align with token system; overused (every notification?)
- **Notes:** Audit all `.chip-pulse` uses. If used, wrap in `@media (prefers-reduced-motion: no-preference)`. Consider using `--motion-responsive` (200ms) for a gentler pulse.

#### text-flash
- **Animation:** Fade (loop)
- **Trigger:** Button state (e.g., "✓ Logged")
- **Token:** `--motion-responsive` (1.5s, custom)
- **Easing:** ease-in-out
- **Keyframes:** opacity 0 → 1 (20%) → 1 (80%) → 0
- **A11y:** ✓ respects `prefers-reduced-motion` (line 1185)
- **Verdict:** ✓ Keep — gentle feedback for async button states
- **Notes:** Consider reducing to 1s for snappier feel; currently feels slow on confirmation feedback.

---

### **Discover Page (`/discover`)**

#### DiscoverClient.tsx
- **Search input focus glow:** Morph
  - Token: `--motion-instant` (80ms)
  - Easing: cubic-bezier(0.4, 0, 0.2, 1)
  - Keyframes: outline/border color shift
  - **Verdict:** ✓ Keep — instant feedback for form interaction

- **Filter chip toggle:** Morph
  - Token: `--motion-instant` (80ms)
  - Easing: cubic-bezier(0.4, 0, 0.2, 1)
  - Keyframes: background color, text color invert
  - **Verdict:** ✓ Keep — immediate visual feedback on selection

- **Fragrance card scale (card-hover):** Morph
  - Token: `--motion-responsive` (180ms, see note above)
  - **Verdict:** ⚠ See audit note above (standardize to token)

#### ScrollToTop (if present)
- Animation: Reveal/Fade
- Trigger: Scroll threshold
- Token: Verify if `--motion-responsive`
- **Action:** Search codebase; confirm A11y guard present

---

### **Collection Page (`/collection`)**

#### OptimizedBottleCard.tsx (Shelf Tier items)
- **Drag-and-drop visual feedback:** Morph
  - Token: `--motion-instant` during drag-over, `--motion-responsive` on drop
  - Easing: Verify in dnd-kit config
  - **Verdict:** Audit dnd-kit config for token alignment
  - **Note:** NEVER REMOVE `cabinetSnapshot` CustomEvent hook (feeds vision pipeline)

#### Shelf reorganization settle animation
- **Animation:** Settle
- **Trigger:** After drag drop release
- **Token:** Should be `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** Position interpolation (handled by dnd-kit)
- **Verdict:** ⚠ Verify dnd-kit animation timing; should feel snappy but not jarring
- **Notes:** If re-sort takes >300ms, users perceive lag. Recommend `--motion-instant` for drag visual, `--motion-responsive` for settle.

#### Wishlist toggle (heart icon)
- **Animation:** Morph + Drift
- **Trigger:** Click
- **Token:** `--motion-instant` (icon scale), `--motion-responsive` (heart pulse if added)
- **Easing:** Responsive for smooth feel
- **Verdict:** ✓ Keep if under 200ms total
- **Notes:** Consider adding subtle pulse/bounce on successful wishlist add (micro-celebration).

#### Loading shimmer (before images load)
- **Animation:** Fade (loop)
- **Trigger:** Image loading
- **Token:** `--motion-responsive` (subtle background-position shift, 1.5s loop)
- **Easing:** linear (for continuous animation)
- **Verdict:** ✓ Keep — essential for perceived performance; ensure shimmer doesn't distract
- **Notes:** Verify shimmer color uses `--surface` with reduced opacity (no harsh contrast).

---

### **You Page (`/you`)**

#### Profile header entrance
- **Animation:** Reveal
- **Trigger:** Page load or tab switch
- **Token:** `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** opacity fade-in
- **Verdict:** ✓ Keep
- **Notes:** Consider staggered child animations (avatar → name → XP level) for visual hierarchy.

#### XP Level badge pulse (when level up)
- **Animation:** Breathe
- **Trigger:** On level threshold reached (no auto-loop after)
- **Token:** `--motion-organic` (800ms, or custom 1.2s for celebration)
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) [bouncy for celebration]
- **Keyframes:** Subtle scale pulse (1 → 1.08 → 1) + color glow
- **A11y:** ✓ respects `prefers-reduced-motion`?
- **Verdict:** ✓ Keep if A11y verified; otherwise ⚠ Add guard
- **Notes:** Celebratory moment; should feel joyful. Consider combining with toast/confetti-lite effect.

#### Persona card entrance
- **Animation:** Reveal
- **Trigger:** Page load (if persona exists)
- **Token:** `--motion-ceremonial` (480ms)
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1) [springy, fun]
- **Keyframes:** Scale 0.9 → 1.0, opacity 0 → 1
- **Verdict:** ✓ Keep — persona unlock deserves ceremonial entrance
- **Notes:** Verify no delay stacking (multiple persona cards loading?); stagger by 100ms each.

---

### **Insights Page (`/insights`, if present)**

#### Insight card entrance (fade-up)
- **Animation:** Reveal
- **Trigger:** Page load, scroll into view
- **Token:** `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** opacity + translateY
- **Verdict:** ✓ Keep — standard reveal
- **Notes:** If cards are lazy-loaded via Intersection Observer, trigger animation on each card's load (not just page load).

#### Chart/graph build-up animation
- **Animation:** Reveal (data visualization)
- **Trigger:** Page load or tab switch
- **Token:** `--motion-ceremonial` (480ms for full chart, staggered)
- **Easing:** Recommend cubic-bezier(0.2, 0.6, 0.2, 1) for smooth curve drawing
- **Keyframes:** SVG stroke-dasharray / stroke-dashoffset animation, or bar height 0 → final
- **Verdict:** Audit chart component (likely Recharts or d3) for token alignment
- **Notes:** Avoid overly long animations (>1s); users want to read data, not watch drawing for 5s.

---

### **Spritz Page (`/spritz`, Phase 7 NEW)**

#### Aura bubble entrance (drift animation)
- **Animation:** Drift + Breathe
- **Trigger:** Page load, swipe navigation
- **Token:** `--motion-organic` (800ms entrance, 2.5s breathe loop)
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) [bouncy entrance], linear [breathing loop]
- **Keyframes:** Scale fade-in + subtle floating up, then gentle pulse
- **A11y:** ✓ respects `prefers-reduced-motion`?
- **Verdict:** Verify A11y; if breathing loop active, must have guard
- **Notes:** Breathing animation should be *very* subtle (1–2% scale pulse) to avoid distraction. No auto-play sound loops.

#### Swipe card flip transition
- **Animation:** Morph (3D perspective)
- **Trigger:** User swipe gesture or arrow click
- **Token:** `--motion-responsive` (200ms for flip axis)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** rotateY(0deg) → 90deg → 180deg (if full flip), or simpler cross-fade
- **Verdict:** ⚠ Verify implementation — 3D transforms can stutter on mobile; consider simpler cross-fade if performance is poor
- **Notes:** Test on mid-range Android device (Snapdragon 685+). If janky, fallback to opacity cross-fade.

#### "Wear it" / "Skip" button response
- **Animation:** Settle + Morph
- **Trigger:** Click action
- **Token:** `--motion-instant` (80ms for button press), `--motion-responsive` (200ms for card exit)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) [instant], cubic-bezier(0.2, 0.6, 0.2, 1) [settle]
- **Keyframes:** Button press scale, then card slides out/fades
- **Verdict:** ✓ Keep — clear feedback for action → result
- **Notes:** Verify XP toast appears *after* card exit animation completes (no timing clash).

---

### **Wheel Page (`/wheel`, Phase 7 NEW)**

#### Wheel SVG rotation animation
- **Animation:** Morph (continuous rotate or drag-driven)
- **Trigger:** Page load (optional demo rotate), user drag gesture
- **Token:** N/A if drag-driven (transform: rotate handled by gesture lib); if auto-demo, `--motion-organic` (3s single rotation)
- **Easing:** Linear for continuous rotation demo; cubic-bezier for snap-to-section
- **Verdict:** ⚠ Audit implementation — determine if drag-driven or animation-driven; verify no janky repaints
- **Notes:** SVG transforms should use `transform: rotate()` on group, not on individual elements (performance). Verify hardware acceleration via `will-change: transform`.

#### Radar axis labels entrance
- **Animation:** Reveal (staggered)
- **Trigger:** Page load
- **Token:** `--motion-responsive` (200ms per label, staggered by 30–50ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** opacity fade-in, optional scale 0.8 → 1
- **Verdict:** ✓ Keep if staggered properly (avoids "pop" effect)
- **Notes:** Stagger order: outer axis labels first → inner labels → center legend.

#### Gap highlight animation (on hover/tap)
- **Animation:** Morph (color + stroke emphasis)
- **Trigger:** Hover/tap on axis segment
- **Token:** `--motion-instant` (80ms)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Keyframes:** stroke color shift, opacity increase
- **Verdict:** ✓ Keep — essential for interactivity clarity
- **Notes:** On touch, use tap-hold (long press) instead of hover; verify mobile UX.

---

### **Traces Page (`/app/(main)/collection/[id]/FragranceTraces.tsx`, Phase 7 NEW)**

#### Trace card entrance (scroll-triggered)
- **Animation:** Reveal
- **Trigger:** Scroll into viewport
- **Token:** `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** opacity fade-in, optional translateX(-20px) → 0
- **A11y:** ✓ respects `prefers-reduced-motion`?
- **Verdict:** Verify Intersection Observer implementation; ensure animation fires per-card, not all-at-once
- **Notes:** Use Framer Motion or simple CSS animation; avoid over-complex stagger on large trace lists (>20 items).

#### Mood/feeling emoji or icon pulse
- **Animation:** Breathe (optional, subtle)
- **Trigger:** Load (not continuous)
- **Token:** `--motion-organic` (single 800ms pulse, no loop)
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1)
- **Keyframes:** scale 1 → 1.15 → 1, one-time (animation-iteration-count: 1)
- **Verdict:** ✓ Keep if one-time only; ✗ Remove if continuous loop (distracting)
- **Notes:** Ensure animation-iteration-count is set (not infinite by accident).

#### Trace list sorting/filtering transition
- **Animation:** Settle (list reflow)
- **Trigger:** User sorts or filters
- **Token:** `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** Items fade in/out or reposition (handled by list animation library)
- **Verdict:** ✓ Keep if smooth; ⚠ audit performance on large lists
- **Notes:** If >50 traces, consider virtualizing (only render visible cards) to avoid layout thrashing.

---

### **Trails Page (`/app/(main)/trails`, if present)**

#### Trail entry entrance (fade-up)
- **Animation:** Reveal
- **Trigger:** Page load, scroll into view
- **Token:** `--motion-responsive` (200ms)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1)
- **Keyframes:** opacity + translateY
- **Verdict:** ✓ Keep
- **Notes:** Stagger by 50ms per trail entry for visual rhythm.

#### XP/progress bar fill animation
- **Animation:** Morph (width change)
- **Trigger:** Page load or trail progress update
- **Token:** `--motion-responsive` (200ms for modest progress), `--motion-ceremonial` (480ms for significant jump)
- **Easing:** cubic-bezier(0.2, 0.6, 0.2, 1) [smooth fill]
- **Keyframes:** width 0 → final
- **Verdict:** ✓ Keep
- **Notes:** Avoid linear easing (looks mechanical); cubic-bezier easing feels more natural.

---

### **Onboarding Flow (`/onboarding`, if updated)**

#### Ceremony arc animation (slide transitions between steps)
- **Animation:** Reveal + Morph (page transitions)
- **Trigger:** Next/prev button click
- **Token:** `--motion-ceremonial` (480ms)
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1) [springy entrance]
- **Keyframes:** Slide in from right (translateX(-100% → 0) or fade + scale)
- **A11y:** ✓ respects `prefers-reduced-motion`?
- **Verdict:** Verify A11y; if yes, ✓ Keep — onboarding deserves ceremonial feel
- **Notes:** Ensure slide animation doesn't cause layout shift (use transform, not margin/position).

#### Persona selection button highlight
- **Animation:** Morph
- **Trigger:** Hover/focus
- **Token:** `--motion-instant` (80ms)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Keyframes:** border/outline color shift, optional background lightening
- **Verdict:** ✓ Keep
- **Notes:** Verify focus state is distinguishable from hover state (keyboard accessibility).

---

## Summary: Animation Debt & Fixes

### Immediate Fixes (HIGH PRIORITY)
1. **chip-pulse:** Add `@media (prefers-reduced-motion: no-preference)` guard (line 1118–1126)
2. **card-hover:** Replace hardcoded 180ms with `var(--motion-responsive)` (line 1139)
3. **card-hover easing:** Add explicit easing from `--motion-responsive` token (line 1139)
4. **text-flash:** Consider reducing 1.5s to 1s for snappier confirmation feel (line 1180)

### Verification Needed (MEDIUM PRIORITY)
1. **dnd-kit animation timing** — verify drag/drop animation aligns with `--motion-responsive` (file: unknown, audit needed)
2. **Chart/graph build-up** — confirm Recharts or d3 animations respect token system (file: /insights)
3. **Swipe card flip (Spritz)** — test on mid-range Android; fallback to cross-fade if janky (file: /spritz)
4. **SVG wheel rotation** — verify hardware acceleration + `will-change: transform` (file: /wheel)
5. **Scroll-triggered reveals** — audit all Intersection Observer uses for proper A11y handling (files: /traces, /insights, /discover)

### Nice-to-Have Enhancements (LOW PRIORITY)
1. **Staggered entrance animations** — on /you page (avatar → name → XP level), /onboarding, /collection
2. **XP level-up celebration** — add subtle confetti or expanded pulse animation when threshold reached
3. **Wishlist add micro-celebration** — heart icon bounce + color morph
4. **Trace mood emoji pulse** — make one-time, not loop (already noted above)

---

## Testing Checklist (Before Launch)

- [ ] All animations respect `prefers-reduced-motion: reduce` (use DevTools accessibility emulation)
- [ ] On low-end device (Snapdragon 685 Android, iPad Gen 7), verify no janky/stuttering animations
- [ ] Dnd-kit drag feedback feels immediate (no lag perception); drop settle animation is smooth
- [ ] Search input focus outline appears instantly (80ms `--motion-instant`)
- [ ] Card hovers on /discover/collection feel responsive but not "snappy" (200ms is right balance)
- [ ] Onboarding step transitions feel ceremonial, not annoying on replay
- [ ] XP level-up moment feels celebratory (if added, verify after Phase 7 implementation)
- [ ] Spritz swipe card transitions are smooth; no jank on older phones
- [ ] Wheel page radial label entrance is staggered (not simultaneous pop)
- [ ] Traces list scroll-load animations don't fire multiple times (one per card)

---

## Approval & Sign-Off

- **Imagery Brief:** ✓ Reviewed (IMAGERY_BRIEF.md)
- **Motion System:** ✓ Verified (tokens in app/globals.css + lib/design/tokens.css)
- **A11y Compliance:** ⚠ PENDING — audit all animations for `prefers-reduced-motion` guards
- **Performance:** ⚠ PENDING — test on low-end devices before launch

---

*Motion audit completed July 2026. Revisit after Phase 8 (Social Sharing), Phase 9 (Aura Swipe), and Phase 12 (Onboarding 2.0).*
