'use client'

import { useProsCons } from '@/hooks/useProsCons'
import LoadingShimmer from '@/components/ui/LoadingShimmer'

interface ProsConsProps {
  fragranceId: string
  brand: string
  name: string
  description: string
}

export default function ProsCons({ fragranceId, brand, name, description }: ProsConsProps) {
  const { pros, cons, loading, error, retry } = useProsCons({
    endpoint: '/api/pros-cons',
    body: { fragranceId, brand, name, description },
  })

  if (loading) {
    return <LoadingShimmer variant="line" count={2} />
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
          The AI verdict isn&apos;t available right now — check back later.
        </p>
        <button
          onClick={retry}
          style={{
            alignSelf: 'flex-start',
            fontSize: 10,
            background: 'none',
            border: 'none',
            color: 'var(--color-primary, #B8913A)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Retry
        </button>
      </div>
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
