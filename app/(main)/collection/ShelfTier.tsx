'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { type CollectionFragrance } from './CollectionClient'
import OptimizedBottleCard from '@/components/collection/OptimizedBottleCard'
import { getTierColor, type TierKey } from '@/lib/affinity'

interface ShelfTierProps {
  tierId: TierKey
  label: string
  sublabel: string
  items: CollectionFragrance[]
  locked: boolean
  activeId: string | null
  isMobile?: boolean
}

export default function ShelfTier({ tierId, label, sublabel, items, locked, activeId, isMobile = false }: ShelfTierProps) {
  const { setNodeRef, isOver } = useDroppable({ id: tierId })

  const { accent, glow } = getTierColor(tierId)

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
          background: isOver && !locked
            ? 'linear-gradient(180deg, rgba(196,154,60,0.3) 0%, rgba(139,90,43,0.35) 40%, rgba(101,64,28,0.45) 100%)'
            : 'linear-gradient(180deg, rgba(139,90,43,0.15) 0%, rgba(101,64,28,0.25) 40%, rgba(80,50,20,0.35) 100%)',
          borderBottom: isOver && !locked ? '3px solid rgba(196,154,60,0.6)' : '3px solid rgba(60,35,10,0.4)',
          boxShadow: isOver && !locked
            ? '0 4px 12px rgba(196,154,60,0.25), inset 0 1px 0 rgba(255,200,120,0.25)'
            : '0 4px 12px rgba(40,20,5,0.2), inset 0 1px 0 rgba(255,200,120,0.15)',
          borderRadius: 2,
          minHeight: 140,
          padding: '16px 12px 8px',
          transition: 'background var(--motion-responsive), border-color var(--motion-responsive), box-shadow var(--motion-responsive)',
          outline: isOver && !locked ? '2px solid rgba(196,154,60,0.5)' : 'none',
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

        <SortableContext items={items.map(f => f.id)} strategy={rectSortingStrategy}>
          <div
            ref={setNodeRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 10,
              minHeight: 110,
              paddingBottom: 4,
            }}
          >
            {items.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
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
                <OptimizedBottleCard
                  key={f.id}
                  fragrance={f}
                  locked={locked}
                  isActive={activeId === f.id}
                  isMobile={isMobile}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
      <div style={{ height:8, background:'linear-gradient(180deg,rgba(30,15,5,0.2),transparent)', marginBottom:24 }} />
    </div>
  )
}
