'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import SpritzCard from '@/components/schedule/SpritzCard'
import type { SpritzEvent } from '@/lib/aura'
import { track } from '@/lib/posthog'

function getOrCreateAnonId(): string {
  try {
    const existing = localStorage.getItem('scentral_anon_id')
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem('scentral_anon_id', id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export default function SpritzClient() {
  const [schedule, setSchedule] = useState<SpritzEvent[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [xpToast, setXpToast] = useState<number | null>(null)

  useEffect(() => {
    const personaId = localStorage.getItem('scentral_persona') ?? undefined
    fetch('/api/spritz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId }),
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to generate schedule')
        return res.json()
      })
      .then(data => setSchedule(data.schedule ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    track('spritz_schedule_viewed')
  }, [])

  const advance = useCallback(() => {
    setCurrentCardIndex(i => i + 1)
  }, [])

  const handleSwipeRight = useCallback(async () => {
    const event = schedule[currentCardIndex]
    advance()
    track('spritz_card_worn', { slot: event?.slot })

    try {
      const anonId = getOrCreateAnonId()
      const res = await fetch('/api/spritz/log-wear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId }),
      })
      if (!res.ok) return
      const data = await res.json()
      setStreak(data.streak?.current ?? 0)
      setXpToast(data.xp?.gained ?? null)
      setTimeout(() => setXpToast(null), 1600)
    } catch {
      // best-effort — swipe already advanced, XP/streak just won't update this time
    }
  }, [schedule, currentCardIndex, advance])

  const handleSwipeLeft = useCallback(() => {
    track('spritz_card_deferred', { slot: schedule[currentCardIndex]?.slot })
    advance()
  }, [schedule, currentCardIndex, advance])

  const current = schedule[currentCardIndex]
  const next = schedule[currentCardIndex + 1]

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 48px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)' }}>Aura</h1>
        {streak > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--xp-color)' }}>🔥 {streak}-day streak</span>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 360, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aura is reading your collection…</p>
        )}

        {!loading && error && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>{error}</p>
        )}

        {!loading && !error && !current && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
              That's the day, taken care of.
            </p>
            <Link href="/collection" style={{ fontSize: 13, color: 'var(--aura)', fontWeight: 600 }}>
              Back to your wardrobe →
            </Link>
          </div>
        )}

        {next && (
          <div style={{ position: 'absolute', transform: 'scale(0.94) translateY(8px)', opacity: 0.5, width: '100%', maxWidth: 360 }}>
            <SpritzCard event={next} isTop={false} onSwipeRight={() => {}} onSwipeLeft={() => {}} />
          </div>
        )}

        <AnimatePresence>
          {current && (
            <motion.div
              key={current.slot}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'relative', width: '100%', maxWidth: 360 }}
            >
              <SpritzCard event={current} isTop onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {xpToast !== null && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -40 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: '40%',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--xp-color)',
                pointerEvents: 'none',
              }}
            >
              +{xpToast} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {current && (
        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          Swipe right when worn · left to defer
        </p>
      )}
    </div>
  )
}
