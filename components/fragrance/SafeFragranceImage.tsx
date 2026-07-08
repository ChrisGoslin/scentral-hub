'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { FragranceBottleIcon } from '@/components/FragranceBottleIcon'
import { GradientPlaceholder } from '@/components/ui/GradientPlaceholder'
import { getSafeFragranceImageUrl } from '@/lib/fragranceImageUrl'

type SafeFragranceImageProps = {
  imageUrl: string | null | undefined
  brand: string
  name: string
  family?: string | null
  sizes: string
  wrapperStyle: React.CSSProperties
  imageStyle?: React.CSSProperties
  fallback?: React.ReactNode
  priority?: boolean
  alt?: string
}

export function SafeFragranceImage({
  imageUrl,
  brand,
  name,
  family,
  sizes,
  wrapperStyle,
  imageStyle,
  fallback,
  priority = false,
  alt,
}: SafeFragranceImageProps) {
  const [failed, setFailed] = useState(false)
  const safeImageUrl = useMemo(() => getSafeFragranceImageUrl(imageUrl), [imageUrl])
  const showImage = Boolean(safeImageUrl) && !failed

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...wrapperStyle }}>
      {showImage ? (
        <Image
          src={safeImageUrl as string}
          alt={alt ?? `${brand} ${name}`}
          fill
          sizes={sizes}
          style={imageStyle ?? { objectFit: 'contain' }}
          onError={() => setFailed(true)}
          priority={priority}
        />
      ) : fallback ? (
        fallback
      ) : family ? (
        <GradientPlaceholder brand={brand} name={name} family={family} />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            color: 'var(--text-faint)',
          }}
        >
          <FragranceBottleIcon />
        </div>
      )}
    </div>
  )
}
