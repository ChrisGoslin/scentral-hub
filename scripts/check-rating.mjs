import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('fragrances').select('rating').not('rating', 'is', null).limit(10)
  if (error) console.error(error)
  else console.log("Sample ratings:", data.map(d => d.rating))
}
run()
