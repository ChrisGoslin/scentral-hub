import Link from 'next/link'
import { Metadata } from 'next'
import { PERSONAS } from '@/lib/personas'

const TITLE = 'Scentral — Your Scent Wardrobe'
const DESCRIPTION =
  'Discover, collect and understand the fragrances that define you — guided by your personal scent identity.'

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

const HOW_IT_WORKS = [
  {
    icon: '🧪',
    heading: 'Take the Sanctuary Profiler',
    body: '3 questions. Your scent persona revealed.',
  },
  {
    icon: '🗂',
    heading: 'Build your wardrobe',
    body: 'Rate, collect and organise every fragrance you own.',
  },
  {
    icon: '✨',
    heading: 'Discover inspired-by gems',
    body: '500+ affordable alternatives to designer and niche.',
  },
]

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
      {/* ── Hero ── */}
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
        }}
      >
        {/* Eyebrow rule */}
        <div
          style={{
            width: 40,
            height: 1,
            background: 'var(--accent)',
            marginBottom: 24,
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 7vw, 5rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            margin: '0 0 20px',
            maxWidth: 700,
          }}
        >
          Your scent wardrobe.
          <br />
          <span style={{ color: 'var(--text-muted)' }}>Finally organised.</span>
        </h1>

        <p
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            maxWidth: 280,
            lineHeight: 1.6,
            margin: '0 0 40px',
            fontWeight: 400,
          }}
        >
          Discover, collect and understand the fragrances that define you —
          guided by your personal scent identity.
        </p>

        <Link
          href="/onboarding"
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '14px 32px',
            borderRadius: 'var(--r-btn)',
            textDecoration: 'none',
            marginBottom: 16,
            transition: 'opacity 0.2s',
          }}
        >
          Find my scent identity →
        </Link>

        <Link
          href="/discover"
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--line)',
            paddingBottom: 2,
            transition: 'color 0.2s',
          }}
        >
          Browse the collection
        </Link>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          width: '100%',
          maxWidth: 960,
          padding: '64px 24px',
          boxSizing: 'border-box',
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          How it works
        </p>

        {/* 3-column on desktop, stacked on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}
        >
          {HOW_IT_WORKS.map(({ icon, heading, body }) => (
            <div
              key={heading}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-card)',
                padding: '28px 24px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  display: 'block',
                  marginBottom: 16,
                  lineHeight: 1,
                }}
                role="img"
                aria-hidden="true"
              >
                {icon}
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--text)',
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {heading}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Persona teasers ── */}
      <section
        style={{
          width: '100%',
          maxWidth: 960,
          padding: '0 24px 80px',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 400,
            textAlign: 'center',
            color: 'var(--text)',
            marginBottom: 32,
            letterSpacing: '-0.01em',
          }}
        >
          Which identity are you?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {PERSONAS.map((persona) => (
            <Link
              key={persona.id}
              href="/onboarding"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: persona.ui_theme.cardBg,
                backgroundImage: persona.ui_theme.bgGradient,
                border: '1px solid var(--line)',
                borderLeft: `3px solid ${persona.ui_theme.accentColor}`,
                borderRadius: 'var(--r-card)',
                padding: '28px 24px',
                textDecoration: 'none',
                minHeight: 160,
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    fontWeight: 400,
                    color: persona.ui_theme.accentColor,
                    marginBottom: 8,
                    lineHeight: 1.25,
                  }}
                >
                  {persona.name}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {persona.narrative.tagline}
                </p>
              </div>

              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: persona.ui_theme.accentColor,
                  marginTop: 20,
                  letterSpacing: '0.05em',
                }}
              >
                Explore →
              </p>
            </Link>
          ))}
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
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          Scentral · Made for fragrance obsessives
          <br /><br />
          <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</Link>
        </p>
      </footer>
    </div>
  )
}
