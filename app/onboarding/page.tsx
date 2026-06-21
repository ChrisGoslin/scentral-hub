'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getPersonaByInputs, type Persona } from '@/lib/personas'
import { track } from '@/lib/posthog'

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
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (localStorage.getItem('scentral_onboarded') === 'true') {
      router.replace('/discover')
    } else {
      track('onboarding_started')
    }
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

  const stepLabel = step === 1 ? '1/3' : step === 2 ? '2/3' : step === 3 ? '3/3' : ''

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
      <div style={{
        minHeight: '100dvh',
        background: persona.ui_theme.bgGradient,
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
                        background: `${persona.ui_theme.accentColor}18`,
                        color: persona.ui_theme.accentColor,
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
          </div>

          <div style={{
            marginTop: 32,
            opacity: revealVisible ? 1 : 0,
            transition: prefersReducedMotion.current ? 'opacity 200ms ease' : 'opacity 400ms ease 700ms',
          }}>
            <button onClick={handleFinish} style={{
              width: '100%', padding: '15px 24px',
              background: persona.ui_theme.accentColor,
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
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '32px 24px 40px',
        display: 'flex', flexDirection: 'column',
        minHeight: '100dvh',
      }}>

        {/* Progress dots + header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s <= step ? 'var(--accent, #A0622A)' : 'transparent',
                border: `1.5px solid ${s <= step ? 'var(--accent, #A0622A)' : 'var(--line, #D8D2CA)'}`,
                transition: 'background 300ms ease, border-color 300ms ease',
              }} />
            ))}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SANCTUARIES.map(s => {
                  const active = sanctuary === s.id
                  return (
                    <button key={s.id} onClick={() => { setSanctuary(s.id); track('sanctuary_selected', { sanctuary: s.id }); setTimeout(() => transitionTo(2), 220) }} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '14px', minHeight: 90,
                      border: active ? '1.5px solid var(--accent, #A0622A)' : '1px solid var(--line, #D8D2CA)',
                      borderRadius: 12,
                      background: active ? 'rgba(160,98,42,0.06)' : 'var(--surface, #FAF7F2)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}>
                      <span style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PROJECTIONS.map(p => {
                  const active = projection === p.id
                  return (
                    <button key={p.id} onClick={() => { setProjection(p.id); track('projection_selected', { projection: p.id }); setTimeout(() => transitionTo(3), 220) }} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '18px 20px',
                      border: active ? '1.5px solid var(--accent, #A0622A)' : '1px solid var(--line, #D8D2CA)',
                      borderRadius: 12,
                      background: active ? 'rgba(160,98,42,0.06)' : 'var(--surface, #FAF7F2)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
                {CONTEXTS.map(c => {
                  const active = contexts.includes(c)
                  return (
                    <button key={c} onClick={() => toggleContext(c)} style={{
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
            <button disabled={contexts.length === 0} onClick={handleReveal} style={{
              width: '100%', padding: '15px 24px',
              background: contexts.length > 0 ? 'var(--accent, #A0622A)' : 'var(--line, #D8D2CA)',
              color: contexts.length > 0 ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600,
              cursor: contexts.length > 0 ? 'pointer' : 'not-allowed',
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
