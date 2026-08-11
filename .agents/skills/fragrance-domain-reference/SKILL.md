---
name: fragrance-domain-reference
description: >
  Fragrance-domain knowledge pack for nota. (repo scentral-hub) — the vocabulary, enums,
  and scoring rules a zero-context engineer needs to touch fragrance data, search/filter
  code, catalogue copy, or personas correctly. Load this BEFORE: writing or debugging any
  filter/search query against the `fragrances` table; writing copy that mentions scent,
  projection, longevity, or concentration; adding/editing a persona in lib/personas.ts;
  working on affinity tiers, XP levels, or clone/DNA-match scoring; or reviewing PRs that
  touch lib/filterConstants.ts, lib/personas.ts, lib/affinity.ts, or any /api/discover,
  /api/search, /api/clone-confidence, /api/dna-match, /api/smells-like route.
  Do NOT use this for: deploy/build mechanics (see branch-hygiene), RLS/auth/security
  posture (see security-hardening), Shopify catalogue matching for image enrichment (see
  shopify-image-enrichment), or general repo hygiene (see repo-tidy). This skill is pure
  domain knowledge — it does not cover how to ship a change, only what the fragrance
  concepts mean and where they live in code.
---

# Fragrance domain reference (nota.)

Plain-language why: nota. is not a review site — it is a *personal scent identity system*
("If it's not personalised, it shouldn't exist" — repo `CLAUDE.md` §1). Every domain concept
below exists to serve that loop: understand the user → reflect them → evolve them → connect
them to others. If a change makes the catalogue feel like a generic shop, it is off-doctrine.

Brand: the product is **nota.** (lowercase, with the dot). The repo folder `scentral-hub` and
DB project `scentral-mvp` are historical internal names — never call the *product* nota. in
copy or user-facing text.

As of 2026-07-05, the `fragrances` table has **127,595 rows** (bulk import 2026-07-03). Older
docs (`docs/PRODUCT_TRUTH.md`) still say 282 — that number is stale, do not cite it.

## 1. Families (the `family` column)

`family` is a **free-text compound string**, not a clean enum — e.g. `"Woody Oud"`,
`"Fresh Aromatic"`, `"Oriental Vanilla"`. Never assume it's one of a fixed short list.

Two different files consume it two different ways — know which one you're editing:

| File | Purpose | Matching rule |
|---|---|---|
| `lib/filterConstants.ts` → `VIBE_TAGS` | Discover-page filter chips shown to users | Case-insensitive **substring** match via `matchesAnyTag()` against 9 tags: Woody, Floral, Oudy(`Oud`), Fresh(`Fresh`,`Aquatic`), Amber, Aromatic, Citrus, Green, Fruity |
| `app/(main)/notes/page.tsx` → `AXIS_MAP` | Scent Encyclopedia radar chart | Exact-string lookup mapping ~35 known compound family strings (e.g. `'Woody Oud' → 'Oud'`, `'Fresh Aromatic' → 'Fresh'`) to one of 10 axes |

`AXIS_MAP` is a lookup table, not a substring matcher — an unmapped family string silently
falls through (verify with `grep -n "AXIS_MAP" -A 40 app/(main)/notes/page.tsx`). If you add a
new family string to the catalogue, check whether it needs an `AXIS_MAP` entry too.

`OCCASION_TAGS` (same file) does the same substring trick against the free-text `use_case`
column (Office, Date Night, Evening, Casual, Formal, Gym, Summer & Beach, Night Out, Special
Occasion, Winter) — `use_case` is comma-separated free text, not an enum either.

## 2. Projection enum — THE 0-RESULTS TRAP

The `projection` column on `fragrances` accepts **exactly five values**. Nothing else. Any
other string — including plausible-sounding ones like "Heavy", "Sillage: High", "Very Strong"
— will silently return **zero rows** from any filter/search query. This is the single most
common way a "no results" bug gets introduced.

| Value | Longevity | Feel |
|---|---|---|
| `Beast Mode` | 8h+ | Room-filling |
| `Strong` | 6–8h | Arm's length |
| `Moderate` | 4–6h | Personal bubble |
| `Medium` | 2–4h | Close to skin |
| `Weak` | <2h | Skin scent |

Verified in two independent places that must stay in sync:
- `lib/filterConstants.ts` → `LONGEVITY_PROJECTIONS` groups them into 3 user-facing longevity
  buckets: "Lasts all day" → `[Beast Mode, Strong]`, "A few hours" → `[Moderate, Medium]`,
  "Quick burst" → `[Weak]`.
- `app/api/smells-like/route.ts` system prompt instructs Haiku to only ever emit one of these
  five exact strings (or `null`) when parsing a free-text "smells like X" query.

Rule: if you're building a filter, a prompt, or a fixture that touches `projection`, copy the
five values verbatim from `LONGEVITY_PROJECTIONS`'s values or `smells-like/route.ts` — never
type them from memory.

## 3. Longevity — plain-language mapping

Longevity is not a separate DB column — it's a derived, user-facing framing of `projection`
(see table above). When writing copy, don't say "Moderate" and expect users to know what that
means; the product convention is descriptive phrasing ("Lasts a few hours", "personal bubble").

## 4. Concentrations (EDP / EDT / EDC)

`fragrances.concentration` is free text (see `supabase/migrations/20260507_initial_schema.sql:18`
— comment: `-- e.g. EDP, EDT, Parfum/Extract, EDC`). Typical oil-concentration ranges (industry
knowledge, not enforced by the DB):

| Abbreviation | Oil concentration | Meaning |
|---|---|---|
| EDP (Eau de Parfum) | 15–20% | Stronger, longer-lasting |
| EDT (Eau de Toilette) | 5–15% | Lighter, everyday |
| EDC (Eau de Cologne) | 3–5% | Lightest, short-lived |

**Display rule:** user-facing copy uses plain language ("Lasts all day"), not the raw
abbreviation — consistent with the projection-longevity mapping above. `/api/scan/route.ts`
(barcode scanner) is one of the few places the raw abbreviation is asked for directly, because
it's parsing a real bottle label, not writing display copy — that's a legitimate exception, not
a precedent for UI copy elsewhere.

## 5. Note pyramid

Not a DB enum — a structural concept split across three real columns on `fragrances`:
`top_notes`, `heart_notes`, `base_notes` (confirmed live via `app/api/search/route.ts:17`
`FRAGRANCE_COLUMNS`). General domain knowledge for how they behave over time:

| Layer | Example notes | Timing |
|---|---|---|
| Top | Bergamot, citrus | 5–15 min |
| Heart | Iris, jasmine, rose | 15 min – 2h |
| Base | Vanilla, amber, musk, oud | 4–8h+ |

FENCE: `app/(main)/notes/page.tsx` also has a legacy `notes` free-text field concept
(`fragrances.notes`, added in `20260507000001_alter_fragrances.sql`) used for the Scent
Encyclopedia's `FEATURED_NOTES` substring search — this is a *different* mechanism from the
three-column top/heart/base split used by search. Don't conflate them.

## 6. Personas (`lib/personas.ts`) — 6, verified slugs

Canonical source: `lib/personas.ts` `PERSONAS` array (repo `CLAUDE.md` §10: "never inline").
Verified slugs (`id` field), exactly as they appear in code:

| id (slug) | Display name | Preferred families (sample) |
|---|---|---|
| `velvet_intellectual` | The Velvet Intellectual | Woody, Amber, Gourmand, Oud, Oriental |
| `solar_minimalist` | The Solar Minimalist | Citrus, Aquatic, Green, Fresh Spicy, Floral |
| `dark_alchemist` | The Dark Alchemist | Leather, Tobacco, Smoky, Resinous, Oud, Oriental |
| `ritual_keeper` | The Ritual Keeper | Aromatic, Herbal, Woody, Incense, Oriental |
| `rebel_experimentalist` | The Rebel Experimentalist | Leather, Spicy, Woody, Herbal, Chypre |
| `comfort_seeker` | The Comfort Seeker | Gourmand, Amber, Warm Woody, Soft Floral, Vanilla |

Each persona also carries `sanctuary` + `projection` free-text tags (e.g. `archive`/`intimate`)
used by `getPersonaByInputs()` to resolve an onboarding quiz answer to a persona — these are
NOT the same `projection` values as the fragrance-longevity enum in §2; they're onboarding
vocabulary (`intimate`, `solar`, `magnetic`, `ceremonial`, `bold`, `soft`, plus legacy aliases
`room`/`everywhere` mapped in `projectionMap`). Don't cross-wire the two "projection" concepts.

`familyToVibeTags()` in `lib/filterConstants.ts` converts a persona's `preferred_families`
into `VIBE_TAGS` keys, to pre-select Discover filter chips when a persona is active.

## 7. Affinity (1–20), banding — `lib/affinity.ts`

Canonical source: `lib/affinity.ts` `AFFINITY_TIER_DEFS` / `getAffinityTier()`. This powers the
Living Wardrobe (`collections.affinity_score`), a **different, older system** from the newer
`shelf_items.rank` model (see fenced note at end of this section).

| Score range | Tier key | Label | Sublabel | Badge |
|---|---|---|---|---|
| 16–20 | `tier0` | Signatures | Active Top 20 | ★ Signature |
| 8–15 | `tier1` | Occasion Modifiers | Transitional | ◆ Occasion |
| 1–7 | `tier2` | Base Anchors | Dense Ouds | ● Base |
| 0 / null | `tier3` | Benching | New / Unrated | (none — locked) |

`POST /api/affinity` validates `affinity_score` as an integer 0–20 (`app/api/affinity/route.ts:15-21`).

FENCE — dual model: `collections.affinity_score` (legacy, still active, described above) is
NOT the same thing as `shelf_items.rank` (the newer ±20 two-phase-reorder rank model with
S/A/B/C generated tiers, gated by the `enforce_shelf_eligibility` trigger). Both are live in
the DB simultaneously (repo `CLAUDE.md` §5 "Two competing shelf models"). If a task mentions
"the Shelf" specifically, check which model the surrounding code actually touches before
writing affinity-tier logic — don't assume.

## 8. XP levels (`app/api/spritz/log-wear/route.ts`)

Six levels, verified thresholds (`LEVEL_THRESHOLDS` constant, comment cites AGENTS.md §1):

| Level | Name | XP threshold |
|---|---|---|
| 1 | The Curious | 0 |
| 2 | Enthusiast | 100 |
| 3 | Collector | 300 |
| 4 | Connoisseur | 600 |
| 5 | Curator | 1000 |
| 6 | The Auteur | 1500 |

Keyed on `user_xp.anon_id` (text), not `user_id` — this table is still on the legacy
localStorage-anon-id identity model (see repo `CLAUDE.md` §3). `SWIPE_RIGHT_XP = 10` per swipe.

## 9. Clone / DNA-match scoring — TWO DIFFERENT SCALES, DO NOT CONFLATE

There are **two separate, differently-scaled** AI scoring features that both talk about how
similar two fragrances are. The dossier that seeded this skill conflated them — verified by
reading both route files directly:

| Route | Scale | Bands | What it compares |
|---|---|---|---|
| `POST /api/clone-confidence` (`app/api/clone-confidence/route.ts`) | **1–10** (`score.toFixed(1)` + `/10` in `CloneCard.tsx`) | No named bands — just a `verdict` string + `buyRecommendation`: `yes`\|`maybe`\|`skip` | A budget "clone" vs. its named inspiration (Smells Like / Inspired By feature) |
| `POST /api/dna-match` (`app/api/dna-match/route.ts`) | **0–100** ("Chemical Harmony" score) | `Twin Resonance` (90–100) · `Strategic Layering` (70–89) · `Volatile Tension` (40–69) · `Dissonance` (<40) | Any two arbitrary fragrances, for layering |

If a task says "clone confidence 0–100, >80 spot-on" — that description matches `dna-match`,
NOT `clone-confidence`. Verify which route a task actually means by reading the route file
before writing scoring logic or copy.

## 10. Product vocabulary

| Term | Meaning | Where it lives |
|---|---|---|
| Noseprint | The user's personalised scent-identity artefact | `noseprints` table, `/noseprint` route |
| The Read | Feeling-chip quiz → one-time Haiku-generated identity reveal | `/read`, `app/api/read/generate` (rate-limited 1/hour via a DB count query, not Upstash). **Not the only rate-limited LLM route** — see `nota-config-and-flags` §5 for the current, corrected rate-limit table across all LLM routes. |
| Traces | Community-posted scent descriptions/reactions | `traces` + `trace_reactions` tables, `/traces` |
| Trails | Guided multi-step scent-discovery journeys | `trails` + `trail_steps` + `trail_progress`, `/trails` |
| Aura | The advisory "character" giving scent guidance | `supabase/functions/aura-advisory/`, `aura_cache` (24h TTL) |
| Temptations | Soft commerce nudges (not hard sells) | `temptations` table, `components/temptations/` |
| Blind Ranking | Bias-removal ranking flow (rank scents before knowing brand/price) | `blind_ranking_sessions` + `blind_ranking_choices`, `/shelf/blind` |
| Smells Like / Inspired By | Clone-matching feature (find a cheaper equivalent) | `/api/smells-like`, `/api/clone-confidence`, `inspired_by` column |

## 11. KNOWN_BRANDS (`lib/filterConstants.ts`)

Top houses by catalogue count, used to decide the House carousel vs. bucketing into "Niche".
**Verify exact strings before using them in a query or copy** — some differ from their common
short names:

```
Lattafa, Armaf, Afnan, Creed, Khadlaj, Rasasi, Tom Ford,
Parfums de Marly, Amouage, Christian Dior, Yves Saint Laurent, Swiss Arabian
```

FENCE: it's `Christian Dior` and `Yves Saint Laurent` in code — NOT the short forms "Dior" or
"YSL". A `brand = 'Dior'` filter will silently miss every Dior row.

## 12. Two customer archetypes and the tone-bridging rule

Per repo `CLAUDE.md` §10 and `lib/personas.ts`: two customer archetypes bound all
user-facing copy —

- **Gavin** — newcomer, needs plain language, no jargon assumed.
- **Christopher** — enthusiast, wants nuance and precision.

Rule: copy must work for both without alienating either — define any technical term
(EDP, sillage, projection tier) in plain words the first time it appears, but don't strip out
the precision an enthusiast wants. This is the same instinct as the plain-language display
rule in §4 — abbreviations get a plain-language gloss, not a replacement.

## 13. Key `fragrances` columns (verified live, `app/api/search/route.ts:17`)

```
id, brand, name, full_name, family, projection, optimal_season, plain_description,
inspired_by, image_url, rating, top_notes, heart_notes, base_notes, created_at, concentration
```

| Column | Meaning |
|---|---|
| `full_name` | Combined brand+name display string (distinct from separate `brand`/`name`) |
| `plain_description` | Human-readable description used in search matching and cards |
| `inspired_by` | The clone/inspiration relationship — **the only real clone-relationship column** |
| `image_url` | Nullable; falls back to a family-gradient (`lib/familyGradients.ts`) when null — ~53k/127k rows have a real image as of 2026-07-04 |
| `optimal_season`, `use_case` | Free-text occasion/season fields, matched via substring in `OCCASION_TAGS` |
| `rating` | Numeric rating field surfaced in search results |
| `popularity_rank` | Referenced in repo `CLAUDE.md`/dossier as a live column — UNVERIFIED in this pass: grep for it before relying on it (see Provenance below) |

FENCE — do not reintroduce `clone_target`: it is referenced in
`app/(main)/collection/[id]/page.tsx` but **does not exist** on the live `fragrances` table.
This is called out explicitly in a code comment at `app/api/search/route.ts:13-15`.
`inspired_by` is the real column for clone relationships — always use that.

## When NOT to use this skill

- Deploy, build, or git-hygiene questions → `branch-hygiene`.
- RLS policies, auth model, GDPR/LLM abuse posture → `security-hardening`.
- Matching a brand against a real Shopify storefront for image enrichment → `shopify-image-enrichment`.
- General repo cleanliness / stale-file hunting → `repo-tidy`.
- This skill is about what the domain terms and enums *mean* — not about how to ship, test,
  or secure a change that uses them.

## Provenance and maintenance

Derived 2026-07-05 from direct repo reads (this session) plus the dossier that seeded it, with
several dossier claims corrected after code verification (see below).

Re-verify anything here that can drift, using these exact commands from repo root
(`/Users/christophergoslin/Projects/scentral-hub`):

```bash
# Families / vibe tags / occasion tags / KNOWN_BRANDS
grep -n "VIBE_TAGS\|OCCASION_TAGS\|KNOWN_BRANDS\|LONGEVITY_PROJECTIONS" -A 15 lib/filterConstants.ts

# Projection enum — five exact values
grep -n "Beast Mode" -A2 -B2 lib/filterConstants.ts app/api/smells-like/route.ts

# Personas — 6 slugs, canonical source
grep -n "id: '" lib/personas.ts

# Affinity tiers
grep -n "AFFINITY_TIER_DEFS" -A 45 lib/affinity.ts

# XP levels
grep -n "LEVEL_THRESHOLDS" -A6 app/api/spritz/log-wear/route.ts

# Clone-confidence (1-10) vs dna-match (0-100) — confirm the two scales haven't merged
grep -n "score.*1-10\|score.*(0-100)" app/api/clone-confidence/route.ts app/api/dna-match/route.ts

# Live fragrances columns actually selected in search
grep -n "FRAGRANCE_COLUMNS" -A2 app/api/search/route.ts

# popularity_rank — UNVERIFIED in this pass, confirm before relying on it
grep -rn "popularity_rank" --include="*.ts" app lib supabase/migrations | grep -v node_modules
```

Corrections made vs. the seed dossier (verify yourself if in doubt):
- KNOWN_BRANDS uses `Christian Dior` / `Yves Saint Laurent`, not `Dior` / `YSL`.
- The "0–100, >80 spot-on" clone-confidence banding in the dossier actually describes
  `/api/dna-match`'s "Chemical Harmony" score, not `/api/clone-confidence` (which is 1–10,
  no named bands, plus a yes/maybe/skip recommendation).
- `clone_target` does not exist on `fragrances` — flagged explicitly in `app/api/search/route.ts`
  as a column referenced elsewhere in the app that must not be reintroduced; `inspired_by` is correct.
- `fragrances.family` is free-text and compound (e.g. "Woody Oud"), not a clean single-word
  enum — the dossier's family list is really the `VIBE_TAGS` filter taxonomy, one abstraction
  layer above the raw column.

Unverified in this pass (label stays until checked): `popularity_rank` column existence/usage —
not found in the files this pass touched (`search/route.ts`, `filterConstants.ts`). Run the
grep above before citing it as a real column.
