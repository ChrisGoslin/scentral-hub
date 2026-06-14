'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'

export type DiscoverFragrance = {
  id: string
  brand: string
  name: string
  family: string
  projection: string
  optimal_season: string | null
  plain_description: string | null
  inspired_by: string | null
  image_url: string | null
}

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
          background: 'var(--surface-2)', borderRadius: 10,
          padding: 8, gap: 4,
        }}
      >
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
          {brand}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '14px' }}>
          {name.length > 18 ? name.slice(0, 16) + '…' : name}
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
}

export default function DiscoverClient({ fragrances, error }: Props) {
  const [feel, setFeel]           = useState<string | null>(null)
  const [longevity, setLongevity] = useState<string | null>(null)
  const [brand, setBrand]         = useState<string | null>(null)
  const [vibeActive, setVibeActive] = useState(false)

  const [searchTerm, setSearchTerm]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: read scentral_vibe from localStorage and pre-select feel
  useEffect(() => {
    const vibe = localStorage.getItem('scentral_vibe')
    if (vibe && VIBE_TO_FEEL[vibe]) {
      setFeel(VIBE_TO_FEEL[vibe])
      setVibeActive(true)
    }
  }, [])

  // Debounce search input 200ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchTerm])

  const filtered = useMemo(() => {
    return fragrances.filter(f => {
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
  }, [fragrances, feel, longevity, brand, debouncedSearch])

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

  const anyFilter = feel !== null || longevity !== null || brand !== null
  const anySearch = debouncedSearch.length > 0

  const countLabel = (() => {
    if (!anyFilter && !anySearch) return `${fragrances.length} fragrances`
    if (anySearch && anyFilter)   return `${filtered.length} results`
    if (anySearch)                return `${filtered.length} results for "${debouncedSearch}"`
    return `${filtered.length} of ${fragrances.length}`
  })()

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState headline="Couldn't load fragrances" caption={error} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: 96 }}>

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
                {/* Image */}
                <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />

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
    </div>
  )
}
