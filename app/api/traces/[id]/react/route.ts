/**
 * app/api/traces/[id]/react/route.ts
 * Upsert a reaction on a trace — one reaction per user per trace.
 *
 * POST /api/traces/:id/react  { reaction: 'on_the_nose' | 'feel_this' | 'too_real' }
 * Re-reacting with a different value overwrites the existing row via upsert on
 * the (trace_id, user_id) composite primary key, per the DB constraint.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const REACTIONS = ['on_the_nose', 'feel_this', 'too_real'] as const

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: traceId } = await params

    const cookieStore = await cookies()
    const authedSupabase = await createServerClient(cookieStore)
    const { data: userData, error: authError } = await authedSupabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Sign in required to react' }, { status: 401 })
    }

    if (!traceId) {
      return NextResponse.json({ error: 'Missing trace id' }, { status: 400 })
    }

    const body = await req.json()
    const { reaction } = body ?? {}

    if (!REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { error: 'reaction must be one of: on_the_nose, feel_this, too_real' },
        { status: 400 }
      )
    }

    const supabase = serviceClient()

    const { data: trace } = await supabase.from('traces').select('id').eq('id', traceId).maybeSingle()
    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('trace_reactions')
      .upsert(
        { trace_id: traceId, user_id: userData.user.id, reaction },
        { onConflict: 'trace_id,user_id' }
      )

    if (error) {
      console.error('[traces/react] upsert error:', error.message)
      return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
    }

    const { data: allReactions } = await supabase
      .from('trace_reactions')
      .select('reaction')
      .eq('trace_id', traceId)

    const counts = { on_the_nose: 0, feel_this: 0, too_real: 0 }
    for (const r of allReactions ?? []) {
      if (r.reaction in counts) counts[r.reaction as keyof typeof counts]++
    }

    return NextResponse.json({ success: true, reaction, reaction_counts: counts })
  } catch (err) {
    console.error('[traces/react] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
