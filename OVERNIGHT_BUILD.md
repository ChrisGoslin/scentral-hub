# Scentral — Overnight Build Prompt
*Paste this entire block into Claude Code. Run from: `~/Projects/scentral-hub`*

---

## Context before you start

Read `AGENTS.md` and `SCENTRAL_PERSONAS.md` before writing a single line of code.

Key facts to ground yourself on:
- **Repo:** local folder `scentral-hub` = GitHub repo `ChrisGoslin/scentral`
- **Supabase project:** `lrkdwobnemczvhpixpky` (use MCP tool for all DB queries)
- **Stack:** Next.js 16.2.6 App Router, Supabase, Tailwind, Anthropic SDK `@anthropic-ai/sdk` already installed
- **Two personas:** Gavan (newcomer, 5–10 bottles, plain language) and Christopher (enthusiast, 30+ bottles, expert)
- **Free/Pro split:** Free = Discover + My Bottles + Layer Builder + You. Pro = gated behind `components/ui/ProGate.tsx`
- **Design tokens:** `--bg` `--surface` `--surface-2` `--text` `--text-muted` `--accent` `--line` — use CSS vars, never hardcode colours
- **Existing UI components:** `components/ui/Button.tsx`, `Card.tsx`, `Chip.tsx`, `EmptyState.tsx`, `ErrorInline.tsx`, `LoadingShimmer.tsx`
- **Do not touch:** `components/ui/ProGate.tsx`, any Pro-gated pages (`/intelligence`, `/dna-match`, `/schedule`), auth flows, Supabase migrations already applied

---

## Phase 1 — Plain-language fragrance descriptions (D)

**Goal:** Every fragrance in the database gets a `plain_description` — one sentence in Gavan's language, not expert-speak.

**Examples of what we want:**
- "Warm and smoky with a sweet amber centre — lasts all day without reapplying."
- "Fresh and clean, like walking outside on a cold morning. Great for the office."
- "Rich oud with a soft leather edge — unmistakably Middle Eastern, turns heads."

**Steps:**
1. Check the `fragrances` table schema using the Supabase MCP tool. Look for an existing `plain_description` column. If it doesn't exist, add it: `ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS plain_description text;`
2. Query all fragrances that have `plain_description IS NULL` — select `id`, `brand`, `name`, `family`, `projection`, `anosmia_risk`, `optimal_season`, `top_notes`, `heart_notes`, `base_notes`.
3. In batches of 10, call the Anthropic API (`claude-haiku-4-5-20251001` — cheapest, fast enough) with a prompt like:

```
You are writing product descriptions for a fragrance app aimed at people new to collecting.
Write ONE sentence per fragrance in plain English — no jargon, no note pyramids.
Focus on: how it smells in everyday language, when/where to wear it, and longevity if notable.
Max 20 words per description.

Fragrances:
{batch as JSON}

Return JSON array: [{ "id": "...", "plain_description": "..." }]
```

4. Write results back to Supabase using `UPDATE fragrances SET plain_description = $1 WHERE id = $2`.
5. Add a 500ms delay between batches to avoid rate limits.
6. Log progress: `Batch 1/N complete (X descriptions written)`.
7. After completion, verify: run `SELECT COUNT(*) FROM fragrances WHERE plain_description IS NOT NULL`.

**Success criteria:** All fragrances have a non-null `plain_description`. Commit the migration (column add only — not the data).

---

## Phase 2 — Inspired-by mapping on fragrance detail pages (B)

**Goal:** On each fragrance detail page (`/collection/[id]`), show a section "This smells like [Designer]" when an inspired-by relationship exists.

**Steps:**
1. Check if the `fragrances` table has an `inspired_by` column (text). If not, add it: `ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS inspired_by text;`
2. Using the Anthropic API (Haiku), backfill `inspired_by` for fragrances where it's null. For each fragrance, if the name or brand strongly implies an inspiration (e.g. "Lattafa Asad" → "Creed Aventus", "Afnan 9PM" → "Paco Rabanne Invictus"), set the value. Use this prompt in batches of 15:

```
You are a fragrance expert. For each fragrance below, identify the designer fragrance it is inspired by or commonly compared to — if one is well-known.
Only return a value if you are confident (>80%). Otherwise return null.
Format: [{ "id": "...", "inspired_by": "Brand Name" or null }]

Fragrances:
{batch as JSON with brand, name, family, top_notes, heart_notes, base_notes}
```

3. Write results back: `UPDATE fragrances SET inspired_by = $1 WHERE id = $2 AND $1 IS NOT NULL`.
4. Now update the collection detail page. Read `app/(main)/collection/[id]/page.tsx` and `InspiredByClones.tsx` first — there's already an InspiredByClones component. Check if it uses `inspired_by`. If not, wire it in.
5. If `InspiredByClones` is not wired to `inspired_by`, add a simple section to the detail page:

```tsx
{fragrance.inspired_by && (
  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--accent)', marginTop: 16 }}>
    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>
      Smells like
    </p>
    <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 4 }}>
      {fragrance.inspired_by}
    </p>
    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
      A fraction of the price — same DNA.
    </p>
  </div>
)}
```

6. Make sure `inspired_by` is included in the Supabase select query on the detail page.

**Success criteria:** At least 20 fragrances have an `inspired_by` value. Detail page shows the "Smells like" section when populated.

---

## Phase 3 — Discover page (A)

**Goal:** Build `/discover` — a browseable catalogue page for Gavan. No login required. Filter by feel, longevity, brand.

**Route:** `app/discover/page.tsx` + `app/discover/DiscoverClient.tsx`

**UI spec:**
- Page header: "Discover" / "Find your next scent"
- Filter row (horizontal scroll chips, no login required):
  - **Feel:** Warm & Rich · Fresh & Clean · Bold & Lasting · Light & Subtle
  - **Longevity:** Lasts all day · A few hours · Quick burst
  - **Brand:** All · Lattafa · Afnan · Rasasi · Armaf · Swiss Arabian · Other
- Fragrance grid: 2-col on mobile, 3-col on desktop
- Each card shows: brand, name, `plain_description` (from Phase 1), `inspired_by` badge if present ("Smells like [X]")
- No ratings, no phase labels, no technical terms visible to user
- Empty state if filters return nothing: "Nothing matching — try a different feel"
- Clicking a card goes to `/collection/[id]`

**Data:**
- Fetch all fragrances from Supabase: `id, brand, name, family, projection, optimal_season, plain_description, inspired_by, image_url`
- Feel → family mapping (use this exactly):
  ```
  'Warm & Rich'    → family IN ('Woody Oriental', 'Oriental', 'Amber', 'Oud', 'Gourmand')
  'Fresh & Clean'  → family IN ('Citrus', 'Aquatic', 'Green', 'Fresh Spicy')
  'Bold & Lasting' → family IN ('Leather', 'Tobacco', 'Smoky', 'Resinous') OR projection IN ('Beast Mode', 'Strong')
  'Light & Subtle' → projection IN ('Soft', 'Moderate')
  ```
- Longevity → projection mapping:
  ```
  'Lasts all day'   → projection IN ('Beast Mode', 'Strong')
  'A few hours'     → projection = 'Moderate'
  'Quick burst'     → projection IN ('Soft', 'Light')
  ```

**Implementation notes:**
- This is a free page — no auth check, no ProGate
- Use `'use client'` for the filter/grid component
- Fetch fragrances server-side in `page.tsx`, pass as props to `DiscoverClient`
- Reuse `components/ui/Chip.tsx` for filters, `components/ui/Card.tsx` for fragrance cards
- Reuse `components/ui/LoadingShimmer.tsx` for loading state
- Add the route to `BottomNav.tsx` — replace the duplicate "My Bottles" / "Discover" entries: `Discover → /discover`, `My Bottles → /collection`

**Success criteria:** `/discover` loads without login, filters work, "Smells like" badge appears on cards with `inspired_by`, page is committed and pushed.

---

## Phase 4 — Repo tidy (C)

**Steps (do these last, after Phases 1–3 are committed):**

1. **Remove dead pages** — delete these files if they exist and have no inbound links from real pages:
   - `app/test-supabase/page.tsx`
   - `app/design-system/page.tsx`
   - `app/learning/page.tsx` (if it's a placeholder with no content)
   - `app/community/page.tsx` (if it's a placeholder)
   - Check each file before deleting — if it has real content, leave it and note it.

2. **Remove unused components** — check if these are imported anywhere. If not, delete:
   - `app/components/AccordCreator.tsx`
   - `app/components/SpritzSchedulerTeaser.tsx`
   - `app/components/TheExhibition.tsx`
   - `app/components/DynamicAura.tsx`
   - Use `grep -r "ComponentName" app/ components/` before deleting each.

3. **Clean `OVERNIGHT_BUILD.md`** from the repo root after the build is complete (this file is instructions, not app code):
   - `git rm OVERNIGHT_BUILD.md`

4. **Commit everything** in logical chunks:
   ```
   git add -A && git commit -m "feat: plain-language descriptions via Claude Haiku"
   git add -A && git commit -m "feat: inspired-by mapping + detail page Smells Like section"
   git add -A && git commit -m "feat: /discover page — browse by feel, longevity, brand"
   git add -A && git commit -m "chore: remove dead pages and unused components"
   git push
   ```

**Success criteria:** Vercel build passes. Four commits pushed to main.

---

## Hard constraints (from AGENTS.md)

- **No secrets in code.** All env vars via `process.env`. If you see a hardcoded key, stop and flag it.
- **No new Supabase migrations beyond the two column adds** (`plain_description`, `inspired_by`). Show both SQL statements before running them and wait for confirmation — or, if running unattended, add `IF NOT EXISTS` to make them safe to re-run.
- **Do not touch:** auth, ProGate, Pro-gated pages, existing working routes beyond what's specified above.
- **Verify paths before using them.** Run `ls` or `find` — don't invent file locations.
- **If you hit a blocker** (API error, DB schema mismatch, missing env var), stop that phase, log the issue clearly, and move to the next phase. Don't spiral.
- **TypeScript:** no `any` unless the existing codebase already uses it in that file. No new `// @ts-ignore`.
