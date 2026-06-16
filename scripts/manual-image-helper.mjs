/**
 * manual-image-helper.mjs
 * Helps the user manually find and save fragrance image URLs.
 * 
 * Usage:
 *   node scripts/manual-image-helper.mjs
 *   node scripts/manual-image-helper.mjs --limit=20
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'
import { createInterface } from 'readline'

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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity

  const brandArg = process.argv.find(a => a.startsWith('--brand='))
  const brandFilter = brandArg ? brandArg.split('=')[1].replace(/^["']|["']$/g, '') : null

  console.log('📡 Fetching fragrances with missing images' + (brandFilter ? ` for brand "${brandFilter}"` : '') + '...')
  
  let query = supabase
    .from('fragrances')
    .select('id, brand, name')
    .is('image_url', null)

  if (brandFilter) {
    query = query.eq('brand', brandFilter)
  }

  const { data: fragrances, error } = await query
    .order('brand', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('❌ DB error:', error.message)
    process.exit(1)
  }

  if (!fragrances || fragrances.length === 0) {
    console.log('✅ All fragrances have images!')
    return
  }

  const total = fragrances.length
  let saved = 0
  let skipped = 0

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const question = (query) => new Promise(resolve => rl.question(query, resolve))

  for (let i = 0; i < total; i++) {
    const f = fragrances[i]
    console.log(`\n[${i + 1}/${total}] ${f.brand} — ${f.name}`)
    
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(f.brand + ' ' + f.name + ' perfume bottle official')}`
    
    try {
      execSync(`open "${searchUrl}"`)
    } catch (err) {
      console.warn('  ⚠️  Could not open browser automatically.')
    }

    const input = await question('Paste image URL (or Enter to skip): ')
    const url = input.trim()

    if (url) {
      const { error: updateError } = await supabase
        .from('fragrances')
        .update({ image_url: url })
        .eq('id', f.id)

      if (updateError) {
        console.log(`  ✗ DB error: ${updateError.message}`)
      } else {
        console.log('  ✓ Saved')
        saved++
      }
    } else {
      console.log('  — Skipped')
      skipped++
    }
  }

  rl.close()

  // Final count of remaining
  const { count } = await supabase
    .from('fragrances')
    .select('*', { count: 'exact', head: true })
    .is('image_url', null)

  console.log('\n─── Summary ───')
  console.log(`Saved:   ${saved}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Remaining in DB: ${count ?? 0}`)
}

main()
