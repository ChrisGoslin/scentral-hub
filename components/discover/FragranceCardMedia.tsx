'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getFamilyGradient } from '@/lib/familyGradients'
import { FragranceBottleIcon } from '@/components/FragranceBottleIcon'

type Props = {
  imageUrl: string | null
  brand: string
  name: string
  family: string
  compact?: boolean
  /** Borderless glass square for the Collector's Wall grid: full-bleed image,
   * no permanent ombre/caption — brand+name reveal on hover instead. */
  wall?: boolean
}

export function FragranceCardMedia({ imageUrl, brand, name, family, compact = false, wall = false }: Props) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [imgError, setImgError] = useState(false)
  const opacity = pressed ? 0.9 : hovered ? 0.8 : 1
  const showImage = imageUrl && !imgError

  if (wall) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group"
        style={{
          width: '100%',
          aspectRatio: '1/1',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--r-card)',
          backgroundImage: showImage ? undefined : getFamilyGradient(family),
          transition: 'transform 200ms ease-out',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {showImage ? (
          <Image
            src={imageUrl}
            alt={`${brand} ${name}`}
            fill
            sizes="(max-width: 768px) 25vw, (max-width: 1280px) 16vw, 10vw"
            style={{ objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <FragranceBottleIcon />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '6px 8px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 150ms ease-out',
          }}
        >
          <p
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.85)',
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
        backgroundImage: showImage ? undefined : getFamilyGradient(family),
        opacity,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {showImage ? (
        <Image
          src={imageUrl}
          alt={`${brand} ${name}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          <FragranceBottleIcon />
        </div>
      )}
      {/* Ombre overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)',
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: compact ? 8 : 10 }}>
        <p
          style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.85)',
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
    </div>
  )
}
