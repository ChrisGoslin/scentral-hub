'use client'

import { useProsCons } from '@/hooks/useProsCons'
import LoadingShimmer from '@/components/ui/LoadingShimmer'

interface ProsConsProps {
  fragranceId: string
}

export default function ProsCons({ fragranceId }: ProsConsProps) {
  const { pros, cons, loading, error, retry } = useProsCons({
    endpoint: '/api/proscons',
    body: { fragranceId },
  })

  if (loading) {
    return <LoadingShimmer variant="line" count={2} />
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
          The verdict isn&apos;t available right now — check back later.
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
