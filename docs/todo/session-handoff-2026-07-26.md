# Session Handoff — Homepage/Hero Backlog + Adversarial Findings (2026-07-26)

**Status:** Homepage/hero work merged to main. All 22 E2E tests passing. Build clean. 
**Date:** 2026-07-26  
**Context:** Adversarial loop identified gaps in LCP verification, screen-state completeness, and opportunity for 20% innovation upgrades.

---

## Priority 1: LCP Verification (GATE — Run First)

**Status:** ⚠️ **UNVERIFIED** — Claimed improvement post-restructure, never measured.  
**Risk:** High — Prior Lighthouse run showed regression (6.1s desktop, 4.6s mobile). New Image-priority strategy intended to fix, but no re-run confirms success.

### Task: Re-run Lighthouse on live site (slow 4G, desktop + mobile)

**Files to reference:**
- `components/landing/HeroSection.tsx` (lines 257–266: Image priority strategy)
- `app/page.tsx` (Hero section rendering)
- Previous baseline: 5.2s desktop, 5.0s mobile (before LCP optimization)
- Regression baseline: 6.1s desktop, 4.6s mobile (after first optimization, before restructure)

**Prompt for next session:**
```
Run Lighthouse on https://scentral-hub.vercel.app (production):
1. Desktop (1440×900, slow 4G throttle, cache cleared)
2. Mobile (390×844, slow 4G throttle, cache cleared)

Document:
- LCP value (target: <2.5s)
- LCP element attribution (should be: hero Image, not video)
- CLS, FID, TTFB (full Core Web Vitals snapshot)
- Screenshot of the Lighthouse report

Compare to:
- Baseline 5.2s (desktop) / 5.0s (mobile) — pre-optimization
- Regression 6.1s / 4.6s — first optimization attempt
- Target: <2.5s (both viewports)

If LCP > 2.5s:
- Investigate: Is Image actually rendering with priority? Check DevTools Performance tab.
- Check: Is video still 1100ms to render? If so, Image priority didn't take.
- Fallback: Reduce image file size or switch to AVIF format if browsers support.

If LCP < 2.5s:
- Declare success. Close this task.
- Backlog item #1 complete.

Document findings in comments below.
```

**Acceptance criteria:**
- [ ] Lighthouse JSON exported (save to repo as `.lighthouse/hero-2026-07-26.json`)
- [ ] LCP value documented (plain number)
- [ ] LCP element confirmed (screenshot showing which element)
- [ ] Verdict: **Pass** (<2.5s) or **Fail** (>2.5s, requires investigation)

---

## Priority 2: Screen-State Completeness (Hero UX)

**Status:** 📝 Backlog item #2  
**Skill:** `screen-state-completeness` (should already be installed globally at `~/.claude/skills/`)  
**Risk:** Medium — Happy-path works; error states fail silently.

### Task A: Design fallback states

**Files to reference:**
- `components/landing/HeroSection.tsx` (current happy-path implementation, lines 254–319)
- `components/landing/HeroSection.module.css` (styling for media panel)
- `docs/DESIGN.md` §4 (hero section spec: "Living atelier sequence")
- `docs/NOTA-BRAND-UIUX-PACK.md` §3 (hero chapter artifact styling)

**Missing states to design:**
1. **Video autoplay blocked** — browser blocks video.play() (iOS, Firefox strict, corporate networks)
   - Current: poster shows, button hidden (silent failure)
   - Desired: caption "Autoplay blocked. Tap play to start." + visible play button
   
2. **Video network timeout** — video src fails to load (404, timeout, CORS)
   - Current: poster fallback, no UI indication
   - Desired: subtle error message ("Video unavailable. Viewing static mode.") + play button disabled

3. **Mobile low bandwidth (3G)** — video may not load; poster may be missing
   - Current: LCP image loads, video queues
   - Desired: blur-hash placeholder shows instantly; "Loading…" message if >2s

4. **First-time vs. returning user** — personalization exists but invisible
   - Current: `buildPersonalNote()` runs, text updates, user doesn't notice
   - Desired: badge "This chapter is written for you" on first load (returning users only)

5. **Reduced-motion user** — animations off
   - Current: ✅ Already fully implemented (no changes needed)
   - Verify: Image shows, video hidden, chapter artifact static (test in browser with prefers-reduced-motion enabled)

**Prompt for next session:**
```
Use the screen-state-completeness skill to design the hero section's fallback states.

Current happy-path: video autoplay plays, chapter carousel animates, personalization text renders.

Missing states (refer to HeroSection.tsx lines 254–319 and HeroSection.module.css):
1. Video autoplay blocked — add fallback messaging + play button visibility
2. Video network timeout — add error message + disabled play button
3. Mobile low bandwidth — add blur-hash placeholder + loading indicator
4. First-time vs. returning user — add subtle "This is personalized for you" badge (returning only)
5. Reduced-motion — verify existing implementation (Image + static artifacts work)

For each state:
- Describe the user's experience (what they see, what they can do)
- Specify the CSS classes or components that need to change
- Identify the trigger condition in code (where to add the state check)
- Estimate effort (hours to implement)

Output format: state-name → trigger condition → UI changes → effort.

Then rank by impact: which state (if missing) causes the most user confusion or abandonment?
```

**Acceptance criteria:**
- [ ] All 5 states have documented experience designs
- [ ] Trigger conditions identified (code locations where state checks needed)
- [ ] UI changes scoped (CSS, HTML, copy, logic)
- [ ] Effort estimated for each
- [ ] Ranked by impact

### Task B: Implement fallback states

**Prompt for next session:**
```
Implement the screen-state-completeness findings from Task A.

For each state, in order of impact:
1. Add state detection logic to HeroSection.tsx (e.g., track video.play() failure, measure load time)
2. Add conditional rendering (show/hide elements, update copy, disable buttons)
3. Add CSS for fallback UI (blur-hash class, error message styling, loading indicator)
4. Test in browser:
   - Desktop: open DevTools → Network → Slow 3G; refresh hero and watch video timeout
   - Mobile: use Chrome DevTools device emulation (390×844) + Slow 3G
   - Reduced-motion: prefers-reduced-motion media query in DevTools
   - iOS: test via Safari on iPhone or Simulator; attempt video.play() and check for autoplay block

Document:
- Code changes (files modified, lines added/removed)
- Visual comparison (screenshot: before/after for each state)
- Test results (each state tested on at least one device/browser)

Then re-run E2E suite: npm run test:e2e
- All 22 tests must still pass
- No new failures introduced by fallback logic

Finally, commit and document in backlog item #2 status.
```

**Acceptance criteria:**
- [ ] Code implemented (all 5 states)
- [ ] E2E: 22/22 tests still passing
- [ ] Browser testing: each state tested (desktop + mobile + reduced-motion)
- [ ] Screenshots: before/after for fallback states
- [ ] Commit message references screen-state-completeness skill and backlog item #2

---

## Priority 3: E2E CI Gate (Copy Drift Prevention)

**Status:** 📝 Backlog item #3  
**Risk:** Medium — Specs will drift again if app copy changes without re-running tests.

### Task: Add GitHub Actions CI check for E2E

**Files to reference:**
- `.github/workflows/` (existing CI workflows, if any)
- `tests/e2e/` (Playwright tests directory)
- `package.json` scripts: `test:e2e` runs Playwright suite

**Prompt for next session:**
```
Create a GitHub Actions workflow that:

1. Runs on every PR (before merge to main)
2. Executes: npm run build && npm run test:e2e
3. On failure, posts a comment to the PR:
   "⚠️ E2E tests failed. Copy may have drifted. Verify specs match the shipped text in app code."
4. Blocks merge until E2E passes (require the check in branch protection rules)

Additional (nice-to-have):
- Pre-commit hook (local): warn if app page copy changed but E2E wasn't run
- Report: list which E2E specs failed (so developer knows which routes to check)

Acceptance criteria:
- [ ] Workflow file created at .github/workflows/e2e-ci.yml (or name of choice)
- [ ] Workflow runs on PR event
- [ ] E2E suite executes (build → test:e2e)
- [ ] On failure: PR comment posted with warning
- [ ] Manual test: update a string in app/page.tsx, push to a branch, create PR → check that E2E fails and comment appears
- [ ] Document the workflow in docs/HANDOVER.md (point to the workflow file path)

Reference:
- Playwright docs: https://playwright.dev/docs/ci
- GitHub Actions Playwright: https://github.com/actions/setup-node + npm scripts
```

**Acceptance criteria:**
- [ ] Workflow file created and functional
- [ ] Manual test: PR with E2E failure shows comment
- [ ] Documented in HANDOVER.md
- [ ] Commit message references backlog item #3

---

## Priority 4: Cabinet vs Shelf Resolution (Product Decision)

**Status:** 📝 Backlog item #4  
**Risk:** Low (non-critical) — UX is correct, information architecture is ambiguous.

### Task: Resolve Cabinet vs Shelf positioning

**Files to reference:**
- `docs/DESIGN.md` §12 "Confirmed Routes" (lists `/cabinet`, `/collection`, `/shelf`)
- `docs/NOTA-BRAND-UIUX-PACK.md` §10 "Product Routes" (same)
- `app/(main)/cabinet/page.tsx`
- `app/(main)/collection/` and `app/(main)/collection/[id]/page.tsx`
- `app/(main)/shelf/page.tsx` and `app/(main)/shelf/[id]/page.tsx`
- `lib/db/models.ts` or schema (Cabinet, Collection, Shelf data models — check if they exist)

**Prompt for next session:**
```
Investigate the Cabinet, Collection, and Shelf routes to clarify their distinct purposes.

Current state:
- Three routes exist: /cabinet, /collection/[id], /shelf
- They render similar shelf-like components (WardrobeShelf, ShelfClient, CollectionShelfModal)
- Docs list all three but don't explain the difference
- Users may not understand why they need three similar screens

Task (choose one path based on finding):

Path A — If Cabinet and Collection and Shelf are genuinely distinct:
  1. Read the page.tsx files for each route
  2. Document the difference (purpose, data model, user action)
  3. Update DESIGN.md §12 and NOTA-BRAND-UIUX-PACK.md §10 to explain each
  4. Example:
     - Cabinet: archive of all fragrances ever tried (read-only? curated?)
     - Collection: user-created curated list (draggable, shareable?)
     - Shelf: primary scent identity (top 20? locked? public?)
  5. Consider UX: are the names clear? Does the UI show the difference? If not, add breadcrumb or section label.
  6. Commit: "docs: clarify Cabinet vs Collection vs Shelf positioning"

Path B — If Cabinet and Collection are duplicates or one is dead code:
  1. Flag which is the source-of-truth route
  2. Check git history: when was the duplicate added? Is it tested?
  3. If truly dead: document as deprecated in DESIGN.md, remove from sidebar navigation (if it's there)
  4. If both live: recommend consolidation to Christopher (this is a product call, not a code call)
  5. Commit: "docs: mark Cabinet as [live / deprecated]; clarify Collection as primary shelf"

Reference what you find:
- Routes: list the three page.tsx files and their props/queries
- Data models: what do Cabinet, Collection, Shelf models contain? Are they the same?
- Navigation: are all three linked in the sidebar or header? If yes, are they ordered/labeled clearly?
- E2E: do tests cover all three routes? If not, they may be incomplete/in-progress.

Output:
- One paragraph per route: what it does, who uses it, when
- Recommendation: keep all three (with clearer naming/labeling) or consolidate
- Required decision: Christopher's call on product positioning (not a code decision)

Then update docs and commit.
```

**Acceptance criteria:**
- [ ] Three routes investigated and understood
- [ ] Purpose documented for each (one paragraph per route)
- [ ] DESIGN.md and NOTA-BRAND-UIUX-PACK.md updated
- [ ] Recommendation made (clear naming, consolidation, or deprecation)
- [ ] If UX change needed: file a separate task or note in backlog for next session
- [ ] Commit: document the finding and decision

---

## Priority 5: 20% Innovations (Optional Enhancement Tasks)

**Status:** 💡 Three upgrades identified by adversarial loop. Low effort, high impact.

### Innovation A: Blur-hash placeholder for hero image

**Effort:** 1–2 hours  
**Impact:** Perceived performance boost (user sees dominant color instantly while image loads)

**Prompt for next session:**
```
Add a blur-hash placeholder to the hero Image component for faster perceived load time.

Current: white/black background while Image loads (~100–500ms on slow 3G)
Desired: dominant color (from blur-hash) shows instantly, image fades in on top

Implementation:
1. Extract dominant color from /media/atelier-matter-poster.jpg (use a tool or estimate by eye)
2. Generate a tiny blur-hash (~50 bytes, e.g., using the blurhash library or a data: URI)
3. Add to HeroSection.tsx Image component:
   <Image
     ...
     blurDataURL="data:image/svg+xml,<svg ...>" // or blurhash PNG
     placeholder="blur"
   />
4. Test: open DevTools → Network → Slow 3G, refresh hero, watch placeholder color appear instantly
5. Compare before/after screenshots

Reference:
- Next.js Image blurDataURL: https://nextjs.org/docs/app/api-reference/components/image#blurdataurl
- blurhash library: https://github.com/woltapp/blurhash (optional, for programmatic generation)

Acceptance:
- [ ] Placeholder color implemented
- [ ] Tested on slow 3G (screenshot)
- [ ] Image fades in correctly over placeholder
- [ ] E2E still passes (22/22)
- [ ] Commit: "feat: add blur-hash placeholder to hero image"
```

### Innovation B: Autoplay-blocked messaging

**Effort:** 1–2 hours  
**Impact:** Clarifies why video doesn't play automatically (reduces user confusion)

**Prompt for next session:**
```
Add messaging when video autoplay is blocked (iOS, Firefox strict, corporate networks).

Current: poster shows, play button hidden, user doesn't know why
Desired: caption "Autoplay blocked. Tap play to start." + play button visible

Implementation:
1. Modify useLivingAtelierSequence hook (HeroSection.tsx lines 113–155):
   - Track video.play() rejection reason
   - Detect autoplay-blocked error (NotAllowedError, NotSupportedError)
2. Pass autoplayBlocked state to HeroSection component
3. Conditionally render caption in mediaCaption div (lines 304–318):
   - If autoplayBlocked: show "Autoplay blocked. Tap play to start."
   - Always show play/pause button (don't hide when autoplay fails)
4. Test:
   - iOS Safari: videos often block autoplay → test on iPhone or Simulator
   - Firefox with strict privacy settings: about:config → media.autoplay.default = 1 (block)
   - Desktop Chrome: add ?autoplay_blocked=true query param for testing (optional)
5. Screenshot: before/after showing the caption

Reference:
- MDN video.play(): https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
- Autoplay errors: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play#exceptions

Acceptance:
- [ ] Autoplay-blocked detection implemented
- [ ] Caption added to UI
- [ ] Tested on iOS and Firefox (or documented as future test)
- [ ] E2E still passes (22/22)
- [ ] Commit: "feat: add messaging when video autoplay is blocked"
```

### Innovation C: Personalization badge for returning users

**Effort:** 2–3 hours  
**Impact:** Increases engagement by signaling that the system recognizes the user

**Prompt for next session:**
```
Add a subtle personalization badge to the hero chapter artifact for returning users.

Current: buildPersonalNote() runs and personalizes the artifact text, but users don't notice
Desired: badge/label "This chapter is written for you" appears on first load (returning users only)

Implementation:
1. In HeroSection.tsx, check if personaId exists (line 196):
   - First-time users: personaId is null
   - Returning users: personaId is set (from localStorage)
2. Add a conditional badge to the ChapterArtifact component (lines 33–79):
   - Show only if personaId exists AND hasMounted (avoid SSR hydration mismatch)
   - Fade in with subtle animation (e.g., opacity 0→1 over 0.3s)
   - Copy: "This chapter is written for you"
   - Styling: small, light gray, positioned above or inside the artifact
3. Test:
   - Fresh browser: no badge (personaId null)
   - After sign-in: clear localStorage, sign in again → badge should appear on next page load
   - LocalStorage manually set: localStorage.setItem('scentral_persona', 'test_id') → refresh → badge appears
4. Screenshot: with and without badge

Reference:
- usePersona hook: HeroSection.tsx lines 170–183
- buildPersonalNote: lib/personalization.ts (find and read to confirm it returns personaName)
- Framer Motion: already imported (line 5), use for gentle fade-in

Acceptance:
- [ ] Badge added to ChapterArtifact
- [ ] Badge shows only when personaId exists
- [ ] Animation smooth (no jarring appearance)
- [ ] E2E still passes (22/22)
- [ ] Tested: manual localStorage check + actual sign-in flow
- [ ] Commit: "feat: add personalization badge to hero for returning users"
```

---

## Reference Docs & Key Files

**Brand/Design Docs:**
- `docs/DESIGN.md` — canonical design system (249 lines)
- `docs/NOTA-BRAND-UIUX-PACK.md` — UI/UX reference pack (327 lines)
- `docs/NOTA_MANIFESTO.md` — brand positioning (100 lines)
- `docs/lessons.md` — L21–L25 enforcement mechanics and decision thresholds

**Code:**
- `components/landing/HeroSection.tsx` — main hero component (323 lines)
- `components/landing/HeroSection.module.css` — hero styles
- `app/page.tsx` — page-level rendering
- `app/globals.css` — global tokens (taupe: #766E64)
- `lib/personalization.ts` — buildPersonalNote() function

**Test:**
- `tests/e2e/` — Playwright test suite (22 tests, all passing)

**Backlog:**
- `docs/todo/homepage-follow-ups-2026-07-26.md` — original 4-item backlog
- `docs/HANDOVER.md` — project handoff docs (update with CI gate after Task 3 complete)

---

## Session Handoff Notes

**For the next session opener:**
1. **Start with Priority 1 (LCP Verification).** This is a gate. If LCP is still >2.5s, investigate before moving to other tasks.
2. **Parallel work:** While waiting for Lighthouse results, can start Priority 2 (screen-state design with the skill).
3. **Order:** 1 → 2 → 3 → 4 → 5 (innovations optional).
4. **Repo state:** main branch is clean and ready. All commits are in git history. No uncommitted changes.
5. **Skills installed:** `screen-state-completeness` and `implementation-preflight` should already be at `~/.claude/skills/`. Verify with: `ls ~/.claude/skills/ | grep screen-state`.

**Known working state:**
- 22/22 E2E tests passing
- Build: clean (npm run build passes)
- Linting: clean (npm run lint passes)
- No merge conflicts
- LCP optimization deployed but unverified

---

**Created:** 2026-07-26  
**Session context:** Post-adversarial loop, pre-next session handoff
