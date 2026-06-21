/**
 * app/api/collection/add/route.ts
 * Add fragrance to user's collection
 * POST /api/collection/add
 * Input: { fragrance_id: string }
 * Output: { success: true } or error
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get anonymous user ID from localStorage (passed via header)
    const anonIdHeader = req.headers.get('x-anon-id')
    if (!anonIdHeader) {
      return NextResponse.json(
        { error: 'Anonymous user ID not provided' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { fragrance_id } = body

    if (!fragrance_id || typeof fragrance_id !== 'string') {
      return NextResponse.json(
        { error: 'fragrance_id is required and must be a string' },
        { status: 400 }
      )
    }

    // Insert into collections table
    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          fragrance_id,
          created_at: new Date().toISOString(),
          affinity_score: null,
          status: 'owned',
          origin_code: 'B', // Barcode scanned
        },
      ])
      .select('id')

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: `Failed to add to collection: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data?.[0]?.id,
    })
  } catch (error) {
    console.error('Collection add error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
