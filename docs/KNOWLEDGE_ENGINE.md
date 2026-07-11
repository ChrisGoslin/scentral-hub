# Fragrance & Layering Knowledge Engine

> Added 2026-07-11. Turns raw fragrance sources into Supabase tables plus
> NotebookLM-ready docs. See `CLAUDE.md` §12 phase log for the broader nota.
> project context.

## Pipeline

```
data/fragrance/incoming/*.{md,csv,json}
        │  npm run ingest:fragrance
        ▼
  LLM classify + extract (lib/llm.ts runLLM)
        │
        ├─► fragrance_facts       (single-fragrance profiles: notes, accords, anchor/modulator/top role)
        └─► layering_patterns     (multi-fragrance combos: use case, rationale)
        │
        ▼
  data/fragrance/canonical/       (processed source file moved here)
        │  npm run export:wardrobe / export:layering
        ▼
  data/fragrance/canonical/{MASTER_WARDROBE.md, LAYERING_PATTERNS.md, WARDROBE_INDEX.json}
```

### 1. Ingest — `scripts/ingest_fragrance_sources.ts`

Reads every `.md` / `.csv` / `.json` file in `data/fragrance/incoming/`, sends
the raw text to the LLM with a system prompt that classifies content into
`fragrance_profile` or `layering_pattern` items and extracts:

- Notes: top / heart / base
- Accord families
- Role: **anchor** (base-heavy — foundation + longevity), **modulator**
  (heart-heavy — complexity + texture), or **top** (volatile/fresh — opening
  + radiance). This is the same phase model already encoded in
  `docs/MASTER_WARDROBE.md` and `app/api/aura/route.ts`'s `preferred_phases`.

Extracted items are inserted into `fragrance_facts` / `layering_patterns`
(migration `supabase/migrations/20260711000001_fragrance_knowledge_engine.sql`
— **not yet applied**, pending approval per project rule). The source file is
then moved to `data/fragrance/canonical/`.

```bash
npm run ingest:fragrance -- --dry-run   # list files that would be processed
npm run ingest:fragrance                # actually classify, write, move
```

### 2. LLM enrichment — `lib/llm.ts`

`runLLM({ system, prompt, json, maxTokens, model })` wraps `@anthropic-ai/sdk`.
Model defaults to `process.env.LLM_MODEL` or `claude-haiku-4-5-20251001`; the
API key comes from `process.env.ANTHROPIC_API_KEY`. No Next.js-only imports,
so it's usable from both `app/api/*/route.ts` and standalone `tsx` scripts.

### 3. Export — `scripts/export_knowledge.ts`

```bash
npm run export:wardrobe   # MASTER_WARDROBE.md + WARDROBE_INDEX.json
npm run export:layering   # LAYERING_PATTERNS.md + WARDROBE_INDEX.json
```

Output goes to `data/fragrance/canonical/` — deliberately **not**
`docs/MASTER_WARDROBE.md`, which is a pre-existing hand-curated file this
pipeline does not touch. Point NotebookLM at `data/fragrance/canonical/` as a
single source folder; it contains both the original processed sources and
the generated roll-ups.

## External hooks

- **Zapier:** point a Zap at `data/fragrance/incoming/` (e.g. via a connected
  storage app, or a webhook that writes files there) to auto-feed new
  fragrance write-ups into the pipeline. Not wired yet — TODO.
- **NotebookLM:** add `data/fragrance/canonical/` as a notebook source. Re-run
  the export scripts after each ingest batch to refresh the roll-up docs.

## TODOs / open items

- Migrations `20260711000001_fragrance_knowledge_engine.sql` and
  `20260711000002_product_signals.sql` are written but **not applied** —
  needs explicit approval, then `supabase db push` (or the Supabase MCP).
- `Fragrance App Product Audit & Strategy.md` (referenced as the source of
  the anchor/modulator/top framework) does not exist in this repo as of
  2026-07-11 — the framework was instead verified against
  `docs/MASTER_WARDROBE.md` and `app/api/aura/route.ts`. If that strategy doc
  exists elsewhere, reconcile and update this doc.
- No brand/name matching against the live `fragrances` table yet —
  `fragrance_facts.fragrance_id` exists as a nullable FK for a future
  reconciliation pass.
