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
}

type PhaseFilter = 'All' | 'Anchor' | 'Modulator' | 'Top'

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

function FragranceCard({ f }: { f: CollectionFragrance }) {
  const phaseLabel = PHASE_MAP[f.phase] ?? f.phase_label
  const dot = PHASE_DOT[phaseLabel]
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
          <div className="flex items-center gap-1 mt-1">
            {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: '14px' }}>{phaseLabel}</p>
          </div>
        </div>
      </Link>
      
      <div className="mt-1 pt-2" style={{ borderTop: '1px solid var(--line-light)' }}>
        <Link href={`/dna-match?search=${encodeURIComponent(f.family)}`} className="inline-block">
          <p style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'underline' }}>
            See similar profiles
          </p>
        </Link>
      </div>

      {f.anosmia_risk === 'High' && (
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
          <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sensory Caution</p>
        </div>
      )}
    </Card>
  )
}

export default function CollectionClient({ fragrances }: { fragrances: CollectionFragrance[] }) {
  const [filter, setFilter] = useState<PhaseFilter>('All')

  const filtered = filter === 'All'
    ? fragrances
    : fragrances.filter(f => PHASE_MAP[f.phase] === filter)

  const filters: PhaseFilter[] = ['All', 'Anchor', 'Modulator', 'Top']
  const total = fragrances.length

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
          The Wardrobe
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {total} essences discovered
        </p>
      </div>

      {/* Phase filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--line)' }}>
        {filters.map(f => (
          <Chip
            key={f}
            selected={filter === f}
            onClick={() => setFilter(f)}
            dot={f !== 'All' ? PHASE_DOT[f] : undefined}
            style={{ flexShrink: 0 }}
          >
            {f}
          </Chip>
        ))}
      </div>

      {/* Grid */}
      <div className="px-4 py-5">
        {filtered.length === 0 ? (
          <EmptyState
            headline="Your wardrobe is empty"
            caption="The sanctuary is awaiting its first essence. Begin your collection to explore olfactory resonance."
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
