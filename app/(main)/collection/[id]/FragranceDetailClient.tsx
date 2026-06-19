'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import WearLogModal, { type WearLogModalProps } from '../WearLogModal'

interface NotesPyramidProps {
  pyramid: {
    top?: string[]
    heart?: string[]
    base?: string[]
  } | null
}

export function NotesPyramid({ pyramid }: NotesPyramidProps) {
  if (!pyramid || (!pyramid.top && !pyramid.heart && !pyramid.base)) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        Fragrance Notes
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pyramid.top && pyramid.top.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Top Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.top.join(', ')}
            </p>
          </div>
        )}

        {pyramid.heart && pyramid.heart.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Heart Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.heart.join(', ')}
            </p>
          </div>
        )}

        {pyramid.base && pyramid.base.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Base Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.base.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface WearLogButtonProps {
  fragranceId: string
  fragranceName: string
  brandName: string
  collectionId?: string
}

export function WearLogButton({ fragranceId, fragranceName, brandName, collectionId }: WearLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const displayName = `${brandName} ${fragranceName}`

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary">
        Log a Wear
      </Button>
      {collectionId && (
        <WearLogModal
          fragranceId={fragranceId}
          fragranceName={displayName}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
