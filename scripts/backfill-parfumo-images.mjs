/**
 * backfill-parfumo-images.mjs
 * Fetches bottle images from Parfumo and writes them to fragrances.image_url in Supabase.
 *
 * Usage:
 *   node scripts/backfill-parfumo-images.mjs
 *   node scripts/backfill-parfumo-images.mjs --dry-run   (print URLs without writing to DB)
 *   node scripts/backfill-parfumo-images.mjs --limit=20  (only process first N rows)
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 *   - Run from repo root: node scripts/backfill-parfumo-images.mjs
 *
 * Slug conventions (discovered from live Parfumo page audit):
 *   PRIMARY:  lowercase-hyphenated   → rare-carbon, 9pm, supremacy-not-only-intense
 *   FALLBACK: Title_Case_underscores → Interlude_Man, Reflection_Man, Supremacy_Silver
 * Script tries primary first, retries with fallback on 404.
 */

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

// Playwright is slower — 1.5s between items is safe
const REQUEST_DELAY = 1500

// ─── Load env ────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    console.warn('⚠️  Could not load .env.local — falling back to process.env')
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
// .env.local uses SUPABASE_SERVICE_KEY (not the standard SUPABASE_SERVICE_ROLE_KEY name)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Brand slug mapping ───────────────────────────────────────────────────────

const BRAND_SLUG = {
  'Afnan': 'Afnan_Perfumes',
  'Al Haramain': 'Al_Haramain',
  'Amouage': 'Amouage',
  'Arabiyat Prestige': 'Arabiyat_Prestige',
  'Armaf': 'Armaf',
  'Byredo': 'Byredo',
  'Calvin Klein': 'Calvin_Klein',
  'Christian Dior': 'Christian_Dior',
  'Creed': 'Creed',
  'Cremo': 'Cremo',
  'French Avenue': 'French_Avenue',
  'Initio': 'Initio_Parfums_Prives',
  'Khadlaj': 'Khadlaj',
  'Kilian': 'By_Kilian',
  'Lalique': 'Lalique',
  'Lattafa': 'Lattafa',
  'Lattafa Pride': 'Lattafa_Pride',
  'Maison Margiela': 'Maison_Margiela_Fragrances',
  'Mancera': 'Mancera',
  'Montale': 'Montale',
  'Parfums de Marly': 'Parfums_de_Marly',
  'Rasasi': 'Rasasi',
  'Swiss Arabian': 'Swiss_Arabian',
  'Tom Ford': 'Tom_Ford',
  'Xerjoff': 'Xerjoff',
  'Yves Saint Laurent': 'Yves_Saint_Laurent',
  'Zimaya': 'Zimaya',
}

// ─── Name slug transforms ─────────────────────────────────────────────────────
// NAME_OVERRIDES pin exact slugs for known edge-cases (verified from live pages).

const NAME_OVERRIDES = {
  '9PM EDP':            '9pm',
  '9PM Elixir':         '9pm-elixir',
  'Supremacy Silver':   'Supremacy_Silver',
  'Interlude Man':      'Interlude_Man',
  'Interlude Woman':    'Interlude_Woman',
  'Jubilation XXV Men': 'Jubilation_25_for_Men',
  'Dia Man':            'Dia_for_Men',
  'Asad':               'asad-1',
}

/** Primary: lowercase-hyphenated (matches majority of Parfumo pages) */
function toLowercaseHyphen(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Fallback: Title_Case_with_underscores (older Parfumo entries) */
function toTitleUnderscore(name) {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
}

function toParfumoNameSlug(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name]
  return toLowercaseHyphen(name)
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ─── Visit one Parfumo URL and extract image ──────────────────────────────────

async function fetchPageImage(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 })
  await sleep(800) // let post-load JS settle

  const title = await page.title()
  if (/^\s*404\s*$/.test(title) || title.toLowerCase().includes('not found')) {
    return { imageUrl: null, is404: true }
  }

  // Primary: og:image meta tag
  const ogImage = await page.$eval(
    'meta[property="og:image"]',
    el => el.getAttribute('content')
  ).catch(() => null)

  if (ogImage) {
    return {
      imageUrl: ogImage.replace('/perfume_social/', '/perfumes/').replace(/\?.*$/, ''),
      is404: false,
    }
  }

  // Fallback: any img from media.parfumo.com in the DOM
  const domImage = await page.evaluate(() => {
    for (const img of document.querySelectorAll('img')) {
      if (img.src && img.src.includes('media.parfumo.com')) return img.src
    }
    return null
  })

  return {
    imageUrl: domImage
      ? domImage.replace('/perfume_social/', '/perfumes/').replace(/\?.*$/, '')
      : null,
    is404: false,
  }
}

// ─── Fetch Parfumo image with dual-slug retry ─────────────────────────────────

async function fetchParfumoImage(page, brand, name) {
  const brandSlug = BRAND_SLUG[brand]
  if (!brandSlug) {
    return { url: null, reason: `No brand slug mapping for "${brand}"` }
  }

  const primarySlug = toParfumoNameSlug(name)
  // Only compute fallback if no override was used (overrides are already exact)
  const fallbackSlug = NAME_OVERRIDES[name] ? null : toTitleUnderscore(name)

  const primaryUrl = `https://www.parfumo.com/Perfumes/${brandSlug}/${primarySlug}`

  try {
    // Attempt 1: primary (lowercase-hyphen) slug
    const primary = await fetchPageImage(page, primaryUrl)

    if (!primary.is404 && primary.imageUrl) {
      return { url: primary.imageUrl, reason: null, parfumoUrl: primaryUrl }
    }
    if (!primary.is404) {
      return { url: null, reason: `No image found on ${primaryUrl}` }
    }

    // Attempt 2: Title_Case_underscores fallback (only triggered on 404)
    if (fallbackSlug && fallbackSlug !== primarySlug) {
      const fallbackUrl = `https://www.parfumo.com/Perfumes/${brandSlug}/${fallbackSlug}`
      await sleep(300)
      const fallback = await fetchPageImage(page, fallbackUrl)

      if (!fallback.is404 && fallback.imageUrl) {
        return { url: fallback.imageUrl, reason: null, parfumoUrl: fallbackUrl }
      }
      if (!fallback.is404) {
        return { url: null, reason: `No image found on fallback ${fallbackUrl}` }
      }
      return { url: null, reason: `404 on both slugs: "${primarySlug}" and "${fallbackSlug}"` }
    }

    return { url: null, reason: `404 — page not found at ${primaryUrl}` }
  } catch (err) {
    return { url: null, reason: `Browser error: ${err.message}` }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌸 Parfumo image backfill (Playwright)${DRY_RUN ? ' [DRY RUN]' : ''}`)
  console.log('─'.repeat(50))

  const { data: rows, error } = await supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .order('brand', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Supabase query failed:', error.message)
    process.exit(1)
  }

  const toProcess = LIMIT < Infinity ? rows.slice(0, LIMIT) : rows
  console.log(`Found ${rows.length} fragrances without images. Processing ${toProcess.length}.\n`)

  let browser
  try {
    browser = await chromium.launch({ headless: false, slowMo: 100 })
  } catch {
    console.error('❌ Could not launch Chromium. Run: npx playwright install chromium')
    process.exit(1)
  }

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

  const results = { updated: 0, failed: 0 }
  const failures = []

  try {
    for (const { id, brand, name } of toProcess) {
      const { url, reason, parfumoUrl } = await fetchParfumoImage(page, brand, name)

      if (!url) {
        console.log(`  ✗ ${brand} — ${name}`)
        console.log(`    ${reason}`)
        results.failed++
        failures.push({ brand, name, reason })
      } else if (DRY_RUN) {
        console.log(`  ✓ ${brand} — ${name}`)
        console.log(`    ${url}`)
        results.updated++
      } else {
        const { error: updateError } = await supabase
          .from('fragrances')
          .update({ image_url: url })
          .eq('id', id)

        if (updateError) {
          console.log(`  ✗ ${brand} — ${name} (DB write failed: ${updateError.message})`)
          results.failed++
          failures.push({ brand, name, reason: updateError.message })
        } else {
          console.log(`  ✓ ${brand} — ${name}`)
          console.log(`    ${url}`)
          results.updated++
        }
      }

      await sleep(REQUEST_DELAY)
    }
  } finally {
    await browser.close()
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`Done. Updated: ${results.updated} | Failed: ${results.failed}`)

  if (failures.length > 0) {
    console.log('\nFailed entries (review & manually map):')
    const byBrand = failures.reduce((acc, f) => {
      if (!acc[f.brand]) acc[f.brand] = []
      acc[f.brand].push(`${f.name}: ${f.reason}`)
      return acc
    }, {})
    for (const [brand, items] of Object.entries(byBrand)) {
      console.log(`\n  ${brand}:`)
      for (const item of items) console.log(`    - ${item}`)
    }
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
