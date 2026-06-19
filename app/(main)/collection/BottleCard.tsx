'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { type CollectionFragrance } from './CollectionClient'
import WearLogModal from './WearLogModal'

interface BottleCardProps {
  fragrance: CollectionFragrance
  locked?: boolean
  isActive?: boolean
  isMobile?: boolean
}

const ORIGIN_BADGE: Record<
  NonNullable<CollectionFragrance['origin_code']>,
  { label: string; bg: string; color: string }
> = {
  B: { label: 'B', bg: 'rgba(196,154,60,0.25)',  color: 'rgba(220,180,80,0.95)'  }, // Bought — amber/gold
  D: { label: 'D', bg: 'rgba(40,160,140,0.22)',  color: 'rgba(80,200,180,0.95)'  }, // Decant — teal/muted
  T: { label: 'T', bg: 'rgba(140,140,140,0.20)', color: 'rgba(190,190,190,0.90)' }, // Tester — grey
  O: { label: 'O', bg: 'rgba(100,80,200,0.20)',  color: 'rgba(160,140,240,0.90)' }, // Ordered — blue/purple muted
  W: { label: 'W', bg: 'rgba(220,100,140,0.20)', color: 'rgba(240,160,180,0.90)' }, // Wishlist — soft rose
}

function BottleImage({ imageUrl, brand, name }: { imageUrl: string | null; brand: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (!imageUrl || failed) {
    return (
      <div
        style={{
          width: '52px',
          height: '88px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          borderRadius: 6,
          padding: 4,
          position: 'relative',
        }}
      >
        <span style={{ fontSize: 24 }}>{getBrandEmoji(brand)}</span>
        <p style={{
          fontSize: 7,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          marginTop: 2,
          lineHeight: '9px',
          maxWidth: '46px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {brand}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      width: '52px',
      height: '88px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Image
        src={imageUrl || '/placeholder-bottle.png'}
        alt={`${brand} ${name}`}
        fill
        sizes="52px"
        style={{
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          filter: 'drop-shadow(0 4px 8px rgba(30,15,5,0.3))',
        }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function BottleCard({ fragrance: f, locked = false, isActive = false, isMobile = false }: BottleCardProps) {
  const [hovered, setHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(locked ? {} : attributes)}
        {...(locked ? {} : listeners)}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '72px',
            position: 'relative',
            background: isActive
              ? 'rgba(196,154,60,0.15)'
              : hovered
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
            border: isActive
              ? '1px solid rgba(196,154,60,0.3)'
              : '1px solid transparent',
            borderRadius: 8,
            padding: '6px 4px 8px',
            transition: 'background var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease), box-shadow 0.2s ease',
            backdropFilter: locked ? 'blur(4px)' : 'none',
          }}
        >
          <BottleImage imageUrl={f.image_url} brand={f.brand} name={f.name} />

          {/* Shadow puddle below bottle */}
          <div style={{
            width: 40,
            height: 6,
            background: 'radial-gradient(ellipse, rgba(30,15,5,0.25) 0%, transparent 70%)',
            marginTop: -2,
            marginBottom: 4,
          }} />

          {/* Bottle name */}
          <div style={{
            fontSize: 10,
            textAlign: 'center',
            color: 'var(--text-muted)',
            maxWidth: 68,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {f.name}
          </div>

          {f.origin_code && ORIGIN_BADGE[f.origin_code] && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                background: ORIGIN_BADGE[f.origin_code].bg,
                color: ORIGIN_BADGE[f.origin_code].color,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 5px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.15)',
                lineHeight: 1.4,
                pointerEvents: 'none',
              }}
            >
              {ORIGIN_BADGE[f.origin_code].label}
            </div>
          )}

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

          {!locked && !isDragging && (hovered || isMobile) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsModalOpen(true);
              }}
              onPointerDown={(e) => {
                // Prevent drag initialization when clicking the button
                e.stopPropagation();
              }}
              style={{
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--surface, rgba(250, 247, 242, 1))',
                color: 'var(--text-muted)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent, var(--color-primary, rgba(160, 98, 42, 1)))';
                e.currentTarget.style.borderColor = 'var(--accent, var(--color-primary, rgba(160, 98, 42, 1)))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              Log Wear
            </button>
          )}
        </div>
      </div>
      <WearLogModal
        fragranceId={f.id}
        fragranceName={f.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
