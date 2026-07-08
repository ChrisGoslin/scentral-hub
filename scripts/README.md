# Bulk Import: FragDB Kaggle Dataset

One-time pipeline to import fragrances from the [FragDB Kaggle dataset](https://www.kaggle.com/datasets/eriklindqvist/fragdb-fragrance-database) and enrich with AI-generated descriptions.

## Quick Start

1. **Download CSV** from Kaggle
2. **Place at** `scripts/data/fragrances.csv`
3. **Run import**: `node scripts/import-fragrances.mjs --dry-run`
4. **Run import** (for real): `node scripts/import-fragrances.mjs`
5. **Enrich** (repeatedly): `node scripts/enrich-fragrances.mjs`

## import-fragrances.mjs

Reads CSV, deduplicates on `(brand, name)`, normalizes family, upserts 100 rows at a time.

### Setup

```bash
mkdir -p scripts/data
# Download FragDB CSV from Kaggle, save to scripts/data/fragrances.csv
```

Expected columns: `brand`, `name`, `gender`, `notes`, `family` (optional).

### Usage

```bash
# Preview without writing to DB
node scripts/import-fragrances.mjs --dry-run

# Full import (batched 100 rows at a time)
node scripts/import-fragrances.mjs
```

### What Gets Written

| Field | Source | Value |
|-------|--------|-------|
| `brand` | CSV | `brand` |
| `name` | CSV | `name` |
| `full_name` | Derived | `brand + " " + name` |
| `family` | CSV or derived | Normalized to single-word axis (Fresh, Woody, etc.) |
| `projection` | Default | `"Moderate"` |
| `use_case` | CSV gender | `"Daily, office"` / `"Date night"` / `"Daily, versatile"` |
| `plain_description` | — | `NULL` (enrichment script fills) |
| `image_url` | — | `NULL` |

**Family Normalization**: Multi-word families like "Fresh Aromatic" → "Fresh". Unknown families stored as-is. Keyword-based fallback if `family` column missing.

### Output

```
✓ Loaded 500 records from scripts/data/fragrances.csv

✓ Found 282 existing fragrances

📊 215 new + 285 skipped = 500 total
📝 Ready to insert 215 rows in batches of 100

⏳ Inserting batch 1...
⏳ Inserting batch 3...
✅ Inserted 215 / Skipped 285 (duplicates) / Errors 0
```

## enrich-fragrances.mjs

Queries 100 rows with `plain_description IS NULL`, calls Claude Haiku, updates descriptions. Run repeatedly until all enriched.

### Usage

```bash
# Dry run (preview prompts)
node scripts/enrich-fragrances.mjs --dry-run

# Enrich next 100 rows (1–2 seconds per row at 2 req/sec)
node scripts/enrich-fragrances.mjs
```

### Model & Rate Limit

- **Model**: `claude-haiku-4-5-20251001` (cheapest, ~1ms per request)
- **Rate**: 2 requests/second (500ms delay between calls)
- **Prompt**: Simple JSON request, max 20 words per description

### Output

```
✓ Found 100 fragrances with NULL plain_description

✓ Chanel - No. 5
✓ Dior - Sauvage
[...]

📊 98 successful, 2 failed

⏳ Updating Supabase with 98 descriptions...
✅ Updated 98 fragrances
```

Rerun until "Found 0 fragrances" = all enriched.

## Running Locally

⚠️ **Must run on your machine** — scripts call Supabase and Claude APIs (sandbox has no network).

```bash
cd ~/Projects/scentral-hub

# Test import
node scripts/import-fragrances.mjs --dry-run

# Import (takes ~30s for 500 rows, batched)
node scripts/import-fragrances.mjs

# Enrich first batch (~1–2 minutes for 100 rows)
node scripts/enrich-fragrances.mjs

# Enrich remaining batches (rerun until all done)
node scripts/enrich-fragrances.mjs
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ENOENT: no such file or directory, open 'scripts/data/fragrances.csv'` | Create `scripts/data/` and place CSV there: `mkdir -p scripts/data` |
| `Missing NEXT_PUBLIC_SUPABASE_URL` | Ensure `.env.local` has all required keys (already set up) |
| `Parse error` in enrichment | Claude returned invalid JSON. Script skips that row and continues. |
| Enrichment is slow | Normal. 2 req/sec = ~50 rows/minute. Each batch takes 1–2 minutes. |

## Next Steps

- Verify descriptions in `/discover` UI
- Manually fix outliers in Supabase SQL editor if needed
- Backfill images: `node scripts/backfill-parfumo-images.mjs`

## Image Enrichment: Firecrawl

Use Firecrawl only as a back-office image research tool, never in the live app
render path. The script below searches for direct bottle-image URLs, rejects
unapproved hosts, and defaults to dry-run:

```bash
# Preview top 15 curated/visible rows only
npm run enrich:images:firecrawl

# Narrow to one brand
npm run enrich:images:firecrawl -- --brand=Armaf --limit=5

# Apply validated results
npm run enrich:images:firecrawl -- --apply --limit=10
```

Rules:
- Uses `FIRECRAWL_API_KEY` from `.env.local`, or reuses the local Firecrawl CLI login
- Writes only when `--apply` is passed
- Never overwrites an existing `image_url`
- Rejects hosts not already present in `lib/fragranceImageHosts.js`

## Image URL Audit / Cleanup

Use the audit to find stale `image_url` values that should fall back to the
family gradient instead of crashing `next/image`:

```bash
# Dry-run inventory of page URLs, invalid URLs, and unapproved hosts
npm run audit:image-urls

# Apply cleanup by nulling suspect rows
npm run audit:image-urls -- --apply
```

Rules:
- Flags Fragrantica/Parfumo page URLs, invalid URLs, non-HTTPS URLs, and hosts
  missing from `lib/fragranceImageHosts.js`
- Writes a JSON report under `scripts/data/`
- In `--apply` mode, only nulls suspect `image_url` values; it does not guess replacements
