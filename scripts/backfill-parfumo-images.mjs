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
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - Run from repo root: node scripts/backfill-parfumo-images.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

// Delay between requests to avoid rate-limiting (ms)
const REQUEST_DELAY = 600

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
// Maps our DB brand name → Parfumo URL brand segment
// Parfumo uses Title_Case with underscores (spaces → _)
// Verified by fetching actual pages.

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

// ─── Name slug transform ──────────────────────────────────────────────────────
// Parfumo name slug: spaces → _, special chars removed, Title_Case preserved
// Some known overrides for edge cases.

const NAME_OVERRIDES = {
  // Our DB name → Parfumo name slug
  '9PM EDP': '9pm',
  '9PM Elixir': '9pm-elixir',
  'Supremacy Silver': 'Supremacy_Silver',
  'Interlude Man': 'Interlude_Man',
  'Interlude Woman': 'Interlude_Woman',
  'Jubilation XXV Men': 'Jubilation_25_for_Men',
  'Dia Man': 'Dia_for_Men',
  'Asad': 'asad-1',  // disambiguation suffix on Parfumo
}

function toParfumoNameSlug(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name]
  // Replace spaces with underscores, strip characters Parfumo doesn't use
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-']/g, '')
}

// ─── Fetch og:image from Parfumo ──────────────────────────────────────────────

async function fetchParfumoImage(brand, name) {
  const brandSlug = BRAND_SLUG[brand]
  if (!brandSlug) {
    return { url: null, reason: `No brand slug mapping for "${brand}"` }
  }

  const nameSlug = toParfumoNameSlug(name)
  const parfumoUrl = `https://www.parfumo.com/Perfumes/${brandSlug}/${nameSlug}`

  let html
  try {
    const res = await fetch(parfumoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })
    if (!res.ok) {
      return { url: null, reason: `HTTP ${res.status} from ${parfumoUrl}` }
    }
    html = await res.text()
  } catch (err) {
    return { url: null, reason: `Fetch error: ${err.message}` }
  }

  // Detect real 404 by page title — NOT by html.includes('/404') which fires on every
  // valid Parfumo page (their nav contains the string "/404").
  if (/<title>\s*404\s*<\/title>/i.test(html) || html.includes('Oops, something went wrong')) {
    return { url: null, reason: `404 — page not found at ${parfumoUrl}` }
  }

  // Extract og:image — try multiple attribute orderings and quote styles.
  // Parfumo's meta tag attribute order can vary across page types.
  const ogMatch =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/) ??
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/) ??
    html.match(/property="og:image"\s+content="([^"]+)"/) ??
    html.match(/content="([^"]+)"\s+property="og:image"/)

  if (ogMatch) {
    // Convert from perfume_social CDN path to perfumes/ direct path for cleaner image
    // perfume_social: media.parfumo.com/perfume_social/ab/abc123-name_1200.jpg?format=jpg&quality=90
    // perfumes:       media.parfumo.com/perfumes/ab/abc123-name_1200.jpg (no query string needed)
    const rawUrl = ogMatch[1]
    const cleanUrl = rawUrl
      .replace('/perfume_social/', '/perfumes/')
      .replace(/\?.*$/, '') // strip query params — the base URL serves full quality
    return { url: cleanUrl, reason: null, parfumoUrl }
  }

  // Fallback: scan raw HTML for any media.parfumo.com bottle image URL
  const cdnMatch = html.match(/https:\/\/media\.parfumo\.com\/perfume(?:s|_social)\/[a-zA-Z0-9/_\-]+\.(?:jpg|jpeg|webp)/)
  if (cdnMatch) {
    const cleanUrl = cdnMatch[0]
      .replace('/perfume_social/', '/perfumes/')
      .replace(/\?.*$/, '')
    return { url: cleanUrl, reason: null, parfumoUrl }
  }

  return { url: null, reason: `Image URL not found in HTML from ${parfumoUrl}` }
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌸 Parfumo image backfill${DRY_RUN ? ' [DRY RUN]' : ''}`)
  console.log('─'.repeat(50))

  // Fetch all fragrances without images
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

  const results = { updated: 0, skipped: 0, failed: 0 }
  const failures = []

  for (const { id, brand, name } of toProcess) {
    const { url, reason, parfumoUrl } = await fetchParfumoImage(brand, name)

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
        results.updated++
      }
    }

    await sleep(REQUEST_DELAY)
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
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
