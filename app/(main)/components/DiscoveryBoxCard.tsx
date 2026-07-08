'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { buildPersonalNote } from '@/lib/personalization'

export default function DiscoveryBoxCard() {
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [personaName, setPersonaName] = useState<string | null>(null)

  useEffect(() => {
    setPersonaId(localStorage.getItem('scentral_persona'))
    setPersonaName(localStorage.getItem('scentral_persona_name'))
  }, [])

  const note = useMemo(() => buildPersonalNote({
    personaId,
    personaName,
  }), [personaId, personaName])

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: '24px',
        marginBottom: 24,
        boxShadow: '0 18px 32px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 80% 10%, rgba(224,181,108,0.08) 0, transparent 22%), radial-gradient(circle at 10% 100%, rgba(255,255,255,0.05) 0, transparent 28%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 12px 0',
            fontFamily: 'var(--font-hand)',
          }}
        >
          Discovery box, but with your note on it
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 20,
            color: 'var(--text)',
            margin: '0 0 6px 0',
          }}
        >
          {note.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: '18px' }}>
          {note.note}
        </p>
        <div
          style={{
            borderLeft: '2px solid var(--accent)',
            paddingLeft: 12,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: '18px', fontFamily: 'var(--font-hand)' }}>
            {note.annotation}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['sketched', 'curated', 'taped in the margin'].map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '4px 8px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <Link href="/waitlist" style={{ textDecoration: 'none' }}>
          <button
            style={{
              width: '100%',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 999,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.opacity = '1'
            }}
          >
            Join waitlist →
          </button>
        </Link>
      </div>
    </div>
  )
}
