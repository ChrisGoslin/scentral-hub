'use client'

import { useState, useRef } from 'react'
import { track } from '@/lib/posthog'
import AuraAdvisory from '@/components/aura/AuraAdvisory'

interface LogWearButtonProps {
  collectionId: string
  initialWears?: number
  initialStreak?: number
  fragranceId?: string
  fragranceData?: {
    name: string
    brand: string
    family: string
    projection: string
    optimal_season: string
  }
}

export default function LogWearButton({ collectionId, initialWears = 0, initialStreak = 0, fragranceId, fragranceData }: LogWearButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [wears, setWears] = useState(initialWears)
  const [streak, setStreak] = useState(initialStreak)
  const [justLogged, setJustLogged] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  async function handleLog() {
    if (state !== 'idle') return

    // Trigger press animation
    if (buttonRef.current) {
      buttonRef.current.style.animation = 'button-press 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.animation = ''
        }
      }, 300)
    }

    setState('loading')
    try {
      const res = await fetch('/api/wear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collectionId }),
      })
      if (!res.ok) throw new Error('Failed to log')

      const data = await res.json()
      if (data.total_wears !== undefined) setWears(data.total_wears)
      if (data.current_streak !== undefined) setStreak(data.current_streak)

      track('wear_logged', {
        fragrance_id: collectionId,
        streak: data.current_streak ?? 0,
      })
      setState('done')
      setJustLogged(true)
      setTimeout(() => setState('idle'), 1500)
    } catch {
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        ref={buttonRef}
        onClick={handleLog}
        disabled={state === 'loading'}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--r-card)',
          border: '1px solid var(--line)',
          background: state === 'done' ? 'color-mix(in srgb, var(--positive) 12%, transparent)' : 'var(--surface)',
          color: state === 'done' ? 'var(--positive)' : 'var(--text-muted)',
          fontSize: 14,
          fontWeight: 500,
          cursor: state === 'idle' ? 'pointer' : 'default',
          transition: 'background 0.2s, color 0.2s',
          textAlign: 'center',
          willChange: 'transform',
        }}
      >
        <span style={state === 'done' ? { animation: 'text-flash 1.5s ease-in-out' } : undefined}>
          {state === 'done'
            ? 'Logged ✓'
            : wears > 0
            ? streak >= 2
              ? `🔥 ${streak}-day streak`
              : `Worn ${wears} time${wears !== 1 ? 's' : ''}`
            : 'Log a wear'}
        </span>
      </button>
      {justLogged && fragranceId && fragranceData && (
        <AuraAdvisory
          fragranceId={fragranceId}
          contextType="post_wear"
          fragranceData={fragranceData}
        />
      )}
    </div>
  )
}
