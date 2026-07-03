// app/api/admin/enrichment/approve/route.ts
// POST /api/admin/enrichment/approve
// Approves a pending description from the enrichment queue
// Moves it to fragrances.plain_description and updates queue status

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // Simple token-based auth (check against env var in production)
    const authHeader = req.headers.get('Authorization')
    const adminToken = process.env.ADMIN_ENRICHMENT_TOKEN
    if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { queue_id, action } = await req.json()

    if (!queue_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing or invalid queue_id / action' },
        { status: 400 }
      )
    }

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

    // Fetch the queue record
    const { data: queueRecord, error: fetchError } = await supabase
      .from('description_enrichment_queue')
      .select('*')
      .eq('id', queue_id)
      .single()

    if (fetchError || !queueRecord) {
      return NextResponse.json(
        { error: 'Queue record not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Write to fragrances.plain_description
      const { error: updateError } = await supabase
        .from('fragrances')
        .update({ plain_description: queueRecord.generated_description })
        .eq('id', queueRecord.fragrance_id)

      if (updateError) {
        console.error('Error updating fragrance:', updateError)
        return NextResponse.json(
          { error: 'Failed to update fragrance' },
          { status: 500 }
        )
      }

      // Mark queue record as approved
      const { error: markError } = await supabase
        .from('description_enrichment_queue')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', queue_id)

      if (markError) {
        console.error('Error marking queue record:', markError)
        return NextResponse.json(
          { error: 'Failed to mark as approved' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'approved',
        fragrance_id: queueRecord.fragrance_id
      })
    } else {
      // Reject: just mark status as rejected, don't write to fragrances
      const { error: rejectError } = await supabase
        .from('description_enrichment_queue')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', queue_id)

      if (rejectError) {
        console.error('Error rejecting queue record:', rejectError)
        return NextResponse.json(
          { error: 'Failed to reject' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'rejected',
        fragrance_id: queueRecord.fragrance_id
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
