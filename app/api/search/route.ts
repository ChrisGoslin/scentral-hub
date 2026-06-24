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

    let exactMatches: Record<string, unknown>[] = []
    let inspiredMatches: Record<string, unknown>[] = []

    // QUERY 1 & 2: Run in parallel
    if (mode === 'all' || mode === 'exact' || mode === 'smells_like') {
      const [exactRes, inspiredRes] = await Promise.all([
        supabase
          .from('fragrances')
          .select(FRAGRANCE_COLUMNS)
          .or(
            `name.ilike.%${escaped}%,brand.ilike.%${escaped}%,full_name.ilike.%${escaped}%,plain_description.ilike.%${escaped}%`
          )
          .limit(20),
        mode === 'all' || mode === 'smells_like'
          ? supabase
              .from('fragrances')
              .select(FRAGRANCE_COLUMNS)
              .ilike('inspired_by', `%${escaped}%`)
              .limit(15)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (exactRes.error) throw exactRes.error
      if (inspiredRes.error) throw inspiredRes.error

      exactMatches = exactRes.data ?? []
      inspiredMatches = inspiredRes.data ?? []

      results.push(
        ...exactMatches.map((frag) => ({
          fragrance: frag,
          matchType: 'exact' as const,
          confidence: 100,
        }))
      )

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
    }

    // QUERY 3: Note-composition similarity — only if we have exact matches with notes
    if ((mode === 'all' || mode === 'smells_like') && exactMatches.length > 0) {
      const NOTE_SIMILARITY_FLOOR = 0.45
      const MAX_SIMILARITY_SEEDS = 3
      // search_by_note_similarity does a full-table scan per call (no index can help an
      // array-overlap computation) — capping seeds keeps worst-case concurrent scans bounded
      // regardless of how many exact matches a query returns. See DB migration follow-up
      // for the indexed version that removes this cap's need entirely.
      const seeds = exactMatches
        .filter((f: any) => f.top_notes?.length || f.heart_notes?.length || f.base_notes?.length)
        .slice(0, MAX_SIMILARITY_SEEDS)

      // OPTIMIZED: Parallel RPC calls instead of sequential for loop
      if (seeds.length > 0) {
        const similarityPromises = (seeds as any[]).map((seed) => {
          const seedNotes = [...(seed.top_notes ?? []), ...(seed.heart_notes ?? []), ...(seed.base_notes ?? [])]
          if (seedNotes.length === 0) return Promise.resolve({ seed, similarNotes: [] })

          return supabase
            .rpc('search_by_note_similarity', {
              seed_notes: seedNotes,
              exclude_id: seed.id,
              min_similarity: NOTE_SIMILARITY_FLOOR,
              limit_results: 20,
            })
            .then(({ data, error }) => {
              if (error) throw error
              return { seed, similarNotes: data ?? [] }
            })
        })

        const similarityResults = await Promise.all(similarityPromises)

        // Collect all unique IDs to fetch in one query
        const allIds = new Set<string>()
        similarityResults.forEach((result: any) => {
          result.similarNotes.forEach((row: any) => allIds.add(row.id))
        })

        if (allIds.size > 0) {
          const { data: fullRecords, error: fullRecordsError } = await supabase
            .from('fragrances')
            .select(FRAGRANCE_COLUMNS)
            .in('id', Array.from(allIds))

          if (fullRecordsError) throw fullRecordsError
          const byId = new Map((fullRecords ?? []).map((f: any) => [f.id, f]))

          // Map all similarity results back to fragrances
          similarityResults.forEach((result: any) => {
            results.push(
              ...result.similarNotes
                .filter((row: any) => byId.has(row.id))
                .map((row: any) => ({
                  fragrance: byId.get(row.id),
                  matchType: 'note_similarity' as const,
                  confidence: row.similarity_score * 100,
                  explanation: `Similar notes & structure (~${Math.round(row.similarity_score * 100)}% match)`,
                }))
            )
          })
        }
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
