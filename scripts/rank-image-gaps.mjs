#!/usr/bin/env node
/**
 * rank-image-gaps.mjs
 *
 * Ranks fragrances with NULL image_url by user-facing surface area, so image
 * enrichment effort (retailer runs, affiliate images, manual fills) goes where
 * users actually look first — not into the 120k-row catalog tail.
 *
 * Read-only: never writes to the DB. Output goes to stdout (top N) and
 * scripts/data/image-priority.csv (full ranked list of scored rows).
 *
 * Usage:
 *   node scripts/rank-image-gaps.mjs             # top 50 + CSV
 *   node scripts/rank-image-gaps.mjs --top=200   # top 200 + CSV
 *
 * Signals and weights (pre-launch reality, verified 2026-07-04: collections,
 * wear_logs, layering_combinations, spritz_schedules are all EMPTY — the
 * behavioral signals are wired in so the ranking gets better automatically
 * once real usage lands, and are silently skipped while tables are empty):
 *   BOX        +100 per active discovery box containing the fragrance
 *              (curated commerce surface — a box with an imageless bottle is
 *              a broken storefront, these must be fixed first)
 *   COLLECTION +3 per collections row (user shelves)
 *   WEAR       +2 per wear_logs row
 *   RATING     +rating (0-10; Discover sorts by image first THEN rating, so
 *              rating ≈ how prominently the row surfaces once it has an image)
 *   SPRITZ     +spritz_count (seeded usage counter on fragrances)
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const outFile = path.join(dataDir, 'image-priority.csv')

const topArg = process.argv.find(a => a.startsWith('--top='))
const topN = topArg ? parseInt(topArg.split('=')[1], 10) : 50

const WEIGHTS = { box: 100, collection: 3, wear: 2 }

// Page through a table, invoking onRow for each row. Tables are empty
// pre-launch and columns may drift, so any error just skips the signal
// (loudly, never silently).
async function forEachRow(table, columns, onRow) {
  let from = 0
  while (true) {
    const { data, error } = await supabase.from(table).select(columns)
      .order(columns.split(',')[0].trim(), { ascending: true }) // stable pagination
      .range(from, from + 999)
    if (error) {
      console.log(`  ⚠️  Skipping signal "${table}": ${error.message}`)
      return
    }
    if (!data.length) break
    for (const row of data) onRow(row)
    if (data.length < 1000) break
    from += 1000
  }
}

console.log('\n🎯 BaseNote — NULL-image priority ranking (read-only)\n')

// Signal: discovery box membership
const boxCounts = new Map()
const { data: boxes, error: boxErr } = await supabase
  .from('discovery_boxes')
  .select('name, fragrance_ids, active')
if (boxErr) {
  console.log(`  ⚠️  Skipping signal "discovery_boxes": ${boxErr.message}`)
} else {
  for (const box of boxes) {
    if (box.active === false) continue
    for (const id of box.fragrance_ids || []) {
      boxCounts.set(id, (boxCounts.get(id) || 0) + 1)
    }
  }
}

// Signals: user behaviour (empty pre-launch, self-activating later).
// wear_logs has no fragrance_id — it references collections.id via
// collection_id, so wears resolve through the collection→fragrance map.
const collectionCounts = new Map()
const collectionToFragrance = new Map()
await forEachRow('collections', 'id, fragrance_id', row => {
  if (!row.fragrance_id) return
  collectionCounts.set(row.fragrance_id, (collectionCounts.get(row.fragrance_id) || 0) + 1)
  collectionToFragrance.set(row.id, row.fragrance_id)
})
const wearCounts = new Map()
await forEachRow('wear_logs', 'id, collection_id', row => {
  const fragId = collectionToFragrance.get(row.collection_id)
  if (fragId) wearCounts.set(fragId, (wearCounts.get(fragId) || 0) + 1)
})
console.log(`  Signals: boxes=${boxCounts.size} collections=${collectionCounts.size} wears=${wearCounts.size} fragrance ids\n`)

// Score every NULL-image fragrance. rating/spritz_count live on the row
// itself; behavioural signals join by id.
const scored = []
let from = 0
let scanned = 0
while (true) {
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, rating, spritz_count')
    .is('image_url', null)
    .order('id', { ascending: true }) // stable pagination — without ORDER BY, range windows skip/repeat rows
    .range(from, from + 999)
  if (error) { console.error('❌ DB error:', error.message); process.exit(1) }
  if (!data.length) break
  scanned += data.length
  for (const f of data) {
    const box = boxCounts.get(f.id) || 0
    const coll = collectionCounts.get(f.id) || 0
    const wear = wearCounts.get(f.id) || 0
    // rating is numeric but spritz_count is a TEXT column — coerce both, or
    // `+` silently concatenates ("10" + 5 → "105") and corrupts every score
    const rating = Number(f.rating) || 0
    const spritz = Number(f.spritz_count) || 0
    const score = box * WEIGHTS.box + coll * WEIGHTS.collection + wear * WEIGHTS.wear + rating + spritz
    if (score > 0) scored.push({ ...f, box, coll, wear, rating, spritz, score })
  }
  if (data.length < 1000) break
  from += 1000
}

scored.sort((a, b) => b.score - a.score)

console.log(`Scanned ${scanned} NULL-image fragrances — ${scored.length} carry at least one signal.`)
console.log(`(The other ${scanned - scored.length} are catalog tail with zero user-facing surface today.)\n`)

console.log(`Top ${Math.min(topN, scored.length)}:`)
console.log('score | box coll wear rating spritz | fragrance')
for (const f of scored.slice(0, topN)) {
  console.log(
    `${String(f.score).padStart(5)} | ${String(f.box).padStart(3)} ${String(f.coll).padStart(4)} ${String(f.wear).padStart(4)} ${String(f.rating).padStart(6)} ${String(f.spritz).padStart(6)} | ${f.brand} / ${f.name}`
  )
}

const csv = ['score,box,collections,wears,rating,spritz_count,brand,name,id']
for (const f of scored) {
  const esc = s => `"${String(s).replaceAll('"', '""')}"`
  csv.push([f.score, f.box, f.coll, f.wear, f.rating, f.spritz, esc(f.brand), esc(f.name), f.id].join(','))
}
fs.writeFileSync(outFile, csv.join('\n') + '\n')
console.log(`\n📄 Full ranked list (${scored.length} rows) → ${outFile}\n`)
