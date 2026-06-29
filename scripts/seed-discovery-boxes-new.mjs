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

async function seedBoxes() {
  console.log('📦 Seeding discovery boxes...')

  try {
    // Fetch fragrances from different themes
    const [arabianNightsRes, officeRes, weekendRes] = await Promise.all([
      supabase
        .from('fragrances')
        .select('id')
        .in('brand', ['Lattafa', 'Afnan', 'Armaf'])
        .not('phase', 'is', null)
        .limit(5),
      supabase
        .from('fragrances')
        .select('id')
        .ilike('family', '%Fresh%')
        .not('phase', 'is', null)
        .limit(5),
      supabase
        .from('fragrances')
        .select('id')
        .not('phase', 'is', null)
        .order('rating', { ascending: false })
        .limit(5),
    ])

    const arabianIds = arabianNightsRes.data?.map(f => f.id) || []
    const officeIds = officeRes.data?.map(f => f.id) || []
    const weekendIds = weekendRes.data?.map(f => f.id) || []

    console.log(`✓ Found ${arabianIds.length} Arabian Nights fragrances`)
    console.log(`✓ Found ${officeIds.length} Office fragrances`)
    console.log(`✓ Found ${weekendIds.length} Weekend fragrances`)

    const boxes = [
      {
        name: 'Arabian Nights Starter',
        theme: 'Middle Eastern',
        fragrances: arabianIds,
        price_gbp: 24.99,
        is_active: true,
      },
      {
        name: 'Office Hours',
        theme: 'Clean & Professional',
        fragrances: officeIds,
        price_gbp: 22.99,
        is_active: true,
      },
      {
        name: 'Weekend Wanderer',
        theme: 'Casual & Versatile',
        fragrances: weekendIds,
        price_gbp: 24.99,
        is_active: true,
      },
    ]

    console.log(`\n📦 Inserting ${boxes.length} discovery boxes...`)
    const { data, error } = await supabase
      .from('discovery_boxes')
      .insert(boxes)
      .select()

    if (error) throw error

    console.log(`✅ Successfully seeded ${data?.length || 0} discovery boxes:`)
    data?.forEach(box => {
      console.log(`  ✓ ${box.name} (${box.fragrances.length} fragrances) — £${box.price_gbp}`)
    })
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seedBoxes()
