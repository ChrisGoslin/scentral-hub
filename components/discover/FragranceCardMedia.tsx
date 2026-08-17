'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { getFamilyGradient } from '@/lib/familyGradients'
import { getSafeFragranceImageUrl } from '@/lib/fragranceImageUrl'
import { getRarityBadge } from '@/lib/rarity'
import { GradientPlaceholder } from '@/components/ui/GradientPlaceholder'

type Props = {
  imageUrl: string | null
  brand: string
  name: string
  family: string
  rating?: number | null
  ownerCount?: number | null
  compact?: boolean
  priority?: boolean
  /** Borderless glass square for the Collector's Wall grid: full-bleed image,
   * no permanent ombre/caption — brand+name reveal on hover instead. */
  wall?: boolean
}

export function FragranceCardMedia({ imageUrl, brand, name, family, rating, ownerCount, compact = false, priority = false, wall = false }: Props) {
  const rarity = getRarityBadge(ownerCount)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [imgError, setImgError] = useState(false)
  const opacity = pressed ? 0.9 : hovered ? 0.8 : 1
  const safeImageUrl = useMemo(() => getSafeFragranceImageUrl(imageUrl), [imageUrl])
  const showImage = Boolean(safeImageUrl) && !imgError

  if (wall) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group"
        style={{
          width: '100%',
          aspectRatio: '1/1',
          minHeight: 220,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--r-card)',
          backgroundImage: showImage ? undefined : getFamilyGradient(family),
          border: '1px solid color-mix(in srgb, var(--line) 70%, transparent)',
          boxShadow: '0 18px 32px rgba(0,0,0,0.22)',
          transition: 'transform var(--motion-responsive, 200ms cubic-bezier(0.16, 1, 0.3, 1))',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {showImage ? (
          <Image
            src={safeImageUrl as string}
            alt={`${brand} ${name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'contain', padding: 8 }}
            onError={() => setImgError(true)}
            priority={priority}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px 10px',
            }}
          >
            {/* Rarity badge — top-left (only when rare) */}
            {rarity.level !== 'none' && rarity.level !== 'popular' ? (
              <p style={{
                fontSize: 8,
                color: rarity.level === 'cult' ? 'rgba(224,181,108,0.82)' : 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: 0,
                fontWeight: 700,
              }}>
                {rarity.label}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {brand}
              </p>
            )}

            {/* Score line + fragrance name — vertically centred lower third */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {/* The blotter mark — gold gradient matches portrait card score line */}
              <div style={{ height: 1, background: 'linear-gradient(to right, var(--accent), transparent)', opacity: 0.6 }} />
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  color: '#fff',
                  lineHeight: '1.2',
                  margin: 0,
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {name}
              </p>
              {/* Family chip + rating row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-ui)',
                    color: 'rgba(245,238,230,0.56)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {family}
                </span>
                {rating != null && (
                  <span style={{ fontSize: 8, color: 'var(--accent)', fontWeight: 600 }}>
                    {'✦'.repeat(Math.round(rating / 2))}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '6px 8px',
            background: 'linear-gradient(to top, rgba(4,3,5,0.82) 0%, transparent 100%)',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 150ms ease-out',
          }}
        >
          <p
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.82)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            {brand}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              color: '#fff',
              lineHeight: '13px',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        width: '100%',
        aspectRatio: '3/4',
        position: 'relative',
        opacity,
        transition: 'opacity 150ms ease-out',
        borderRadius: 'var(--r-card)',
        overflow: 'hidden',
        border: '1px solid color-mix(in srgb, var(--line) 70%, transparent)',
        boxShadow: '0 18px 32px rgba(0,0,0,0.22)',
      }}
    >
      {showImage ? (
        <>
          <Image
            src={safeImageUrl as string}
            alt={`${brand} ${name}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
            onError={() => setImgError(true)}
            priority={priority}
          />
          {/* Ombre overlay for text readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.16) 45%, transparent 70%)',
            }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: compact ? 8 : 10 }}>
            <p
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.82)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {brand}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? 12 : 14,
                color: '#fff',
                lineHeight: compact ? '15px' : '18px',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {name}
            </p>
          </div>
        </>
      ) : (
        <GradientPlaceholder brand={brand} name={name} family={family} compact={compact} />
      )}
    </div>
  )
}
