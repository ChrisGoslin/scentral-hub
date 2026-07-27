# nota. Pre-Submission Checklist

## Purpose
Complete this checklist BEFORE submitting to Apple App Store or Google Play Store.
Each BLOCKING item must PASS. NON-BLOCKING items are post-launch hotfixes.

---

## PHASE 1: ONBOARDING & PERSONAS

### Onboarding Flow
- [ ] /onboarding exists and loads without error
- [ ] All 3 steps (Ceremony Arc animation) render without crash
- [ ] Step 1: Sanctuary Profiler questions display clearly
- [ ] Step 2: Persona reveal screen animates smoothly
- [ ] Step 3: Confirmation/onboarding-complete flow works
- [ ] localStorage `scentral_onboarded` is written after completion
- [ ] "Try a different identity →" button clears persona and resets Discover filter
- [ ] Onboarding data does not leak to server on skip or back button

**Status:** [ ] PASS [ ] FAIL

### Persona Engine
- [ ] 3 personas render correctly: Velvet Intellectual, Solar Minimalist, Dark Alchemist
- [ ] Persona reveal screen shows correct persona name, tagline, and card style
- [ ] localStorage `scentral_persona` persists across page reloads
- [ ] lib/personas.ts imported correctly (no duplicate persona data inline)
- [ ] Discover tab reads persona and pre-filters results

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 2: PWA & MOBILE COMPATIBILITY

### Responsive Layout
- [ ] All 5 main tabs load at 390px (iPhone SE) without horizontal scroll
- [ ] All 5 main tabs load at 1024px (iPad) and scale correctly
- [ ] BottomNav does NOT overlap content on any breakpoint
- [ ] Safe area padding (iOS notch) applied: `paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)'`
- [ ] Horizontal scroll strips have trailing spacer (`<div style={{ flexShrink: 0, width: 16 }} />`)
- [ ] All images use `object-contain` within fixed aspect ratios (no distortion)
- [ ] No text overflow or cutoff at any viewport

**Status:** [ ] PASS [ ] FAIL

### PWA Configuration
- [ ] manifest.json exists with `display: "standalone"`
- [ ] manifest.json `start_url: "/discover"`
- [ ] App icons included in manifest (192px, 512px)
- [ ] Apple meta tags in <head>: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- [ ] Apple app icon defined: `<link rel="apple-touch-icon" href="..." />`
- [ ] App can be installed to home screen (iOS and Android)

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 3: PERFORMANCE & BUILD

### Build & Bundling
- [ ] `npm run build` completes without error
- [ ] No chunks exceed 500KB
- [ ] No console errors on fresh /discover load
- [ ] No console warnings on fresh /collection load
- [ ] Next.js production build succeeds

**Status:** [ ] PASS [ ] FAIL

### Images & Media
- [ ] All fragrance images lazy-load correctly
- [ ] Image URLs stored in Supabase are accessible (not null)
- [ ] Placeholder or skeleton states show while images load
- [ ] No broken image links visible to user

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 4: CORE FEATURES

### Landing Page & Discover
- [ ] Landing page (/) renders with production copy (no waitlist form)
- [ ] Discover (/discover) loads and shows 280+ fragrances
- [ ] Discover filters by persona (if persona selected in onboarding)
- [ ] Search bar functional and responsive
- [ ] Empty state renders if no results match filter

**Status:** [ ] PASS [ ] FAIL

### Collection & Living Wardrobe
- [ ] Collection (/collection) renders WardrobeShelf with tiers
- [ ] All 4 tiers visible: Top Signatures, Occasion Modifiers, Base Anchors, Holding Zone
- [ ] Drag-and-drop reorder works on touch and mouse
- [ ] cabinetSnapshot CustomEvent fires on every drop (DO NOT REMOVE)
- [ ] WardrobeSidebar view modes work: All, By House, By Season, Wishlist
- [ ] OptimizedBottleCard renders correctly (BottleCard.tsx is dead code, not imported)
- [ ] Add-to-collection flow works from /discover and /collection/[id]
- [ ] Empty state shows if collection is empty

**Status:** [ ] PASS [ ] FAIL

### Fragrance Detail Page
- [ ] Fragrance detail (/collection/[id]) loads without error
- [ ] All fragrance data displays: brand, name, description, family, projection, season, use case
- [ ] "Inspired By" / "Smells Like" card visible (if applicable)
- [ ] Affinity slider (1-20) works and persists
- [ ] Affiliate disclosure visible if outbound purchase link present
- [ ] Empty state shows if fragrance not found
- [ ] Maceration started date displays correctly (if applicable)
- [ ] Fun fact renders for ≥3 fragrance families

**Status:** [ ] PASS [ ] FAIL

### Layering Lab
- [ ] Layering (/layering) loads and shows base/top fragrance selectors
- [ ] Search within selectors works
- [ ] "Get recommendation" button triggers Aura API call
- [ ] Recommendation renders with base/top pair and explanation
- [ ] "Save this combo" button works and persists to Supabase
- [ ] Dos & Don'ts panel renders (collapsed by default)
- [ ] Empty state shows if no recommendations yet

**Status:** [ ] PASS [ ] FAIL

### You / Profile Page
- [ ] You page (/you) loads and displays user data
- [ ] Signed-out state shows sign-in prompt (test with fake-session)
- [ ] Signed-in state shows email, week wear, saved combos
- [ ] Week wear table renders correctly (last 7 days)
- [ ] Saved combinations list shows with creation date
- [ ] Settings section visible: Theme toggle, Push notifications, Reset preferences
- [ ] Privacy Policy link functional (/privacy)
- [ ] Terms of Service link functional (/terms)
- [ ] Unlock Pro button visible
- [ ] Sign out button works
- [ ] Empty states show if no data (week wear, saved combos)

**Status:** [ ] PASS [ ] FAIL

### Social Tab
- [ ] Social (/social) loads without error
- [ ] Creator directory visible (not blank shell)
- [ ] Creator cards or video embeds render with metadata
- [ ] Links to TikTok / YouTube work correctly
- [ ] Empty state shows if no content

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 5: LEGAL & COMPLIANCE

### Privacy & Terms
- [ ] /privacy page loads and displays full, GDPR-compliant policy
- [ ] /privacy includes data collection, third-party services, GDPR rights, contact info
- [ ] /terms page loads and displays full Terms of Service
- [ ] /terms includes governing law (Ireland), age restriction, affiliate disclosure, liability limits
- [ ] Both pages have working "Last updated" date
- [ ] Both pages have working contact email link

**Status:** [ ] PASS [ ] FAIL

### Affiliate Disclosure
- [ ] Affiliate disclosure visible on every fragrance detail page with outbound link
- [ ] Disclosure text clear: "Some links earn nota. a commission at no cost to you"
- [ ] Affiliate links consistent across all product pages
- [ ] No hidden or misleading affiliate relationships

**Status:** [ ] PASS [ ] FAIL

### Secrets & Security
- [ ] No hardcoded API keys in source code (grep: `sk-`, `anon-`, `service_role`)
- [ ] NEXT_PUBLIC_SUPABASE_URL only in .env.local (gitignored)
- [ ] SUPABASE_SERVICE_KEY only in .env.local (server-side only)
- [ ] ANTHROPIC_API_KEY in Supabase Vault (never echoed)
- [ ] PostHog key only in .env (not hardcoded)
- [ ] .env.local not committed (check .gitignore)

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 6: ANALYTICS & TRACKING

### PostHog Events
- [ ] `persona_revealed` event fires when persona reveal screen shown
- [ ] `bottle_added` event fires when "Add to collection" button tapped
- [ ] `wear_logged` event fires when wear confirmation submitted
- [ ] Events include anonymized UUID (no personal data)
- [ ] Events respect "Do Not Track" (DNT) header if enabled

**Status:** [ ] PASS [ ] FAIL

### Data Collection Validation
- [ ] No search strings captured in analytics
- [ ] No email addresses captured
- [ ] No personal identifiers in telemetry
- [ ] Server-stored data (wear_logs, collections) keyed to scentral_anon_id only

**Status:** [ ] PASS [ ] FAIL

---

## PHASE 7: CONTENT & UX

### Copy & Messaging
- [ ] No "TODO", "placeholder", "coming soon" visible to end users
- [ ] Landing page hero has production copy (not waitlist form)
- [ ] All error messages are helpful and actionable
- [ ] All empty states have clear CTA ("Discover your first fragrance" style)
- [ ] Button labels are clear and present tense ("Add to Collection", not "Adding...")

**Status:** [ ] PASS [ ] FAIL

### Empty States (All 5 Tabs)
- [ ] Discover: Shows if search yields 0 results
- [ ] Collection: Shows if no fragrances added ("Your shelf is empty")
- [ ] Layering: Shows if no saved combos ("No layering combos yet")
- [ ] You: Shows if no week wear ("You haven't worn anything this week")
- [ ] Social: Shows if no creator content ("No content available")

**Status:** [ ] PASS [ ] FAIL

### Accessibility (Phase 5+)
- [ ] All buttons have clear labels (not icon-only)
- [ ] Color contrast meets WCAG AA (4.5:1 text on background)
- [ ] Focus states visible on interactive elements
- [ ] Touch targets ≥44×44px

**Status:** [ ] PASS [ ] FAIL (Non-blocking for MVP)

---

## PHASE 8: ADVANCED FEATURES (Phase 5+)

### XP System
- [ ] User XP table initialized in Supabase
- [ ] XP increments: wear log +10, scent memory +5, wishlist +5, onboarding +20
- [ ] Levels: 0→100→300→600→1000→1500 correct
- [ ] as_xp localStorage cache updates optimistically
- [ ] XP persists across page reloads

**Status:** [ ] PASS [ ] FAIL (Phase 5+)

### Spritz Schedule
- [ ] /spritz page loads and renders Aura swipe card
- [ ] Fragrance suggestion changes on swipe
- [ ] AnatomyIndicator renders correctly
- [ ] XP updates on swipe action

**Status:** [ ] PASS [ ] FAIL (Phase 5+)

### Fragrance Wheel
- [ ] /wheel page loads and renders 9-axis polar SVG
- [ ] Gap analysis shows unfilled sensory space
- [ ] Share as PNG works

**Status:** [ ] PASS [ ] FAIL (Phase 5+)

### Wear Streaks
- [ ] Streak UI visible in You page
- [ ] Streak increments on daily wear log
- [ ] Streak resets if day missed
- [ ] Longest streak tracked

**Status:** [ ] PASS [ ] FAIL (Phase 5+)

---

## SMOKE TEST (Run Last)

Execute in terminal:
```bash
cd ~/Projects/scentral-hub
node scripts/smoke-test.mjs
```

Expected output: 9-route table with all READY or similar success statuses.

Report:
```
Route              Status      Response Time    Notes
/                  READY       ~2.1s            —
/discover          READY       ~1.8s            —
/collection        READY       ~1.5s            —
/layering          READY       ~1.7s            —
/you               READY       ~1.4s            —
/social            READY       ~1.6s            —
/privacy           READY       ~1.2s            —
/terms             READY       ~1.2s            —
/onboarding        READY       ~1.9s            —
```

**Status:** [ ] PASS (All 9 routes READY) [ ] FAIL (Fix and re-run)

---

## BLOCKING VS NON-BLOCKING

### BLOCKERS (Must pass before submission)
- Onboarding completes without error
- Persona engine renders all 3 personas
- Collection page renders WardrobeShelf with all 4 tiers
- Discover filters by persona
- Layering Lab recommendations render
- Privacy Policy and Terms of Service pages load
- All 5 main tabs load at 390px without horizontal scroll
- npm run build completes without error
- No console errors on fresh load
- Affiliate disclosure on all product pages
- No hardcoded secrets in code
- Smoke test passes (9/9 routes READY)

### NON-BLOCKERS (Post-launch hotfixes)
- Accessibility features (color contrast, focus states)
- Wear streaks optimization
- XP system polish
- Fragrance Wheel edge cases
- Performance optimizations >500KB chunk targets
- Advanced error recovery flows

---

## FINAL CHECKLIST

- [ ] All PHASE 1-4 sections marked PASS
- [ ] All PHASE 5-7 sections marked PASS or N/A
- [ ] All BLOCKING items above are checked
- [ ] Smoke test report shows 9/9 routes READY
- [ ] Privacy Policy and Terms live at /privacy and /terms
- [ ] Links to both visible in You → Settings
- [ ] Build output confirms no secrets present
- [ ] git status clean (all changes committed)

---

## SUBMISSION READY

Once all above are verified:

1. Commit final changes:
   ```bash
   git add -A
   git commit -m "legal: privacy policy, terms of service, app store copy, presubmission checklist"
   ```

2. Deploy to production:
   ```bash
   cd ~/Projects/scentral-hub && npx vercel --prod
   ```

3. Confirm Vercel shows READY state before proceeding.

4. Submit to Apple App Store and Google Play Store using app-store-copy.md as reference.

---

## REVISION HISTORY

| Date | Version | Status |
|------|---------|--------|
| 2026-06-21 | 1.0 | Initial presubmission checklist for nota. MVP |
