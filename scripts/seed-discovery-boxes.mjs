import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const boxes = [
  {
    name: 'The Velvet Edit',
    slug: 'velvet-edit',
    description: 'Rich, complex, and intellectually layered. Five bottles for the fragrance thinker.',
    theme: 'oriental',
    tier: 'premium',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/VELVET_EDIT_001',
    price_cents: null,
  },
  {
    name: 'The Solar Set',
    slug: 'solar-set',
    description: 'Clean, precise, and effortlessly modern. Light that lingers.',
    theme: 'fresh',
    tier: 'standard',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/SOLAR_SET_001',
    price_cents: null,
  },
  {
    name: 'The Dark Atelier',
    slug: 'dark-atelier',
    description: 'Smoky, leathery, and unapologetically intense. Not for the faint-hearted.',
    theme: 'leather',
    tier: 'premium',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/DARK_ATELIER_001',
    price_cents: null,
  },
  {
    name: 'The Ritual Kit',
    slug: 'ritual-kit',
    description: 'Meditative, grounding, and quietly powerful. Scents that become ceremony.',
    theme: 'woody',
    tier: 'standard',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/RITUAL_KIT_001',
    price_cents: null,
  },
  {
    name: 'The Lab Pack',
    slug: 'lab-pack',
    description: 'Experimental, genre-defying, and conversation-starting. Five wildcards.',
    theme: 'aromatic',
    tier: 'standard',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/LAB_PACK_001',
    price_cents: null,
  },
  {
    name: 'The Comfort Collection',
    slug: 'comfort-collection',
    description: 'Warm, enveloping, and instantly familiar. Scents like a hug.',
    theme: 'gourmand',
    tier: 'standard',
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/COMFORT_COLLECTION_001',
    price_cents: null,
  },
]

const dryRun = process.argv.includes('--dry-run')

async function seed() {
  if (dryRun) {
    console.log('🔍 DRY RUN — would insert:')
    boxes.forEach(box => {
      console.log(`  • ${box.name} (${box.slug})`)
    })
    console.log(`\n✓ Ready to insert ${boxes.length} boxes. Run without --dry-run to proceed.`)
    return
  }

  console.log(`📦 Seeding ${boxes.length} discovery boxes...`)

  try {
    const { data, error } = await supabase
      .from('discovery_boxes')
      .upsert(boxes, { onConflict: 'slug' })

    if (error) throw error

    console.log(`✅ Successfully upserted ${boxes.length} discovery boxes`)
    boxes.forEach(box => {
      console.log(`  ✓ ${box.name}`)
    })
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
