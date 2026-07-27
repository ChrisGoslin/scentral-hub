# Homepage/Hero Follow-ups — Post-Merge Backlog (2026-07-26)

**Status:** Merged to main (commits bc5c614, ab48f90, 4b906e7). All E2E tests passing (22/22). Ready for production.

**Backlog:** Four follow-up items identified during adversarial review. LCP and hero recovery work are deployed; the mobile LCP gate remains open pending a deeper hydration/rendering change.

---

## 1. Verify LCP improvement post-optimization

**Priority:** High  
**Effort:** 1–2 hours  
**Owner:** Christopher

**Implementation status (2026-07-27):** Local fix complete. The poster `<picture>` now owns the media panel's first paint instead of a CSS background, removing the mobile LCP discovery delay. Slow connections receive poster-only mode and video failures expose a static-mode message. The existing ink-in-water film remains the motion enhancement.

**Measured evidence:** Production baseline before this fix: desktop 0.88–1.08s, mobile 3.84–3.86s. Final deployed samples: desktop remains under 1s, mobile 2.74–2.83s, and mobile video transfer is 0 B. The 4 KB poster completes in about 1.0s, but client-side element render delay remains about 1.0–1.2s. Verdict: **improved, but gate still failed** (`<2.5s` target).

**Next recommendation:** Split the server-rendered poster/LCP surface from the client-only motion and personalization layer. Do not replace the ink film yet; the measured bottleneck is hydration/render delay, not video transfer.

**What:** We optimized the hero image with Next.js Image component, priority hints, and `fetchPriority="high"`. Goal was to reduce LCP from 5.2s → <2.5s on slow 4G. **We did not re-measure.**

**Task:**
- Run Lighthouse on live site (desktop + mobile, slow 4G throttled)
- Extract LCP value and element (should still be hero image)
- Compare to baseline: 5.2s (desktop), 5.0s (mobile)
- If improved to <2.5s: declare success and close
- If still >2.5s: investigate further (image size, priority hints effectiveness, or other bottlenecks)

**Evidence needed:** Lighthouse JSON before/after, or screenshot of the metrics.

---

## 2. Apply screen-state-completeness to hero

**Priority:** Medium  
**Effort:** 3–4 hours  
**Owner:** Christopher (design review) + builder (implementation)

**Implementation status (2026-07-27):** Implemented in `components/landing/HeroSection.tsx` and covered by 11 Chromium E2E tests.

**What:** Hero section is designed for the happy path (video plays, chapter carousel animates). Recovery states now include:

- **Reduced motion:** Static artifact mode is preserved through `useReducedMotion`
- **Video fails to load:** Static-mode message is shown
- **Video autoplay blocked:** Existing play control remains available and the blocked state is labelled
- **Mobile low bandwidth:** Video is not mounted once the connection is identified as slow
- **First-time user vs. returning:** Returning users see the existing "Written for you" personalization badge; first-time users see the neutral artifact

**Task:**
- Apply `screen-state-completeness` skill to HeroSection
- For each state above, design + implement the experience
- Re-run E2E to ensure all states pass
- Verify Lighthouse LCP is not regressed by fallback states

**Evidence needed:** Tested states (screenshot or video walkthrough), E2E pass count.

---

## 3. Add CI gate to prevent E2E copy drift

**Priority:** Medium  
**Effort:** 2–3 hours  
**Owner:** Builder (add CI check)

**What:** We fixed E2E copy mismatches this session, but specs can drift again if app copy changes without updating tests. No CI gate prevents this.

**Task:**
- Identify all E2E assertions that check copy/text (regex, `toContainText`, etc.)
- Create a GitHub Actions CI check that:
  - Runs E2E suite on every PR
  - Flags failures with a comment: "E2E copy mismatch detected. Specs may be stale."
  - Requires passing E2E before merge
- Consider: add a pre-commit hook that warns if copy in page.tsx was changed but E2E wasn't run

**Evidence needed:** CI workflow file, example of the check catching a drift (can be manual test).

---

## 4. Resolve taupe hex decision (docs vs. code) — RESOLVED 2026-07-26

**What:** `app/globals.css` already ships `--taupe: #766E64`. `DESIGN.md`, `NOTA_MANIFESTO.md`, and `docs/brand/nota-imagery-briefs.md` were updated to `#766E64` (10.35:1 on ivory, clears WCAG AA for any text); `NOTA-BRAND-UIUX-PACK.md`, which still had the old `#B8AC9C`/2.03:1 rule, was brought in line the same day. Code and canonical docs now agree.

Remaining stale reference: `docs/DESIGN.md` (a pre-root-move duplicate, not canonical) still shows the old value — separate repo-tidy cleanup, not a decision.

---

## Summary of Work Done (Session 2026-07-26)

**Completed:** Homepage/hero brand reconciliation with verified route glossary, hero video ruling, LCP optimization, guest redirect fix, E2E alignment.

**Commits:**
- `bc5c614` — Canonical brand/design tokens and UI/UX reference pack
- `9f7d786` — Add L21–L25 enforcement mechanics and decision thresholds
- `ab48f90` — LCP optimization (Next.js Image with priority hints)
- `4b906e7` — E2E copy assertion fixes (22/22 passing)

**Test status:** 22/22 E2E passing, build clean, pre-push checks pass.

**Unresolved:** Cabinet vs Shelf positioning (product decision, not doc/code issue—needs user research or Christopher's call).
