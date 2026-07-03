// app/api/admin/enrichment/stats/route.ts
// GET /api/admin/enrichment/stats
// Returns stats: pending count, approved today count, rejected count

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Pending count
    const { count: pendingCount, error: pendingError } = await supabase
      .from('description_enrichment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')

    if (pendingError) {
      console.error('Pending count error:', pendingError)
      return NextResponse.json(
        { error: 'Failed to count pending' },
        { status: 500 }
      )
    }

    // Approved today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayIso = today.toISOString()

    const { count: approvedTodayCount, error: approvedError } = await supabase
      .from('description_enrichment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('reviewed_at', todayIso)

    if (approvedError) {
      console.error('Approved today error:', approvedError)
      return NextResponse.json(
        { error: 'Failed to count approved today' },
        { status: 500 }
      )
    }

    // Rejected count (all time)
    const { count: rejectedCount, error: rejectedError } = await supabase
      .from('description_enrichment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    if (rejectedError) {
      console.error('Rejected count error:', rejectedError)
      return NextResponse.json(
        { error: 'Failed to count rejected' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pending: pendingCount || 0,
      approved_today: approvedTodayCount || 0,
      rejected: rejectedCount || 0
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
