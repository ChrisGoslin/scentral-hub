import Link from 'next/link'
import { getPersonaById } from '@/lib/personas'

const FEATURED_PERSONA_IDS = [
  'velvet_intellectual',
  'solar_minimalist',
  'dark_alchemist',
  'ritual_keeper',
  'rebel_experimentalist',
  'comfort_seeker',
]

export default function PersonaTeasers() {
  const personas = FEATURED_PERSONA_IDS.map(getPersonaById).filter(Boolean) as NonNullable<
    ReturnType<typeof getPersonaById>
  >[]

  return (
    <section style={{ width: '100%', padding: '80px 24px', boxSizing: 'border-box', background: 'var(--bg)' }}>
      <p
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          textAlign: 'center',
          marginBottom: 48,
          margin: '0 0 48px',
        }}
      >
        6 identities. Which is yours?
      </p>

      <style>{`
        .persona-card {
          flex: 0 0 clamp(200px, 60vw, 280px);
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          border-radius: var(--r-card);
          padding: 32px 24px;
          text-decoration: none;
          min-height: clamp(260px, 40vw, 340px);
          transition: opacity var(--motion-responsive);
          opacity: 0.85;
          position: relative;
          overflow: hidden;
        }
        .persona-card:hover {
          opacity: 1;
        }
      `}</style>

      <div
        className="flex gap-4 overflow-x-auto sm:grid sm:overflow-visible"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 60vw, 280px), 1fr))',
          scrollSnapType: 'x mandatory',
          paddingBottom: 12,
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        {personas.map(persona => (
          <Link
            key={persona.id}
            href={`/onboarding?persona=${persona.id}`}
            className="persona-card"
            style={{
              backgroundImage: persona.ui_theme.bgGradient,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                fontWeight: 400,
                color: '#F5F0E8',
                margin: 0,
                lineHeight: 1.35,
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {persona.narrative.tagline}
            </p>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 40,
                background: 'var(--accent)',
                opacity: 0.6,
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
