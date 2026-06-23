'use client'

import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!clientId || !adRef.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
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
