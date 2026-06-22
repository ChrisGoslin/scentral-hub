import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type MatchType = 'exact' | 'inspired_by' | 'note_similarity'

type SearchResult = {
  fragrance: Record<string, unknown>
  matchType: MatchType
  confidence: number
  explanation?: string
}

// NOTE: `clone_target` is referenced in app/(main)/collection/[id]/page.tsx but does not
// exist on the live `fragrances` table (verified via direct query) — `inspired_by` is the
// only real clone-relationship column. Do not reintroduce clone_target here.
const FRAGRANCE_COLUMNS =
  'id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, top_notes, heart_notes, base_notes, created_at'

const INSPIRED_BY_CONFIDENCE = 85

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim()
  const mode = (searchParams.get('mode') || 'all') as 'all' | 'exact' | 'smells_like'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const results: SearchResult[] = []
    const escaped = query.replace(/[%,]/g, '')

    // QUERY 1: Exact matches (name, brand, full name, description)
    let exactMatches: Record<string, unknown>[] = []
    if (mode === 'all' || mode === 'exact' || mode === 'smells_like') {
      const { data, error: exactError } = await supabase
        .from('fragrances')
        .select(FRAGRANCE_COLUMNS)
        .or(
          `name.ilike.%${escaped}%,brand.ilike.%${escaped}%,full_name.ilike.%${escaped}%,plain_description.ilike.%${escaped}%`
        )
        .limit(20)

      if (exactError) throw exactError
      exactMatches = data ?? []
      results.push(
        ...exactMatches.map((frag) => ({
          fragrance: frag,
          matchType: 'exact' as const,
          confidence: 100,
        }))
      )
    }

    // QUERY 2 + 3 only apply in "Smells Like" discovery mode
    if (mode === 'all' || mode === 'smells_like') {
      // QUERY 2: Inspired-by / clone relationships
      const { data: inspiredMatches, error: inspiredError } = await supabase
        .from('fragrances')
        .select(FRAGRANCE_COLUMNS)
        .ilike('inspired_by', `%${escaped}%`)
        .limit(15)

      if (inspiredError) throw inspiredError

      if (inspiredMatches) {
        results.push(
          ...inspiredMatches.map((frag: any) => ({
            fragrance: frag,
            matchType: 'inspired_by' as const,
            confidence: INSPIRED_BY_CONFIDENCE,
            explanation: `Inspired by ${frag.inspired_by || query}`,
          }))
        )
      }

      // QUERY 3: Note-composition similarity, seeded from the exact-match fragrance(s).
      // Scored as note-set overlap (intersection / largest set). A 0.7 ("70%+") floor is
      // unreachable against this catalogue's actual note tagging — even verified clone
      // pairs (matched via inspired_by) top out around 0.55-0.6 overlap, since clones use
      // different specific note words for a similar accord (e.g. "Pink Pepper" vs "Black
      // Pepper"). 0.45 surfaces genuinely similar fragrances without being meaningless.
      const NOTE_SIMILARITY_FLOOR = 0.45
      const seeds = exactMatches.filter(
        (f: any) => f.top_notes?.length || f.heart_notes?.length || f.base_notes?.length
      )

      for (const seed of seeds as any[]) {
        const seedNotes = [...(seed.top_notes ?? []), ...(seed.heart_notes ?? []), ...(seed.base_notes ?? [])]
        if (seedNotes.length === 0) continue

        const { data: similarNotes, error: similarityError } = await supabase.rpc('search_by_note_similarity', {
          seed_notes: seedNotes,
          exclude_id: seed.id,
          min_similarity: NOTE_SIMILARITY_FLOOR,
          limit_results: 20,
        })

        if (similarityError) throw similarityError
        if (!similarNotes?.length) continue

        const ids = similarNotes.map((row: any) => row.id)
        const { data: fullRecords, error: fullRecordsError } = await supabase
          .from('fragrances')
          .select(FRAGRANCE_COLUMNS)
          .in('id', ids)
        if (fullRecordsError) throw fullRecordsError
        const byId = new Map((fullRecords ?? []).map((f: any) => [f.id, f]))

        results.push(
          ...similarNotes
            .filter((row: any) => byId.has(row.id))
            .map((row: any) => ({
              fragrance: byId.get(row.id),
              matchType: 'note_similarity' as const,
              confidence: row.similarity_score * 100,
              explanation: `Similar notes & structure (~${Math.round(row.similarity_score * 100)}% match)`,
            }))
        )
      }
    }

    // Deduplicate by fragrance id, keep highest-priority match, sort by priority then confidence
    const matchTypePriority: Record<MatchType, number> = { exact: 0, inspired_by: 1, note_similarity: 2 }
    const byId = new Map<string, SearchResult>()
    for (const result of results) {
      const id = result.fragrance.id as string
      const existing = byId.get(id)
      if (!existing || matchTypePriority[result.matchType] < matchTypePriority[existing.matchType]) {
        byId.set(id, result)
      }
    }

    const uniqueResults = Array.from(byId.values()).sort((a, b) => {
      const priorityDiff = matchTypePriority[a.matchType] - matchTypePriority[b.matchType]
      return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence
    })

    return NextResponse.json(
      { results: uniqueResults },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
