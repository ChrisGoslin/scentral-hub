'use client'

import React, { useState, useEffect } from 'react'
import { PERSONA_TIPS } from '@/lib/fragrance-education'

export default function PersonaTipTicker({ personaId }: { personaId: string | null }) {
  const [tip, setTip] = useState<string | null>(null)
  
  useEffect(() => {
    if (!personaId || !PERSONA_TIPS[personaId]) {
      setTip(null)
      return
    }
    const tips = PERSONA_TIPS[personaId]
    setTip(tips[Math.floor(Math.random() * tips.length)])
  }, [personaId])

  if (!tip) return null

  return (
    <div style={{ padding: '4px 16px 12px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '16px' }}>
        &quot;{tip}&quot;
      </p>
    </div>
  )
}
