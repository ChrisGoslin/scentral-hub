#!/usr/bin/env node
/**
 * enrich-images-firecrawl.mjs
 *
 * Firecrawl-assisted image enrichment for top-surface fragrances with NULL
 * image_url. This is intentionally a back-office script, not an app runtime
 * dependency.
 *
 * Safety rules:
 * - Reads secrets from .env.local only
 * - Defaults to dry-run (preview only)
 * - Never overwrites a non-NULL image_url
 * - Rejects page URLs and hostnames not already allowed by next.config.ts
 *
 * Usage:
 *   node scripts/enrich-images-firecrawl.mjs
 *   node scripts/enrich-images-firecrawl.mjs --limit=10
 *   node scripts/enrich-images-firecrawl.mjs --brand=Armaf
 *   node scripts/enrich-images-firecrawl.mjs --apply
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

function loadFirecrawlApiKey() {
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY

  const credentialsPath = path.join(
    process.env.HOME || '',
    'Library',
    'Application Support',
    'firecrawl-cli',
    'credentials.json'
  )

  try {
    const raw = fs.readFileSync(credentialsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return typeof parsed.apiKey === 'string' ? parsed.apiKey : null
  } catch {
    return null
  }
}

const firecrawlApiKey = loadFirecrawlApiKey()

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

if (!firecrawlApiKey) {
  console.error(
    '❌ Missing Firecrawl credentials. Add FIRECRAWL_API_KEY to .env.local or log in with firecrawl CLI first.'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i
const DIRECT_IMAGE_CONTENT_TYPE_PATTERN = /^image\//i
const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v2'

const isApply = process.argv.includes('--apply')
const dryRun = !isApply
const limitArg = process.argv.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 15
const brandArg = process.argv.find(arg => arg.startsWith('--brand='))
const brandFilter = brandArg ? brandArg.split('=')[1].replace(/^["']|["']$/g, '') : null

function normalizeFragranceImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string') return null
  const trimmed = imageUrl.trim()
  if (!trimmed) return null

  const isFragranticaPage = /fragrantica\.com\/.+\.html(?:[?#].*)?$/i.test(trimmed)
  const isParfumoPage =
    /parfumo\.com\/Perfumes\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed)
  const isFragranticaPerfumePage =
    /fragrantica\.com\/perfume\/[^?#]+$/i.test(trimmed) && !IMAGE_EXTENSION_PATTERN.test(trimmed)

  if (isFragranticaPage || isParfumoPage || isFragranticaPerfumePage) return null
  return trimmed
}

function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function tokenize(str) {
  return toSlug(str).split('-').filter(token => token.length >= 3)
}

function buildSearchQueries(brand, name) {
  return [
    `${brand} ${name} perfume bottle`,
    `"${brand}" "${name}" fragrance bottle`,
    `${brand} ${name} parfum bottle`,
  ]
}

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

function extractHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

async function firecrawlSearchImages(query) {
  const response = await fetch(`${FIRECRAWL_API_BASE}/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      sources: ['images'],
      limit: 5,
      ignoreInvalidURLs: true,
      timeout: 30000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Firecrawl search failed: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()
  const images = payload?.data?.images
  return Array.isArray(images) ? images : []
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timeout)
  }
}

async function probeImageUrl(candidateUrl, allowedHosts) {
  const normalized = normalizeFragranceImageUrl(candidateUrl)
  if (!normalized) return { ok: false, reason: 'not_direct_image_url' }

  const initialHost = extractHostname(normalized)
  if (!initialHost) return { ok: false, reason: 'invalid_url' }
  if (!allowedHosts.has(initialHost)) return { ok: false, reason: `host_not_allowed:${initialHost}` }

  const headResponse = await fetchWithTimeout(normalized, {
    method: 'HEAD',
    headers: {
      'User-Agent': 'nota-image-enrichment/1.0',
      'Accept': 'image/*,*/*;q=0.8',
    },
  }).catch(() => null)

  let finalResponse = headResponse
  if (!finalResponse || finalResponse.status >= 400 || finalResponse.status === 405) {
    finalResponse = await fetchWithTimeout(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'nota-image-enrichment/1.0',
        'Accept': 'image/*,*/*;q=0.8',
        'Range': 'bytes=0-0',
      },
    }).catch(() => null)
  }

  if (!finalResponse || !finalResponse.ok) return { ok: false, reason: 'unreachable' }

  const finalUrl = finalResponse.url || normalized
  const finalHost = extractHostname(finalUrl)
  if (!finalHost || !allowedHosts.has(finalHost)) {
    return { ok: false, reason: `redirected_to_unallowed_host:${finalHost ?? 'unknown'}` }
  }

  const contentType = finalResponse.headers.get('content-type') || ''
  const looksLikeImageByPath = IMAGE_EXTENSION_PATTERN.test(finalUrl)
  if (!DIRECT_IMAGE_CONTENT_TYPE_PATTERN.test(contentType) && !looksLikeImageByPath) {
    return { ok: false, reason: `non_image_content_type:${contentType || 'missing'}` }
  }

  return { ok: true, finalUrl }
}

function scoreCandidate(candidate, brandTokens, nameTokens) {
  const haystack = [
    candidate.title || '',
    candidate.imageUrl || '',
    candidate.url || '',
  ].join(' ').toLowerCase()

  let score = 0
  const nameHits = nameTokens.filter(token => haystack.includes(token)).length
  const brandHits = brandTokens.filter(token => haystack.includes(token)).length

  score += nameHits * 20
  score += brandHits * 15

  if ((candidate.imageWidth || 0) >= 400) score += 6
  if ((candidate.imageHeight || 0) >= 400) score += 6

  const host = extractHostname(candidate.imageUrl || '')
  if (host === 'media.parfumo.com' || host === 'piimages.parfumo.de') score += 12
  if (host === 'cdn.shopify.com') score += 10
  if (host === 'img.fragrancex.com') score += 8
  if (host === 'upload.wikimedia.org') score += 6

  return score
}

function rankCandidates(results, brand, name) {
  const brandTokens = tokenize(brand)
  const nameTokens = tokenize(name)
  return results
    .filter(candidate => typeof candidate?.imageUrl === 'string')
    .map(candidate => ({
      ...candidate,
      score: scoreCandidate(candidate, brandTokens, nameTokens),
    }))
    .sort((a, b) => b.score - a.score)
}

async function findBestImageCandidate(brand, name, allowedHosts) {
  const reasons = []

  for (const query of buildSearchQueries(brand, name)) {
    const searchResults = await firecrawlSearchImages(query)
    const ranked = rankCandidates(searchResults, brand, name)

    for (const candidate of ranked) {
      const imageUrl = candidate.imageUrl
      if (!imageUrl) continue

      const probe = await probeImageUrl(imageUrl, allowedHosts)
      if (probe.ok) {
        return {
          query,
          title: candidate.title || null,
          sourceUrl: candidate.url || null,
          imageUrl: probe.finalUrl,
          width: candidate.imageWidth || null,
          height: candidate.imageHeight || null,
          score: candidate.score,
        }
      }

      reasons.push({
        query,
        imageUrl,
        sourceUrl: candidate.url || null,
        reason: probe.reason,
      })
    }
  }

  return { missReasons: reasons }
}

async function getCandidateFragrances(limit, brand) {
  let query = supabase
    .from('fragrances')
    .select('id, brand, name, phase, rating, spritz_count')
    .is('image_url', null)
    .order('phase', { ascending: false, nullsLast: true })
    .order('rating', { ascending: false, nullsLast: true })
    .limit(limit)

  if (brand) query = query.eq('brand', brand)

  const { data, error } = await query
  if (error) throw new Error(`Supabase query failed: ${error.message}`)
  return data || []
}

async function persistImageUrl(id, imageUrl) {
  const { error, count } = await supabase
    .from('fragrances')
    .update({ image_url: imageUrl }, { count: 'exact' })
    .eq('id', id)
    .is('image_url', null)

  if (error) throw new Error(error.message)
  return count || 0
}

function writeRunReport(rows) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filePath = path.join(dataDir, `firecrawl-image-run-${timestamp}.json`)
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2) + '\n')
  return filePath
}

function summarizeBlockedHosts(reportRows) {
  const blockedHosts = new Map()

  for (const row of reportRows) {
    if (!Array.isArray(row.reasons)) continue
    for (const reason of row.reasons) {
      if (typeof reason?.reason !== 'string') continue
      if (!reason.reason.startsWith('host_not_allowed:')) continue
      const host = reason.reason.slice('host_not_allowed:'.length)
      blockedHosts.set(host, (blockedHosts.get(host) || 0) + 1)
    }
  }

  return Array.from(blockedHosts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
}

async function main() {
  const allowedHosts = loadAllowedImageHosts()
  console.log('\n🔥 Firecrawl image enrichment for nota\n')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`)
  console.log(`Limit: ${limit}`)
  if (brandFilter) console.log(`Brand filter: ${brandFilter}`)
  console.log(`Allowed hosts: ${allowedHosts.size}\n`)

  const fragrances = await getCandidateFragrances(limit, brandFilter)
  if (fragrances.length === 0) {
    console.log('✅ No matching fragrances with NULL image_url.')
    return
  }

  console.log(`Found ${fragrances.length} candidate fragrances.\n`)

  const reportRows = []
  let hits = 0
  let misses = 0
  let writes = 0

  for (const [index, frag] of fragrances.entries()) {
    console.log(`[${index + 1}/${fragrances.length}] ${frag.brand} / ${frag.name}`)

    try {
      const result = await findBestImageCandidate(frag.brand, frag.name, allowedHosts)
      if (result.imageUrl) {
        hits++
        console.log(`  ✓ candidate ${result.imageUrl}`)
        if (!dryRun) {
          const updated = await persistImageUrl(frag.id, result.imageUrl)
          if (updated > 0) {
            writes += 1
            console.log('  ✓ saved')
          } else {
            console.log('  - skipped write (row already filled)')
          }
        }

        reportRows.push({
          fragranceId: frag.id,
          brand: frag.brand,
          name: frag.name,
          status: dryRun ? 'candidate' : 'saved',
          imageUrl: result.imageUrl,
          sourceUrl: result.sourceUrl,
          query: result.query,
          score: result.score,
          width: result.width,
          height: result.height,
        })
      } else {
        misses++
        console.log('  - no valid allowed-host image found')
        reportRows.push({
          fragranceId: frag.id,
          brand: frag.brand,
          name: frag.name,
          status: 'miss',
          reasons: result.missReasons?.slice(0, 10) || [],
        })
      }
    } catch (error) {
      misses++
      console.log(`  ✗ ${error.message}`)
      reportRows.push({
        fragranceId: frag.id,
        brand: frag.brand,
        name: frag.name,
        status: 'error',
        error: error.message,
      })
    }
  }

  const reportPath = writeRunReport(reportRows)

  console.log('\n📊 Summary')
  console.log(`  Candidates processed: ${fragrances.length}`)
  console.log(`  Valid hits: ${hits}`)
  console.log(`  Misses/errors: ${misses}`)
  console.log(`  DB writes: ${writes}`)
  console.log(`  Report: ${reportPath}\n`)

  const blockedHosts = summarizeBlockedHosts(reportRows)
  if (blockedHosts.length > 0) {
    console.log('Top blocked candidate hosts:')
    for (const [host, count] of blockedHosts) {
      console.log(`  ${host}: ${count}`)
    }
    console.log('')
  }
}

main().catch(error => {
  console.error(`❌ Fatal: ${error.message}`)
  process.exit(1)
})
