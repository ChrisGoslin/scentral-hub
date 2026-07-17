'use client'

import { useEffect, useState } from 'react'
import LoadingShimmer from '@/components/ui/LoadingShimmer'

interface ProsConsProps {
  fragranceId: string
}

export default function ProsCons({ fragranceId }: ProsConsProps) {
  const [loading, setLoading] = useState(true)
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/proscons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fragranceId }),
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
    fetch_()
  }, [fragranceId])

  if (loading) {
    return <LoadingShimmer variant="line" count={2} />
  }

  if (error) {
    return (
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        The verdict isn&apos;t available right now — check back later.
      </p>
    )
  }

  if (pros.length === 0 && cons.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        The Verdict
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pros.length > 0 && (
          <div>
            {pros.map((pro, i) => (
              <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 4px 0', lineHeight: '16px' }}>
                ✓ {pro}
              </p>
            ))}
          </div>
        )}

        {cons.length > 0 && (
          <div>
            {cons.map((con, i) => (
              <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 4px 0', lineHeight: '16px' }}>
                ⚠ {con}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
