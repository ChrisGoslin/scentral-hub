'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import PersonaTipTicker from '@/components/ui/PersonaTipTicker'
import Button from '@/components/ui/Button'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { createClient } from '@/utils/supabase/client'
import { getPersonaById } from '@/lib/personas'
import Fuse from 'fuse.js'
import { track } from '@/lib/posthog'
import ErrorInline from '@/components/ui/ErrorInline'

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
  owner_count: number
}

// ── Sort types ───────────────────────────────────────────────────────────────

type SortOption = 'A–Z' | 'Top Rated' | 'Newest' | 'Most Popular'
const SORT_OPTIONS: SortOption[] = ['A–Z', 'Top Rated', 'Newest', 'Most Popular']

// ── Filter maps ──────────────────────────────────────────────────────────────

const FEEL_FAMILIES: Record<string, string[]> = {
  'Light & Subtle': ['Floral', 'Chypre', 'Powdery', 'Musk', 'Fresh', 'Citrus', 'Green'],
  'Warm & Rich':    ['Amber', 'Oriental', 'Woody Oriental', 'Oud', 'Gourmand', 'Resinous'],
  'Fresh & Clean':  ['Citrus', 'Aquatic', 'Green', 'Fresh', 'Aromatic'],
  'Bold & Lasting': ['Leather', 'Tobacco', 'Smoky', 'Chypre', 'Woody'],
}
const FEEL_PROJECTIONS: Record<string, string[]> = {
  'Warm & Rich':    ['Strong', 'Moderate', 'Beast Mode'],
  'Fresh & Clean':  ['Weak', 'Moderate', 'Medium'],
  'Bold & Lasting': ['Beast Mode', 'Strong', 'Moderate'],
  'Light & Subtle': ['Weak', 'Medium', 'Moderate'],
}

const FEEL_AMBIENT: Record<string, { bgGlow: string; chipActive: string }> = {
  'Warm & Rich':    { bgGlow: 'rgba(160, 98, 42, 0.06)',   chipActive: '#A0622A' },
  'Fresh & Clean':  { bgGlow: 'rgba(42, 130, 100, 0.06)',  chipActive: '#2A8264' },
  'Bold & Lasting': { bgGlow: 'rgba(60, 40, 30, 0.08)',    chipActive: '#3C281E' },
  'Light & Subtle': { bgGlow: 'rgba(140, 110, 180, 0.05)', chipActive: '#8C6EB4' },
}

// Maps persona's preferred families to the closest FEEL chip key
function familyToFeel(families: string[]): string | null {
  const familySet = new Set(families)
  if (['Leather', 'Tobacco', 'Smoky', 'Resinous', 'Oud'].some(f => familySet.has(f))) return 'Bold & Lasting'
  if (['Amber', 'Oriental', 'Woody Oriental', 'Gourmand'].some(f => familySet.has(f))) return 'Warm & Rich'
  if (['Citrus', 'Aquatic', 'Green', 'Fresh Spicy', 'Floral', 'Fresh'].some(f => familySet.has(f))) return 'Fresh & Clean'
  return null
}

const LONGEVITY_PROJECTIONS: Record<string, string[]> = {
  'Lasts all day':  ['Beast Mode', 'Strong'],
  'A few hours':    ['Moderate', 'Medium'],
  'Quick burst':    ['Weak'],
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
          width: '100%', aspectRatio: '3/4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface)',
          borderRadius: 10,
          padding: 8,
          position: 'relative',
          border: '1px solid var(--line)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6v3H9zM6 6h12v15H6zM9 11h6M9 15h6" />
        </svg>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 10, background: 'var(--surface-2)', position: 'relative' }}>
      <Image
        src={imageUrl}
        alt={`${brand} ${name}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        style={{ objectFit: 'contain' }}
      />
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

export default function DiscoverClient({ fragrances, error, hasMore: initialHasMore, totalCount }: Props) {
  const [localFragrances, setLocalFragrances] = useState<DiscoverFragrance[]>(fragrances)
  const [hasMore, setHasMore]             = useState(initialHasMore)
  const [loadingMore, setLoadingMore]         = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming]         = useState(false)

  const [wishlist, setWishlist]   = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)

  const [feel, setFeel]           = useState<string | null>(null)
  const [longevity, setLongevity] = useState<string | null>(null)
  const [brand, setBrand]         = useState<string | null>(null)
  const [sort, setSort]           = useState<SortOption>('A–Z')
  const [vibeActive, setVibeActive] = useState(false)

  const [searchTerm, setSearchTerm]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [semanticResults, setSemanticResults] = useState<DiscoverFragrance[]>([])
  const [isSemanticSearching, setIsSemanticSearching] = useState(false)
  const [semanticError, setSemanticError] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState(false)

  // ── Ambient glow state (driven by active feel chip) ───────────────────────
  const [activeGlow, setActiveGlow] = useState<string>('transparent')

  // ── Persona theme state ───────────────────────────────────────────────────
  const [activePersona, setActivePersona] = useState<ReturnType<typeof getPersonaById> | null>(null)
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null)
  const [personaVisible, setPersonaVisible] = useState(false)
  const [showPersonaBanner, setShowPersonaBanner] = useState(true)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 400)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ── Persona mount effect: localStorage + URL param ────────────────────────
  useEffect(() => {
    // 1. Sort preference
    const storedSort = localStorage.getItem('scentral_discover_sort') as SortOption | null
    if (storedSort && SORT_OPTIONS.includes(storedSort)) {
      setSort(storedSort)
    }

    // 2. Persona processing
    // URL param takes precedence over localStorage
    const params = new URLSearchParams(window.location.search)
    const urlPersona = params.get('persona')
    const personaId = urlPersona ?? localStorage.getItem('scentral_persona')
    let defaultPersonaFeel = null

    if (personaId) {
      const persona = getPersonaById(personaId)
      if (persona) {
        setActivePersonaId(personaId)
        setActivePersona(persona)
        // Pre-apply persona's preferred families as the initial feel chip
        defaultPersonaFeel = familyToFeel(persona.discover_filters.families)
        setTimeout(() => setPersonaVisible(true), 80) // trigger fade-in after paint
      }
    }

    // 3. Feel preference (overrides persona default if it exists)
    const storedFeel = localStorage.getItem('scentral_discover_feel')
    const initialFeel = storedFeel !== null ? (storedFeel || null) : defaultPersonaFeel

    if (initialFeel) {
      setFeel(initialFeel)
      setActiveGlow(FEEL_AMBIENT[initialFeel]?.bgGlow ?? 'transparent')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Unified Hybrid Search: Local (Fuse.js) + Semantic (Vector)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  // Local fuzzy search
  const fuse = useMemo(
    () => new Fuse(localFragrances, {
      keys: [
        { name: 'name',              weight: 0.4 },
        { name: 'brand',             weight: 0.3 },
        { name: 'inspired_by',       weight: 0.2 },
        { name: 'plain_description', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    }),
    [localFragrances]
  )

  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return localFragrances
    return fuse.search(debouncedSearch).map(r => r.item)
  }, [debouncedSearch, fuse, localFragrances])

  // Semantic vector search (if debouncedSearch)
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length === 0) {
      setSemanticResults([])
      setSemanticError(null)
      return
    }

    setIsSemanticSearching(true)
    setSemanticError(null)
    const supabase = createClient()

    ;(async () => {
      try {
        // Call embedding API endpoint
        const embRes = await fetch('/api/fragrances?search=' + encodeURIComponent(debouncedSearch), {
          method: 'GET',
        })
        if (!embRes.ok) {
          console.error('Embedding failed', embRes.status)
          setSemanticError('Failed to search fragrances. Try again.')
          return
        }
        const { similar_fragrances: results } = await embRes.json()
        setSemanticResults(
          (results ?? [])
            .slice(0, 6)
            .map((r: any) => ({
              id: r.id,
              brand: r.brand,
              name: r.name,
              full_name: r.full_name,
              family: r.family,
              projection: r.projection,
              optimal_season: r.optimal_season,
              plain_description: r.plain_description,
              inspired_by: r.inspired_by,
              image_url: r.image_url,
              rating: r.rating,
              created_at: r.created_at,
            }))
        )
        setSemanticError(null)
      } catch (e) {
        console.error('Vector search error', e)
        setSemanticError('Connection error while searching. Please try again.')
      } finally {
        setIsSemanticSearching(false)
      }
    })()
  }, [debouncedSearch])

  // Wishlist sync
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scentral_wishlist')
      if (stored) setWishlist(JSON.parse(stored))
    } catch { /* ignore */ }
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

  // Filtering
  const anyFilter = !!(feel || longevity || brand)
  const anySearch = searchTerm.trim().length > 0

  const filtered = useMemo(() => {
    let results: DiscoverFragrance[] = searchResults

    // Hybrid with Semantic results
    if (debouncedSearch && semanticResults.length > 0) {
      const searchIds = new Set(results.map(f => f.id))
      const sements = semanticResults.filter(f => !searchIds.has(f.id))
      results = [...results, ...sements]
    }

    // Feel filter — OR logic with null safety
    if (feel) {
      const families = [feel]  // array of selected feel chips (single-select today)
      const projs    = [feel]  // same chip drives both family + projection lookup
      results = results.filter(f => {
        const matchFam  = families.length === 0 ||
          (f.family     && families.some(fam  => (FEEL_FAMILIES[fam]    || []).includes(f.family)))
        const matchProj = projs.length === 0 ||
          (f.projection && projs.some(proj    => (FEEL_PROJECTIONS[proj] || []).includes(f.projection)))
        
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
    if (!anyFilter && !anySearch) return base
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
    if (next) {
      track('feel_filter_applied', {
        feel: next,
      })
    }
  }
  const toggleLongevity = (l: string) => setLongevity(longevity === l ? null : l)
  const toggleBrand = (b: string) => setBrand(brand === b ? null : b)
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
        .select('id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at')
        .order('brand', { ascending: true })
        .range(offset, offset + 99)

      if (err) {
        setLoadMoreError('Failed to load more fragrances. Try again.')
        return
      }

      if (!data) return

      const ids = data.map(f => f.id)
      const { data: ownerCounts } = ids.length
        ? await supabase.rpc('fragrance_owner_counts', { fragrance_ids: ids })
        : { data: null }
      const ownerCountById = new Map<string, number>(
        (ownerCounts ?? []).map((row: { fragrance_id: string; owner_count: number }) => [row.fragrance_id, row.owner_count])
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
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load fragrances"
          caption={error}
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient feel-filter colour wash — sits behind all content */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: activeGlow,
          transition: 'background 0.5s ease',
        }}
      />
    <div style={{
      position: 'relative',
      zIndex: 1,
      minHeight: '100dvh',
      background: 'var(--bg)',
      backgroundImage: activePersona && personaVisible
        ? activePersona.ui_theme.bgGradient
        : undefined,
      transition: 'background-image 0.4s ease',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Discover Fragrances
          </p>
          <input
            type="text"
            placeholder="Search by brand or scent…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
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
        </div>

        {/* Feel */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
            Feel
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
            {Object.keys(FEEL_FAMILIES).map(v => {
              const isActive = feel === v
              return (
                <Chip 
                  key={v} 
                  selected={isActive} 
                  onClick={() => toggleFeel(v)} 
                  style={{
                    flexShrink: 0,
                    boxShadow: isActive
                      ? `0 0 0 1px ${FEEL_AMBIENT[v]?.chipActive ?? 'var(--accent)'}, 0 2px 12px ${FEEL_AMBIENT[v]?.bgGlow ?? 'transparent'}`
                      : 'none',
                    transition: 'box-shadow 0.3s ease, background 0.3s ease, color 0.15s',
                  }}
                >
                  {v}
                </Chip>
              )
            })}
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
            <Chip selected={showSaved} onClick={() => setShowSaved(s => !s)} style={{ flexShrink: 0 }}>
              ❤ Saved
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
              <Chip key={v} selected={sort === v} onClick={() => {
                setSort(v)
                localStorage.setItem('scentral_discover_sort', v)
              }} style={{ flexShrink: 0 }}>
                {v}
              </Chip>
            ))}
          </div>
        </div>
      </div>

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
          <ErrorInline
            message={semanticError}
            onRetry={() => setDebouncedSearch(searchTerm)}
            color="warning"
          />
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

      {/* ── New to me strip ─────────────────────────────────────────────────── */}
      {!anyFilter && !anySearch && (() => {
        const unseen = localFragrances.filter(f => !wishlist.includes(f.id)).slice(0, 12)
        if (unseen.length === 0) return null
        return (
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 10 }}>
              New to me
            </p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
              {unseen.map(f => (
                <Link
                  key={f.id}
                  href={`/collection/${f.id}?from=discover`}
                  style={{ textDecoration: 'none', flexShrink: 0, width: 120 }}
                >
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-card)',
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'border-color var(--motion-fast)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
                  >
                    <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {f.brand}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', lineHeight: '15px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {f.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ── Persona banner ──────────────────────────────────────────────── */}
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
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
              Curated for
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              color: activePersona.ui_theme.accentColor,
              fontStyle: 'italic',
            }}>
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
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No fragrances match right now"
            caption="Try adjusting your filters to find your next scent."
            action={
              <Button onClick={clearFilters} variant="secondary">
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
          }}
        >
          {filtered.map(f => (
            <Link
              key={f.id}
              href={`/collection/${f.id}?from=discover`}
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
                {/* Image + wishlist toggle */}
                <div style={{ position: 'relative' }}>
                  <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(f.id) }}
                    aria-label={wishlist.includes(f.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      padding: 0,
                      color: wishlist.includes(f.id) ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill={wishlist.includes(f.id) ? 'var(--accent)' : 'none'} stroke={wishlist.includes(f.id) ? 'var(--accent)' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
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

                {/* Owner count */}
                {f.owner_count > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -4 }}>
                    {f.owner_count} {f.owner_count === 1 ? 'person owns' : 'own'} this
                  </p>
                )}

                {/* Rating */}
                {f.rating !== null && (
                  <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: -2, letterSpacing: '0.1em' }}>
                    {'★'.repeat(Math.round(f.rating / 2)) + '☆'.repeat(5 - Math.round(f.rating / 2))}
                  </div>
                )}

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

                {/* Resonance Badge */}
                {debouncedSearch && semanticResults.some(sr => sr.id === f.id) && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 9, fontWeight: 700,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 4,
                  }}>
                    <div style={{ width: 4, height: 4, background: 'var(--accent)', borderRadius: '50%' }} />
                    Resonance Match
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more error */}
      {loadMoreError && (
        <div style={{ padding: '0 16px 16px' }}>
          <ErrorInline
            message={loadMoreError}
            onRetry={loadMore}
            color="warning"
          />
        </div>
      )}

      {/* Load more */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        {hasMore ? (
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
        ) : (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '16px 0' }}>
            All {localFragrances.length} fragrances loaded
          </p>
        )}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
    </div>
  )
}
