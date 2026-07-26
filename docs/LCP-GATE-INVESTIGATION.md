# LCP Gate Investigation — Tier 1 Optimizations Failed

**Date:** 2026-07-26  
**Status:** Material finding from adversarial review (§9 Built-In Loop)  
**LCP Target:** <2.5s (current: 4.6s, **gate FAILED**)

---

## Findings

### Tier 1 Optimization Attempt

**Commits:** d4117de (preconnect + WebP + video lazy-load + deferred animations)

**Expected impact:** 4.6s → ~2.1s (-54%, per agent analysis)  
**Actual impact:** 4.6s → 4.6s (0%, no improvement measured)

**What was changed:**
1. ✅ Added preconnect header to Vercel CDN (app/layout.tsx)
2. ✅ Generated WebP variants (56% smaller: 38KB → 17KB desktop)
3. ✅ Changed video preload from "metadata" to "none"
4. ✅ Deferred Framer Motion hooks until image load completes
5. ✅ Added blur-hash color placeholder (rgb(60,55,48))

**Measurement:**
- Pre-optimization (2026-07-01): LCP = 7.0–7.4s
- Tier 1 deployed (2026-07-26): LCP = 4.6s
- Lighthouse (final, 2026-07-26): LCP = 4.6s (no change from deployment)

### Root Cause: UNVERIFIED

The agent's prediction of 54% improvement was not realized. Possible causes:

1. **WebP not being served:** Browser may not accept picture element fallback, or CDN not sending WebP variant
2. **Preconnect ineffective:** Connection to Vercel may already be cached/warmed, or preconnect not recognized
3. **Measurement variance:** Single Lighthouse run may be outlier (network variance on 3G simulation)
4. **Deeper bottleneck:** Image transfer is only part of LCP; other factors (React hydration, image decode, rendering) may dominate

**Required verification:** None of the above have been debugged.

---

## Current State

**Production deployment:** All 5 optimizations live on main, auto-deployed to scentral-seven.vercel.app  
**Git commits:** 7 commits since start of session (LCP gate open)  
**E2E tests:** 88/96 passing (hero-screen-states tests added, but don't measure LCP)  
**Rollback status:** No documented rollback path exists

---

## Recommended Actions (Ranked by Priority)

### IMMEDIATE (Must do before ship)

1. **Run Lighthouse 3–5× under different network conditions (Slow 4G, Fast 3G, LTE)**
   - Current: Single measurement showing 4.6s
   - Needed: Statistical sample to rule out outlier/variance
   - If 3 of 5 runs show <3.5s: optimization worked, keep in place
   - If all 5 runs show >4.0s: optimization failed, needs investigation

2. **If all runs show >4.0s, ROLLBACK Tier 1**
   - Command: `git revert -n d4117de && git commit -m "revert: Tier 1 LCP optimizations did not deliver gains"`
   - Rationale: Optimizations are live but unproven; reverting to stable baseline reduces risk

3. **Document LCP gate decision**
   - If LCP <2.5s achieved: gate passed, ship with confidence
   - If LCP still >4.0s: gate failed, marketing/product must decide:
     - Ship anyway with known gate failure (accept 4.6s)
     - Delay launch to investigate deeper root cause
     - Reduce scope to make LCP less critical

### HIGH PRIORITY (Do before next session)

4. **Investigate root cause if optimization failed**
   - Run Lighthouse with DevTools open to see which phase takes 4.6s (image download vs decode vs render)
   - Check if WebP is actually being served (DevTools Network tab, look for .webp in waterfall)
   - Check if preconnect header exists in live HTML (DevTools Elements, find `<head>`)
   - Run performance trace on desktop + mobile to find slowest phase

5. **Document findings in this file and create backlog item**
   - If WebP isn't served: investigate why (browser support, CDN routing, source map issues)
   - If preconnect doesn't help: investigate alternative optimizations (aggressive compression, third-party removal)
   - Link to GitHub issue for tracking

### MEDIUM PRIORITY (Design debt)

6. **Consider alternative strategies if Tier 1 fails**
   - **Strategy B:** Replace video hero with static GIF (eliminates video preload, simpler render)
   - **Strategy C:** Server-side render hero region (reduces React hydration overhead)
   - **Strategy D:** Defer hero video load entirely (show thumbnail, play on user interaction)

---

## Rollback Instructions

If Lighthouse confirms LCP is still >4.0s after 3–5 runs:

```bash
# Identify the commit to revert
git log --oneline | head -10
# Find: d4117de perf: implement Tier 1 LCP optimizations

# Create rollback commit
git revert -n d4117de

# Review changes
git status
git diff --cached

# Commit rollback
git commit -m "revert: Tier 1 LCP optimizations did not improve LCP (still 4.6s)"

# Push to main (auto-deploys)
git push origin main

# Verify rollback on live site
# - LCP should return to pre-optimization baseline (7.0s—not better, but confirms rollback)
# - If LCP improves: optimization was helping, revert was wrong
```

---

## Residual Risk Summary

| Risk | Severity | Owner | Status |
|------|----------|-------|--------|
| LCP gate FAILED (4.6s vs <2.5s target) | 🔴 HIGH | Product | OPEN — awaiting decision |
| Optimizations unverified (no debug trace) | 🔴 HIGH | Eng | OPEN — requires investigation |
| No rollback plan documented | 🟡 MEDIUM | Eng | FIXED — instructions above |
| E2E CI blocks on copy changes (brittle selectors) | 🟡 MEDIUM | Eng | OPEN — backlog item |
| Screen-state UX untested (autoplay-blocked) | 🟡 MEDIUM | QA | PARTIAL — E2E tests added, autoplay still untestable |

---

## Questions for Christopher

1. **Should we rollback Tier 1 if Lighthouse confirms <2.5s was not achieved?**
2. **Is LCP <2.5s a hard gate for ship, or can we proceed with 4.6s?**
3. **Budget for investigating root cause** (Tier 1 failed, need Strategy B/C/D)?

---

**See also:** `docs/nota/session-handoff-2026-07-26.md` (full handoff from prior session)
