import Link from 'next/link'
import { getPersonaById } from '@/lib/personas'

const FEATURED_PERSONA_IDS = ['velvet_intellectual', 'solar_minimalist', 'dark_alchemist']

export default function PersonaTeasers() {
  const personas = FEATURED_PERSONA_IDS.map(getPersonaById).filter(Boolean) as NonNullable<
    ReturnType<typeof getPersonaById>
  >[]

  return (
    <section style={{ width: '100%', maxWidth: 960, padding: '64px 24px', boxSizing: 'border-box' }}>
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
        Which one are you?
      </h2>

      <div className="flex gap-4 overflow-x-auto sm:grid sm:overflow-visible" style={{ gridTemplateColumns: 'repeat(3, 1fr)', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
        {personas.map(persona => (
          <Link
            key={persona.id}
            href={`/onboarding?persona=${persona.id}`}
            className="hover:scale-105"
            style={{
              flex: '0 0 240px',
              width: 240,
              scrollSnapAlign: 'start',
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
              minHeight: 180,
              transition: 'transform var(--motion-responsive, 200ms), box-shadow var(--motion-responsive, 200ms)',
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
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
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
  )
}
