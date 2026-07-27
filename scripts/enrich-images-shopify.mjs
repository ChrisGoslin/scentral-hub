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
 *   node scripts/enrich-images-shopify.mjs --retailer=Scentoria --dry-run --limit=5
 *
 * Two store types:
 *   SHOPIFY_BRANDS   — official single-brand stores; the whole catalog belongs
 *                      to one brand, so matching is name-only.
 *   RETAILER_STORES  — multi-brand retailers (--retailer=<name>); every product
 *                      carries a `vendor` field, so matching requires normalised
 *                      brand AND name to agree. Retailer misses go to
 *                      scripts/data/image-misses.txt.
 *
 * Safety gates:
 *   - Always runs the validation test before any writes
 *   - Verifies JSON response before extracting image URL
 *   - Skips fragrances that already have image_url set (only fills NULL,
 *     never overwrites; writes image_url ONLY — never descriptions or prices)
 *   - Logs all misses to scripts/data/shopify-misses.txt (brand mode) /
 *     scripts/data/image-misses.txt (retailer mode)
 *
 * SHOPIFY_BRANDS / RETAILER_STORES only contain stores whose /products.json was
 * confirmed reachable (see the skill above). Do not add a store here without
 * running the verification procedure in that skill first.
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
const imageMissesFile = path.join(dataDir, 'image-misses.txt')

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
const retailerArg = process.argv.find(a => a.startsWith('--retailer='))
const retailerFilter = retailerArg ? retailerArg.split('=')[1] : null
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i

// ─── Brand → Shopify store map (confirmed working 2026-06-28) ─────────────────
// Re-verify via .claude/skills/shopify-image-enrichment/SKILL.md curl procedure
// before adding ANY new brand. Not all brand sites run Shopify:
//   ❌ Lattafa — www.lattafa.com → WordPress (301 to HTML, not JSON). Do not add.
//   ❌ Montale — removed (failed verification)
//   ? Mancera, Rasasi, Khadlaj, Parfums de Marly — unverified, run curl check first
const SHOPIFY_BRANDS = {
  'Afnan':         { store: 'afnan.com' },
  'Armaf':         { store: 'www.armaf.com' },
  'Amouage':       { store: 'www.amouage.com' },
  'Initio':        { store: 'www.initioparfums.com' },
  'Swiss Arabian': { store: 'www.swissarabian.com' },
  'Xerjoff':       { store: 'www.xerjoff.com' },
}

// ─── Multi-brand retailer stores (--retailer=<name>) ──────────────────────────
// Verified per the skill procedure before being added. Retailers stock many
// brands, so every catalog product's `vendor` field must match the DB brand
// (normalised, via BRAND_ALIASES) before name matching is even attempted.
//
// Scentoria (verified 2026-07-04): genuine-goods decant/tester reseller in
// India — 5,000+ products, 352 vendors, all images on cdn.shopify.com.
// ~24% of its images are hand-taken phone photos of partially used bottles
// (filenames like IMG_4461-Photoroom.png), unusable as catalog imagery —
// skipImage filters those out. Titles containing "Partial" are used bottles;
// skipTitle drops them plus non-perfume products (deodorants, gift sets, …).
const RETAILER_STORES = {
  'Scentoria': {
    store: 'scentoria.co.in',
    skipTitle: /\b(partial|tester|vintage|batch|gift set|discovery set|sample set|sampler|deodorant|shower gel|body lotion|body cream|beard oil|mencare|candle|refill)\b/i,
    skipImage: /(IMG_\d+|\d{8}_\d{6}|Photoroom|WhatsApp|Screenshot|PXL_)/i,
    // Real listings this store publishes that the filters MUST exclude —
    // validation aborts before any DB write if either stops matching.
    skipTitleFixture: 'Bleu De Chanel EDP Partial',
    skipImageFixture: 'IMG_4461-Photoroom.png',
  },
  // Les Senteurs (verified 2026-07-04): long-established London niche perfumery.
  // 1,048 products, 55 genuine brand vendors, authentic GBP pricing, boutique
  // imagery on cdn.shopify.com. 283 "Free Sample" and 51 tester listings are
  // dropped by skipTitle. ~1/3 of products carry no image (extractImage skips).
  // Rejected candidate from the same sweep: roullierwhite.com — vendor field
  // holds distributors/categories ("Perfume Playground", "KGA"), real brand is
  // embedded in the title, so vendor-based brand matching cannot work there.
  'LesSenteurs': {
    store: 'www.lessenteurs.com',
    skipTitle: /\b(sample|tester|gift with purchase|gift set|discovery|candle|diffuser|home spray|room spray|soap|shower|body|lotion|hand cream)\b/i,
    skipImage: /(IMG_\d+|\d{8}_\d{6}|Photoroom|WhatsApp|Screenshot|PXL_)/i,
    skipTitleFixture: 'Néroli Hasbaya Free Sample',
    skipImageFixture: 'IMG_0001-Photoroom.png',
  },
}

// DB brand spellings vs retailer vendor names diverge for a few big houses
// (verified against the DB 2026-07-04: DB has "Dior"/"Christian Dior"/"dior",
// "Yves Saint Laurent", "Maison Francis Kurkdjian"/"maison-francis-kurkdjian").
// Keys and values are normalizeBrand() output; both sides of a comparison are
// mapped through this, so either spelling matches the other.
const BRAND_ALIASES = {
  christiandior: 'dior',
  ysl: 'yvessaintlaurent',
  mfk: 'maisonfranciskurkdjian',
  // Les Senteurs vendors vs DB spellings (verified against the DB 2026-07-04)
  kilianparis: 'kilian',
  bykilian: 'kilian',
  editionsdeparfumsfredericmalle: 'fredericmalle',
  jamesheeley: 'heeley',
}

function normalizeBrand(s) {
  const key = (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return BRAND_ALIASES[key] || key
}

// Retailer catalog titles often embed the brand ("Azzaro Pour Homme EDT") while
// DB names may or may not ("Azzaro Pour Homme" vs "Pour Homme"). Stripping the
// brand as a prefix/suffix from BOTH sides makes the comparison consistent
// without risking mid-string damage ("Miss Dior" keeps its stem either way).
function stripBrandAffix(normTitle, brandKey) {
  if (!brandKey) return normTitle
  let t = normTitle
  while (t.length > brandKey.length && t.startsWith(brandKey)) t = t.slice(brandKey.length)
  while (t.length > brandKey.length && t.endsWith(brandKey)) t = t.slice(0, -brandKey.length)
  return t || normTitle
}

// ─── Fuzzy title matching ──────────────────────────────────────────────────────

// Only strip truly non-semantic suffixes. Gender terms (pour homme / pour femme /
// for men / for women) are DISTINGUISHING — stripping them caused "9 AM Pour Homme"
// to match "9 AM Pour Femme" in the catalog (wrong image, wrong gender).
//
// Brand name suffixes: some Shopify stores embed the brand name mid-title, e.g.
//   Armaf store: "Club De Nuit Intense Man Armaf Eau De Parfum"
//   Swiss Arabian store: "Shaghaf Oud Swiss Arabian Eau De Parfum"
// These must be stripped so they match our DB names ("Club De Nuit Intense Man").
// Year suffixes like "Armaf 2012" are handled by the alphanumeric strip below
// since year digits alone won't fuzzy-match to a different fragrance.
const NOISE_WORDS = [
  'eau de parfum', 'eau de toilette', 'eau de cologne', 'edp', 'edt', 'edc',
  // Brand name suffixes embedded in Shopify catalog titles (verified 2026-06-28)
  'armaf', 'swiss arabian',
  // Format suffixes that aren't the fragrance name
  'body spray', 'hair mist', 'perfume oil', 'parfum oil',
]

function normalizeTitle(s) {
  let t = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
  for (const noise of NOISE_WORDS) t = t.replaceAll(noise, '')
  // Strip 4-digit years (e.g. "Armaf 2012 Eau De Parfum" → don't want "2012" in key).
  // Year suffixes appear in Armaf Shopify titles as edition markers, not fragrance names.
  // Guard: only strip years in the range 1900–2099, not arbitrary 4-digit numbers that
  // might be part of a fragrance name (e.g. "Oud 1000" should NOT be stripped).
  t = t.replace(/\b(19|20)\d{2}\b/g, '')
  // Compact key: strip ALL non-alphanumeric so "9 PM" === "9PM", "9pm", etc.
  // Previous version used replace(/[^a-z0-9]+/g, ' ') which kept spaces,
  // causing "9pm" ≠ "9 pm" and missing those catalog matches.
  return t.replace(/[^a-z0-9]/g, '').trim()
}

function normalizeFragranceImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string') return null
  const trimmed = imageUrl.trim()
  if (!trimmed) return null

  const isFragranticaPage = /fragrantica\.com\/.+\.html(?:[?#].*)?$/i.test(trimmed)
  const isParfumoPage =
    /parfumo\.com\/Perfumes\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed)
  const isFragranticaPerfumePage =
    /fragrantica\.com\/perfume\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed)

  if (isFragranticaPage || isParfumoPage || isFragranticaPerfumePage) return null
  return trimmed
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

// NOISE_WORDS strips edp/edt/edc before matching, so "J'adore EDP" and
// "J'adore EDT" normalise identically. That's deliberate (the flacon is
// usually near-identical, and requiring equality would tank the hit rate),
// but when the catalog stocks BOTH concentrations we should hand back the
// right one. extractConcentration reads the RAW title, and matchInCatalog
// prefers a same-concentration candidate among otherwise-equal matches.
function extractConcentration(rawTitle) {
  const t = rawTitle.toLowerCase()
  if (/\beau de parfum\b|\bedp\b/.test(t)) return 'edp'
  if (/\beau de toilette\b|\bedt\b/.test(t)) return 'edt'
  if (/\beau de cologne\b|\bedc\b/.test(t)) return 'edc'
  return null
}

// brandKey (retailer mode only): strip the brand affix from the target after
// normalisation, mirroring how retailer catalog entries were indexed. Brand
// mode passes no brandKey and behaves exactly as before.
function matchInCatalog(catalog, fragranceName, brandKey = null) {
  let target = normalizeTitle(fragranceName)
  if (brandKey) target = stripBrandAffix(target, brandKey)
  if (!target) return null

  const targetConc = extractConcentration(fragranceName)
  const concMatches = p => targetConc !== null && extractConcentration(p.title) === targetConc

  // Exact normalized match first — preferring the same concentration when
  // the catalog stocks several (EDP vs EDT vs EDC of the same name).
  const exacts = catalog.filter(p => p.normalizedTitle === target)
  if (exacts.length) return exacts.find(concMatches) || exacts[0]

  const targetNum = trailingNumber(target)

  // Fuzzy fallback: smallest edit distance, gated by a similarity ratio so
  // unrelated short names don't false-positive against each other. Equal
  // distances tie-break on concentration.
  let best = null
  let bestDist = Infinity
  for (const p of catalog) {
    const candidateNum = trailingNumber(p.normalizedTitle)
    if (targetNum !== candidateNum) continue // distinguishing, like gender terms

    const dist = levenshtein(target, p.normalizedTitle)
    const maxLen = Math.max(target.length, p.normalizedTitle.length)
    const similarity = 1 - dist / maxLen
    if (similarity >= 0.85 && (dist < bestDist || (dist === bestDist && best && concMatches(p) && !concMatches(best)))) {
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
        'User-Agent': 'Mozilla/5.0 (compatible; nota./1.0; image enrichment)',
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

// Fetch a multi-brand retailer catalog and index it by normalised vendor.
// Returns Map<brandKey, [{title, vendor, normalizedTitle, imageUrl}]> where
// normalizedTitle is already brand-affix-stripped, so matchInCatalog can be
// reused unchanged (pass it a brand-stripped target).
const RETAILER_PAGE_CAP = 40 // 40 × 250 = 10,000 products

async function fetchRetailerCatalog(config) {
  const byVendor = new Map()
  let pages = 0
  let kept = 0
  let skippedTitle = 0
  let skippedImage = 0

  for (let page = 1; page <= RETAILER_PAGE_CAP; page++) {
    const { status, data } = await fetchJson(`https://${config.store}/products.json?limit=250&page=${page}`)
    if (status !== 200 || !data?.products?.length) break
    pages = page

    for (const p of data.products) {
      if (config.skipTitle?.test(p.title)) { skippedTitle++; continue }
      const imageUrl = extractImage(p)
      if (!imageUrl) continue
      const filename = imageUrl.split('/').pop()
      if (config.skipImage?.test(filename)) { skippedImage++; continue }

      const brandKey = normalizeBrand(p.vendor)
      if (!brandKey) continue
      const entry = {
        title: p.title,
        vendor: p.vendor,
        normalizedTitle: stripBrandAffix(normalizeTitle(p.title), brandKey),
        imageUrl,
      }
      if (!byVendor.has(brandKey)) byVendor.set(brandKey, [])
      byVendor.get(brandKey).push(entry)
      kept++
    }

    if (data.products.length < 250) break
    await sleep(400) // polite delay between pages
  }

  if (pages === RETAILER_PAGE_CAP) {
    console.log(`  ⚠️  Hit the ${RETAILER_PAGE_CAP}-page cap — catalog may be larger than what was fetched.`)
  }
  console.log(`  📦 ${config.store}: ${pages} pages, ${kept} usable products across ${byVendor.size} vendors`)
  console.log(`     (skipped ${skippedTitle} by title filter, ${skippedImage} phone-photo images)`)
  return byVendor
}

// ─── Validation test ──────────────────────────────────────────────────────────

// Pure-logic test shared by brand and retailer validation: when a catalog
// stocks both concentrations of a name, the matching one must win.
function concentrationPreferenceOk() {
  const synth = [
    { title: "J'adore EDT", normalizedTitle: normalizeTitle("J'adore EDT"), imageUrl: 'edt.jpg' },
    { title: "J'adore EDP", normalizedTitle: normalizeTitle("J'adore EDP"), imageUrl: 'edp.jpg' },
  ]
  const edp = matchInCatalog(synth, "J'adore Eau De Parfum")
  const edt = matchInCatalog(synth, "J'adore Eau De Toilette")
  const bare = matchInCatalog(synth, "J'adore") // no concentration → any match is fine
  return edp?.imageUrl === 'edp.jpg' && edt?.imageUrl === 'edt.jpg' && !!bare
}

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

  console.log(`Test 5 — concentration preference (EDP must not take the EDT image when both exist):`)
  if (concentrationPreferenceOk()) {
    console.log(`  ✅ PASS — same-concentration candidate preferred\n`)
  } else {
    console.log(`  ❌ FAIL — concentration preference broken in matchInCatalog`)
    console.log(`  Aborting — do not trust this script until this is fixed.\n`)
    process.exit(1)
  }

  console.log('✅ Validation passed. Proceeding...\n')
}

// ─── Retailer validation test ─────────────────────────────────────────────────

function runRetailerValidationTest(retailerName, config, byVendor) {
  console.log(`\n🧪 Retailer validation test — ${retailerName} (runs before any DB writes)\n`)

  const fail = (msg) => {
    console.log(`  ❌ FAIL — ${msg}`)
    console.log(`  Aborting — do not trust this script until this is fixed.\n`)
    process.exit(1)
  }

  console.log('Test 1 — catalog fetch returned multiple vendors:')
  if (byVendor.size < 2) fail(`only ${byVendor.size} vendor(s) — not a multi-brand catalog, or vendor field missing`)
  console.log(`  ✅ PASS — ${byVendor.size} vendors indexed\n`)

  const [someBrandKey, someProducts] = [...byVendor.entries()].find(([, v]) => v.length > 0)
  const real = someProducts[0]
  console.log(`Test 2 — real product matches itself within its vendor ("${real.vendor}" / "${real.title}"):`)
  const realMatch = matchInCatalog(someProducts, real.title, someBrandKey)
  if (!realMatch) fail('a catalog title didn\'t match itself, matching logic is broken')
  console.log(`  ✅ PASS — matched, image: ${realMatch.imageUrl.slice(0, 80)}…\n`)

  console.log('Test 3 — fake product (must return null):')
  const fakeMatch = matchInCatalog(someProducts, 'totally-fake-xyz-12345-not-a-real-perfume')
  if (fakeMatch) fail(`matched a fake name to "${fakeMatch.title}"`)
  console.log('  ✅ PASS — correctly returned no match\n')

  console.log('Test 4 — retailer-specific unwanted titles are filtered:')
  if (config.skipTitle && config.skipTitleFixture && !config.skipTitle.test(config.skipTitleFixture)) {
    fail(`skipTitle did not exclude fixture "${config.skipTitleFixture}"`)
  }
  console.log(`  ✅ PASS — "${config.skipTitleFixture || 'n/a'}" excluded\n`)

  console.log('Test 5 — unwanted image filenames are filtered:')
  if (config.skipImage && config.skipImageFixture && !config.skipImage.test(config.skipImageFixture)) {
    fail(`skipImage did not exclude fixture "${config.skipImageFixture}"`)
  }
  console.log(`  ✅ PASS — "${config.skipImageFixture || 'n/a'}" excluded\n`)

  console.log('Test 6 — concentration preference (EDP must not take the EDT image when both exist):')
  if (!concentrationPreferenceOk()) fail('concentration preference broken in matchInCatalog')
  console.log('  ✅ PASS — same-concentration candidate preferred\n')

  console.log('✅ Retailer validation passed. Proceeding...\n')
}

// ─── Retailer mode (--retailer=<name>) ────────────────────────────────────────

async function runRetailerMode() {
  const entry = Object.entries(RETAILER_STORES)
    .find(([name]) => name.toLowerCase() === retailerFilter.toLowerCase())
  if (!entry) {
    console.error(`❌ Retailer "${retailerFilter}" not in RETAILER_STORES map`)
    console.error(`   Known retailers: ${Object.keys(RETAILER_STORES).join(', ')}`)
    process.exit(1)
  }
  const [retailerName, config] = entry

  console.log(`🏪 Retailer mode: ${retailerName} (${config.store})`)
  console.log(`   Brand filter: ${brandFilter || 'all stocked brands'}\n`)
  const byVendor = await fetchRetailerCatalog(config)

  runRetailerValidationTest(retailerName, config, byVendor)

  // Collect candidate fragrances: NULL image_url AND brand present in the
  // retailer's vendor index. Brand spellings vary in the DB, so we page
  // through all NULL-image rows and filter by normalised brand client-side.
  const candidates = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand')
      .is('image_url', null)
      .order('brand', { ascending: true })
      .order('name', { ascending: true })
      .range(from, from + 999)
    if (error) { console.error('❌ DB error:', error.message); process.exit(1) }
    if (!data.length) break
    for (const frag of data) {
      if (brandFilter && normalizeBrand(frag.brand) !== normalizeBrand(brandFilter)) continue
      if (byVendor.has(normalizeBrand(frag.brand))) {
        candidates.push(frag)
        if (limit > 0 && candidates.length >= limit) break
      }
    }
    if (limit > 0 && candidates.length >= limit) break
    if (data.length < 1000) break
    from += 1000
  }

  console.log(`Found ${candidates.length} candidate fragrances (NULL image_url, brand stocked by ${retailerName})\n`)
  if (!candidates.length) {
    console.log('✅ Nothing to enrich for this retailer.')
    return
  }

  let hits = 0
  let misses = 0
  const missLog = []
  const rows = []

  for (const frag of candidates) {
    const brandKey = normalizeBrand(frag.brand)
    const vendorProducts = byVendor.get(brandKey)
    const match = matchInCatalog(vendorProducts, frag.name, brandKey)

    if (match) {
      const safeImageUrl = normalizeFragranceImageUrl(match.imageUrl)
      if (!safeImageUrl) {
        console.log(`  ⚠️  Skipping page URL for ${frag.brand} / ${frag.name}`)
        misses++
        missLog.push(`PAGE_URL\t${retailerName}\t${frag.brand}\t${frag.name}`)
        rows.push({ status: '⚠️ page url', brand: frag.brand, name: frag.name, detail: `"${match.title}" rejected by validator` })
        continue
      }

      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('fragrances')
          .update({ image_url: safeImageUrl }) // image_url ONLY — never description/price
          .eq('id', frag.id)
          .is('image_url', null) // belt-and-braces: never overwrite a concurrent fill

        if (updateError) {
          console.error(`  ❌ DB update failed for ${frag.brand} / ${frag.name}: ${updateError.message}`)
          misses++
          missLog.push(`DB_ERROR\t${retailerName}\t${frag.brand}\t${frag.name}`)
          continue
        }
      }
      hits++
      rows.push({ status: '✅ match', brand: frag.brand, name: frag.name, detail: `"${match.title}" (vendor: ${match.vendor})` })
    } else {
      misses++
      missLog.push(`NO_MATCH\t${retailerName}\t${frag.brand}\t${frag.name}\tvendor_catalog=${vendorProducts.length}`)
      rows.push({ status: '○ miss', brand: frag.brand, name: frag.name, detail: `no title match (vendor catalog: ${vendorProducts.length} products)` })
    }
  }

  console.log('┌── Match/miss table ' + '─'.repeat(60))
  for (const r of rows) {
    console.log(`│ ${r.status}  ${r.brand} / ${r.name}`)
    console.log(`│          → ${r.detail}`)
  }
  console.log('└' + '─'.repeat(80))

  if (missLog.length > 0) {
    fs.appendFileSync(imageMissesFile, missLog.join('\n') + '\n')
  }

  console.log(`\n📊 Results — ${retailerName}`)
  console.log(`   ✅ Hits:    ${hits}`)
  console.log(`   ○  Misses:  ${misses}`)
  if (isDryRun) console.log(`\n⚠️  Dry run — no DB changes made. Re-run without --dry-run to apply.`)
  if (missLog.length > 0) console.log(`   Misses logged to: ${imageMissesFile}`)
  console.log()
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
  console.log(`\n🛍️  nota. — Shopify image enrichment`)
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no DB writes)' : 'LIVE'}`)
  console.log(`   Limit: ${limit || 'none (all)'}`)
  if (retailerFilter) {
    await runRetailerMode()
    return
  }
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
      const safeImageUrl = normalizeFragranceImageUrl(match.imageUrl)
      if (!safeImageUrl) {
        console.log(`  ⚠️  Skipping page URL for ${frag.brand} / ${frag.name}`)
        misses++
        missLog.push(`PAGE_URL\t${frag.brand}\t${frag.name}`)
        continue
      }

      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('fragrances')
          .update({ image_url: safeImageUrl })
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
