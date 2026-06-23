# EPIC 3: "Smells Like" Proximity Discovery Engine
## Intelligent Search + 70%+ Note Matching

**Duration:** Weeks 6–8 (3 weeks)  
**Files:** `app/api/search/route.ts`, `components/SearchBar.tsx`, `app/(main)/discover/DiscoverClient.tsx`  
**Outcome:** Production-ready proximity search: exact matches + inspired-by relationships + 70%+ note-composition alternatives

---

## DESIGN PHILOSOPHY

Standard search is query-to-exact-match. Proximity search is **query-to-sensory-universe**. When Gavin searches "Sauvage," we don't just return Dior Sauvage. We return:
1. Exact: "Dior Sauvage"
2. DNA Siblings: "Lattafa Sauvage" (inspired-by)
3. Scent Twins: "Zara Sauvage Clone" (70%+ note match)

This transforms search from a navigation tool into a **discovery tool**—reducing decision paralysis and surfacing value propositions Gavin didn't know existed.

---

## IMPLEMENTATION

### Phase 1: Backend Search Logic (Week 6)

**File: `app/api/search/route.ts` (Complete Rewrite)**

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SearchResult {
  fragrance: any
  matchType: 'exact' | 'inspired_by' | 'note_similarity'
  confidence: number
  explanation?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim().toLowerCase()
  const mode = searchParams.get('mode') || 'all' // 'all' | 'exact' | 'smells_like'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 400 })
  }

  try {
    let results: SearchResult[] = []

    // QUERY 1: Exact matches (name, brand, description)
    if (mode === 'all' || mode === 'exact') {
      const { data: exactMatches } = await supabase
        .from('fragrances')
        .select('*')
        .or(
          `name.ilike.%${query}%,brand.ilike.%${query}%,plain_description.ilike.%${query}%`
        )
        .limit(20)

      if (exactMatches) {
        results = [
          ...results,
          ...exactMatches.map((frag) => ({
            fragrance: frag,
            matchType: 'exact' as const,
            confidence: 100,
          })),
        ]
      }
    }

    // QUERY 2: Inspired-by relationships (only if "Smells Like" mode)
    if (mode === 'all' || mode === 'smells_like') {
      const { data: inspiredMatches } = await supabase
        .from('fragrances')
        .select(
          `
          *,
          inspired_by:inspired_by_fragrance_id (
            source_fragrance_name,
            confidence_score
          )
        `
        )
        .or(`inspired_by_name.ilike.%${query}%`)
        .limit(15)

      if (inspiredMatches) {
        results = [
          ...results,
          ...inspiredMatches.map((frag: any) => ({
            fragrance: frag,
            matchType: 'inspired_by' as const,
            confidence: frag.inspired_by?.[0]?.confidence_score || 85,
            explanation: `Inspired by ${frag.inspired_by?.[0]?.source_fragrance_name || query}`,
          })),
        ]
      }
    }

    // QUERY 3: Note-composition similarity (70%+, only if "Smells Like" mode)
    if (mode === 'all' || mode === 'smells_like') {
      const { data: similarNotes } = await supabase
        .rpc('search_by_note_similarity', {
          search_query: query,
          min_similarity: 0.7,
          limit_results: 20,
        })

      if (similarNotes) {
        results = [
          ...results,
          ...similarNotes.map((frag: any) => ({
            fragrance: frag,
            matchType: 'note_similarity' as const,
            confidence: frag.similarity_score * 100,
            explanation: `Similar notes & structure (~${Math.round(frag.similarity_score * 100)}% match)`,
          })),
        ]
      }
    }

    // Deduplicate and sort by match type priority + confidence
    const uniqueResults = Array.from(
      new Map(results.map((r) => [r.fragrance.id, r])).values()
    ).sort((a, b) => {
      const matchTypePriority = { exact: 0, inspired_by: 1, note_similarity: 2 }
      const priorityDiff =
        matchTypePriority[a.matchType] - matchTypePriority[b.matchType]
      return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence
    })

    // Cache response for 5 minutes (ISR)
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
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Supabase function: search_by_note_similarity
// (Deploy via: supabase/migrations/[timestamp]_note_similarity_search.sql)
```

**Create Supabase RPC Function:**

File: `supabase/migrations/[timestamp]_note_similarity_search.sql`

```sql
CREATE OR REPLACE FUNCTION search_by_note_similarity(
  search_query TEXT,
  min_similarity FLOAT DEFAULT 0.7,
  limit_results INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand TEXT,
  top_notes TEXT,
  heart_notes TEXT,
  base_notes TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.brand,
    f.top_notes,
    f.heart_notes,
    f.base_notes,
    GREATEST(
      similarity(f.top_notes, search_query),
      similarity(f.heart_notes, search_query),
      similarity(f.base_notes, search_query),
      similarity(CONCAT_WS(' ', f.top_notes, f.heart_notes, f.base_notes), search_query)
    ) AS similarity_score
  FROM fragrances f
  WHERE (
    f.top_notes % search_query
    OR f.heart_notes % search_query
    OR f.base_notes % search_query
    OR CONCAT_WS(' ', f.top_notes, f.heart_notes, f.base_notes) % search_query
  )
  AND GREATEST(
    similarity(f.top_notes, search_query),
    similarity(f.heart_notes, search_query),
    similarity(f.base_notes, search_query),
    similarity(CONCAT_WS(' ', f.top_notes, f.heart_notes, f.base_notes), search_query)
  ) >= min_similarity
  ORDER BY similarity_score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Phase 2: Search UI with Toggle (Week 7)

**File: `components/SearchBar.tsx` (New Component)**

```typescript
'use client'

import { useState, useCallback, useDebugValue } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, mode: 'all' | 'exact' | 'smells_like') => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Search fragrances...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'all' | 'exact' | 'smells_like'>('all')
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      if (value.trim().length >= 2) {
        onSearch(value.trim(), mode)
      }
    },
    [mode, onSearch]
  )

  const toggleMode = useCallback(() => {
    const newMode = mode === 'smells_like' ? 'all' : 'smells_like'
    setMode(newMode)
    if (query.trim().length >= 2) {
      onSearch(query.trim(), newMode)
    }
  }, [mode, query, onSearch])

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-4 bg-gradient-to-b from-white/5 to-transparent">
      <div className="relative flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-white/50 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 100)}
            placeholder={placeholder}
            className="
              w-full pl-9 pr-8 py-2
              bg-white/5 border border-white/10
              rounded-lg
              text-white placeholder-white/50
              transition-all duration-200
              hover:bg-white/8 hover:border-white/15
              focus:bg-white/10 focus:border-white/20 focus:outline-none
            "
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                onSearch('', mode)
              }}
              className="absolute right-3 top-3 p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>

        {/* "Smells Like" Toggle */}
        <button
          onClick={toggleMode}
          className={`
            px-4 py-2 rounded-lg
            label-small font-semibold
            transition-all duration-200
            flex-shrink-0
            ${
              mode === 'smells_like'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/8'
            }
          `}
        >
          {mode === 'smells_like' ? '✓ Smells Like' : 'Smells Like'}
        </button>
      </div>
    </div>
  )
}
```

### Phase 3: Results Rendering (Week 8)

**File: `app/(main)/discover/DiscoverClient.tsx` (Update)**

Add search results rendering:

```typescript
'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/SearchBar'

export function DiscoverClient() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchMode, setSearchMode] = useState<'all' | 'exact' | 'smells_like'>('all')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string, mode: 'all' | 'exact' | 'smells_like') => {
    setSearchMode(mode)
    setHasSearched(true)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${mode}`)
    const data = await res.json()
    setSearchResults(data.results || [])
  }

  // Group results by match type (only in "Smells Like" mode)
  const groupedResults = searchMode === 'smells_like'
    ? {
        exact: searchResults.filter((r) => r.matchType === 'exact'),
        inspired_by: searchResults.filter((r) => r.matchType === 'inspired_by'),
        note_similarity: searchResults.filter((r) => r.matchType === 'note_similarity'),
      }
    : { all: searchResults }

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <SearchBar onSearch={handleSearch} />

      {hasSearched && searchResults.length > 0 && (
        <div className="px-4 md:px-6 lg:px-8 py-6">
          {searchMode === 'smells_like' ? (
            <>
              {/* Exact Matches */}
              {groupedResults.exact.length > 0 && (
                <section className="mb-8">
                  <h3 className="title-large mb-4 text-white">Exact Matches</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 md:gap-4 lg:gap-6">
                    {groupedResults.exact.map((result) => (
                      <BottleCard key={result.fragrance.id} fragrance={result.fragrance} />
                    ))}
                  </div>
                </section>
              )}

              {/* Inspired-By Relationships */}
              {groupedResults.inspired_by.length > 0 && (
                <section className="mb-8">
                  <h3 className="title-large mb-4 text-white">Clones & DNA Matches</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 md:gap-4 lg:gap-6">
                    {groupedResults.inspired_by.map((result) => (
                      <div key={result.fragrance.id} className="relative">
                        <BottleCard fragrance={result.fragrance} />
                        <span className="absolute top-2 right-2 px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs font-semibold text-cyan-300">
                          ~{Math.round(result.confidence)}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Note-Composition Matches */}
              {groupedResults.note_similarity.length > 0 && (
                <section className="mb-8">
                  <h3 className="title-large mb-4 text-white">Similar Notes & Structure</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 md:gap-4 lg:gap-6">
                    {groupedResults.note_similarity.map((result) => (
                      <div key={result.fragrance.id} className="relative">
                        <BottleCard fragrance={result.fragrance} />
                        <span className="absolute top-2 right-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-semibold text-white/80">
                          ~{Math.round(result.confidence)}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Standard grid for "all" mode */
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 md:gap-4 lg:gap-6">
              {searchResults.map((result) => (
                <BottleCard key={result.fragrance.id} fragrance={result.fragrance} />
              ))}
            </div>
          )}
        </div>
      )}

      {hasSearched && searchResults.length === 0 && (
        <div className="text-center py-16 text-white/60">
          No matches found. Try a different search or explore the collection.
        </div>
      )}
    </div>
  )
}
```

### Phase 4: QA & Deployment (Week 8, End)

**Testing Checklist:**
- [ ] Search "Sauvage" → returns Dior + Lattafa + 70%+ matches
- [ ] Toggle "Smells Like" → results reorganize into 3 sections
- [ ] Confidence badges display correctly (~85% Match, ~75% Match)
- [ ] Performance: Results load in <500ms (cached, ISR)
- [ ] Mobile: Sections stack vertically, no horizontal scroll
- [ ] Accessibility: All badges labelled, keyboard navigable
- [ ] No console errors on ambiguous queries

**Commit:**
```bash
git add app/api/search/route.ts components/SearchBar.tsx app/(main)/discover/DiscoverClient.tsx supabase/migrations/[timestamp]_note_similarity_search.sql
git commit -m "feat(epic-3): Smells Like proximity search + 70%+ note matching"
git checkout main
git merge --no-ff feat/epic-3-smells-like-search
git push origin main
```

---

**Epic 3 complete. Proceed to Epic 4: Aura AI Spritz Schedule.**
