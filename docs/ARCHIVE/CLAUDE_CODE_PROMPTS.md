# nota. — Claude Code Prompts

**Sprint 1–5 COMPLETE** (2026-06-28). Archive: docs/archive/CLAUDE_CODE_PROMPTS_sprint1-5_complete.md
**Sprint 6–7 COMPLETE** (2026-06-29). All four prompts landed via independent commits:
- 0041f4c fix(filters): move Saved chip above Vibe carousel for better discoverability
- ad39e42 fix(api): sommelier — switch gap_analysis from Gemini to Claude Haiku
- b4ddd9c fix(api): dna-match — add chemist_cache lookup + switch to Claude Haiku
- e2a4234 fix(api): disable Vertex AI image generation route — stops Google billing

---

## POST-DEPLOY ACTIONS (manual, not Claude Code)

1. Add `ANTHROPIC_API_KEY` to Vercel env vars
2. `npm run build && git push`
3. Apply to Notino + Douglas on AWIN dashboard
4. Add `NEXT_PUBLIC_AWIN_PUBLISHER_ID=2955445` to Vercel env vars

---

## SPRINT 8 — Feature Sprint (run as 5 parallel Claude Code sessions)

### Session 1: Shake Randomizer on Brief page

In `app/(main)/spritz/SpritzClient.tsx`, add a "What should I wear today?" randomizer at the top of the page, above existing schedule content.

1. On mount, fetch up to 20 fragrances from the user's collection via Supabase client (collections joined to fragrances, filter affinity_score IS NOT NULL, order by affinity_score DESC). Use `createClient` from `@/utils/supabase/client`.

2. Add state: `randomResult` (fragrance | null), `randomLoading` (boolean).

3. Add a "🎲 Surprise Me" button. On click, pick a random fragrance weighted by affinity_score (higher score = more likely). Display result as a card:
   - Brand: 9px gold uppercase small caps
   - Name: Cormorant Garamond italic, 20px, var(--text)
   - Family: 9px muted uppercase
   - "Log as worn today →" button wiring into existing wear-log logic

4. If collection is empty: show "Add fragrances to your wardrobe to unlock this." with a link to /discover.

5. Card style: `var(--surface)`, `var(--r-card)`, `border-left: 3px solid var(--accent)`, padding 16px. Button: `var(--accent)` background.

Do not touch existing SpritzClient schedule logic. Insert randomizer section at top of returned JSX only.

Run `npx tsc --noEmit` before committing.

```
git commit -m "feat(spritz): shake randomizer — weighted random pick from wardrobe"
```

---

### Session 2: Scent Journal on collection detail page

In `app/(main)/collection/[id]/page.tsx`:

1. Add `scent_memory` to the collections SELECT query (already selects other columns from collections — add it there).

2. Pass `scent_memory` as a prop to the client component that renders the detail UI.

3. Add a "My Notes" section below `plain_description`:
   - Label: "My Notes" — 10px gold uppercase
   - `<textarea>` showing current `scent_memory` value
   - Placeholder: "What does this smell like to you? A memory, a place, a person..."
   - On blur: auto-save via `supabase.from('collections').update({ scent_memory: value }).eq('fragrance_id', id)` — use `scentral_anon_id` from localStorage for the anon_id filter
   - Show subtle "Saved ✓" flash for 1.5s after successful save

4. Style: no visible border, `background: transparent`, Cormorant Garamond italic, 15px, `color: var(--text)`, `resize: none`, `min-height: 80px`. Feels like a private journal, not a form.

Run `npx tsc --noEmit` before committing.

```
git commit -m "feat(collection): scent journal — auto-save notes on detail page"
```

---

### Session 3: AI pros/cons on detail page

1. Create `app/api/proscons/route.ts` — POST handler:
   - Input: `{ fragranceId: string }`
   - `createClient()` INSIDE handler only (never module scope)
   - Fetch fragrance: `id, brand, name, family, projection, plain_description`
   - Check `sommelier_cache` first: `.eq('mode', 'proscons_' + fragranceId).maybeSingle()` — return cached result if found
   - Call Claude Haiku (ANTHROPIC_API_KEY already in env):
     ```ts
     const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
     const message = await anthropic.messages.create({
       model: 'claude-haiku-4-5-20251001',
       max_tokens: 256,
       messages: [{ role: 'user', content: `Fragrance expert. For ${brand} ${name} (${family}, ${projection}): "${plain_description}". JSON only: { "pros": ["str","str","str"], "cons": ["str","str"] }` }],
     })
     ```
   - Cache result: `.upsert({ mode: 'proscons_' + fragranceId, result: parsed }, { onConflict: 'mode' })`
   - Return `{ pros, cons }`

2. Create `components/collection/ProsCons.tsx` — client component:
   - Fetches `/api/proscons` on mount (only if `plainDescription` prop exists)
   - LoadingShimmer while fetching
   - Pros: ✓ green (`#4ade80`), Cons: ⚠ amber (`var(--accent)`)
   - 11px, `var(--text-muted)`, italic

3. Add `<ProsCons fragranceId={id} plainDescription={f.plain_description} />` to the detail page below the description block.

Run `npx tsc --noEmit` before committing.

```
git commit -m "feat(collection): AI pros/cons on detail page via Claude Haiku + sommelier_cache"
```

---

### Session 4: Discovery Box seeding + waitlist CTA

1. Create `scripts/seed-discovery-boxes.mjs`:
   - Load credentials from `.env.local` via dotenv — never CLI env vars
   - `--dry-run` flag: log what would be inserted, no DB writes
   - Upsert 6 boxes with `onConflict: 'slug'`:
     ```js
     { name: 'The Velvet Edit', slug: 'velvet-edit', description: 'Rich, complex, and intellectually layered. Five bottles for the fragrance thinker.', theme: 'oriental', tier: 'premium', fragrance_ids: [], shopify_product_id: null }
     { name: 'The Solar Set', slug: 'solar-set', description: 'Clean, precise, and effortlessly modern. Light that lingers.', theme: 'fresh', tier: 'standard', fragrance_ids: [], shopify_product_id: null }
     { name: 'The Dark Atelier', slug: 'dark-atelier', description: 'Smoky, leathery, and unapologetically intense. Not for the faint-hearted.', theme: 'leather', tier: 'premium', fragrance_ids: [], shopify_product_id: null }
     { name: 'The Ritual Kit', slug: 'ritual-kit', description: 'Meditative, grounding, and quietly powerful. Scents that become ceremony.', theme: 'woody', tier: 'standard', fragrance_ids: [], shopify_product_id: null }
     { name: 'The Lab Pack', slug: 'lab-pack', description: 'Experimental, genre-defying, and conversation-starting. Five wildcards.', theme: 'aromatic', tier: 'standard', fragrance_ids: [], shopify_product_id: null }
     { name: 'The Comfort Collection', slug: 'comfort-collection', description: 'Warm, enveloping, and instantly familiar. Scents like a hug.', theme: 'gourmand', tier: 'standard', fragrance_ids: [], shopify_product_id: null }
     ```
   - Print ✅/❌ per row

2. In `app/(main)/boxes/BoxesClient.tsx`, when a box has `shopify_product_id === null`, render a "Join Waitlist →" button instead of any buy CTA:
   - Style: `border: 1px solid var(--accent)`, transparent background, gold text
   - On click: `router.push('/waitlist')`

Do NOT build Shopify integration. Seed data + waitlist CTA only.

Run `npx tsc --noEmit` before committing.

```
git commit -m "feat(boxes): seed 6 persona discovery boxes + waitlist CTA pre-Shopify"
```

**Run seed script locally after committing:**
```bash
cd ~/Projects/scentral-hub
node scripts/seed-discovery-boxes.mjs --dry-run
node scripts/seed-discovery-boxes.mjs
```

---

### Session 5: Lighthouse audit

```
Run a Lighthouse audit against https://scentral-hub.vercel.app and report scores.

1. Run: npx lighthouse https://scentral-hub.vercel.app --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/nota-lighthouse.json --chrome-flags="--headless --no-sandbox"
2. Report the 4 scores: Performance, Accessibility, Best Practices, SEO. Flag any below 85.
3. Check docs/LAUNCH_READINESS_CHECKLIST.md for remaining submission items.
4. Do NOT modify any app code. Audit and report only.
```
