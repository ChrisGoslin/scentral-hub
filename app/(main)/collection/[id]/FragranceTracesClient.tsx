'use client'

import { useState, useCallback } from 'react'
import TraceComposer from '@/components/traces/TraceComposer'
import TraceCard, { type Trace } from '@/components/traces/TraceCard'

interface FragranceTracesClientProps {
  fragranceId: string
  initialTraces: Trace[]
  insightTraces: Trace[]
}

export default function FragranceTracesClient({ fragranceId, initialTraces, insightTraces }: FragranceTracesClientProps) {
  const [traces, setTraces] = useState(initialTraces)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/traces?fragrance_id=${fragranceId}&limit=20`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setTraces(json.traces ?? [])
    } catch {
      // best-effort refresh
    }
  }, [fragranceId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        Traces
      </p>

      <TraceComposer fragranceId={fragranceId} onPosted={refresh} />

      {traces.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {traces.map(trace => (
            <TraceCard key={trace.id} trace={trace} showFragranceLink={false} />
          ))}
        </div>
      )}

      {insightTraces.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <p style={{ fontSize: 12, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            People like you also said…
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {insightTraces.map(trace => (
              <TraceCard key={trace.id} trace={trace} showFragranceLink />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
