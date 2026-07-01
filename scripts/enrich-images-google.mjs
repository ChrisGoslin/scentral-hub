#!/usr/bin/env node
/**
 * enrich-images-google.mjs
 *
 * Fills image_url for curated fragrances (rating IS NOT NULL, image_url IS NULL)
 * using Google Custom Search JSON API — image search, first result.
 *
 * Free tier: 100 queries/day. 208 frags = 3 days at no cost.
 *
 * Usage:
 *   node scripts/enrich-images-google.mjs --dry-run        # preview, no DB writes
 *   node scripts/enrich-images-google.mjs --limit=10       # first N frags
 *   node scripts/enrich-images-google.mjs                  # full run (100/day free limit)
 *
 * Required env vars (add to .env.local):
 *   GOOGLE_CSE_API_KEY=...   (Google Cloud → APIs & Services → Credentials)
 *   GOOGLE_CSE_CX=...        (cse.google.com → your search engine → CX ID)
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
const missesFile = path.join(dataDir, 'google-image-misses.txt')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const apiKey = process.env.GOOGLE_CSE_API_KEY
const cx = process.env.GOOGLE_CSE_CX

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}
if (!apiKey || !cx) {
  console.error('❌ Missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX in .env.local')
  console.error('   Get them at: console.cloud.google.com + cse.google.com')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Validation ───────────────────────────────────────────────────────────────

async function runValidation() {
  console.log('\n🧪 Validation (Chanel No. 5 must return an image)\n')

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&num=1&q=Chanel+No+5+perfume+bottle+official`
  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    console.error(`❌ API error: ${data.error.message}`)
    console.error('   Check your GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX values.')
    process.exit(1)
  }

  const imageUrl = data.items?.[0]?.link
  if (!imageUrl) {
    console.error('❌ No image returned for Chanel No. 5 — check CSE is set to search entire web with image search enabled.')
    process.exit(1)
  }

  console.log(`✅ Validation passed — image found: ${imageUrl}\n`)
}

// ─── Google Image Search ──────────────────────────────────────────────────────

// Returns the best image URL for a fragrance, or null.
// Query: "<brand> <name> perfume bottle" — specific enough to avoid lifestyle shots.
// Prefer cdn.shopify.com, *.brand.com, fragrantica.com, parfumo.com over generic stock.
const PREFERRED_DOMAINS = ['shopify', 'fragrantica', 'parfumo', 'sephora', 'notino', 'lookfantastic']

async function findImage(brand, name) {
  const q = encodeURIComponent(`${brand} ${name} perfume bottle`)
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&num=5&q=${q}`

  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()

  if (data.error) {
    // Rate limit — caller should back off
    if (data.error.code === 429) throw new Error('RATE_LIMIT')
    return null
  }

  const items = data.items ?? []
  if (!items.length) return null

  // Prefer trusted retail/fragrance domains
  const preferred = items.find(item =>
    PREFERRED_DOMAINS.some(d => item.link.includes(d))
  )
  return (preferred ?? items[0]).link
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 BaseNote — Google Image Enrichment')
  console.log(`   Mode:  ${isDryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Limit: ${limit || 'none (max 100/day free tier)'}`)

  await runValidation()

  // Only curated fragrances (rating IS NOT NULL) with no image
  let query = supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)
    .not('rating', 'is', null)
    .order('brand')
    .order('name')

  if (limit > 0) query = query.limit(limit)

  const { data: fragrances, error } = await query
  if (error) { console.error('❌ DB error:', error.message); process.exit(1) }

  console.log(`\nFound ${fragrances.length} curated fragrances without images\n`)

  if (fragrances.length === 0) {
    console.log('✅ Nothing to enrich.')
    return
  }

  if (fragrances.length > 100 && !isDryRun) {
    console.log(`⚠️  ${fragrances.length} frags > 100/day free tier. Will stop at 100 today.`)
    console.log('   Re-run tomorrow for the next batch.\n')
  }

  let hits = 0
  let misses = 0
  let processed = 0
  const missLog = []

  for (const frag of fragrances) {
    if (!isDryRun && processed >= 100) {
      console.log('\n⚠️  Hit 100/day free limit — stopping. Re-run tomorrow for the rest.')
      break
    }

    try {
      const imageUrl = await findImage(frag.brand, frag.name)
      processed++

      if (imageUrl) {
        if (!isDryRun) {
          const { error: updateError } = await supabase
            .from('fragrances')
            .update({ image_url: imageUrl })
            .eq('id', frag.id)

          if (updateError) {
            console.error(`  ❌ DB error for ${frag.brand} / ${frag.name}: ${updateError.message}`)
            misses++
            continue
          }
        }
        console.log(`  ✅ ${frag.brand} / ${frag.name}${isDryRun ? ' [DRY RUN]' : ''}`)
        console.log(`     → ${imageUrl}`)
        hits++
      } else {
        console.log(`  ○ miss  ${frag.brand} / ${frag.name}`)
        misses++
        missLog.push(`${frag.id}\t${frag.brand}\t${frag.name}`)
      }

      // Polite delay — Google CSE allows ~10 QPS but stay conservative
      await sleep(200)

    } catch (err) {
      if (err.message === 'RATE_LIMIT') {
        console.log('\n⚠️  Rate limited by Google — stopping. Re-run in a few minutes.')
        break
      }
      console.error(`  ❌ Error for ${frag.brand} / ${frag.name}: ${err.message}`)
      misses++
    }
  }

  if (missLog.length > 0) {
    fs.appendFileSync(missesFile, missLog.join('\n') + '\n')
  }

  console.log(`\n📊 Results`)
  console.log(`   ✅ Hits:   ${hits}`)
  console.log(`   ○  Misses: ${misses}`)
  if (isDryRun) console.log('\n⚠️  Dry run — no DB changes made.')
  if (missLog.length > 0) console.log(`   Misses logged to: ${missesFile}`)
  console.log()
}

main().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})
