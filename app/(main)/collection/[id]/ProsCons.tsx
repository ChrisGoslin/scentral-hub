'use client'

import { useEffect, useState } from 'react'
import LoadingShimmer from '@/components/ui/LoadingShimmer'

interface ProsConsProps {
  fragranceId: string
  brand: string
  name: string
  description: string
}

export default function ProsCons({ fragranceId, brand, name, description }: ProsConsProps) {
  const [loading, setLoading] = useState(true)
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVerdict = async () => {
      try {
        const res = await fetch('/api/pros-cons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fragranceId, brand, name, description }),
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (data.unavailable) {
          setError('unavailable')
        } else {
          setPros(data.pros ?? [])
          setCons(data.cons ?? [])
        }
      } catch (err) {
        console.error('ProsCons error:', err)
        setError('unavailable')
      } finally {
        setLoading(false)
      }
    }
    fetchVerdict()
  }, [fragranceId, brand, name, description])

  if (loading) {
    return <LoadingShimmer variant="line" count={2} />
  }

  if (error) {
    return (
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        The AI verdict isn&apos;t available right now — check back later.
      </p>
    )
  }

  if (pros.length === 0 && cons.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        AI Verdict
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pros */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--positive)', marginBottom: 8 }}>
            Pros
          </p>
          {pros.map((pro, i) => (
            <p key={i} style={{ fontSize: 12, color: 'var(--text)', margin: '0 0 6px 0', lineHeight: '18px' }}>
              ✓ {pro}
            </p>
          ))}
        </div>

        {/* Cons */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
            Cons
          </p>
          {cons.map((con, i) => (
            <p key={i} style={{ fontSize: 12, color: 'var(--text)', margin: '0 0 6px 0', lineHeight: '18px' }}>
              ⚠ {con}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
