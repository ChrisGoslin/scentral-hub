'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [animatedLines, setAnimatedLines] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const lines = [0, 1, 2]
    lines.forEach((lineIndex, idx) => {
      const timer = setTimeout(() => {
        setAnimatedLines(prev => ({ ...prev, [lineIndex]: true }))
      }, idx * 400)
      return () => clearTimeout(timer)
    })
  }, [])

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
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#F5F0E8',
            margin: 0,
            maxWidth: 900,
            opacity: animatedLines[0] ? 1 : 0,
            transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          You already have
        </h1>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#F5F0E8',
            margin: 0,
            maxWidth: 900,
            opacity: animatedLines[1] ? 1 : 0,
            transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          a scent identity.
        </h1>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#F5F0E8',
            margin: 0,
            maxWidth: 900,
            opacity: animatedLines[2] ? 1 : 0,
            transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          BaseNote finds it.
        </h1>
      </div>

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
        Begin →
      </Link>
    </section>
  )
}
