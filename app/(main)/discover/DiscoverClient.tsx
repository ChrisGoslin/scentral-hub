'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Chip from '@/components/ui/Chip'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'

export type DiscoverFragrance = {
  id: string
  brand: string
  name: string
  image_url: string | null
  primary_vector: string | null
  plain_description: string | null
  inspired_by: string | null
  temperature: string | null
  dominant_accords: string[] | null
}

type FeelFilter = 'All' | 'Warm & Rich' | 'Fresh & Clean' | 'Bold & Lasting' | 'Light & Subtle'

const VIBE_TO_FEEL: Record<string, FeelFilter> = {
  'Warm & Cosy': 'Warm & Rich',
  'Fresh & Clean': 'Fresh & Clean',
  'Bold & Powerful': 'Bold & Lasting',
  'Soft & Close': 'Light & Subtle',
}

const FEEL_COLORS: Record<FeelFilter, string> = {
  'All': 'var(--text)',
  'Warm & Rich': '#C17450',
  'Fresh & Clean': '#4A9D83',
  'Bold & Lasting': '#8B3E3E',
  'Light & Subtle': '#A89FBB',
}

function FragranceImage({ imageUrl, brand, name }: { imageUrl: string | null; brand: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (!imageUrl || failed) {
    return (
      <div
        className="w-full aspect-square flex flex-col items-center justify-center rounded-[10px] p-2"
        style={{ background: 'var(--surface-2)' }}
      >
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', lineHeight: '12px' }}>
          {brand}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '14px', marginTop: 2 }}>
          {name.length > 20 ? name.slice(0, 18) + '…' : name}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full aspect-square rounded-[10px] overflow-hidden" style={{ background: 'var(--surface-2)' }}>
      <img
        src={imageUrl}
        alt={`${brand} ${name}`}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function FragranceCard({ f }: { f: DiscoverFragrance }) {
  const shortName = f.name.length > 24 ? f.name.slice(0, 22) + '…' : f.name

  return (
    <Card className="flex flex-col gap-2 transition-colors h-full group">
      <Link href={`/collection/${f.id}`} className="flex flex-col gap-2 flex-1">
        <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />
        <div className="flex-1">
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '14px' }}>
            {f.brand}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '18px', marginTop: 1 }} title={f.name}>
            {shortName}
          </p>
          {f.dominant_accords && f.dominant_accords.length > 0 && (
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, lineHeight: '13px' }}>
              {f.dominant_accords.slice(0, 2).join(', ')}
            </p>
          )}
        </div>
      </Link>
    </Card>
  )
}

interface DiscoverClientProps {
  fragrances: DiscoverFragrance[]
}

export default function DiscoverClient({ fragrances }: DiscoverClientProps) {
  const [feelFilter, setFeelFilter] = useState<FeelFilter>('All')
  const [search, setSearch] = useState('')
  const [personalizedVibe, setPersonalizedVibe] = useState<FeelFilter | null>(null)

  const feelFilters: FeelFilter[] = ['All', 'Warm & Rich', 'Fresh & Clean', 'Bold & Lasting', 'Light & Subtle']

  // Read vibe from localStorage on mount
  useEffect(() => {
    try {
      const storedVibe = localStorage.getItem('scentral_vibe')
      if (storedVibe && storedVibe in VIBE_TO_FEEL) {
        const mappedFeel = VIBE_TO_FEEL[storedVibe]
        setPersonalizedVibe(mappedFeel)
        setFeelFilter(mappedFeel)
      }
    } catch {
      // localStorage unavailable, silently ignore
    }
  }, [])

  // Apply filters: both feel and search must match
  const filtered = useMemo(() => {
    return fragrances.filter(f => {
      // Feel filter
      if (feelFilter !== 'All') {
        // Map feel back to fragrances — using primary_vector or temperature as proxy
        // For now, just accept all fragrances when a feel is selected
        // (In production, fragrances would have a feel column or we'd infer from vectors)
      }

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const brandMatch = f.brand.toLowerCase().includes(q)
        const nameMatch = f.name.toLowerCase().includes(q)
        const inspiredByMatch = f.inspired_by?.toLowerCase().includes(q) ?? false
        const descriptionMatch = f.plain_description?.toLowerCase().includes(q) ?? false

        if (!brandMatch && !nameMatch && !inspiredByMatch && !descriptionMatch) {
          return false
        }
      }

      return true
    })
  }, [fragrances, feelFilter, search])

  const clearVibe = () => {
    try {
      localStorage.removeItem('scentral_vibe')
    } catch {
      // localStorage unavailable
    }
    setPersonalizedVibe(null)
    setFeelFilter('All')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
          Discover
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {filtered.length} of {fragrances.length} essences
        </p>
      </div>

      {/* Search input */}
      <div className="px-4 pt-3 pb-2 relative">
        <div className="relative">
          <input
            type="search"
            placeholder="Search by name or designer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: 13,
              padding: '11px 12px 11px 12px',
              outline: 'none',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 18,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Personalized vibe pill */}
      {personalizedVibe && personalizedVibe !== 'All' && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${FEEL_COLORS[personalizedVibe]}`,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>
              Showing results for your vibe ·
            </span>
            <button
              onClick={clearVibe}
              style={{
                background: 'none',
                border: 'none',
                color: FEEL_COLORS[personalizedVibe],
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Feel filter chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--line)' }}>
        {feelFilters.map(f => (
          <Chip
            key={f}
            selected={feelFilter === f}
            onClick={() => {
              setFeelFilter(f)
              if (f === 'All') {
                clearVibe()
              }
            }}
            style={{ flexShrink: 0 }}
          >
            {f}
          </Chip>
        ))}
      </div>

      {/* Result count */}
      <div className="px-4 pt-3">
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 py-3">
        {filtered.length === 0 ? (
          <EmptyState
            headline="No matches"
            caption="Try adjusting your filters or search term."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(f => (
              <FragranceCard key={f.id} f={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
