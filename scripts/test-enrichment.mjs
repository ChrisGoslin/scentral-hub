#!/usr/bin/env node
// scripts/test-enrichment.mjs
// Local test script for description enrichment batch function
// Usage: node scripts/test-enrichment.mjs [--limit=N] [--dry-run]

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const args = process.argv.slice(2)
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '5')
const dryRun = args.includes('--dry-run')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const anthropicApiKey = process.env.ANTHROPIC_API_KEY

console.log('🔧 Description Enrichment Test Script')
console.log('=====================================\n')

// Validate env vars
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}
if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}
if (!anthropicApiKey) {
  console.error('❌ Missing ANTHROPIC_API_KEY in .env.local')
  process.exit(1)
}

console.log('✅ Environment variables loaded\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Fetch fragrances without descriptions
console.log(`📋 Fetching ${limit} fragrances without descriptions...`)
const { data: fragrances, error: queryError } = await supabase
  .from('fragrances')
  .select('id, name, brand, plain_description, interaction_count')
  .is('plain_description', null)
  .order('interaction_count', { ascending: false })
  .limit(limit)

if (queryError) {
  console.error('❌ Query error:', queryError.message)
  process.exit(1)
}

if (!fragrances || fragrances.length === 0) {
  console.log('✅ No fragrances without descriptions found. Queue is up to date!')
  process.exit(0)
}

console.log(`✅ Found ${fragrances.length} fragrances\n`)

if (dryRun) {
  console.log('🔍 DRY RUN — would process:\n')
  fragrances.forEach((f, i) => {
    console.log(`${i + 1}. ${f.brand} — ${f.name} (${f.id})`)
  })
  console.log('\n✅ Dry run complete. Re-run without --dry-run to proceed.')
  process.exit(0)
}

// Get fragrance notes for each
console.log('📝 Fetching notes and generating descriptions...\n')

let created = 0
let skipped = 0
let errored = 0
const results = []

for (const fragrance of fragrances) {
  try {
    // Check if already queued
    const { data: existing } = await supabase
      .from('description_enrichment_queue')
      .select('id')
      .eq('fragrance_id', fragrance.id)
      .single()

    if (existing) {
      console.log(`⏭️  Skipped ${fragrance.name}: already in queue`)
      skipped++
      continue
    }

    // Get notes
    const { data: notesData } = await supabase
      .from('fragrance_notes')
      .select('note')
      .eq('fragrance_id', fragrance.id)
      .limit(20)

    const notesList = (notesData || []).map(n => n.note).join(', ') || 'Unknown notes'

    // Generate via Claude
    console.log(`🤖 Generating for ${fragrance.brand} — ${fragrance.name}...`)

    const prompt = `Generate a 2-3 sentence fragrance description in nota-tone style (opening → heart → drydown) for: ${fragrance.name} by ${fragrance.brand}. Notes: ${notesList}. Be sensory, never technical or marketing-speak. Example reference tone: "Opens with citrus brightness that softens as it dries. The heart blooms with florals before settling into warm woods." Keep to ~2-3 sentences. Reply with only the description, no quotes or preamble.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API ${response.status}: ${error}`)
    }

    const data = await response.json()
    const description = data.content[0].text.trim()

    // Insert into queue
    const { error: insertError } = await supabase
      .from('description_enrichment_queue')
      .insert({
        fragrance_id: fragrance.id,
        generated_description: description,
        status: 'pending_review'
      })

    if (insertError) throw insertError

    console.log(`✅ Created queue record\n`)
    created++
    results.push({ fragrance_id: fragrance.id, status: 'success' })
  } catch (err) {
    errored++
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`❌ Error: ${msg}\n`)
    results.push({ fragrance_id: fragrance.id, status: 'error', error: msg })
  }
}

console.log('\n📊 Summary')
console.log('==========')
console.log(`Created: ${created}`)
console.log(`Skipped: ${skipped}`)
console.log(`Errored: ${errored}`)
console.log(`\nTotal processed: ${fragrance.length}`)
console.log('\n✅ Test complete!')
console.log('→ Review pending descriptions at: /admin/enrichment')
