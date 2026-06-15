#!/usr/bin/env node
// Populates image_url on fragrances rows that have none, sourced from Fragrantica.
// Run from repo root: node scripts/backfill-images.mjs
// Requires in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Env ──────────────────────────────────────────────────────────────────────
const envFile = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => {
      const idx = l.indexOf('=')
      const key = l.slice(0, idx).trim()
      let val = l.slice(idx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      return [key, val]
    })
)

// Support both naming conventions used across scripts in this repo
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local'); process.exit(1) }
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_KEY in .env.local'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey)

const DELAY_MS = 1000

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const DIM  = '\x1b[2m'
const RST  = '\x1b[0m'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── Fragrantica scraper ───────────────────────────────────────────────────────

const VALID_IMAGE_HOSTS = ['https://fimgs.net', 'https://cdn.fragrantica.com']

function isValidImageUrl(url) {
  return VALID_IMAGE_HOSTS.some(host => url.startsWith(host))
}

async function fetchFragranticaImage(brand, name) {
  const query = encodeURIComponent(`${brand} ${name}`)
  const searchUrl = `https://www.fragrantica.com/search/?query=${query}`

  let html
  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    html = await res.text()
  } catch {
    return null
  }

  // Fragrantica search result cards sit inside divs with class "cell card fprod"
  // or "perfume-box". Each card has an <img> whose src points to fimgs.net.
  // We scan for the first <img src="https://fimgs.net/..."> in the page.
  //
  // Pattern: src="https://fimgs.net/mdimg/perfume/375x500.<id>.jpg"
  // Also covers cdn.fragrantica.com images.
  const imgPattern = /src="(https:\/\/(?:fimgs\.net|cdn\.fragrantica\.com)\/[^"]+\.(jpg|jpeg|png|webp))"/gi
  const match = imgPattern.exec(html)
  if (match) return match[1]

  return null
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .order('brand')

  if (error) { console.error('DB fetch error:', error.message); process.exit(1) }
  if (!fragrances.length) { console.log('No fragrances with missing image_url found.'); return }

  console.log(`\n${DIM}Backfilling images for ${fragrances.length} fragrances…${RST}\n`)

  let updated = 0
  let skipped = 0

  for (let i = 0; i < fragrances.length; i++) {
    const { id, brand, name } = fragrances[i]
    const label = `${brand} ${name}`

    const imageUrl = await fetchFragranticaImage(brand, name)

    if (imageUrl && isValidImageUrl(imageUrl)) {
      const { error: updateErr } = await supabase
        .from('fragrances')
        .update({ image_url: imageUrl })
        .eq('id', id)

      if (updateErr) {
        console.log(`  ${FAIL} ${label} ${DIM}→ update error: ${updateErr.message}${RST}`)
        skipped++
      } else {
        console.log(`  ${PASS} ${label} ${DIM}→ ${imageUrl}${RST}`)
        updated++
      }
    } else {
      console.log(`  ${FAIL} ${label} ${DIM}→ no image found${RST}`)
      skipped++
    }

    if (i < fragrances.length - 1) await sleep(DELAY_MS)
  }

  console.log(`\n── Done ─────────────────────────────────────────────`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Total:   ${fragrances.length}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
