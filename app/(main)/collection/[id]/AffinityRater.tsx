'use client'

import { useState } from 'react'

const CHIPS = [
  { label: '● Everyday',  score: 5  },
  { label: '◆ Occasion',  score: 12 },
  { label: '★ Signature', score: 18 },
  { label: 'Holding',     score: 0  },
] as const

function getActiveScore(affinityScore: number | null): number {
  if (!affinityScore || affinityScore === 0) return 0
  if (affinityScore <= 7)  return 5
  if (affinityScore <= 15) return 12
  return 18
}

type Props = {
  collectionId: string
  initialAffinityScore: number | null
}

export default function AffinityRater({ collectionId, initialAffinityScore }: Props) {
  const [activeScore, setActiveScore] = useState(() => getActiveScore(initialAffinityScore))

  async function handleSelect(score: number) {
    const prev = activeScore
    setActiveScore(score)
    try {
      const res = await fetch('/api/affinity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collectionId, affinity_score: score }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
    } catch {
      setActiveScore(prev)
    }
  }

  return (
    <div>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 8 }}>
        My Rating
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CHIPS.map(chip => {
          const isActive = activeScore === chip.score
          return (
            <button
              key={chip.label}
              onClick={() => handleSelect(chip.score)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                background: isActive ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--surface)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
