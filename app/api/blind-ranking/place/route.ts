import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type PlaceRequest = {
  sessionId: string
  fragranceId: string
  placedRank: number
}

const RANKS_TOTAL = 10

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: PlaceRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { sessionId, fragranceId, placedRank } = body
  if (!sessionId || !fragranceId || !placedRank || placedRank < 1 || placedRank > RANKS_TOTAL) {
    return NextResponse.json(
      { error: 'sessionId, fragranceId, and placedRank (1-10) are required' },
      { status: 400 }
    )
  }

  try {
    // Confirm the session belongs to this user and hasn't been revealed yet.
    const { data: session, error: sessionError } = await supabase
      .from('blind_ranking_sessions')
      .select('id, user_id, fragrance_pool, revealed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.revealed_at) {
      return NextResponse.json({ error: 'Session already revealed — no further placements' }, { status: 409 })
    }

    if (!(session.fragrance_pool as string[]).includes(fragranceId)) {
      return NextResponse.json({ error: 'Fragrance is not in this session\'s pool' }, { status: 400 })
    }

    // No undo: reject if this rank OR this fragrance is already placed in the session.
    const { data: existing, error: existingError } = await supabase
      .from('blind_ranking_choices')
      .select('id, fragrance_id, placed_rank')
      .eq('session_id', sessionId)

    if (existingError) throw existingError

    const rankTaken = (existing ?? []).some(c => c.placed_rank === placedRank)
    const fragranceAlreadyPlaced = (existing ?? []).some(c => c.fragrance_id === fragranceId)

    if (rankTaken || fragranceAlreadyPlaced) {
      return NextResponse.json(
        { error: rankTaken ? 'Rank already placed' : 'Fragrance already placed' },
        { status: 409 }
      )
    }

    const { data: choice, error: insertError } = await supabase
      .from('blind_ranking_choices')
      .insert({ session_id: sessionId, fragrance_id: fragranceId, placed_rank: placedRank })
      .select('id')
      .single()

    if (insertError) throw insertError

    const totalPlaced = (existing ?? []).length + 1
    const complete = totalPlaced >= RANKS_TOTAL

    return NextResponse.json({ choiceId: choice.id, placedCount: totalPlaced, complete })
  } catch (error) {
    console.error('[/api/blind-ranking/place] error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Failed to record placement' }, { status: 500 })
  }
}
