import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type SaveRequest = {
  name: string
  occasion: string | null
  morning_fragrance_id: string | null
  midday_fragrance_id: string | null
  evening_fragrance_id: string | null
  morning_sprays: number | null
  midday_sprays: number | null
  evening_sprays: number | null
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: SaveRequest = await req.json()

  const filledSlots = [
    body.morning_fragrance_id,
    body.midday_fragrance_id,
    body.evening_fragrance_id,
  ].filter(Boolean).length

  if (filledSlots === 0) {
    return NextResponse.json({ error: 'At least one slot must be filled' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('spritz_schedules')
    .insert({
      user_id: user.id,
      name: body.name || 'My Schedule',
      occasion: body.occasion || null,
      morning_fragrance_id: body.morning_fragrance_id || null,
      midday_fragrance_id: body.midday_fragrance_id || null,
      evening_fragrance_id: body.evening_fragrance_id || null,
      morning_sprays: body.morning_sprays ?? null,
      midday_sprays: body.midday_sprays ?? null,
      evening_sprays: body.evening_sprays ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
