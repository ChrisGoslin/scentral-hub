'use client'

import { useState, useCallback } from 'react'
import TraceComposer from '@/components/traces/TraceComposer'
import TraceCard, { type Trace } from '@/components/traces/TraceCard'
import EmptyState from '@/components/ui/EmptyState'

interface TracesClientProps {
  initialTraces: Trace[]
  initialHasMore: boolean
  pageSize: number
}

export default function TracesClient({ initialTraces, initialHasMore, pageSize }: TracesClientProps) {
  const [traces, setTraces] = useState(initialTraces)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/traces?limit=${pageSize}&offset=0`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setTraces(json.traces ?? [])
      setHasMore(Boolean(json.hasMore))
    } catch {
      // feed refresh is best-effort; the composer already confirmed success
    }
  }, [pageSize])

  const loadMore = async () => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/traces?limit=${pageSize}&offset=${traces.length}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setTraces(prev => [...prev, ...(json.traces ?? [])])
      setHasMore(Boolean(json.hasMore))
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TraceComposer onPosted={refresh} />

      {traces.length === 0 ? (
        <EmptyState
          headline="No traces yet"
          caption="Be the first to describe what a fragrance actually smells like."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {traces.map(trace => (
            <TraceCard key={trace.id} trace={trace} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isLoadingMore}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '10px 20px',
            alignSelf: 'center',
            cursor: isLoadingMore ? 'default' : 'pointer',
            marginBottom: 24,
          }}
        >
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
