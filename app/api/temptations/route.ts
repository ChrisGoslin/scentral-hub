import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

type Status = 'shown' | 'viewed' | 'wishlisted' | 'blind_buy' | 'maybe_later' | 'dismissed'

// Client-facing action names map onto the temptations.status check constraint.
const ACTION_TO_STATUS: Record<string, Status> = {
  viewed: 'viewed',
  wishlisted: 'wishlisted',
  bought: 'blind_buy',
  dismissed: 'dismissed',
}

export async function GET() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ temptation: null })
  }

  const { data, error } = await supabase
    .from('temptations')
    .select('id, fragrance_id, status, reason, shown_at, resolved_at')
    .eq('user_id', user.id)
    .is('resolved_at', null)
    .order('shown_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Temptations fetch error:', error)
    return NextResponse.json({ error: error.message, temptation: null }, { status: 500 })
  }

  return NextResponse.json({ temptation: data && data.length > 0 ? data[0] : null })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { fragranceId, reason } = body

  if (!fragranceId) {
    return NextResponse.json({ error: 'Missing fragranceId' }, { status: 400 })
  }

  const weekStart = new Date()
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
  weekStart.setUTCHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from('temptations')
    .select('id')
    .eq('user_id', user.id)
    .gte('shown_at', weekStart.toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'User already has an active temptation this week' }, { status: 429 })
  }

  // reason is NOT NULL in the live table (verified via Supabase MCP,
  // 2026-07-18) — a request that omits it would otherwise reach the
  // database and get a 500 from the NOT NULL violation instead of creating
  // the temptation.
  const { data, error } = await supabase
    .from('temptations')
    .insert({
      user_id: user.id,
      fragrance_id: fragranceId,
      status: 'shown',
      reason: reason ?? 'unspecified',
    })
    .select('id, fragrance_id, status, reason, shown_at')

  if (error) {
    console.error('Temptations insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, temptation: data?.[0] })
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { temptationId, status: action } = body

  if (!temptationId || !action || !(action in ACTION_TO_STATUS)) {
    return NextResponse.json({ error: 'Missing or invalid temptationId / status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('temptations')
    .update({
      status: ACTION_TO_STATUS[action],
      resolved_at: new Date().toISOString(),
    })
    .eq('id', temptationId)
    .eq('user_id', user.id)
    .select('id, status, resolved_at')

  if (error) {
    console.error('Temptations update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Temptation not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ success: true, temptation: data[0] })
}
