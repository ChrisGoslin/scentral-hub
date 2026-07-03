import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const anonId = searchParams.get('anonId')
    const action = searchParams.get('action') // 'check' or 'get'

    if (!anonId) {
      return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if user has an active temptation this week
    if (action === 'check') {
      const weekStart = new Date()
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
      weekStart.setUTCHours(0, 0, 0, 0)

      const { data: existing, error: checkError } = await supabaseAdmin
        .from('temptations')
        .select('id')
        .eq('anon_id', anonId)
        .eq('status', 'pending')
        .gte('created_at', weekStart.toISOString())
        .limit(1)

      if (checkError) {
        console.error('Temptations check error:', checkError)
        return NextResponse.json({ hasActive: false, error: checkError.message }, { status: 500 })
      }

      return NextResponse.json({ hasActive: existing && existing.length > 0, count: existing?.length ?? 0 })
    }

    // Get current active temptation for this user
    const { data, error } = await supabaseAdmin
      .from('temptations')
      .select('id, fragrance_id, status, trigger_reason, first_shown_at, created_at')
      .eq('anon_id', anonId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Temptations fetch error:', error)
      return NextResponse.json({ error: error.message, temptation: null }, { status: 500 })
    }

    const temptation = data && data.length > 0 ? data[0] : null

    return NextResponse.json({ temptation })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Temptations route error:', msg)
    return NextResponse.json({ error: msg, temptation: null }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { anonId, fragranceId, status, triggerReason } = body

    if (!anonId || !fragranceId) {
      return NextResponse.json(
        { error: 'Missing anonId or fragranceId' },
        { status: 400 }
      )
    }

    if (!['pending', 'viewed', 'wishlisted', 'bought', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if user already has a pending temptation this week
    const weekStart = new Date()
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
    weekStart.setUTCHours(0, 0, 0, 0)

    const { data: existing } = await supabaseAdmin
      .from('temptations')
      .select('id')
      .eq('anon_id', anonId)
      .eq('status', 'pending')
      .gte('created_at', weekStart.toISOString())
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'User already has active temptation this week' },
        { status: 429 }
      )
    }

    // Create new temptation
    const { data, error } = await supabaseAdmin
      .from('temptations')
      .insert({
        anon_id: anonId,
        fragrance_id: fragranceId,
        status: status || 'pending',
        trigger_reason: triggerReason,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, fragrance_id, status, trigger_reason, created_at')

    if (error) {
      console.error('Temptations insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, temptation: data?.[0] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Temptations POST error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { anonId, temptationId, status } = body

    if (!anonId || !temptationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: anonId, temptationId, status' },
        { status: 400 }
      )
    }

    if (!['viewed', 'wishlisted', 'bought', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status for update' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Update temptation status (ownership check via anon_id)
    const { data, error } = await supabaseAdmin
      .from('temptations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', temptationId)
      .eq('anon_id', anonId)
      .select('id, status, updated_at')

    if (error) {
      console.error('Temptations update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Temptation not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, temptation: data[0] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Temptations PATCH error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
