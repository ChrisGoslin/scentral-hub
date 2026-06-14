'use client'

import React, { useState, useMemo } from 'react'
import Chip from '@/components/ui/Chip'
import CollectionClient, { type CollectionFragrance } from './CollectionClient'

type PhaseFilter = 'All' | 'Anchor' | 'Modulator' | 'Top'
type SortOrder = 'az' | 'rating' | 'recent'

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

const SORT_LABELS: Record<SortOrder, string> = {
  az: 'A–Z',
  rating: 'Rating ↓',
  recent: 'Recently Added',
}

const PHASE_FILTERS: PhaseFilter[] = ['All', 'Anchor', 'Modulator', 'Top']
const SORT_ORDERS: SortOrder[] = ['az', 'rating', 'recent']

export default function CollectionFilters({ fragrances }: { fragrances: CollectionFragrance[] }) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('All')
  const [sortOrder, setSortOrder] = useState<SortOrder>('az')

  const processed = useMemo(() => {
    let result = phaseFilter === 'All'
      ? fragrances
      : fragrances.filter(f => PHASE_MAP[f.phase] === phaseFilter)

    if (sortOrder === 'az') {
      result = [...result].sort((a, b) =>
        a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
      )
    } else if (sortOrder === 'rating') {
      result = [...result].sort((a, b) => {
        if (a.rating === null && b.rating === null) return 0
        if (a.rating === null) return 1
        if (b.rating === null) return -1
        return b.rating - a.rating
      })
    } else {
      result = [...result].sort((a, b) => {
        const aDate = a.collection_added_at ? new Date(a.collection_added_at).getTime() : 0
        const bDate = b.collection_added_at ? new Date(b.collection_added_at).getTime() : 0
        return bDate - aDate
      })
    }

    return result
  }, [fragrances, phaseFilter, sortOrder])

  return (
    <>
      <div style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 overflow-x-auto">
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '28px', flexShrink: 0 }}>
            Phase
          </span>
          {PHASE_FILTERS.map(f => (
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
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '28px', flexShrink: 0 }}>
            Sort
          </span>
          {SORT_ORDERS.map(s => (
            <Chip
              key={s}
              selected={sortOrder === s}
              onClick={() => setSortOrder(s)}
              style={{ flexShrink: 0 }}
            >
              {SORT_LABELS[s]}
            </Chip>
          ))}
        </div>
      </div>
      <CollectionClient fragrances={processed} totalCount={fragrances.length} />
    </>
  )
}
