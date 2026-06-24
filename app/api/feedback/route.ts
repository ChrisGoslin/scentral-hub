import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const VALID_TYPES = ['bug', 'enhancement', 'suggestion']

export async function POST(req: NextRequest) {
  try {
    const { session_id, type, title, body, url } = await req.json()

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('feedback').insert({
      session_id: session_id ?? null,
      type,
      title: title.trim(),
      body: body?.trim() || null,
      url: url || null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
