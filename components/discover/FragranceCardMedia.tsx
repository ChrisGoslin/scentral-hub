'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getFamilyGradient } from '@/lib/familyGradients'

type Props = {
  imageUrl: string | null
  brand: string
  name: string
  family: string
  compact?: boolean
}

export function FragranceCardMedia({ imageUrl, brand, name, family, compact = false }: Props) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const opacity = pressed ? 0.9 : hovered ? 0.8 : 1

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
        backgroundImage: imageUrl ? undefined : getFamilyGradient(family),
        opacity,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`${brand} ${name}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: 'cover' }}
        />
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
