# nota. UI/UX OVERHAUL — Complete Strategy & Execution Plan

**Version:** 1.0
**Date:** 2026-06-22
**Status:** Ready for Production Execution
**Timeline:** 10 Weeks
**Design Philosophy:** Dark Ambient Material 3 (M3 + Luxury Moodiness)

---

## Executive Summary

After focus group feedback that the current MVP feels "novice and vibe-coded," nota. (formerly nota.) is undergoing a complete UI/UX overhaul to become the **"Spotify of Fragrance"** — a premium, visually striking, gamified PWA that validates the collector's sensory journey while delivering world-class Material Design 3 usability.

**Key Pivot Points:**
- **Grid:** 2-col stretched → 12-col responsive Collector's Wall
- **Colors:** Warm browns + golds → Dark Ambient Material (Deep Slate #0F172A + Electric Cyan)
- **Filters:** Vertical stacks → Edge-to-edge horizontal carousels
- **Search:** Simple name match → Proximity engine ("Smells Like" + 70%+ note matching)
- **New Feature:** Aura AI Spritz Schedule (gamified daily routine guidance)
- **Hero:** Buried Scent Identity → Above-fold value prop

---

## Market Positioning

### The Landscape
- **Incumbents** (Fragrantica/Parfumo): Functional but visually archaic. Treat fragrance like Excel spreadsheets.
- **Luxury Benchmarks** (Byredo/Maison Margiela): Master emotional storytelling via stark typography and premium aesthetics.
- **nota.** (The Disruptor): Intersection of premium catalog + interactive sensory notebook. Guides choice without imposing rigid classifications.

### Target Consumer: Gavin, "The Conscious Collector"
- **Age:** 24–35, urban professional
- **Psychographics:** Views fragrance as invisible style punctuation. Discovers via TikTok but craves private, judgment-free curation spaces.
- **Behavioral:** Extremely time-poor mornings (needs decisions in <5 sec). Gamified mechanics resonate (XP, streaks). Demands interface match the luxury bottles on his dresser.
- **Pain Point:** Paradox of choice + morning time scarcity = decision fatigue.

---

## Design System: Dark Ambient Material 3

### Core Principles
1. **Material 3 Foundation:** Rigorous spacing, M3 12-col grid, touch targets ≥48px, strict type scales, dynamic color extraction.
2. **Luxury Overlay:** Glassmorphism (`backdrop-blur-md`, `bg-white/5`), edge-to-edge imagery, variable type weights, radial aura glows.
3. **No Compromise:** Accessibility (WCAG 4.5:1 contrast) + premium feel (frosted glass, moody atmospheres) coexist.

### Color Palette

**Primary Backgrounds:**
- Deep Slate Solid: `#0F172A` (main bg)
- Deep Slate with Grain: `#0F172A` + subtle radial gradient overlay

**Surface Containers (M3-Aligned):**
- Surface Container Lowest: `rgba(255, 255, 255, 0.02)` with `backdrop-blur-sm`
- Surface Container Low: `rgba(255, 255, 255, 0.03)` with `backdrop-blur-md` (primary card bg)
- Surface Container: `rgba(255, 255, 255, 0.05)` with `backdrop-blur-lg`
- Surface Container High: `rgba(255, 255, 255, 0.08)` (emphasis, interactive states)

**Accents:**
- Electric Cyan: `#06B6D4` (active states, rings, highlights)
- Moody Orchid: `#A855F7` (secondary accent, deep focus states)
- Warm Amber (Heritage): `#FBBF24` (used sparingly for "Date Night" auras)

**Typography:**
- Primary Text: `#E2E8F0` (crisp silver-white, 4.5:1+ contrast vs. #0F172A)
- Secondary Text: `#94A3B8` (muted silver, for subtitles)
- Muted Text: `#64748B` (for labels, hints)

### Typography Scale (M3 Tokens + Fluid Clamp)

All sizes are **responsive** using `clamp(min, preferred, max)`:

**Display Large**
- Size: `clamp(2.25rem, 5vw, 3.5rem)`
- Weight: 400 (light)
- Letter Spacing: `-0.015em` (tight tracking)
- Use: Hero headlines, persona reveal screens

**Headline Large**
- Size: `clamp(1.75rem, 3.5vw, 2.25rem)`
- Weight: 500 (medium)
- Use: Section headers, collection titles

**Title Large**
- Size: `clamp(1.375rem, 2.5vw, 1.75rem)`
- Weight: 600 (semibold)
- Use: Card titles, fragrance names

**Body Large**
- Size: `clamp(1rem, 1.5vw, 1.125rem)`
- Weight: 400 (regular)
- Use: Body copy, descriptions

**Body Medium**
- Size: `clamp(0.875rem, 1.2vw, 1rem)`
- Weight: 400 (regular)
- Use: Standard paragraph text, highest legibility

**Label Small**
- Size: `clamp(0.75rem, 1vw, 0.875rem)`
- Weight: 500 (medium)
- Use: Chip labels, badges, captions

### Responsive Grid System (M3 Standard)

**Breakpoints:**
- **Compact (default):** `grid-cols-3` or `grid-cols-4` (mobile, <600px)
- **Medium:** `md:grid-cols-6` (tablet, 600–840px)
- **Expanded:** `lg:grid-cols-8` (small desktop, 840–1200px)
- **Large:** `xl:grid-cols-10` (desktop, 1200px+)
- **Extra-Large:** `2xl:grid-cols-12` (ultra-wide, 1840px+)

**Gutters & Margins:**
- Mobile: 16px gutters, 16px edge margins
- Tablet+: 24px gutters, 24px edge margins
- Desktop+: 24px gutters, 32px edge margins

---

## Epic 1: The Collector's Wall High-Density Grid

### Objective
Replace the current 2-column stretched layout with a premium, responsive 12-column grid that displays 40–100 bottles per viewport without clutter.

### Files to Modify
- `app/(main)/collection/page.tsx` (server component)
- `app/(main)/collection/CollectionClient.tsx` (client state)
- `components/collection/BottleCard.tsx` (card styling)
- `app/(main)/discover/DiscoverClient.tsx` (discover grid)
- `app/globals.css` (new M3 color tokens)
- `tailwind.config.js` (extend M3 spacing scales)

### Specifications

**Grid Layout:**
```tailwind
grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12
gap-3 md:gap-4 lg:gap-6
px-4 md:px-6 lg:px-8
```

**Card Styling:**
- **Aspect Ratio:** Square (1:1)
- **Background:** `bg-white/5 backdrop-blur-md border border-white/10 rounded-lg`
- **Image Container:** 100% width, 100% height, `object-contain` with padding
- **Hover State:** `hover:scale-[1.03] hover:bg-white/8 hover:border-white/20 transition-all duration-300 ease-out`
- **Text Overlay:** Only on hover—brand name + title fade in from bottom with 200ms transition

**Fallback Images:**
When `image_url` is null or broken:
- Generate dynamic radial gradient based on fragrance family
- Woody family: warm smokey cedarwood tones (`from-amber-900 via-slate-800 to-slate-900`)
- Fresh family: light marine / citrus gradients (`from-cyan-300 via-slate-700 to-slate-800`)
- Floral family: soft rose / lavender tones (`from-rose-400 via-slate-800 to-slate-900`)
- Oudy family: deep resinous amber (`from-yellow-700 via-slate-900 to-black`)
- Display small centered bottle SVG icon + brand name below

**Mobile Responsiveness:**
- **390px (compact):** 4 columns, tight spacing
- **768px (tablet):** 6 columns, breathe more
- **1280px (desktop):** 10 columns, premium density
- **1920px (ultra-wide):** 12 columns, full M3 grid

### Acceptance Criteria
- ✅ 280+ fragrances load without lag
- ✅ No horizontal scroll on any viewport
- ✅ Hover states work on touch + desktop
- ✅ Fallback images render beautifully (not just gray blocks)
- ✅ All text passes 4.5:1 WCAG contrast
- ✅ Grid reflows smoothly on resize

---

## Epic 2: Edge-to-Edge Carousel Filters

### Objective
Replace vertical filter stacks with a luxe, full-width horizontal scrolling carousel. Filters are always visible, always accessible, never buried.

### Files to Modify
- `components/DiscoverFilters.tsx` (complete rewrite)
- `components/collection/CollectionFilters.tsx` (same pattern)
- `app/(main)/discover/page.tsx` (layout restructure)

### Specifications

**Layout:**
```tailwind
flex overflow-x-auto snap-x snap-mandatory hide-scrollbar
whitespace-nowrap gap-2 px-4 md:px-6 lg:px-8
py-3 mb-6
```

**Chip Styling (M3 Assist Chips):**
- **Base:** `rounded-full bg-white/5 border border-white/10 px-4 py-2`
- **Min Height:** 44px (M3 touch target)
- **Font:** Label Small token, `#E2E8F0`
- **Active State:** `bg-white/10 border-white/20 ring-2 ring-cyan-500`
- **Hover State:** `hover:bg-white/8 hover:border-white/15 transition-colors duration-200`

**Filter Categories (All Carousels):**

1. **Vibe / Family Filters:**
   - Woody, Floral, Oudy, Fresh, Amber, Aromatic, Citrus, Green, Fruity
   - Click chip → adds to active filter set
   - Multiple selections = OR logic (Woody OR Floral)

2. **Longevity / Projection Filters:**
   - Beast Mode, Strong, Moderate, Medium, Weak
   - Single selection (replaces previous)

3. **Event / Occasion Filters:**
   - Work, Date Night, NSFW, Gym, WFH, Travel, Weekend
   - Multiple selections = OR logic

4. **House / Designer Filters:**
   - Dior, YSL, Prada, Lattafa, Afnan, Khadlaj, Niche Houses, etc.
   - Horizontal scroll for all 50+ houses

**Behavior:**
- Each carousel scrolls independently
- Active chips highlighted with cyan ring
- "Clear All" button on far-right of each carousel (optional)
- Chips do NOT wrap to new line (essential for carousel feel)

### Acceptance Criteria
- ✅ All 4 carousels scroll smoothly on mobile/desktop
- ✅ Chips do not wrap
- ✅ Active state visually distinct
- ✅ Touch/mouse interactions work identically
- ✅ Snap-to-grid behavior smooth

---

## Epic 3: "Smells Like" Proximity Discovery Engine

### Objective
Transform search from simple name matching into an intelligent proximity engine. When user searches or selects a fragrance, show not just exact matches but **inspired-by relationships** + **70%+ note-composition matches**.

### Files to Modify
- `app/api/search/route.ts` (backend query logic)
- `app/(main)/discover/DiscoverClient.tsx` (search UI + results rendering)
- `components/SearchBar.tsx` (add "Smells Like" toggle)
- Database: leverage existing `inspired_by` relationships + add trigram similarity for notes

### Specifications

**Search Bar UI:**
- Primary search input with placeholder "Search fragrances, brands, or vibes..."
- Small toggle chip next to input: "Smells Like / Find Matches" (off by default)
- When toggled ON: results reformat to show 3 sections

**Result Sections (When "Smells Like" Active):**

1. **Exact Matches** (Top)
   - Direct name/brand/description matches using `pg_trgm` trigram search
   - Standard grid rendering

2. **Clones & DNA Matches** (Middle)
   - Fragrances with `inspired_by` relationship to query
   - Show confidence badge: "~85% Match" or "~70% Match"
   - Brief explanation: "Same DNA as [original], different opening"

3. **Close Family Alternatives** (Bottom)
   - Fragrances with ≥70% note-composition similarity
   - Use `pg_trgm` on concatenated note fields
   - Badge: "Similar Notes & Structure"

**Backend Logic:**

```sql
-- Query 1: Exact matches (name, brand, description)
SELECT * FROM fragrances
WHERE name % $1 OR brand % $1 OR plain_description % $1
ORDER BY similarity(name, $1) DESC
LIMIT 20;

-- Query 2: Inspired-by relationships
SELECT f.* FROM fragrances f
INNER JOIN inspired_by_relationships ibr ON f.id = ibr.inspired_by_fragrance_id
WHERE ibr.source_fragrance_name ~* $1
ORDER BY ibr.confidence_score DESC
LIMIT 15;

-- Query 3: Note composition matches (70%+)
SELECT * FROM fragrances
WHERE (concat_ws(' ', top_notes, heart_notes, base_notes) % $1)
  OR similarity(concat_ws(' ', top_notes, heart_notes, base_notes), $1) > 0.7
ORDER BY similarity(...) DESC
LIMIT 20;
```

**Rendering:**
- Each result card shows: fragrance image, name, brand, projection/longevity, why it matches
- Match-type badge: "Exact," "Clone ~85%," "Similar Notes ~75%"
- Tap card → detail page (unchanged)

### Acceptance Criteria
- ✅ Search "Sauvage" → Dior Sauvage + Lattafa Sauvage alternatives + 70%+ note matches
- ✅ Toggle works without page reload
- ✅ Results load in <500ms (cached, ISR 300s)
- ✅ No console errors on ambiguous queries
- ✅ Mobile: sections still render vertically without scrolling left/right

---

## Epic 4: Aura AI Spritz Schedule (Gamified Daily Routine)

### Objective
Introduce Aura, an AI Fragrance Chemist that guides Gavin through his daily fragrance routine with Duolingo-style gamification, push notifications, and streak tracking.

### Files to Create/Modify
- `app/(main)/schedule/page.tsx` (new route)
- `app/(main)/schedule/ScheduleClient.tsx` (swipeable deck)
- `components/schedule/SpritzCard.tsx` (individual card)
- `lib/aura.ts` (AI logic for generating daily schedules)
- `app/api/schedule/generate/route.ts` (backend route)
- `app/(main)/you/YouClient.tsx` (display active streak + daily prompt)

### Specifications

**Aura Daily Schedule Generation:**

When user opens app OR navigates to `/schedule`:
1. Read user's persona + current time + weather + calendar entry (if provided)
2. Pull 3 random fragrance recommendations from user's collection
3. Generate 3-event timeline:
   - **Morning (Now):** 30-min projection fragrance for opening
   - **Midday (4h later):** Complementary middle layer or fresh reapply
   - **Evening (8h later):** Final fragrance or bold evening option

**Example Flow for Gavin:**
- Opens app at 7:30 AM, office job, sunny weather
- Aura suggests:
  - Now: "2 sprays Prada L'Homme on neck + wrists — Fresh, clean start"
  - Midday: "1 spray YSL EDP across chest — Adds warmth, maintains presence"
  - Evening: "3 sprays Tom Ford Oud Wood — Bold, memorable close"

**Swipeable Card UI (Tinder-Style):**

Each card shows:
- **Animated silhouette** with highlighted pulse points (neck, wrists, chest)
- **Fragrance name + brand** (Title Large M3 token)
- **Spray instructions:** "2 sprays" + location + why ("Fresh, clean start")
- **Layering notes:** If layering with previous, show: "Building on: Prada L'Homme"
- **Two swipe options:**
  - Swipe RIGHT: "Done! ✓ +1 XP" → POST to `/api/wear-log`, log wear, increment streak
  - Swipe LEFT: "Do Later" → Push notification in 2–4 hours

**Card Appearance:**
- Background: `bg-gradient-to-br from-cyan-500/10 via-slate-900 to-orchid-500/10`
- Border: `border border-white/20`
- Animated entry: fade in + slide up (220ms ease-out)
- Feedback on swipe: haptic pulse (if supported), visual scale feedback

**"More Info" Button (Optional Expand):**
- Tap anywhere on card → expand to full-screen modal
- Show: Top/Heart/Base notes, projection + longevity, why Aura picked it, YouTube link
- Similar fragrances to try next
- Close: tap X or swipe down

**XP & Streak System:**
- Each logged wear = +1 XP
- Streak counter: "🔥 5-day streak" displayed in You tab
- Weekly milestone badges: "Week 1 Champion," "Month in Motion"
- Leaderboard (future, Phase 8): compare streaks with friends

**Push Notifications:**
- "Time for your midday spritz!" (4h after morning, if enabled)
- "Evening option ready!" (8h after morning)
- "Don't break your streak! 🔥 Open nota. to log today's wear"
- Notification includes quick action: "Log Now" → pre-fills wear log

### Acceptance Criteria
- ✅ Schedule loads in <200ms
- ✅ Swipe gestures work on mobile + desktop (mouse = drag)
- ✅ XP updates in real-time
- ✅ Streak persists across sessions (localStorage + DB backup)
- ✅ Push notifications trigger at correct times
- ✅ No console errors during swipe animations

---

## Epic 5: Landing Page Hero Redesign & Scent Identity Above-Fold

### Objective
Move core value prop (Scent Identity Profiler, Aura, Fragrance Wheel) above the fold. Fix typography hierarchy. Make landing page conversion-optimized.

### Files to Modify
- `app/page.tsx` (complete rewrite)
- `app/layout.tsx` (adjust viewport, add meta tags)
- `components/landing/HeroSection.tsx` (new)
- `components/landing/PersonaTeasers.tsx` (new)

### Specifications

**Hero Section (Viewport Height):**
- **Headline (Display Large):** "Your Scent Fingerprint" (M3 responsive clamp)
- **Subheadline (Body Large):** "Discover fragrances that match your unique sensory identity. No gatekeeping. Just you."
- **CTA Buttons (M3 Filled Buttons):**
  - Primary: "Find Your Identity →" (bg-cyan-500, routes to `/onboarding`)
  - Secondary: "Explore Collection →" (bg-white/10 border-white/20, routes to `/discover`)
- **Background:** Deep Slate with subtle radial gradient overlay (moody, premium)

**Persona Teaser Section (Below Hero):**
- **Section Title (Headline Large):** "Which one are you?"
- **3 Persona Cards (Inline Grid):**
  - Each: 240px wide, 160px tall, square image placeholder → persona avatar or mood shot
  - Name (Title Large, italic)
  - Tagline (Body Small, truncated at 2 lines)
  - Accent color strip (bottom 8px, persona.ui_theme.accentColor)
  - Hover: `hover:scale-105` + highlight
  - On tap: route to `/onboarding?persona=[id]`
- **Grid:** `flex gap-4 justify-center md:justify-start flex-wrap`

**Christopher Moment Card (Mid-Page):**
- Unchanged content, but restyle with glassmorphism:
- `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8`
- Image on left, copy on right (desktop); stacked (mobile)
- Headline: "Your £140 bottle has an £18 clone"
- Copy: Story about discovering identical-smelling alternatives
- CTA: "Discover Clones →" (routes to `/discover?query=clones`)

**Footer (Minimal):**
- Links: Privacy Policy, Terms of Service, Contact
- Social: Twitter, Instagram, TikTok
- Copyright: "nota. © 2026. Celebrating your scent fingerprint."
- Background: `bg-slate-950`

**Typography Fixes:**
- Display Large: `clamp(2.25rem, 5vw, 3.5rem)` (NOT "huge")
- Body Large: `clamp(1rem, 1.5vw, 1.125rem)` (NOT "too small")
- All text: `#E2E8F0` for 4.5:1+ contrast on Deep Slate

**Mobile Responsiveness:**
- Hero: Full viewport, stack headline + subheadline vertically centered
- CTAs: Full-width stacked buttons (mobile), inline (tablet+)
- Persona cards: Scroll horizontally on mobile (carousel), grid on tablet+
- Christopher card: Single column (mobile), 2-col (tablet+)

### Acceptance Criteria
- ✅ Scent Identity visible without scrolling (mobile + desktop)
- ✅ Headline + subheadline legible (no "huge or too small" feedback)
- ✅ CTAs prominent + tappable (min 48px height)
- ✅ Persona cards render beautifully in carousel (mobile) + grid (desktop)
- ✅ All typography scales fluidly with viewport
- ✅ No horizontal scroll

---

## Implementation Timeline: 10 Weeks

| Week | Epic | Deliverable | Status |
|------|------|-------------|--------|
| **1** | Design | Figma comps (grid, Aura, search, hero) | ⏳ |
| **2–3** | 1 + 2 | Dark Ambient tokens + 12-col grid + carousel filters | ⏳ |
| **4** | 1 + 2 | Full app with new visual system + filters | ⏳ |
| **5** | 3 | Smells Like search + proximity logic | ⏳ |
| **6–7** | 3 | Search results rendering + backend optimization | ⏳ |
| **8** | 3 + 4 | Search complete + Aura Spritz Schedule foundation | ⏳ |
| **9** | 4 | Aura full implementation (cards, swipe, XP, push) | ⏳ |
| **10** | 5 | Landing page redesigned + production-ready | ✅ Ready to Ship |

---

## Testing & QA Gates

After each Epic:
- ✅ Smoke tests (9/9 routes)
- ✅ Responsive check (390px, 768px, 1280px, 1920px)
- ✅ WCAG contrast audit
- ✅ `next build` → no chunks >500KB
- ✅ All existing features functional (persona, collection, discover, layering, wear logging)
- ✅ Performance audit (Lighthouse mobile >85, desktop >90)

---

## Post-Launch: Phase 8-D Affiliate Integration (Weeks 11–12, Concurrent with Monitoring)

Once nota. ships:
- Wire Awin affiliate links into detail page "Where to Buy" section
- Deploy `/api/prices` endpoint
- Implement SKU matching using `pg_trgm` + LLM tier
- Test: Fragrance detail page shows retailer prices + affiliate URLs

---

## Success Metrics (Pre-Launch)

- ✅ Focus group feedback: "Premium," "Luxury," "Easy to use"
- ✅ All 9 smoke tests pass on production
- ✅ Mobile: No layout issues, smooth scrolling
- ✅ Accessibility: 100% WCAG AA compliance
- ✅ Performance: Lighthouse >85 (mobile), >90 (desktop)
- ✅ All existing features (persona, collection, wardrobe, layering) work flawlessly with new UI

---

## Notes for Engineering Teams

- **Material Design 3 is a guideline, not a straitjacket.** Dark Ambient Material bends M3 rules in service of luxury aesthetics (glassmorphism, edge-to-edge layouts, moody color palettes) while maintaining M3's core usability principles (responsive grids, touch targets, accessible type scales).
- **No breaking changes to backend or data models.** All refactoring is frontend-only (styling, layout, new components).
- **Database stays frozen.** We use existing `inspired_by`, `family`, `projection`, `notes` fields for proximity search. No schema changes until Phase 8-D (Awin integration).
- **Accessibility is non-negotiable.** Every interactive element must meet WCAG 2.1 AA standards. Dark Ambient doesn't mean dark *and unreadable*.

---

## Branch Strategy

```bash
# Create feature branch for Epic 1
git checkout -b feat/epic-1-collectors-wall

# After each epic completion, commit and create new branch
git commit -m "feat(epic-1): Dark Ambient grid + M3 tokens"
git checkout -b feat/epic-2-carousel-filters

# Merge to main only after QA sign-off
git checkout main
git merge --no-ff feat/epic-1-collectors-wall
git push origin main
```

---

**nota. is ready for takeoff. Let's build something legendary.**
