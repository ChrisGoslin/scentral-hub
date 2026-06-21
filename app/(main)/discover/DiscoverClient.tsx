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

export type { DiscoverFragrance }
import {
  SORT_OPTIONS,
  FEEL_FAMILIES,
  FEEL_AMBIENT,
  LONGEVITY_PROJECTIONS,
  KNOWN_BRANDS,
  familyToFeel,
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

  const [feel, setFeel] = useState<string | null>(null)
  const [longevity, setLongevity] = useState<string | null>(null)
  const [brand, setBrand] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('A–Z')

  const [isMobile, setIsMobile] = useState(false)

  // Ambient glow state (driven by active feel chip)
  const [activeGlow, setActiveGlow] = useState<string>('transparent')

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

  // Mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 400)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persona & localStorage mount effect
  useEffect(() => {
    const storedSort = localStorage.getItem('scentral_discover_sort') as SortOption | null
    if (storedSort && SORT_OPTIONS.includes(storedSort)) {
      setSort(storedSort)
    }

    const params = new URLSearchParams(window.location.search)
    const urlPersona = params.get('persona')
    const personaId = urlPersona ?? localStorage.getItem('scentral_persona')
    let defaultPersonaFeel = null

    if (personaId) {
      const persona = getPersonaById(personaId)
      if (persona) {
        setActivePersonaId(personaId)
        setActivePersona(persona)
        defaultPersonaFeel = familyToFeel(persona.discover_filters.families)
        setTimeout(() => setPersonaVisible(true), 80)
      }
    }

    const storedFeel = localStorage.getItem('scentral_discover_feel')
    const initialFeel = storedFeel !== null ? (storedFeel || null) : defaultPersonaFeel

    if (initialFeel) {
      setFeel(initialFeel)
      setActiveGlow(FEEL_AMBIENT[initialFeel]?.bgGlow ?? 'transparent')
    }
  }, [])

  useEffect(() => {
    document.title = activePersona ? `Discover · For ${activePersona.name}` : 'Discover | AnotherSense'
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
  const anyFilter = !!(feel || longevity || brand)
  const anySearch = searchTerm.trim().length > 0

  const filtered = useMemo(() => {
    let results: DiscoverFragrance[] = searchResults

    // Hybrid with semantic results
    if (debouncedSearch && semanticResults.length > 0) {
      const searchIds = new Set(results.map(f => f.id))
      const sements = semanticResults.filter(f => !searchIds.has(f.id))
      results = [...results, ...sements]
    }

    // Feel filter
    if (feel) {
      const families = [feel]
      results = results.filter(f => {
        const matchFam = families.length === 0 || (f.family && families.some(fam => FEEL_FAMILIES[fam]?.includes(f.family)))
        const matchProj =
          f.projection && [feel].some(proj => LONGEVITY_PROJECTIONS[proj]?.includes(f.projection))
        return matchFam || matchProj
      })
    }

    // Longevity filter
    if (longevity) {
      const projections = LONGEVITY_PROJECTIONS[longevity] || []
      results = results.filter(f => projections.includes(f.projection))
    }

    // Brand filter
    if (brand) {
      if (brand === 'Other') {
        results = results.filter(f => !KNOWN_BRANDS.includes(f.brand))
      } else {
        results = results.filter(f => f.brand === brand)
      }
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
  }, [localFragrances, semanticResults, feel, longevity, brand, showSaved, wishlist, sort, anySearch, searchResults, debouncedSearch])

  const countLabel = (() => {
    const base = `${filtered.length} fragrance${filtered.length !== 1 ? 's' : ''}`
    if (feel) return `${base} • ${feel}`
    if (longevity) return `${base} • ${longevity}`
    if (brand) return `${base} • ${brand}`
    if (showSaved) return `${base} • Saved`
    return base
  })()

  const toggleFeel = (f: string) => {
    const next = feel === f ? null : f
    setFeel(next)
    setActiveGlow(next ? (FEEL_AMBIENT[next]?.bgGlow ?? 'transparent') : 'transparent')
    localStorage.setItem('scentral_discover_feel', next || '')
  }

  const toggleLongevity = (l: string) => {
    setLongevity(longevity === l ? null : l)
  }

  const toggleBrand = (b: string) => {
    setBrand(brand === b ? null : b)
  }

  const clearFilters = () => {
    setFeel(null)
    setActiveGlow('transparent')
    localStorage.setItem('scentral_discover_feel', '')
    setLongevity(null)
    setBrand(null)
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
          'id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at'
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
      {/* Ambient feel-filter colour wash */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: activeGlow,
          transition: 'background 300ms ease',
          willChange: 'background',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          background: 'var(--bg)',
          backgroundImage: activePersona && personaVisible ? activePersona.ui_theme.bgGradient : undefined,
          transition: 'background-image 0.4s ease',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Filters */}
        <DiscoverFilters
          feel={feel}
          longevity={longevity}
          brand={brand}
          sort={sort}
          showSaved={showSaved}
          searchTerm={searchTerm}
          searchFocused={searchFocused}
          activeGlow={activeGlow}
          onSearchTermChange={setSearchTerm}
          onSearchFocus={setSearchFocused}
          onFeelToggle={toggleFeel}
          onLongevityToggle={toggleLongevity}
          onBrandToggle={toggleBrand}
          onSortChange={setSort}
          onShowSavedToggle={setShowSaved}
        />

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
                setFeel(null)
                setActiveGlow('transparent')
                localStorage.setItem('scentral_discover_feel', '')
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
        <DiscoverGrid
          filtered={filtered}
          countLabel={countLabel}
          semanticResults={semanticResults}
          debouncedSearch={debouncedSearch}
          wishlist={wishlist}
          isMobile={isMobile}
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
      </div>
    </div>
  )
}
