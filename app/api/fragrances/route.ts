import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  let search = searchParams.get('search') || searchParams.get('q')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, use_case, plain_description, inspired_by, image_url, rating, created_at')

    if (id) {
      // Lookup by ID: return single fragrance
      query = query.eq('id', id).limit(1)
    } else {
      query = query.order('brand', { ascending: true })
      if (search && search.trim().length > 0) {
        // Sanitize: strip PostgREST filter operators (commas, parentheses) to prevent injection
        search = search.replace(/[,()]/g, '')
        // Search: brand, name, inspired_by (for "Smells Like" mode)
        query = query
          .or(
            `brand.ilike.%${search}%,name.ilike.%${search}%,inspired_by.ilike.%${search}%,plain_description.ilike.%${search}%`
          )
          .limit(40)
      } else {
        query = query.limit(100)
      }
    }

    const { data, error } = await query

    if (error) throw error

    // Fetch owner counts for all returned fragrances (batched)
    const fragrances = data ?? []
    const ownerCounts: Record<string, number> = {}

    if (fragrances.length > 0) {
      try {
        const fragIds = fragrances.map(f => f.id)
        const { data: socialProof, error: spError } = await supabase.rpc(
          'get_fragrance_social_proof',
          { fragrance_ids: fragIds }
        )
        if (!spError && socialProof) {
          socialProof.forEach((row: { fragrance_id: string; owner_count: number }) => {
            ownerCounts[row.fragrance_id] = Number(row.owner_count)
          })
        }
      } catch (err) {
        // Silent fallback: owner counts default to 0 if lookup fails
        console.error('Failed to fetch owner counts:', err)
      }
    }

    // Merge owner counts into fragrance data
    const enriched = fragrances.map(f => ({
      ...f,
      owner_count: ownerCounts[f.id] ?? 0
    }))

    // Return in the shape the hook expects: { similar_fragrances: [...] }
    return NextResponse.json({ similar_fragrances: enriched })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg, similar_fragrances: [] }, { status: 500 })
  }
}
