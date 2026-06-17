'use client'

import React, { useState, useEffect } from 'react'
import { FRAGRANCE_FUN_FACTS } from '@/lib/fragrance-education'

export default function DidYouKnow({ family }: { family: string }) {
  const [fact, setFact] = useState<string | null>(null)
  
  useEffect(() => {
    const category = Object.keys(FRAGRANCE_FUN_FACTS).find(c => 
      family.toLowerCase().includes(c.toLowerCase())
    ) || 'Fresh'
    const facts = FRAGRANCE_FUN_FACTS[category]
    setFact(facts[Math.floor(Math.random() * facts.length)])
  }, [family])

  if (!fact) return null

  return (
    <div style={{
      marginTop: 24, padding: '14px 16px',
      background: 'var(--surface-subtle)',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--line)'
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
        Did you know?
      </p>
      <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 6, lineHeight: '18px', fontStyle: 'italic' }}>
        {fact}
      </p>
    </div>
  )
}
