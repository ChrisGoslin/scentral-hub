# AnotherSense — Sprint Prompts (2026-06-23)
# Run these in Claude Code (CLI) in order. Each is a self-contained prompt.
# Dependency order: Sprint 1 must finish before 2. Sprints 3–6 can run after Sprint 1.

---

## SPRINT 1 — Dark Theme Default + themeColor fix
### Priority: P0 — BLOCKS EVERYTHING ELSE VISUALLY
### Run this first, alone. Everything looks wrong until this is done.

```
Read AGENTS.md first. Ground yourself on the AnotherSense stack.

## Task: Apply dark theme as the default

### Background
app/globals.css defines two palettes:
- `:root` → warm cream `#F7F3EE` (OLD, should not be the default)
- `[data-theme="dark"]` → `#0F172A` deep slate (CORRECT — should be default)

No code ever sets `data-theme="dark"` so the app looks identical to before the SENSUS overhaul.

### Changes required

**1. app/layout.tsx** — add `data-theme="dark"` to the html element:
```tsx
<html lang="en" data-theme="dark" className={`h-[100dvh] antialiased ${instrumentSerif.variable} ${unbounded.variable}`}>
```

**2. app/layout.tsx** — fix the themeColor in the viewport export. Change:
```ts
themeColor: "#A0622A",  // old warm brown
```
to:
```ts
themeColor: "#0F172A",  // dark slate — matches the app
```

**3. app/globals.css** — The `[data-theme="dark"]` block should remain as-is (those are the correct tokens). BUT the `:root` block needs these additions so light mode is available as a future toggle. Rename the current `:root` colour tokens section by wrapping it so it reads:

Keep the existing `:root` block exactly as-is for all non-colour tokens (shadows, typography, motion, aura tokens, glass vars). Only ensure the colour tokens `--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, `--color-border` etc. in `:root` are overridden by `[data-theme="dark"]` — which they already are since `[data-theme="dark"]` on html overrides `:root` for those vars.

DO NOT restructure globals.css. Just add `data-theme="dark"` to the html element and fix themeColor. That's it.

**4. Verify no hardcoded warm colours leaked into components** — grep for `#F7F3EE`, `#FAF7F2`, `#A0622A` in app/ and components/. If found in inline styles, replace with CSS variables (`var(--bg)`, `var(--surface)`, `var(--accent)`).

**5. After changes:**
- `npm run build` must pass
- Commit: `feat: apply dark theme as default, fix themeColor`
- Deploy: `npx vercel --prod`
- Confirm `scentral-hub.vercel.app` shows dark slate background
```

---

## SPRINT 2 — Fix Blank Fragrance Cards + Discover Scroll
### Priority: P0 — Broken UX reported by user in UAT
### Run after Sprint 1

```
Read AGENTS.md first.

## Task: Fix two broken UX issues on Discover

### Issue 1: Blank fragrance cards until hover
Fragrances without `image_url` show completely blank cards until hover reveals the name.

**Root cause:** `FragranceCardMedia` component (at `components/discover/FragranceCardMedia.tsx`) or `OptimizedBottleCard` — whichever handles missing images — is not rendering a visible fallback.

**Fix:** 
1. Read `components/discover/FragranceCardMedia.tsx`
2. When `image_url` is null/empty, render a gradient placeholder that is ALWAYS visible (not hover-dependent). Use the family-based gradient pattern:
   - Woody/Oud → `linear-gradient(135deg, oklch(0.45 0.12 60) 0%, oklch(0.18 0.04 240) 100%)`
   - Fresh/Citrus → `linear-gradient(135deg, oklch(0.65 0.14 195) 0%, oklch(0.22 0.06 240) 100%)`
   - Floral → `linear-gradient(135deg, oklch(0.65 0.12 350) 0%, oklch(0.22 0.06 300) 100%)`
   - Oriental/Amber → `linear-gradient(135deg, oklch(0.55 0.16 50) 0%, oklch(0.18 0.04 240) 100%)`
   - Default fallback → `linear-gradient(135deg, var(--aura-surface), oklch(0.12 0.02 240))`
3. Show the fragrance name + brand in the centre of the gradient tile at all times (not just on hover). Overlay with semi-transparent text using `var(--color-text)`.
4. Ensure the fragrance name is ALWAYS visible as bottom-overlay text, not just on hover.

### Issue 2: Discover page doesn't scroll
User reported "it doesn't seem to scroll" on the Discover page.

**Root cause:** Likely `overflow: hidden` on a parent container, or the grid container has a fixed height.

**Fix:**
1. Read `app/(main)/discover/page.tsx` and `DiscoverClient.tsx`
2. Find any container with `overflow: hidden` or fixed `height` that wraps the fragrance grid
3. The `(main)/layout.tsx` — check if it applies any height constraints
4. Ensure the page can scroll vertically. The grid should extend as long as needed. Body and html should have `overflow-x: hidden` only, not `overflow: hidden`.
5. Check `app/globals.css` for any `overflow: hidden` on `html` or `body` that blocks vertical scroll.

### After fixes:
- `npm run build` must pass
- Commit: `fix: fragrance card gradient fallback always visible, discover scroll`
- Deploy: `npx vercel --prod`
- Verify: open `/discover` — cards show gradient tiles when no image, page scrolls
```

---

## SPRINT 3 — BottomNav: Swap Ritual → Spritz
### Priority: P1 — Surfaces the better UX
### Can run in parallel with Sprint 2 (different files)

```
Read AGENTS.md first.

## Task: Update BottomNav to feature Spritz instead of Ritual (Schedule)

### Background
- `/spritz` is the new Aura swipe-card experience — free tier, gamified, the future
- `/schedule` (Ritual) is the legacy Pro-gated morning/midday/evening planner
- The BottomNav currently shows "Ritual → /schedule" — users who tap it hit a Pro gate
- Spritz is free, compelling, and the correct daily-use feature to surface

### Changes

**1. `app/components/BottomNav.tsx`**

Change the NAV_ITEMS array from:
```ts
const NAV_ITEMS = [
  { label: 'Wardrobe', href: '/collection', Icon: Archive },
  { label: 'Lab',      href: '/layering',   Icon: FlaskConical },
  { label: 'Discover', href: '/discover',   Icon: Compass },
  { label: 'Ritual',   href: '/schedule',   Icon: Calendar },
  { label: 'You',      href: '/you',        Icon: User },
]
```

To:
```ts
import { Archive, FlaskConical, Compass, Droplets, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Wardrobe', href: '/collection', Icon: Archive },
  { label: 'Lab',      href: '/layering',   Icon: FlaskConical },
  { label: 'Discover', href: '/discover',   Icon: Compass },
  { label: 'Spritz',   href: '/spritz',     Icon: Droplets },
  { label: 'You',      href: '/you',        Icon: User },
]
```

Remove `Calendar` from imports, add `Droplets`.

**2. No other changes needed.** /schedule remains accessible directly via URL — just no longer in the primary nav. Users who bookmarked it still get there.

### After change:
- `npm run build` must pass
- Commit: `feat: swap BottomNav Ritual→Spritz, surface free-tier daily feature`
- Deploy: `npx vercel --prod`
- Verify: bottom nav shows "Spritz" tab, tapping goes to `/spritz` swipe card experience
```

---

## SPRINT 4 — Build /clones Page (Clone Finder)
### Priority: P1 — Biggest market opportunity, 500k users on competitor site
### Run after Sprint 1. Requires no DB changes — uses existing `inspired_by` column.

```
Read AGENTS.md first.

## Task: Build a dedicated Clone Finder page at /clones

### Background
- clonespreadsheet.com has 500k+ users searching for affordable alternatives to designer fragrances
- Our DB has 282 fragrances, many with an `inspired_by` column naming the designer scent they clone
- The landing page has a "Your £140 bottle has an £18 clone" card but no UI to find clones
- This page is the #1 conversion and SEO opportunity

### What to build
A page at `app/(main)/clones/page.tsx` with a client component `ClonesClient.tsx`.

**The experience:**
1. Search bar at top: "Search a designer fragrance..." (e.g. "Creed Aventus", "Dior Sauvage")
2. Below: a grid of clone cards matching the search
3. Each card shows:
   - Left: designer original name + brand (from `inspired_by` field)
   - Right arrow →
   - Right: our fragrance name + brand + price indicator
   - Bottom: family tag, projection badge, "View →" link to `/collection/[id]`
4. When no search: show "Most Cloned Designers" — group our catalogue by `inspired_by` and show the top 12 most-cloned originals as category pills (Creed Aventus, Dior Sauvage, Tom Ford OUD Wood, Bleu de Chanel, etc.)
5. Empty state: "No clones found. Try searching by designer name or scent family."

### Data
- Table: `fragrances`
- Key column: `inspired_by` (text) — contains the designer scent name this fragrance clones, e.g. "Creed Aventus", "Dior Sauvage EDP", "Tom Ford Black Orchid"
- Other columns: `id`, `brand`, `name`, `family`, `projection`, `image_url`, `lean`
- Fetch all fragrances where `inspired_by IS NOT NULL` on page load (server component)
- Client-side filter by search term matching against `inspired_by`, `brand`, or `name`

### Server component (page.tsx)
```tsx
import { createClient } from '@supabase/supabase-js'
import ClonesClient from './ClonesClient'

function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export const dynamic = 'force-dynamic'

export default async function ClonesPage() {
  const { data: clones } = await getPublicSupabase()
    .from('fragrances')
    .select('id, brand, name, family, projection, image_url, lean, inspired_by')
    .not('inspired_by', 'is', null)
    .order('inspired_by', { ascending: true })

  return <ClonesClient clones={clones ?? []} />
}
```

### Client component (ClonesClient.tsx)
- `'use client'`
- Search input filters by `inspired_by`, `brand`, `name` (case-insensitive)
- When search empty: show top 12 most-cloned designers as clickable pills (count occurrences of `inspired_by` values, pick top 12)
- Clicking a pill pre-fills search with that designer name
- Grid layout: `repeat(auto-fill, minmax(320px, 1fr))` gap-4
- Each card: dark glassmorphism (`var(--surface)`, `border: 1px solid var(--line)`, `border-radius: var(--r-card)`)
- Track page view: `track('clones_page_viewed')` on mount

### Add to navigation
In `app/(main)/layout.tsx` or wherever the app shell links are managed, ensure `/clones` is accessible. Do NOT add to BottomNav (already 5 items). It will be linked from the landing page Christopher Moment card.

### Update landing page link
In `app/page.tsx`, find the "Discover Clones →" link:
```tsx
<Link href="/discover?query=clones" ...>Discover Clones →</Link>
```
Change href to `/clones`.

### After build:
- `npm run build` must pass
- Commit: `feat: /clones page — clone finder with inspired_by search`
- Deploy: `npx vercel --prod`
- Verify: go to `/clones`, search "Creed", see clone results
```

---

## SPRINT 5 — Build /wheel Route (Fragrance Wheel)
### Priority: P1 — Specified in AGENTS.md, currently missing
### Run after Sprint 1. Independent of other sprints.

```
Read AGENTS.md first.

## Task: Build the /wheel Fragrance Wheel page

### Background
AGENTS.md §1 specifies: `/wheel` — Fragrance Wheel (9-axis polar SVG, gap analysis, share as PNG)
This route does not exist. Build it.

### What to build
A page at `app/(main)/wheel/page.tsx` with a client component `WheelClient.tsx`.

### The experience
A beautiful polar/radar chart showing the user's fragrance collection across 9 scent dimensions.

**The 9 axes (map from our `family` + `lean` + `projection` data):**
1. Woody
2. Floral  
3. Fresh/Citrus
4. Oriental/Amber
5. Gourmand
6. Aquatic
7. Spicy
8. Musky
9. Oud/Resinous

**Data source:**
- From `collections` table (user's bottles): join with `fragrances` to get `family` + `lean`
- Anonymous user via `scentral_anon_id` from localStorage
- Map each fragrance's `family` field to one of the 9 axes:
  - "Woody" → Woody
  - "Floral" → Floral
  - "Fresh", "Citrus", "Green" → Fresh/Citrus
  - "Oriental", "Amber" → Oriental/Amber
  - "Gourmand", "Sweet" → Gourmand
  - "Aquatic", "Marine" → Aquatic
  - "Spicy", "Aromatic" → Spicy
  - "Musk", "Powdery" → Musky
  - "Oud", "Resinous", "Smoky" → Oud/Resinous

**The wheel:**
- SVG polar chart, 9 axes radiating from centre, 60–360px radius
- Each axis: score 0–10 based on how many collection bottles map to that family (normalised)
- Filled polygon connecting the scores, filled with `rgba(6, 182, 212, 0.15)` (cyan with transparency)
- Axis lines: `var(--line)` colour, dashed
- Score polygon stroke: `var(--accent)` (cyan)
- Axis labels: family names, placed at tip of each axis, `var(--text-muted)`, 11px

**Gap analysis panel (below the wheel):**
- Title: "Your Collection Gaps"
- Show the 3 lowest-scoring axes with a suggestion: e.g. "You have no Fresh/Citrus fragrances. → Discover Fresh"
- Each gap links to `/discover` with a pre-filled filter

**Share as PNG button:**
- Use `html2canvas` or similar to capture the SVG + title as a PNG
- Button: "Share My Wheel" — triggers download of `anothersense-wheel.png`
- Note: install html2canvas if not present: check package.json first

**Empty state (no collection items):**
- Show the wheel outline with all axes at 0
- Message: "Add fragrances to your wardrobe to see your scent profile"
- CTA: "Discover Fragrances →" linking to `/discover`

**Server component (page.tsx):**
```tsx
export const dynamic = 'force-dynamic'
export default function WheelPage() {
  return <WheelClient />
}
```

**Client component handles all data** (localStorage anonId → fetch collections → join fragrances).

### Fetch pattern
```ts
// In WheelClient useEffect:
const anonId = localStorage.getItem('scentral_anon_id')
if (!anonId) return setLoading(false)

const supabase = createClient(url, anonKey)
const { data } = await supabase
  .from('collections')
  .select('fragrance_id, fragrances(family, lean)')
  .eq('anon_id', anonId)
```

### Styling
- Full-width dark card: `background: var(--surface)`, `border-radius: var(--r-card)`, `padding: 24px`
- Max-width 480px, centred on page
- Responsive: SVG viewBox="0 0 400 400", scales via width: 100%
- Page padding: 16px, `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 96px)`

### After build:
- Check if html2canvas is already in package.json. If not, add it: `npm install html2canvas`
- `npm run build` must pass
- Commit: `feat: /wheel fragrance wheel — 9-axis polar SVG, gap analysis, share PNG`
- Deploy: `npx vercel --prod`
- Verify: go to `/wheel` — wheel renders (even if empty), gap panel shows
```

---

## SPRINT 6 — Affiliate "Where to Buy" + AdSense Plumbing
### Priority: P1 — Revenue infrastructure
### Run after Sprint 1. Requires one DB migration (add column). Show SQL and wait for approval.

```
Read AGENTS.md first.

## Task: Wire affiliate links and AdSense ad slots

### Part A — Affiliate "Where to Buy" on fragrance detail page

**DB change required — SHOW THIS SQL AND WAIT FOR EXPLICIT APPROVAL before applying:**
```sql
ALTER TABLE fragrances 
ADD COLUMN IF NOT EXISTS buy_url text,
ADD COLUMN IF NOT EXISTS buy_label text DEFAULT 'Buy Now';
```
This adds a `buy_url` column (affiliate link) and `buy_label` (e.g. "Buy on Jomashop") to each fragrance.

**After approval, update the fragrance detail page:**

File: `app/(main)/collection/[id]/FragranceDetailClient.tsx`

Add a "Where to Buy" section. Render it only when `fragrance.buy_url` is not null:
```tsx
{fragrance.buy_url && (
  <a
    href={fragrance.buy_url}
    target="_blank"
    rel="noopener noreferrer sponsored"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 52,
      borderRadius: 'var(--r-btn)',
      background: 'var(--accent)',
      color: '#000',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      textDecoration: 'none',
      margin: '16px 0',
    }}
  >
    {fragrance.buy_label ?? 'Buy Now'} ↗
  </a>
)}
```

Also add it to the Clone Finder cards (built in Sprint 4) — if `buy_url` is not null, show "Buy →" link on the clone card.

**Track clicks:**
```ts
track('affiliate_click', { fragrance_id: fragrance.id, brand: fragrance.brand })
```

### Part B — Google AdSense ad slots

**DO NOT add AdSense if there is no `NEXT_PUBLIC_ADSENSE_CLIENT_ID` env var** — check first and skip Part B if missing.

If the env var exists:
1. Create `components/ads/AdSlot.tsx`:
```tsx
'use client'
import { useEffect } from 'react'

type Props = { slot: string; format?: 'auto' | 'rectangle' }

export default function AdSlot({ slot, format = 'auto' }: Props) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  if (!clientId) return null

  useEffect(() => {
    try { (window as any).adsbygoogle.push({}) } catch {}
  }, [])

  return (
    <div style={{ width: '100%', minHeight: 100, margin: '16px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

2. Add the AdSense script to `app/layout.tsx` `<head>` section (only if env var present):
```tsx
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
    crossOrigin="anonymous"
  />
)}
```

3. Add `<AdSlot slot="PLACEHOLDER_SLOT_ID" />` placeholder in TWO places:
   - `app/(main)/discover/DiscoverGrid.tsx` — after every 10th fragrance card in the grid render loop
   - `app/(main)/clones/ClonesClient.tsx` — below the search bar, above results

**Note:** Real AdSense slot IDs come from Google AdSense dashboard. Use "PLACEHOLDER_SLOT_ID" for now — the infrastructure is ready, IDs can be swapped in later.

### After changes:
- `npm run build` must pass
- Commit: `feat: affiliate buy_url on detail+clones, AdSense slot infrastructure`
- Deploy: `npx vercel --prod`
```

---

## RUN ORDER SUMMARY

```
SEQUENTIAL (must be in order):
  Sprint 1 (dark theme) → Sprint 2 (image/scroll fixes)

PARALLEL (after Sprint 1 completes):
  Sprint 3 (BottomNav)     ← fast, 10 min
  Sprint 4 (/clones)       ← medium, 30 min
  Sprint 5 (/wheel)        ← longest, 45 min
  Sprint 6 (affiliate+ads) ← needs DB approval pause

TOTAL ESTIMATED BUILD TIME: ~2–3 hours of Claude Code runtime
```

---

## POST-SPRINT SMOKE TEST

Run after all sprints complete:

```bash
cd ~/Projects/scentral-hub
npm run test:smoke:prod
```

Expected: 15/15 routes passing. New routes to add to smoke test after sprints:
- `/clones` → 200
- `/wheel` → 200
