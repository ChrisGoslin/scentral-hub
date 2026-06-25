import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || searchParams.get('q')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, use_case, plain_description, inspired_by, image_url, rating, created_at, owner_count')
      .order('brand', { ascending: true })

    if (search && search.trim().length > 0) {
      // Search: brand, name, inspired_by (for "Smells Like" mode)
      query = query
        .or(
          `brand.ilike.%${search}%,name.ilike.%${search}%,inspired_by.ilike.%${search}%,plain_description.ilike.%${search}%`
        )
        .limit(40)
    } else {
      query = query.limit(100)
    }

    const { data, error } = await query

    if (error) throw error

    // Return in the shape the hook expects: { similar_fragrances: [...] }
    return NextResponse.json({ similar_fragrances: data ?? [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg, similar_fragrances: [] }, { status: 500 })
  }
}
