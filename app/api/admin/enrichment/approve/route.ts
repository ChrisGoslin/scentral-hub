// app/api/admin/enrichment/approve/route.ts
// POST /api/admin/enrichment/approve
// Approves or rejects a pending description. On approve, only the queue row's status is
// updated here — the description_enrichment_queue_approval DB trigger is what actually
// writes ai_description into fragrances.plain_description. Never a bulk operation.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-passcode') !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { queue_id, action } = await req.json()

  if (!queue_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Missing or invalid queue_id / action' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabaseAdmin = await createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: queueRecord, error: fetchError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('id, fragrance_id')
    .eq('id', queue_id)
    .maybeSingle()

  if (fetchError || !queueRecord) {
    return NextResponse.json({ error: 'Queue record not found' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .update({ status: action === 'approve' ? 'approved' : 'rejected' })
    .eq('id', queue_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    action: action === 'approve' ? 'approved' : 'rejected',
    fragrance_id: queueRecord.fragrance_id,
  })
}
