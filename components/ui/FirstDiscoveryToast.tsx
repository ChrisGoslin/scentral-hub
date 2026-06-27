'use client'

import { useEffect, useState } from 'react'

export function FirstDiscoveryToast({ fragranceId, ownerCount }: { fragranceId: string; ownerCount: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (ownerCount !== 0) return
    try {
      const col: string[] = JSON.parse(localStorage.getItem('scentral_collection') ?? '[]')
      if (!col.includes(fragranceId)) return
      const seen: string[] = JSON.parse(localStorage.getItem('scentral_first_discoveries') ?? '[]')
      if (seen.includes(fragranceId)) return
      seen.push(fragranceId)
      localStorage.setItem('scentral_first_discoveries', JSON.stringify(seen))
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    } catch {
      // localStorage unavailable — skip toast
    }
  }, [fragranceId, ownerCount])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--surface)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--r-card)',
        padding: '10px 18px',
        fontSize: 13,
        color: 'var(--accent)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        zIndex: 999,
        pointerEvents: 'none',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      ◆ You&apos;re the first. Only you own this.
    </div>
  )
}
