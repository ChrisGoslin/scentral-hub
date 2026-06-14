'use client'

import { useState } from 'react'

export default function LogWearButton({ collectionId }: { collectionId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleLog() {
    if (state !== 'idle') return
    setState('loading')
    try {
      await fetch('/api/wear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collectionId }),
      })
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
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
      {state === 'done' ? 'Logged ✓' : state === 'loading' ? 'Logging…' : 'Log a wear today'}
    </button>
  )
}
