# Homepage/Hero Follow-ups — Post-Merge Backlog (2026-07-26)

**Status:** Merged to main (commits bc5c614, ab48f90, 4b906e7). All E2E tests passing (22/22). Ready for production.

**Backlog:** Four follow-up items identified during adversarial review. Not blockers; ship now, address in order.

---

## 1. Verify LCP improvement post-optimization

**Priority:** High  
**Effort:** 1–2 hours  
**Owner:** Christopher (needs Lighthouse access)

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

**What:** Hero section is designed for the happy path (video plays, chapter carousel animates). Missing states:

- **Reduced motion:** Animations should respect `prefers-reduced-motion`; currently animations run regardless
- **Video fails to load:** Poster fallback works, but no explicit error state shown to user
- **Video autoplay blocked:** Some browsers block autoplay; no fallback UI
- **Mobile low bandwidth:** Hero video may not load on slow 3G; should show poster-only experience
- **First-time user vs. returning:** Generic for all; no personalization based on auth state

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
