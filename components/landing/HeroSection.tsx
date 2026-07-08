'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import StaticHeading from './StaticHeading'
import { buildPersonalNote } from '@/lib/personalization'

export default function HeroSection() {
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
    <section
      style={{
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#1A1208',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 24,
          maxWidth: 280,
          padding: '12px 14px',
          borderRadius: 16,
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          background: 'rgba(14, 10, 11, 0.72)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
          textAlign: 'left',
        }}
      >
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-hand)' }}>
          {personaName ? `Secret note for ${note.title}` : 'Secret note'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: '18px', margin: '6px 0 0', fontFamily: 'var(--font-hand)' }}>
          {note.annotation}
        </p>
      </div>

      <StaticHeading />

      <style>{`
        .hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          background: var(--accent);
          color: #1A1208;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0 40px;
          border-radius: 999px;
          text-decoration: none;
          transition: all var(--motion-responsive);
        }
        .hero-cta:hover {
          transform: scale(1.05);
        }
      `}</style>
      <Link href="/onboarding" className="hero-cta">
        Begin with your notes →
      </Link>
    </section>
  )
}
