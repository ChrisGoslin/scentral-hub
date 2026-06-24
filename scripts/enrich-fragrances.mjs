#!/usr/bin/env node
// Enrich fragrances with Claude-generated descriptions
// Usage: node scripts/enrich-fragrances.mjs [--dry-run]
// Queries fragrances WHERE plain_description IS NULL LIMIT 100
// Rate limit: 2 requests/second max
// Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const isDryRun = process.argv.includes('--dry-run')
const delayMs = 500 // Rate limit: 2 requests per second (1000ms / 2)

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

if (!env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local')
  process.exit(1)
}
if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}
if (!env.SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

// ── Clients ───────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Fetch fragrances needing enrichment ────────────────────────────────────────
// Test batch: top Middle Eastern brands from the 2026-06-23 bulk import, whose
// plain_description is currently just the raw comma-joined notes/accords text.
const { data: fragrances, error: fetchErr } = await supabase
  .from('fragrances')
  .select('id, brand, name, family, notes')
  .like('plain_description', '%,%')
  .gt('created_at', '2026-06-23')
  .or('brand.ilike.lattafa,brand.ilike.afnan,brand.ilike.armaf,brand.ilike.rasasi,brand.ilike.al haramain')
  .limit(50)

if (fetchErr) {
  console.error('Failed to fetch fragrances:', fetchErr.message)
  process.exit(1)
}

console.log(`✓ Found ${fragrances?.length || 0} fragrances with NULL plain_description\n`)

if (!fragrances || fragrances.length === 0) {
  console.log('✅ All fragrances enriched.')
  process.exit(0)
}

// ── Enrich each fragrance ─────────────────────────────────────────────────────
const updates = []
let successful = 0
let failed = 0

for (let i = 0; i < fragrances.length; i++) {
  const frag = fragrances[i]

  const prompt = `Fragrance: ${frag.brand} ${frag.name}. Family: ${frag.family}. In max 20 words, describe how it smells in plain English for a newcomer. Return JSON only: {"plain_description": "..."}`

  if (isDryRun) {
    console.log(`[DRY RUN] ${frag.brand} ${frag.name}`)
    continue
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
    const content = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      console.error(`❌ Parse error: ${frag.brand} ${frag.name}`)
      failed++
      await sleep(delayMs)
      continue
    }

    if (parsed.plain_description) {
      updates.push({
        id: frag.id,
        plain_description: parsed.plain_description,
      })
      successful++
      console.log(`✓ ${frag.brand} ${frag.name}`)
    } else {
      failed++
    }

    await sleep(delayMs)
  } catch (err) {
    console.error(`❌ API error: ${frag.brand} ${frag.name}`)
    failed++
    await sleep(delayMs)
  }
}

console.log(`\n📊 ${successful} successful, ${failed} failed\n`)

if (isDryRun) {
  console.log('🏜️ Dry run — no DB updates.')
  process.exit(0)
}

if (updates.length === 0) {
  console.log('✓ No updates to write.')
  process.exit(0)
}

console.log(`⏳ Updating Supabase with ${updates.length} descriptions...`)

for (const update of updates) {
  await supabase
    .from('fragrances')
    .update({ plain_description: update.plain_description })
    .eq('id', update.id)
}

console.log(`✅ Updated ${updates.length} fragrances`)
