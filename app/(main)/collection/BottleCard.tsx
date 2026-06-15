'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { type CollectionFragrance } from './CollectionClient'

interface BottleCardProps {
  fragrance: CollectionFragrance
  locked?: boolean
  isActive?: boolean
}

function BottleImage({ imageUrl, brand, name }: { imageUrl: string | null; brand: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (!imageUrl || failed) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          borderRadius: 6,
          padding: 4,
        }}
      >
        <span style={{ fontSize: 28 }}>{getBrandEmoji(brand)}</span>
        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginTop: 3, lineHeight: '11px' }}>
          {brand.length > 12 ? brand.slice(0, 11) + '…' : brand}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '13px', marginTop: 2 }}>
          {name.length > 18 ? name.slice(0, 16) + '…' : name}
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
      <img
        src={imageUrl}
        alt={`${brand} ${name}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function BottleCard({ fragrance: f, locked = false, isActive = false }: BottleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: f.id,
    disabled: locked,
    data: { fragranceId: f.id },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.2,0.6,0.2,1)',
    opacity: isDragging ? 0.4 : locked ? 0.6 : 1,
    cursor: locked ? 'default' : isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(locked ? {} : attributes)}
      {...(locked ? {} : listeners)}
    >
      <div
        style={{
          width: 80,
          padding: 6,
          borderRadius: 8,
          background: isActive
            ? 'rgba(196,154,60,0.22)'
            : 'rgba(255,255,255,0.06)',
          border: isActive
            ? '1px solid rgba(196,154,60,0.5)'
            : '1px solid rgba(255,255,255,0.1)',
          backdropFilter: locked ? 'blur(4px)' : 'none',
          position: 'relative',
          transition: 'background var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease)',
        }}
      >
        <BottleImage imageUrl={f.image_url} brand={f.brand} name={f.name} />

        {locked && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'rgba(110,31,46,0.85)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 7,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '2px 5px',
              borderRadius: 999,
              border: '1px solid rgba(196,154,60,0.3)',
            }}
          >
            Benching
          </div>
        )}
      </div>
    </div>
  )
}
