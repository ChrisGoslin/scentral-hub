// app/api/admin/enrichment/stats/route.ts
// GET /api/admin/enrichment/stats
// Returns stats: pending count, approved today count, rejected count

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-passcode') !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabaseAdmin = await createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { count: pendingCount, error: pendingError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: approvedTodayCount, error: approvedError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('reviewed_at', today.toISOString())

  if (approvedError) {
    return NextResponse.json({ error: approvedError.message }, { status: 500 })
  }

  const { count: rejectedCount, error: rejectedError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  if (rejectedError) {
    return NextResponse.json({ error: rejectedError.message }, { status: 500 })
  }

  return NextResponse.json({
    pending: pendingCount || 0,
    approved_today: approvedTodayCount || 0,
    rejected: rejectedCount || 0,
  })
}
