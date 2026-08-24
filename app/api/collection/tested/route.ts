/**
 * app/api/collection/tested/route.ts
 * "I tried something" capture — logs a Tested interaction against `collections`.
 *
 * POST /api/collection/tested
 * Input: { fragrance_id: string, personal_notes?: string }
 * Output: { success: true, status: 'tested' | 'owned' | 'past_purchase' } | error
 *
 * Schema verified live via Supabase MCP (2026-08-24) against `collections`:
 * columns id, user_id uuid, fragrance_id uuid, status text (CHECK: owned|tested|
 * past_purchase|wishlist), wear_state, shelf_tier, affinity_score, personal_notes,
 * created_at, scent_memory. No unique constraint on (user_id, fragrance_id), so
 * this route reads-then-writes rather than relying on an upsert conflict target.
 *
 * auth.uid() is canonical per nota-architecture-contract §1 — this route is
 * user_id-only, no anon_id fallback.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { enforce, makeLimiter } from '@/lib/rate-limit'

const testedLimiter = makeLimiter('collection-tested', 20, '1 m')

// Statuses that already imply "tested or better" for shelf-eligibility purposes —
// don't downgrade a stronger status back to 'tested'.
const ALREADY_ELIGIBLE = new Set(['tested', 'owned', 'past_purchase'])

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    if (!(await enforce(testedLimiter, user.id))) {
      return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const fragranceId = body?.fragrance_id
    const personalNotes = body?.personal_notes

    if (typeof fragranceId !== 'string' || fragranceId.length === 0) {
      return NextResponse.json({ error: 'fragrance_id is required' }, { status: 400 })
    }
    if (personalNotes !== undefined && personalNotes !== null && typeof personalNotes !== 'string') {
      return NextResponse.json({ error: 'personal_notes must be a string' }, { status: 400 })
    }
    if (typeof personalNotes === 'string' && personalNotes.length > 500) {
      return NextResponse.json({ error: 'personal_notes must be 500 characters or fewer' }, { status: 400 })
    }

    const { data: existing, error: findError } = await supabase
      .from('collections')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('fragrance_id', fragranceId)
      .maybeSingle()

    if (findError) {
      console.error('[collection/tested] lookup error:', findError.message)
      return NextResponse.json({ error: 'Could not check your collection' }, { status: 500 })
    }

    if (existing) {
      if (ALREADY_ELIGIBLE.has(existing.status)) {
        // Already tested-or-better — just attach the note if one was given, don't
        // touch status (never downgrade owned/past_purchase back to tested).
        if (typeof personalNotes === 'string' && personalNotes.length > 0) {
          const { error: noteError } = await supabase
            .from('collections')
            .update({ personal_notes: personalNotes })
            .eq('id', existing.id)
          if (noteError) {
            console.error('[collection/tested] note update error:', noteError.message)
          }
        }
        return NextResponse.json({ success: true, status: existing.status, alreadyLogged: true })
      }

      const { error: updateError } = await supabase
        .from('collections')
        .update({
          status: 'tested',
          ...(typeof personalNotes === 'string' && personalNotes.length > 0 ? { personal_notes: personalNotes } : {}),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[collection/tested] update error:', updateError.message)
        return NextResponse.json({ error: 'Could not log this' }, { status: 500 })
      }

      return NextResponse.json({ success: true, status: 'tested' })
    }

    const { error: insertError } = await supabase.from('collections').insert({
      user_id: user.id,
      fragrance_id: fragranceId,
      status: 'tested',
      ...(typeof personalNotes === 'string' && personalNotes.length > 0 ? { personal_notes: personalNotes } : {}),
    })

    if (insertError) {
      console.error('[collection/tested] insert error:', insertError.message)
      return NextResponse.json({ error: 'Could not log this' }, { status: 500 })
    }

    // Best-effort event log for insights — never blocks the response on failure.
    await supabase.from('interactions').insert({
      user_id: user.id,
      event_type: 'tested_logged',
      entity_type: 'fragrance',
      entity_id: fragranceId,
      metadata: {},
    }).then(
      () => {},
      () => {}
    )

    return NextResponse.json({ success: true, status: 'tested' })
  } catch (err) {
    console.error('[collection/tested] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
