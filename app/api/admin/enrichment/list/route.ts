// app/api/admin/enrichment/list/route.ts
// GET /api/admin/enrichment/list?page=1&per_page=10
// Returns paginated pending_review descriptions with fragrance details

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-passcode') !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = Number(req.nextUrl.searchParams.get('page') || '1')
  const per_page = Number(req.nextUrl.searchParams.get('per_page') || '10')

  if (page < 1 || per_page < 1) {
    return NextResponse.json({ error: 'Invalid page or per_page' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { count, error: countError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const start = (page - 1) * per_page
  const end = start + per_page - 1

  const { data: queueRecords, error: queryError } = await supabaseAdmin
    .from('description_enrichment_queue')
    .select('id, fragrance_id, ai_description, status, created_at')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .range(start, end)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  const enrichedRecords = await Promise.all(
    (queueRecords || []).map(async record => {
      const { data: fragrance } = await supabaseAdmin
        .from('fragrances')
        .select('name, brand, image_url')
        .eq('id', record.fragrance_id)
        .maybeSingle()

      return {
        ...record,
        fragrance_name: fragrance?.name || 'Unknown',
        fragrance_brand: fragrance?.brand || 'Unknown',
        fragrance_image: fragrance?.image_url || null,
      }
    })
  )

  return NextResponse.json({ data: enrichedRecords, total: count || 0, page, per_page })
}
