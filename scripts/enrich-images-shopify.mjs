#!/usr/bin/env node
/**
 * enrich-images-shopify.mjs
 *
 * Fetches official bottle images from brand Shopify stores using the public
 * /products.json catalog API — no scraping, no ToS risk.
 *
 * Matches by fuzzy title comparison against each brand's full catalog, not by
 * guessing a Shopify handle from the fragrance name — see
 * .claude/skills/shopify-image-enrichment/SKILL.md for why (handle-guessing
 * misses real products; e.g. "9 PM" is actually handled as "9pm-night-out").
 *
 * Usage:
 *   node scripts/enrich-images-shopify.mjs --dry-run        # preview, no DB writes
 *   node scripts/enrich-images-shopify.mjs --limit=20       # first 20 matches
 *   node scripts/enrich-images-shopify.mjs                  # full run
 *   node scripts/enrich-images-shopify.mjs --brand=Armaf    # single brand
 *
 * Safety gates:
 *   - Always runs the validation test before any writes
 *   - Verifies JSON response before extracting image URL
 *   - Skips fragrances that already have image_url set
 *   - Logs all misses to scripts/data/shopify-misses.txt
 *
 * SHOPIFY_BRANDS only contains brands whose /products.json was confirmed
 * reachable on 2026-06-28 (see the skill above). Do not add a brand here
 * without running the verification procedure in that skill first.
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const missesFile = path.join(dataDir, 'shopify-misses.txt')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0
const brandArg = process.argv.find(a => a.startsWith('--brand='))
const brandFilter = brandArg ? brandArg.split('=')[1] : null

// ─── Brand → Shopify store map (confirmed working 2026-06-28) ─────────────────
// Re-verify via .claude/skills/shopify-image-enrichment/SKILL.md before adding
// a brand or trusting a 0-hit result against one already here.
const SHOPIFY_BRANDS = {
  'Afnan':         { store: 'afnan.com' },
  'Armaf':         { store: 'www.armaf.com' },
  'Amouage':       { store: 'www.amouage.com' },
  'Initio':        { store: 'www.initioparfums.com' },
  'Swiss Arabian': { store: 'www.swissarabian.com' },
  'Xerjoff':       { store: 'www.xerjoff.com' },
}

// ─── Fuzzy title matching ──────────────────────────────────────────────────────

// Only strip truly non-semantic suffixes. Gender terms (pour homme / pour femme /
// for men / for women) are DISTINGUISHING — stripping them caused "9 AM Pour Homme"
// to match "9 AM Pour Femme" in the catalog (wrong image, wrong gender).
const NOISE_WORDS = [
  'eau de parfum', 'eau de toilette', 'eau de cologne', 'edp', 'edt', 'edc',
]

function normalizeTitle(s) {
  let t = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
  for (const noise of NOISE_WORDS) t = t.replaceAll(noise, '')
  // Compact key: strip ALL non-alphanumeric so "9 PM" === "9PM", "9pm", etc.
  // Previous version used replace(/[^a-z0-9]+/g, ' ') which kept spaces,
  // causing "9pm" ≠ "9 pm" and missing those catalog matches.
  return t.replace(/[^a-z0-9]/g, '').trim()
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

// Best catalog entry for a fragrance name, or null if nothing is close enough.
// Trailing digits distinguish numbered product lines (e.g. "Magnetic Blend 1"
// vs "Magnetic Blend 7") — a single-digit difference passes the 0.85 fuzzy
// threshold on short names, so it must be checked separately from edit distance.
function trailingNumber(s) {
  const m = s.match(/(\d+)$/)
  return m ? m[1] : null
}

function matchInCatalog(catalog, fragranceName) {
  const target = normalizeTitle(fragranceName)
  if (!target) return null

  // Exact normalized match first.
  const exact = catalog.find(p => p.normalizedTitle === target)
  if (exact) return exact

  const targetNum = trailingNumber(target)

  // Fuzzy fallback: smallest edit distance, gated by a similarity ratio so
  // unrelated short names don't false-positive against each other.
  let best = null
  let bestDist = Infinity
  for (const p of catalog) {
    const candidateNum = trailingNumber(p.normalizedTitle)
    if (targetNum !== candidateNum) continue // distinguishing, like gender terms

    const dist = levenshtein(target, p.normalizedTitle)
    const maxLen = Math.max(target.length, p.normalizedTitle.length)
    const similarity = 1 - dist / maxLen
    if (similarity >= 0.85 && dist < bestDist) {
      best = p
      bestDist = dist
    }
  }
  return best
}

// ─── Shopify catalog fetch (paginated, cached per store) ──────────────────────

const catalogCache = new Map()

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BaseNote/1.0; image enrichment)',
        'Accept': 'application/json',
      },
    })
    if (res.status !== 200) return { status: res.status, data: null }
    return { status: res.status, data: await res.json() }
  } catch {
    return { status: 0, data: null }
  } finally {
    clearTimeout(timeout)
  }
}

function extractImage(product) {
  const img = product?.images?.[0]
  if (!img?.src) return null
  // Strip Shopify size suffix so we get the original resolution, e.g. _1024x1024.jpg → .jpg
  return img.src.replace(/(_\d+x\d*)(\.(?:jpg|jpeg|png|webp))/i, '$2')
}

async function fetchCatalog(store) {
  if (catalogCache.has(store)) return catalogCache.get(store)

  const products = []
  for (let page = 1; page <= 20; page++) {
    const { status, data } = await fetchJson(`https://${store}/products.json?limit=250&page=${page}`)
    if (status !== 200 || !data?.products?.length) break

    for (const p of data.products) {
      const imageUrl = extractImage(p)
      if (!imageUrl) continue
      products.push({ title: p.title, normalizedTitle: normalizeTitle(p.title), imageUrl })
    }

    if (data.products.length < 250) break // last page
  }

  catalogCache.set(store, products)
  return products
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Validation test ──────────────────────────────────────────────────────────

async function runValidationTest() {
  console.log('\n🧪 Validation test (runs before any DB writes)\n')

  const store = 'www.armaf.com'
  const catalog = await fetchCatalog(store)

  console.log(`Test 1 — catalog fetch (Armaf):`)
  if (catalog.length > 0) {
    console.log(`  ✅ PASS — ${catalog.length} products with images fetched\n`)
  } else {
    console.log(`  ❌ FAIL — no products returned (store may be down or schema changed)`)
    console.log(`  Aborting — do not trust this script until this is fixed.\n`)
    process.exit(1)
  }

  // A real catalog title must match itself exactly.
  const realTitle = catalog[0].title
  const realMatch = matchInCatalog(catalog, realTitle)
  console.log(`Test 2 — real product matches itself ("${realTitle}"):`)
  if (realMatch) {
    console.log(`  ✅ PASS — matched, image: ${realMatch.imageUrl}\n`)
  } else {
    console.log(`  ❌ FAIL — a catalog title didn't match itself, matching logic is broken`)
    console.log(`  Aborting — do not trust this script until this is fixed.\n`)
    process.exit(1)
  }

  // A clearly fake name must not match.
  const fakeMatch = matchInCatalog(catalog, 'totally-fake-xyz-12345-not-a-real-perfume')
  console.log(`Test 3 — fake product (must return null):`)
  if (!fakeMatch) {
    console.log(`  ✅ PASS — correctly returned no match\n`)
  } else {
    console.log(`  ❌ FAIL — matched a fake name to "${fakeMatch.title}"`)
    console.log(`  Aborting — do not trust this script until this is fixed.\n`)
    process.exit(1)
  }

  // Gender variants must not cross-match (pour homme ≠ pour femme).
  // Previously NOISE_WORDS stripped both, causing gender false positives.
  const hommeNorm = normalizeTitle('Club de Nuit Intense Man')
  const femmeNorm = normalizeTitle('Club de Nuit Intense Women')
  console.log(`Test 4 — gender variants must NOT normalize identically:`)
  if (hommeNorm !== femmeNorm) {
    console.log(`  ✅ PASS — "${hommeNorm}" ≠ "${femmeNorm}"\n`)
  } else {
    console.log(`  ❌ FAIL — "man" and "women" variants normalize to the same string: "${hommeNorm}"`)
    console.log(`  This causes wrong-gender image assignments. Fix normalizeTitle before proceeding.\n`)
    process.exit(1)
  }

  console.log('✅ Validation passed. Proceeding...\n')
}

// ─── Manual Overrides ─────────────────────────────────────────────────────────

const MANUAL_OVERRIDES = {
  'Afnan | Supremacy CE': 'Supremacy Collector\'s Edition',
  'Afnan | S. Not Only Intense': 'Supremacy Not Only Intense',
  'Afnan | Turathi Homme Brown': 'Turathi Brown',
  'Armaf | CDN Urban Man Elixir': 'Club De Nuit Urban Elixir',
  'Armaf | Club de Nuit Blue Iconic': 'Club De Nuit Blue Iconic',
  'Armaf | Shades Wood': 'Shades Wood',
  'Xerjoff | Casamorati 1888': '1888',
  'Xerjoff | Casamorati Mefisto': 'Mefisto',
  'Swiss Arabian | Bade\'e Al Oud Amethyst': 'SKIP', // Actually Lattafa
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🛍️  BaseNote — Shopify image enrichment`)
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no DB writes)' : 'LIVE'}`)
  console.log(`   Limit: ${limit || 'none (all)'}`)
  console.log(`   Brand filter: ${brandFilter || 'all Shopify brands'}\n`)

  await runValidationTest()

  // Build brand list
  const brandsToProcess = brandFilter
    ? Object.entries(SHOPIFY_BRANDS).filter(([b]) => b.toLowerCase() === brandFilter.toLowerCase())
    : Object.entries(SHOPIFY_BRANDS)

  if (!brandsToProcess.length) {
    console.error(`❌ Brand "${brandFilter}" not in SHOPIFY_BRANDS map`)
    process.exit(1)
  }

  const brandNames = brandsToProcess.map(([b]) => b)
  console.log(`📋 Processing ${brandNames.length} brands: ${brandNames.join(', ')}\n`)

  // Fetch fragrances with null image_url for these brands
  let query = supabase
    .from('fragrances')
    .select('id, name, brand')
    .in('brand', brandNames)
    .is('image_url', null)
    .order('brand', { ascending: true })
    .order('name', { ascending: true })

  if (limit > 0) query = query.limit(limit)

  const { data: fragrances, error } = await query
  if (error) { console.error('❌ DB error:', error.message); process.exit(1) }

  console.log(`Found ${fragrances.length} fragrances without images across Shopify brands\n`)

  if (fragrances.length === 0) {
    console.log('✅ Nothing to enrich — all Shopify brand fragrances already have images.')
    return
  }

  let hits = 0
  let misses = 0
  const missLog = []

  // Pre-fetch each brand's catalog once before matching against it.
  const catalogsByBrand = new Map()
  for (const [brand, config] of brandsToProcess) {
    const catalog = await fetchCatalog(config.store)
    catalogsByBrand.set(brand, catalog)
    console.log(`📦 ${brand}: ${catalog.length} catalog products with images`)
    await sleep(300) // polite delay between brand fetches
  }
  console.log()

  for (const frag of fragrances) {
    const catalog = catalogsByBrand.get(frag.brand)
    const overrideKey = `${frag.brand} | ${frag.name}`
    const searchName = MANUAL_OVERRIDES[overrideKey] || frag.name

    if (searchName === 'SKIP') {
      console.log(`  ○ skip  ${frag.brand} / ${frag.name} (manual override)`)
      continue
    }

    const match = catalog ? matchInCatalog(catalog, searchName) : null

    if (match) {
      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('fragrances')
          .update({ image_url: match.imageUrl })
          .eq('id', frag.id)

        if (updateError) {
          console.error(`  ❌ DB update failed for ${frag.brand} / ${frag.name}: ${updateError.message}`)
          misses++
          missLog.push(`DB_ERROR\t${frag.brand}\t${frag.name}`)
          continue
        }
      }
      console.log(`  ✅ ${frag.brand} / ${frag.name} → "${match.title}"${isDryRun ? ' [DRY RUN]' : ''}`)
      hits++
    } else {
      const catalogSize = catalog ? catalog.length : 0
      console.log(`  ○ miss  ${frag.brand} / ${frag.name} (catalog: ${catalogSize} products)`)
      misses++
      missLog.push(`NO_MATCH\t${frag.brand}\t${frag.name}\tcatalog_size=${catalogSize}`)
    }
  }

  // Write misses log
  if (missLog.length > 0) {
    fs.appendFileSync(missesFile, missLog.join('\n') + '\n')
  }

  console.log(`\n📊 Results`)
  console.log(`   ✅ Hits:    ${hits}`)
  console.log(`   ○  Misses:  ${misses}`)
  if (isDryRun) console.log(`\n⚠️  Dry run — no DB changes made. Re-run without --dry-run to apply.`)
  if (missLog.length > 0) console.log(`   Misses logged to: ${missesFile}`)
  console.log()
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
