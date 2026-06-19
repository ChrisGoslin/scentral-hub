# Scentral — Claude Code Delegate Prompts
> Run in priority order. Each prompt is self-contained — paste directly into Claude Code or a new Cowork session.
> Generated: 2026-06-19

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
