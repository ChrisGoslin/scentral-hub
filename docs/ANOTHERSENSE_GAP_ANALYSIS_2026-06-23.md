# nota. — Full Gap Analysis & Feature Brief
**Prepared:** 2026-06-23 (overnight audit)
**Purpose:** Complete picture of what was agreed, what is actually built, what is visually broken, and what the reference sites suggest we should build next. Ready for morning planning session.

---

## PART 1 — WHAT IS ACTUALLY BUILT (Verified from Repo)

### ✅ Routes that exist and have real content
| Route | Status | Notes |
|---|---|---|
| `/` (landing) | ✅ Built | HeroSection + PersonaTeasers + Christopher Moment card. nota. branded. |
| `/discover` | ✅ Built | Full filter system (carousels), search, Smells Like mode, persona theming, wishlist |
| `/collection` | ✅ Built | WardrobeShelf, 4-tier affinity layout, dnd-kit drag-drop, WardrobeSidebar |
| `/collection/[id]` | ✅ Built | Detail view, AffinityRater, InspiredByClones, SimilarFragrances, LogWearButton |
| `/layering` | ✅ Built | ChemistryCalculator, LayerCart, LayeringClient |
| `/social` | ✅ Built | Curated TikTok/YouTube fragrance content |
| `/you` | ✅ Built | ProfileCard, InsightsPanel, WardrobeIntelligence |
| `/dna-match` | ✅ Built | ProGate (gated) — real DNAMatchClient inside |
| `/intelligence` | ✅ Built | ProGate (gated) — real IntelligenceClient inside |
| `/schedule` | ✅ Built | Fixed this session — ProGate conditional, ScheduleClient with spritz time slots |
| `/spritz` | ✅ Built | SpritzClient — swipe cards, XP tracking, streak, Aura schedule generation |
| `/onboarding` | ✅ Built | 3-step ceremony arc |
| `/learning` | ✅ Built | Guides page |
| `/profile` | ✅ Built | User settings |
| `/privacy` + `/terms` + `/disclaimer` | ✅ Built | Legal pages |
| `/waitlist` | ✅ Built | Lead gen |
| `/ritual/[id]` | ✅ Built | Public shareable ritual page |
| `/scanner` | ✅ Built | Barcode scanner page |
| `/pro` | ✅ Built | Pro upsell page |
| `/social` (community) | ✅ Built | Wear & Share + creator routes exist under `(community)` group |

### ❌ Routes specified in AGENTS.md that DO NOT EXIST
| Route | Specified In | Status |
|---|---|---|
| `/wheel` | AGENTS.md §1 | ❌ **MISSING** — no directory, no page.tsx |

### ⚠️ Routes that exist but are unclear
| Route | Status | Notes |
|---|---|---|
| `(community)/wear-and-share` | Exists | Unclear if linked from nav |
| `(community)/creators/[username]` | Exists | No entry point from nav |
| `(account)/creator` | Exists | Creator dashboard — unclear if wired |

---

## PART 2 — THE BIGGEST PROBLEM: DARK THEME NEVER ACTIVATED

This is the most important issue. Everything else is secondary.

### What was agreed
Epic 1 (`docs/nota/`, epic-1-collectors-wall.md) specified:
- **Default background:** `#0F172A` (Deep Slate)
- **Accent:** `#06B6D4` (Electric Cyan)
- **All surfaces:** glassmorphism with `rgba(255,255,255,0.03–0.12)`
- **All text:** `#E2E8F0` / `#94A3B8`
- **Zero warm tones** in the default theme

### What is actually in globals.css (verified)
```css
:root {
  --color-primary: #A0622A;   ← warm brown
  --color-bg: #F7F3EE;        ← warm cream — THE OLD THEME
  --color-surface: #FAF7F2;   ← warm off-white
  --color-text: #1E1714;      ← warm near-black
}

[data-theme="dark"] {
  --color-bg: #0F172A;        ← correct dark theme
  /* ... correct dark tokens ... */
}
```

**The dark theme tokens are DEFINED but NEVER ACTIVATED.** No code anywhere sets `data-theme="dark"` on the `html` or `body` element by default. The `:root` block (which is always active) still has the old warm cream palette.

### What the user sees
The app looks **identical** to before the nota. overhaul. Every colour on every page — background, cards, buttons, text — renders in warm cream tones because `:root` is warm cream.

### The fix (straightforward, one change)
**Option A — Make dark the default (recommended for MVP):**
In `app/globals.css`, replace the `:root` colour tokens with the dark theme values. Move the warm cream palette to `[data-theme="light"]` so it can be toggled later.

**Option B — Apply via layout.tsx:**
In `app/layout.tsx`, add `data-theme="dark"` to the `<html>` tag: `<html lang="en" data-theme="dark">`. This is the minimal change — no CSS restructuring needed.

**Recommendation: Option B first** (one-line change, immediately deployable), then Option A properly in a follow-up.

---

## PART 3 — EPIC STATUS: AGREED VS BUILT VS VISUAL STATUS

### Epic 1: Dark Ambient Material Tokens + 12-Col Grid
- **Agreed:** Dark slate theme, glassmorphism, 12-col responsive collector's wall
- **Built:** CSS tokens EXIST in `[data-theme="dark"]`. DiscoverGrid uses `repeat(auto-fit, minmax(...))`. Collection uses 3-col apothecary grid.
- **Visual Status:** ❌ BROKEN — warm cream shows because `data-theme="dark"` never applied
- **Fix needed:** Apply dark theme as default (see Part 2)

### Epic 2: Edge-to-Edge Carousel Filters
- **Agreed:** Horizontal snap carousels for Vibe, Longevity, Occasion, House
- **Built:** `DiscoverFilters.tsx` has `FilterCarousel` component with `overflow-x: auto snap-x snap-mandatory hide-scrollbar`
- **Visual Status:** ⚠️ PARTIALLY CORRECT — carousel logic exists. Whether it renders correctly on the warm cream background is untested visually. Once dark theme is applied, this should look much better.
- **Fix needed:** Dark theme fix first; then visual QA on mobile

### Epic 3: "Smells Like" Proximity Search
- **Agreed:** 70%+ note matching proximity search engine
- **Built:** `DiscoverClient.tsx` has full `smellsLikeMode` with `/api/search?mode=smells_like`, `SmellsLikeResults` component
- **Visual Status:** ✅ Functionally built. Toggle visible in Discover.
- **Fix needed:** Visual QA only

### Epic 4: Aura AI Spritz Schedule
- **Agreed:** Swipeable Spritz cards, XP tracking, streaks, Aura copy
- **Built:** `/spritz` has full `SpritzClient` with AnimatePresence, swipe right/left, XP toast, streak counter, `/api/spritz/generate` + `/api/spritz/log-wear`
- **Visual Status:** ⚠️ Functionally built. Visual review needed post-dark-theme.
- **Fix needed:** Dark theme first; then confirm XP/streak display on `/you`

### Epic 5: Landing Page Redesign
- **Agreed:** Scent Identity above fold, persona teasers, Christopher Moment card
- **Built:** `HeroSection`, `PersonaTeasers`, Christopher Moment card in `page.tsx`
- **Visual Status:** ⚠️ Structure correct. But renders on warm cream, not dark slate.
- **Fix needed:** Dark theme fix will transform this instantly

### /wheel Route
- **Agreed:** AGENTS.md §1 specifies `/wheel` — Fragrance Wheel (9-axis polar SVG, gap analysis, share as PNG)
- **Built:** ❌ **DOES NOT EXIST** — no `/wheel` directory found
- **Fix needed:** Build from scratch. High priority — in nav spec.

---

## PART 4 — ADDITIONAL VERIFIED GAPS

### Navigation
- BottomNav has 5 items: Wardrobe, Lab, Discover, Ritual, You
- **Missing from nav:** Spritz (`/spritz`), Wheel (`/wheel`), Social (`/social`)
- Ritual (`/schedule`) is Pro-gated but appears in nav — confusing for free users
- **Recommendation:** Swap Ritual → Spritz in bottom nav (Spritz is free tier)

### Data & Content
- **282 fragrances** — good start but thin vs competitors (Fragrantica: 100k+, Parfumo: 226k+)
- Many fragrances likely have missing `image_url` — blank cards visible in UAT (user confirmed)
- No ingredient/note detail pages (every competitor has this)
- No perfumer attribution data
- No user reviews or ratings system (only affinity score)

### Discover Page
- Scrolling was reported as broken — needs investigation (infinite scroll or CSS overflow issue)
- Images described as blank until hover — image loading/placeholder issue

### Collection Page
- Navigation to wardrobe reported as "nothing happens" — likely a routing or loading issue
- Navigating back from collection caused 404 — needs investigation

---

## PART 5 — REFERENCE SITE ANALYSIS & FEATURE IDEAS

### clonespreadsheet.com — Clone/Dupe Engine
**What they do well:**
- Pure clone/dupe lookup: search a designer scent, get affordable clones with % similarity, price comparison, affiliate buy links
- Very simple UI — search box, cards with: original brand + image, clone brand + image, price savings, similarity %, direct buy link
- 500k+ users — proof this is the #1 thing the market wants
- Affiliate monetisation through CJ/Jomashop

**Gap in nota.:**
- We have `inspired_by` data in the DB — this maps each fragrance to what it clones
- We have a "Christopher Moment" card on the landing ("Your £140 bottle has an £18 clone")
- But there's **no dedicated clone lookup UI** — just a text link to `/discover?query=clones`
- **Feature idea:** `/clones` page — searchable clone finder. Input: designer name → Output: our catalogue entries with `inspired_by` matching, showing price comparison, similarity description, buy link (affiliate)

### fragrantica.com — Reference Encyclopaedia
**What they do well:**
- 100k+ fragrances with full note pyramids (top/heart/base), accords, ratings, reviews
- Community "similar fragrances" recommendations
- Seasonal, occasion, gender, longevity, sillage ratings from real users
- Perfumer attribution, brand history
- News, interviews, educational content

**Gap in nota.:**
- We have 282 fragrances — dramatically fewer
- We don't surface note pyramids (top/heart/base) — only `family` and `lean`
- No community reviews — only internal affinity ratings
- No editorial/blog content
- **Feature idea:** Enrich fragrance detail page with note pyramid display. Add a "Community says" section showing longevity/projection crowd data.

### parfumo.com — Community Platform
**What they do well:**
- 226k+ fragrances, live activity feed of statements/reviews
- "Dupes" section — dedicated dupe finder
- Community: statements (micro-reviews), photos, videos, blogs, forum
- Dark mode by default — clean, not warm
- Mobile app (iOS + Android)

**What to steal:**
- Live activity/social feed on landing page or social tab
- "Statement" format — short 1-3 sentence review with scent/longevity/sillage scores
- Photo sharing of collection shelves
- Community forum threads ("Help me find a blue fragrance")

### experimentalperfumeclub.com — Modular Bespoke Brand
**What they do well:**
- "Blendable" concept: Essentials (wear alone) + Blends (pre-blended combos) + Creation Sets (blend at home)
- "Fragrance Finder" quiz → personalised recommendations
- In-store bespoke blending experiences
- Educational academy (free mini class, paid courses, perfumer's handbook)
- B Corp certified, PETA approved — sustainability angle resonates with target market
- Discovery sets (sample before committing)
- Strong "crafted by you, bottled by us" narrative

**What to steal:**
- Discovery set concept → nota. could partner with a retailer to offer sample kits linked to our recommended fragrances
- Layering as a product concept (our Lab already does this conceptually)
- Education content model — fragrance course or guide within the app
- "Fragrance Finder" quiz — we have personas but could make them more EPC-style (answer 5 questions → here are your 3 best fragrances)

### perfumesociety.org — Editorial Authority
**What they do well:**
- Discovery boxes (seasonal subscription, brand boxes, sample sets) — strong recurring revenue model
- "Find a Fragrance" — guided discovery tool with occasion/mood/note filters
- Editorial: blog, perfume houses, noses/perfumers, history, ingredients
- "Seasonal Scents" subscription box (£21 per quarter)
- Strong SEO through educational content
- Community through Instagram/TikTok

**What to steal:**
- Seasonal subscription box concept — nota. could be the digital companion to a physical sample subscription (affiliate play)
- Perfume house profiles — brand/house pages add SEO and depth
- Ingredient deep-dives (educational content = SEO + retention)
- Seasonality angle — "What to wear this summer" editorial content within the app

### wikiparfum.com — AI Recommendation Engine
**What they do well:**
- Olfactory profile quiz → personalised fragrance recommendations
- 32k+ fragrances indexed with ingredients (1,562 ingredients catalogued)
- Clean modern UI with dark design language
- Partner integrations with major fragrance houses for B2B ScentXP tool
- Award-winning: Best Use of Data (IAB 2023), Best Digital Innovation (2021–2024)
- Claims: +25% average order value, +40% sales for retail partners

**What to steal:**
- Olfactory profile as the primary onboarding experience (we have personas, could go deeper)
- Ingredient catalogue — searchable ingredient pages (bergamot, oud, amber etc.) as SEO engine
- "Recommended because you liked X" logic for discovery
- B2B integration angle — long-term: license nota.'s recommendation engine to retailers

---

## PART 6 — MONETISATION PLAN (As Requested)

### AdWords / Display Advertising
**Realistic placement options:**
1. **Discover page** — banner between fragrance card rows (every 10 cards)
2. **Fragrance detail page** — below fold, "Where to Buy" section
3. **You page** — between insight cards
4. **Social page** — between community posts

**Implementation:** Google AdSense script in `app/layout.tsx` + ad unit components. Target fragrance/luxury/beauty CPM rates (typically £3–8 CPM). At 10k MAU → ~£300–800/month passive.

**Important:** Ad placements must not block core UX. Respect WCAG contrast. No ads in PWA standalone mode (Apple guidelines).

### Affiliate Links
**Best opportunity:** Clone/Dupe finder with buy links
- Jomashop affiliate (CJ network) — clonespreadsheet.com already uses this
- Amazon fragrance affiliate (3–8% commission)
- AWIN network (Notino, FragranceNet, Boots, etc.)
- **Implementation:** Add `buy_link` + `affiliate_url` columns to `fragrances` table. Surface on detail pages as "Where to Buy" with affiliate tracking.

**Target fragrance:** Entry is easiest via Middle Eastern houses (Lattafa, Afnan, Armaf) — our core catalogue and strong match for clonespreadsheet's most popular searches.

### Shopify Storefront
**What makes sense:**
- Physical discovery kits: 5-sample set matched to user's persona (£15–25)
- "nota. x [Brand]" curated collection boxes
- Branded accessories: fragrance journal, sample vials, decant kit
- **Realistic path:** Shopify store connected to the PWA via "Shop" section. Shopify handles fulfilment; we drive traffic from the PWA via persona-matched product recommendations.
- **Simpler short-term:** Affiliate to existing retailers (Parfumo partner model) before building own inventory.

### Pro Subscription (Already Planned)
- Free tier: Discover, Wardrobe, Layering, Spritz, You, Wheel
- Pro tier (£4.99/mo): Intelligence, DNA Match, advanced scheduling, export, early access features
- Beta mode already live (`NEXT_PUBLIC_BETA_MODE=true`)

---

## PART 7 — REQUIREMENTS CONFLICTS & CLARIFICATIONS

### Conflict 1: /schedule vs /spritz — which is the "daily ritual"?
- nota. Playbook Epic 4 calls for "Aura Spritz Schedule" — this became `/spritz`
- `/schedule` is the legacy "plan morning/midday/evening" feature (Pro-gated)
- **Clarification needed:** Is `/schedule` being deprecated in favour of `/spritz`? Or are they different enough to co-exist? Current BottomNav links to `/schedule` (Ritual) but `/spritz` is the newer, better-designed experience.
- **Recommendation:** Make `/spritz` the primary nav item. Rename "Ritual" tab → "Spritz". Keep `/schedule` accessible but unlisted. Deprecate over time.

### Conflict 2: nota. Epics "✅ Complete" vs actual state
- The active nota. docs mark all 5 Epics as ✅
- Epic 1 dark theme is NOT applied as default
- **Clarification:** The tokens and components were built, but the theme switch from light → dark as default was never committed. Epics are ~80% complete — components built but not visually unified under dark theme.

### Conflict 3: Display name confusion
- AGENTS.md §1 says: Display name = "nota.". Internal names unchanged.
- The landing page, layout.tsx, and metadata all say "nota." ✅
- CLAUDE.md still refers to "nota."/"nota." in places — not a code problem, just doc debt.

### Conflict 4: /wheel specified but not built
- AGENTS.md §1 lists `/wheel` as a route and §10 (LLM briefing block) describes it
- No code exists for it
- This is scope specified but never built — needs a dedicated sprint

### Conflict 5: Community routes vs navigation
- `(community)/wear-and-share` and `(community)/creators/[username]` exist in code
- They are not linked from BottomNav or the landing page
- The Social tab (`/social`) shows curated video content, not community posts
- **Clarification needed:** Is "Social" the same as "Wear & Share"? Should `/social` route to the community content or the video feed? Currently they're separate.

---

## PART 8 — PRIORITY ORDER FOR TOMORROW

### P0 — Fix today (blocking everything else visually)
1. **Apply dark theme as default** — 1-line change in `app/layout.tsx`: add `data-theme="dark"` to `<html>`. Transforms every page instantly.
2. **Fix Discover page scrolling** — investigate CSS overflow, infinite scroll logic
3. **Fix blank fragrance cards** — image loading/placeholder issue in DiscoverGrid

### P1 — High impact, build next
4. **Build `/wheel` route** — specified in AGENTS.md, visible gap
5. **Swap BottomNav: Ritual → Spritz** — surface the better UX
6. **Clone finder page `/clones`** — biggest market opportunity (500k users on clonespreadsheet.com). We have the `inspired_by` data — just need the UI.
7. **Affiliate "Where to Buy" on fragrance detail** — immediate revenue potential

### P2 — Data enrichment
8. **Fragrance image backfill** — fix blank cards. Run `scripts/backfill-parfumo-images.mjs` locally if not done.
9. **Note pyramid data** — add top/heart/base note columns to `fragrances` table and surface on detail page
10. **Ingredient pages** — `/ingredients/[slug]` pages (SEO engine + depth)

### P3 — Content & Community
11. **Editorial/blog section** — even 5 articles dramatically increases SEO + trust
12. **User reviews / statements** — short micro-reviews on fragrance detail page
13. **Perfume house pages** — `/brands/[slug]`

### P4 — Monetisation plumbing
14. **Google AdSense integration** — banner placements in Discover and detail pages
15. **Affiliate link infrastructure** — `buy_link` column + "Where to Buy" UI component
16. **Shopify storefront** — connect via Shopify MCP (already available in this workspace)

---

## PART 9 — WHAT A GREAT MORNING SESSION LOOKS LIKE

1. Read this document together
2. Align on P0 fixes (dark theme + image loading) — quick wins
3. Pick 2 P1 features for Claude Code sprint
4. Discuss monetisation path (affiliate vs AdWords vs Shopify first)
5. Decide on `/schedule` vs `/spritz` conflict

**Suggested first Claude Code prompt** (after reading this):
```
Apply the nota. dark theme as default. In app/layout.tsx, add data-theme="dark"
to the html element. Then audit every page for hardcoded light-mode colours and replace
with CSS variables. Verify: next build passes, scentral-hub.vercel.app shows dark slate
background on all routes.
```

---

*Audit completed: 2026-06-23. All claims verified against repo at `/sessions/adoring-keen-pasteur/mnt/scentral-hub/`. Reference sites scraped: clonespreadsheet.com, fragrantica.com, parfumo.com, experimentalperfumeclub.com, perfumesociety.org, wikiparfum.com.*
