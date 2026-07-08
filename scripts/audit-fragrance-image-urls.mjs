#!/usr/bin/env node
/**
 * audit-fragrance-image-urls.mjs
 *
 * Recurring read-only audit for page-style fragrance image URLs that should
 * not be persisted in fragrances.image_url.
 *
 * Usage:
 *   node scripts/audit-fragrance-image-urls.mjs
 *   node scripts/audit-fragrance-image-urls.mjs --sample=20
 *   node scripts/audit-fragrance-image-urls.mjs --apply
 *
 * Exit codes:
 *   0 = no suspect rows found, or cleanup applied successfully
 *   1 = one or more suspect rows found in dry-run mode
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const sampleArg = process.argv.find(arg => arg.startsWith('--sample='))
const sampleLimit = sampleArg ? parseInt(sampleArg.split('=')[1], 10) : 12
const isApply = process.argv.includes('--apply')
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i

function loadAllowedImageHosts() {
  const hostsPath = path.join(repoRoot, 'lib', 'fragranceImageHosts.js')
  const source = fs.readFileSync(hostsPath, 'utf8')
  const hosts = new Set()
  const hostnamePattern = /'([^']+)'/g
  let match
  while ((match = hostnamePattern.exec(source)) !== null) {
    hosts.add(match[1].toLowerCase())
  }
  return hosts
}

function extractParsedUrl(value) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function classifyFragranceImageUrl(imageUrl, allowedHosts) {
  if (typeof imageUrl !== 'string') return null
  const trimmed = imageUrl.trim()
  if (!trimmed) return null

  const parsed = extractParsedUrl(trimmed)
  if (!parsed) return 'invalid_url'
  if (parsed.protocol.toLowerCase() !== 'https:') return 'non_https_url'
  if (!allowedHosts.has(parsed.hostname.toLowerCase())) {
    return `host_not_allowed:${parsed.hostname.toLowerCase()}`
  }

  if (/fragrantica\.com\/.+\.html(?:[?#].*)?$/i.test(trimmed)) return 'fragrantica_page_html'
  if (
    /parfumo\.com\/Perfumes\/[^?#]+$/i.test(trimmed) &&
    !IMAGE_EXTENSION_PATTERN.test(trimmed)
  ) {
    return 'parfumo_perfume_page'
  }
  if (
    /fragrantica\.com\/perfume\/[^?#]+$/i.test(trimmed) &&
    !IMAGE_EXTENSION_PATTERN.test(trimmed)
  ) {
    return 'fragrantica_perfume_page'
  }
  return null
}

async function main() {
  const allowedHosts = loadAllowedImageHosts()
  let lastId = '00000000-0000-0000-0000-000000000000'
  const samples = []
  const counts = new Map()
  const idsToNull = []
  let totalScanned = 0

  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, brand, name, image_url')
      .not('image_url', 'is', null)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(1000)

    if (error) {
      console.error('❌ DB query failed:', error.message)
      process.exit(1)
    }

    if (!data || data.length === 0) break

    totalScanned += data.length
    lastId = data[data.length - 1].id

    for (const row of data) {
      const suspectType = classifyFragranceImageUrl(row.image_url, allowedHosts)
      if (!suspectType) continue

      counts.set(suspectType, (counts.get(suspectType) || 0) + 1)
      idsToNull.push(row.id)
      if (samples.length < sampleLimit) {
        samples.push({
          id: row.id,
          brand: row.brand,
          name: row.name,
          image_url: row.image_url,
          suspectType,
        })
      }
    }

    if (data.length < 1000) break
  }

  const suspectCount = Array.from(counts.values()).reduce((sum, n) => sum + n, 0)
  const report = {
    scanned: totalScanned,
    suspectCount,
    mode: isApply ? 'apply' : 'dry-run',
    counts: Object.fromEntries(counts.entries()),
    samples,
  }
  const reportPath = path.join(
    dataDir,
    `fragrance-image-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  )
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`\nFragrance image audit`)
  console.log(`Scanned: ${totalScanned}`)
  console.log(`Suspect rows: ${suspectCount}`)
  console.log(`Mode: ${isApply ? 'apply' : 'dry-run'}`)
  console.log(`Report: ${reportPath}`)

  for (const [type, count] of counts.entries()) {
    console.log(`  ${type}: ${count}`)
  }

  if (samples.length > 0) {
    console.log(`\nSample (${samples.length}):`)
    for (const sample of samples) {
      console.log(`  - ${sample.brand} / ${sample.name} (${sample.suspectType})`)
      console.log(`    ${sample.image_url}`)
    }
  }

  if (suspectCount > 0 && !isApply) {
    console.error('\n❌ Page-style image URLs still exist. These should be null or replaced.')
    process.exit(1)
  }

  if (suspectCount > 0 && isApply) {
    let cleared = 0
    for (let i = 0; i < idsToNull.length; i += 500) {
      const chunk = idsToNull.slice(i, i + 500)
      const { error } = await supabase
        .from('fragrances')
        .update({ image_url: null })
        .in('id', chunk)

      if (error) {
        console.error(`\n❌ Cleanup failed: ${error.message}`)
        process.exit(1)
      }

      cleared += chunk.length
    }

    console.log(`\n✅ Cleared ${cleared} suspect image_url values.`)
    return
  }

  console.log('\n✅ No suspect image URLs found.')
}

main().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})
