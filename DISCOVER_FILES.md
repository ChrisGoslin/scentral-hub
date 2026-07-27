# nota. Discover Module — Source Files

**Repo:** `/Users/christophergoslin/Projects/scentral-hub`

**Files location:** `app/(main)/discover/`

---

## DiscoverClient.tsx

```tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import PersonaTipTicker from '@/components/ui/PersonaTipTicker'
import Button from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { getPersonaById } from '@/lib/personas'
import { track } from '@/lib/posthog'
import { DiscoverFilters } from './DiscoverFilters'
import { DiscoverGrid } from './DiscoverGrid'
import { useFragranceSearch, type DiscoverFragrance } from '@/lib/useFragranceSearch'
import { SmellsLikeResults, type SmellsLikeResult } from '@/components/discover/SmellsLikeResults'

export type { DiscoverFragrance }
import {
  SORT_OPTIONS,
  VIBE_TAGS,
  LONGEVITY_PROJECTIONS,
  OCCASION_TAGS,
  KNOWN_BRANDS,
  matchesAnyTag,
  familyToVibeTags,
  type SortOption,
} from '@/lib/filterConstants'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'

type Props = {
  fragrances: DiscoverFragrance[]
  error: string | null
  hasMore: boolean
  totalCount: number
}

export default function DiscoverClient({ fragrances, error, hasMore: initialHasMore, totalCount }: Props) {
  const [localFragrances, setLocalFragrances] = useState<DiscoverFragrance[]>(fragrances)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const [wishlist, setWishlist] = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)

  const [vibe, setVibe] = useState<string[]>([])
  const [longevity, setLongevity] = useState<string | null>(null)
  const [occasion, setOccasion] = useState<string[]>([])
  const [brand, setBrand] = useState<string[]>([])
  const [sort, setSort] = useState<SortOption>('A–Z')

  // Persona theme state
  const [activePersona, setActivePersona] = useState<ReturnType<typeof getPersonaById> | null>(null)
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null)
  const [personaVisible, setPersonaVisible] = useState(false)
  const [showPersonaBanner, setShowPersonaBanner] = useState(true)

  // Use search hook
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    searchFocused,
    setSearchFocused,
    searchResults,
    semanticResults,
    isSemanticSearching,
    semanticError,
    setSemanticError,
  } = useFragranceSearch(localFragrances)

  // "Smells Like" proximity search
  const [smellsLikeMode, setSmellsLikeMode] = useState(false)
  const [smellsLikeResults, setSmellsLikeResults] = useState<SmellsLikeResult[]>([])
  const [smellsLikeLoading, setSmellsLikeLoading] = useState(false)

  useEffect(() => {
    if (!smellsLikeMode || debouncedSearch.trim().length < 2) {
      setSmellsLikeResults([])
      return
    }

    let cancelled = false
    setSmellsLikeLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(debouncedSearch.trim())}&mode=smells_like`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setSmellsLikeResults(data.results ?? [])
      })
      .catch(e => {
        console.error('Smells Like search error', e)
        if (!cancelled) setSmellsLikeResults([])
      })
      .finally(() => {
        if (!cancelled) setSmellsLikeLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [smellsLikeMode, debouncedSearch])

  // Persona & localStorage mount effect
  useEffect(() => {
    const storedSort = localStorage.getItem('scentral_discover_sort') as SortOption | null
    if (storedSort && SORT_OPTIONS.includes(storedSort)) {
      setSort(storedSort)
    }

    const params = new URLSearchParams(window.location.search)
    const urlPersona = params.get('persona')
    const personaId = urlPersona ?? localStorage.getItem('scentral_persona')
    let defaultPersonaVibes: string[] = []

    if (personaId) {
      const persona = getPersonaById(personaId)
      if (persona) {
        setActivePersonaId(personaId)
        setActivePersona(persona)
        defaultPersonaVibes = familyToVibeTags(persona.discover_filters.families)
        setTimeout(() => setPersonaVisible(true), 80)
      }
    }

    const storedVibe = localStorage.getItem('scentral_discover_vibe')
    const initialVibe = storedVibe !== null ? JSON.parse(storedVibe) : defaultPersonaVibes

    if (initialVibe.length > 0) {
      setVibe(initialVibe)
    }
  }, [])

  useEffect(() => {
    document.title = activePersona ? `Discover · For ${activePersona.name}` : 'Discover | nota.'
  }, [activePersona])

  // Track search usage
  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      track('search_used', {
        query_length: debouncedSearch.length,
      })
    }
  }, [debouncedSearch])

  // Wishlist sync
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scentral_wishlist')
      if (stored) setWishlist(JSON.parse(stored))
    } catch {
      /* ignore */
    }
  }, [])

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const isRemoving = prev.includes(id)
      const next = isRemoving ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('scentral_wishlist', JSON.stringify(next))
      track('wishlist_toggled', {
        fragrance_id: id,
        action: isRemoving ? 'remove' : 'add',
      })
      return next
    })
  }

  // Filtering logic
  const anyFilter = !!(vibe.length || longevity || occasion.length || brand.length)
  const anySearch = searchTerm.trim().length > 0

  const filtered = useMemo(() => {
    let results: DiscoverFragrance[] = searchResults

    // Hybrid with semantic results
    if (debouncedSearch && semanticResults.length > 0) {
      const searchIds = new Set(results.map(f => f.id))
      const sements = semanticResults.filter(f => !searchIds.has(f.id))
      results = [...results, ...sements]
    }

    // Vibe filter (multi-select, OR logic)
    if (vibe.length > 0) {
      results = results.filter(f => vibe.some(v => matchesAnyTag(f.family, VIBE_TAGS[v] ?? [])))
    }

    // Longevity filter (single-select)
    if (longevity) {
      const projections = LONGEVITY_PROJECTIONS[longevity] || []
      results = results.filter(f => projections.includes(f.projection))
    }

    // Occasion filter (multi-select, OR logic)
    if (occasion.length > 0) {
      results = results.filter(f => occasion.some(o => matchesAnyTag(f.use_case, OCCASION_TAGS[o] ?? [])))
    }

    // Brand filter (multi-select, OR logic)
    if (brand.length > 0) {
      results = results.filter(f =>
        brand.some(h => (h === 'Niche' ? !KNOWN_BRANDS.includes(f.brand) : f.brand === h))
      )
    }

    // Wishlist filter
    if (showSaved) {
      results = results.filter(f => wishlist.includes(f.id))
    }

    // Sort
    const sorted = [...results]
    if (sort === 'A–Z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'Top Rated') {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else if (sort === 'Newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === 'Most Popular') {
      sorted.sort((a, b) => {
        const aWishes = wishlist.includes(a.id) ? 1 : 0
        const bWishes = wishlist.includes(b.id) ? 1 : 0
        return bWishes - aWishes || (b.rating ?? 0) - (a.rating ?? 0)
      })
    }

    return sorted
  }, [localFragrances, semanticResults, vibe, longevity, occasion, brand, showSaved, wishlist, sort, anySearch, searchResults, debouncedSearch])

  const countLabel = (() => {
    const base = `${filtered.length} fragrance${filtered.length !== 1 ? 's' : ''}`
    if (vibe.length) return `${base} • ${vibe.join(', ')}`
    if (longevity) return `${base} • ${longevity}`
    if (occasion.length) return `${base} • ${occasion.join(', ')}`
    if (brand.length) return `${base} • ${brand.join(', ')}`
    if (showSaved) return `${base} • Saved`
    return base
  })()

  const toggleVibe = (v: string) => {
    setVibe(prev => {
      const next = prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
      localStorage.setItem('scentral_discover_vibe', JSON.stringify(next))
      return next
    })
  }

  const toggleLongevity = (l: string) => {
    setLongevity(longevity === l ? null : l)
  }

  const toggleOccasion = (o: string) => {
    setOccasion(prev => (prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]))
  }

  const toggleBrand = (h: string) => {
    setBrand(prev => (prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]))
  }

  const clearFilters = () => {
    setVibe([])
    localStorage.setItem('scentral_discover_vibe', JSON.stringify([]))
    setLongevity(null)
    setOccasion([])
    setBrand([])
    setShowSaved(false)
    setSearchTerm('')
  }

  const loadMore = async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const offset = localFragrances.length
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('fragrances')
        .select(
          'id, brand, name, full_name, family, projection, optimal_season, use_case, plain_description, inspired_by, image_url, rating, created_at'
        )
        .order('brand', { ascending: true })
        .range(offset, offset + 99)

      if (err) {
        setLoadMoreError('Failed to load more fragrances. Try again.')
        return
      }

      if (!data) return

      const ids = data.map(f => f.id)
      const { data: ownerCounts } = ids.length
        ? await supabase.rpc('get_fragrance_social_proof', { fragrance_ids: ids })
        : { data: null }
      const ownerCountById = new Map<string, number>(
        (ownerCounts ?? []).map((row: { fragrance_id: string; owner_count: number }) => [
          row.fragrance_id,
          row.owner_count,
        ])
      )

      const mapped: DiscoverFragrance[] = data.map(f => ({
        id: f.id,
        brand: f.brand,
        name: f.name,
        full_name: f.full_name ?? `${f.brand} ${f.name}`,
        family: f.family ?? '',
        projection: f.projection ?? '',
        optimal_season: f.optimal_season ?? null,
        use_case: f.use_case ?? null,
        plain_description: f.plain_description ?? null,
        inspired_by: f.inspired_by ?? null,
        image_url: f.image_url ?? null,
        rating: f.rating ? Number(f.rating) : null,
        created_at: f.created_at,
        owner_count: ownerCountById.get(f.id) ?? 0,
      }))
      setLocalFragrances(prev => [...prev, ...mapped])
      setHasMore(mapped.length === 100)
      setLoadMoreError(null)
    } catch (e) {
      console.error('Load more error', e)
      setLoadMoreError('Connection error. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EmptyState headline="Couldn't load fragrances" caption={error} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))',
          background: 'var(--bg)',
          backgroundImage: activePersona && personaVisible ? activePersona.ui_theme.bgGradient : undefined,
          transition: 'background-image 0.4s ease',
        }}
      >
        {/* Filters — sticky edge-to-edge carousels */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg)' }}>
          <DiscoverFilters
            vibe={vibe}
            longevity={longevity}
            occasion={occasion}
            brand={brand}
            sort={sort}
            showSaved={showSaved}
            searchTerm={searchTerm}
            searchFocused={searchFocused}
            smellsLikeMode={smellsLikeMode}
            onSearchTermChange={setSearchTerm}
            onSearchFocus={setSearchFocused}
            onSmellsLikeToggle={() => setSmellsLikeMode(v => !v)}
            onVibeToggle={toggleVibe}
            onLongevityToggle={toggleLongevity}
            onOccasionToggle={toggleOccasion}
            onBrandToggle={toggleBrand}
            onSortChange={setSort}
            onShowSavedToggle={setShowSaved}
          />
        </div>

        {/* New to me strip */}
        {!anyFilter && !anySearch && (() => {
          const unseen = localFragrances.filter(f => !wishlist.includes(f.id)).slice(0, 12)
          if (unseen.length === 0) return null
          return (
            <div style={{ paddingBottom: 8 }}>
              <p
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  paddingLeft: 16,
                  marginBottom: 10,
                }}
              >
                New to me
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  paddingLeft: 16,
                  paddingRight: 16,
                  scrollbarWidth: 'none',
                }}
              >
                {unseen.map(f => (
                  <Link
                    key={f.id}
                    href={`/collection/${f.id}?from=discover`}
                    style={{ textDecoration: 'none', flexShrink: 0, width: 120 }}
                  >
                    <div
                      style={{
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r-card)',
                        overflow: 'hidden',
                        transition: 'border-color var(--motion-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
                    >
                      <FragranceCardMedia
                        imageUrl={f.image_url}
                        brand={f.brand}
                        name={f.name}
                        family={f.family}
                        compact
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Persona banner */}
        {activePersona && showPersonaBanner && (
          <div
            style={{
              margin: '0 16px 16px',
              padding: '12px 14px',
              borderRadius: 'var(--r-card)',
              borderLeft: `3px solid ${activePersona.ui_theme.accentColor}`,
              background: activePersona.ui_theme.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              opacity: personaVisible ? 1 : 0,
              transform: personaVisible ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 2,
                }}
              >
                Curated for
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  color: activePersona.ui_theme.accentColor,
                  fontStyle: 'italic',
                }}
              >
                {activePersona.name}
              </p>
            </div>
            <button
              onClick={() => {
                setShowPersonaBanner(false)
                setVibe([])
                localStorage.setItem('scentral_discover_vibe', JSON.stringify([]))
              }}
              aria-label="Show all fragrances"
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Show everything →
            </button>
          </div>
        )}

        {/* Grid */}
        <PersonaTipTicker personaId={activePersonaId} />
        {smellsLikeMode && anySearch ? (
          <SmellsLikeResults results={smellsLikeResults} loading={smellsLikeLoading} />
        ) : (
          <DiscoverGrid
            filtered={filtered}
            countLabel={countLabel}
            semanticResults={semanticResults}
            debouncedSearch={debouncedSearch}
            wishlist={wishlist}
            isSemanticSearching={isSemanticSearching}
            semanticError={semanticError}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            hasMore={hasMore}
            totalCount={localFragrances.length}
            onWishlistToggle={toggleWishlist}
            onLoadMore={loadMore}
            onClearFilters={clearFilters}
            onRetrySearch={() => setSemanticError(null)}
          />
        )}
      </div>
    </div>
  )
}
```

---

## DiscoverGrid.tsx

```tsx
'use client'

import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import Button from '@/components/ui/Button'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import AdSlot from '@/components/ads/AdSlot'
import { track } from '@/lib/posthog'
import type { DiscoverFragrance } from '@/lib/useFragranceSearch'

type Props = {
  filtered: DiscoverFragrance[]
  countLabel: string
  semanticResults: DiscoverFragrance[]
  debouncedSearch: string
  wishlist: string[]
  isSemanticSearching: boolean
  semanticError: string | null
  loadingMore: boolean
  loadMoreError: string | null
  hasMore: boolean
  totalCount: number

  onWishlistToggle: (id: string) => void
  onLoadMore: () => void
  onClearFilters: () => void
  onRetrySearch: () => void
}

export function DiscoverGrid({
  filtered,
  countLabel,
  semanticResults,
  debouncedSearch,
  wishlist,
  isSemanticSearching,
  semanticError,
  loadingMore,
  loadMoreError,
  hasMore,
  totalCount,
  onWishlistToggle,
  onLoadMore,
  onClearFilters,
  onRetrySearch,
}: Props) {
  return (
    <>
      {/* Result count */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {countLabel}
        </p>
        {isSemanticSearching && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="resonance-loader" />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.05em' }}>
              RESONATING...
            </span>
          </div>
        )}
      </div>

      {/* Semantic search error */}
      {semanticError && (
        <div style={{ padding: '8px 16px' }}>
          <ErrorInline message={semanticError} onRetry={onRetrySearch} color="warning" />
        </div>
      )}

      <style>{`
        @keyframes pulse-gold {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
        .resonance-loader {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse-gold 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No fragrances match right now"
            caption="Try adjusting your filters to find your next scent."
            action={
              <Button onClick={onClearFilters} variant="secondary">
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-10 gap-2 px-2">
          {filtered.map((f, idx) => (
            <>
              <Link
                key={f.id}
                href={`/collection/${f.id}?from=discover`}
                style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
              >
                <FragranceCardMedia imageUrl={f.image_url} brand={f.brand} name={f.name} family={f.family} wall />
                <button
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onWishlistToggle(f.id)
                  }}
                  aria-label={wishlist.includes(f.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: 0,
                    color: wishlist.includes(f.id) ? 'var(--accent)' : 'var(--text-muted)',
                    zIndex: 2,
                  }}
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill={wishlist.includes(f.id) ? 'var(--accent)' : 'none'}
                    stroke={wishlist.includes(f.id) ? 'var(--accent)' : 'currentColor'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                {debouncedSearch && semanticResults.some(sr => sr.id === f.id) && (
                  <div
                    aria-label="Resonance match"
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      width: 6,
                      height: 6,
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      zIndex: 2,
                    }}
                  />
                )}
              </Link>
              {(idx + 1) % 12 === 0 && (
                <div key={`ad-${idx}`} style={{ gridColumn: '1 / -1', padding: '16px 0' }}>
                  <AdSlot slot="discover-grid" />
                </div>
              )}
            </>
          ))}
        </div>
      )}

      {/* Load more error */}
      {loadMoreError && (
        <div style={{ padding: '0 16px 16px' }}>
          <ErrorInline message={loadMoreError} onRetry={onLoadMore} color="warning" />
        </div>
      )}

      {/* Load more */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-btn)',
              padding: '10px 32px',
              fontSize: 13,
              color: loadingMore ? 'var(--text-muted)' : 'var(--text)',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'border-color var(--motion-fast)',
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '16px 0' }}>
            All {totalCount} fragrances loaded
          </p>
        )}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </>
  )
}
```

---

## DiscoverFilters.tsx

```tsx
'use client'

import { useState } from 'react'
import Chip from '@/components/ui/Chip'
import {
  SORT_OPTIONS,
  VIBE_TAGS,
  LONGEVITY_PROJECTIONS,
  OCCASION_TAGS,
  KNOWN_BRANDS,
  type SortOption,
} from '@/lib/filterConstants'
import { track } from '@/lib/posthog'

type Props = {
  vibe: string[]
  longevity: string | null
  occasion: string[]
  brand: string[]
  sort: SortOption
  showSaved: boolean
  searchTerm: string
  searchFocused: boolean
  smellsLikeMode: boolean

  onSearchTermChange: (term: string) => void
  onSearchFocus: (focused: boolean) => void
  onSmellsLikeToggle: () => void
  onVibeToggle: (v: string) => void
  onLongevityToggle: (l: string) => void
  onOccasionToggle: (o: string) => void
  onBrandToggle: (h: string) => void
  onSortChange: (s: SortOption) => void
  onShowSavedToggle: (v: boolean) => void
}

function FilterCarousel({
  title,
  options,
  isActive,
  onToggle,
  tooltip,
}: {
  title: string
  options: string[]
  isActive: (v: string) => boolean
  onToggle: (v: string) => void
  tooltip?: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 16, marginBottom: 6, position: 'relative' }}>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          {title}
        </p>
        {tooltip && (
          <>
            <button
              type="button"
              onClick={() => setShowTooltip(prev => !prev)}
              aria-label={`What is ${title}?`}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              ⓘ
            </button>
            {showTooltip && (
              <>
                <div
                  onClick={() => setShowTooltip(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    zIndex: 46,
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-card)',
                    maxWidth: 240,
                  }}
                >
                  {tooltip}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
        {options.map(v => {
          const active = isActive(v)
          return (
            <Chip
              key={v}
              selected={active}
              onClick={() => onToggle(v)}
              style={{
                flexShrink: 0,
                minHeight: 44,
                scrollSnapAlign: 'start',
                boxShadow: active ? '0 0 0 2px var(--accent)' : 'none',
              }}
            >
              {v}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}

export function DiscoverFilters({
  vibe,
  longevity,
  occasion,
  brand,
  sort,
  showSaved,
  searchTerm,
  searchFocused,
  smellsLikeMode,
  onSearchTermChange,
  onSearchFocus,
  onSmellsLikeToggle,
  onVibeToggle,
  onLongevityToggle,
  onOccasionToggle,
  onBrandToggle,
  onSortChange,
  onShowSavedToggle,
}: Props) {
  const toggleVibe = (v: string) => {
    const isAdding = !vibe.includes(v)
    onVibeToggle(v)
    track('filter_applied', { type: 'vibe', value: v, action: isAdding ? 'add' : 'remove' })
  }

  const toggleLongevity = (l: string) => {
    const isAdding = longevity !== l
    onLongevityToggle(l)
    track('filter_applied', { type: 'longevity', value: l, action: isAdding ? 'add' : 'remove' })
  }

  const toggleOccasion = (o: string) => {
    const isAdding = !occasion.includes(o)
    onOccasionToggle(o)
    track('filter_applied', { type: 'occasion', value: o, action: isAdding ? 'add' : 'remove' })
  }

  const toggleBrand = (h: string) => {
    const isAdding = !brand.includes(h)
    onBrandToggle(h)
    track('filter_applied', { type: 'brand', value: h, action: isAdding ? 'add' : 'remove' })
  }

  const handleSortChange = (s: SortOption) => {
    onSortChange(s)
    localStorage.setItem('scentral_discover_sort', s)
  }

  return (
    <div style={{ padding: '16px 0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search */}
      <div style={{ padding: '0 16px' }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          Discover Fragrances
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by brand or scent…"
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            onFocus={() => onSearchFocus(true)}
            onBlur={() => onSearchFocus(false)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 14px',
              fontSize: 14,
              background: 'var(--surface)',
              border: searchFocused ? '1px solid var(--accent)' : '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              onSmellsLikeToggle()
              track('smells_like_toggled', { active: !smellsLikeMode })
            }}
            aria-pressed={smellsLikeMode}
            style={{
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderRadius: 'var(--r-card)',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: smellsLikeMode
                ? 'color-mix(in srgb, var(--accent) 16%, transparent)'
                : 'var(--surface)',
              border: smellsLikeMode ? '1px solid var(--accent)' : '1px solid var(--line)',
              color: smellsLikeMode ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {smellsLikeMode ? '✓ Smells Like' : 'Smells Like'}
          </button>
        </div>
      </div>

      <FilterCarousel
        title="Vibe"
        options={Object.keys(VIBE_TAGS)}
        isActive={v => vibe.includes(v)}
        onToggle={toggleVibe}
        tooltip="The mood or character of the scent — woody, fresh, floral etc."
      />

      <FilterCarousel
        title="Longevity"
        options={Object.keys(LONGEVITY_PROJECTIONS)}
        isActive={v => longevity === v}
        onToggle={toggleLongevity}
        tooltip="How long the scent lasts on your skin after spraying."
      />

      <FilterCarousel
        title="Occasion"
        options={Object.keys(OCCASION_TAGS)}
        isActive={v => occasion.includes(v)}
        onToggle={toggleOccasion}
        tooltip="When and where this fragrance fits best."
      />

      {/* Brand — multi-select, includes Saved alongside */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            paddingLeft: 16,
            marginBottom: 6,
          }}
        >
          Brand
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
          {[...KNOWN_BRANDS, 'Niche'].map(v => {
            const active = brand.includes(v)
            return (
              <Chip
                key={v}
                selected={active}
                onClick={() => toggleBrand(v)}
                style={{
                  flexShrink: 0,
                  minHeight: 44,
                  scrollSnapAlign: 'start',
                  boxShadow: active ? '0 0 0 2px var(--accent)' : 'none',
                }}
              >
                {v}
              </Chip>
            )
          })}
          <Chip
            selected={showSaved}
            onClick={() => onShowSavedToggle(!showSaved)}
            style={{ flexShrink: 0, minHeight: 44, scrollSnapAlign: 'start' }}
          >
            ❤ Saved
          </Chip>
        </div>
      </div>

      {/* Sort */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            paddingLeft: 16,
            marginBottom: 6,
          }}
        >
          Sort
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
          {SORT_OPTIONS.map(v => (
            <Chip
              key={v}
              selected={sort === v}
              onClick={() => handleSortChange(v)}
              style={{ flexShrink: 0, minHeight: 44, scrollSnapAlign: 'start' }}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
```
