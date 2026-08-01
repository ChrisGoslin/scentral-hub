'use client'

import { useState } from 'react'

const PROJECTION_VALUES = ['Beast Mode', 'Strong', 'Moderate', 'Medium', 'Weak'] as const

interface RateProjectionProps {
  fragranceId: string
  currentProjection?: string
}

export default function RateProjection({ fragranceId, currentProjection }: RateProjectionProps) {
  const [selectedValue, setSelectedValue] = useState<typeof PROJECTION_VALUES[number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [xpToast, setXpToast] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleRate(value: typeof PROJECTION_VALUES[number]) {
    setSelectedValue(value)
    setLoading(true)
    setError('')

    try {
      const anonId = localStorage.getItem('scentral_anon_id') || crypto.randomUUID()
      if (!localStorage.getItem('scentral_anon_id')) {
        localStorage.setItem('scentral_anon_id', anonId)
      }

      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          type: 'rate_projection',
          fragranceId,
          payload: { value },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to rate projection')
      }

      const result = await response.json()
      setXpToast(result.xp_awarded)
      setTimeout(() => setXpToast(null), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate projection')
      setTimeout(() => {
        setError('')
        setSelectedValue(null)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Progress toast */}
      {xpToast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '8px',
          background: 'var(--aura-surface)',
          border: '1px solid var(--aura-border)',
          color: 'var(--xp-color)',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 50,
        }}>
          +{xpToast} resonance
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '12px',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Rate Longevity
        </h3>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {PROJECTION_VALUES.map(value => (
            <button
              key={value}
              onClick={() => handleRate(value)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: selectedValue === value ? '2px solid var(--accent)' : '1px solid var(--line)',
                background: selectedValue === value ? 'var(--accent)' : 'var(--surface)',
                color: selectedValue === value ? 'var(--bg)' : 'var(--text)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && selectedValue !== value ? 0.5 : 1,
                transition: 'all 200ms ease-out',
              }}
            >
              {value}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px' }}>
            {error}
          </div>
        )}

        {currentProjection && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '8px',
          }}>
            Current: {currentProjection}
          </div>
        )}
      </div>
    </div>
  )
}
