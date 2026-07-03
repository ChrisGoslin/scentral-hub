import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Blind-safe fragrance shape — identity fields (brand/name/image_url) are
// deliberately excluded from the select() below, not just hidden client-side.
export type BlindFragrance = {
  id: string
  family: string | null
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
  dominant_accords: string[] | null
}

const BLIND_COLUMNS = 'id, family, top_notes, heart_notes, base_notes, dominant_accords'
const POOL_TARGET = 18
const POOL_MIN = 10

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Build a candidate pool from the user's current shelf + near-neighbours.
 * Strategy: pull the user's shelf_items fragrance embeddings, call
 * resonance_match for a representative subset (cap network fan-out),
 * dedupe against ids already seen, and combine with the shelf ids
 * themselves until we hit POOL_TARGET (or run out of neighbours).
 */
async function buildPool(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data: shelfRows } = await supabase
    .from('shelf_items')
    .select('fragrance_id')
    .eq('user_id', userId)

  const shelfIds = Array.from(
    new Set((shelfRows ?? []).map(r => r.fragrance_id).filter((id): id is string => Boolean(id)))
  )

  const poolIds = new Set<string>(shelfIds)

  if (shelfIds.length > 0) {
    const { data: embeddedFragrances } = await supabase
      .from('fragrances')
      .select('id, embedding')
      .in('id', shelfIds)
      .not('embedding', 'is', null)

    // Cap fan-out: use up to 5 representative shelf fragrances as seeds.
    const seeds = (embeddedFragrances ?? []).slice(0, 5)

    for (const seed of seeds) {
      if (poolIds.size >= POOL_TARGET) break
      if (!seed.embedding) continue

      const { data: neighbours } = await supabase.rpc('resonance_match', {
        query_embedding: seed.embedding,
        match_threshold: 0.3,
        match_count: 8,
      })

      for (const n of (neighbours ?? []) as { id: string }[]) {
        if (poolIds.size >= POOL_TARGET) break
        poolIds.add(n.id)
      }
    }
  }

  // Fallback: if the user has no shelf/embeddings yet, or the pool is too
  // small, top up with a broad, embedding-agnostic sample so a session can
  // still start.
  if (poolIds.size < POOL_MIN) {
    const { data: fallback } = await supabase
      .from('fragrances')
      .select('id')
      .not('embedding', 'is', null)
      .limit(POOL_TARGET * 2)

    for (const f of fallback ?? []) {
      if (poolIds.size >= POOL_TARGET) break
      poolIds.add(f.id)
    }
  }

  return Array.from(poolIds).slice(0, POOL_TARGET)
}

export async function POST() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const pool = await buildPool(supabase, user.id)

    if (pool.length < POOL_MIN) {
      return NextResponse.json(
        { error: 'Not enough fragrances available to start a blind ranking session' },
        { status: 422 }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from('blind_ranking_sessions')
      .insert({ user_id: user.id, fragrance_pool: pool })
      .select('id')
      .single()

    if (sessionError || !session) throw sessionError

    const { data: fragrances, error: fragError } = await supabase
      .from('fragrances')
      .select(BLIND_COLUMNS)
      .in('id', pool)

    if (fragError) throw fragError

    return NextResponse.json({
      sessionId: session.id,
      pool: (fragrances ?? []) as BlindFragrance[],
    })
  } catch (error: any) {
    console.error('[/api/blind-ranking/session] error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to start blind ranking session' }, { status: 500 })
  }
}
