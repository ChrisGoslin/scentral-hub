import Link from 'next/link'
import { Metadata } from 'next'
import HeroSection from '@/components/landing/HeroSection'
import PersonaTeasers from '@/components/landing/PersonaTeasers'

const TITLE = 'AnotherSense — Your Scent Fingerprint'
const DESCRIPTION =
  'Discover fragrances that match your unique sensory identity — guided by your personal scent profile.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <HeroSection />
      <PersonaTeasers />

      {/* ── Christopher Moment ── */}
      <section style={{ width: '100%', maxWidth: 960, padding: '0 24px 80px', boxSizing: 'border-box' }}>
        <div
          className="surface-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            borderRadius: 'var(--r-card)',
            padding: '32px 28px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 28 }}>
            <div
              aria-hidden="true"
              style={{
                flex: '0 0 auto',
                width: '100%',
                maxWidth: 220,
                height: 160,
                borderRadius: 'var(--r-card)',
                background:
                  'linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(15,23,42,0.6) 100%)',
                margin: '0 auto',
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                  color: 'var(--text)',
                  margin: '0 0 12px',
                  lineHeight: 1.25,
                }}
              >
                Your £140 bottle has an £18 clone.
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 20px' }}>
                We map designer and niche fragrances to their closest affordable
                alternatives — same DNA, a fraction of the price.
              </p>
              <Link
                href="/discover?query=clones"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 48,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--aura)',
                }}
              >
                Discover Clones →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          width: '100%',
          borderTop: '1px solid var(--line)',
          padding: '24px',
          textAlign: 'center',
          boxSizing: 'border-box',
          background: 'var(--bg)',
        }}
      >
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          AnotherSense · Your daily scent ritual
          <br /><br />
          <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</Link>
          {' · '}
          <Link href="/social" style={{ textDecoration: 'none', color: 'inherit' }}>Community</Link>
        </p>
      </footer>
    </div>
  )
}
