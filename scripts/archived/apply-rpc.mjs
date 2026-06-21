import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const sql = fs.readFileSync('supabase/migrations/20260620_social_proof_rpc.sql', 'utf8')

const supabase = createClient(supabaseUrl, serviceKey)

console.log('Applying social proof RPC...')
const { error } = await supabase.from('_admin').update({}).eq('id', 'dummy').then(() => {
  return supabase.rpc('pg_execute', { sql })
}).catch(e => ({ error: e }))

if (error) {
  console.log('Trying direct SQL execution via admin endpoint...')
  // Try using admin endpoint directly
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
    body: JSON.stringify({ sql }),
  })
  
  if (!response.ok) {
    console.error('Error:', await response.text())
    process.exit(1)
  }
}

console.log('✓ RPC applied successfully')
