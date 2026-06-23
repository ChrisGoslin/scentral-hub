#!/usr/bin/env node
// Bulk import fragrances from FragDB Kaggle dataset
// Usage: node scripts/import-fragrances.mjs [--dry-run]
// CSV path: scripts/data/fragrances.csv
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const isDryRun = process.argv.includes('--dry-run')
const BATCH_SIZE = 100

// Map AXIS_MAP from app/(main)/wheel/page.tsx
const AXIS_MAP = {
  'Fresh Aromatic': 'Fresh', 'Fresh Woody': 'Fresh', 'Fresh Aquatic': 'Aquatic',
  'Fresh Marine': 'Aquatic', 'Fresh Floral': 'Fresh', 'Fresh Fougere': 'Fresh',
  'Fresh Citrus': 'Fresh', 'Citrus Woody': 'Fresh', 'Woody Aromatic': 'Woody',
  'Woody Spicy': 'Woody', 'Woody Oud': 'Oud', 'Woody Oriental': 'Oriental',
  'Woody Powdery': 'Woody', 'Aromatic Woody': 'Woody', 'Aromatic Fougere': 'Aromatic',
  'Dark Leather Oud': 'Oud', 'Floral Oriental': 'Floral', 'Floral Musk': 'Floral',
  'Floral Fruity': 'Floral', 'Floral Powdery': 'Floral', 'Floral Musky': 'Floral',
  'Fresh Floral Musk': 'Floral', 'White Floral Woody': 'Floral', 'Fruity Chypre': 'Fruity',
  'Fruity Floral': 'Fruity', 'Fruit Oriental': 'Fruity', 'Oriental Amber': 'Oriental',
  'Oriental Spicy': 'Oriental', 'Oriental Floral': 'Oriental', 'Oriental Musk': 'Oriental',
  'Oriental Vanilla': 'Oriental', 'Oriental Woody': 'Oriental', 'Spicy Amber': 'Spicy',
  'Spicy Oriental': 'Spicy', 'Sweet Aromatic': 'Gourmand', 'Amber Gourmand': 'Gourmand',
  'Gourmand': 'Gourmand', 'Vanilla Amber': 'Gourmand', 'Aromatic': 'Aromatic',
  'Musky': 'Aromatic',
}

const GENDER_TO_USECASE = {
  'Masculine': 'Daily, office',
  'Feminine': 'Date night',
  'Unisex': 'Daily, versatile',
}

function normalizeGender(raw) {
  const trimmed = (raw || '').trim()
  if (trimmed.toLowerCase() === 'unisex') return 'Unisex'
  return trimmed
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map(w => {
      if (!w) return w
      if (/^[A-Z0-9]+$/.test(w) && w.length <= 4) return w // keep short all-caps as-is (CK, EDP, YSL)
      return w[0].toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')
}

function splitCamelCase(str) {
  // Skip if it looks intentional: all-caps abbreviations, known patterns
  if (/^[A-Z0-9]+$/.test(str)) return str // all caps = abbreviation
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // HTMLParser → HTML Parser
    .trim()
}

function isJunkName(name) {
  if (!name || name.length < 2) return true
  if (/[?%@]/.test(name)) return true
  if (/^\d+$/.test(name)) return true
  if (/ com$/i.test(name)) return true
  return false
}

function parseNotes(notes) {
  if (!notes) return null
  // Format A: Python list string ("['woody', 'rose']")
  if (notes.startsWith("['") || notes.startsWith('["')) {
    const matches = notes.match(/['"]([^'"]+)['"]/g)
    if (matches) {
      return matches
        .map(m => m.replace(/['"]/g, '').trim())
        .filter(Boolean)
        .join(', ')
    }
  }
  // Format B: plain text ("Fresh Scent", "Woody Spicy") — use as-is
  return notes.trim()
}

// Keyword-based family derivation
function deriveFamily(notes) {
  if (!notes) return 'Aromatic'
  const n = notes.toLowerCase()
  if (/fresh|citrus|aquatic|marine|herbal/.test(n)) return 'Fresh Aromatic'
  if (/woody|cedar|sandalwood|oud/.test(n)) return 'Woody Aromatic'
  if (/floral|rose|jasmine|peony|lilac/.test(n)) return 'Floral Oriental'
  if (/fruity|apple|peach|berry|raspberry/.test(n)) return 'Fruity Floral'
  if (/spicy|pepper|cinnamon|cardamom|clove/.test(n)) return 'Spicy Oriental'
  if (/vanilla|gourmand|amber|caramel|tonka/.test(n)) return 'Amber Gourmand'
  return 'Aromatic'
}

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))

    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }
  return rows
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
  records = parseCSV(csvContent)
  console.log(`✓ Loaded ${records.length} records from scripts/data/fragrances.csv\n`)
} catch (err) {
  console.error('Failed to read CSV:', err.message)
  process.exit(1)
}

// ── Fetch existing fragrances ─────────────────────────────────────────────────
const { data: existing } = await supabase
  .from('fragrances')
  .select('id, brand, name')
  .limit(10000)

const existingKeys = new Set(
  (existing || []).map(f => `${f.brand.toLowerCase()}|${f.name.toLowerCase()}`)
)

console.log(`✓ Found ${existing?.length || 0} existing fragrances\n`)

// ── Prepare rows ──────────────────────────────────────────────────────────────
const rowsToInsert = []
let skipped = 0

for (const row of records) {
  const brand = (row.brand || '').trim()
  let name = (row.name || '').trim()

  if (!brand || !name) {
    skipped++
    continue
  }

  if (isJunkName(name)) {
    skipped++
    continue
  }

  name = splitCamelCase(toTitleCase(name))

  const key = `${brand.toLowerCase()}|${name.toLowerCase()}`
  if (existingKeys.has(key)) {
    skipped++
    continue
  }

  const rawFamily = (row.family || '').trim()
  const parsedNotes = parseNotes(row.notes)
  const notesWordCount = parsedNotes ? parsedNotes.split(/[,\s]+/).filter(Boolean).length : 0

  // Truly empty signal: no family given AND fewer than 2 words of notes — nothing to offer users.
  if (!rawFamily && notesWordCount < 2) {
    skipped++
    continue
  }

  const family = rawFamily || deriveFamily(row.notes || '')
  const normalizedFamily = AXIS_MAP[family] || family

  const useCase = GENDER_TO_USECASE[normalizeGender(row.gender)] || null

  rowsToInsert.push({
    brand,
    name,
    family: normalizedFamily,
    projection: 'Moderate',
    use_case: useCase,
    plain_description: parsedNotes,
    image_url: null,
  })
}

console.log(`📊 ${rowsToInsert.length} new + ${skipped} skipped = ${records.length} total`)
console.log(`📝 Ready to insert ${rowsToInsert.length} rows in batches of ${BATCH_SIZE}\n`)

if (isDryRun) {
  console.log('🏜️ DRY RUN. Sample rows:')
  console.table(rowsToInsert.slice(0, 3))
  process.exit(0)
}

if (rowsToInsert.length === 0) {
  console.log('✓ No new fragrances to insert.')
  process.exit(0)
}

// ── Batch insert ──────────────────────────────────────────────────────────────
let inserted = 0
let errors = 0

for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
  const batch = rowsToInsert.slice(i, i + BATCH_SIZE)
  console.log(`⏳ Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}...`)

  try {
    const { error } = await supabase
      .from('fragrances')
      .insert(batch)

    if (error) {
      console.error(`❌ Batch error: ${error.message}`)
      errors += batch.length
    } else {
      inserted += batch.length
    }
  } catch (err) {
    console.error(`❌ Unexpected error: ${err.message}`)
    errors += batch.length
  }
}

console.log(`\n✅ Inserted ${inserted} / Skipped ${skipped} (duplicates) / Errors ${errors}`)
process.exit(errors > 0 ? 1 : 0)
