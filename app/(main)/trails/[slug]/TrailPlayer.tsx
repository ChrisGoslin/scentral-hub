'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import AuthSheet from '@/components/auth/AuthSheet'
import type { TrailStep, HookContent, FactContent, TermContent, ExperienceContent, PeopleLikeYouContent, TipContent, CreatorContent, DataContent } from './types'

interface TrailPlayerProps {
  trailId: string
  trailTitle: string
  steps: TrailStep[]
  isSignedIn: boolean
  initialStep: number
}

export default function TrailPlayer({ trailId, trailTitle, steps, isSignedIn, initialStep }: TrailPlayerProps) {
  const clampedInitial = Math.min(Math.max(initialStep, 0), Math.max(steps.length - 1, 0))
  const [current, setCurrent] = useState(clampedInitial)
  const [drifting, setDrifting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [authOpen, setAuthOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const total = steps.length
  const step = steps[current]
  const isLast = current === total - 1
  const isFirst = current === 0

  const persistProgress = useCallback(async (stepIndex: number, completed: boolean) => {
    if (!isSignedIn) return
    try {
      await fetch('/api/trails/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trail_id: trailId,
          last_step: stepIndex,
          completed,
        }),
      })
    } catch {
      // Soft-fail — progress persistence should never block the reading experience
    }
  }, [trailId, isSignedIn])

  const goTo = useCallback((next: number, dir: 'forward' | 'back') => {
    if (next < 0 || next >= total) return
    setDirection(dir)
    setDrifting(true)
    window.setTimeout(() => {
      setCurrent(next)
      setDrifting(false)
    }, 240)
  }, [total])

  function handleNext() {
    if (!isSignedIn && current === 0) {
      // Allow anonymous browsing, but nudge to sign in before we try to persist progress
    }
    if (isLast) {
      persistProgress(current, true)
      goTo(current, 'forward') // stay put; completion screen renders below
      return
    }
    persistProgress(current + 1, false)
    goTo(current + 1, 'forward')
  }

  function handleBack() {
    if (isFirst) return
    goTo(current - 1, 'back')
  }

  const progressLabel = useMemo(() => `${current + 1} / ${total}`, [current, total])

  if (total === 0) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>This trail has no steps yet.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 0',
        }}
      >
        <Link
          href="/trails"
          aria-label="Exit trail"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid var(--line)',
            color: 'var(--text-muted)',
          }}
        >
          <X size={16} />
        </Link>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          {progressLabel}
        </p>
      </div>

      {/* Unhurried progress indicator — a hairline, not a gamified bar */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 4 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              background: i <= current ? 'var(--accent)' : 'var(--line)',
              opacity: i <= current ? 1 : 0.5,
              transition: `background var(--motion-ceremonial), opacity var(--motion-ceremonial)`,
            }}
          />
        ))}
      </div>

      {/* Step content — one per screen, drift transition */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '32px 20px' : '48px 40px',
          opacity: drifting ? 0 : 1,
          transform: drifting
            ? `translateY(${direction === 'forward' ? '-10px' : '10px'})`
            : 'translateY(0)',
          transition: `opacity var(--motion-ceremonial), transform var(--motion-ceremonial)`,
        }}
      >
        <StepRenderer step={step} trailTitle={trailTitle} />
      </div>

      {/* Forward / back nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0 20px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        }}
      >
        <button
          onClick={handleBack}
          disabled={isFirst}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: isFirst ? 'var(--text-muted)' : 'var(--text)',
            opacity: isFirst ? 0.35 : 1,
            background: 'none',
            border: 'none',
            padding: '12px 8px',
            cursor: isFirst ? 'default' : 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {isLast ? (
          <CompletionCTA isSignedIn={isSignedIn} onSignIn={() => setAuthOpen(true)} trailId={trailId} current={current} />
        ) : (
          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bg)',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--r-btn)',
              padding: '14px 24px',
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/trails` : undefined} />
    </div>
  )
}

function CompletionCTA({ isSignedIn, onSignIn }: { isSignedIn: boolean; onSignIn: () => void; trailId: string; current: number }) {
  if (!isSignedIn) {
    return (
      <button
        onClick={onSignIn}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--bg)',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 'var(--r-btn)',
          padding: '14px 24px',
          cursor: 'pointer',
          minHeight: 48,
        }}
      >
        Sign in to save
      </button>
    )
  }

  return (
    <Link
      href="/trails"
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--bg)',
        background: 'var(--accent)',
        border: 'none',
        borderRadius: 'var(--r-btn)',
        padding: '14px 24px',
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      Done
    </Link>
  )
}

function StepRenderer({ step, trailTitle }: { step: TrailStep; trailTitle: string }) {
  switch (step.step_type) {
    case 'hook': {
      const c = step.content as HookContent
      return (
        <div style={{ textAlign: 'center', maxWidth: 560 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20 }}>
            {trailTitle}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(2rem, 1.5rem + 2.5vw, 3.25rem)', color: 'var(--text)', lineHeight: 1.15 }}>
            {c.headline}
          </h1>
          {c.body && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
              {c.body}
            </p>
          )}
        </div>
      )
    }
    case 'fact': {
      const c = step.content as FactContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            Fact
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--text)', lineHeight: 1.3 }}>
            {c.headline}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.65 }}>
            {c.body}
          </p>
        </div>
      )
    }
    case 'term': {
      const c = step.content as TermContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            Term
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--accent)', lineHeight: 1.3 }}>
            {c.term}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.65 }}>
            {c.definition}
          </p>
        </div>
      )
    }
    case 'experience': {
      const c = step.content as ExperienceContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            From a Trace
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', lineHeight: 1.5 }}>
            &ldquo;{c.body}&rdquo;
          </p>
          {c.author_label && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
              — {c.author_label}
            </p>
          )}
        </div>
      )
    }
    case 'people_like_you': {
      const c = step.content as PeopleLikeYouContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            People Like You
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', lineHeight: 1.4 }}>
            {c.insight}
          </p>
        </div>
      )
    }
    case 'tip': {
      const c = step.content as TipContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 14 }}>
            Tip
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--text)', lineHeight: 1.3 }}>
            {c.headline}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.65 }}>
            {c.body}
          </p>
        </div>
      )
    }
    case 'creator': {
      const c = step.content as CreatorContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            Creator Input
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', lineHeight: 1.5 }}>
            &ldquo;{c.quote}&rdquo;
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
            — {c.creator_name}
          </p>
        </div>
      )
    }
    case 'data': {
      const c = step.content as DataContent
      return (
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            {c.stat_label}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(2rem, 1.5rem + 2vw, 2.75rem)', color: 'var(--text)', lineHeight: 1.15 }}>
            {c.stat_value}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
            Source: {c.source}
          </p>
        </div>
      )
    }
    default:
      return null
  }
}
