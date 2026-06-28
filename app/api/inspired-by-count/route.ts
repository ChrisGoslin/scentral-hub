import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('fragrances')
    .select('id', { count: 'exact', head: true })
    .not('inspired_by', 'is', null)

  return NextResponse.json({ count: count ?? 0 })
}
