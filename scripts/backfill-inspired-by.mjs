#!/usr/bin/env node
// Backfill inspired_by column — identifies the designer fragrance each clone is based on
// Run from repo root: node scripts/backfill-inspired-by.mjs
// Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local

import Anthropic from '@anthropic-ai/sdk'
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      return [key, val]
    })
)

if (!env.ANTHROPIC_API_KEY)    { console.error('Missing ANTHROPIC_API_KEY in .env.local'); process.exit(1) }
if (!env.NEXT_PUBLIC_SUPABASE_URL) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL'); process.exit(1) }
if (!env.SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
const supabase  = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

const BATCH_SIZE = 15
const DELAY_MS   = 600

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── AI call ───────────────────────────────────────────────────────────────────
async function getInspiredBy(batch) {
  const prompt = `You are a fragrance expert with deep knowledge of Middle Eastern fragrance houses (Lattafa, Afnan, Rasasi, Armaf, Swiss Arabian, Khadlaj, Al Haramain, etc.) and their relationships to designer fragrances.

For each fragrance below, identify the well-known designer fragrance it is commonly inspired by or compared to.
Only return a value if you are confident (>80%). Return null if you are not sure.
Do NOT guess. Do NOT make up designer names. Stick to real, recognisable names like "Creed Aventus", "Paco Rabanne 1 Million", "Dior Sauvage", etc.

Fragrances to classify:
${JSON.stringify(batch, null, 2)}

Return a JSON array ONLY (no markdown, no explanation):
[{ "id": "...", "inspired_by": "Brand Name Fragrance" | null }]`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text    = msg.content[0].text.trim()
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, top_notes, heart_notes, base_notes, projection')
    .is('inspired_by', null)
    .order('brand')

  if (error) { console.error('DB fetch error:', error.message); process.exit(1) }

  console.log(`Found ${fragrances.length} fragrances needing inspired_by`)

  const batches = []
  for (let i = 0; i < fragrances.length; i += BATCH_SIZE) {
    batches.push(fragrances.slice(i, i + BATCH_SIZE))
  }

  let totalWritten = 0
  let totalSkipped = 0

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`\nBatch ${i + 1}/${batches.length} (${batch.length} fragrances)...`)

    let results
    try {
      results = await getInspiredBy(batch)
    } catch (err) {
      console.error(`  Haiku error on batch ${i + 1}:`, err.message)
      await sleep(DELAY_MS * 3)
      continue
    }

    for (const { id, inspired_by } of results) {
      if (!inspired_by) { totalSkipped++; continue }
      const { error: updateErr } = await supabase
        .from('fragrances')
        .update({ inspired_by })
        .eq('id', id)
      if (updateErr) {
        console.error(`  Update error for ${id}:`, updateErr.message)
      } else {
        const frag = batch.find(f => f.id === id)
        console.log(`  ✓ ${frag?.brand} ${frag?.name} → ${inspired_by}`)
        totalWritten++
      }
    }

    if (i < batches.length - 1) await sleep(DELAY_MS)
  }

  const { count } = await supabase
    .from('fragrances')
    .select('*', { count: 'exact', head: true })
    .not('inspired_by', 'is', null)

  console.log(`\n── Done ───────────────────────────────────────────`)
  console.log(`Written this run: ${totalWritten}`)
  console.log(`No match found:   ${totalSkipped}`)
  console.log(`Total with inspired_by: ${count}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
