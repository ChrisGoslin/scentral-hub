'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Identity = {
  opening: string
  noseprintName: string
  descriptor: string
  signals: string[]
  stretchNote: string
}

type MatchData = { id: string; name: string; brand: string; family: string }

type Phase = 'loading' | 'opening' | 'reveal' | 'reaction' | 'saving' | 'done'

export default function ReadClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [matchData, setMatchData] = useState<MatchData[]>([])
  const [matchIds, setMatchIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [reaction, setReaction] = useState<'that_is_me' | 'close' | 'not_quite' | null>(null)
  const [regenCount, setRegenCount] = useState(0)
  const generated = useRef(false)

  useEffect(() => {
    if (generated.current) return
    generated.current = true
    generate()
  }, [])

  async function generate() {
    setPhase('loading')
    setError('')

    const raw = sessionStorage.getItem('nota_entry_signals')
    const signals = raw ? JSON.parse(raw) : { feelings: [], signals: [], ownedIds: [], ownedFamilies: [] }

    try {
      const res = await fetch('/api/read/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signals),
      })

      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()

      setIdentity(data.identity)
      setMatchIds(data.matchIds || [])
      setMatchData(data.matchData || [])

      // Phase sequence: loading → opening → (1200ms hold) → reveal
      setPhase('opening')
      setTimeout(() => setPhase('reveal'), 1200)
    } catch {
      setError('Something went wrong. Try again.')
      setPhase('loading')
    }
  }

  async function handleReaction(choice: 'that_is_me' | 'close' | 'not_quite') {
    setReaction(choice)

    if (choice === 'not_quite' && regenCount < 1) {
      // Regenerate once
      setRegenCount(r => r + 1)
      generated.current = false
      generate()
      return
    }

    // Save to noseprints
    setPhase('saving')
    const supabase = createClient()

    await supabase.from('noseprints').insert({
      user_id: userId,
      name: identity!.noseprintName,
      descriptor: identity!.descriptor,
      read_text: identity!.opening,
      signals: identity!.signals,
      matches: matchIds,
      stretch_note: identity!.stretchNote,
      status: 'current',
    })

    await supabase.from('interactions').insert({
      user_id: userId,
      event_type: 'noseprint_reaction',
      entity_type: 'noseprint',
      metadata: { reaction: choice, regenCount },
    })

    sessionStorage.removeItem('nota_entry_signals')
    router.push('/noseprint')
  }

  // ── Loading state ──────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {error ? (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{error}</p>
            <button
              onClick={() => { generated.current = false; generate() }}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try again
            </button>
          </>
        ) : (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.125rem',
            color: 'var(--color-text-muted)',
            animation: 'pulse 2s ease infinite',
          }}>
            Reading your signals…
          </p>
        )}
      </div>
    )
  }

  // ── Opening: sharp line, 1200ms pause before rest fades ────
  if (phase === 'opening' && identity) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <p
          key="opening"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            color: '#F1F5F9',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 560,
            animation: 'fadeUp 600ms ease both',
          }}
        >
          {identity.opening}
        </p>
      </div>
    )
  }

  // ── Full reveal ─────────────────────────────────────────────
  if ((phase === 'reveal' || phase === 'reaction' || phase === 'saving') && identity) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0F172A',
        color: '#F1F5F9',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Noseprint name — the ONE charcoal moment */}
        <div style={{
          padding: '3rem 2rem 1.5rem',
          textAlign: 'center',
          animation: 'fadeUp 500ms 100ms ease both',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(2.25rem, 7vw, 4rem)',
            color: '#F1F5F9',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}>
            {identity.noseprintName}
          </p>
          <p style={{
            fontSize: '0.8125rem',
            color: '#64748B',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Your Noseprint
          </p>
        </div>

        <div style={{
          flex: 1,
          padding: '0 1.5rem',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}>
          {/* Descriptor */}
          <p style={{
            fontSize: '1rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            marginBottom: '2rem',
            animation: 'fadeUp 500ms 250ms ease both',
          }}>
            {identity.descriptor}
          </p>

          {/* Signals */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1.5rem',
            marginBottom: '1.5rem',
            animation: 'fadeUp 500ms 400ms ease both',
          }}>
            {identity.signals.map((s, i) => (
              <p
                key={i}
                style={{
                  fontSize: '0.875rem',
                  color: '#64748B',
                  lineHeight: 1.65,
                  marginBottom: '0.625rem',
                  paddingLeft: '0.875rem',
                  borderLeft: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {s}
              </p>
            ))}
          </div>

          {/* Fragrance matches */}
          {matchData.length > 0 && (
            <div style={{ animation: 'fadeUp 500ms 550ms ease both', marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748B',
                marginBottom: '0.75rem',
              }}>
                Start here
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {matchData.map(f => (
                  <div
                    key={f.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{f.name}</span>
                    <span style={{ color: '#64748B', marginLeft: 8, fontSize: '0.8125rem' }}>{f.brand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stretch note */}
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(184,145,58,0.08)',
            border: '1px solid rgba(184,145,58,0.2)',
            marginBottom: '2rem',
            animation: 'fadeUp 500ms 650ms ease both',
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#B8913A', lineHeight: 1.6 }}>
              {identity.stretchNote}
            </p>
          </div>

          {/* Reaction */}
          {phase === 'reveal' && (
            <div style={{
              animation: 'fadeUp 500ms 800ms ease both',
              paddingBottom: '3rem',
            }}>
              <p style={{
                fontSize: '0.8125rem',
                color: '#64748B',
                textAlign: 'center',
                marginBottom: '1rem',
              }}>
                Does this feel like you?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { key: 'that_is_me' as const, label: '✓  That feels like me' },
                  { key: 'close' as const,       label: '∼  Close, but not quite' },
                  { key: 'not_quite' as const,   label: '✕  Not me' + (regenCount < 1 ? ' — try again' : '') },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setPhase('reaction'); handleReaction(opt.key) }}
                    style={{
                      padding: '0.8125rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F1F5F9',
                      fontSize: '0.9375rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'saving' && (
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748B',
              paddingBottom: '3rem',
            }}>
              Saving your Noseprint…
            </p>
          )}
        </div>
      </div>
    )
  }

  return null
}
