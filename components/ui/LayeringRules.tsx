'use client'

import React, { useState, useMemo } from 'react'
import { LAYERING_DOS_AND_DONTS } from '@/lib/fragrance-education'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function LayeringRules() {
  const [expanded, setExpanded] = useState(false)

  const rules = useMemo(() => {
    const dos = LAYERING_DOS_AND_DONTS.filter(r => r.type === 'do')
    const donts = LAYERING_DOS_AND_DONTS.filter(r => r.type === 'dont')
    
    const shuffledDos = [...dos].sort(() => 0.5 - Math.random()).slice(0, 3)
    const shuffledDonts = [...donts].sort(() => 0.5 - Math.random()).slice(0, 3)
    
    return { shuffledDos, shuffledDonts }
  }, [expanded])

  return (
    <div style={{ marginTop: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', border: 'none', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Layering Rules
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div style={{ padding: '16px', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'grid', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#2A8264', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Do
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {rules.shuffledDos.map((r, i) => (
                <div key={i} style={{ paddingLeft: 10, borderLeft: '2px solid #2A8264' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: '18px', marginBottom: 4 }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '16px' }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Don&apos;t
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {rules.shuffledDonts.map((r, i) => (
                <div key={i} style={{ paddingLeft: 10, borderLeft: '2px solid #b45309' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: '18px', marginBottom: 4 }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '16px' }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
