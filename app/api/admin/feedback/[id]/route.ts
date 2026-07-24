import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]

function levelForXp(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

const XP_VALUES: Record<string, number> = {
  bug: 50,
  enhancement: 75,
  suggestion: 25,
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get('x-admin-passcode') !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { action, admin_note } = await req.json()
    if (!['building', 'captured'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const supabaseAdmin = await createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: row, error: fetchError } = await supabaseAdmin
      .from('feedback')
      .select('id, type, session_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    let xpAwarded = 0

    if (action === 'building' && row.status !== 'building') {
      xpAwarded = XP_VALUES[row.type] ?? 0

      if (xpAwarded > 0 && row.session_id) {
        // Best-effort — feedback isn't tied to real auth yet, so this only lands
        // if session_id matches an existing user_xp.anon_id row.
        const { data: xpRow } = await supabaseAdmin
          .from('user_xp')
          .select('total_xp')
          .eq('anon_id', row.session_id)
          .maybeSingle()

        const newTotalXp = (xpRow?.total_xp ?? 0) + xpAwarded
        await supabaseAdmin.from('user_xp').upsert({
          anon_id: row.session_id,
          total_xp: newTotalXp,
          level: levelForXp(newTotalXp),
          updated_at: new Date().toISOString(),
        })
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('feedback')
      .update({
        status: action,
        xp_awarded: action === 'building' ? xpAwarded : 0,
        admin_note: admin_note ?? null,
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, xp_awarded: xpAwarded })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
