import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { buildWearLogInsert } from '@/lib/security/wear-log'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to log a wear.' }, { status: 401 })
    }

    const body = await req.json()
    const insert = buildWearLogInsert(body, user.id)

    if (!insert.ok || !insert.value) {
      return NextResponse.json({ error: insert.error }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wear_logs')
      .insert(insert.value)
      .select()

    if (error) {
      console.error('Wear log insert failed:', error)
      return NextResponse.json({ error: 'We could not save that wear. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Wear Log API Error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'The wear details were not valid.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'We could not save that wear. Please try again.' }, { status: 500 })
  }
}
