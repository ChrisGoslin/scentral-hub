'use client'

import { useEffect, useRef, useState } from 'react'

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'

type Props = {
  slot: string
  format?: AdFormat
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * AdSlot — Google AdSense display unit.
 * Only renders when NEXT_PUBLIC_ADSENSE_CLIENT_ID is set.
 * Safe to drop anywhere — silently renders nothing in dev/beta without the env var.
 */
export default function AdSlot({ slot, format = 'auto', className, style }: Props) {
  const adRef = useRef<HTMLModElement>(null)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    if (!clientId || !adRef.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      // Mark as loaded after push attempt (ads may load asynchronously)
      setTimeout(() => setAdLoaded(true), 100)
    } catch {
      // AdSense already initialised or blocked — safe to ignore
    }
  }, [clientId])

  if (!clientId) return null

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        textAlign: 'center',
        ...style,
      }}
      aria-label="Advertisement"
    >
      {!adLoaded && (
        <div
          style={{
            minHeight: 100,
            background: 'var(--surface)',
            borderRadius: 'var(--r-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--line)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            Supported by our partners
          </p>
        </div>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
