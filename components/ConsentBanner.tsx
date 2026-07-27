'use client'

import { useEffect, useState } from 'react'
import { getConsent, setConsent } from '@/lib/consent'

export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show banner if user hasn't made a choice yet
    const consent = getConsent()
    if (!consent) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const handleAccept = () => {
    setConsent({ analytics: true, errorTracking: true })
    setShow(false)
  }

  const handleReject = () => {
    setConsent({ analytics: false, errorTracking: false })
    setShow(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 400,
        background: 'var(--bg-secondary, #1a2439)',
        border: '1px solid var(--border, #2d3d5c)',
        borderRadius: 'var(--r-card, 12px)',
        padding: 16,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        fontSize: 14,
        lineHeight: 1.5,
        color: 'var(--text)',
      }}
    >
      <p style={{ margin: '0 0 12px 0' }}>
        We use analytics to understand how you use nota. No personal data is shared.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleReject}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--text-secondary, #7a8fa3)',
            color: 'var(--text)',
            borderRadius: 'var(--r-card, 12px)',
            cursor: 'pointer',
            fontSize: 'inherit',
            fontWeight: 500,
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--olive, #6B7250)',
            color: 'var(--ivory, #F7F4EE)',
            border: 'none',
            borderRadius: 'var(--r-card, 12px)',
            cursor: 'pointer',
            fontSize: 'inherit',
            fontWeight: 500,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
