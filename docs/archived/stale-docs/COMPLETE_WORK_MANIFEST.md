# nota. v1.0 + v1.1 Complete Work Manifest
> All 50 prompts for launch orchestration
> Generated: 2026-06-19

---

### Prompt 33 — Fix NO_LCP (Lighthouse blocker)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Problem: PageSpeed Insights mobile audit returns NO_LCP on the landing page. Lighthouse cannot identify a Largest Contentful Paint element. This blocks the PWA checklist and kills the Performance score.

Root cause context: Lighthouse only tracks <img>, <image> in SVG, <video poster>, or block-level DOM text nodes as LCP. CSS background-image is invisible to it. Any animation that delays the hero h1 paint past ~2.5s also suppresses LCP detection.

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

### Prompt 34 — Sync PostHog key to Vercel production

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

### Prompt 35 — Empty states for all routes

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

### Prompt 36 — Error boundaries and API fallbacks

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

### Prompt 37 — Loading skeletons on Discover + Collection

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

### Prompt 38 — Web push notifications for wear reminders

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
4. Check public/sw.js or next.config.js — does a service worker exist? If not, create a minimal public/sw.js that handles push events: shows a notification with title "nota." and body from event.data.text()
5. Register the SW in app/layout.tsx (client-side useEffect)

CSS variables only. Run tsc --noEmit --skipLibCheck. Flag if service worker registration conflicts with Next.js PWA setup. Report files created/modified.
```

---

### Prompt 39 — Dark mode theme toggle

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Add dark mode theme toggle on the /you settings page.

1. Read the existing theme system: check lib/design/tokens.css for the current light theme variables (--bg, --text, --color-primary, etc.)
2. Add corresponding dark theme variables to tokens.css — typically prefixed as [data-theme="dark"] selector:
   --bg: #1a1a1a
   --text: #f5f5f5
   --text-muted: #999
   --color-primary: #D4A070 (warm amber for dark mode)
   --surface: #2a2a2a
   --line: #444
   (Adjust exact values to match your existing palette)
3. Create a ThemeToggle component at app/components/ThemeToggle.tsx — 'use client':
   - Toggle switch that reads from localStorage key scentral_theme ('light' or 'dark')
   - On change: set data-theme attribute on <html> element, save to localStorage
   - On mount: read localStorage, apply to <html>
4. Add the toggle to app/(main)/you/page.tsx (or YouClient.tsx) in the settings section
5. Optionally: respect system preference on first visit — use window.matchMedia('(prefers-color-scheme: dark)')

CSS variables only. No hardcoded colours outside of ImageResponse contexts. Run tsc --noEmit --skipLibCheck. Report files created/modified.
```

---

### Prompt 40 — Final QE validation suite

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Run final validation before submission to ensure nothing is broken.

Checklist:
1. Run: npx tsc --noEmit --skipLibCheck — must be 0 errors
2. Run: npm run build — must complete without errors
3. Test key routes (open locally or preview deploy):
   - / (landing page) — ensure LCP is detected (no white flash, h1 visible immediately)
   - /onboarding (all 4 steps, test Skip + Back buttons)
   - /discover (test filters, empty state if needed, loading skeleton while data loads)
   - /collection (test add bottle, remove bottle, WearLogModal)
   - /you (test dark mode toggle, daily reminder toggle, wear log history)
   - /privacy and /terms (ensure readable)
4. Check mobile responsiveness on iPhone SE (375px viewport)
5. Run Lighthouse on landing page (desktop) — target: Performance > 85, PWA checklist passing
6. Test PostHog: open browser console, check Network tab — should see posthog/decide requests (if NEXT_PUBLIC_POSTHOG_KEY is set)
7. Check error boundary: navigate to /collection/999 (non-existent fragrance) — should show graceful error, not 500
8. Verify Vercel deployment: check the preview URL — should match local build

Write a test summary report. List any blockers found. If all pass, mark as ready for App Store submission.
```

---

### Prompt 41 — Maceration engine: 60-day visual tracker

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

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

### Prompt 42 — 5-stage temporal wear curve with drag interaction

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

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

---

### Prompt 43 — Fragrance origin story cards + collection origins badge

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Add fragrance origin narratives to the detail page and show origin badge on collection cards.

1. Check supabase schema: does fragrances table have an origin_story or narrative column? If not, note it (may be seeded via external API).
2. On fragrance detail page (app/(main)/collection/[id]/page.tsx), add:
   - Origin badge (already exists) showing origin_code + origin_label
   - A "Story" section: if origin_story exists in the DB, render it as italic left-aligned text in a subtle box (background: var(--color-surface), border-left: 2px solid var(--color-primary))
3. On BottleCard: ensure origin badge is visible (check if it's already there from prior work)
4. Verify no hardcoded hex values — all styling via CSS variables.

CSS variables only. Run tsc --noEmit --skipLibCheck. Report what was added and what columns exist vs. need seeding.
```

---

### Prompt 44 — Curated discovery collections (Home feed)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase: scentral-mvp.

Task: Build a home feed with curated collections on the landing page.

1. Create a new route app/(main)/home/page.tsx (or integrate into landing if /home doesn't exist yet)
2. This page shows:
   - Hero section from /page.tsx (reuse or import)
   - Below: 3–4 curated "collections" of fragrances (e.g. "Best of Spring", "Affordable Dupes", "Cult Favourites")
   - Each collection is a horizontal scrollable row of 5–6 fragrance cards (mini version of Discover cards)
   - Curated lists are hardcoded or fetched from a curations table in Supabase
3. Use existing fragrance card components, or build a slimmed-down card for this view
4. Add CTA at the end of each row: "See all →" linking to /discover with a pre-filled filter

CSS variables only. Run tsc --noEmit --skipLibCheck. Report the curated collections and files created.
```

---

### Prompt 45 — Social sharing: fragrance link cards + referral

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Make fragrance links shareable with rich OG images.

1. Verify Prompt 26 (opengraph-image.tsx) is complete. If not, build it first.
2. On fragrance detail pages and discover cards, add a share button:
   - Icon: share arrow or link
   - On click: open native share menu (navigator.share API) or fallback to a modal with copy-link + social presets
3. The shared link: [domain]/collection/[id] — when opened, it should show the fragrance OG image + metadata
4. Optional: Add a referral code system — if user signing up via a shared link, give them +100 "approval" points or similar reward (track in localStorage for now, implement full referral table in v1.1)

CSS variables only. Run tsc --noEmit --skipLibCheck. Report files created and share UX flow.
```

---

### Prompt 46 — Advanced filters: projection + family + season (V1.1 Week 2)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Expand the Discover filter system beyond feel chips.

1. Read DiscoverClient.tsx — understand current filter state (feel chip, projection chip)
2. Add three new expandable filter sections to a sidebar or modal:
   - Family (musky, citrus, floral, woody, etc.) — checkboxes, query fragrances.family = X
   - Season (Spring, Summer, Autumn, Winter) — checkboxes, query fragrances.optimal_season = X
   - Projection (Beast Mode, Strong, Moderate, Medium, Weak) — already implemented? If so, just ensure it's persistent
3. When user selects filters, apply AND logic: feel AND family AND projection AND season
4. Each filter should be saveable to localStorage (e.g., scentral_discover_filters = { feel: [...], family: [...], season: [...], projection: [...] })
5. Show "X filters active" badge; clicking it opens the filter panel

CSS variables only. Run tsc --noEmit --skipLibCheck. Report filter logic and localStorage keys.
```

---

### Prompt 47 — Magnetic canvas: visual wardrobe grid layout

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Redesign /collection to use a magnetic/masonry-style grid instead of shelves.

1. Read app/(main)/collection/WardrobeShelf.tsx — understand the current shelf tier layout
2. Replace with a CSS Grid layout (Pinterest-style masonry) or a magnetic CSS layout library (no new npm install unless critical)
3. Cards should auto-arrange and fill gaps; when user reorders bottles (via drag-drop), cards should animate smoothly
4. Each card: same design as before (origin badge, fragrance name, brand), but now in a dense grid
5. Mobile: single column. Tablet: 2–3 columns. Desktop: 3–4 columns.

CSS variables only. No new heavy dependencies. Run tsc --noEmit --skipLibCheck. Report grid layout approach and files modified.
```

---

### Prompt 48 — Insights dashboard: wear trends + favourite month + top tier (V1.1 Week 2)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase: scentral-mvp.

Task: Build an insights tab on /you showing wear trends.

1. Create app/(main)/you/InsightsDashboard.tsx — 'use client'
2. Queries wear_logs table for the logged-in anon user (scentral_anon_id from localStorage)
3. Visualise:
   - Wear count by month (small bar chart or text summary): "You wore 12 fragrances in June"
   - Top 3 most-worn bottles (title + count)
   - Favourite season (inferred from wear_logs + fragrance.optimal_season): "Spring is your season — 40% of wears"
   - Streak: consecutive days with a log (simple counter, no fancy calendar)
4. All text-based or simple bar/line charts — no heavy charting library if possible. Use plain SVG or canvas if needed.

CSS variables only. Run tsc --noEmit --skipLibCheck. Report the insights queries and what metrics are shown.
```

---

### Prompt 49 — Social feed: what others are wearing (V1.1 Week 2)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub

Task: Build the /social feed showing recent wear logs from the community (anonymously).

1. Read or create app/(main)/social/page.tsx
2. Query the last 50 wear_logs from all users, ordered by logged_at DESC
3. For each log, show:
   - Fragrance image + name
   - "Someone wore this" + relative time (e.g., "2 hours ago")
   - Like/dislike indicator (if stored in wear_logs.liked)
   - Optional: persona avatar (if wear_logs stores persona reference)
4. Style: card grid, 2 columns on desktop, 1 on mobile
5. Pull-to-refresh on mobile (standard browser refresh, or add Framer Motion gesture if desired)
6. No authentication — all data is anonymous and public

CSS variables only. Run tsc --noEmit --skipLibCheck. Report feed query and display format.
```

---

### Prompt 50 — Beta feedback form + feature request voting (V1.1 Week 2)

```
Read AGENTS.md §1 first. Project: ~/Projects/scentral-hub. Supabase: scentral-mvp.

Task: Add a beta feedback collection system.

1. Create app/(main)/you/FeedbackForm.tsx — 'use client' modal/drawer
   - Heading: "Help us improve nota."
   - Three sections:
     a. Feedback type: "Bug" / "Feature idea" / "General comment" (radio)
     b. Message: text area, 50–500 chars
     c. Email (optional): user can optionally provide contact info for follow-up
2. On submit: save to Supabase table `feedback` (columns: id, feedback_type, message, email, user_id, created_at)
3. Add a "Send feedback" link on /you page or a floating button
4. After submit: show "Thanks for the feedback! We read every message."

Also plan (don't build yet):
- Admin dashboard at /admin/feedback to review submissions (requires auth layer — skip for MVP, just note the pattern)

CSS variables only. Run tsc --noEmit --skipLibCheck. Report table schema and files created.
```

---

