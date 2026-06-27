#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local first
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const missesFile = path.join(dataDir, 'image-misses.txt');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local'
  );
  console.error('   Copy .env.local.example to .env.local and fill in your credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const isDryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0; // 0 = no limit (process all null rows)

// Normalize name to slug: lowercase, handle accents, replace non-alphanumeric with hyphen
function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

// GET request that follows redirects and validates the final URL
// Returns the final URL if valid, null if not
async function findValidUrl(url, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // Follow redirects automatically
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Referer: 'https://www.parfumo.com',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Check final URL for soft-404s
      if (response.status === 200) {
        const finalUrl = response.url;
        if (finalUrl.includes('/404')) {
          return null; // Soft-404 detected
        }
        return finalUrl; // Return the final (redirected) URL
      }

      // Any other status (404, 403, 500, etc.) → doesn't exist
      return null;
    } catch (err) {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Retry delay
        continue;
      }
      return null;
    }
  }
  return null;
}

// Try Parfumo, then Fragrantica — returns final URL if found (no soft-404)
async function findImageUrl(brand, name) {
  const brandSlug = toSlug(brand);
  const nameSlug = toSlug(name);

  // Try Parfumo
  const parfumoUrl = `https://www.parfumo.com/Perfumes/${brandSlug}/${nameSlug}`;
  const parfumoResult = await findValidUrl(parfumoUrl);
  if (parfumoResult) {
    return parfumoResult; // Valid: not a soft-404
  }

  // Try Fragrantica
  const fragranticaUrl = `https://www.fragrantica.com/perfume/${brandSlug}/${nameSlug}.html`;
  const fragranticaResult = await findValidUrl(fragranticaUrl);
  if (fragranticaResult) {
    return fragranticaResult; // Valid: not a soft-404
  }

  return null; // No valid URL found
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process fragrances with 6 concurrent workers for speed
async function processBatch(fragrances, batchIndex) {
  let processed = 0;
  let hits = 0;
  let misses = 0;
  const MAX_CONCURRENT = 6;

  // Process in concurrent groups
  for (let i = 0; i < fragrances.length; i += MAX_CONCURRENT) {
    const group = fragrances.slice(i, i + MAX_CONCURRENT);

    await Promise.all(
      group.map(async (frag) => {
        try {
          const imageUrl = await findImageUrl(frag.brand, frag.name);
          if (imageUrl) {
            hits++;
            if (!isDryRun) {
              await supabase.from('fragrances').update({ image_url: imageUrl }).eq('id', frag.id);
            }
            console.log(`  ✓ ${frag.brand} - ${frag.name} → ${imageUrl}`);
          } else {
            misses++;
            const missEntry = `${frag.id}\t${frag.brand}\t${frag.name}`;
            fs.appendFileSync(missesFile, missEntry + '\n');
          }
          processed++;
          if (processed % 50 === 0) {
            console.log(`  [${processed}/${fragrances.length}] ${hits}H/${misses}M`);
          }
          await sleep(800);
        } catch (err) {
          console.error(`  ERROR processing ${frag.name}:`, err.message);
          misses++;
          processed++;
        }
      })
    );
  }

  return { processed, hits, misses };
}

async function main() {
  console.log(`\n📦 Enriching fragrance images (Parfumo → Fragrantica)\n`);
  console.log(`Dry run: ${isDryRun ? 'YES' : 'NO'}`);
  console.log(`Batch limit: ${limit}`);
  console.log(`\n`);

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE — no DB writes, showing output only\n');
  }

  // Validation tests before any DB writes
  console.log('🔍 Running validation tests on URL detection...\n');

  const fakeUrl = 'https://www.parfumo.com/Perfumes/totally-fake-xyz/fake-perfume-123';
  const realUrl = 'https://www.parfumo.com/Perfumes/Lattafa/Asad';

  const fakeResult = await findValidUrl(fakeUrl);
  const realResult = await findValidUrl(realUrl);

  console.log(`Test 1 (fake URL should FAIL):\n  Input: ${fakeUrl}`);
  console.log(`  Result: ${fakeResult ? '❌ PASSED (BAD!)' : '✅ FAILED (correct)'}\n`);

  console.log(`Test 2 (real URL should PASS & redirect):\n  Input: ${realUrl}`);
  if (realResult) {
    console.log(`  Result: ✅ PASSED (correct)\n  Final URL: ${realResult}\n`);
  } else {
    console.log(`  Result: ❌ FAILED (BAD!)\n`);
  }

  if (fakeResult) {
    console.error('❌ VALIDATION FAILED: Fake URL incorrectly passed validation.');
    console.error('   URL validation logic is still broken. Do not proceed with enrichment.');
    process.exit(1);
  }

  if (!realResult) {
    console.error('❌ VALIDATION FAILED: Real URL incorrectly failed validation.');
    console.error('   URL validation logic is broken. Do not proceed with enrichment.');
    process.exit(1);
  }

  console.log('✅ Validation passed! Proceeding with enrichment.\n');

  let batchIndex = 1;
  let totalProcessed = 0;
  let totalHits = 0;
  let totalMisses = 0;

  while (true) {
    // Query fragrances WHERE image_url IS NULL, curated first, 2000 at a time
    let query = supabase
      .from('fragrances')
      .select('id, brand, name')
      .is('image_url', null)
      .order('phase', { ascending: false, nullsLast: true })
      .limit(2000); // Batch size: 2000 (was unlimited)

    if (limit > 0 && limit < 2000) query = query.limit(limit); // Override for --limit=N

    const { data: fragrances, error } = await query;

    if (error) {
      console.error('❌ Error querying Supabase:', error.message);
      process.exit(1);
    }

    if (!fragrances || fragrances.length === 0) {
      console.log(`\n✅ All fragrances processed (no more NULL image_urls found)\n`);
      break;
    }

    console.log(`\n🔄 Batch ${batchIndex}: ${fragrances.length} fragrances\n`);

    const result = await processBatch(fragrances, batchIndex);
    totalProcessed += result.processed;
    totalHits += result.hits;
    totalMisses += result.misses;

    console.log(
      `\n✅ Batch ${batchIndex} summary: ${result.hits} hits, ${result.misses} misses\n`
    );

    batchIndex++;

    // Stop after first batch in dry-run mode
    if (isDryRun) {
      console.log(`\n📋 Dry run complete. Sample processed. Ready for full run.\n`);
      break;
    }
  }

  console.log(`\n📊 FINAL SUMMARY`);
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Hits: ${totalHits}`);
  console.log(`  Misses: ${totalMisses}`);
  if (fs.existsSync(missesFile)) {
    const missCount = fs.readFileSync(missesFile, 'utf-8').split('\n').filter(Boolean).length;
    console.log(`  Miss log: ${missesFile} (${missCount} entries)`);
  }
  console.log(`\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
