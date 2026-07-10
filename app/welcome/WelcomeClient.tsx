'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { inferIntentProfile, type IntentProfile, type ReadPrefetchPayload } from '@/lib/experience'

type LoadState = 'prefetching' | 'ready' | 'error'

function buildSignals() {
  if (typeof window === 'undefined') {
    return {
      payload: { feelings: [], signals: [], ownedIds: [], ownedFamilies: [] },
      intentProfile: inferIntentProfile(0, 0),
    }
  }

  const raw = sessionStorage.getItem('nota_entry_signals')
  const parsed = raw ? JSON.parse(raw) : { feelings: [], signals: [], ownedIds: [], ownedFamilies: [] }
  const ownedCount = Array.isArray(parsed.ownedIds) ? parsed.ownedIds.length : 0
  return {
    payload: parsed,
    intentProfile: inferIntentProfile(Array.isArray(parsed.signals) ? parsed.signals.length : 0, ownedCount),
  }
}

export default function WelcomeClient() {
  const router = useRouter()
  const [{ payload, intentProfile }] = useState(buildSignals)
  const [state, setState] = useState<LoadState>('prefetching')
  const [error, setError] = useState('')

  const welcomeLine = useMemo(() => {
    if (intentProfile.level === 'expert') return 'Your archive already says plenty. We only need a little silence.'
    if (intentProfile.level === 'curator') return 'We have enough to begin. Let the room settle before the card arrives.'
    return 'We are listening for shape, mood, and the way you reach for comfort.'
  }, [intentProfile.level])

  useEffect(() => {
    let cancelled = false

    async function prefetchRead() {
      try {
        const res = await fetch('/api/read/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'We could not prepare your read just yet.')
        }

        const data = await res.json()
        if (cancelled) return

        const prefetchedPayload: ReadPrefetchPayload = {
          reveal: data.identity,
          matchIds: data.matchIds ?? [],
          matchData: data.matchData ?? [],
          intentProfile: {
            ...intentProfile,
            source: 'prefetched',
          } satisfies IntentProfile,
          prefetchedAt: Date.now(),
        }

        sessionStorage.setItem('nota_read_prefetch', JSON.stringify(prefetchedPayload))
        setState('ready')
      } catch (err) {
        if (cancelled) return
        setState('error')
        setError(err instanceof Error ? err.message : 'We could not prepare your read just yet.')
      }
    }

    void prefetchRead()

    return () => {
      cancelled = true
    }
  }, [intentProfile, payload])

  return (
    <section
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        className="surface-glass surface-patina"
        data-patina="fresh"
        style={{
          width: 'min(100%, 760px)',
          borderRadius: 34,
          padding: 'clamp(24px, 5vw, 44px)',
          display: 'grid',
          gap: 28,
        }}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>nota.</span>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(2.3rem, 7vw, 5rem)', lineHeight: 0.95, color: 'var(--ivory)' }}>
            Enter the read.
          </h1>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 'clamp(0.98rem, 2vw, 1.15rem)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            {welcomeLine}
          </p>
        </div>

        <div
          style={{
            borderRadius: 28,
            padding: '24px',
            background: 'linear-gradient(180deg, rgba(247, 244, 238, 0.08), rgba(247, 244, 238, 0.03))',
            border: '1px solid rgba(229, 224, 214, 0.1)',
            display: 'grid',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Intent layer</span>
            <span style={{ fontSize: 12, color: 'var(--accent)' }}>{intentProfile.level}</span>
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 3vw, 1.8rem)', color: 'var(--ivory)', lineHeight: 1.35 }}>
            “We are preparing a card that should feel less like a result and more like recognition.”
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['scrapbook logic', 'slow reveal', 'quiet confidence'].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(247, 244, 238, 0.06)',
                  border: '1px solid rgba(229, 224, 214, 0.08)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {state === 'prefetching' ? 'Preparing your dossier' : state === 'ready' ? 'Dossier prepared' : 'Preparation paused'}
            </span>
            <span style={{ fontSize: 14, color: state === 'error' ? '#f0b2bd' : 'var(--text-muted)' }}>
              {state === 'error' ? error : 'No spinners. No generic scoring. Just the room settling around your scent identity.'}
            </span>
          </div>
          <button
            type="button"
            disabled={state !== 'ready'}
            onClick={() => router.push('/read')}
            style={{
              padding: '14px 22px',
              borderRadius: 999,
              background: state === 'ready' ? 'var(--ivory)' : 'rgba(247, 244, 238, 0.16)',
              color: state === 'ready' ? 'var(--charcoal)' : 'var(--text-muted)',
              minWidth: 180,
              transition: 'transform var(--motion-responsive), background var(--motion-responsive), color var(--motion-responsive)',
            }}
          >
            Begin the read
          </button>
        </div>
      </div>
    </section>
  )
}
