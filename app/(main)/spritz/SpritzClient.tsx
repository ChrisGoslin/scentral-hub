'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import SpritzCard from '@/components/schedule/SpritzCard'
import type { SpritzEvent } from '@/lib/aura'
import { track } from '@/lib/posthog'
import { getPersonaCopy } from '@/lib/personaCopy'
import OccasionPicker from '@/components/brief/OccasionPicker'
import WearNoteSheet from './WearNoteSheet'
import { createClient } from '@/utils/supabase/client'

type RandomizerFragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  affinity_score: number
}

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

function getCollection(): string[] {
  try {
    const col = localStorage.getItem('scentral_collection')
    return col ? JSON.parse(col) : []
  } catch {
    return []
  }
}

export default function SpritzClient() {
  const [schedule, setSchedule] = useState<SpritzEvent[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [xpToast, setXpToast] = useState<number | null>(null)
  const [streakToast, setStreakToast] = useState<string | null>(null)
  const [cardRotation, setCardRotation] = useState(0)
  const [collection] = useState(getCollection())
  const [showOccasionPicker, setShowOccasionPicker] = useState(false)
  const [wornToast, setWornToast] = useState<string | null>(null)
  const [noteSheetOpen, setNoteSheetOpen] = useState(false)
  const [currentWearLogId, setCurrentWearLogId] = useState<string | null>(null)
  const [randomResult, setRandomResult] = useState<RandomizerFragrance | null>(null)
  const [randomLoading, setRandomLoading] = useState(false)
  const [randomCollectionLoaded, setRandomCollectionLoaded] = useState<RandomizerFragrance[]>([])
  const copy = getPersonaCopy(typeof window !== 'undefined' ? localStorage.getItem('scentral_persona') : null)

  const loadRandomizerCollection = useCallback(async () => {
    try {
      const anonId = getOrCreateAnonId()
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('collections')
        .select(`
          affinity_score,
          fragrances!inner(
            id,
            brand,
            name,
            family
          )
        `)
        .eq('anon_id', anonId)
        .not('affinity_score', 'is', null)
        .order('affinity_score', { ascending: false })
        .limit(20)

      if (err) throw err
      const fragrances = (data ?? []).map(row => ({
        id: (row.fragrances as any).id,
        brand: (row.fragrances as any).brand,
        name: (row.fragrances as any).name,
        family: (row.fragrances as any).family,
        affinity_score: row.affinity_score,
      }))
      setRandomCollectionLoaded(fragrances)
    } catch (err) {
      console.error('Failed to load randomizer collection:', err)
    }
  }, [])

  const pickRandomFragrance = useCallback(() => {
    if (randomCollectionLoaded.length === 0) return

    // Weighted random: create array with duplicates based on affinity
    const weighted: RandomizerFragrance[] = []
    randomCollectionLoaded.forEach(frag => {
      const weight = Math.max(1, Math.ceil(frag.affinity_score / 2))
      for (let i = 0; i < weight; i++) {
        weighted.push(frag)
      }
    })

    const picked = weighted[Math.floor(Math.random() * weighted.length)]
    setRandomResult(picked)
  }, [randomCollectionLoaded])

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

    loadRandomizerCollection()
    track('spritz_schedule_viewed')

    // Tutorial animation on first visit
    if (!localStorage.getItem('scentral_brief_tutorialSeen') && collection.length > 0) {
      const timings = [0, 80, 160, 240, 320, 400]
      const rotations = [0, -3, 3, -2, 2, 0]
      const timeouts = timings.map((t, i) =>
        setTimeout(() => setCardRotation(rotations[i]), t)
      )
      const completeTimeout = setTimeout(() => {
        localStorage.setItem('scentral_brief_tutorialSeen', '1')
      }, 600)
      return () => {
        timeouts.forEach(clearTimeout)
        clearTimeout(completeTimeout)
      }
    }
  }, [])

  const advance = useCallback(() => {
    setCurrentCardIndex(i => i + 1)
  }, [])

  const logWear = useCallback(async (fragranceId: string, fragranceName?: string) => {
    try {
      const anonId = getOrCreateAnonId()
      const res = await fetch('/api/spritz/log-wear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId, fragranceId }),
      })
      if (!res.ok) return
      const data = await res.json()
      const currentStreak = data.streak?.current ?? 0
      setStreak(currentStreak)
      setXpToast(data.xp?.gained ?? null)
      setTimeout(() => setXpToast(null), 1600)
      if (currentStreak === 1 && !localStorage.getItem('scentral_streak_celebrated')) {
        localStorage.setItem('scentral_streak_celebrated', '1')
        setStreakToast('🔥 Streak started! Come back tomorrow to keep it alive.')
        setTimeout(() => setStreakToast(null), 3000)
      }
      if (data.wearLogId) {
        setCurrentWearLogId(data.wearLogId)
        setNoteSheetOpen(true)
      }
    } catch {
      // best-effort
    }
  }, [])

  const handleSwipeRight = useCallback(async () => {
    const event = schedule[currentCardIndex]
    advance()
    track('spritz_card_worn', { slot: event?.slot })

    if (event?.fragrance?.id) {
      try {
        const history = JSON.parse(localStorage.getItem('scentral_wear_history') ?? '[]')
        history.push({ fragrance_id: event.fragrance.id, fragrance_name: event.fragrance.name, date: new Date().toISOString() })
        localStorage.setItem('scentral_wear_history', JSON.stringify(history))
      } catch { /* ignore */ }
    }

    await logWear(event?.fragrance?.id)
  }, [schedule, currentCardIndex, advance, logWear])

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
        paddingTop: 'calc(44px + env(safe-area-inset-top, 0px) + 24px)',
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)' }}>{copy.briefTitle}</h1>
        {streak > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>🔥 {streak}-day streak</span>
        )}
      </div>

      {/* Randomizer section */}
      {randomCollectionLoaded.length > 0 ? (
        <div style={{ width: '100%', maxWidth: 360, marginBottom: 24 }}>
          {randomResult ? (
            <div style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-card)',
              borderLeft: '3px solid var(--accent)',
              padding: 16,
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontVariant: 'small-caps' }}>
                {randomResult.brand}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', margin: '0 0 6px 0' }}>
                {randomResult.name}
              </h2>
              {randomResult.family && (
                <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>
                  {randomResult.family}
                </p>
              )}
              <button
                onClick={() => {
                  logWear(randomResult.id)
                  setRandomResult(null)
                }}
                style={{
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log as worn today →
              </button>
            </div>
          ) : null}
          <button
            onClick={() => {
              setRandomLoading(true)
              pickRandomFragrance()
              setRandomLoading(false)
            }}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = 'var(--accent)'
              ;(e.target as HTMLButtonElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = 'var(--line)'
              ;(e.target as HTMLButtonElement).style.color = 'var(--text)'
            }}
          >
            🎲 Surprise Me
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 360, marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Add fragrances to your wardrobe to unlock this.
          </p>
          <Link href="/discover" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
            Explore Fragrances →
          </Link>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', maxWidth: 360, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Reading your collection…</p>
        )}

        {!loading && error && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>{error}</p>
        )}

        {!loading && !error && !current && (
          <div style={{ textAlign: 'center' }}>
            {collection.length === 0 ? (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                  {copy.briefEmpty}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Add fragrances to your collection to start your daily ritual.
                </p>
                <Link href="/discover" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  Explore Fragrances →
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                  {copy.briefDone}
                </p>
                <Link href="/collection" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  Back to your wardrobe →
                </Link>
              </>
            )}
          </div>
        )}

        {next && (
          <div style={{ position: 'absolute', transform: 'scale(0.94) translateY(8px)', opacity: 0.5, width: '100%', maxWidth: 360 }}>
            <SpritzCard event={next} isTop={false} onSwipeRight={() => {}} onSwipeLeft={() => {}} />
          </div>
        )}

        <AnimatePresence>
          {current && (
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button
                onClick={handleSwipeLeft}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  whiteSpace: 'nowrap',
                  minWidth: 40,
                }}
              >
                ← Later
              </button>
              <motion.div
                key={current.slot}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, rotate: cardRotation }}
                exit={{ opacity: 0 }}
                transition={{ rotate: { duration: 0.1 } }}
                style={{ maxWidth: 360, flex: 1 }}
              >
                <SpritzCard event={current} isTop onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft} />
              </motion.div>
              <button
                onClick={handleSwipeRight}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  padding: 0,
                  whiteSpace: 'nowrap',
                  minWidth: 40,
                }}
              >
                Worn ✓
              </button>
            </div>
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
                color: 'var(--accent)',
                pointerEvents: 'none',
              }}
            >
              +{xpToast} XP
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {streakToast !== null && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
              style={{
                position: 'absolute',
                top: '35%',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent)',
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              {streakToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {current && (
        <div style={{ marginTop: 24, width: '100%', maxWidth: 360 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            Swipe right when worn · left to defer
          </p>
        </div>
      )}

      {/* Quick Pick floating pill */}
      {collection.length > 0 && (
        <button
          onClick={() => setShowOccasionPicker(true)}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            right: 16,
            background: 'var(--surface)',
            border: '1px solid var(--accent)',
            borderRadius: 20,
            padding: '8px 16px',
            fontSize: 11,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            zIndex: 50,
          }}
        >
          ◈ Quick Pick
        </button>
      )}

      {wornToast && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: 13,
          color: 'var(--accent)',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          ✓ Wearing {wornToast}
        </div>
      )}

      <OccasionPicker
        isOpen={showOccasionPicker}
        onClose={() => setShowOccasionPicker(false)}
        onWear={(fragranceId, fragranceName) => {
          void fragranceId
          setWornToast(fragranceName)
          setTimeout(() => setWornToast(null), 3000)
        }}
      />

      <WearNoteSheet
        isOpen={noteSheetOpen}
        onClose={() => setNoteSheetOpen(false)}
        wearLogId={currentWearLogId}
        fragranceId={schedule[currentCardIndex - 1]?.fragrance?.id}
        fragranceName={schedule[currentCardIndex - 1]?.fragrance?.name}
        placeholder={copy.briefCTA}
      />
    </div>
  )
}
