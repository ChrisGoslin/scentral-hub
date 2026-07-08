'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import { getPersonaByInputs, type Persona } from '@/lib/personas'
import { buildPersonalNote } from '@/lib/personalization'
import { track } from '@/lib/posthog'
import PersonaRevealOverlay from './PersonaRevealOverlay'

interface NosePrintCardProps {
  persona: Persona
}

function NosePrintCard({ persona }: NosePrintCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1A1208',
        scale: 2,
        logging: false,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'my-noseprint.png'
      link.click()
      track('noseprint_card_downloaded', { persona_id: persona.id })
    } catch (err) {
      console.error('Failed to download card:', err)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://nota.app/onboarding')
    setCopied(true)
    track('noseprint_link_copied', { persona_id: persona.id })
    setTimeout(() => setCopied(false), 2000)
  }

  const topThreeTraits = [
    persona.scent_spectrum.top[0],
    persona.scent_spectrum.heart[0],
    persona.scent_spectrum.base[0],
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Card Preview */}
      <div
        ref={cardRef}
        style={{
          width: 320,
          aspectRatio: '1',
          background: 'var(--bg-card, #1A1208)',
          border: `2px solid ${persona.ui_theme.accentColor}40`,
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center',
          boxShadow: `0 0 32px ${persona.ui_theme.accentColor}20`,
          position: 'relative',
        }}
      >
        {/* nota. Logo/Wordmark */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: persona.ui_theme.accentColor,
          marginBottom: 8,
        }}>
          nota.
        </div>

        {/* Persona Name */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
            margin: 0,
          }}>
            {persona.name}
          </h2>

          {/* Top 3 Scent Traits */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {topThreeTraits.map((trait) => (
              <div key={trait} style={{
                fontSize: 11,
                color: persona.ui_theme.accentColor,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: 0.9,
              }}>
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div style={{
          fontSize: 9,
          color: persona.ui_theme.accentColor,
          opacity: 0.7,
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}>
          Find your Noseprint at nota.app
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: persona.ui_theme.accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Save Card
        </button>
        <button
          onClick={handleCopyLink}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: `${persona.ui_theme.accentColor}20`,
            color: persona.ui_theme.accentColor,
            border: `1px solid ${persona.ui_theme.accentColor}40`,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${persona.ui_theme.accentColor}30`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${persona.ui_theme.accentColor}20`
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

// ─── Sanctuary options ────────────────────────────────────────────────────────
const SANCTUARIES = [
  { id: 'archive',     name: 'The Lost Archive',       cue: 'Leather, dusty vanilla, mahogany',  icon: '📚' },
  { id: 'greenhouse',  name: 'The Sunlit Greenhouse',  cue: 'Green fig, neroli, wet earth',       icon: '🌿' },
  { id: 'observatory', name: 'The Observatory',        cue: 'Cold air, clean cedar, ozone',       icon: '🔭' },
  { id: 'alley',       name: 'The Midnight Alley',     cue: 'Smoke, oud, rain on stone',          icon: '🌑' },
  { id: 'dune',        name: 'The Desert Dune',        cue: 'Warm amber, dry wood, sunset',       icon: '🏜️' },
  { id: 'harbour',     name: 'The Harbour Dawn',       cue: 'Salt, citrus, cool linen',           icon: '⚓' },
  { id: 'temple',      name: 'The Sacred Temple',      cue: 'Incense, sandalwood, myrrh',         icon: '🕉️' },
  { id: 'studio',      name: 'The Creative Studio',    cue: 'Leather, ginger, unexpected spice',  icon: '🎨' },
  { id: 'home',        name: 'The Warm Home',          cue: 'Vanilla, almond, soft amber',        icon: '🏠' },
]

// ─── Projection options ───────────────────────────────────────────────────────
const PROJECTIONS = [
  { id: 'intimate',   name: 'Up Close',     description: 'A secret shared between you and whoever leans in.' },
  { id: 'room',       name: 'In The Room',  description: 'You\'re noticed without being announced.' },
  { id: 'everywhere', name: 'Everywhere',   description: 'You\'ve arrived before you walk in.' },
]

// ─── Context options (multi-select) ──────────────────────────────────────────
const CONTEXTS = [
  'Workday', 'Date Night', 'Morning Ritual', 'Weekend Wander',
  'Cosy Night In', 'Going Out', 'Travel', 'Occasion',
]

function SanctuaryGlyph({ id }: { id: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'archive':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 8.5h16" />
          <path d="M6 6.5h12" />
          <path d="M5 10.5h14" />
          <path d="M7 5v13" />
          <path d="M17 5v13" />
          <path d="M8 14h8" />
        </svg>
      )
    case 'greenhouse':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 20V8" />
          <path d="M12 12c-3 0-5-2.5-5-5 3 0 5 2 5 5Z" />
          <path d="M12 10c3 0 5-2 5-5-3 0-5 2-5 5Z" />
          <path d="M8 20h8" />
        </svg>
      )
    case 'observatory':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="6.5" />
          <path d="M12 3.5v3" />
          <path d="M12 17.5v3" />
          <path d="M3.5 12h3" />
          <path d="M17.5 12h3" />
          <path d="M12 9.5l1.6 2.5L16 13l-2.4 1-1.6 2.5-1.6-2.5L8 13l2.4-.5L12 9.5Z" />
        </svg>
      )
    case 'alley':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 15.5c2.6 0 4.8-2.2 4.8-4.8S10.6 6 8 6c0 4 0 5.4 0 9.5Z" />
          <path d="M12.5 7.5a4.2 4.2 0 1 1 0 8.4" />
          <path d="M7 18h10" />
        </svg>
      )
    case 'dune':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3.5 15.5c2.5-2.2 4.5-3.3 7-3.3s4.5 1.1 7 3.3" />
          <path d="M6 11.5c1.6-1.4 3-2.1 6-2.1s4.4.7 6 2.1" />
          <path d="M12 4.5v3" />
        </svg>
      )
    case 'harbour':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 3.5v17" />
          <path d="M8.5 8.5h7" />
          <path d="M9.5 12.5h5" />
          <path d="M7 20c1.3-1.8 2.8-2.7 5-2.7S15.7 18.2 17 20" />
          <path d="M12 3.5c-1.5 1.2-2.4 2.8-2.4 4.5 0 1.3.6 2.5 1.6 3.3" />
        </svg>
      )
    case 'temple':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 4v3" />
          <path d="M9 7h6" />
          <path d="M10 7c0 2.5-1.2 4-2.5 5.5" />
          <path d="M14 7c0 2.5 1.2 4 2.5 5.5" />
          <path d="M7 18h10" />
          <path d="M12 12.5v5.5" />
        </svg>
      )
    case 'studio':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M7 7.5h10v9h-10z" />
          <path d="M9 9.5l6 6" />
          <path d="M15 9.5l-6 6" />
          <path d="M12 4.5v3" />
        </svg>
      )
    case 'home':
    default:
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4.5 11.5 12 5l7.5 6.5" />
          <path d="M6.5 10.8V19h11V10.8" />
          <path d="M10 19v-4h4v4" />
        </svg>
      )
  }
}

type Step = 1 | 2 | 3 | 4  // 4 = reveal

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [visible, setVisible] = useState(true)
  const [sanctuary, setSanctuary] = useState<string | null>(null)
  const [projection, setProjection] = useState<string | null>(null)
  const [contexts, setContexts] = useState<string[]>([])
  const [persona, setPersona] = useState<Persona | null>(null)
  const [revealVisible, setRevealVisible] = useState(false)
  const [rememberedPersonaId, setRememberedPersonaId] = useState<string | null>(null)
  const [rememberedPersonaName, setRememberedPersonaName] = useState<string | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (localStorage.getItem('scentral_onboarded') === 'true') {
      router.replace('/discover')
    } else {
      track('onboarding_started')
    }
    setRememberedPersonaId(localStorage.getItem('scentral_persona'))
    setRememberedPersonaName(localStorage.getItem('scentral_persona_name'))
  }, [router])

  const transitionTo = (next: Step) => {
    if (prefersReducedMotion.current) { setStep(next); return }
    setVisible(false)
    setTimeout(() => { setStep(next); setVisible(true) }, 120)
  }

  const handleReveal = () => {
    const p = getPersonaByInputs(sanctuary!, projection!)
    setPersona(p)
    track('persona_revealed', { persona_id: p.id })
    setVisible(false)
    setTimeout(() => {
      setStep(4)
      setTimeout(() => setRevealVisible(true), 80)
    }, 120)
  }

  const handleFinish = () => {
    if (!persona) return
    localStorage.setItem('scentral_onboarded', 'true')
    localStorage.setItem('scentral_persona', persona.id)
    localStorage.setItem('scentral_persona_name', persona.name)
    track('persona_to_discover', { persona_id: persona.id })
    router.push(`/discover?persona=${persona.id}`)
  }

  const handleSkip = () => {
    localStorage.setItem('scentral_onboarded', 'true')
    router.push('/discover')
  }

  const toggleContext = (c: string) => {
    setContexts(prev => {
      const newContexts = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
      track('context_selected', { context: c, selected: !prev.includes(c) })
      return newContexts
    })
  }

  const stepLabel = step === 1 ? 'Step 1 of 3' : step === 2 ? 'Step 2 of 3' : step === 3 ? 'Step 3 of 3' : ''
  const selectedContextCount = contexts.length
  const hasContextSelection = selectedContextCount > 0
  const rememberedNote = buildPersonalNote({
    personaId: rememberedPersonaId,
    personaName: rememberedPersonaName,
  })
  const revealNote = persona
    ? buildPersonalNote({
        personaId: persona.id,
        personaName: persona.name,
      })
    : null

  const fadeStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: prefersReducedMotion.current
      ? 'opacity 80ms ease'
      : 'opacity 180ms ease, transform 180ms ease',
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REVEAL SCREEN (Step 4)
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 4 && persona) {
    return (
      <>
        {!revealVisible && <PersonaRevealOverlay persona={persona} onComplete={() => setRevealVisible(true)} />}
      <div style={{
        minHeight: '100dvh',
        background: persona.ui_theme.bgGradient,
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 'calc(160px + env(safe-area-inset-bottom, 0px))',
        transition: 'background 400ms ease',
      }}>
        <div style={{
          width: '100%', maxWidth: 480,
          padding: '48px 24px 32px',
          display: 'flex', flexDirection: 'column',
          minHeight: '100dvh',
        }}>
          <div style={{
            opacity: revealVisible ? 1 : 0,
            transform: revealVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion.current ? 'opacity 200ms ease' : 'opacity 400ms ease, transform 400ms ease',
            flex: 1,
          }}>
            <div
              style={{
                marginBottom: 24,
                padding: '14px 16px',
                borderRadius: 16,
                border: `1px solid ${persona.ui_theme.accentColor}30`,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: persona.ui_theme.accentColor, marginBottom: 6, fontFamily: 'var(--font-hand)' }}>
                Secret note
              </p>
              <p style={{ fontSize: 13, lineHeight: '20px', color: 'var(--text)', fontFamily: 'var(--font-hand)' }}>
                {revealNote?.annotation ?? 'This one feels like a sketch already.'}
              </p>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: persona.ui_theme.accentColor, marginBottom: 8 }}>
              Your Scent Identity
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 7vw, 40px)',
              fontStyle: 'italic', fontWeight: 400,
              lineHeight: 1.1, color: 'var(--text)', marginBottom: 12,
            }}>
              {persona.name}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32, fontStyle: 'italic' }}>
              &ldquo;{persona.narrative.tagline}&rdquo;
            </p>

            <div style={{ width: 40, height: 2, background: persona.ui_theme.accentColor, marginBottom: 28, borderRadius: 1 }} />

            {[persona.narrative.what_this_says, persona.narrative.environments, persona.narrative.social_energy].map((line, i) => (
              <p key={i} style={{
                fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 14,
                opacity: revealVisible ? 1 : 0,
                transition: prefersReducedMotion.current ? 'opacity 200ms ease' : `opacity 400ms ease ${120 + i * 120}ms`,
                paddingLeft: 14,
                borderLeft: `2px solid ${persona.ui_theme.accentColor}40`,
              }}>
                {line}
              </p>
            ))}

            <div style={{
              marginTop: 32, padding: '20px',
              background: persona.ui_theme.cardBg,
              border: `1px solid ${persona.ui_theme.accentColor}30`,
              borderRadius: 12,
              opacity: revealVisible ? 1 : 0,
              transition: prefersReducedMotion.current ? 'opacity 200ms ease' : 'opacity 400ms ease 480ms',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: persona.ui_theme.accentColor, marginBottom: 16 }}>
                Your notes
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {(['top', 'heart', 'base'] as const).map((tier) => (
                  <div key={tier}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      {tier}
                    </p>
                    {persona.scent_spectrum[tier].map((note, ni) => (
                      <span key={note} style={{
                        display: 'inline-block', fontSize: 11,
                        padding: '3px 8px', borderRadius: 999,
                        background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                        color: 'var(--accent)',
                        marginBottom: 4, marginRight: 4,
                        opacity: revealVisible ? 1 : 0,
                        transition: prefersReducedMotion.current ? 'opacity 200ms ease' : `opacity 300ms ease ${560 + ni * 40}ms`,
                      }}>
                        {note}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: 32,
              opacity: revealVisible ? 1 : 0,
              transition: prefersReducedMotion.current ? 'opacity 200ms ease' : 'opacity 400ms ease 640ms',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: persona.ui_theme.accentColor, marginBottom: 16 }}>
                Share Your NosePrint
              </p>
              <NosePrintCard persona={persona} />
            </div>
          </div>

          <div style={{
            marginTop: 32,
            opacity: revealVisible ? 1 : 0,
            transition: prefersReducedMotion.current ? 'opacity 200ms ease' : 'opacity 400ms ease 700ms',
          }}>
            <button onClick={handleFinish} style={{
              width: '100%', padding: '15px 24px',
              background: 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              marginBottom: 12, letterSpacing: '0.01em',
            }}>
              Explore scents for {persona.name.replace('The ', '')} →
            </button>
            <button onClick={() => {
              setRevealVisible(false)
              setSanctuary(null); setProjection(null); setContexts([])
              setTimeout(() => { setStep(1); setVisible(true) }, 200)
            }} style={{
              width: '100%', padding: '12px 24px',
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--line)', borderRadius: 12,
              fontSize: 13, cursor: 'pointer',
            }}>
              Try a different identity →
            </button>
          </div>
        </div>
      </div>
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PROFILER STEPS 1–3
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg, #F7F3EE)',
      color: 'var(--text)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingBottom: 'calc(160px + env(safe-area-inset-bottom, 0px))',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '32px 24px 40px',
        display: 'flex', flexDirection: 'column',
        minHeight: '100dvh',
      }}>

        {/* Progress dots + header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s <= step ? 'var(--accent, #A0622A)' : 'transparent',
                border: `1.5px solid ${s <= step ? 'var(--accent, #A0622A)' : 'var(--line, #D8D2CA)'}`,
                transition: 'background 300ms ease, border-color 300ms ease',
              }} />
            ))}
            {step <= 3 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0 8px' }}>
                {stepLabel}
              </p>
            )}
          </div>
          {step <= 3 && (
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Skip
            </button>
          )}
        </div>

        <div style={{ ...fadeStyle, flex: 1 }}>

          {/* ── STEP 1: Sanctuary ─────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 400, lineHeight: 1.2, marginBottom: 8, color: 'var(--text)' }}>
                Where do you go when the world gets loud?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                Choose the space that feels most like you.
              </p>
              {rememberedPersonaId && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: '12px 14px',
                    borderRadius: 16,
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: 'var(--font-hand)' }}>
                    Written in your margin
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '20px', fontFamily: 'var(--font-hand)' }}>
                    {rememberedNote.annotation}
                  </p>
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tap once and we&apos;ll move you to the next step.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SANCTUARIES.map(s => {
                  const active = sanctuary === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={s.name}
                      onClick={() => { setSanctuary(s.id); track('sanctuary_selected', { sanctuary: s.id }); setTimeout(() => transitionTo(2), 220) }}
                      style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '14px', minHeight: 90,
                      border: active ? '1.5px solid var(--accent, #A0622A)' : '1px solid var(--line, #D8D2CA)',
                      borderRadius: 12,
                      background: active ? 'rgba(160,98,42,0.06)' : 'var(--surface, #FAF7F2)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}>
                      {active && (
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent, #A0622A)', marginBottom: 6 }}>
                          Selected
                        </span>
                      )}
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                          borderRadius: 12,
                          color: active ? 'var(--accent, #A0622A)' : 'var(--text-muted)',
                          background: 'rgba(255,255,255,0.02)',
                          transform: 'rotate(-3deg)',
                        }}
                      >
                        <SanctuaryGlyph id={s.id} />
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent, #A0622A)' : 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>
                        {s.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {s.cue}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: Projection ────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 400, lineHeight: 1.2, marginBottom: 8, color: 'var(--text)' }}>
                How close do you want to be felt?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                This shapes how your scent moves through a room.
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Pick one and we&apos;ll continue automatically.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PROJECTIONS.map(p => {
                  const active = projection === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={p.name}
                      onClick={() => { setProjection(p.id); track('projection_selected', { projection: p.id }); setTimeout(() => transitionTo(3), 220) }}
                      style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '18px 20px',
                      border: active ? '1.5px solid var(--accent, #A0622A)' : '1px solid var(--line, #D8D2CA)',
                      borderRadius: 12,
                      background: active ? 'rgba(160,98,42,0.06)' : 'var(--surface, #FAF7F2)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}>
                      {active && (
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent, #A0622A)', marginBottom: 6 }}>
                          Selected
                        </span>
                      )}
                      <span style={{ fontSize: 15, fontWeight: 600, color: active ? 'var(--accent, #A0622A)' : 'var(--text)', marginBottom: 4 }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        &ldquo;{p.description}&rdquo;
                      </span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => transitionTo(1)} style={{ marginTop: 24, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP 3: Context ───────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 400, lineHeight: 1.2, marginBottom: 8, color: 'var(--text)' }}>
                When do you usually reach for it?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                Pick all that apply.
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {hasContextSelection ? `${selectedContextCount} context${selectedContextCount !== 1 ? 's' : ''} selected` : 'Choose at least one to unlock the reveal.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
                {CONTEXTS.map(c => {
                  const active = contexts.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleContext(c)}
                      style={{
                      padding: '10px 16px',
                      border: active ? '1.5px solid var(--accent, #A0622A)' : '1px solid var(--line, #D8D2CA)',
                      borderRadius: 999,
                      background: active ? 'rgba(160,98,42,0.08)' : 'var(--surface, #FAF7F2)',
                      color: active ? 'var(--accent, #A0622A)' : 'var(--text)',
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      cursor: 'pointer', transition: 'all 150ms ease',
                    }}>
                      {c}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => transitionTo(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', padding: 0, display: 'block', marginBottom: 24 }}>
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 16 }}>
          {step === 3 && (
            <button disabled={!hasContextSelection} onClick={handleReveal} style={{
              width: '100%', padding: '15px 24px',
              background: hasContextSelection ? 'var(--accent, #A0622A)' : 'var(--line, #D8D2CA)',
              color: hasContextSelection ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600,
              cursor: hasContextSelection ? 'pointer' : 'not-allowed',
              marginBottom: 16, transition: 'background 200ms ease, color 200ms ease',
            }}>
              Find my scent identity →
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
