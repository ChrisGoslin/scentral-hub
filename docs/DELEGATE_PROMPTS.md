# Scentral — Claude Code Delegate Prompts
> Run in priority order. Each prompt is self-contained — paste directly into Claude Code or a new Cowork session.
> Generated: 2026-06-19 | Updated: 2026-06-19 (Prompts 13–32 added)

---

## Prompt 1 — tsc clean + git commit (RUN FIRST)

```
cd ~/Projects/scentral-hub
npx tsc --noEmit --skipLibCheck

If 0 errors: run git add -A && git commit -m "feat: legal pages, WearLogModal, origin badge, Sensory Lenses"
If errors: fix them before committing. The files changed in this session are:
- app/privacy/page.tsx (new)
- app/terms/page.tsx (new)
- app/(main)/collection/WearLogModal.tsx (new)
- app/(main)/collection/BottleCard.tsx (modified)
- app/(main)/collection/WardrobeSidebar.tsx (modified)
- app/(main)/collection/WardrobeShelf.tsx (modified)
- app/(main)/collection/CollectionClient.tsx (modified)
- app/(main)/collection/page.tsx (modified)

Fix any type errors. CSS variable rules: no hardcoded hex. DB projection values only: Beast Mode, Strong, Moderate, Medium, Weak. Report the final tsc output.
```

---

## Prompt 2 — PostHog analytics (Phase 6-A)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Stack: Next.js 16.2.9 App Router, React 19.2.4.

Task: Add PostHog analytics.

1. Run: npm install posthog-js
2. Create lib/posthog.ts — PostHog client singleton initialised with process.env.NEXT_PUBLIC_POSTHOG_KEY
3. Create app/providers.tsx — 'use client' PostHogProvider wrapping {children}, only initialises if NEXT_PUBLIC_POSTHOG_KEY is set (fail safe)
4. Wrap app/layout.tsx root layout children in <Providers>
5. Fire these events in the correct components:
   - page_view: in a useEffect in app/layout.tsx (client portion) on route change
   - persona_set: in app/onboarding/page.tsx after writing scentral_persona to localStorage
   - feel_filter_applied: in app/(main)/discover/DiscoverClient.tsx when a feel chip is activated
   - wishlist_toggled: in DiscoverClient when wishlist add/remove fires
6. Add to .env.local: NEXT_PUBLIC_POSTHOG_KEY=<user will fill this in>

Rules: No hardcoded keys. All event properties must be plain strings/numbers/booleans — no PII. Run tsc --noEmit --skipLibCheck before and after. Report files changed.
```

---

## Prompt 3 — Wire WearLogModal to BottleCard

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub.

A WearLogModal component was built at app/(main)/collection/WearLogModal.tsx. It is not yet triggered anywhere.

Task: Add a "Log Wear" button to BottleCard that opens WearLogModal.

1. Read app/(main)/collection/BottleCard.tsx
2. Read app/(main)/collection/WearLogModal.tsx to understand its props
3. Add a small ghost button "Log Wear" that appears on hover (desktop) or always visible (mobile) in the bottom of the card
4. BottleCard needs to become 'use client' if it isn't already (to manage isOpen state)
5. Wire: clicking "Log Wear" opens WearLogModal with fragranceId and fragranceName from the card's fragrance prop
6. On modal save/close, reset local state

CSS rules: no hardcoded hex. Button style: ghost pill, var(--text-muted) text, var(--line) border, hover to var(--color-primary). Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

## Prompt 4 — Fix anonymous RLS for wear_logs

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp (lrkdwobnemczvhpixpky).

Problem: The WearLogModal inserts into wear_logs using an anonymous UUID (stored in localStorage key scentral_anon_id). The current RLS policy on wear_logs uses auth.uid(), which blocks anonymous inserts.

Task: Add an RLS policy to allow anonymous inserts into wear_logs.

Option A (recommended for MVP): Add a Supabase policy that allows INSERT for the anon role where user_id is a valid UUID format. Run via Supabase MCP or SQL editor:
  CREATE POLICY "anon_can_insert_wear_logs"
  ON wear_logs FOR INSERT
  TO anon
  WITH CHECK (user_id IS NOT NULL);

Option B: Create a Next.js API route /api/wear-log that uses the service role key (from env var SUPABASE_SERVICE_ROLE_KEY, never in client code) to bypass RLS.

Recommend Option A unless it creates a security risk given the no-auth MVP. Implement the chosen option. If using Option B, the client in WearLogModal must call /api/wear-log instead of direct Supabase insert. Run tsc --noEmit --skipLibCheck. Report what was done.
```

---

## Prompt 5 — Legal pages: add to footer and nav

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub.

Legal pages exist at /privacy and /terms (app/privacy/page.tsx, app/terms/page.tsx). They are not linked anywhere.

Task: Add footer links to both pages.

1. Read app/page.tsx (landing page) — it has a footer. Add links to /privacy and /terms there.
2. Read app/(main)/layout.tsx or app/layout.tsx — check if there's a shared footer or nav component. If so, add the links there too so they appear on all pages.
3. If no shared footer exists, create a minimal Footer component at components/ui/Footer.tsx and import it into the main layout.

Style: small text, var(--text-muted), inline separator " · " between links. No new colours. Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

## Prompt 6 — Real app icons

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub.

Problem: public/icons/icon-192.png and public/icons/icon-512.png are 1×1 pixel placeholders.

Task: Generate real brand icons.

Brand: Scentral. Aesthetic: quiet luxury, warm parchment (#F7F3EE background, #A0622A amber accent).
Icon concept: stylised letter "S" in Instrument Serif style, amber on parchment — or a simple amber resin drop / bottle silhouette.

Use the canvas-design skill or any available image generation to create SVG-based icons, then export/convert to:
- public/icons/icon-192.png (192×192px)
- public/icons/icon-512.png (512×512px)

If using SVG → PNG conversion, use sharp or canvas via a Node script in scripts/generate-icons.js (run with node scripts/generate-icons.js). The script should not be committed with secrets.

Also check public/manifest.json — icons array should already point to /icons/icon-192.png and /icons/icon-512.png. Verify this is correct. Report what was created.
```

---

## Prompt 7 — Social proof counts on Discover cards

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp (lrkdwobnemczvhpixpky). Tables: fragrances, collections, wear_logs, waitlist.

Task: Show "X own this · Y wishlisted" on fragrance cards in /discover.

1. Read app/(main)/discover/DiscoverClient.tsx and the data fetching in app/(main)/discover/page.tsx
2. Check the schema: does the collections table have rows per user per fragrance? Does the wishlist live in a separate table or in localStorage (scentral_wishlist key)?
3. If collections is a real table: add a Supabase COUNT query joining fragrances → collections to get owner counts. Batch this with the main fragrances query using a Postgres function or a select with count.
4. If wishlist is localStorage only: skip the wishlisted count for now — just show own count from DB.
5. Render below the fragrance name on each card: small muted text "12 own this" or "12 own · 4 wishlisted". Only show if count > 0.

Performance rule: do NOT make N individual count queries (one per card). Use a single aggregated query. Run tsc --noEmit --skipLibCheck. Report the query used and files modified.
```

---

## Prompt 8 — PWA Apple touch icon + meta tags

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub.

Task: Ensure the PWA is correctly configured for iOS Safari and Android Chrome.

1. Read public/manifest.json and app/layout.tsx
2. Add to app/layout.tsx metadata export (or <head> tags):
   - apple-touch-icon pointing to /icons/icon-192.png
   - theme-color: #A0622A
   - apple-mobile-web-app-capable: yes
   - apple-mobile-web-app-status-bar-style: default
   - viewport: width=device-width, initial-scale=1, viewport-fit=cover (needed for safe-area support)
3. In manifest.json verify: display: standalone, orientation: portrait, start_url: /
4. Add a splash screen entry if possible for iOS

Use Next.js 16 metadata API (export const metadata or generateMetadata) — do NOT use next/head directly in App Router. Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

## Prompt 9 — Persist feel chip + sort on Discover

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub.

Current state: DiscoverClient.tsx reads persona from localStorage on mount and pre-sets the feel chip. But if a user manually changes the feel chip and then navigates away, their choice is lost on return.

Task: Persist the user's last feel chip selection to localStorage.

1. Read app/(main)/discover/DiscoverClient.tsx fully
2. When the user manually clicks a feel chip, write the selected value to localStorage key scentral_discover_feel
3. On mount, read scentral_discover_feel FIRST — if it exists, use it. If not, fall back to the persona default (existing behaviour)
4. "Show everything →" dismiss button in the persona banner should clear scentral_discover_feel and reset to unfiltered view
5. Also persist the sort preference — already stored in scentral_discover_sort? Verify and ensure it works.

CSS rules: no hardcoded hex. Run tsc --noEmit --skipLibCheck. Report files modified and localStorage keys used.
```

---

## Prompt 11 — App Store & Play Store listing copy

```
Read AGENTS.md §1 and docs/specs/scentral-v1-master-spec.md first.
Project: ~/Projects/scentral-hub

Task: Write the complete app store listing copy and save it to docs/APP_STORE_LISTING.md

The app: Scentral — a fragrance wardrobe PWA. "Letterboxd for fragrance."
Target user: Gavan — newcomer collector, 5–10 bottles, plain language. Not an elitist forum.
Core philosophy: "Yes, And..." — every olfactory fingerprint is valid.
Privacy URL: https://scentral-hub.vercel.app/privacy
Support URL: https://scentral-hub.vercel.app

Produce ALL of the following in one file:

--- APPLE APP STORE ---
App Name (max 30 chars):
Subtitle (max 30 chars):
Description (max 4000 chars) — lead with the "Christopher moment": showing Gavan his €140 signature has an €18 clone. Hook in first 3 lines (shown before "more"). Warm, inclusive tone. No jargon. No star ratings, no elitism.
Keywords (max 100 chars, comma separated — think what Gavan searches):
Category: Primary + Secondary
Age Rating: (suggest based on content)
What's New (first version — max 4000 chars):

--- GOOGLE PLAY STORE ---
Short Description (max 80 chars):
Full Description (max 4000 chars — can adapt iOS version):
Category:

--- SCREENSHOTS BRIEF ---
List 6 key screens to screenshot (what screen, what state, what it should show).
Format: Screen name | URL path | What to set up before screenshotting | Why this screen matters

--- ASO NOTES ---
3 competitor apps to position against (search fragrance apps on App Store).
2 keyword gaps they're likely missing that Scentral owns.

Save everything to docs/APP_STORE_LISTING.md. No placeholders — write the actual copy.
```

---

## Prompt 12 — Fix NO_LCP (Lighthouse blocker — do before submission)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Problem identified via PageSpeed Insights (June 19 2026): the landing page returns NO_LCP — Lighthouse cannot find a Largest Contentful Paint element. This kills the Performance score and will fail PWA checks.

Root cause: likely the hero <h1> is not rendering as a visible DOM text node above the fold, OR the hero background is a CSS background-image (not an <img> tag). Lighthouse only tracks <img>, <image> inside SVG, <video poster>, or text nodes as LCP candidates.

Task:
1. Read app/page.tsx fully
2. Identify the hero section. Check:
   - Is the main heading an actual <h1> with visible text rendered in the DOM? (not hidden behind a gradient or opacity:0 on load)
   - Does any animation delay the heading's paint past 2.5s? (framer-motion fade-ins with long delays are a common cause)
   - Is there a hero image? If so, is it an <img> tag or CSS background? CSS backgrounds are NOT LCP candidates.
3. Fix:
   - If heading is hidden on load: ensure it's visible immediately (opacity:1 on load, animate other elements around it)
   - If using CSS background for hero image: convert to Next.js <Image> component with priority prop
   - If animation delays paint: reduce initial delay to 0, animate only after first paint
   - Add: <link rel="preconnect"> for any external font (Instrument Serif from Google Fonts)
4. Verify fix: check that app/layout.tsx has the font preload in the <head>

CSS rules: no hardcoded hex. Run tsc --noEmit --skipLibCheck before and after. Report exactly what was causing NO_LCP and what you changed.
```

---

## Prompt 10 — Full pre-launch audit + PROJECTS.md update

```
Read AGENTS.md §1, HANDOVER.md, and LAUNCH_PLAN.md first. Project: ~/Projects/scentral-hub.

Task: Run a full pre-launch audit and update PROJECTS.md to reflect reality.

1. Run: git log --oneline -20 to see what's actually on main
2. Run: npx tsc --noEmit --skipLibCheck — report any errors
3. Check these routes exist and have no obvious broken imports:
   - app/page.tsx (landing)
   - app/onboarding/page.tsx
   - app/(main)/discover/page.tsx
   - app/(main)/collection/page.tsx
   - app/privacy/page.tsx
   - app/terms/page.tsx
4. Check public/manifest.json is valid JSON with correct icon paths
5. Check .env.local exists (do NOT read its contents — just confirm it exists)
6. Update PROJECTS.md: mark completed phases [x], mark pending phases [ ]
7. Update HANDOVER.md date to today and revise "Next tasks" section to reflect current state

Do NOT make any code changes — this is a read + report + document task only. Report a clean summary of what's done, what's broken, and what's genuinely next.
```

---

# BATCH 2 — Added 2026-06-19

## 🔴 PRE-LAUNCH BLOCKERS

### Prompt 13 — Fix NO_LCP (retry — previous agent hit session limit)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Problem: PageSpeed Insights mobile audit returns NO_LCP on the landing page. Lighthouse cannot identify a Largest Contentful Paint element. This blocks the PWA checklist and kills the Performance score.

Root cause context (from prior diagnosis attempt): Lighthouse only tracks <img>, <image> in SVG, <video poster>, or block-level DOM text nodes as LCP. CSS background-image is invisible to it. Any animation that delays the hero h1 paint past ~2.5s also suppresses LCP detection.

Task:
1. Read app/page.tsx fully
2. Find the hero section. Check:
   a. Does the <h1> start hidden? Look for initial opacity:0, transform, or visibility:hidden that animates in. If yes — that's the cause. Fix: render h1 with opacity:1 immediately; animate only subtitle/CTA.
   b. Is the hero background a CSS background-image? Fix: replace with Next.js <Image priority> component.
   c. Any framer-motion initial={{ opacity: 0 }} on the h1? Fix: set initial={{ opacity: 1 }} on h1 only.
3. Read app/layout.tsx — check for Google Fonts preconnect links. Add if missing:
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
4. After fixing, the LCP candidate should be the h1 text node or a hero <img>.

Rules: CSS variables only. Do not change visual design — only fix paint timing. Run tsc --noEmit --skipLibCheck. Report exact cause found and what was changed.
```

---

### Prompt 14 — Sync PostHog key to Vercel production

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub
Vercel project: scentral (project ID: prj_M9i6d6V9JfV626sNWH2ROGMH3eTw)

Problem: NEXT_PUBLIC_POSTHOG_KEY is set in .env.local but NOT in Vercel production env vars. PostHog will be silent on the live deployment.

Task: Add the PostHog key to Vercel via the Vercel MCP or CLI.

Option A (Vercel MCP — preferred): Use the Vercel MCP tool to upsert NEXT_PUBLIC_POSTHOG_KEY as a production + preview environment variable. The key value is in .env.local — read the file to get it (do NOT log or echo the value in output; just use it in the API call).

Option B (CLI): Run in Terminal:
  vercel env add NEXT_PUBLIC_POSTHOG_KEY production
  (then paste the key value when prompted)

After adding: trigger a new Vercel deployment or confirm the next git push will pick it up.
Verify by checking the Vercel dashboard or running: vercel env ls

Report: which method was used and confirmation the variable is present in production scope.
```

---

## 🟡 PRE-LAUNCH POLISH

### Prompt 15 — Empty states for all routes

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Audit every main route for empty states and add brand-aligned copy where missing.

Routes to check (read each page file):
- /discover — when no fragrances match the active filters
- /collection — when user has 0 bottles added
- /layering — when no combinations saved
- /social — if feed is empty
- /you — if no wear logs exist

For each empty state:
- Heading: short, warm, "Yes, And..." tone (not "No results found")
- Sub-text: 1 line suggesting what to do next
- Optional: a ghost CTA button linking to the right next step

Examples of good tone:
- Collection empty: "Your wardrobe is waiting. Add your first bottle from Discover."
- Discover empty: "Nothing matches right now — try clearing the filters."
- Wear log empty: "Your first field note will live here. Spray something today."

Style: centred, max-width 320px, var(--text-muted) for sub-text, var(--color-primary) for CTA. Use the existing EmptyState component at components/ui/EmptyState.tsx if it exists — check first. CSS variables only. Run tsc --noEmit --skipLibCheck. Report files modified and copy used.
```

---

### Prompt 16 — Loading skeletons on Discover + Collection

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Replace any blank/white flash during data load with skeleton loaders on the two heaviest pages.

1. Read app/(main)/discover/page.tsx and DiscoverClient.tsx
2. Read app/(main)/collection/page.tsx and CollectionClient.tsx (or WardrobeShelf.tsx)
3. Check if a LoadingShimmer component exists at components/ui/LoadingShimmer.tsx — read it if so.

For Discover: while fragrances are loading, show a grid of 8 skeleton cards matching the real card dimensions (aspect-ratio 3/4, same gap). Use the existing LoadingShimmer if available, otherwise build a simple pulsing div using CSS animation.

For Collection: while collection data loads, show 4 skeleton rows mimicking the shelf tier layout.

Skeleton style: background var(--color-surface) with a subtle pulse animation (opacity 1 → 0.5 → 1, 1.5s infinite). No hardcoded colours. Border-radius matching real cards.

In Next.js App Router, the correct pattern is a loading.tsx file in the route folder — create app/(main)/discover/loading.tsx and app/(main)/collection/loading.tsx exporting a skeleton component. This gives instant skeleton on navigation automatically.

Run tsc --noEmit --skipLibCheck. Report files created/modified.
```

---

### Prompt 17 — Error boundaries and API fallbacks

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Ensure no API failure causes a blank/crashed screen. Add graceful fallbacks.

1. Read app/(main)/discover/DiscoverClient.tsx — find the Supabase fetch. If it throws, what happens now? Add try/catch with an inline error state: a simple banner "Something went wrong loading fragrances — try refreshing." with a retry button (onClick: window.location.reload()).

2. Check all /api/* routes used in client components. For each fetch call that lacks error handling, add it.

3. Create app/error.tsx (Next.js App Router global error boundary):
   - 'use client'
   - Shows a friendly full-page error: "Something went sideways." + "Go back" link
   - Logs error to console (do NOT log to PostHog — could cause infinite loop)
   - Includes a Reset button calling reset()

4. Create app/(main)/error.tsx for the main app section specifically (overrides the global one for authenticated routes).

CSS variables only. Use var(--color-primary) for buttons, var(--text-muted) for error sub-text. Run tsc --noEmit --skipLibCheck. Report files created/modified.
```

---

### Prompt 18 — Fragrance detail page enrichment

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp (lrkdwobnemczvhpixpky).

Task: Enrich the fragrance detail page at /collection/[id].

1. Read app/(main)/collection/[id]/page.tsx fully (verify the path — it might be under a different route)
2. Check what columns are currently displayed vs what's available: plain_description, inspired_by, family, projection, optimal_season, use_case, lean, image_url, pyramid (JSONB with top/heart/base notes)

Add if not already shown:
- Note pyramid: display top / heart / base notes in three labelled rows. Read pyramid JSONB. If null/empty, show nothing (don't show empty rows).
- "Inspired by" field (if populated): show as a subtle italic line "A take on [inspired_by]"
- Season + use_case chips: small pill badges using existing Chip component or inline spans
- Projection badge: use the origin badge colour system style — Beast Mode = amber, Strong = teal, Moderate = grey, Medium = grey, Weak = grey

Also add: a "Log a Wear" button that opens the WearLogModal (built at app/(main)/collection/WearLogModal.tsx). Wire up the modal here.

CSS variables only. DB projection values only: Beast Mode, Strong, Moderate, Medium, Weak. Run tsc --noEmit --skipLibCheck. Report files modified and what was added.
```

---

### Prompt 19 — Onboarding flow: skip + back + progress bar

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Improve the onboarding flow at app/onboarding/page.tsx.

1. Read the full file first.
2. Add a progress indicator: 4 small dots at the top (steps 1–4 including reveal). Active dot = var(--color-primary) filled. Past dots = filled muted. Future dots = empty circle outline. 
3. Add a Back button on steps 2, 3, 4 (not step 1). Back goes to previous step. Do not reset selections when going back — preserve them.
4. Add a Skip link on steps 1 and 2 only: small "Skip" text link bottom-right. Skipping sends user directly to /discover with no persona pre-set (clears localStorage persona keys).
5. The reveal step (step 4) should NOT have a Back or Skip — it's the payoff. Only the two CTAs: "Start Exploring" and "Show me everything".

CSS variables only. No new dependencies. Run tsc --noEmit --skipLibCheck. Report what was added.
```

---

### Prompt 20 — Mobile bottom nav: polish + active states

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Polish the mobile bottom navigation bar.

1. Find the bottom nav component — search the codebase for the nav bar (likely in app/(main)/layout.tsx or a components/ui/BottomNav.tsx). Read it fully.
2. Ensure active route highlighting works correctly — the active tab icon/label should use var(--color-primary). Use usePathname() from next/navigation to determine active route.
3. Route map for nav tabs:
   - /discover → Discover (icon: magnifying glass or compass)
   - /collection → My Bottles (icon: bottle or cabinet)
   - /layering → Lab (icon: beaker or layers)
   - /social → Community (icon: users)
   - /you → You (icon: person)
4. Each tab: icon above label. Active = var(--color-primary), inactive = var(--text-muted). Touch target min 44×44px.
5. Add safe-area-inset-bottom padding: padding-bottom: calc(0.75rem + env(safe-area-inset-bottom)) on the nav container.
6. Add subtle top border: border-top: 1px solid var(--line) on the nav.

CSS variables only. Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

### Prompt 21 — Discover: text search input

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp.

Task: Add a text search input to the Discover page.

1. Read app/(main)/discover/DiscoverClient.tsx and app/(main)/discover/page.tsx fully.
2. Add a search input at the top of the page (above the feel chips): placeholder "Search fragrances or brands..."
3. Search should filter client-side against already-loaded fragrances (no new DB query) — filter on name + brand fields. Debounce the input 300ms.
4. When search is active: hide the feel/projection/longevity filter chips to reduce clutter. Show a "× Clear search" pill to reset.
5. When search returns 0 results: show the empty state (see Prompt 15).
6. Persist search term in URL query param ?q= so back-navigation restores it.

Style: full-width input, var(--color-surface) background, var(--line) border, var(--color-primary) focus ring. No search icon if it adds complexity — text placeholder is enough. CSS variables only. Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

## 🔵 PRE-LAUNCH TECHNICAL

### Prompt 22 — Bundle size audit

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Identify and eliminate the heaviest unnecessary bundle weight.

1. Run: ANALYZE=true npm run build (first check if @next/bundle-analyzer is in package.json — if not, install it and add to next.config.js temporarily)
2. If bundle analyzer isn't practical in the sandbox, run: npx next build 2>&1 | grep "First Load JS" to see page-by-page sizes.
3. Identify any page over 200kB First Load JS.
4. Common fixes to look for and apply:
   - Any library imported at the top level that should be dynamic: use next/dynamic with ssr:false for heavy client components
   - date-fns, lodash, or similar — check if tree-shaken properly (import specific functions, not the whole library)
   - Any chart or animation library loaded globally that's only used on one page
5. Do NOT remove posthog-js, @dnd-kit, or framer-motion — these are intentional.

Run tsc --noEmit --skipLibCheck before and after. Report: initial bundle sizes per page, what was changed, and final sizes.
```

---

### Prompt 23 — Image optimisation audit

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Audit all image usage and ensure Next.js Image optimisation is applied everywhere.

1. Search the codebase for <img (lowercase, plain HTML img tags). List every instance.
2. For each plain <img> tag rendering a fragrance image or any user-facing image: replace with Next.js <Image> from 'next/image'.
   - Add width + height props (or fill + sizes for responsive)
   - Add alt text (fragrance name or descriptive string)
   - Add priority prop only for above-the-fold images (hero, first card in grid)
3. Check next.config.js — ensure the Supabase storage domain is in images.remotePatterns. The Supabase project URL is https://lrkdwobnemczvhpixpky.supabase.co — the image domain is lrkdwobnemczvhpixpky.supabase.co.
4. For the fragrance card grid: add loading="lazy" to all non-priority images (Next.js Image does this by default — just verify).

CSS variables only. Run tsc --noEmit --skipLibCheck. Report every file changed and number of <img> tags converted.
```

---

### Prompt 24 — Supabase query audit: N+1 check

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp.

Task: Check for N+1 query patterns and fix them.

An N+1 query is when code fetches a list (1 query), then loops over it making individual queries per item (N queries). Common in collection pages.

1. Read app/(main)/collection/page.tsx — check if any queries run inside a loop (e.g. fetching fragrance details one by one after getting collection IDs).
2. Read app/(main)/discover/page.tsx — same check.
3. Read any API routes at app/api/ that touch Supabase — check for loops with individual queries.
4. If found: replace with a single JOIN query or .in() filter. Example: instead of looping fragrance IDs and fetching each, use: supabase.from('fragrances').select('*').in('id', fragranceIds)

Also check: are any queries using select('*') when only 3-4 columns are needed? Narrow the select to only needed columns on heavy queries.

Run tsc --noEmit --skipLibCheck. Report any N+1 patterns found and the fix applied, or confirm none were found.
```

---

### Prompt 25 — Sentry error monitoring

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Stack: Next.js 16.2.9 App Router.

Task: Add Sentry for production error monitoring.

1. Check package.json — is @sentry/nextjs already installed?
2. If not: add @sentry/nextjs to package.json dependencies. Tell user to run npm install.
3. Create sentry.client.config.ts:
   - Init with process.env.NEXT_PUBLIC_SENTRY_DSN
   - tracesSampleRate: 0.1 (10% — avoid free tier limits)
   - replaysOnErrorSampleRate: 1.0
   - Only init if NEXT_PUBLIC_SENTRY_DSN is defined (fail-safe)
4. Create sentry.server.config.ts (same pattern, no replay)
5. Create sentry.edge.config.ts (minimal init only)
6. Update next.config.js to wrap with withSentryConfig — check Next.js 16 / Sentry compatibility first (read node_modules/@sentry/nextjs/package.json for version)
7. Add to .env.local placeholder: NEXT_PUBLIC_SENTRY_DSN= (user fills in from Sentry dashboard)
8. Add to app/error.tsx (if it exists): call Sentry.captureException(error) in the error boundary

Do NOT add Sentry to PostHog event tracking — they're separate. Run tsc --noEmit --skipLibCheck. Report files created/modified and confirm no hardcoded DSN.
```

---

### Prompt 26 — Shareable OG image card per fragrance

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Stack: Next.js 16.2.9 App Router.

Task: Generate dynamic Open Graph images for fragrance detail pages so sharing a link shows a rich preview.

1. Read app/(main)/collection/[id]/page.tsx to find the route structure and how fragrance data is fetched.
2. Create app/(main)/collection/[id]/opengraph-image.tsx (Next.js App Router ImageResponse):
   - Fetch the fragrance by ID from Supabase (server-side)
   - Render: fragrance name (large, Instrument Serif if available via font loading), brand, family, projection badge
   - Background: parchment #F7F3EE, accent amber #A0622A — hardcoded hex is acceptable ONLY in ImageResponse (it runs in Edge runtime, CSS variables don't apply)
   - Dimensions: 1200×630 (standard OG)
   - Fallback: if fragrance not found, render the Scentral logo/name generic card

3. Also check app/page.tsx — add static OG metadata to the root layout for the landing page (title, description, og:image pointing to a static /og-image.png placeholder for now).

Run tsc --noEmit --skipLibCheck. Report the route path and what the OG image renders.
```

---

## 🟢 PRE-SUBMISSION

### Prompt 27 — Waitlist page conversion polish

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase table: waitlist.

Task: Polish the /waitlist page to maximise sign-up conversion before App Store submission.

1. Read app/waitlist/page.tsx (or wherever /waitlist lives — search if unsure)
2. Read the waitlist table structure via AGENTS.md or by checking existing query code
3. Improvements:
   a. Headline: "Be first in." (short, direct)
   b. Sub-text: "Scentral is coming to iOS and Android. Drop your email and we'll let you know the moment it lands."
   c. Email input: large, centred, placeholder "your@email.com"
   d. CTA button: "Reserve my spot" — var(--color-primary) background, white text
   e. After submit: replace form with "You're in. We'll be in touch." — no page reload, just swap the component state
   f. Add a small counter below the form: "Join [N] others already waiting" — fetch COUNT from waitlist table server-side and pass as prop
   g. Social proof: 3 short quotes in small italic text (invent plausible ones in the "Yes, And..." tone)
4. Link to /waitlist from the landing page footer and from the /you page

CSS variables only. Run tsc --noEmit --skipLibCheck. Report files modified and the final copy used.
```

---

### Prompt 28 — Web push notification opt-in

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

VAPID keys are already in .env.local:
- NEXT_PUBLIC_VAPID_PUBLIC_KEY (client-safe)
- VAPID_PRIVATE_KEY (server only — never in client code)
- VAPID_EMAIL

Task: Add a web push notification opt-in for daily wear reminders.

1. Read app/(main)/you/page.tsx (or YouClient.tsx) — the /you page is where this setting should live.
2. Add a "Daily Reminder" toggle card on the /you page:
   - Label: "Daily wear reminder"
   - Sub-text: "Get a nudge each morning to log today's scent."
   - Toggle switch component (build a simple CSS toggle — no new package)
   - On toggle ON: call Notification.requestPermission(), then subscribe via navigator.serviceWorker.ready
3. Create app/api/push-subscribe/route.ts:
   - Receives the PushSubscription object
   - Stores it in Supabase (create table push_subscriptions with columns: id, endpoint, keys JSONB, created_at — provide the SQL to run)
   - Uses SUPABASE_SERVICE_KEY from env (server-side only)
4. Check public/sw.js or next.config.js — does a service worker exist? If not, create a minimal public/sw.js that handles push events: shows a notification with title "Scentral" and body from event.data.text()
5. Register the SW in app/layout.tsx (client-side useEffect)

CSS variables only. Run tsc --noEmit --skipLibCheck. Flag if service worker registration conflicts with Next.js PWA setup. Report files created/modified.
```

---

### Prompt 29 — Wear log history on fragrance detail page

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase project: scentral-mvp. Table: wear_logs.

Task: Show a user's wear log history on the fragrance detail page.

1. Read app/(main)/collection/[id]/page.tsx fully
2. Add a "Field Notes" section below the fragrance info: shows the last 5 wear logs for this fragrance
3. Data: query wear_logs where fragrance_id = [id] AND user_id = [anon id from localStorage]. Since we have no auth, the user_id is the localStorage scentral_anon_id key — fetch this client-side.
4. This section must be a 'use client' component (needs localStorage). Create app/(main)/collection/[id]/WearLogHistory.tsx:
   - On mount: reads scentral_anon_id from localStorage
   - Queries Supabase: .from('wear_logs').select('*').eq('fragrance_id', id).eq('user_id', anonId).order('logged_at', { ascending: false }).limit(5)
   - Renders each log as a small card: date, like/dislike pill, and the 3 stage alignment scores as dots (filled = liked, empty = neutral)
   - Empty state: "No field notes yet. Log your first wear."
5. Add a "+ Log Wear" button above the history section (opens WearLogModal)

CSS variables only. Run tsc --noEmit --skipLibCheck. Report files created and the Supabase query used.
```

---

### Prompt 30 — HANDOVER.md + PROJECTS.md session close

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Update the project handover documents to reflect everything built in this session (2026-06-19).

1. Run: git log --oneline -25 to see what's actually on main
2. Run: npx tsc --noEmit --skipLibCheck — note any errors
3. Read HANDOVER.md and PROJECTS.md fully

Update HANDOVER.md:
- Date: 2026-06-19
- Add to "Phases complete" table:
  * Today's session: Legal pages (/privacy, /terms), WearLogModal (3-stage), Origin badge on BottleCard, Sensory Lenses in WardrobeSidebar, PWA meta + splash screens, PostHog EU host + track() wrapper fixed, .env.local PostHog key added
- Update "Next tasks" section to reflect what's genuinely pending (reference docs/DELEGATE_PROMPTS.md for the full list)
- Update "Known fabrications" — add any new ones discovered this session
- Add note: NO_LCP on landing page detected via PageSpeed Insights (June 19 2026) — fix is Prompt 13 in DELEGATE_PROMPTS.md

Update PROJECTS.md:
- Mark completed phases [x]
- Add today's work as completed items
- Leave pending items as [ ]

Do NOT make code changes. Report a concise summary of what was updated.
```

---

## 🔵 POST-LAUNCH V1.1 (queue these — don't build yet)

### Prompt 31 — Maceration engine: 60-day visual tracker

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub
⚠️ THIS IS A V1.1 FEATURE — do not build until after hard launch.

Task: Build the maceration progress visual on BottleCard.

Context: When a bottle is "Freshly Unsealed" (origin_code = 'B' with is_unsealed_fresh = true), fragrance improves over ~60 days as chemical compounds stabilise. The UI should visually reflect this maturation.

Requirements:
1. Add maceration_start_date column to collections table if not present: ALTER TABLE collections ADD COLUMN maceration_start_date TIMESTAMPTZ;
2. When a user marks a bottle as "Freshly Unsealed" (new toggle in BottleCard or detail page), write maceration_start_date = now() to Supabase.
3. On BottleCard: if maceration_start_date is set and days elapsed < 60, render a subtle progress overlay on the card image — a gradient mask that shifts from pale (day 0) to saturated amber (day 60) over the bottom 30% of the card. Use CSS clip-path or a gradient overlay div with opacity tied to (daysElapsed / 60).
4. At day 60+: show a small "Peak" badge instead of the gradient.
5. Do NOT show a numeric countdown — only the visual shift.

CSS variables only (except the gradient, which can use rgba() with amber token values). Run tsc --noEmit --skipLibCheck. Report files modified.
```

---

### Prompt 32 — Full 5-stage temporal wear curve with drag interaction

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub
⚠️ THIS IS A V1.1 FEATURE — do not build until after hard launch.

Task: Upgrade WearLogModal from 3-stage static sliders to a 5-stage draggable curve.

Context: The current WearLogModal (app/(main)/collection/WearLogModal.tsx) has 3 stages with emoji-dot sliders. The V1 spec calls for a fluid line graph the user drags to show perception over the day.

Requirements:
1. Replace the 3-stage step flow with a single screen showing a line chart with 5 plotted points:
   - Stage 1: First Spray (0 min)
   - Stage 2: Opening (15 min)  
   - Stage 3: Heart (2–3 hrs)
   - Stage 4: Dry Down (6 hrs)
   - Stage 5: Skin Scent (8–12 hrs)
2. Each point is draggable vertically (Y axis = alignment 0–1). Use @dnd-kit or pointer events (no new package).
3. Draw a smooth SVG path connecting the 5 points (use cubic bezier or catmull-rom interpolation).
4. The path colour shifts from the user's persona ambient colour at the top to var(--text-muted) at the bottom.
5. Keep the like/dislike toggle and context chips from the current modal.
6. The temporal_curve JSONB now includes all 5 stages. The metadata field in wear_logs already stores this as JSONB — no schema change needed.

CSS variables only. Run tsc --noEmit --skipLibCheck. Report the interaction model used for dragging and files modified.
```
