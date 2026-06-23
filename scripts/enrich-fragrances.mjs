#!/usr/bin/env node
// Enrich fragrances with AI-generated descriptions using Claude Haiku
// Usage: node scripts/enrich-fragrances.mjs [--dry-run] [--limit=N]
// Queries for rows WHERE plain_description IS NULL
// Rate limit: 1 request per second (configurable)
// Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Config ──────────────────────────────────────────────────────────────────
const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 50
const delayMs = 1000 // Rate limit: 1 request per second

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

// ── Sleep helper ──────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Fetch fragrances needing enrichment ────────────────────────────────────────
const { data: fragrances, error: fetchErr } = await supabase
  .from('fragrances')
  .select('id, brand, name, family, notes')
  .is('plain_description', null)
  .limit(limit)

if (fetchErr) {
  console.error('Failed to fetch fragrances:', fetchErr.message)
  process.exit(1)
}

console.log(`✓ Found ${fragrances?.length || 0} fragrances with NULL plain_description\n`)

if (!fragrances || fragrances.length === 0) {
  console.log('✅ No fragrances to enrich.')
  process.exit(0)
}

// ── Enrich each fragrance ─────────────────────────────────────────────────────
const updates = []
let successful = 0
let failed = 0

for (let i = 0; i < fragrances.length; i++) {
  const frag = fragrances[i]

  // Build prompt
  const notes = frag.notes ? `Notes: ${frag.notes}` : 'Notes: [Not provided]'
  const prompt = `Given this fragrance:
Brand: ${frag.brand}
Name: ${frag.name}
Family: ${frag.family}
${notes}

Write JSON with exactly these two fields:
{
  "plain_description": "<1-2 sentence plain English description of how it smells, max 20 words>",
  "use_case": "<3-word context, e.g. 'Date night, winter' or 'Office, fresh'>"
}

Return ONLY valid JSON, no markdown or explanation.`

  if (isDryRun) {
    console.log(`[DRY RUN] Would enrich: ${frag.brand} ${frag.name}`)
    console.log(`Prompt: ${prompt}\n`)
    continue
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    let parsed

    try {
      parsed = JSON.parse(content)
    } catch {
      console.error(`❌ Parse error for ${frag.brand} ${frag.name}:`, content)
      failed++
      await sleep(delayMs)
      continue
    }

    updates.push({
      id: frag.id,
      plain_description: parsed.plain_description || null,
      use_case: parsed.use_case || null,
    })

    successful++
    console.log(`✓ ${frag.brand} ${frag.name}: "${parsed.plain_description}" (${parsed.use_case})`)

    // Rate limit
    await sleep(delayMs)
  } catch (err) {
    console.error(`❌ API error for ${frag.brand} ${frag.name}:`, err.message)
    failed++
    await sleep(delayMs)
  }
}

console.log(`\n📊 Enrichment complete: ${successful} successful, ${failed} failed\n`)

if (isDryRun) {
  console.log('🏜️ Dry run enabled. No updates written to DB.')
  process.exit(0)
}

// ── Write updates ─────────────────────────────────────────────────────────────
if (updates.length === 0) {
  console.log('⚠️ No updates to write.')
  process.exit(0)
}

console.log(`⏳ Writing ${updates.length} updates to Supabase...`)

for (const update of updates) {
  const { error } = await supabase
    .from('fragrances')
    .update({
      plain_description: update.plain_description,
      use_case: update.use_case,
    })
    .eq('id', update.id)

  if (error) {
    console.error(`❌ Update error for id ${update.id}:`, error.message)
  }
}

console.log(`✅ Updated ${updates.length} fragrances`)
