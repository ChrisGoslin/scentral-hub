/**
 * backfill-parfumo-images.mjs
 * Fetches bottle images from multiple sources and writes to fragrances.image_url.
 *
 * Source priority:
 *   1. Parfumo  — best for Middle Eastern / niche brands
 *   2. Fragrantica — best for Western / designer brands (Tom Ford, YSL, Dior, Byredo…)
 *
 * Usage:
 *   node scripts/backfill-parfumo-images.mjs --dry-run --limit=5
 *   node scripts/backfill-parfumo-images.mjs
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 *   - npx playwright install chromium   (first time only)
 */

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity
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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Sleep ────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

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

// ─── Source 1: Parfumo ───────────────────────────────────────────────────────

const PARFUMO_BRAND_SLUG = {
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
  // Parfumo dropped "Fragrances" from the brand path — both tried in fetchFromParfumo
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

// Alternative brand slugs to try when the primary 404s
const PARFUMO_BRAND_SLUG_ALT = {
  'Maison Margiela': 'Maison_Margiela',
}

// Exact slug overrides (verified from live pages)
const PARFUMO_NAME_OVERRIDES = {
  '9PM EDP':            '9pm',
  '9PM Elixir':         '9pm-elixir',
  'Supremacy Silver':   'Supremacy_Silver',
  'Interlude Man':      'Interlude_Man',
  'Interlude Woman':    'Interlude_Woman',
  'Jubilation XXV Men': 'Jubilation_25_for_Men',
  'Dia Man':            'Dia_for_Men',
  'Asad':               'asad-1',
}

function toLowercaseHyphen(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function toTitleUnderscore(name) {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '')
}

// Strips common concentration suffixes that Parfumo omits from slugs
// e.g. "Sauvage EDP" → "Sauvage", "Black Opium EDP Intense" → "Black Opium"
const SUFFIX_PATTERN = /\s+(EDP|EDT|EDP\s+Intense|EDP\s+Refillable|Eau\s+de\s+Parfum|Eau\s+de\s+Toilette|Parfum|Extrait)$/i

function parfumoNameSlug(name) {
  return PARFUMO_NAME_OVERRIDES[name] ?? toLowercaseHyphen(name)
}

function strippedNameSlug(name) {
  const stripped = name.replace(SUFFIX_PATTERN, '').trim()
  return stripped !== name ? toLowercaseHyphen(stripped) : null
}

async function handleCaptcha(page) {
  const title = await page.title().catch(() => '')
  const hasCaptcha = 
    title.toLowerCase().includes('attention required') || 
    title.toLowerCase().includes('cloudflare') || 
    title.toLowerCase().includes('robot') ||
    await page.$('iframe[src*="challenges.cloudflare.com"]').catch(() => null) ||
    await page.$('iframe[src*="recaptcha"]').catch(() => null)

  if (hasCaptcha) {
    console.log('  ⚠️  CAPTCHA / Cloudflare detected! Waiting 10s before polling for resolution...')
    await sleep(10000)
    // Wait for the title to change or the challenge to disappear
    await page.waitForFunction(() => {
      const t = document.title.toLowerCase()
      const challenge = document.querySelector('iframe[src*="challenges.cloudflare.com"]') || 
                        document.querySelector('iframe[src*="recaptcha"]')
      return !t.includes('attention required') && !t.includes('cloudflare') && !t.includes('robot') && !challenge
    }, { timeout: 60000 }).catch(() => {
      console.log('  ⏳ Timed out waiting for manual CAPTCHA resolution.')
    })
    await sleep(1500)
    return true
  }
  return false
}

async function fetchFromParfumo(page, brand, name) {
  const brandSlug = PARFUMO_BRAND_SLUG[brand]
  if (!brandSlug) return { url: null, reason: `Parfumo: no brand slug for "${brand}"` }

  const primarySlug = parfumoNameSlug(name)
  const isOverride = Boolean(PARFUMO_NAME_OVERRIDES[name])
  const fallbackSlug = isOverride ? null : toTitleUnderscore(name)
  const suffixSlug = isOverride ? null : strippedNameSlug(name)
  const altBrandSlug = PARFUMO_BRAND_SLUG_ALT[brand] ?? null

  // Build candidate (brandSlug, nameSlug) pairs to try in order
  const candidates = [
    [brandSlug, primarySlug],
    ...(fallbackSlug && fallbackSlug !== primarySlug ? [[brandSlug, fallbackSlug]] : []),
    ...(suffixSlug && suffixSlug !== primarySlug ? [[brandSlug, suffixSlug]] : []),
    ...(altBrandSlug ? [[altBrandSlug, primarySlug]] : []),
    ...(altBrandSlug && suffixSlug ? [[altBrandSlug, suffixSlug]] : []),
  ]

  const tryUrl = async (url) => {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 })
      await sleep(600)
      
      await handleCaptcha(page)
      
      const title = await page.title()
      if (/^\s*404\s*$/.test(title) || title.toLowerCase().includes('not found')) return null
      
      const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content')).catch(() => null)
      if (ogImage) return ogImage.replace('/perfume_social/', '/perfumes/').replace(/\?.*$/, '')
      const domImage = await page.evaluate(() => {
        for (const img of document.querySelectorAll('img'))
          if (img.src?.includes('media.parfumo.com')) return img.src
        return null
      })
      return domImage ? domImage.replace('/perfume_social/', '/perfumes/').replace(/\?.*$/, '') : null
    } catch { return null }
  }

  const triedSlugs = []
  for (const [bSlug, nSlug] of candidates) {
    const url = `https://www.parfumo.com/Perfumes/${bSlug}/${nSlug}`
    const img = await tryUrl(url)
    if (img) return { url: img, reason: null, source: 'parfumo', sourceUrl: url }
    triedSlugs.push(`${bSlug}/${nSlug}`)
    await sleep(300)
  }

  return { url: null, reason: `Parfumo: 404 on all tried: ${triedSlugs.join(', ')}` }
}

// ─── Source 2: Fragrantica ───────────────────────────────────────────────────
// Strategy: use Fragrantica's search page to find the fragrance, then grab og:image
// from the product page. Avoids needing to know numeric IDs.

const FRAGRANTICA_BRAND_SLUG = {
  'Amouage': 'Amouage',
  'Armaf': 'Armaf',
  'Byredo': 'Byredo',
  'Calvin Klein': 'Calvin-Klein',
  'Christian Dior': 'Christian-Dior',
  'Creed': 'Creed',
  'Initio': 'Initio-Parfums-Prives',
  'Kilian': 'By-Kilian',
  'Lalique': 'Lalique',
  'Maison Margiela': 'Maison-Margiela',
  'Mancera': 'Mancera',
  'Montale': 'Montale',
  'Parfums de Marly': 'Parfums-de-Marly',
  'Tom Ford': 'Tom-Ford',
  'Xerjoff': 'Xerjoff',
  'Yves Saint Laurent': 'Yves-Saint-Laurent',
  'Cremo': 'Cremo',
  'Afnan': 'Afnan',
  'Lattafa': 'Lattafa',
  'Lattafa Pride': 'Lattafa',
  'Rasasi': 'Rasasi',
  'Swiss Arabian': 'Swiss-Arabian',
  'Khadlaj': 'Khadlaj',
  'Arabiyat Prestige': 'Arabiyat-Prestige',
  'French Avenue': 'French-Avenue',
  // Brands genuinely not on Fragrantica fall through to Parfumo-only
}

async function fetchFromFragrantica(page, brand, name) {
  const brandSlug = FRAGRANTICA_BRAND_SLUG[brand]
  if (!brandSlug) return { url: null, reason: `Fragrantica: no slug for "${brand}"` }

  // Use Fragrantica search — it reliably resolves to the correct product page
  const query = encodeURIComponent(`${brand} ${name}`)
  const searchUrl = `https://www.fragrantica.com/search/?query=${query}`

  try {
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 25000 })
    await sleep(800)
    
    await handleCaptcha(page)

    // Find the first result link that matches our brand slug
    const productUrl = await page.evaluate((bSlug) => {
      const links = Array.from(document.querySelectorAll('a[href*="/perfume/"]'))
      const match = links.find(a => a.href.includes(`/perfume/${bSlug}/`))
      return match ? match.href : null
    }, brandSlug)

    if (!productUrl) return { url: null, reason: `Fragrantica: no search result for "${brand} ${name}"` }

    await page.goto(productUrl, { waitUntil: 'load', timeout: 25000 })
    await sleep(600)
    
    await handleCaptcha(page)

    const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content')).catch(() => null)
    if (ogImage) return { url: ogImage, reason: null, source: 'fragrantica', sourceUrl: productUrl }

    // Fallback: look for main product image
    const mainImg = await page.evaluate(() => {
      const img = document.querySelector('img[itemprop="image"], .mainImage img, img.shadow')
      return img?.src ?? null
    })
    if (mainImg) return { url: mainImg, reason: null, source: 'fragrantica', sourceUrl: productUrl }

    return { url: null, reason: `Fragrantica: page found but no image at ${productUrl}` }
  } catch (err) {
    return { url: null, reason: `Fragrantica: error — ${err.message}` }
  }
}

// ─── Multi-source orchestrator ────────────────────────────────────────────────

async function fetchImage(browser, page, brand, name) {
  // Try Parfumo first
  const parfumo = await fetchFromParfumo(page, brand, name)
  if (parfumo.url) return { ...parfumo, page }

  // Fall back to Fragrantica — recover page if the browser closed it
  await sleep(500)
  let activePage = page
  try {
    // Quick health check — if the page was closed, this throws
    await page.evaluate(() => null)
  } catch {
    // Browser closed the page (Cloudflare session reset) — open a new one
    try { activePage = await browser.newPage() } catch { /* browser itself died */ }
  }

  const fragrantica = await fetchFromFragrantica(activePage, brand, name)
  if (fragrantica.url) return { ...fragrantica, page: activePage }

  return {
    url: null,
    page: activePage,
    reason: `All sources failed:\n      Parfumo: ${parfumo.reason}\n      Fragrantica: ${fragrantica.reason}`,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌸 Fragrance image backfill — multi-source${DRY_RUN ? ' [DRY RUN]' : ''}`)
  console.log('   Sources: Parfumo → Fragrantica')
  console.log('─'.repeat(55))

  const { data: rows, error } = await supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .order('brand')
    .order('name')

  if (error) { console.error('❌ Supabase:', error.message); process.exit(1) }

  const toProcess = LIMIT < Infinity ? rows.slice(0, LIMIT) : rows
  console.log(`Found ${rows.length} without images. Processing ${toProcess.length}.\n`)

  let browser
  try {
    browser = await chromium.launch({ headless: false, slowMo: 80 })
  } catch {
    console.error('❌ Could not launch Chromium. Run: npx playwright install chromium')
    process.exit(1)
  }

  let page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

const results = { updated: 0, failed: 0 }
  const failures = []

  try {
    for (const { id, brand, name } of toProcess) {
      const result = await fetchImage(browser, page, brand, name)
      page = result.page  // may be a new page after crash recovery
      const { url, reason, source } = result
      const safeUrl = normalizeFragranceImageUrl(url)

      if (!url) {
        console.log(`  ✗ ${brand} — ${name}`)
        console.log(`    ${reason}`)
        results.failed++
        failures.push({ brand, name, reason })
      } else if (!safeUrl) {
        console.log(`  ✗ ${brand} — ${name}`)
        console.log('    Refusing to persist a page URL from the scraper')
        results.failed++
        failures.push({ brand, name, reason: 'page URL rejected by validator' })
      } else if (DRY_RUN) {
        console.log(`  ✓ ${brand} — ${name}  [${source}]`)
        console.log(`    ${safeUrl}`)
        results.updated++
      } else {
        const { error: updateError } = await supabase
          .from('fragrances').update({ image_url: safeUrl }).eq('id', id)
        if (updateError) {
          console.log(`  ✗ ${brand} — ${name} (DB: ${updateError.message})`)
          results.failed++
          failures.push({ brand, name, reason: updateError.message })
        } else {
          console.log(`  ✓ ${brand} — ${name}  [${source}]`)
          results.updated++
        }
      }

      await sleep(REQUEST_DELAY)
    }
  } finally {
    await browser.close()
  }

  console.log('\n' + '─'.repeat(55))
  console.log(`Done. Updated: ${results.updated} | Failed: ${results.failed}`)

  if (failures.length > 0) {
    console.log('\nStill failing (add NAME_OVERRIDES or manual image_url):')
    const byBrand = failures.reduce((acc, f) => {
      ;(acc[f.brand] ??= []).push(f.name)
      return acc
    }, {})
    for (const [brand, names] of Object.entries(byBrand)) {
      console.log(`  ${brand}: ${names.join(', ')}`)
    }
  }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1) })
