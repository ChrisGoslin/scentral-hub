/**
 * app/api/traces/route.ts
 * Traces feed — GET (list, optionally filtered by fragrance_id) + POST (create)
 *
 * GET  /api/traces?fragrance_id=<uuid>&limit=20&offset=0
 * POST /api/traces  { fragrance_id?: string, trace_type: 'fragrance'|'moment'|'emotional', body: string, image_url?: string }
 *
 * Reads use a service-role client because `profiles` RLS only allows a user to
 * read their own row (policy `profiles_owner`: auth.uid() = id) — the feed needs
 * to display OTHER users' display_name/username + their current noseprint
 * descriptor, which the session-scoped client cannot see. Writes still require
 * a real authenticated user, verified via the cookie-bound server client before
 * any service-role call is made.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const MAX_CHARS = 500
const TRACE_TYPES = ['fragrance', 'moment', 'emotional'] as const
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

type TraceRow = {
  id: string
  user_id: string
  fragrance_id: string | null
  trace_type: string
  body: string
  image_url: string | null
  created_at: string
}

type ProfileRow = { id: string; display_name: string | null; username: string | null }
type NoseprintRow = { user_id: string; descriptor: string; created_at: string }
type ReactionRow = { trace_id: string; reaction: string }
type FragranceRow = { id: string; brand: string; name: string }

async function attachAuthorsAndReactions(supabase: ReturnType<typeof serviceClient>, traces: TraceRow[]) {
  if (traces.length === 0) return []

  const userIds = Array.from(new Set(traces.map(t => t.user_id)))
  const traceIds = traces.map(t => t.id)
  const fragranceIds = traces.map(t => t.fragrance_id).filter((id): id is string => Boolean(id))

  const profilesRes = await supabase.from('profiles').select('id, display_name, username').in('id', userIds)
  const noseprintsRes = await supabase
    .from('noseprints')
    .select('user_id, descriptor, created_at')
    .in('user_id', userIds)
    .eq('status', 'current')
    .order('created_at', { ascending: false })
  const reactionsRes = await supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds)
  const fragrancesRes = await supabase.from('fragrances').select('id, brand, name').in('id', fragranceIds)

  const profiles = (profilesRes.data ?? []) as unknown as ProfileRow[]
  const noseprints = (noseprintsRes.data ?? []) as unknown as NoseprintRow[]
  const reactions = (reactionsRes.data ?? []) as unknown as ReactionRow[]
  const fragrances = (fragrancesRes.data ?? []) as unknown as FragranceRow[]

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))
  const noseprintByUser = new Map<string, string>()
  for (const n of noseprints ?? []) {
    if (!noseprintByUser.has(n.user_id)) noseprintByUser.set(n.user_id, n.descriptor)
  }
  const fragranceById = new Map((fragrances ?? []).map(f => [f.id, f]))

  const reactionCounts = new Map<string, Record<string, number>>()
  for (const r of reactions ?? []) {
    const counts = reactionCounts.get(r.trace_id) ?? { on_the_nose: 0, feel_this: 0, too_real: 0 }
    counts[r.reaction] = (counts[r.reaction] ?? 0) + 1
    reactionCounts.set(r.trace_id, counts)
  }

  return traces.map(t => {
    const profile = profileById.get(t.user_id)
    const fragrance = t.fragrance_id ? fragranceById.get(t.fragrance_id) : undefined
    return {
      id: t.id,
      trace_type: t.trace_type,
      body: t.body,
      image_url: t.image_url,
      created_at: t.created_at,
      fragrance_id: t.fragrance_id,
      fragrance: fragrance ? { id: fragrance.id, brand: fragrance.brand, name: fragrance.name } : null,
      author: {
        display_name: profile?.display_name ?? 'A BaseNote member',
        username: profile?.username ?? null,
        noseprint_descriptor: noseprintByUser.get(t.user_id) ?? null,
      },
      reaction_counts: reactionCounts.get(t.id) ?? { on_the_nose: 0, feel_this: 0, too_real: 0 },
    }
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const fragranceId = searchParams.get('fragrance_id')
    const limitParam = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)
    const offsetParam = Number(searchParams.get('offset') ?? 0)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), MAX_LIMIT) : DEFAULT_LIMIT
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0

    const supabase = serviceClient()

    let query = supabase
      .from('traces')
      .select('id, user_id, fragrance_id, trace_type, body, image_url, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (fragranceId) {
      query = query.eq('fragrance_id', fragranceId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[traces] GET error:', error.message)
      return NextResponse.json({ error: 'Failed to load traces' }, { status: 500 })
    }

    const enriched = await attachAuthorsAndReactions(supabase, data ?? [])

    return NextResponse.json({
      traces: enriched,
      hasMore: (data?.length ?? 0) === limit,
    })
  } catch (err) {
    console.error('[traces] GET unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const authedSupabase = await createServerClient(cookieStore)
    const { data: userData, error: authError } = await authedSupabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Sign in required to post a trace' }, { status: 401 })
    }

    const body = await req.json()
    const { fragrance_id, trace_type, body: traceBody, image_url } = body ?? {}

    if (typeof traceBody !== 'string' || traceBody.trim().length === 0) {
      return NextResponse.json({ error: 'Trace body is required' }, { status: 400 })
    }
    if (traceBody.length > MAX_CHARS) {
      return NextResponse.json({ error: `Trace body must be ${MAX_CHARS} characters or fewer` }, { status: 400 })
    }
    if (!TRACE_TYPES.includes(trace_type)) {
      return NextResponse.json({ error: 'trace_type must be one of: fragrance, moment, emotional' }, { status: 400 })
    }
    if (fragrance_id !== undefined && fragrance_id !== null && typeof fragrance_id !== 'string') {
      return NextResponse.json({ error: 'fragrance_id must be a string' }, { status: 400 })
    }
    if (image_url !== undefined && image_url !== null && typeof image_url !== 'string') {
      return NextResponse.json({ error: 'image_url must be a string' }, { status: 400 })
    }

    const supabase = serviceClient()
    const { data, error } = await supabase
      .from('traces')
      .insert([
        {
          user_id: userData.user.id,
          fragrance_id: fragrance_id ?? null,
          trace_type,
          body: traceBody,
          image_url: image_url ?? null,
        },
      ])
      .select('id, user_id, fragrance_id, trace_type, body, image_url, created_at')
      .single()

    if (error) {
      console.error('[traces] POST insert error:', error.message)
      return NextResponse.json({ error: 'Failed to save trace' }, { status: 500 })
    }

    const [enriched] = await attachAuthorsAndReactions(supabase, [data])

    return NextResponse.json({ success: true, trace: enriched })
  } catch (err) {
    console.error('[traces] POST unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
