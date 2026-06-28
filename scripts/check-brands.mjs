import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const { data, error } = await supabase.from('fragrances').select('brand').not('phase', 'is', null)
if (error) { console.error(error); process.exit(1) }
const brands = [...new Set(data.map(r => r.brand))].sort()
console.log(`Total curated brands: ${brands.length}`)
console.log(brands.join('\n'))
