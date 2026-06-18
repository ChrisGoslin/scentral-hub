'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { createClient } from '@/utils/supabase/client'

export type DiscoverFragrance = {
  id: string
  brand: string
  name: string
  full_name: string
  family: string
  projection: string
  optimal_season: string | null
  plain_description: string | null
  inspired_by: string | null
  image_url: string | null
  rating: number | null
  created_at: string
}

// ── Sort types ───────────────────────────────────────────────────────────────

type SortOption = 'A–Z' | 'Top Rated' | 'Newest' | 'Most Popular'
const SORT_OPTIONS: SortOption[] = ['A–Z', 'Top Rated', 'Newest', 'Most Popular']

// ── Filter maps ──────────────────────────────────────────────────────────────

const FEEL_FAMILIES: Record<string, string[]> = {
  'Warm & Rich':    ['Woody Oriental', 'Oriental', 'Amber', 'Oud', 'Gourmand'],
  'Fresh & Clean':  ['Citrus', 'Aquatic', 'Green', 'Fresh Spicy'],
  'Bold & Lasting': ['Leather', 'Tobacco', 'Smoky', 'Resinous'],
  'Light & Subtle': [],
}
const FEEL_PROJECTIONS: Record<string, string[]> = {
  'Warm & Rich':    [],
  'Fresh & Clean':  [],
  'Bold & Lasting': ['Beast Mode', 'Strong'],
  'Light & Subtle': ['Soft', 'Moderate'],
}

const LONGEVITY_PROJECTIONS: Record<string, string[]> = {
  'Lasts all day':  ['Beast Mode', 'Strong'],
  'A few hours':    ['Moderate'],
  'Quick burst':    ['Soft', 'Light'],
}

const KNOWN_BRANDS = ['Lattafa', 'Afnan', 'Rasasi', 'Armaf', 'Swiss Arabian']

const VIBE_TO_FEEL: Record<string, string> = {
  warm:  'Warm & Rich',
  fresh: 'Fresh & Clean',
  bold:  'Bold & Lasting',
  soft:  'Light & Subtle',
}

// ── Card image ───────────────────────────────────────────────────────────────

function FragranceImage({ imageUrl, brand, name }: { imageUrl: string | null; brand: string; name: string }) {
  if (!imageUrl) {
    return (
      <div
        style={{
          width: '100%', aspectRatio: '1 / 1',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
          borderRadius: 10,
          padding: 8, gap: 4,
        }}
      >
        <span style={{ fontSize: 32 }}>{getBrandEmoji(brand)}</span>
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginTop: 4 }}>
          {brand}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '14px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name.length > 24 ? name.slice(0, 22) + '…' : name}
        </p>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)' }}>
      <img src={imageUrl} alt={`${brand} ${name}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

type Props = {
  fragrances: DiscoverFragrance[]
  error: string | null
  hasMore: boolean
  totalCount: number
}

export default function DiscoverClient({ fragrances, error, hasMore, totalCount }: Props) {
  const [localFragrances, setLocalFragrances] = useState<DiscoverFragrance[]>(fragrances)
  const [hasMoreLocal, setHasMoreLocal]       = useState(hasMore)
  const [loadingMore, setLoadingMore]         = useState(false)

  const [feel, setFeel]           = useState<string | null>(null)
  const [longevity, setLongevity] = useState<string | null>(null)
  const [brand, setBrand]         = useState<string | null>(null)
  const [sort, setSort]           = useState<SortOption>('A–Z')
  const [vibeActive, setVibeActive] = useState(false)

  const [wishlist, setWishlist]             = useState<Set<string>>(new Set())
  const [wishlistFilter, setWishlistFilter] = useState(false)

  const [searchTerm, setSearchTerm]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: read scentral_vibe, sort, and scentral_wishlist from localStorage
  useEffect(() => {
    const vibe = localStorage.getItem('scentral_vibe')
    if (vibe && VIBE_TO_FEEL[vibe]) {
      setFeel(VIBE_TO_FEEL[vibe])
      setVibeActive(true)
    }

    const savedSort = localStorage.getItem('scentral_discover_sort') as SortOption
    if (savedSort && SORT_OPTIONS.includes(savedSort)) {
      setSort(savedSort)
    }

    try {
      const stored = localStorage.getItem('scentral_wishlist')
      if (stored) setWishlist(new Set(JSON.parse(stored) as string[]))
    } catch { /* ignore malformed data */ }
  }, [])

  function toggleWishlist(id: string) {
    setWishlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem('scentral_wishlist', JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  // Persist sort selection
  useEffect(() => {
    localStorage.setItem('scentral_discover_sort', sort)
  }, [sort])

  // Debounce search input 200ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchTerm])

  const popularityMap = useMemo(() => {
    const map: Record<string, number> = {}
    localFragrances.forEach(f => {
      if (f.inspired_by) {
        const key = f.inspired_by.toLowerCase()
        map[key] = (map[key] || 0) + 1
      }
    })
    return map
  }, [localFragrances])

  const filtered = useMemo(() => {
    const result = localFragrances.filter(f => {
      // Feel filter
      if (feel) {
        const families  = FEEL_FAMILIES[feel] ?? []
        const projs     = FEEL_PROJECTIONS[feel] ?? []
        const matchFam  = families.length  > 0 && families.some(fam => f.family.toLowerCase().includes(fam.toLowerCase()))
        const matchProj = projs.length     > 0 && projs.some(p => f.projection.toLowerCase().includes(p.toLowerCase()))
        if (!matchFam && !matchProj) return false
      }

      // Longevity filter
      if (longevity) {
        const projs = LONGEVITY_PROJECTIONS[longevity] ?? []
        if (!projs.some(p => f.projection.toLowerCase().includes(p.toLowerCase()))) return false
      }

      // Brand filter
      if (brand) {
        if (brand === 'Other') {
          if (KNOWN_BRANDS.some(kb => f.brand.toLowerCase().includes(kb.toLowerCase()))) return false
        } else {
          if (!f.brand.toLowerCase().includes(brand.toLowerCase())) return false
        }
      }

      // Wishlist filter
      if (wishlistFilter && !wishlist.has(f.id)) return false

      // Search filter — AND with chips
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const match = (
          f.brand.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          (f.inspired_by?.toLowerCase().includes(q) ?? false) ||
          (f.plain_description?.toLowerCase().includes(q) ?? false)
        )
        if (!match) return false
      }

      return true
    })

    // Sorting
    return result.sort((a, b) => {
      if (sort === 'A–Z') {
        return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
      }
      if (sort === 'Top Rated') {
        if (a.rating === b.rating) return a.brand.localeCompare(b.brand)
        if (a.rating === null) return 1
        if (b.rating === null) return -1
        return b.rating - a.rating
      }
      if (sort === 'Newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sort === 'Most Popular') {
        const popA = popularityMap[a.full_name.toLowerCase()] || 0
        const popB = popularityMap[b.full_name.toLowerCase()] || 0
        if (popA === popB) return a.brand.localeCompare(b.brand)
        return popB - popA
      }
      return 0
    })
  }, [localFragrances, feel, longevity, brand, debouncedSearch, sort, popularityMap, wishlist, wishlistFilter])

  function toggleFeel(v: string) {
    setVibeActive(false)
    setFeel(f => f === v ? null : v)
  }
  function toggleLongevity(v: string) { setLongevity(l => l === v ? null : v) }
  function toggleBrand(v: string)     { setBrand(b => b === v ? null : v) }

  function clearVibe() {
    localStorage.removeItem('scentral_vibe')
    setFeel(null)
    setVibeActive(false)
  }

  async function loadMore() {
    setLoadingMore(true)
    const supabase = createClient()
    const offset = localFragrances.length
    const { data } = await supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at')
      .order('brand', { ascending: true })
      .range(offset, offset + 39)
    if (data && data.length > 0) {
      const batch: DiscoverFragrance[] = data.map(f => ({
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
      }))
      setLocalFragrances(prev => [...prev, ...batch])
      setHasMoreLocal(offset + data.length < totalCount)
    } else {
      setHasMoreLocal(false)
    }
    setLoadingMore(false)
  }

  const anyFilter = feel !== null || longevity !== null || brand !== null || wishlistFilter
  const anySearch = debouncedSearch.length > 0

  const countLabel = (() => {
    if (!anyFilter && !anySearch) {
      if (localFragrances.length < totalCount) return `Showing ${localFragrances.length} of ${totalCount}`
      return `${totalCount} fragrances`
    }
    if (anySearch && anyFilter)   return `${filtered.length} results`
    if (anySearch)                return `${filtered.length} results for "${debouncedSearch}"`
    return `${filtered.length} of ${localFragrances.length}`
  })()

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState headline="Couldn't load fragrances" caption={error} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: 96 }}>

      {/* placeholder colour — can't be set via inline styles */}
      <style>{`
        .discover-search::placeholder { color: var(--text-muted); }
      `}</style>

      {/* Header */}
      <div style={{ padding: '28px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
          Discover
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Find your next scent
        </p>
      </div>

      {/* Search bar */}
      <div style={{ padding: '16px 16px 0', position: 'relative' }}>
        <input
          type="text"
          className="discover-search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search by name or designer..."
          style={{
            width: '100%',
            minHeight: 44,
            background: 'var(--surface)',
            border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--line)'}`,
            borderRadius: 'var(--r-btn)',
            padding: '0 40px 0 14px',
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
            boxShadow: searchFocused ? '0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setDebouncedSearch('') }}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 28,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ padding: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Vibe dismissal pill */}
        {vibeActive && (
          <div style={{ paddingLeft: 16 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--text-muted)',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '4px 12px',
            }}>
              Showing results for your vibe
              <span
                role="button"
                tabIndex={0}
                onClick={clearVibe}
                onKeyDown={e => e.key === 'Enter' && clearVibe()}
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
              >
                · Clear
              </span>
            </span>
          </div>
        )}

        {/* Feel */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
            Feel
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
            {Object.keys(FEEL_FAMILIES).map(v => (
              <Chip key={v} selected={feel === v} onClick={() => toggleFeel(v)} style={{ flexShrink: 0 }}>
                {v}
              </Chip>
            ))}
          </div>
        </div>

        {/* Longevity */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
            Longevity
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
            {Object.keys(LONGEVITY_PROJECTIONS).map(v => (
              <Chip key={v} selected={longevity === v} onClick={() => toggleLongevity(v)} style={{ flexShrink: 0 }}>
                {v}
              </Chip>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
            Brand
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
            {[...KNOWN_BRANDS, 'Other'].map(v => (
              <Chip key={v} selected={brand === v} onClick={() => toggleBrand(v)} style={{ flexShrink: 0 }}>
                {v}
              </Chip>
            ))}
            <Chip selected={wishlistFilter} onClick={() => setWishlistFilter(w => !w)} style={{ flexShrink: 0 }}>
              ❤ Wishlist
            </Chip>
          </div>
        </div>

        {/* Sort */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
            Sort
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
            {SORT_OPTIONS.map(v => (
              <Chip key={v} selected={sort === v} onClick={() => setSort(v)} style={{ flexShrink: 0 }}>
                {v}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <div style={{ padding: '16px 16px 8px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {countLabel}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="Nothing matching"
            caption="Try a different feel or clear a filter"
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
          }}
        >
          {filtered.map(f => (
            <Link
              key={f.id}
              href={`/collection/${f.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-card)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'border-color var(--motion-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
              >
                {/* Image with wishlist heart */}
                <div style={{ position: 'relative' }}>
                  <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(f.id) }}
                    aria-label={wishlist.has(f.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'color-mix(in srgb, var(--bg) 75%, transparent)',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 18,
                      color: wishlist.has(f.id) ? 'var(--accent)' : 'var(--text-muted)',
                      lineHeight: 1,
                    }}
                  >
                    {wishlist.has(f.id) ? '♥' : '♡'}
                  </button>
                </div>

                {/* Brand */}
                <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                  {f.brand}
                </p>

                {/* Name */}
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', lineHeight: '18px' }}>
                  {f.name}
                </p>

                {/* Plain description */}
                {f.plain_description && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '16px' }}>
                    {f.plain_description}
                  </p>
                )}

                {/* Inspired-by badge */}
                {f.inspired_by && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 600,
                    color: 'var(--accent)',
                    background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    borderRadius: 999, padding: '3px 8px',
                    alignSelf: 'flex-start',
                  }}>
                    Smells like {f.inspired_by}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMoreLocal && !anyFilter && !anySearch && (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <button
            onClick={loadMore}
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
        </div>
      )}
    </div>
  )
}
