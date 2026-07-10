import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type RevealRequest = {
  sessionId: string
}

type RevealedFragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  image_url: string | null
  placedRank: number
}

const RANKS_TOTAL = 10
const FULL_COLUMNS = 'id, brand, name, family, image_url'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function logShelfEvent(
  supabase: SupabaseClient,
  userId: string,
  fragranceId: string,
  event: 'added' | 'removed' | 'rank_changed' | 'replaced' | 'returned',
  oldRank: number | null,
  newRank: number | null
) {
  await supabase.from('shelf_events').insert({
    user_id: userId,
    fragrance_id: fragranceId,
    event,
    old_rank: oldRank,
    new_rank: newRank,
  })
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: RevealRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { sessionId } = body
  if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

  try {
    const { data: session, error: sessionError } = await supabase
      .from('blind_ranking_sessions')
      .select('id, user_id, revealed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { data: choices, error: choicesError } = await supabase
      .from('blind_ranking_choices')
      .select('fragrance_id, placed_rank')
      .eq('session_id', sessionId)
      .order('placed_rank', { ascending: true })

    if (choicesError) throw choicesError

    if (!choices || choices.length < RANKS_TOTAL) {
      return NextResponse.json(
        { error: `All ${RANKS_TOTAL} ranks must be placed before reveal (${choices?.length ?? 0}/${RANKS_TOTAL})` },
        { status: 409 }
      )
    }

    // Idempotency guard: if already revealed, just return the current shelf state
    // rather than re-committing (avoids double shelf_events on repeat calls).
    if (!session.revealed_at) {
      // Snapshot prior shelf occupants (for 'returned'/'replaced' event semantics)
      // before we wipe the shelf.
      const { data: priorItems } = await supabase
        .from('shelf_items')
        .select('fragrance_id, rank')
        .eq('user_id', user.id)

      const priorByRank = new Map((priorItems ?? []).map(i => [i.rank, i.fragrance_id]))

      const { error: deleteError } = await supabase
        .from('shelf_items')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      const toInsert = choices.map(c => ({
        user_id: user.id,
        fragrance_id: c.fragrance_id,
        rank: c.placed_rank,
        source: 'blind_ranking' as const,
        locked: true,
      }))

      const { error: insertError } = await supabase.from('shelf_items').insert(toInsert)
      if (insertError) throw insertError

      // One shelf_events row per resulting fragrance: 'replaced' if that rank
      // previously held a different fragrance, 'added' if the rank was empty
      // or held the same fragrance already (still logged as a fresh commit).
      await Promise.all(
        choices.map(c => {
          const priorFragranceId = priorByRank.get(c.placed_rank)
          const event = priorFragranceId && priorFragranceId !== c.fragrance_id ? 'replaced' : 'added'
          return logShelfEvent(supabase, user.id, c.fragrance_id, event, null, c.placed_rank)
        })
      )

      // Log 'returned' for prior occupants that were displaced by a different fragrance.
      const displaced = Array.from(priorByRank.entries()).filter(([rank, fragranceId]) => {
        const newChoice = choices.find(c => c.placed_rank === rank)
        return newChoice && newChoice.fragrance_id !== fragranceId
      })
      await Promise.all(
        displaced.map(([rank, fragranceId]) =>
          logShelfEvent(supabase, user.id, fragranceId, 'returned', rank, null)
        )
      )

      await supabase
        .from('blind_ranking_sessions')
        .update({ revealed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id)
    }

    const { data: revealedFragrances, error: fragError } = await supabase
      .from('fragrances')
      .select(FULL_COLUMNS)
      .in('id', choices.map(c => c.fragrance_id))

    if (fragError) throw fragError

    const byId = new Map((revealedFragrances ?? []).map(f => [f.id, f]))
    const revealed: RevealedFragrance[] = choices
      .map(c => {
        const f = byId.get(c.fragrance_id)
        if (!f) return null
        return { ...f, placedRank: c.placed_rank }
      })
      .filter((f): f is RevealedFragrance => f !== null)
      .sort((a, b) => a.placedRank - b.placedRank)

    return NextResponse.json({ revealed })
  } catch (error) {
    console.error('[/api/blind-ranking/reveal] error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Failed to reveal blind ranking session' }, { status: 500 })
  }
}
