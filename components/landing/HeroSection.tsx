import Link from 'next/link'

export default function HeroSection() {
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
        background:
          'radial-gradient(circle at 50% 20%, rgba(6,182,212,0.10) 0%, transparent 55%), var(--bg)',
      }}
    >
      <div style={{ width: 40, height: 1, background: 'var(--accent)', marginBottom: 24 }} />

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          margin: '0 0 20px',
          maxWidth: 700,
        }}
      >
        Your Scent Fingerprint
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
          color: 'var(--text-muted)',
          maxWidth: 460,
          lineHeight: 1.6,
          margin: '0 0 40px',
          fontWeight: 400,
        }}
      >
        Discover fragrances that match your unique sensory identity — built from
        how you actually wear, layer and collect scent.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        <Link
          href="/onboarding"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 48,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0 28px',
            borderRadius: 'var(--r-btn)',
            textDecoration: 'none',
          }}
        >
          Find Your Identity →
        </Link>

        <Link
          href="/discover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 48,
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0 28px',
            borderRadius: 'var(--r-btn)',
            border: '1px solid var(--line)',
            textDecoration: 'none',
          }}
        >
          Explore Collection →
        </Link>
      </div>
    </section>
  )
}
