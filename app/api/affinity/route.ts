import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { collection_id, affinity_score } = body

    if (!collection_id || typeof collection_id !== 'string' || collection_id.trim() === '') {
      return NextResponse.json({ ok: false, error: 'collection_id is required' }, { status: 400 })
    }

    if (
      typeof affinity_score !== 'number' ||
      !Number.isInteger(affinity_score) ||
      affinity_score < 1 ||
      affinity_score > 20
    ) {
      return NextResponse.json(
        { ok: false, error: 'affinity_score must be an integer between 1 and 20' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const { error } = await supabase
      .from('collections')
      .update({ affinity_score })
      .eq('id', collection_id.trim())

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, affinity_score })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
