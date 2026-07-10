'use client'

import React, { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import Card from '@/components/ui/Card'

interface ChemistResponse {
  similarity?: {
    score: number
    label: 'Clone' | 'Close' | 'Complementary' | 'Contrasting'
    explanation: string
  }
  phaseCancellation?: {
    warning: boolean
    message: string
  }
  dryDown: {
    topPeakMins: number
    heartPeakMins: number
    baseSettleMins: number
    timeline: Array<{ minute: number; dominantClass: string }>
  }
  error?: string
}

interface ChemistPanelProps {
  fragranceAId: string
  fragranceBId: string
  fragranceAName: string
  fragranceBName: string
  useCase?: string
}

const similarityColours: Record<'Clone' | 'Close' | 'Complementary' | 'Contrasting', string> = {
  Clone: 'var(--accent)',
  Close: 'oklch(0.7 0.15 160)',
  Complementary: 'oklch(0.7 0.12 260)',
  Contrasting: 'var(--text-muted)',
}

export default function ChemistPanel({
  fragranceAId,
  fragranceBId,
  fragranceAName: _fragranceAName,
  fragranceBName: _fragranceBName,
  useCase: _useCase,
}: ChemistPanelProps) {
  const [data, setData] = useState<ChemistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChemist = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/chemist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fragranceId: fragranceAId,
            layerId: fragranceBId,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          setError(errorData.error || 'Failed to analyze fragrances')
          return
        }

        const result = await res.json()
        setData(result)
      } catch (err) {
        // Silent error — don't break the layering experience
        console.error('Chemist API error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChemist()
  }, [fragranceAId, fragranceBId])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
        <Loader size={20} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error || !data) {
    return null // Silent failure — panel just doesn't appear
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Similarity Badge */}
      {data.similarity && (
        <Card
          style={{
            padding: '12px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
          }}
        >
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Similarity
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                background: similarityColours[data.similarity.label],
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {data.similarity.label}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{Math.round(data.similarity.score * 100)}%</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: '1.4' }}>
            {data.similarity.explanation}
          </p>
        </Card>
      )}

      {/* Phase Cancellation Warning */}
      {data.phaseCancellation?.warning && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--r-card)',
            background: 'oklch(0.25 0.08 60 / 0.8)',
            border: '1px solid oklch(0.45 0.06 60 / 0.5)',
          }}
        >
          <p style={{ fontSize: 11, color: 'oklch(0.78 0.14 85)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            ⚠ Phase Cancellation
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: '1.5',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
            }}
          >
            {data.phaseCancellation.message}
          </p>
        </div>
      )}

      {/* Dry-Down Timeline */}
      {data.dryDown && (
        <Card
          style={{
            padding: '12px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
          }}
        >
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Dry-Down Timeline
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {data.dryDown.timeline.map((point, i) => (
              <React.Fragment key={i}>
                <div
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background:
                      point.dominantClass === 'top'
                        ? 'oklch(0.7 0.15 160)'
                        : point.dominantClass === 'heart'
                          ? 'oklch(0.7 0.12 260)'
                          : 'oklch(0.65 0.1 40)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {point.minute}m
                </div>
                {i < data.dryDown.timeline.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {data.dryDown.topPeakMins > 0 && `Top peaks at ${data.dryDown.topPeakMins}m`}
            {data.dryDown.topPeakMins > 0 && data.dryDown.heartPeakMins > 0 && ' · '}
            {data.dryDown.heartPeakMins > 0 && `Heart at ${data.dryDown.heartPeakMins}m`}
            {(data.dryDown.topPeakMins > 0 || data.dryDown.heartPeakMins > 0) &&
              data.dryDown.baseSettleMins > 0 &&
              ' · '}
            {data.dryDown.baseSettleMins > 0 && `Base settles ~${data.dryDown.baseSettleMins}m`}
          </p>
        </Card>
      )}
    </div>
  )
}
