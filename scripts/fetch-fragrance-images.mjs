import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
const customSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

let googleEnabled = true
if (!googleApiKey || !customSearchEngineId) {
  console.warn('⚠️  Missing GOOGLE_CUSTOM_SEARCH_API_KEY or GOOGLE_CUSTOM_SEARCH_ENGINE_ID in .env.local')
  console.warn('   Will bypass Google Search and use DuckDuckGo Image Search directly.')
  googleEnabled = false
}

const supabase = createClient(supabaseUrl, supabaseKey)

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null

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

async function fetchFromDuckDuckGo(query) {
  try {
    const mainUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    const htmlRes = await fetch(mainUrl, { headers })
    const html = await htmlRes.text()

    // Extract vqd token from HTML
    const vqdMatch = html.match(/vqd=[\'\"]?([^\'\"]+?)[\'\"]?&/i) || html.match(/vqd\s*[:=]\s*[\'\"]?([^\'\"]+?)[\'\"]?/i)
    if (!vqdMatch) {
      return null
    }
    const vqd = vqdMatch[1]

    const searchUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&l=us-en&o=json&s=0&p=1`
    const imgRes = await fetch(searchUrl, { headers })
    
    if (imgRes.status !== 200) {
      return null
    }

    const data = await imgRes.json()
    if (data.results && data.results.length > 0) {
      return data.results[0].image
    }

    return null
  } catch (err) {
    return null
  }
}

async function fetchFragranceImage(brand, name) {
  const query = `${brand} ${name} fragrance bottle`

  if (googleEnabled) {
    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1')
      url.searchParams.append('q', query)
      url.searchParams.append('cx', customSearchEngineId)
      url.searchParams.append('key', googleApiKey)
      url.searchParams.append('searchType', 'image')
      url.searchParams.append('num', '1')

      const response = await fetch(url.toString())
      const data = await response.json()

      if (response.status === 200 && data.items && data.items.length > 0) {
        return data.items[0].link
      }

      // If Google fails, log fallback and continue to DDG
      process.stdout.write(` [Google Custom Search failed (${response.status || 'unknown'}). Trying DuckDuckGo fallback...] `)
    } catch (err) {
      process.stdout.write(` [Google Custom Search error: ${err.message}. Trying DuckDuckGo fallback...] `)
    }
  }

  // Fallback/Direct DuckDuckGo Image Search
  const ddgImageUrl = await fetchFromDuckDuckGo(query)
  if (ddgImageUrl) {
    return ddgImageUrl
  }

  return null
}

async function main() {
  console.log('🖼️  Fetching fragrance images via Google Custom Search & DuckDuckGo Fallback...')
  if (googleEnabled) {
    console.log(`📊 Google CSE and DuckDuckGo fallback both active.`)
  } else {
    console.log(`📊 DuckDuckGo Image Search: Active (Unlimited)`)
  }

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - no database updates')
  }

  try {
    // Fetch fragrances without images
    let query = supabase
      .from('fragrances')
      .select('id, brand, name, image_url')
      .is('image_url', null)

    if (limit) {
      query = query.limit(limit)
    }

    const { data: fragrances, error } = await query

    if (error) throw error

    console.log(`\n📋 Found ${fragrances.length} fragrances without images`)

    let updated = 0
    let failed = 0

    for (let i = 0; i < fragrances.length; i++) {
      const frag = fragrances[i]
      const progress = `[${i + 1}/${fragrances.length}]`

      process.stdout.write(`\r${progress} Fetching: ${frag.brand} — ${frag.name}...`)

      const imageUrl = normalizeFragranceImageUrl(await fetchFragranceImage(frag.brand, frag.name))

      if (imageUrl) {
        if (!isDryRun) {
          const { error: updateError } = await supabase
            .from('fragrances')
            .update({ image_url: imageUrl })
            .eq('id', frag.id)

          if (updateError) {
            console.error(`\n❌ Update failed for ${frag.brand} ${frag.name}: ${updateError.message}`)
            failed++
          } else {
            updated++
          }
        } else {
          updated++
        }
      } else {
        failed++
      }

      // Add a delay between requests to avoid hitting search engines too fast
      if (i < fragrances.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`\n\n✅ Complete!`)
    console.log(`  ✓ Updated: ${updated}`)
    console.log(`  ✗ Failed: ${failed}`)

    if (isDryRun) {
      console.log(`\n💡 Run without --dry-run to persist changes to the database`)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

main()
