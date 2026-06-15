'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { type CollectionFragrance } from './CollectionClient'
import BottleCard from './BottleCard'

interface ShelfTierProps {
  tierId: string
  label: string
  sublabel: string
  items: CollectionFragrance[]
  locked: boolean
  activeId: string | null
}

const TIER_ACCENT: Record<string, string> = {
  tier0: 'rgba(196,154,60,0.5)',
  tier1: 'rgba(196,154,60,0.3)',
  tier2: 'rgba(110,31,46,0.5)',
  tier3: 'rgba(255,255,255,0.1)',
}

const TIER_GLOW: Record<string, string> = {
  tier0: 'rgba(196,154,60,0.12)',
  tier1: 'rgba(196,154,60,0.06)',
  tier2: 'rgba(110,31,46,0.08)',
  tier3: 'transparent',
}

export default function ShelfTier({ tierId, label, sublabel, items, locked, activeId }: ShelfTierProps) {
  const { setNodeRef, isOver } = useDroppable({ id: tierId })

  const accent = TIER_ACCENT[tierId] ?? 'rgba(255,255,255,0.2)'
  const glow = TIER_GLOW[tierId] ?? 'transparent'

  return (
    <div style={{ position: 'relative' }}>
      {/* Tier label */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, paddingLeft: 4 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          color: 'rgba(248,247,245,0.9)',
          letterSpacing: '0.02em',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {sublabel}
        </span>
        <span style={{
          fontSize: 10,
          color: 'rgba(196,154,60,0.6)',
          marginLeft: 'auto',
          fontWeight: 600,
        }}>
          {items.length}
        </span>
      </div>

      {/* Shelf body */}
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(180deg, ${glow} 0%, rgba(0,0,0,0.25) 100%)`,
          borderTop: `2px solid ${accent}`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
          borderRadius: 2,
          padding: '10px 10px 14px',
          transition: 'background var(--motion-fast) var(--ease)',
          outline: isOver && !locked ? `1px solid rgba(196,154,60,0.4)` : 'none',
        }}
      >
        {/* Warm down-lighting strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 20,
            background: 'linear-gradient(180deg, rgba(255,200,80,0.08) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* 3D front lip shadow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%)',
            borderRadius: '0 0 2px 2px',
            pointerEvents: 'none',
          }}
        />

        <SortableContext items={items.map(f => f.id)} strategy={horizontalListSortingStrategy}>
          <div
            ref={setNodeRef}
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              minHeight: 96,
              alignItems: 'flex-end',
            }}
          >
            {items.length === 0 ? (
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 80,
                border: '1px dashed rgba(255,255,255,0.12)',
                borderRadius: 4,
                color: 'rgba(255,255,255,0.2)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {locked ? 'New bottles appear here' : 'Drag bottles here'}
              </div>
            ) : (
              items.map(f => (
                <BottleCard
                  key={f.id}
                  fragrance={f}
                  locked={locked}
                  isActive={activeId === f.id}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
