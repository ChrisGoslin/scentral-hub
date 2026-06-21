# AnotherSense — QA Checklist
**Last updated:** 2026-06-21  
**For:** Pre-release verification before Phase deployment  
**Platforms:** Desktop (Chrome/Safari), Mobile (iOS/Android)

---

## PERSONA FLOW (Onboarding)
- [ ] Fresh browser, visit `/onboarding` → redirects or displays profiler
- [ ] Step 1: Select sanctuary tile (e.g., "The Lost Archive") → auto-advance to Step 2
- [ ] Step 2: Select projection (e.g., "Up Close") → auto-advance to Step 3
- [ ] Step 3: Multi-select context (e.g., "Date Night" + "Morning Ritual") → "Find my scent identity" button shows
- [ ] Click button → Step 4 reveals persona card with:
  - [ ] Persona name (e.g., "The Velvet Intellectual")
  - [ ] Tagline or descriptor
  - [ ] Character bullets or traits
- [ ] Click "Explore scents" → navigates to `/discover` with persona banner
- [ ] `localStorage.scentral_persona` set to correct persona ID
- [ ] `localStorage.scentral_onboarded` set to `true`
- [ ] "Show everything" link/button in discover banner clears persona filter and hides banner
- [ ] "Skip for now" on onboarding → skips to `/discover` without setting persona

---

## DISCOVER FLOW (Catalogue)
- [ ] Discover tab loads with 280+ fragrances visible
- [ ] Search input responsive: type "Sauvage" → results update (< 500ms)
- [ ] Filter by Feel chip (e.g., "Warm & Rich") → results filter, count updates
- [ ] Filter by Projection (e.g., "Strong") → results filter
- [ ] Filter by Season (e.g., "Winter") → results filter
- [ ] Sort toggle (Top Rated, Newest, A-Z) → results re-order
- [ ] Infinite scroll or pagination works: scroll to bottom → more items load
- [ ] Click fragrance card → navigates to `/collection/[id]`
- [ ] Detail page shows:
  - [ ] Fragrance name & brand
  - [ ] Brand logo or badge (if available)
  - [ ] Full-bleed hero image or placeholder
  - [ ] Projection badge (Beast Mode, Strong, etc.)
  - [ ] Note pyramid (Top, Heart, Base) or description
  - [ ] "Smells Like" section with similar fragrances
  - [ ] Social proof (e.g., "Loved by 234 users")
  - [ ] "Add to collection" button
- [ ] "Add to collection" button → toast/modal confirms "Added to collection"
- [ ] Wishlist heart icon (if present) → adds to `localStorage.scentral_wishlist`
- [ ] Search results for brand (e.g., "Lattafa") show all matching fragrances

---

## COLLECTION FLOW (Living Wardrobe)
- [ ] Collection tab loads without errors
- [ ] Shelf renders with 4 visible tiers:
  - [ ] *Top Signatures* (affinity 16–20)
  - [ ] *Occasion Modifiers* (affinity 8–15)
  - [ ] *Base Anchors* (affinity 1–7)
  - [ ] *Holding Zone* (unrated)
- [ ] Each tier has walnut-cabinet chrome/styling applied
- [ ] Bottle cards are full-bleed images in 2:3 aspect ratio
- [ ] Drag-drop reorder within tier:
  - [ ] Drag first bottle to position 2 → smooth animation (no jank)
  - [ ] Drop registers (cabinetSnapshot event fires, visible in Network → XHR or Console)
  - [ ] No console errors
- [ ] Sidebar view modes toggle:
  - [ ] "All" → shows all bottles in affinity order
  - [ ] "By House" → groups by brand/family
  - [ ] "By Season" → groups by season (if data available)
  - [ ] "Wishlist" → shows only wishlisted bottles
- [ ] Click bottle card → navigates to detail page
- [ ] Detail page from collection shows "Log a wear" button (if feature exists)
- [ ] "Log a wear" → confirms wear logged (localStorage `as_streak` updates or Supabase write)
- [ ] Scent memory input (if present) → saves text to `collections.scent_memory`

---

## YOU TAB (Profile & Insights)
- [ ] You tab loads without errors
- [ ] Persona card visible (if onboarded):
  - [ ] Shows persona name & tagline
  - [ ] "Retake profiler" link works → returns to `/onboarding`
- [ ] Teaser cards or sections visible (if not authenticated):
  - [ ] "See your scent profile" with "Sign in" CTA
  - [ ] Weekly wear summary (placeholder or data)
  - [ ] Streak counter (placeholder or data)
  - [ ] Wishlist count
- [ ] Settings section visible:
  - [ ] Privacy Policy link → opens `/privacy` and displays policy
  - [ ] Terms of Service link → opens `/terms` and displays terms
- [ ] Push notification toggle (if Phase 5-D done) → toggles without errors
- [ ] Dark mode toggle (if Phase 8-A done) → toggles theme and persists to localStorage

---

## SOCIAL TAB
- [ ] Social tab loads without errors
- [ ] Curated TikTok/YouTube content cards visible (if feed populated)
- [ ] Each card shows:
  - [ ] Fragrance name or brand
  - [ ] Video thumbnail or placeholder
  - [ ] View count or engagement metric (if available)
- [ ] Click card → opens video/link in new tab or in-app player (no auth wall)

---

## MOBILE LAYOUT (390px width)
- [ ] All 5 tabs load without horizontal scroll
- [ ] Tab bar (BottomNav) stays fixed at bottom, doesn't overlap content
- [ ] Shelf bottles stack vertically at narrow width (1-column grid)
- [ ] Fragrance cards readable: text size ≥ 12px, contrast ≥ 4.5:1
- [ ] Buttons tappable: min 44×44px touch target
- [ ] Form inputs have ≥ 44px height
- [ ] Safe area padding applied (notch/Dynamic Island clearance)
  - [ ] `paddingBottom: calc(env(safe-area-inset-bottom) + 96px)` or equivalent
- [ ] No layout jank on scroll or orientation change (landscape 812px → portrait 390px)
- [ ] Search input on Discover doesn't trigger iOS keyboard auto-scroll bounce

---

## PERFORMANCE
- [ ] Discover page First Contentful Paint (FCP) < 1.5s on mobile (Lighthouse throttling)
- [ ] Collection drag-drop smooth (60fps, no jank)
- [ ] Detail page load < 800ms
- [ ] Search results appear < 250ms after keystroke (debounce)
- [ ] No memory leaks on tab switch (check DevTools → Memory)
- [ ] No console errors or warnings (except expected third-party)

---

## ACCESSIBILITY (WCAG 2.1 AA)
- [ ] All text meets contrast ratio ≥ 4.5:1 against background
  - [ ] Test in both light mode (if available) and dark mode
  - [ ] Use tool: https://webaim.org/resources/contrastchecker/
- [ ] All interactive elements focusable via Tab key
  - [ ] Focus indicator visible (outline, ring, or highlight)
  - [ ] Focus order logical (left-to-right, top-to-bottom)
- [ ] All images have alt text or are marked `aria-hidden="true"` (if decorative)
- [ ] Form labels associated with inputs (`<label for="id">` or `aria-label`)
- [ ] Color not sole indicator of state:
  - [ ] If bottle is "liked", also use icon or text label, not color alone
  - [ ] If filter is "active", use badge or checkmark + color
- [ ] Buttons have accessible names (visible or `aria-label`)
- [ ] Links underlined or otherwise distinguished from plain text
- [ ] Modal dialogs have `role="dialog"` and trap focus (Tab cycles within modal)
- [ ] Screen reader tested (macOS: VoiceOver, Windows: NVDA, mobile: built-in)

---

## BROWSER/DEVICE COMPATIBILITY
- [ ] **Desktop:**
  - [ ] Chrome latest
  - [ ] Safari latest
  - [ ] Firefox (if supported)
- [ ] **Mobile:**
  - [ ] iOS Safari latest
  - [ ] Android Chrome latest
- [ ] No console errors or failed requests in DevTools → Network
- [ ] Images load correctly (check for 404 image URLs in Network tab)

---

## CRITICAL PATHS (Full User Journey)

### Path 1: New User → Onboarding → Discover → Add to Collection
1. [ ] Fresh browser visits `/`
2. [ ] Clicking "Get started" or equivalent → `/onboarding`
3. [ ] Complete 3-step profiler
4. [ ] Persona reveal → Click "Explore scents"
5. [ ] Land on `/discover` with persona banner
6. [ ] Search "Aventus" or scroll to find fragrance
7. [ ] Click card → `/collection/[id]`
8. [ ] Click "Add to collection"
9. [ ] Navigate to Collection tab → bottle appears in "Holding Zone" or appropriate tier

### Path 2: Browse → Detail → Log Wear
1. [ ] Open `/collection`
2. [ ] Click first bottle (if any in collection)
3. [ ] View detail page
4. [ ] Click "Log a wear"
5. [ ] Confirm wear logged (UI feedback + localStorage/Supabase update)
6. [ ] Return to Collection → "Last worn" date updates

### Path 3: Layering Lab (if live)
1. [ ] Open `/layering`
2. [ ] Search for first fragrance (e.g., "Creed")
3. [ ] Select it
4. [ ] Search for second fragrance (e.g., "Lattafa")
5. [ ] Select it
6. [ ] Click "Create combination" or "Save"
7. [ ] Confirmation appears (toast, modal, or new page)

---

## KNOWN ISSUES / BLOCKERS (update as issues arise)
- [ ] [Issue #XX] Mobile Safari sticky header jumps on scroll
- [ ] [Issue #YY] Playwright test timeout on slow network

---

## SIGN-OFF
**Tested by:** [Name]  
**Date:** [YYYY-MM-DD]  
**Devices tested:**  
- [ ] Desktop Chrome  
- [ ] Desktop Safari  
- [ ] iPhone 14/15  
- [ ] Android Pixel  

**Notes:**  
```
[Add any observations, edge cases, or deferred fixes]
```

**Ready to ship?** ☐ YES ☐ NO — **Reason:** [If NO, explain blockers]
