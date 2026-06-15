/**
 * manual-image-helper.mjs
 * Interactive CLI for manually filling fragrance image_url gaps.
 *
 * For each fragrance without an image:
 *   - Opens a Google Images search in your browser
 *   - Prompts you to paste the image URL
 *   - Saves it to the DB immediately
 *
 * Usage:
 *   node scripts/manual-image-helper.mjs
 *   node scripts/manual-image-helper.mjs --limit=20
 *   node scripts/manual-image-helper.mjs --brand="Tom Ford"   (one brand at a time)
 *
 * Tip: right-click any Google Images result → "Copy image address" and paste here.
 * Prefer official brand CDN URLs or press/media URLs over retailer thumbnails.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createInterface } from 'readline'
import { execSync } from 'child_process'

// ─── Config ──────────────────────────────────────────────────────────────────

const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

const BRAND_ARG = process.argv.find(a => a.startsWith('--brand='))
const BRAND_FILTER = BRAND_ARG ? BRAND_ARG.split('=').slice(1).join('=').replace(/^["']|["']$/g, '') : null

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
    console.warn('⚠️  Could not load .env.local')
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function openBrowser(url) {
  try {
    // macOS: open | Linux: xdg-open | Windows: start
    const cmd = process.platform === 'win32' ? 'start' : process.platform === 'linux' ? 'xdg-open' : 'open'
    execSync(`${cmd} "${url}"`, { stdio: 'ignore' })
  } catch {
    console.log(`  🔗 ${url}`)
  }
}

function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve))
}

function googleImagesUrl(brand, name) {
  const q = encodeURIComponent(`${brand} ${name} perfume bottle official`)
  return `https://www.google.com/search?tbm=isch&q=${q}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🖼️  Manual image helper')
  if (BRAND_FILTER) console.log(`   Brand filter: ${BRAND_FILTER}`)
  console.log('─'.repeat(55))
  console.log('  Right-click any Google Images result → "Copy image address"')
  console.log('  Press Enter with no input to skip.')
  console.log('─'.repeat(55))

  // Query fragrances missing images
  let query = supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .order('brand')
    .order('name')

  if (BRAND_FILTER) query = query.eq('brand', BRAND_FILTER)

  const { data: rows, error } = await query
  if (error) { console.error('❌ Supabase:', error.message); process.exit(1) }

  const toProcess = LIMIT < Infinity ? rows.slice(0, LIMIT) : rows
  const total = toProcess.length

  if (total === 0) {
    console.log('\n✅ No missing images' + (BRAND_FILTER ? ` for ${BRAND_FILTER}` : '') + '.')
    return
  }

  console.log(`\nFound ${rows.length} missing${BRAND_FILTER ? ` for ${BRAND_FILTER}` : ''}. Processing ${total}.\n`)

  const rl = createInterface({ input: process.stdin, output: process.stdout })

  const results = { saved: 0, skipped: 0, failed: 0 }

  // Open one Google Images tab per brand (efficient — not one per fragrance)
  // We'll open brand tabs as we encounter new brands
  let lastBrand = null

  for (let i = 0; i < toProcess.length; i++) {
    const { id, brand, name } = toProcess[i]

    // Open a new browser tab when brand changes — less noise than per-fragrance
    if (brand !== lastBrand) {
      const brandSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(brand + ' perfume bottle')}`
      openBrowser(brandSearchUrl)
      lastBrand = brand
      if (i > 0) console.log() // spacing between brands
      console.log(`\n── ${brand} ──`)
    }

    // Specific search printed (but not auto-opened — brand tab is already there)
    const specificUrl = googleImagesUrl(brand, name)
    console.log(`\n[${i + 1}/${total}] ${name}`)
    console.log(`  Search: ${specificUrl}`)

    const input = await prompt(rl, '  URL: ')
    const url = input.trim()

    if (!url) {
      console.log('  — Skipped')
      results.skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('fragrances')
      .update({ image_url: url })
      .eq('id', id)

    if (updateError) {
      console.log(`  ✗ DB error: ${updateError.message}`)
      results.failed++
    } else {
      console.log('  ✓ Saved')
      results.saved++
    }
  }

  rl.close()

  // Summary
  console.log('\n' + '─'.repeat(55))
  console.log(`Done. Saved: ${results.saved} | Skipped: ${results.skipped} | Failed: ${results.failed}`)

  // Show remaining count
  const { count } = await supabase
    .from('fragrances')
    .select('id', { count: 'exact', head: true })
    .is('image_url', null)
  console.log(`Still missing in DB: ${count ?? '?'}`)
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1) })
