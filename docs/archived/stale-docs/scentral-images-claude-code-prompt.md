# Claude Code Prompt — Fragrance Images

Paste this exactly into Claude Code from your ~/projects/scentral folder.

---

I need to populate the `image_url` column in my Supabase `fragrances` table with real bottle images.

There are 76 fragrances, all with `image_url = null`. The plan:
1. Build a Node.js script that searches Fragrantica for each fragrance
2. Extracts the bottle image URL from the Fragrantica page
3. Downloads the image and uploads it to a Supabase Storage bucket called `fragrance-images`
4. Updates `image_url` in the `fragrances` table with the public Supabase Storage URL
5. Update the fragrance card UI to show the image

## Step 1 — Install dependencies

```bash
npm install node-fetch cheerio @supabase/supabase-js
```

## Step 2 — Create the Supabase Storage bucket

Run this SQL in Supabase dashboard → SQL Editor for project `lrkdwobnemczvhpixpky`:

```sql
-- Create public storage bucket for fragrance images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fragrance-images', 'fragrance-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read fragrance images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fragrance-images');

-- Allow service role to upload
CREATE POLICY "Service role upload fragrance images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fragrance-images');
```

## Step 3 — Create the image scraper script

Create `scripts/fetch-images.mjs` with this exact content:

```javascript
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lrkdwobnemczvhpixpky.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // needs service role key, not anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fragrantica search URL template
function buildSearchUrl(brand, name) {
  const query = encodeURIComponent(`${brand} ${name}`);
  return `https://www.fragrantica.com/search/?query=${query}`;
}

// Known name overrides where our DB name differs from Fragrantica
const FRAGRANTICA_OVERRIDES = {
  'CDN Urban Man Elixir': 'Club de Nuit Urban Man Elixir',
  '9PM Rebel / Elixir': '9PM Rebel',
  'Khamrah / Qahwa': 'Khamrah',
  'Hawas Ice/Tropical': 'Hawas Ice',
  'CK One/Free': 'CK One',
  'Ameer Al Oudh Int.': 'Ameer Al Oudh Intense',
  'Musamam Black Int.': 'Musamam Black Intense',
  'Najdia Intense': 'Najdia',
  'S. Not Only Intense': 'Supremacy Not Only Intense',
};

async function searchFragrantica(brand, name) {
  const searchName = FRAGRANTICA_OVERRIDES[name] || name;
  const url = buildSearchUrl(brand, searchName);
  
  console.log(`  Searching: ${brand} - ${searchName}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!res.ok) {
      console.log(`  ✗ Search failed (${res.status})`);
      return null;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Find first search result link
    const firstResult = $('a[href*="/perfume/"]').first();
    const href = firstResult.attr('href');
    
    if (!href) {
      console.log(`  ✗ No results found`);
      return null;
    }
    
    const fragranceUrl = href.startsWith('http') ? href : `https://www.fragrantica.com${href}`;
    console.log(`  Found page: ${fragranceUrl}`);
    return fragranceUrl;
  } catch (err) {
    console.log(`  ✗ Search error: ${err.message}`);
    return null;
  }
}

async function extractImageUrl(fragrancePageUrl) {
  try {
    const res = await fetch(fragrancePageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!res.ok) return null;
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Fragrantica bottle image is in the main perfume image div
    const img = $('div.fragrance-image img, img[itemprop="image"], .cell.text-center img').first();
    const src = img.attr('src');
    
    if (!src) return null;
    const imageUrl = src.startsWith('http') ? src : `https://www.fragrantica.com${src}`;
    console.log(`  Image: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    console.log(`  ✗ Image extract error: ${err.message}`);
    return null;
  }
}

async function downloadAndUpload(imageUrl, filename) {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.fragrantica.com',
      },
    });
    
    if (!res.ok) {
      console.log(`  ✗ Download failed (${res.status})`);
      return null;
    }
    
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    
    const { error } = await supabase.storage
      .from('fragrance-images')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });
    
    if (error) {
      console.log(`  ✗ Upload error: ${error.message}`);
      return null;
    }
    
    const { data } = supabase.storage
      .from('fragrance-images')
      .getPublicUrl(filename);
    
    return data.publicUrl;
  } catch (err) {
    console.log(`  ✗ Upload error: ${err.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Set SUPABASE_SERVICE_KEY env var before running');
    console.error('Get it from: Supabase dashboard → Settings → API → service_role key');
    process.exit(1);
  }

  // Fetch all fragrances with null image_url
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, image_url')
    .is('image_url', null)
    .order('brand');

  if (error) {
    console.error('Failed to fetch fragrances:', error);
    process.exit(1);
  }

  console.log(`Found ${fragrances.length} fragrances with no image\n`);
  
  const results = { success: 0, failed: 0, skipped: 0 };

  for (const fragrance of fragrances) {
    console.log(`\n[${fragrance.brand}] ${fragrance.name}`);
    
    // 1. Search Fragrantica
    const pageUrl = await searchFragrantica(fragrance.brand, fragrance.name);
    if (!pageUrl) {
      results.failed++;
      continue;
    }
    
    // Be polite — wait between requests
    await sleep(1500);
    
    // 2. Extract image URL from page
    const imageUrl = await extractImageUrl(pageUrl);
    if (!imageUrl) {
      results.failed++;
      continue;
    }
    
    await sleep(1000);
    
    // 3. Download + upload to Supabase Storage
    const filename = `${fragrance.id}.jpg`;
    const publicUrl = await downloadAndUpload(imageUrl, filename);
    if (!publicUrl) {
      results.failed++;
      continue;
    }
    
    // 4. Update image_url in DB
    const { error: updateError } = await supabase
      .from('fragrances')
      .update({ image_url: publicUrl })
      .eq('id', fragrance.id);
    
    if (updateError) {
      console.log(`  ✗ DB update failed: ${updateError.message}`);
      results.failed++;
    } else {
      console.log(`  ✓ Done: ${publicUrl}`);
      results.success++;
    }
    
    // Polite delay between fragrances
    await sleep(2000);
  }

  console.log('\n=== RESULTS ===');
  console.log(`✓ Success: ${results.success}`);
  console.log(`✗ Failed:  ${results.failed}`);
  console.log(`- Skipped: ${results.skipped}`);
  console.log('\nRun the script again to retry any failed ones.');
}

main();
```

## Step 4 — Get your Supabase service role key

Go to: Supabase dashboard → project lrkdwobnemczvhpixpky → Settings → API → copy the `service_role` key (NOT the anon key — service role bypasses RLS for uploads).

## Step 5 — Run the script

```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here node scripts/fetch-images.mjs
```

This will take a few minutes — it processes all 76 fragrances with polite delays between requests. Watch the output — it logs every success and failure.

## Step 6 — Update FragranceCard to show images

In `app/collection/CollectionClient.tsx` (or wherever FragranceCard is defined), update the card to show the image when available:

Find the card component and add an image section at the top of the card, before the header row:

```tsx
{/* Bottle image */}
{f.image_url && (
  <div className="flex justify-center mb-3">
    <img
      src={f.image_url}
      alt={`${f.brand} ${f.name}`}
      className="h-24 w-auto object-contain drop-shadow-lg"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  </div>
)}
```

The `onError` handler hides the image element if it fails to load — graceful fallback for any misses.

## Step 7 — Also update LayeringClient

In `app/layering/LayeringClient.tsx`, find where fragrance list items are rendered and add a small thumbnail:

```tsx
{/* Small thumbnail in search results */}
{f.image_url && (
  <img
    src={f.image_url}
    alt={f.name}
    className="w-8 h-8 object-contain flex-shrink-0"
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
  />
)}
```

## Step 8 — Test and deploy

```bash
npm run dev
```

Check /collection — cards with images should show bottle photos. Cards without images (any misses) should look clean without any broken image icons.

Then deploy:
```bash
npx vercel --prod
```

## Expected misses (manual fix later)

These fragrances may not match on Fragrantica and will need manual image URLs:
- French Avenue fragrances (newer/niche brand, may have limited Fragrantica coverage)
- Bujairami Hectic
- La Fede Intoxicate  
- Risala Elite Epic Onyx
- Maison Asrar fragrances

For manual fixes, find the image on Fragrantica, upload it to Supabase Storage manually, then update the row directly in the Supabase table editor.
