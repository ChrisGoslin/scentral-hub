# Fragrance Data Import & Enrichment

Two Node.js scripts for bulk importing fragrances from a Kaggle CSV and enriching them with AI-generated descriptions.

## Prerequisites

Both scripts require `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY` (enrichment script only)

All three are already set up in this project.

## import-fragrances.mjs

Bulk import fragrances from a Kaggle CSV, with automatic deduplication and family normalization.

### Setup

1. Place your CSV at `scripts/data/fragrances.csv`
2. Expected columns: `brand`, `name`, `notes` (or `top_notes`/`heart_notes`/`base_notes`), `gender`, `year`, `family`
3. The `family` column is optional — if missing, it will be derived from the notes using simple keyword matching

### Family Normalization

The script normalizes multi-word family values (e.g., "Fresh Aromatic", "Woody Spicy") to single-word axes:

```
Fresh, Aquatic, Woody, Oud, Oriental, Spicy, Floral, Fruity, Gourmand, Aromatic
```

See the `AXIS_MAP` constant in `app/(main)/wheel/page.tsx` for the full mapping. Unknown families are stored as-is.

### Usage

**Dry run** (preview without writing):

```bash
cd ~/Projects/scentral-hub
node scripts/import-fragrances.mjs --dry-run
```

**Import first 100 rows** (test run):

```bash
node scripts/import-fragrances.mjs --limit=100
```

**Full import**:

```bash
node scripts/import-fragrances.mjs
```

### Output

```
✓ Loaded 500 records from scripts/data/fragrances.csv
✓ Found 282 existing fragrances
📊 Deduplication: 215 new + 285 skipped = 500 total
📝 Ready to insert 215 rows
⏳ Inserting 215 rows...
✅ Successfully inserted 215 fragrances
```

### What Gets Set

- `brand`, `name` — from CSV
- `family` — normalized to axis (Fresh, Woody, etc.)
- `projection` — defaults to "Moderate" (can be enriched later)
- `notes` — concatenated from top/heart/base if available
- `lean` — "masculine" / "feminine" / null based on gender
- `optimal_season`, `use_case`, `plain_description`, `inspired_by`, `image_url` — all null (to be filled later)

## enrich-fragrances.mjs

Query fragrances with `NULL plain_description` and generate descriptions + use cases using Claude Haiku.

### Usage

**Dry run** (preview prompts without calling API):

```bash
node scripts/enrich-fragrances.mjs --dry-run
```

**Enrich next 50 fragrances** (default limit):

```bash
node scripts/enrich-fragrances.mjs
```

**Enrich next 10 fragrances**:

```bash
node scripts/enrich-fragrances.mjs --limit=10
```

### Rate Limiting

Calls Claude API with 1-second delay between requests to stay under rate limits. Adjust `delayMs` in the script if needed.

### Output

```
✓ Found 147 fragrances with NULL plain_description

✓ Carolina Herrera - Bad Boy: "Dark, spicy, and leather-forward, with warm amber undertones." (Evening, winter)
✓ Marc Jacobs - Daisy: "Light floral with a playful, fruity heart and musky base." (Day, spring)
[...]

📊 Enrichment complete: 10 successful, 0 failed

⏳ Writing 10 updates to Supabase...
✅ Updated 10 fragrances
```

### What Gets Updated

For each fragrance:
- `plain_description` — 1–2 sentence description (max 20 words)
- `use_case` — 3-word context (e.g., "Date night, winter" or "Office, fresh")

## Running Locally

⚠️ **Important**: These scripts call external APIs (Supabase, Claude). They MUST be run from your local machine, not in the Cowork/sandbox environment.

```bash
# From your local terminal, in the scentral-hub repo:
cd ~/Projects/scentral-hub

# Test the import
node scripts/import-fragrances.mjs --dry-run --limit=5

# Test enrichment
node scripts/enrich-fragrances.mjs --dry-run --limit=3

# Run for real when ready
node scripts/import-fragrances.mjs --limit=100
node scripts/enrich-fragrances.mjs --limit=50
```

## Troubleshooting

### "Missing SUPABASE_SERVICE_KEY"

Ensure `.env.local` exists in the repo root and has all required keys.

### "CSV not found: scripts/data/fragrances.csv"

Create the `scripts/data/` directory and place your Kaggle CSV there:

```bash
mkdir -p scripts/data
# Copy or download your CSV to scripts/data/fragrances.csv
```

### "Parse error" in enrichment

The Claude response was not valid JSON. Check the console error message. The script will skip that row and continue.

### Rate limit errors from Claude

Increase `delayMs` in the enrichment script (currently 1000ms). Try 2000ms or 3000ms.

## Next Steps

After enrichment completes:

1. Manually verify a few enriched descriptions in the `/discover` or `/collection` pages
2. If needed, manually edit outliers in Supabase directly (SQL editor)
3. Backfill remaining columns as needed (optimal_season, inspired_by, image_url)

See `scripts/backfill-parfumo-images.mjs` for image backfilling from Parfumo/Fragrantica.
