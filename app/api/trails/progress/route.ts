import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type ProgressRequest = {
  trail_id: string
  last_step: number
  completed: boolean
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: ProgressRequest = await req.json()

  if (!body.trail_id || typeof body.last_step !== 'number') {
    return NextResponse.json({ error: 'trail_id and last_step are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('trail_progress')
    .upsert(
      {
        user_id: user.id,
        trail_id: body.trail_id,
        last_step: body.last_step,
        completed_at: body.completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,trail_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
