'use client'

import { useState } from 'react'

export default function LogWearButton({ collectionId, initialWears = 0, initialStreak = 0 }: { collectionId: string, initialWears?: number, initialStreak?: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [wears, setWears] = useState(initialWears)
  const [streak, setStreak] = useState(initialStreak)

  async function handleLog() {
    if (state !== 'idle') return
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
      
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
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
        }}
      >
        {state === 'done' ? 'Logged ✓' : 'Log a wear'}
      </button>
      
      {wears > 0 && (
        <div className="flex items-center justify-between px-1">
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Worn {wears} time{wears !== 1 ? 's' : ''}
          </p>
          {streak >= 2 && (
            <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              {streak}-day streak 🔥
            </p>
          )}
        </div>
      )}
    </div>
  )
}
