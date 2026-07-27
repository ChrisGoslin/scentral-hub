# nota. — Technical Architecture Document

**Last updated:** 2026-06-15
**Status:** Accurate. Verified against package.json and git log. No fabricated features.

---

## 1. Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router | 16.2.6 | Group routing under `(main)`, RSC for data fetching |
| Language | TypeScript | Latest | Strict mode |
| UI | React | 19.2.4 | Client Components for interactive state |
| Styling | Vanilla CSS + design tokens | — | `lib/design/tokens.css`. CSS variables only — no Tailwind, no hardcoded colours |
| Drag & drop | @dnd-kit/core + sortable + utilities | 6.3 / 10.0 / 3.2 | Living Wardrobe shelf reordering |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.107 | Managed Postgres, RLS, no pgvector in use |
| Auth | Supabase Auth | — | Session via cookies, SSR client |
| Deployment | Vercel | — | Auto-deploy on push to main |

**No runtime AI in the free tier.** API routes exist for AI features (aura, chemist, sommelier, formulate) but are not part of core MVP user flows.

---

## 2. Repository structure

```
scentral-hub/
├── app/
│   ├── page.tsx                  # Landing page + waitlist form
│   ├── onboarding/               # 3-step vibe selector (no auth required)
│   ├── (main)/                   # App shell with BottomNav layout
│   │   ├── discover/             # Browse catalogue (free)
│   │   ├── collection/           # My Bottles + Living Wardrobe shelf (free)
│   │   │   └── [id]/             # Fragrance detail page
│   │   ├── layering/             # Layer Builder (free)
│   │   ├── you/                  # User profile + stats (free)
│   │   ├── intelligence/         # Pro-gated
│   │   ├── dna-match/            # Pro-gated
│   │   └── schedule/             # Pro-gated
│   └── api/
│       ├── fragrances/           # GET search endpoint
│       ├── wear/                 # POST log a wear — returns streak + total wears
│       ├── affinity/             # POST set affinity_score on collections row
│       ├── layering/             # POST save combination
│       ├── waitlist/             # POST email + archetype capture
│       ├── aura/                 # AI (non-critical, not wired to free UI)
│       ├── chemist/              # AI (non-critical)
│       ├── sommelier/            # AI (non-critical)
│       ├── formulate/            # AI (non-critical)
│       ├── dna-match/            # AI (non-critical)
│       └── schedule/             # AI (non-critical)
├── components/ui/                # Button, Chip, Card, EmptyState, ProGate, Sheet, etc.
├── lib/
│   ├── design/tokens.css         # All CSS variables — single source of truth for colour/spacing
│   └── brandEmoji.ts             # Emoji fallbacks per brand name
├── utils/supabase/
│   ├── server.ts                 # createClient for Server Components (must be awaited)
│   └── client.ts                 # createClient for Client Components
├── public/                       # manifest.json, sw.js, icon-192.png, icon-512.png
├── scripts/                      # Backfill scripts + smoke-test.mjs + sanity-check.mjs
├── skills/                       # Agent runbooks (branch-hygiene, grounded-agent-guardrails, etc.)
└── AGENTS.md                     # Canonical instructions for all CLI agents — read first every session
```

---

## 3. Data model

### `fragrances` (282 rows — read-only catalogue)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| brand | text | e.g. "Lattafa" |
| name | text | e.g. "Asad" |
| full_name | text | "{brand} {name}" |
| family | text | e.g. "Woody Oriental" |
| projection | text | Beast Mode / Strong / Moderate / Soft / Light |
| optimal_season | text | nullable |
| use_case | text | nullable |
| lean | text | nullable |
| plain_description | text | Gavan-language description (~90% filled) |
| inspired_by | text | Designer reference e.g. "Creed Aventus" (~76% filled) |
| rating | integer | 0–20 scale (halve for display as /10) |
| is_user_created | boolean | false = catalogue entry |
| image_url | text | nullable — emoji fallback in use for most |
| created_at | timestamptz | |

### `collections` (user inventory)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| fragrance_id | uuid | FK → fragrances |
| status | text | "owned" / "wishlist" |
| affinity_score | integer | 0=Holding, 1–7=Base, 8–15=Occasion, 16–20=Signature |
| maceration_started_at | timestamptz | nullable |
| maceration_ready_at | timestamptz | nullable |
| created_at | timestamptz | |

### `wear_logs`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| collection_id | uuid | FK → collections |
| worn_at | timestamptz | defaults to now() |

### `layering_combinations`
Stores saved layer pairings. Written by `/api/layering`.

### `waitlist`

| Column | Type | Notes |
|---|---|---|
| email | text | |
| archetype | text | collector / experimenter / minimalist / architect |

---

## 4. Key patterns

### Server vs Client components

- **Server Components** (`page.tsx` files): fetch data via `await createClient(cookieStore)`, pass as props to Client Components
- **Client Components** (`*Client.tsx`, `*Button.tsx`, `*Rater.tsx`): handle interaction, localStorage, optimistic UI
- Never call `createClient` from `@/utils/supabase/server` inside a Client Component

### Auth / no-auth MVP

Auth is Supabase session-based via cookies. The app is designed **no-auth for MVP** — all pages render without a session. User-specific features (collections, wear logs) silently return empty if no session exists. No login wall anywhere in the free tier.

### Free / Pro split

Single flag in `components/ui/ProGate.tsx`:
```ts
const isPro = false  // flip to true when billing ships
```
Pro pages (`/intelligence`, `/dna-match`, `/schedule`) wrap content in `<ProGate>`. **Do not touch this flag or these pages** until billing is implemented.

### CSS design tokens

Always use these variables — never hardcode colours:

| Variable | Purpose |
|---|---|
| `var(--bg)` | Page background |
| `var(--surface)` | Card / panel background |
| `var(--surface-2)` | Elevated surface |
| `var(--text)` | Primary text |
| `var(--text-muted)` | Secondary / label text |
| `var(--accent)` | Gold (#c49a3c) — highlights, active states |
| `var(--line)` | Border colour |
| `var(--r-card)` | Card border radius |
| `var(--r-btn)` | Button border radius |

### localStorage keys

| Key | Purpose |
|---|---|
| `scentral_onboarded` | Gate for onboarding flow |
| `scentral_vibe` | warm / fresh / bold / soft — pre-filters Discover |
| `scentral_discover_sort` | Persisted sort selection on Discover |
| `scentral_wishlist` | JSON array of fragrance IDs |

### Living Wardrobe (Collection shelf view)

- Built with `@dnd-kit/core` + `@dnd-kit/sortable`
- 4 tiers ordered by `affinity_score`:
  - Top Signatures (16–20)
  - Occasion Modifiers (8–15)
  - Base Anchors (1–7)
  - Holding Zone (0 / null)
- Every drag-drop emits a `cabinetSnapshot` JSON event — **do not remove this hook** (feeds future computer-vision shelf detection pipeline)
- Sidebar view modes: All / By House (brand) / By Season (optimal_season) / Wishlist (scentral_wishlist)
- Users rate their bottles via `AffinityRater` widget on the detail page → POSTs to `/api/affinity`

---

## 5. Deployment

- **Repo:** `ChrisGoslin/scentral-hub` on GitHub
- **Vercel project:** `scentral` (`prj_M9i6d6V9JfV626sNWH2ROGMH3eTw`)
- **Live URL:** `scentral-hub.vercel.app`
- **Deploy trigger:** push to `main` → Vercel auto-deploys
- **Secrets:** `.env.local` only — gitignored. Never in source, docs, or logs.
- **Smoke test:** `node scripts/smoke-test.mjs` (or `BASE_URL=https://... node scripts/smoke-test.mjs`)
- **Branch rule:** additive features commit directly to main; create a branch only for risky migrations or refactors

---

## 6. Known gaps / honest debt

| Item | Impact | Notes |
|---|---|---|
| No real fragrance images | Medium | Emoji fallbacks functional but not polished. Needs image generation or licensed assets. |
| Affinity scoring is manual | Medium | Users must rate their own bottles. Shelf tiers are empty until they do. No algorithm yet. |
| No RLS on wear_logs | Low | Any authenticated user can read any wear log. Acceptable for no-auth MVP. |
| AI routes not wired to free UI | Low | `/api/aura`, `/api/chemist`, `/api/sommelier` exist but no free-tier page calls them. |
| Waitlist position is fake | Low | Returns 847 + hash offset. Replace with real DB COUNT before launch. |
| ~10% of fragrances without plain_description | Low | Run `node scripts/phase1-plain-descriptions.mjs` to backfill. |

---

## 7. Agent rules (summary — full detail in AGENTS.md)

1. Read `AGENTS.md` at the start of every session — state what you grounded on in your first reply
2. Verify paths, columns, and versions before asserting — never invent facts
3. No secrets in code or docs — keys in `.env.local` only
4. Commit additive features directly to main; branch only for risky migrations
5. Batch prompts by dependency: foundation → consumers → polish
6. One prompt per agent — no scope additions mid-task
7. CSS variables only — zero hardcoded colours
