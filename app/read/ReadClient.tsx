'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { READ_RITUAL_TIMING, inferIntentProfile, type ReadPrefetchPayload, type ReadRevealPayload } from '@/lib/experience'
import { useSymphonicSensory } from '@/app/hooks/useSymphonicSensory'

type MatchData = { id: string; name: string; brand: string; family: string }
type RitualPhase = 'prefetch' | 'breath' | 'hold' | 'reveal' | 'saving'
type ReactionChoice = 'that_feels_like_me' | 'close' | 'not_quite'

function getFallbackSignals() {
  if (typeof window === 'undefined') {
    return { feelings: [], signals: [], ownedIds: [], ownedFamilies: [] }
  }
  const raw = sessionStorage.getItem('nota_entry_signals')
  return raw ? JSON.parse(raw) : { feelings: [], signals: [], ownedIds: [], ownedFamilies: [] }
}

export default function ReadClient({ userId }: { userId: string }) {
  const router = useRouter()
  const { haptic } = useSymphonicSensory()
  const [phase, setPhase] = useState<RitualPhase>('prefetch')
  const [reveal, setReveal] = useState<ReadRevealPayload | null>(null)
  const [matchData, setMatchData] = useState<MatchData[]>([])
  const [matchIds, setMatchIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [reaction, setReaction] = useState<ReactionChoice | null>(null)
  const revealTriggered = useRef(false)

  const fallbackSignals = useMemo(getFallbackSignals, [])
  const openingLine = reveal?.opening ?? 'You collect ideas the way others collect souvenirs.'
  const intentLevel = useMemo(() => {
    const ownedCount = Array.isArray(fallbackSignals.ownedIds) ? fallbackSignals.ownedIds.length : 0
    const signalCount = Array.isArray(fallbackSignals.signals) ? fallbackSignals.signals.length : 0
    return inferIntentProfile(signalCount, ownedCount).level
  }, [fallbackSignals.ownedIds, fallbackSignals.signals])

  useEffect(() => {
    let cancelled = false
    let breathTimer: number | undefined
    let holdTimer: number | undefined
    let revealTimer: number | undefined

    async function ensurePayload() {
      try {
        const cached = sessionStorage.getItem('nota_read_prefetch')
        let payload: ReadPrefetchPayload | null = cached ? JSON.parse(cached) as ReadPrefetchPayload : null

        if (!payload?.reveal) {
          const res = await fetch('/api/read/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackSignals),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'We could not complete the read.')
          }

          const data = await res.json()
          payload = {
            reveal: data.identity,
            matchIds: data.matchIds ?? [],
            matchData: data.matchData ?? [],
            intentProfile: inferIntentProfile(
              Array.isArray(fallbackSignals.signals) ? fallbackSignals.signals.length : 0,
              Array.isArray(fallbackSignals.ownedIds) ? fallbackSignals.ownedIds.length : 0,
            ),
            prefetchedAt: Date.now(),
          }
          sessionStorage.setItem('nota_read_prefetch', JSON.stringify(payload))
        }

        if (cancelled) return

        setReveal(payload.reveal)
        setMatchIds(payload.matchIds)
        setMatchData(payload.matchData)
        setPhase('breath')

        breathTimer = window.setTimeout(() => {
          if (cancelled) return
          setPhase('hold')

          holdTimer = window.setTimeout(() => {
            if (cancelled) return
            setPhase('reveal')

            revealTimer = window.setTimeout(() => {
              if (cancelled || revealTriggered.current) return
              revealTriggered.current = true
              haptic('reveal')
            }, READ_RITUAL_TIMING.revealLockMs)
          }, READ_RITUAL_TIMING.frozenHoldMs)
        }, READ_RITUAL_TIMING.preRevealMs)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'We could not complete the read.')
      }
    }

    void ensurePayload()

    return () => {
      cancelled = true
      if (breathTimer) window.clearTimeout(breathTimer)
      if (holdTimer) window.clearTimeout(holdTimer)
      if (revealTimer) window.clearTimeout(revealTimer)
    }
  }, [fallbackSignals, haptic])

  async function handleReaction(choice: ReactionChoice) {
    if (!reveal) return
    setReaction(choice)
    setPhase('saving')

    const supabase = createClient()

    await supabase.from('noseprints').insert({
      user_id: userId,
      name: reveal.noseprintName,
      descriptor: reveal.descriptor,
      read_text: reveal.opening,
      signals: reveal.signals,
      matches: matchIds,
      stretch_note: reveal.stretchNote,
      status: 'current',
    })

    await supabase.from('interactions').insert({
      user_id: userId,
      event_type: 'noseprint_reaction',
      entity_type: 'noseprint',
      metadata: { reaction: choice, ritual: 'the_read_v3' },
    })

    sessionStorage.removeItem('nota_read_prefetch')
    sessionStorage.removeItem('nota_entry_signals')
    haptic('alignment')
    router.push('/noseprint')
  }

  if (error) {
    return (
      <section style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="surface-glass" style={{ width: 'min(100%, 560px)', borderRadius: 28, padding: 32, display: 'grid', gap: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>nota.</span>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', color: 'var(--ivory)' }}>
            The room did not settle cleanly.
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>{error}</p>
          <button
            type="button"
            onClick={() => window.location.assign('/welcome')}
            style={{ justifySelf: 'start', padding: '12px 18px', borderRadius: 999, background: 'var(--ivory)', color: 'var(--charcoal)' }}
          >
            Return to welcome
          </button>
        </div>
      </section>
    )
  }

  if (phase === 'prefetch' || phase === 'breath') {
    return (
      <section
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, rgba(43, 41, 38, 0.92), rgba(31, 29, 26, 0.98))',
        }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: 20, textAlign: 'center' }}>
          <svg width="136" height="88" viewBox="0 0 136 88" aria-hidden="true">
            <path
              className="animate-arc-fill"
              d="M10 68C21 28 51 10 68 10s47 18 58 58"
              stroke="rgba(247, 244, 238, 0.88)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M10 68C21 28 51 10 68 10s47 18 58 58"
              stroke="rgba(247, 244, 238, 0.14)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="animate-breathe" style={{ display: 'grid', gap: 10 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(247, 244, 238, 0.5)' }}>
              intent layer · {intentLevel}
            </span>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--ivory)' }}>
              Reading your scent signature...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (phase === 'hold') {
    return (
      <section
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: 'var(--charcoal)',
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: 720,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 4.8vw, 3.5rem)',
            lineHeight: 1.16,
            color: 'var(--ivory)',
          }}
        >
          {openingLine}
        </p>
      </section>
    )
  }

  return (
    <section
      style={{
        minHeight: '100dvh',
        padding: 'clamp(22px, 4vw, 40px)',
        background: 'linear-gradient(180deg, rgba(43, 41, 38, 0.98), rgba(29, 27, 24, 1))',
      }}
    >
      <div
        className="animate-dossier-rise surface-glass surface-patina"
        data-patina="fresh"
        style={{
          width: 'min(100%, 1040px)',
          margin: '0 auto',
          borderRadius: 36,
          padding: 'clamp(24px, 5vw, 48px)',
          display: 'grid',
          gap: 28,
        }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>scent identity dossier</span>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.92, color: 'var(--ivory)' }}>
            {reveal?.noseprintName}
          </h1>
          <p style={{ margin: 0, maxWidth: 680, fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.8, color: 'var(--text-muted)' }}>
            {reveal?.descriptor}
          </p>
        </div>

        <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="surface-glass" style={{ borderRadius: 24, padding: 22, display: 'grid', gap: 14 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Behavioral signals</span>
            {(reveal?.signals ?? []).slice(0, 3).map((signal) => (
              <p key={signal} style={{ margin: 0, paddingLeft: 14, borderLeft: '1px solid rgba(229, 224, 214, 0.16)', color: 'var(--ivory)', lineHeight: 1.7 }}>
                {signal}
              </p>
            ))}
          </div>

          <div className="surface-glass" style={{ borderRadius: 24, padding: 22, display: 'grid', gap: 14 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Starter matches</span>
            {matchData.slice(0, 3).map((match) => (
              <div key={match.id} style={{ display: 'grid', gap: 2 }}>
                <span style={{ color: 'var(--ivory)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>{match.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{match.brand} · {match.family}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: 22,
              display: 'grid',
              gap: 12,
              background: 'linear-gradient(180deg, rgba(107, 114, 80, 0.22), rgba(74, 89, 64, 0.16))',
              border: '1px solid rgba(107, 114, 80, 0.26)',
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stretch note</span>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--ivory)', lineHeight: 1.5 }}>
              {reveal?.stretchNote}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Does the card align?</span>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { key: 'that_feels_like_me' as const, label: 'That feels like me' },
              { key: 'close' as const, label: 'Close' },
              { key: 'not_quite' as const, label: 'Not quite' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleReaction(option.key)}
                disabled={phase === 'saving'}
                style={{
                  minHeight: 58,
                  padding: '14px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(229, 224, 214, 0.14)',
                  background: reaction === option.key ? 'var(--ivory)' : 'rgba(247, 244, 238, 0.08)',
                  color: reaction === option.key ? 'var(--charcoal)' : 'var(--ivory)',
                  transition: 'background var(--motion-responsive), color var(--motion-responsive), transform var(--motion-responsive)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {phase === 'saving' && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Locking the nota. dot into alignment...</span>
          )}
        </div>
      </div>
    </section>
  )
}
