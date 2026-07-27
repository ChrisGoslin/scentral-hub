'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import AuthSheet from '@/components/auth/AuthSheet'
import { SafeFragranceImage } from '@/components/fragrance/SafeFragranceImage'

type BlindFragrance = {
  id: string
  family: string | null
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
  dominant_accords: string[] | null
}

type RevealedFragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  image_url: string | null
  placedRank: number
}

type Phase = 'intro' | 'loading' | 'placing' | 'revealing' | 'revealed' | 'error'

const RANKS = Array.from({ length: 10 }, (_, i) => i + 1)

async function postJSON(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Request failed')
  return data
}

// ─── Note pyramid card (blind — never brand/name/image) ─────────────────────

function NotePyramidCard({ fragrance }: { fragrance: BlindFragrance }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {fragrance.family && (
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            border: '1px solid var(--aura-border, var(--line))',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          {fragrance.family}
        </span>
      )}

      {fragrance.dominant_accords && fragrance.dominant_accords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {fragrance.dominant_accords.slice(0, 6).map(accord => (
            <span
              key={accord}
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)',
                background: 'var(--surface-2)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              {accord}
            </span>
          ))}
        </div>
      )}

      <NoteRow label="Top" notes={fragrance.top_notes} />
      <NoteRow label="Heart" notes={fragrance.heart_notes} />
      <NoteRow label="Base" notes={fragrance.base_notes} />
    </div>
  )
}

function NoteRow({ label, notes }: { label: string; notes: string[] | null }) {
  if (!notes || notes.length === 0) return null
  return (
    <div>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text)', lineHeight: '19px' }}>
        {notes.join(', ')}
      </p>
    </div>
  )
}

// ─── Rank picker — the 10 locked/open slots the user places into ────────────

function RankPicker({
  placedByRank,
  onPick,
}: {
  placedByRank: Map<number, string>
  onPick: (rank: number) => void
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(56px, 1fr))',
        gap: 8,
      }}
    >
      {RANKS.map(rank => {
        const filled = placedByRank.has(rank)
        return (
          <button
            key={rank}
            disabled={filled}
            onClick={() => onPick(rank)}
            style={{
              aspectRatio: '1',
              borderRadius: 8,
              border: filled ? '1px solid var(--line)' : '1px solid var(--accent)',
              background: filled ? 'var(--surface-2)' : 'transparent',
              color: filled ? 'var(--text-muted)' : 'var(--accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 700,
              cursor: filled ? 'not-allowed' : 'pointer',
              transition: 'all var(--motion-responsive)',
            }}
          >
            {filled ? '✓' : `#${rank}`}
          </button>
        )
      })}
    </div>
  )
}

// ─── Placement screen ─────────────────────────────────────────────────────

function PlacingScreen({
  sessionId,
  pool,
  onComplete,
}: {
  sessionId: string
  pool: BlindFragrance[]
  onComplete: () => void
}) {
  const [remaining, setRemaining] = useState<BlindFragrance[]>(pool)
  const [placedByRank, setPlacedByRank] = useState<Map<number, string>>(new Map())
  const [pendingRank, setPendingRank] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = remaining[0]

  const handlePick = useCallback(
    async (rank: number) => {
      if (!current || submitting) return
      setSubmitting(true)
      setError(null)
      setPendingRank(rank)
      try {
        const result = await postJSON('/api/blind-ranking/place', {
          sessionId,
          fragranceId: current.id,
          placedRank: rank,
        })
        setPlacedByRank(prev => new Map(prev).set(rank, current.id))
        setRemaining(prev => prev.slice(1))
        if (result.complete) {
          onComplete()
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not record placement — try again.')
      } finally {
        setSubmitting(false)
        setPendingRank(null)
      }
    },
    [current, sessionId, submitting, onComplete]
  )

  const placedCount = placedByRank.size

  if (!current && placedCount < 10) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)' }}>
          Pool exhausted before your Top 10 filled — that shouldn&apos;t happen. Refresh to start a new session.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px calc(5rem + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          {placedCount} / 10 placed &mdash; no undo
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', marginTop: 4 }}>
          Where does this belong?
        </h1>
      </div>

      {current && <NotePyramidCard fragrance={current} />}

      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          Tap a rank to place it. Once placed, it&apos;s locked.
        </p>
        <RankPicker placedByRank={placedByRank} onPick={handlePick} />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
      )}

      {submitting && pendingRank && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Locking in #{pendingRank}&hellip;</p>
      )}
    </div>
  )
}

// ─── Reveal screen — slow, staggered, truthful ───────────────────────────────

function RevealScreen({ sessionId, revealed }: { sessionId: string; revealed: RevealedFragrance[] }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= revealed.length) return
    const timer = setTimeout(() => setVisibleCount(v => v + 1), 420)
    return () => clearTimeout(timer)
  }, [visibleCount, revealed.length])

  const doneRevealing = visibleCount >= revealed.length

  return (
    <div style={{ padding: '32px 16px calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 28,
          color: 'var(--text)',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        That&apos;s what you prefer?
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28 }}>
        No brand names. No bottles. Just what you actually chose.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {revealed.map((f, i) => {
          const isVisible = i < visibleCount
          return (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 12,
                borderRadius: 'var(--r-card)',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
                transition: 'opacity var(--motion-organic), transform var(--motion-organic)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: 'var(--xp-color)',
                  color: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {f.placedRank}
              </div>
              <div style={{ width: 44, height: 58, position: 'relative', flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-2)' }}>
                {f.image_url && isVisible && (
                  <SafeFragranceImage
                    imageUrl={f.image_url}
                    brand={f.brand}
                    name={f.name}
                    family={f.family}
                    sizes="44px"
                    wrapperStyle={{ position: 'absolute', inset: 0 }}
                    imageStyle={{ objectFit: 'contain' }}
                  />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isVisible ? f.brand : ' '}
                </p>
                <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isVisible ? f.name : ' '}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {doneRevealing && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Your shelf has been updated to match.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => { window.location.href = '/shelf' }}>View your shelf</Button>
            <ShareButton sessionId={sessionId} revealed={revealed} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Share card ───────────────────────────────────────────────────────────

function ShareButton({ sessionId, revealed }: { sessionId: string; revealed: RevealedFragrance[] }) {
  const [copied, setCopied] = useState(false)
  const topThree = revealed.slice(0, 3)

  const handleShare = useCallback(async () => {
    const shareText = `That's what I prefer?\n${topThree.map((f, i) => `${i + 1}. ${f.brand} ${f.name}`).join('\n')}\n\nFind your blind Top 10 on nota.`
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/shelf/blind/${sessionId}` : undefined

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: "That's what I prefer?", text: shareText, url: shareUrl })
        return
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl ?? ''}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — no-op, button stays as "Share"
    }
  }, [topThree])

  return (
    <Button variant="secondary" onClick={handleShare}>
      {copied ? 'Copied!' : 'Share'}
    </Button>
  )
}

// ─── Intro screen ─────────────────────────────────────────────────────────

function IntroScreen({ onStart, starting }: { onStart: () => void; starting: boolean }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--text)', marginBottom: 12 }}>
          Forget the bottle.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: '21px' }}>
          No brand. No name. No image. Just notes and accords &mdash; place each into your real Top 10.
          Once placed, it&apos;s locked. No undo. The reveal only happens after all ten.
        </p>
        <Button onClick={onStart} disabled={starting}>
          {starting ? 'Building your pool…' : 'Begin blind ranking'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function BlindRankingClient({ isSignedIn }: { isSignedIn: boolean }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pool, setPool] = useState<BlindFragrance[]>([])
  const [revealed, setRevealed] = useState<RevealedFragrance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)

  const handleStart = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const data = await postJSON('/api/blind-ranking/session', {})
      setSessionId(data.sessionId)
      setPool(data.pool)
      setPhase('placing')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a session — try again.')
      setPhase('error')
    }
  }, [])

  const handleComplete = useCallback(async () => {
    if (!sessionId) return
    setPhase('revealing')
    try {
      const data = await postJSON('/api/blind-ranking/reveal', { sessionId })
      setRevealed(data.revealed)
      setPhase('revealed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reveal your results — try again.')
      setPhase('error')
    }
  }, [sessionId])

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Blind ranking needs you signed in.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            It rebuilds your real shelf from what you choose &mdash; sign in first.
          </p>
          <Button onClick={() => setAuthSheetOpen(true)}>Sign in</Button>
        </div>
        <AuthSheet
          open={authSheetOpen}
          onClose={() => setAuthSheetOpen(false)}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/shelf/blind` : '/auth/confirm?next=/shelf/blind'}
        />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--danger)', marginBottom: 16 }}>{error}</p>
        <Button onClick={() => setPhase('intro')}>Back</Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} starting={false} />
  }

  if (phase === 'loading') {
    return <IntroScreen onStart={handleStart} starting={true} />
  }

  if (phase === 'placing' && sessionId) {
    return <PlacingScreen sessionId={sessionId} pool={pool} onComplete={handleComplete} />
  }

  if (phase === 'revealing') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)' }}>
          Revealing&hellip;
        </p>
      </div>
    )
  }

  if (phase === 'revealed' && sessionId) {
    return <RevealScreen sessionId={sessionId} revealed={revealed} />
  }

  return null
}
