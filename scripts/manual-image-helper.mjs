/**
 * manual-image-helper.mjs
 * Interactive helper for fragrances that automated backfill couldn't resolve.
 *
 * Opens a browser window to Parfumo + Fragrantica search for each fragrance
 * so you can visually find the bottle image and paste the URL.
 *
 * Usage:
 *   node scripts/manual-image-helper.mjs                    # all missing images
 *   node scripts/manual-image-helper.mjs --brand="Tom Ford" # one brand at a time
 *   node scripts/manual-image-helper.mjs --limit=20         # cap session length
 *
 * At each prompt:
 *   <URL>   → saves to DB and moves to next
 *   Enter   → skips this fragrance
 *   q       → quits immediately
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 *   - npx playwright install chromium  (first time only)
 */

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import readline from 'readline'

// ─── Args ─────────────────────────────────────────────────────────────────────

const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

const BRAND_ARG = process.argv.find(a => a.startsWith('--brand='))
const BRAND_FILTER = BRAND_ARG ? BRAND_ARG.slice('--brand='.length).replace(/^["']|["']$/g, '') : null

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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Search URL builders ──────────────────────────────────────────────────────

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
}

function searchUrls(brand, name) {
  const q = encodeURIComponent(`${brand} ${name}`)
  const urls = []

  const parfumoBrand = PARFUMO_BRAND_SLUG[brand]
  if (parfumoBrand) {
    const nameSlug = name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    urls.push(`https://www.parfumo.com/Perfumes/${parfumoBrand}/${nameSlug}`)
  }

  const fragranticaBrand = FRAGRANTICA_BRAND_SLUG[brand]
  if (fragranticaBrand) {
    urls.push(`https://www.fragrantica.com/search/?query=${q}`)
  }

  // Always add a Google Images fallback
  urls.push(`https://www.google.com/search?tbm=isch&q=${q}+bottle+perfume`)

  return urls
}

// ─── Interactive prompt ───────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🖼️  Manual image helper')
  if (BRAND_FILTER) console.log(`   Brand filter: "${BRAND_FILTER}"`)
  if (LIMIT < Infinity) console.log(`   Limit: ${LIMIT}`)
  console.log('─'.repeat(55))
  console.log('  At each prompt: paste a URL to save, Enter to skip, "q" to quit')
  console.log('─'.repeat(55))

  // Build query
  let query = supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .order('brand')
    .order('name')

  if (BRAND_FILTER) {
    query = query.eq('brand', BRAND_FILTER)
  }

  const { data: rows, error } = await query

  if (error) { console.error('❌ Supabase:', error.message); process.exit(1) }

  const toProcess = LIMIT < Infinity ? rows.slice(0, LIMIT) : rows
  console.log(`\nFound ${rows.length} without images. Processing ${toProcess.length}.\n`)

  if (toProcess.length === 0) {
    console.log('✅ Nothing to do — all matching fragrances already have images.')
    rl.close()
    return
  }

  let browser
  try {
    browser = await chromium.launch({ headless: false })
  } catch {
    console.error('❌ Could not launch Chromium. Run: npx playwright install chromium')
    process.exit(1)
  }

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

  const results = { saved: 0, skipped: 0 }

  for (let i = 0; i < toProcess.length; i++) {
    const { id, brand, name } = toProcess[i]
    const label = `${brand} — ${name}`
    const progress = `[${i + 1}/${toProcess.length}]`

    console.log(`\n${progress} ${label}`)

    // Open first search URL in the browser; open extras as new tabs
    const urls = searchUrls(brand, name)
    try {
      await page.goto(urls[0], { waitUntil: 'domcontentloaded', timeout: 15000 })
      for (const url of urls.slice(1)) {
        const tab = await browser.newPage()
        await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
      }
    } catch {
      console.log('  ⚠️  Browser navigation timed out — you can still paste a URL manually')
    }

    // Print search suggestions so user knows what's open
    console.log('  Opened:')
    for (const url of urls) console.log(`    ${url}`)

    const answer = (await prompt('\n  Image URL (or Enter to skip, q to quit): ')).trim()

    if (answer.toLowerCase() === 'q') {
      console.log('\n👋 Quitting.')
      break
    }

    if (!answer) {
      console.log('  → Skipped')
      results.skipped++
      continue
    }

    // Basic URL sanity check
    if (!answer.startsWith('http')) {
      console.log('  ⚠️  Doesn\'t look like a URL — skipping. Enter the full https:// address.')
      results.skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('fragrances')
      .update({ image_url: answer })
      .eq('id', id)

    if (updateError) {
      console.log(`  ✗ DB error: ${updateError.message}`)
      results.skipped++
    } else {
      console.log('  ✓ Saved')
      results.saved++
    }
  }

  rl.close()
  await browser.close()

  console.log('\n' + '─'.repeat(55))
  console.log(`Done. Saved: ${results.saved} | Skipped: ${results.skipped}`)
  if (results.saved > 0) {
    console.log('\nNext step — migrate saved URLs into Supabase Storage:')
    console.log('  node scripts/migrate-images-to-storage.mjs')
  }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1) })
