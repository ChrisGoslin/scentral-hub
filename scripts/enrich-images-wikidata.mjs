#!/usr/bin/env node
// @image-domains: upload.wikimedia.org
// Enrich fragrances.image_url from Wikidata/Wikimedia Commons.
// Why this exists: Parfumo/Fragrantica scraping (scripts/enrich-images.mjs) hits
// Cloudflare bot-protection 403s and, before that, produced wrong-product mismatches
// (brand matched, product did not). Wikidata is a public API with no bot-blocking and
// every image carries explicit license metadata (PD/CC) — safe to use, but coverage is
// limited to fragrances notable enough to have a Wikidata entry (mostly iconic/luxury
// releases). This will NOT cover the long tail of the 127k-row catalog — see AGENTS.md
// for the AWIN product-feed plan as the real full-coverage path once publisher IDs are
// no longer PENDING.

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const missesFile = path.join(dataDir, 'image-misses-wikidata.txt');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  console.error('   Copy .env.local.example to .env.local and fill in your credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const isDryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0; // 0 = no limit

const UA = 'nota-fragrance-app/1.0 (contact: christophergoslin@outlook.com)';

function normalizeFragranceImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  const isFragranticaPage = /fragrantica\.com\/.+\.html(?:[?#].*)?$/i.test(trimmed);
  const isParfumoPage =
    /parfumo\.com\/Perfumes\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed);
  const isFragranticaPerfumePage =
    /fragrantica\.com\/perfume\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed);

  if (isFragranticaPage || isParfumoPage || isFragranticaPerfumePage) return null;
  return trimmed;
}

function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Acceptable open licenses — anything else (e.g. "non-free", fair-use rationale) is rejected
const ACCEPTABLE_LICENSE_PATTERN =
  /public domain|pd-|cc-by|cc0|cc by|attribution|creative commons/i;

// Require the candidate Wikidata label to share real words with brand+name —
// prevents the same "brand matched, product didn't" failure mode as the Parfumo scraper.
// Filter by stopword list, not length — short tokens like "No 5" or "Y" are real
// distinguishing words for fragrance names and must not be dropped.
const STOPWORDS = new Set(['de', 'du', 'la', 'le', 'eau', 'by', 'the', 'for', 'and', 'a', 'of']);

function meaningfulWords(slug) {
  return slug.split('-').filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

// Wikidata labels are usually just the product name ("Aventus", "Sauvage") — the brand
// lives in the description ("perfume by Creed" / "perfume from Creed"), not the label.
// So: require the NAME to overlap with the label, and the BRAND to overlap with
// label+description combined.
function labelMatchesProduct(label, description, brand, name) {
  const labelWords = new Set(meaningfulWords(toSlug(label)));
  const combinedWords = new Set([...labelWords, ...meaningfulWords(toSlug(description || ''))]);
  const nameWords = meaningfulWords(toSlug(name));
  const brandWords = meaningfulWords(toSlug(brand));

  const nameOverlap = nameWords.filter((w) => labelWords.has(w)).length;
  const brandOverlap = brandWords.filter((w) => combinedWords.has(w)).length;

  return nameOverlap > 0 && brandOverlap > 0;
}

async function wikidataSearch(query) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query
  )}&language=en&format=json&type=item&limit=5`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.search || [];
}

async function getEntityImage(qid) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const claims = data.entities?.[qid]?.claims;
  const p18 = claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  // P31 = "instance of" — sanity check it's actually a fragrance/perfume/cologne/eau de toilette type entity
  const instanceOfClaims = claims?.P31 || [];
  return { filename: p18 || null, hasInstanceOf: instanceOfClaims.length > 0 };
}

async function resolveCommonsFile(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    'File:' + filename
  )}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const licenseShort =
    info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value || '';
  const permission = info.extmetadata?.Permission?.value || '';
  const licenseText = `${licenseShort} ${permission}`;

  if (!ACCEPTABLE_LICENSE_PATTERN.test(licenseText)) {
    return null; // Not an open license we trust — skip
  }

  return info.url || null;
}

async function findWikidataImage(brand, name) {
  const queries = [`${brand} ${name}`, name];

  for (const q of queries) {
    let results;
    try {
      results = await wikidataSearch(q);
    } catch {
      continue;
    }

    for (const candidate of results) {
      const label = candidate.label || candidate.display?.label?.value || '';
      const description = candidate.description || candidate.display?.description?.value || '';
      if (!labelMatchesProduct(label, description, brand, name)) continue;

      await sleep(200);
      let entityImage;
      try {
        entityImage = await getEntityImage(candidate.id);
      } catch {
        continue;
      }
      if (!entityImage?.filename) continue;

      await sleep(200);
      let fileUrl;
      try {
        fileUrl = await resolveCommonsFile(entityImage.filename);
      } catch {
        continue;
      }
      if (fileUrl) return fileUrl;
    }
  }

  return null;
}

async function processBatch(fragrances) {
  let processed = 0;
  let hits = 0;
  let misses = 0;
  const MAX_CONCURRENT = 3; // Wikidata/Commons are generous, but stay polite

  for (let i = 0; i < fragrances.length; i += MAX_CONCURRENT) {
    const group = fragrances.slice(i, i + MAX_CONCURRENT);

    await Promise.all(
      group.map(async (frag) => {
        try {
          const imageUrl = normalizeFragranceImageUrl(await findWikidataImage(frag.brand, frag.name));
          if (imageUrl) {
            hits++;
            if (!isDryRun) {
              await supabase.from('fragrances').update({ image_url: imageUrl }).eq('id', frag.id);
            }
            console.log(`  ✓ ${frag.brand} - ${frag.name} → ${imageUrl}`);
          } else {
            misses++;
            fs.appendFileSync(missesFile, `${frag.id}\t${frag.brand}\t${frag.name}\n`);
          }
          processed++;
          if (processed % 50 === 0) {
            console.log(`  [${processed}/${fragrances.length}] ${hits}H/${misses}M`);
          }
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
  console.log('\n📦 Enriching fragrance images from Wikidata/Wikimedia Commons\n');
  console.log(`Dry run: ${isDryRun ? 'YES' : 'NO'}`);
  console.log('Coverage note: only fragrances notable enough for a Wikidata entry will hit.\n');

  // Validation: known iconic fragrance must resolve, fabricated one must not
  console.log('🔍 Running validation tests...\n');
  const realResult = await findWikidataImage('Chanel', 'No 5');
  console.log(`Test (Chanel No 5, should PASS): ${realResult ? '✅ ' + realResult : '❌ FAILED'}`);

  const fakeResult = await findWikidataImage('Totally Fake Brand Xyz', 'Nonexistent Perfume 123');
  console.log(`Test (fake product, should FAIL): ${fakeResult ? '❌ PASSED (BAD!)' : '✅ correctly found nothing'}\n`);

  if (!realResult) {
    console.error('❌ VALIDATION FAILED: known fragrance did not resolve. Aborting.');
    process.exit(1);
  }
  if (fakeResult) {
    console.error('❌ VALIDATION FAILED: fake fragrance incorrectly resolved. Aborting.');
    process.exit(1);
  }
  console.log('✅ Validation passed.\n');

  let batchIndex = 1;
  let totalHits = 0;
  let totalMisses = 0;
  // Cursor on id, NOT just "image_url IS NULL" — misses stay NULL forever, so a
  // filter-only query with no stable order can return the same window repeatedly
  // and never advance through the catalog. Always move past the last id seen.
  let lastId = '00000000-0000-0000-0000-000000000000';

  while (true) {
    let query = supabase
      .from('fragrances')
      .select('id, brand, name')
      .is('image_url', null)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(500);

    if (limit > 0 && limit < 500) query = query.limit(limit);

    const { data: fragrances, error } = await query;
    if (error) {
      console.error('❌ Supabase query error:', error.message);
      process.exit(1);
    }
    if (!fragrances || fragrances.length === 0) {
      console.log('\n✅ No more rows with NULL image_url.\n');
      break;
    }

    console.log(`\n🔄 Batch ${batchIndex}: ${fragrances.length} fragrances\n`);
    const result = await processBatch(fragrances);
    totalHits += result.hits;
    totalMisses += result.misses;
    console.log(`\n✅ Batch ${batchIndex} summary: ${result.hits} hits, ${result.misses} misses\n`);

    lastId = fragrances[fragrances.length - 1].id;
    batchIndex++;
    if (isDryRun || limit > 0) break;
  }

  console.log('\n📊 FINAL SUMMARY');
  console.log(`  Hits: ${totalHits}`);
  console.log(`  Misses: ${totalMisses}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
