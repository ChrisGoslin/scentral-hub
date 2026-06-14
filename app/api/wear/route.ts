import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { collection_id } = await request.json()
    if (!collection_id) {
      return NextResponse.json({ error: 'collection_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Minimal insert as requested. RLS handles the user_id if configured correctly,
    // otherwise we might need to fetch user.id. Keeping it simple per instructions.
    const { error } = await supabase
      .from('wear_logs')
      .insert({ collection_id })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
