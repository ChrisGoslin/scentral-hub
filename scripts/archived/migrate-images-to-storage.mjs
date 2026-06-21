/**
 * migrate-images-to-storage.mjs
 * Copies bottle images from external CDN URLs (Parfumo, etc.) into a Supabase
 * Storage bucket and updates fragrances.image_url to the Supabase public URL.
 *
 * Run this AFTER backfill-parfumo-images.mjs has populated image_url.
 *
 * Usage:
 *   node scripts/migrate-images-to-storage.mjs --dry-run   (no uploads, no DB writes)
 *   node scripts/migrate-images-to-storage.mjs --limit=20  (only process first N rows)
 *   node scripts/migrate-images-to-storage.mjs             (full migration)
 *
 * Prerequisites:
 *   1. Ensure the "fragrance-images" bucket exists in Supabase Storage and is set to Public.
 *      (If it already exists, no action needed — the script will upload into it.)
 *   2. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 *
 * What it does:
 *   - Fetches all fragrances where image_url is NOT NULL and NOT already a Supabase URL
 *   - Downloads each image binary from the external URL
 *   - Uploads it to bottle-images/{fragrance-id}.jpg in Supabase Storage
 *   - Updates fragrances.image_url to the public Supabase CDN URL
 *   - Skips rows already migrated (idempotent — safe to re-run)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

const BUCKET = 'fragrance-images'
const REQUEST_DELAY = 300 // ms between image downloads

// ─── Load env ────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    console.warn('⚠️  Could not load .env.local — falling back to process.env')
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** Derive the Supabase public URL for a given storage path */
function storagePublicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

/** Download an image from a URL and return its ArrayBuffer + content-type */
async function downloadImage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      'Accept': 'image/*,*/*;q=0.8',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await res.arrayBuffer()
  return { buffer, contentType }
}

/** Upload binary to Supabase Storage. Returns public URL or throws. */
async function uploadToStorage(path, buffer, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true, // overwrite if re-running
    })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return storagePublicUrl(path)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📦 Supabase Storage image migration${DRY_RUN ? ' [DRY RUN]' : ''}`)
  console.log('─'.repeat(50))

  // Fetch fragrances with external image_url (not already pointing at Supabase Storage)
  const { data: rows, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, image_url')
    .not('image_url', 'is', null)
    .not('image_url', 'like', `${SUPABASE_URL}/storage/%`)
    .order('brand', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Supabase query failed:', error.message)
    process.exit(1)
  }

  const toProcess = LIMIT < Infinity ? rows.slice(0, LIMIT) : rows
  console.log(`Found ${rows.length} fragrances with external image URLs. Processing ${toProcess.length}.\n`)

  if (toProcess.length === 0) {
    console.log('✅ Nothing to migrate — all images already in Supabase Storage.')
    return
  }

  const results = { migrated: 0, skipped: 0, failed: 0 }
  const failures = []

  for (const { id, brand, name, image_url } of toProcess) {
    const storagePath = `${id}.jpg`
    const label = `${brand} — ${name}`

    if (DRY_RUN) {
      console.log(`  ○ [dry-run] ${label}`)
      console.log(`    ${image_url} → ${storagePublicUrl(storagePath)}`)
      results.migrated++
      continue
    }

    try {
      // 1. Download from external URL
      const { buffer, contentType } = await downloadImage(image_url)

      // 2. Upload to Supabase Storage
      const supabaseUrl = await uploadToStorage(storagePath, buffer, contentType)

      // 3. Update fragrances.image_url
      const { error: updateError } = await supabase
        .from('fragrances')
        .update({ image_url: supabaseUrl })
        .eq('id', id)

      if (updateError) throw new Error(`DB update failed: ${updateError.message}`)

      console.log(`  ✓ ${label}`)
      results.migrated++
    } catch (err) {
      console.log(`  ✗ ${label}`)
      console.log(`    ${err.message}`)
      results.failed++
      failures.push({ brand, name, reason: err.message })
    }

    await sleep(REQUEST_DELAY)
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log(`Done. Migrated: ${results.migrated} | Failed: ${results.failed}`)

  if (failures.length > 0) {
    console.log('\nFailed entries (images stayed on external CDN — re-run to retry):')
    for (const { brand, name, reason } of failures) {
      console.log(`  - ${brand} / ${name}: ${reason}`)
    }
  }

  if (!DRY_RUN && results.migrated > 0) {
    console.log(`\n✅ Images now served from: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`)
    console.log('   No external CDN dependency for migrated rows.')
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
