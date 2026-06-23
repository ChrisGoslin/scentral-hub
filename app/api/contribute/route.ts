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

// XP award values per contribution type
const XP_VALUES = {
  new_fragrance: 50,
  add_notes: 20,
  rate_projection: 10,
  scent_memory: 15,
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { anonId, type, payload, fragranceId } = body

    if (!anonId || !type || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: anonId, type, payload' },
        { status: 400 }
      )
    }

    if (!['new_fragrance', 'add_notes', 'rate_projection', 'scent_memory'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid contribution type' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // For rate_projection: check if we have consensus (3+ users rating same value)
    let shouldAutoApprove = false
    let projectionValue = null

    if (type === 'rate_projection' && fragranceId && payload.value) {
      const { data: existingRatings } = await supabaseAdmin
        .from('pending_contributions')
        .select('payload')
        .eq('fragrance_id', fragranceId)
        .eq('type', 'rate_projection')
        .eq('status', 'approved')

      const approvedCount = (existingRatings ?? []).filter(
        r => r.payload?.value === payload.value
      ).length

      // Auto-approve if this value has 2+ existing approvals (making 3 total with this one)
      if (approvedCount >= 2) {
        shouldAutoApprove = true
        projectionValue = payload.value
      }
    }

    // Insert contribution record
    const { data: contributionData, error: contribError } = await supabaseAdmin
      .from('pending_contributions')
      .insert({
        anon_id: anonId,
        type,
        fragrance_id: fragranceId || null,
        payload,
        status: shouldAutoApprove ? 'approved' : 'pending',
        xp_awarded: 0,
      })
      .select('id')
      .single()

    if (contribError) {
      console.error('Contribution insert error:', contribError)
      return NextResponse.json({ error: contribError.message }, { status: 500 })
    }

    const xpToAward = XP_VALUES[type as keyof typeof XP_VALUES]

    // Update user XP
    const { data: xpRow } = await supabaseAdmin
      .from('user_xp')
      .select('total_xp, level')
      .eq('anon_id', anonId)
      .maybeSingle()

    const newTotalXp = (xpRow?.total_xp ?? 0) + xpToAward
    const newLevel = levelForXp(newTotalXp)

    const { error: xpError } = await supabaseAdmin
      .from('user_xp')
      .upsert({
        anon_id: anonId,
        total_xp: newTotalXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })

    if (xpError) {
      console.error('XP upsert error:', xpError)
      return NextResponse.json({ error: xpError.message }, { status: 500 })
    }

    // If rate_projection auto-approved: update fragrances.projection
    if (shouldAutoApprove && fragranceId && projectionValue) {
      const { error: fragError } = await supabaseAdmin
        .from('fragrances')
        .update({ projection: projectionValue, updated_at: new Date().toISOString() })
        .eq('id', fragranceId)

      if (fragError) {
        console.error('Fragrance projection update error:', fragError)
        // Non-fatal — contribution still recorded
      }
    }

    return NextResponse.json({
      success: true,
      xp_awarded: xpToAward,
      contribution_id: contributionData.id,
      auto_approved: shouldAutoApprove,
    })
  } catch (error) {
    console.error('Contribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
