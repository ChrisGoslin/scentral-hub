#!/usr/bin/env node
// Bulk import fragrances from Kaggle CSV
// Usage: node scripts/import-fragrances.mjs [--dry-run] [--limit=N]
// CSV path: scripts/data/fragrances.csv
// Expected columns: brand, name, notes (or top_notes/heart_notes/base_notes), gender, year, family
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

// ── Config ──────────────────────────────────────────────────────────────────
const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity

// Map external family strings to normalized axis values (from app/(main)/wheel/page.tsx)
const AXIS_MAP = {
  'Fresh Aromatic':   'Fresh',
  'Fresh Woody':      'Fresh',
  'Fresh Aquatic':    'Aquatic',
  'Fresh Marine':     'Aquatic',
  'Fresh Floral':     'Fresh',
  'Fresh Fougere':    'Fresh',
  'Fresh Citrus':     'Fresh',
  'Citrus Woody':     'Fresh',
  'Woody Aromatic':   'Woody',
  'Woody Spicy':      'Woody',
  'Woody Oud':        'Oud',
  'Woody Oriental':   'Oriental',
  'Woody Powdery':    'Woody',
  'Aromatic Woody':   'Woody',
  'Aromatic Fougere': 'Aromatic',
  'Dark Leather Oud': 'Oud',
  'Floral Oriental':  'Floral',
  'Floral Musk':      'Floral',
  'Floral Fruity':    'Floral',
  'Floral Powdery':   'Floral',
  'Floral Musky':     'Floral',
  'Fresh Floral Musk':'Floral',
  'White Floral Woody':'Floral',
  'Fruity Chypre':    'Fruity',
  'Fruity Floral':    'Fruity',
  'Fruit Oriental':   'Fruity',
  'Oriental Amber':   'Oriental',
  'Oriental Spicy':   'Oriental',
  'Oriental Floral':  'Oriental',
  'Oriental Musk':    'Oriental',
  'Oriental Vanilla': 'Oriental',
  'Oriental Woody':   'Oriental',
  'Spicy Amber':      'Spicy',
  'Spicy Oriental':   'Spicy',
  'Sweet Aromatic':   'Gourmand',
  'Amber Gourmand':   'Gourmand',
  'Gourmand':         'Gourmand',
  'Vanilla Amber':    'Gourmand',
  'Aromatic':         'Aromatic',
  'Musky':            'Aromatic',
}

// Simple keyword-based family derivation if not provided in CSV
const KEYWORD_FAMILY_MAP = {
  'fresh|citrus|aquatic|marine|aromatic': 'Fresh Aromatic',
  'woody|cedar|sandalwood|oud': 'Woody Aromatic',
  'floral|rose|jasmine|peony': 'Floral Oriental',
  'fruity|apple|peach|berries': 'Fruity Floral',
  'spicy|pepper|cinnamon|cardamom': 'Spicy Oriental',
  'vanilla|gourmand|amber|caramel': 'Amber Gourmand',
  'musk|clean|powdery': 'Aromatic',
}

function deriveFamily(notes) {
  if (!notes) return 'Aromatic'
  const notesLower = notes.toLowerCase()
  for (const [keywords, family] of Object.entries(KEYWORD_FAMILY_MAP)) {
    if (keywords.split('|').some(k => notesLower.includes(k))) {
      return family
    }
  }
  return 'Aromatic'
}

function normalizeFamilyToAxis(family) {
  return AXIS_MAP[family] || family
}

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

if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}
if (!env.SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

// ── Load CSV ──────────────────────────────────────────────────────────────────
let records
try {
  const csvContent = readFileSync('scripts/data/fragrances.csv', 'utf8')
  records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  })
  console.log(`✓ Loaded ${records.length} records from scripts/data/fragrances.csv`)
} catch (err) {
  console.error('Failed to read CSV:', err.message)
  process.exit(1)
}

// ── Fetch existing fragrances ─────────────────────────────────────────────────
const { data: existing } = await supabase
  .from('fragrances')
  .select('id, brand, name')
  .limit(5000)

const existingKeys = new Set(
  (existing || []).map(f => `${f.brand.toLowerCase()}|${f.name.toLowerCase()}`)
)

console.log(`✓ Found ${existing?.length || 0} existing fragrances`)

// ── Prepare upsert rows ───────────────────────────────────────────────────────
const rowsToInsert = []
let skipped = 0
let processed = 0

for (const row of records) {
  if (processed >= limit) break

  const brand = (row.brand || '').trim()
  const name = (row.name || '').trim()

  if (!brand || !name) {
    skipped++
    continue
  }

  const key = `${brand.toLowerCase()}|${name.toLowerCase()}`
  if (existingKeys.has(key)) {
    skipped++
    continue
  }

  let family = (row.family || '').trim()
  if (!family) {
    const notes = row.notes || row.top_notes || ''
    family = deriveFamily(notes)
  }

  const normalizedFamily = normalizeFamilyToAxis(family)
  const notes = (row.top_notes && row.heart_notes && row.base_notes)
    ? `${row.top_notes} / ${row.heart_notes} / ${row.base_notes}`
    : (row.notes || '')

  rowsToInsert.push({
    brand,
    name,
    family: normalizedFamily,
    projection: 'Moderate',
    notes: notes.trim() || null,
    lean: row.gender === 'male' ? 'masculine' : row.gender === 'female' ? 'feminine' : null,
    optimal_season: null,
    use_case: null,
    plain_description: null,
    inspired_by: null,
    image_url: null,
  })

  processed++
}

console.log(`\n📊 Deduplication: ${processed} new + ${skipped} skipped = ${records.length} total`)
console.log(`📝 Ready to insert ${rowsToInsert.length} rows\n`)

if (isDryRun) {
  console.log('🏜️ Dry run enabled. Sample of rows that would be inserted:')
  console.table(rowsToInsert.slice(0, 3))
  process.exit(0)
}

// ── Upsert ────────────────────────────────────────────────────────────────────
if (rowsToInsert.length === 0) {
  console.log('✓ No new fragrances to insert.')
  process.exit(0)
}

console.log(`⏳ Inserting ${rowsToInsert.length} rows...`)

try {
  const { error } = await supabase
    .from('fragrances')
    .insert(rowsToInsert)

  if (error) {
    console.error('❌ Upsert error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Successfully inserted ${rowsToInsert.length} fragrances`)
} catch (err) {
  console.error('❌ Unexpected error:', err.message)
  process.exit(1)
}
