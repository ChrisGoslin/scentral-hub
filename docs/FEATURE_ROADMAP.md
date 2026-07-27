# nota. — Feature Roadmap (Reference-Site Synthesis)

> Created 2026-06-23. The inspiration-driven backlog. Companion to [`GAP_ANALYSIS.md`](GAP_ANALYSIS.md) and [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md).
> **Vision in one line:** Fragrantica/Parfumo's data depth + wikiparfum's ingredient-led discovery + clonespreadsheet's dupe utility + Perfume Society/EPC's education & subscription commerce — in a clean, evolving PWA monetized with ads + affiliate + Shopify.

---

## Reference sites → what to borrow

### clonespreadsheet.com — dupe database → **biggest near-term win**
"Trusted by 500k+." Maps designer original → clone with **similarity %**, current price, original price, gender filter, retailer (Jomashop) affiliate links.
- **Build the flagship Clone/Dupe Finder (`/clones`).** You already have `inspired_by` data + `InspiredByClones` component + similarity RPC. Surface as a browsable, filterable table. Add columns `similarity_score`, `buy_link`, `affiliate_url`. **SEO gold + the most direct affiliate revenue path.**

### Fragrantica — encyclopedia + community
- **Note pyramid** (top/heart/base) on detail pages.
- **Community longevity & sillage voting** (you have `projection`; add user votes).
- **"This reminds me of"** similar surfacing on every detail page (engine exists).
- **AI pros/cons** auto-extracted from reviews (Claude/Gemini SDKs present).
- **Perfume of the Day** + editorial/news home feed + annual **Readers' Choice Awards**.
- **Notes index** (`/notes`).

### Parfumo — collection + stats
- **Collection statistics dashboard** (top families/houses/seasons, wear frequency) — extend `/intelligence`, add a free teaser.
- **Tri-state ownership** Have / Want / Tested (you have Wishlist + Collection; add Tested).
- **Shake randomizer** ("what should I wear today") — trivial, delightful, feeds Spritz.
- Barcode scan ✅ already done (`/scanner`).

### wikiparfum — ingredient-led discovery
- **Ingredient/Note encyclopedia (`/ingredients/[slug]`)** — each note → perfumes containing it. Strong SEO + discovery. Model: Michael Edwards "Fragrances of the World" taxonomy.
- **Olfactive-family navigation** → pairs with the **Fragrance Wheel (`/wheel`)** already scoped but unbuilt.
- Guided scent-profile questionnaire ✅ (onboarding/persona engine covers this).

### Perfume Society — education + subscription commerce
- **Discovery Box / seasonal sample subscription** (£21/3mo model) → the natural **Shopify storefront** product; persona-matched 5-sample kits.
- **"Find A Fragrance"** finder ✅ (persona engine).
- **"The Scented Letter"-style magazine** → editorial layer / `/learning` expansion.
- Membership tiers → Pro framing.

### Experimental Perfume Club — making & journaling
- **Scent journaling** — you already have a `scent_memory` column! Expand into a real journal (memory ↔ fragrance prompts). High emotional payoff, low build cost.
- **Education progression** free → paid course → experience → **ingredient/creation kits (Shopify).**
- **Formula documentation** in the Layering Lab — save & name blends (you have `layer_recipes`).

---

## Net-new feature backlog (complements existing build)
1. `/wheel` Fragrance Wheel (already scoped, mockup exists) — 9-axis SVG + collection gap analysis + share PNG.
2. `/clones` Clone/Dupe Finder (flagship) — uses `inspired_by` + new monetization columns.
3. `/ingredients/[slug]` + `/notes` encyclopedia — SEO + discovery.
4. Community **longevity/sillage voting** + **AI pros/cons** on detail pages.
5. **Collection stats dashboard** (Parfumo-style) — free teaser of `/intelligence`.
6. **Scent journal** — built on existing `scent_memory`.
7. **Editorial home feed** + **Perfume of the Day**.
8. **Shake randomizer**.
9. **Discovery Box** sample subscription (Shopify) — see [`MONETIZATION_PLAN.md`](MONETIZATION_PLAN.md).
10. Add **nav links** for the orphaned community routes (`/creator`, `/wear-and-share`).

---

## Recommended tackle order

**P0 — Reconcile source of truth (½ day, unblocks all).** Resolve the 6 decisions in `GAP_ANALYSIS.md`. Lock + activate one design system. Collapse to one feature-naming scheme. Run the [`archived/ARCHIVE_MANIFEST.md`](archived/ARCHIVE_MANIFEST.md) sweep. Adopt `PRODUCT_TRUTH.md` as canonical; retire `architecture.md` + `DIRECTORY_STRUCTURE.md`.

**P1 — Close real code gaps (1–2 days).** Build `/wheel`. Fix `/profile` (redirect → `/you`). Make `/pro` honest (Stripe or hide). Remove dead code (4 files). Add community nav links.

**P2 — Monetization foundation (2–3 days).** Schema migration (`similarity_score`/`buy_link`/`affiliate_url`). Real affiliate IDs + click tracking. AdSense + ad slots. Scope Shopify Discovery-Box storefront. (See `MONETIZATION_PLAN.md`.)

**P3 — Inspiration features (ongoing).** Clone/Dupe Finder → Ingredient/Notes encyclopedia → community voting + AI pros/cons → stats dashboard → scent journal → editorial home feed → shake randomizer.
