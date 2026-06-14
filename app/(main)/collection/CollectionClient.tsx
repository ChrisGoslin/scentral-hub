'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'

export type CollectionFragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  projection: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  lean: string
  rating: number | null
  image_url: string | null
  optimal_season: string | null
  maturation?: string | null
  maceration_started_at?: string | null
  maceration_ready_at?: string | null
  is_user_created?: boolean | null
}

type PhaseFilter = 'All' | 'Anchor' | 'Modulator' | 'Top'
type SeasonFilter = 'All' | 'Summer' | 'All-Year' | 'Winter' | 'Spring'

const SEASON_DB_MAP: Record<SeasonFilter, string | null> = {
  All: null,
  Summer: 'High Heat',
  'All-Year': 'All-Year',
  Winter: 'Winter/Fall',
  Spring: 'Spring/Summer',
}

const PHASE_MAP: Record<number, string> = {
  1: 'Anchor',
  2: 'Modulator',
  3: 'Top',
}

const PHASE_DOT: Record<string, string> = {
  Anchor: 'var(--accent)',
  Modulator: 'var(--positive)',
  Top: 'var(--text-muted)',
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

function maturationStatus(f: CollectionFragrance): 'maturing' | 'macerated' | 'recommended' | null {
  const now = new Date()
  const readyAt = f.maceration_ready_at ? new Date(f.maceration_ready_at) : null
  const startedAt = f.maceration_started_at ? new Date(f.maceration_started_at) : null
  if (readyAt && readyAt > now) return 'maturing'
  if (readyAt && readyAt <= now) return 'macerated'
  if (startedAt) return 'macerated'
  if (f.maturation) return 'recommended'
  return null
}

function FragranceCard({ f }: { f: CollectionFragrance }) {
  const phaseLabel = PHASE_MAP[f.phase] ?? f.phase_label
  const dot = PHASE_DOT[phaseLabel]
  const shortName = f.name.length > 24 ? f.name.slice(0, 22) + '…' : f.name
  const mStatus = maturationStatus(f)

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
          <div className="flex items-center gap-1 mt-1">
            {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: '14px' }}>{phaseLabel}</p>
          </div>
          {mStatus === 'maturing' && (
            <p style={{ fontSize: 10, color: 'var(--accent)', marginTop: 3, lineHeight: '13px' }}>⏳ Maturing</p>
          )}
          {mStatus === 'macerated' && (
            <p style={{ fontSize: 10, color: 'var(--positive)', marginTop: 3, lineHeight: '13px' }}>Macerated ✓</p>
          )}
        </div>
        {f.anosmia_risk === 'High' && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sensory Caution</p>
          </div>
        )}
      </Link>

      {/* Secondary action — seeds the DNA Match flow with this essence preselected */}
      <Link
        href={`/dna-match?a=${f.id}`}
        className="flex items-center justify-center mt-1 min-h-[36px] rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{ border: '1px solid var(--line)', background: 'var(--surface-2)' }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--burgundy)' }}>
          Match this →
        </span>
      </Link>
    </Card>
  )
}

export default function CollectionClient({ fragrances }: { fragrances: CollectionFragrance[] }) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('All')
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('All')
  const [search, setSearch] = useState('')
  const [ownedOnly, setOwnedOnly] = useState(false)

  const phaseFilters: PhaseFilter[] = ['All', 'Anchor', 'Modulator', 'Top']
  const seasonFilters: SeasonFilter[] = ['All', 'Summer', 'All-Year', 'Winter', 'Spring']

  // Owned = has a rating (proxy until proper ownership flag is robust)
  const ownedFragrances = fragrances.filter(f => f.rating !== null)
  const displayFragrances = ownedOnly ? ownedFragrances : fragrances

  const filtered = displayFragrances.filter(f => {
    if (phaseFilter !== 'All' && PHASE_MAP[f.phase] !== phaseFilter) return false
    if (seasonFilter !== 'All' && f.optimal_season !== SEASON_DB_MAP[seasonFilter]) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (!f.brand.toLowerCase().includes(q) && !f.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
              My Bottles
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {filtered.length} of {fragrances.length} scents
            </p>
          </div>
          {/* Owned toggle */}
          <button
            onClick={() => setOwnedOnly(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
            style={{
              background: ownedOnly ? 'var(--accent)' : 'var(--surface)',
              border: '1px solid var(--line)',
              color: ownedOnly ? 'white' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            {ownedOnly ? '★ My Bottles' : '☆ All'}
          </button>
        </div>
      </div>

      {/* Search input */}
      <div className="px-4 pt-3 pb-2">
        <input
          type="search"
          placeholder="Search brand or name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-chip)',
            color: 'var(--text)',
            fontSize: 13,
            padding: '8px 12px',
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
        />
      </div>

      {/* Phase filter chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {phaseFilters.map(f => (
          <Chip
            key={f}
            selected={phaseFilter === f}
            onClick={() => setPhaseFilter(f)}
            dot={f !== 'All' ? PHASE_DOT[f] : undefined}
            style={{ flexShrink: 0 }}
          >
            {f}
          </Chip>
        ))}
      </div>

      {/* Season filter chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--line)' }}>
        {seasonFilters.map(s => (
          <Chip
            key={s}
            selected={seasonFilter === s}
            onClick={() => setSeasonFilter(s)}
            style={{ flexShrink: 0 }}
          >
            {s}
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
        {ownedOnly && ownedFragrances.length === 0 ? (
          <div className="max-w-[360px] mx-auto pt-12 flex flex-col items-center text-center animate-up">
            <div className="w-8 h-[2px] mb-6" style={{ background: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px', color: 'var(--text)' }}>
              Your collection starts here.
            </h2>
            <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 12 }}>
              Add your first bottle and Scentral will help you get more from it — layering combos, inspired-by alternatives, and what to reach for next.
            </p>
            <div className="mt-7 w-full">
              <Link href="/discover" className="block w-full">
                <Button fullWidth>Explore 280+ Scents</Button>
              </Link>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
              Already have bottles?{' '}
              <Link 
                href="/layering" 
                className="hover:underline transition-all" 
                style={{ color: 'var(--accent)' }}
              >
                Add one manually →
              </Link>
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            headline="No matches"
            caption="Try adjusting your filters or search term."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(f => (
              <FragranceCard key={f.id} f={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
