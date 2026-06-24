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
 * Perfumery note name -> real PubChem compound names. PubChem only resolves actual
 * chemical names (see diagnose-prod-slowdown-style finding in commit 3efe78c) - these
 * are the molecules behind common marketing/category terms. Order matters: the first
 * compound that resolves becomes the note's primary_cid.
 */
const NOTE_COMPOUNDS = {
  amber: ['ambroxan', 'iso e super'],
  ambergris: ['ambroxan', 'ambrein'],
  bergamot: ['linalool', 'linalyl acetate', 'limonene'],
  rose: ['geraniol', 'citronellol', 'phenylethyl alcohol'],
  jasmine: ['benzyl acetate', 'linalool', 'indole'],
  oud: ['guaiacol', 'eugenol'],
  cedar: ['cedrol', 'cedrene'],
  cedarwood: ['cedrol', 'cedrene'], // alias - fragrances.notes uses "cedarwood", not "cedar"
  sandalwood: ['santalol', 'alpha-santalol'],
  vanilla: ['vanillin', 'coumarin'],
  musk: ['galaxolide', 'iso e super'],
  lavender: ['linalool', 'linalyl acetate'],
  citrus: ['limonene', 'citral'],
  patchouli: ['patchouli alcohol', 'norpatchoulenol'],
  vetiver: ['khusimol', 'vetiverol'],
  frankincense: ['alpha-pinene', 'incensole'],
  'black pepper': ['piperine', 'beta-caryophyllene'],
  tobacco: ['nicotine', 'coumarin', 'furfural'],
  leather: ['isobutyl quinoline', 'birch tar'],
  iris: ['irone', 'isone'],
  cinnamon: ['cinnamaldehyde', 'eugenol'],
}

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
      // NOTE: BoilingPoint is not a valid PUG REST "fast" property (confirmed via direct
      // API test: including it returns 400 PUGREST.BadRequest even for compounds that
      // exist, e.g. linalool) - it was silently killing every lookup via the generic
      // catch-block retry/fallback path. boiling_point stays null until a PUG View-based
      // experimental-properties lookup is added (separate, larger feature).
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedNote}/property/MolecularWeight,XLogP/JSON`

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
        cid: props.CID ?? null,
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
 * Resolve a single note to PubChem data via, in order:
 *   1. the NOTE_COMPOUNDS map (average MW across whichever mapped compounds resolve,
 *      primary_cid = first compound in the list that resolves)
 *   2. a direct PubChem name lookup (note text itself happens to be a real compound name)
 *   3. fallback placeholder
 * Returns { molecular_weight, xlogp, boiling_point, primary_cid, source, detail } - detail
 * is a short human-readable string for console logging.
 */
async function resolveNote(note) {
  const mapped = NOTE_COMPOUNDS[note]

  if (mapped) {
    const results = []
    for (const compound of mapped) {
      const props = await fetchFromPubChem(compound)
      results.push({ compound, props })
    }

    const resolved = results.filter(r => r.props)
    if (resolved.length > 0) {
      const weights = resolved.map(r => parseFloat(r.props.molecular_weight)).filter(n => !Number.isNaN(n))
      const avgMw = weights.reduce((a, b) => a + b, 0) / weights.length
      const primary = resolved[0]

      return {
        molecular_weight: avgMw,
        xlogp: primary.props.xlogp,
        boiling_point: null,
        primary_cid: primary.props.cid,
        source: 'pubchem_mapped',
        detail: `mapped ${resolved.length}/${mapped.length} (${resolved.map(r => r.compound).join(', ')}), primary CID=${primary.props.cid}, avg MW=${avgMw.toFixed(2)}`,
      }
    }
    // Mapped, but none of the mapped compounds resolved - fall through to a direct
    // lookup of the note text itself as a last resort before giving up.
  }

  const direct = await fetchFromPubChem(note)
  if (direct) {
    return {
      molecular_weight: direct.molecular_weight,
      xlogp: direct.xlogp,
      boiling_point: direct.boiling_point,
      primary_cid: direct.cid,
      source: 'pubchem',
      detail: `direct hit, CID=${direct.cid}, MW=${direct.molecular_weight}`,
    }
  }

  return {
    molecular_weight: null,
    xlogp: null,
    boiling_point: null,
    primary_cid: null,
    source: 'fallback',
    detail: mapped ? `mapped compounds (${mapped.join(', ')}) all 404'd` : `no mapping, no direct hit`,
  }
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
      const notes = row.notes.replace(/(Top|Middle|Base|Heart):\s*/gi, "").split(",").map(n => n.trim().toLowerCase())
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

    const resolved = await resolveNote(note)

    if (resolved.source !== 'fallback') {
      console.log(`✓ ${resolved.detail}`)
      pubchemHits++
    } else {
      console.log(`⚠ Fallback (${resolved.detail})`)
      fallbacks.push(note)
    }

    toUpsert.push({
      name: note,
      volatility_class: resolved.source === 'fallback' ? null : getVolatilityClass(resolved.molecular_weight, false),
      molecular_weight: resolved.molecular_weight,
      xlogp: resolved.xlogp,
      boiling_point: resolved.boiling_point,
      primary_cid: resolved.primary_cid,
      source: resolved.source,
    })
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
