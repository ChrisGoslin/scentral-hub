import Link from 'next/link'
import { Metadata } from 'next'
import HeroSection from '@/components/landing/HeroSection'
import PersonaTeasers from '@/components/landing/PersonaTeasers'

const TITLE = 'BaseNote — Your Scent Fingerprint'
const DESCRIPTION =
  'Discover fragrances that match your unique sensory identity — guided by your personal scent profile.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/api/og'],
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
      {process.env.NEXT_PUBLIC_BETA_MODE === 'true' && (
        <span
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 50,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-gold)',
            borderRadius: 999,
            padding: '3px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          Beta — Free for early users
        </span>
      )}

      <HeroSection />
      <PersonaTeasers />

      {/* ── Inspired By Engine ── */}
      <section style={{ padding: '80px 24px', background: 'var(--color-bg, #1A1208)', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: 8 }}>
          The Inspired By Engine
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text)', textAlign: 'center', marginBottom: 12, margin: '0 0 12px' }}>
          Your £140 bottle has an inspired-by at £18.
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 48, fontSize: 15 }}>
          We find them. You decide.
        </p>
        <div style={{ display: 'flex', gap: 16, maxWidth: 480, margin: '0 auto', justifyContent: 'center' }}>
          {/* Designer card — woody gradient from family tokens */}
          <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, var(--family-woody-start), var(--family-woody-end))', textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, margin: 0 }}>Designer</p>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18, margin: '8px 0' }}>Baccarat Rouge 540</p>
            <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>£285</p>
          </div>
          {/* Inspired By card — oriental gradient from family tokens */}
          <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, var(--family-oriental-start), var(--family-oriental-end))', textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, margin: 0 }}>Inspired By</p>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18, margin: '8px 0' }}>DNA Match · 94%</p>
            <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>£19</p>
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
          BaseNote · Your daily scent ritual
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
