// app/api/admin/enrichment/list/route.ts
// GET /api/admin/enrichment/list?page=1&per_page=10
// Returns paginated pending descriptions with fragrance details

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get('page') || '1')
    const per_page = Number(req.nextUrl.searchParams.get('per_page') || '10')

    if (page < 1 || per_page < 1) {
      return NextResponse.json(
        { error: 'Invalid page or per_page' },
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

    // Get total count
    const { count, error: countError } = await supabase
      .from('description_enrichment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json(
        { error: 'Failed to count records' },
        { status: 500 }
      )
    }

    // Get paginated records
    const start = (page - 1) * per_page
    const end = start + per_page - 1

    const { data: queueRecords, error: queryError } = await supabase
      .from('description_enrichment_queue')
      .select('*')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .range(start, end)

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch records' },
        { status: 500 }
      )
    }

    // Join with fragrances to get name, brand, image
    const enrichedRecords = await Promise.all(
      (queueRecords || []).map(async (record) => {
        const { data: fragrance } = await supabase
          .from('fragrances')
          .select('name, brand, image_url')
          .eq('id', record.fragrance_id)
          .single()

        return {
          ...record,
          fragrance_name: fragrance?.name || 'Unknown',
          fragrance_brand: fragrance?.brand || 'Unknown',
          fragrance_image: fragrance?.image_url || null
        }
      })
    )

    return NextResponse.json({
      data: enrichedRecords,
      total: count || 0,
      page,
      per_page
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
