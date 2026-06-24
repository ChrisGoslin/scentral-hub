# Scentral MVP Spec
_Written overnight 16 May 2026. Ready for Claude Code implementation._

---

## What Scentral is

A personal fragrance intelligence tool. Not Reddit-for-fragrance. Not Fragrantica.

**The core loop:**
1. You know what you own
2. Scentral tells you how to understand it (olfactory family, phase, chemistry)
3. Scentral tells you how to combine it (layering lab + spritz schedule)
4. You smell incredible. Every day.

**The two things nobody else does:**
- Phase-based categorisation (Endothermic Anchor → Textural Modulator → Exothermic Top)
- Application intelligence (where to spray, how many, in what order, and why)

---

## What's already built (overnight 16 May 2026)

### Supabase: scentral-mvp project (lrkdwobnemczvhpixpky)
**Already existed:** `fragrances`, `collections`, `layering_combinations`, `spritz_schedules`, `wear_logs`, `profiles`

**Added tonight:**
- New columns on `fragrances`: `phase`, `phase_label`, `family`, `use_case`, `projection`, `lean`, `rating`, `maturation`, `spritz_count`, `application_zone`, `application_method`, `anosmia_risk`, `temperature`
- New table: `layering_protocols` — seeded with 4 expert protocols from your Gemini chemist

**Data imported:**
- **76 fragrances** across all 3 phases with full Spritz Schedule data
- **4 layering protocols** (Alpha, Beta, Gamma, Delta) with spray ratios, chemicals, sillage predictions, IFRA safety notes

### ⚠️ Note on Supabase project
You're at the 2-project free tier limit. scentral-mvp couldn't be created.
**Options when you wake up:**
- A) Pause the household-finance project (no data lost, just dormant) → create scentral-mvp fresh
- B) Keep using ScentOI as the Scentral database (perfectly fine, just rename it in Supabase dashboard)

Recommendation: **Option B** — the schema is solid, the data is live. Rename ScentOI → scentral-mvp in the Supabase dashboard and move on.

---

## The MVP: Three screens, nothing more

### Screen 1 — My Collection
**What it does:** Shows your 76 fragrances organised by phase.

**Layout:**
- Three tabs or sections: 🛑 Anchors | 🧬 Modulators | ⚡ Tops
- Each card shows: Name, Brand, Family, Rating (your /10), Projection, Maturation status
- Filter bar: by season (Cold/Warm/Universal), by lean (Masculine/Feminine/Unisex), by anosmia risk
- Tap a card → detail view showing full notes, application zone, spritz count, method

**Data source:** `fragrances` table, filtered by `phase`

**What this gives you:** Finally understand your shelf. Know that His Confession (10/10) is a Phase 1 Anchor and Kayaan Terra (10/10) is a Phase 2 Modulator — so they can layer.

---

### Screen 2 — Layering Lab
**What it does:** You pick a fragrance. Scentral shows you what it layers with from your collection, and how.

**Layout:**
- Search/browse your collection → select one fragrance
- Scentral shows compatible pairings:
  - Phase 1 + Phase 2 combinations
  - Phase 1 + Phase 3 combinations
  - Phase 2 + Phase 3 combinations
- Each pairing card shows:
  - The two fragrances
  - Spray ratio (e.g. "2 sprays Rifaaqat → 1 spray Nomad")
  - Application zone for each
  - Method for each (Lipid Primer, Direct Dermal, Textile Fixation etc)
  - Predicted sillage and longevity
  - Anosmia warning if relevant

**Expert protocols** (from `layering_protocols` table) show as featured combinations at the top — these are the 4 Gemini chemist recipes.

**AI layer (Phase 2 feature, not MVP):** Claude analyses the notes of two fragrances you select and generates a new protocol on the fly. For MVP: just show the 4 expert protocols + rule-based phase compatibility.

**What this gives you:** The Fire & Ice + Rifaaqat combo you described. Scientifically validated. With exact instructions.

---

### Screen 3 — Today's Spritz Schedule
**What it does:** Builds a day plan — which fragrance at what time, where to spray, how many.

**Layout:**
- Morning (7:30am) → pick an Anchor. Application instructions.
- Midday (12:30pm) → pick a Modulator to layer on top. Instructions.
- Evening (6pm) → pick a Top or a new Anchor reset. Instructions.
- Optional Night layer.

**Logic:**
- Only shows Phase-appropriate fragrances for each slot
- Warns if anosmia risk is high for a planned combination
- Shows maturation status (greyed out if not ready)

**Save a schedule:** Give it a name ("Winter Date Night"), save to `spritz_schedules` table, recall anytime.

**What this gives you:** The decant day-out experience you described. Planned, scientific, effortless.

---

## The data model (what's in Supabase now)

```
fragrances
  id, brand, name, phase (1/2/3), phase_label
  inspired_by, top_notes[], heart_notes[], base_notes[]
  family, use_case, projection, lean
  rating, maturation, spritz_count
  application_zone, application_method
  anosmia_risk, temperature
  image_url (for bottle photos — currently unverified Fragrantica URLs)

layering_protocols
  id, name, concept
  base_fragrance_name, base_sprays, base_chemicals
  top_fragrance_name, top_sprays, top_chemicals
  predicted_sillage, predicted_hours
  occasion, season
  anosmia_warning, application_note

collections (user-owned, already existed)
  user_id → fragrance_id, status, rating, personal_notes

spritz_schedules (already existed)
  user_id, name, morning/midday/evening/night slots
  each slot: collection_id, sprays, time, application_points
```

---

## Tech stack

Same as your other projects — no new tools to learn:
- **Next.js** (App Router)
- **Supabase** (database + auth)
- **Vercel** (deployment)
- **Tailwind** (styling)

Reuse everything from fragrance-community repo as the starting point. The auth pattern, the Supabase client setup, the component structure — all identical.

---

## The Claude Code session prompt (use this exactly)

> "I'm building Scentral — a personal fragrance tool. The Supabase project ID is `lrkdwobnemczvhpixpky`. The database already has a `fragrances` table with 76 rows and a `layering_protocols` table with 4 rows.
>
> Build the Collection screen first: a Next.js page at `/collection` that fetches all fragrances from Supabase and displays them in three phase-grouped sections (Phase 1 = Endothermic Anchors, Phase 2 = Textural Modulators, Phase 3 = Exothermic Tops). Each card should show: name, brand, family, rating, projection, and application_zone. Use Tailwind for styling. Do not touch auth yet."

That's the exact starting point. One page, one query, real data. From there we add filtering, then the detail view, then the Layering Lab.

---

## What to do when you wake up

| Step | Where | Time |
|---|---|---|
| Rename ScentOI → scentral in Supabase dashboard | supabase.com | 2 min |
| Check the fragrances table has 76 rows | Supabase Table Editor | 2 min |
| Check layering_protocols has 4 rows | Supabase Table Editor | 2 min |
| Open Claude Code, paste the one-sentence prompt above | Terminal | — |
| Build `/collection` page with phase tabs | Claude Code | 30 min |
| Verify it fetches real data | Browser | 5 min |
| Deploy to Vercel | Claude Code / Vercel | 10 min |

**Total: ~50 minutes to have a live Scentral screen with your real collection data.**

---

## Risks to flag

1. **Fragrance images** — the `image_url` column has guessed Fragrantica URLs from the earlier session. Many will be wrong. Don't build image display until these are verified.

2. **Single user for now** — the `collections` table links fragrances to users via auth. For MVP, you can skip auth and query `fragrances` directly as a public read. Add auth once the screens work.

3. **Layering compatibility is rule-based, not AI** — for MVP, "compatible" simply means Phase 1 pairs with Phase 2 or Phase 3. The AI-generated protocol feature (Claude analysing two specific fragrances) comes in v2.

4. **The Spritz Schedule screen needs a user account** — it saves data. Don't build it until auth is wired. Build Collection and Layering Lab first.

5. **80+ fragrances in your Master Collection vs 76 in the Spritz Schedule** — there are fragrances in your Master Collection doc that aren't in the Spritz Schedule (e.g. Art of Universe, Mashrabya, Only Gold). These can be added in a second import pass with partial data (no phase/application data yet).

---

## What Scentral is NOT (keep this on the wall)

- Not a social network
- Not a review platform  
- Not a shop
- Not an AI chatbot

It is a personal tool that makes you smarter about what you own and how to use it. That's it. Ship that first.

---

## Future features (only after MVP ships)

- AI Layering Lab: input any two fragrances → Claude generates a protocol
- Maceration tracker: shows which bottles are still maturing (based on `maturation` field + purchase date)
- Wishlist + buy recommendations (your Tier 1/2/3 acquisition data is already in Drive)
- The Spritz Schedule as a shareable card (social-ready, but not social-first)
- C. Robin personal fragrance line: when you're ready to create your own, Scentral becomes the portfolio
