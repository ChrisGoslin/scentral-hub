#!/usr/bin/env node
// One-off merge of 3 Kaggle perfume datasets into the schema import-fragrances.mjs expects:
// brand,name,family,notes,gender
// Source files live in the local kagglehub cache (not committed to this repo).
// Usage: node scripts/build-import-csv.mjs

import { readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CACHE = join(homedir(), '.cache/kagglehub/datasets')

const SOURCES = {
  ayushghawana: join(CACHE, 'ayushghawana/perfume-dataset/versions/1/Perfumes_dataset.csv'),
  fraCleaned: join(CACHE, 'olgagmiufana1/fragrantica-com-fragrance-dataset/versions/3/fra_cleaned.csv'),
  fraPerfumes: join(CACHE, 'olgagmiufana1/fragrantica-com-fragrance-dataset/versions/3/fra_perfumes.csv'),
  parfumo: join(CACHE, 'ibrahimqasimi/parfumo-perfume-database-59k-fragrances/versions/1/02_Parfumo_Perfumes.csv'),
}

function parseDelimited(text, delimiter) {
  const lines = text.split(/\r?\n/)
  const headers = splitLine(lines[0], delimiter).map(h => h.trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = splitLine(lines[i], delimiter)
    const row = {}
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? '').trim() })
    rows.push(row)
  }
  return rows
}

function splitLine(line, delimiter) {
  const values = []
  let current = ''
  let inQuotes = false
  for (let j = 0; j < line.length; j++) {
    const char = line[j]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      values.push(current.replace(/^"|"$/g, ''))
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.replace(/^"|"$/g, ''))
  return values
}

function titleCaseWord(w) {
  if (/^[A-Z0-9]+$/.test(w) && w.length <= 4) return w // keep short all-caps as-is (CK, EDP, YSL)
  return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w
}

// fra_cleaned.csv stores brand/perfume as lowercase hyphenated slugs (e.g. "jean-paul-gaultier").
// Convert to spaced Title Case, matching the cleanup already applied to fra_perfumes.csv's
// URL-extracted brand/name below.
function slugToTitle(str) {
  return (str || '').replace(/[-_]+/g, ' ').trim().split(' ').map(titleCaseWord).join(' ')
}

const GENDER_MAP = {
  male: 'Masculine', men: 'Masculine', 'for men': 'Masculine',
  female: 'Feminine', women: 'Feminine', 'for women': 'Feminine',
  unisex: 'Unisex',
}
function normalizeGender(raw) {
  const key = (raw || '').trim().toLowerCase()
  return GENDER_MAP[key] || ''
}

function csvField(value) {
  const v = (value ?? '').replace(/"/g, "'").replace(/[\r\n]+/g, ' ').trim()
  return v.includes(',') ? `"${v}"` : v
}

const merged = []
const seen = new Set()
function addRow(brand, name, family, notes, gender) {
  brand = (brand || '').trim()
  name = (name || '').trim()
  if (!brand || !name) return
  const key = `${brand.toLowerCase()}|${name.toLowerCase()}`
  if (seen.has(key)) return
  seen.add(key)
  merged.push({ brand, name, family: family || '', notes: notes || '', gender: gender || '' })
}

// 1) ayushghawana/perfume-dataset
{
  const text = readFileSync(SOURCES.ayushghawana, 'utf8')
  const rows = parseDelimited(text, ',')
  for (const r of rows) {
    addRow(r.brand, r.perfume, '', r.category, normalizeGender(r.target_audience))
  }
  console.log(`✓ ayushghawana: ${rows.length} rows read`)
}

// 2) fragrantica fra_cleaned.csv (semicolon-delimited)
{
  const text = readFileSync(SOURCES.fraCleaned, 'utf8')
  const rows = parseDelimited(text, ';')
  for (const r of rows) {
    const notes = [r.top, r.middle, r.base, r.mainaccord1, r.mainaccord2, r.mainaccord3, r.mainaccord4, r.mainaccord5]
      .filter(Boolean).join(', ')
    addRow(slugToTitle(r.brand), slugToTitle(r.perfume), '', notes, normalizeGender(r.gender))
  }
  console.log(`✓ fra_cleaned: ${rows.length} rows read`)
}

// 3) fragrantica fra_perfumes.csv — Name field is malformed (brand+gender concatenated),
// so extract brand/name from the URL path instead: /perfume/<Brand>/<name-slug>-<id>.html
{
  const text = readFileSync(SOURCES.fraPerfumes, 'utf8')
  const rows = parseDelimited(text, ',')
  let extracted = 0
  for (const r of rows) {
    const m = (r.url || '').match(/\/perfume\/([^/]+)\/([^/]+?)(?:-\d+)?\.html/)
    if (!m) continue
    const brand = decodeURIComponent(m[1]).replace(/[-_]+/g, ' ').trim()
    const name = decodeURIComponent(m[2]).replace(/[-_]+/g, ' ').trim()
    addRow(brand, name, '', r['main accords'], normalizeGender(r.gender))
    extracted++
  }
  console.log(`✓ fra_perfumes: ${rows.length} rows read, ${extracted} had a parseable url`)
}

// 4) Parfumo 59k
{
  const text = readFileSync(SOURCES.parfumo, 'utf8')
  const rows = parseDelimited(text, ',')
  for (const r of rows) {
    const notes = [r.top_notes, r.middle_notes, r.base_notes, r.main_accords].filter(Boolean).join(', ')
    addRow(r.brand, r.name, '', notes, '')
  }
  console.log(`✓ parfumo: ${rows.length} rows read`)
}

console.log(`\n📦 Merged + deduped: ${merged.length} unique brand+name pairs`)

const header = 'brand,name,family,notes,gender'
const lines = [header, ...merged.map(r => [r.brand, r.name, r.family, r.notes, r.gender].map(csvField).join(','))]
writeFileSync('scripts/data/fragrances.csv', lines.join('\n') + '\n', 'utf8')
console.log(`✓ Wrote scripts/data/fragrances.csv`)
