# Quick Setup: Image Generation for Scentral Sprint 1

This is a step-by-step checklist to get image generation working.

## Prerequisites

- Node.js 18+ installed
- Running dev server: `npm run dev`
- Supabase project already configured with fragrances table

## Step 1: Configure Environment Variables

Add these to `.env.local`:

```bash
# Get GEMINI_API_KEY from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=sk-...

# Get SUPABASE_SERVICE_KEY from Supabase Dashboard > Settings > API Keys
# Copy the "Service Role" key (marked as secret)
SUPABASE_SERVICE_KEY=eyJ...
```

## Step 2: Install Dependencies

The Gemini SDK was already installed:
```bash
npm install @google/generative-ai
```

Verify it's in package.json:
```bash
grep "@google/generative-ai" package.json
```

## Step 3: Apply Database Migration

Apply the migration to add `image_url` column:

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase Dashboard > SQL Editor:
# ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS image_url TEXT;
# CREATE INDEX IF NOT EXISTS fragrances_image_url_idx ON fragrances(image_url);
```

Verify the column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fragrances' AND column_name = 'image_url';
```

## Step 4: Test Single Image Generation

Get a fragrance ID from your database:
```sql
SELECT id, brand, name FROM fragrances LIMIT 1;
```

Test with curl:
```bash
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"fragranceId": "your-uuid-here"}'
```

Expected response (success):
```json
{
  "success": true,
  "imageUrl": "https://uwysupjxhsuvzxgqvxdh.supabase.co/storage/v1/object/public/fragrance-images/fragrance-xxx.png",
  "fileName": "fragrance-xxx.png",
  "generatedAt": "2026-05-30T10:45:23.456Z",
  "metadata": {
    "dimensions": "1024x1024",
    "model": "gemini-2.0-flash",
    "timestamp": "2026-05-30T10:45:23.456Z"
  }
}
```

## Step 5: Run Batch Image Generation

Generate images for all 76 fragrances:

```bash
node scripts/generate-all-images.mjs
```

This will:
1. Fetch all fragrances with `image_url IS NULL`
2. Generate images sequentially (3-second delay between requests)
3. Automatically retry up to 2 times on failure
4. Print summary with success/failure counts
5. List any failed fragrance IDs for manual retry

**Expected time:** ~10–15 minutes for 76 fragrances

## Step 6: Verify Results

Check that images were stored and database was updated:

```sql
-- Count fragrances with images
SELECT COUNT(*) as with_images FROM fragrances WHERE image_url IS NOT NULL;

-- View a few examples
SELECT id, brand, name, image_url FROM fragrances 
WHERE image_url IS NOT NULL LIMIT 3;
```

In Supabase Dashboard:
1. Go to Storage
2. Click `fragrance-images` bucket
3. Verify images are there (should see fragrance-{uuid}-{timestamp}.png files)

## Troubleshooting

### "Missing GEMINI_API_KEY"
```bash
# Verify it's in .env.local
grep GEMINI_API_KEY .env.local

# Restart dev server
# (changes to .env.local require restart)
```

### "Missing SUPABASE_SERVICE_KEY"
```bash
# Get it from Supabase Dashboard
# Settings > API Keys > Service Role (copy the secret key)
# Add to .env.local and restart
```

### "Failed to upload image to Supabase Storage"
Verify bucket is public:
1. Supabase Dashboard > Storage > fragrance-images
2. Settings > Make public (if not already)

### "Gemini API returns error"
1. Check quota: https://aistudio.google.com/app/usage
2. Verify API key has permissions (can generate images)
3. Try again in a few minutes

### Single images work, but batch script fails
Run the retry script:
```bash
node scripts/retry-failed-images.mjs
```

Or retry specific fragrances:
```bash
node scripts/retry-failed-images.mjs \
  "fragrance-id-1" \
  "fragrance-id-2"
```

## Files Created

```
app/api/generate-image/
  └── route.ts                          ← Main API endpoint

supabase/migrations/
  └── 20260530_add_image_url_to_fragrances.sql  ← Database schema

scripts/
  ├── generate-all-images.mjs           ← Batch processor
  └── retry-failed-images.mjs           ← Retry handler

docs/
  └── IMAGE_GENERATION.md               ← Full documentation

SETUP_IMAGE_GENERATION.md               ← This file
```

## Key Code Quality

✅ **Clear variable names** — no abbreviations, descriptive everywhere  
✅ **Comprehensive logging** — each step logged with context  
✅ **Error messages with context** — shows which fragrance, which stage  
✅ **Type safety** — full TypeScript types for requests/responses  
✅ **Production-ready** — proper error handling, retries, timeouts  

## Architecture Summary

```
POST /api/generate-image { fragranceId }
  ↓
1. Fetch fragrance metadata from DB
  ↓
2. Build detailed Gemini prompt from notes/brand
  ↓
3. Call Gemini 2.0 Flash → base64 PNG
  ↓
4. Upload PNG to Supabase Storage → public URL
  ↓
5. Update fragrances.image_url with URL
  ↓
Success response with imageUrl + metadata
```

## Next Steps

1. ✅ Configure `.env.local` with API keys
2. ✅ Apply database migration
3. ✅ Test single image with curl
4. ✅ Run batch script for all 76 fragrances
5. ✅ Verify images in Supabase Storage
6. ✅ Proceed to Sprint 2 (Wire Layering Lab save)

---

**Status:** Ready for testing  
**Estimated cost:** ~$0.30 (76 images × $0.004 per image)  
**Time to complete:** ~15 minutes
