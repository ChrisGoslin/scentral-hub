'use client'

import React, { useRef, useCallback } from 'react'
import BuyLinks from '@/app/components/BuyLinks'

interface CollectionShelfModalProps {
  isOpen: boolean
  onClose: () => void
  fragranceName: string
  brand: string
}

export default function CollectionShelfModal({
  isOpen,
  onClose,
  fragranceName,
  brand,
}: CollectionShelfModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }, [onClose])

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onClose()
  }, [onClose])

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(20, 15, 10, 0.3)',
      }}
    >
      <div
        onClick={handleModalClick}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>
              Find this fragrance
            </p>
            <p style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              {brand} {fragranceName}
            </p>
          </div>
          <button
            onClick={handleCloseClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <BuyLinks fragranceName={fragranceName} brand={brand} />
      </div>
    </div>
  )
}
