#!/usr/bin/env node

/**
 * enrich-notes.mjs
 * Reads unique notes from fragrances.notes column and enriches fragrance_notes table
 * with PubChem molecular properties.
 *
 * Usage:
 *   node scripts/enrich-notes.mjs --dry-run --limit=50   # test run
 *   node scripts/enrich-notes.mjs --limit=50             # insert 50 notes
 *   node scripts/enrich-notes.mjs                        # full run (~2000+ notes)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] ?? '0', 10)

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Ensure fallback log directory exists
const fallbackDir = path.join(__dirname, 'data')
const fallbackFile = path.join(fallbackDir, 'pubchem-fallbacks.txt')
if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true })
}

/**
 * Semaphore pattern for rate-limiting concurrent requests
 */
class Semaphore {
  constructor(max) {
    this.max = max
    this.current = 0
    this.queue = []
  }

  async acquire() {
    if (this.current < this.max) {
      this.current++
      return
    }

    await new Promise(resolve => this.queue.push(resolve))
    this.current++
  }

  release() {
    this.current--
    const resolve = this.queue.shift()
    if (resolve) {
      resolve()
    }
  }
}

const semaphore = new Semaphore(5) // Max 5 concurrent requests

/**
 * Fetch note properties from PubChem with retry logic
 */
async function fetchFromPubChem(note) {
  let attempt = 0
  const maxAttempts = 3

  while (attempt < maxAttempts) {
    try {
      await semaphore.acquire()

      const encodedNote = encodeURIComponent(note)
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedNote}/property/MolecularWeight,XLogP,BoilingPoint/JSON`

      const response = await fetch(url)

      semaphore.release()

      // 404 = not found in PubChem
      if (response.status === 404) {
        return null
      }

      // Retry on rate limit or service error
      if (response.status === 429 || response.status === 503) {
        attempt++
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000
        console.log(`  ⏳ Rate limited, retrying ${note} in ${Math.round(backoff)}ms...`)
        await new Promise(r => setTimeout(r, backoff))
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const props = data?.PropertyTable?.Properties?.[0]

      if (!props) {
        return null
      }

      return {
        molecular_weight: props.MolecularWeight ?? null,
        xlogp: props.XLogP ?? null,
        boiling_point: props.BoilingPoint ?? null,
        source: 'pubchem',
      }
    } catch (err) {
      semaphore.release()
      attempt++

      if (attempt >= maxAttempts) {
        console.error(`  ❌ ${note}: ${err.message}`)
        return null
      }

      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000
      await new Promise(r => setTimeout(r, backoff))
    }
  }

  return null
}

/**
 * Derive volatility class from molecular weight
 */
function getVolatilityClass(mw, isFallback) {
  if (isFallback) {
    return 'heart' // safest default for fallback rows
  }

  if (mw < 154) return 'top'
  if (mw <= 220) return 'heart'
  return 'base'
}

/**
 * Main enrichment loop
 */
async function main() {
  console.log(`\n🧪 Fragrance Notes Enrichment — PubChem\n`)
  console.log(`Config: DRY_RUN=${DRY_RUN}, LIMIT=${LIMIT || 'unlimited'}`)

  // 1. Fetch all unique notes from fragrances.notes
  console.log(`\n📖 Reading unique notes from fragrances.notes...`)
  const { data: fragrances, error: fragError } = await supabase
    .from('fragrances')
    .select('notes')
    .not('notes', 'is', null)

  if (fragError) {
    console.error(`❌ Error reading fragrances:`, fragError.message)
    process.exit(1)
  }

  const noteSet = new Set()
  for (const row of fragrances) {
    if (row.notes) {
      const notes = row.notes.split(',').map(n => n.trim().toLowerCase())
      notes.forEach(n => {
        if (n.length > 0) noteSet.add(n)
      })
    }
  }

  let uniqueNotes = Array.from(noteSet).sort()
  if (LIMIT > 0) {
    uniqueNotes = uniqueNotes.slice(0, LIMIT)
  }

  console.log(`✓ Found ${uniqueNotes.length} unique notes`)

  // 2. Check which are already in fragrance_notes
  const { data: existingNotes, error: existError } = await supabase
    .from('fragrance_notes')
    .select('name')

  if (existError) {
    console.error(`❌ Error reading fragrance_notes:`, existError.message)
    process.exit(1)
  }

  const existingSet = new Set(existingNotes.map(n => n.name))
  const toEnrich = uniqueNotes.filter(note => !existingSet.has(note))

  console.log(`✓ Already cached: ${existingSet.size}, to enrich: ${toEnrich.length}\n`)

  if (toEnrich.length === 0) {
    console.log(`✓ All notes already enriched. Done.`)
    process.exit(0)
  }

  // 3. Enrich cache misses
  const fallbacks = []
  const toUpsert = []
  let pubchemHits = 0

  for (const note of toEnrich) {
    process.stdout.write(`  [${toUpsert.length + 1}/${toEnrich.length}] ${note}... `)

    if (DRY_RUN) {
      console.log(`(would fetch from PubChem)`)
      continue
    }

    const props = await fetchFromPubChem(note)

    if (props) {
      console.log(`✓ MW=${props.molecular_weight}`)
      pubchemHits++
      toUpsert.push({
        name: note,
        volatility_class: getVolatilityClass(props.molecular_weight, false),
        molecular_weight: props.molecular_weight,
        xlogp: props.xlogp,
        boiling_point: props.boiling_point,
        source: 'pubchem',
      })
    } else {
      console.log(`⚠ Fallback (descriptor or not found)`)
      fallbacks.push(note)
      toUpsert.push({
        name: note,
        volatility_class: 'heart',
        molecular_weight: 150.0,
        xlogp: 2.0,
        boiling_point: null,
        source: 'fallback',
      })
    }
  }

  // 4. Log fallbacks to file
  if (fallbacks.length > 0 && !DRY_RUN) {
    const existingFallbacks = fs.existsSync(fallbackFile)
      ? fs.readFileSync(fallbackFile, 'utf-8').split('\n').filter(Boolean)
      : []

    const allFallbacks = [...new Set([...existingFallbacks, ...fallbacks])].sort()
    fs.writeFileSync(fallbackFile, allFallbacks.join('\n') + '\n')
    console.log(`\n📝 Logged ${fallbacks.length} fallbacks to scripts/data/pubchem-fallbacks.txt`)
  }

  // 5. Upsert in batches of 50
  if (DRY_RUN) {
    console.log(`\n✓ [DRY RUN] Would upsert ${toUpsert.length} notes in batches of 50`)
  } else {
    console.log(`\n📤 Upserting ${toUpsert.length} notes in batches of 50...`)

    const batchSize = 50
    for (let i = 0; i < toUpsert.length; i += batchSize) {
      const batch = toUpsert.slice(i, i + batchSize)
      const { error: upsertErr } = await supabase
        .from('fragrance_notes')
        .upsert(batch, { onConflict: 'name' })

      if (upsertErr) {
        console.error(`❌ Upsert batch ${Math.floor(i / batchSize) + 1} failed:`, upsertErr.message)
        process.exit(1)
      }

      console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} rows`)
    }
  }

  // 6. Summary
  console.log(`\n📊 Summary:
  Total notes: ${uniqueNotes.length}
  Already cached: ${existingSet.size}
  Newly enriched: ${toEnrich.length}
    - PubChem hits: ${pubchemHits}
    - Fallbacks: ${fallbacks.length}
  Status: ${DRY_RUN ? 'DRY RUN — no changes' : 'COMPLETE'}
`)

  process.exit(0)
}

main().catch(err => {
  console.error(`❌ Fatal error:`, err)
  process.exit(1)
})
