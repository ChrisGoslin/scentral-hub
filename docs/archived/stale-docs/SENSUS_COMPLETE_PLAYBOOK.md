# nota. COMPLETE PLAYBOOK
## From MVP to World-Class Dark Ambient Material PWA

**Version:** 1.0
**Updated:** 2026-06-22
**Status:** Ready for 10-Week Production Sprint

---

## EXECUTIVE SUMMARY

This playbook contains everything needed to transform nota. from "novice and vibe-coded" feedback into the **"Spotify of Fragrance"**—a premium, visually stunning, gamified PWA that celebrates subjective sensory experiences.

**Key Deliverables:**
- ✅ Epic 1: Dark Ambient Material Token System + 12-Column Collector's Wall Grid
- ✅ Epic 2: Edge-to-Edge Carousel Filters (All 4 filter categories)
- ✅ Epic 3: "Smells Like" Proximity Discovery Engine (70%+ note matching)
- ✅ Epic 4: Aura AI Spritz Schedule + Gamified Daily Routine
- ✅ Epic 5: Landing Page Hero Redesign + Above-Fold Scent Identity
- ✅ Updated Documentation: SENSUS_UI_UX_OVERHAUL.md + 4 Epic Briefs
- ✅ Principal UI/UX Architect Gem: Custom AI persona for design decisions

---

## DOCUMENT MAP

| Document | Purpose | Location |
|----------|---------|----------|
| **SENSUS_UI_UX_OVERHAUL.md** | Master strategy, design philosophy, 10-week timeline | `/scentral-hub/` |
| **epic-1-collectors-wall.md** | Phase 1: Tokens + Grid (Weeks 2–4) | `/docs/claude-code-briefs/` |
| **epic-2-carousel-filters.md** | Phase 2: Horizontal filter carousels (Week 5) | `/docs/claude-code-briefs/` |
| **epic-3-smells-like-search.md** | Phase 3: Proximity search engine (Weeks 6–8) | `/docs/claude-code-briefs/` |
| **SENSUS_COMPLETE_PLAYBOOK.md** | This file: consolidated reference | `/docs/` |

---

## EPIC 4 & 5 SUMMARY (To Execute)

### Epic 4: Aura AI Spritz Schedule (Weeks 9–10)

**What:** Gamified daily fragrance routine guidance with swipeable cards, XP tracking, and streak mechanics.

**Core Components:**
- `app/(main)/schedule/page.tsx` + `ScheduleClient.tsx` (new routes)
- `components/schedule/SpritzCard.tsx` (swipeable Tinder-style cards)
- `lib/aura.ts` (AI logic for generating daily schedules based on persona + weather + time)
- `app/api/schedule/generate/route.ts` (backend endpoint)
- Integration with wear logging + push notifications (from Phase 5-D)

**User Flow:**
1. User opens app (7:30 AM)
2. Aura generates 3-event timeline: Morning → Midday → Evening
3. User swipes cards: RIGHT = logged (earn +1 XP), LEFT = defer
4. Streak counter increments, push notification sent for next event
5. You tab displays active streak ("🔥 5-day streak")

**Key UX Patterns:**
- Full-height swipeable deck (Tinder-style)
- Animated silhouette with pulse-point indicators (neck, wrists, chest)
- "More info" expands to show notes, YouTube recs, layering tips
- Haptic feedback on swipe (if supported)
- XP animation when swiped right

**Acceptance Criteria:**
- Swipe gestures work on mobile + desktop
- XP updates in real-time
- Streaks persist across sessions
- Push notifications trigger at correct times

---

### Epic 5: Landing Page Hero Redesign (Week 10)

**What:** Move Scent Identity Profiler above the fold. Fix typography hierarchy. Make landing page conversion-optimized.

**Core Components:**
- `app/page.tsx` (complete rewrite)
- `components/landing/HeroSection.tsx` (new)
- `components/landing/PersonaTeasers.tsx` (new)

**Layout:**
- **Hero (Viewport Height):** Headline ("Your Scent Fingerprint") + subheadline + 2 CTAs
- **Persona Teasers:** 3 cards (Velvet Intellectual, Solar Minimalist, Dark Alchemist)
- **Christopher Moment:** Mid-page card ("Your £140 bottle has an £18 clone")
- **Footer:** Minimal links + social

**Typography Fixes:**
- Display Large: `clamp(2.25rem, 5vw, 3.5rem)` (NOT huge)
- Body Large: `clamp(1rem, 1.5vw, 1.125rem)` (NOT tiny)
- All text: High contrast on Deep Slate background

**Acceptance Criteria:**
- Scent Identity visible without scrolling
- Headline + subheadline legible on all viewports
- CTAs prominent + tappable (≥48px)
- Persona cards render in carousel (mobile) + grid (tablet+)
- No horizontal scroll

---

## PRODUCTION READINESS CHECKLIST

**Before shipping nota. to App Store:**

### Code Quality
- [ ] All 9 smoke tests pass (Discover, Collection, Layering, You, Social, Privacy, Terms, Landing, Onboarding)
- [ ] `next build` succeeds, no chunks >500KB
- [ ] No console errors on fresh page loads
- [ ] All existing features work (persona, collection, wardrobe, layering, wear logging)

### Responsive Design
- [ ] Layouts work at 390px (mobile), 768px (tablet), 1280px (desktop), 1920px (ultra-wide)
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets ≥44px (M3 standard)
- [ ] Carousels scroll smoothly

### Accessibility
- [ ] WCAG 2.1 AA compliance: 4.5:1 text contrast
- [ ] All buttons + interactive elements keyboard navigable
- [ ] Images have alt text
- [ ] Form labels associated with inputs
- [ ] Color not sole indicator of state

### Performance
- [ ] Lighthouse mobile: >85
- [ ] Lighthouse desktop: >90
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Core Web Vitals: All green

### Visual Consistency
- [ ] No hardcoded hex colors (all CSS variables)
- [ ] All typography M3 tokens
- [ ] All spacing M3 scale
- [ ] All shadows M3 elevation
- [ ] All corners consistent radius tokens

---

## POST-LAUNCH ROADMAP

### Phase 8-D (Weeks 11–12): Affiliate Integration

Once nota. ships, wire Awin:
- Deploy `/api/prices` endpoint
- Add SKU matching logic (`pg_trgm` + LLM tier)
- Integrate retailer links into detail page "Where to Buy"
- Test: 100+ fragrances showing prices + affiliate URLs

### Phase 8-A through 8-F (Concurrent with Post-Launch Monitoring)

- **8-A:** Dark mode toggle (quick win)
- **8-B:** 6 personas expansion (Ritual Keeper, Rebel Experimentalist, Comfort Seeker)
- **8-C:** Barcode scanner (bottle import)
- **8-E:** Auth system (user accounts, Supabase Auth)
- **8-F:** Community features (creator profiles, Wear & Share forum)

---

## PRINCIPAL UI/UX ARCHITECT GEM ACTIVATION

To activate the custom "Principal UI/UX Architect Gem" persona for ongoing design decisions:

**Copy and paste into a new chat with Claude:**

```
You are the "Principal UI/UX Architect Gem" for nota., a premium fragrance PWA.

You are an elite digital product designer who builds habit-forming applications
at the intersection of Silicon Valley unicorn scalability and Parisian design house aesthetics.

### Domain Knowledge:
- UX Psychographics: Design for "Gavin"—24–35, urban, time-poor, demands <5s decisions, responds to gamification
- Digital Sensory Storytelling: Translate luxury glass bottles into digital UI using Dark Ambient Material
- Design Systems: Fluent in 12-col grids, CSS var tokens, M3 touch targets, fluid type scales
- Product Strategy: Scope/sequence Epics, prioritize zero-dollar social sharing (exportable UI cards)

### Core Principles:
1. Frictionless Execution: Hunt for digital friction. Prioritize horizontal swipes, edge-to-edge layouts, single-tap actions.
2. Visual Precision: Define exact CSS (e.g., `backdrop-blur-md`, `rgba(255,255,255,0.03)`), not just "make it good."
3. Data-Backed UX: Justify via mobile behaviors (thumb-zone reachability, 3-sec attention spans).
4. Competitive Benchmarking: Compare against Spotify (utility), Glossier (community), Aesop (typography).

### When asked to evaluate/design UI:
- Start with "UX Positioning & Design Philosophy" (the Dark Ambient spec)
- Map the core interaction loop (user's primary daily journey)
- Define component architecture (exact CSS, spacing, typography)
- Provide executable Frontend Epics

### Output Style:
Sophisticated, technical, visually obsessed, grounded in React/Tailwind/M3 realities.
```

This persona will provide expert design guidance throughout Phases 2–10 and beyond.

---

## BRANCH STRATEGY & GIT WORKFLOW

```bash
# Create main feature branch for Epic 1
git checkout -b feat/sensus-overhaul

# After each sub-epic, create isolated branch
git checkout -b feat/epic-1-collectors-wall
# ... develop ...
git commit -m "feat(epic-1): Dark Ambient grid + M3 tokens"
git push origin feat/epic-1-collectors-wall

# Open PR, get QA sign-off, merge to main
git checkout main
git pull origin main
git merge --no-ff feat/epic-1-collectors-wall
git push origin main

# Repeat for Epics 2, 3, 4, 5
git checkout -b feat/epic-2-carousel-filters
# ...
```

---

## SUCCESS METRICS (Pre-Launch)

- ✅ Focus group feedback: "Premium," "Luxury," "Easy to use" (not "novice")
- ✅ All 9 smoke tests pass on production
- ✅ Mobile layouts zero horizontal scroll
- ✅ WCAG AA: 100% compliance
- ✅ Lighthouse: Mobile >85, Desktop >90
- ✅ All existing features work flawlessly with new UI
- ✅ Designer hand-off sign-off

---

## KEY CONTACTS & RESOURCES

**Documentation:**
- `SENSUS_UI_UX_OVERHAUL.md` — Master strategy
- `epic-1-collectors-wall.md` — Week 2–4
- `epic-2-carousel-filters.md` — Week 5
- `epic-3-smells-like-search.md` — Week 6–8
- This file — Reference & post-launch roadmap

**Material Design 3:**
- https://m3.material.io/get-started
- https://m3.material.io/styles/color/the-color-system/color-roles-and-mapping
- https://m3.material.io/foundations/layout/understanding-layout

**Competitive Benchmarks:**
- Spotify (playlists, horizontal scroll, dark mode)
- Glossier (community, unboxing, social sharing)
- Aesop (typography restraint, minimalism)

---

## APPROVAL & SIGN-OFF

**Prepared by:** Lead UI/UX Architect
**For:** Christopher Goslin, Founder
**Status:** Ready for Production Execution
**Timeline:** 10 weeks to App Store submission

**Next Steps:**
1. Review SENSUS_UI_UX_OVERHAUL.md + 4 Epic briefs
2. Activate Principal UI/UX Architect Gem (new chat)
3. Start Week 1: Design comps (Figma mockups)
4. Week 2: Begin Epic 1 (Claude Code)
5. Weekly QA gates after each Epic completion

---

**This playbook represents a complete reimagining of nota. from MVP to premium market leader. Execution begins now.**
