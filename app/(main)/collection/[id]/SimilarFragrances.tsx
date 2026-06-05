'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type SimilarResult = {
  id: string
  brand: string
  name: string
  similarity: number
}

export default function SimilarFragrances({ fragranceId }: { fragranceId: string }) {
  const [results, setResults] = useState<SimilarResult[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFind = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      // Fetch this fragrance's embedding
      const { data: frag, error: fetchErr } = await supabase
        .from('fragrances')
        .select('embedding')
        .eq('id', fragranceId)
        .single()

      if (fetchErr || !frag?.embedding) {
        setError('No embedding found for this fragrance.')
        return
      }

      // Call resonance_match RPC
      const { data, error: rpcErr } = await supabase.rpc('resonance_match', {
        query_embedding: frag.embedding,
        match_threshold: 0.3,
        match_count: 4, // +1 because it may return self
      })

      if (rpcErr) {
        setError('Could not load similar fragrances.')
        return
      }

      // Exclude self
      const filtered = (data as SimilarResult[])
        .filter(r => r.id !== fragranceId)
        .slice(0, 3)

      setResults(filtered)
      setDone(true)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!done) {
    return (
      <button
        onClick={handleFind}
        disabled={loading}
        className="text-left w-full"
      >
        <span style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'underline' }}>
          {loading ? 'Finding similar…' : 'Find similar fragrances →'}
        </span>
      </button>
    )
  }

  if (error) {
    return <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</p>
  }

  if (results.length === 0) {
    return <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No similar fragrances found.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
        Similar in your collection
      </p>
      {results.map(r => (
        <Link
          key={r.id}
          href={`/collection/${r.id}`}
          className="flex items-center justify-between px-3 py-2 rounded-[var(--r-card)] transition-colors hover:border-[var(--accent)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.brand}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{r.name}</p>
          </div>
          <span style={{ fontSize: 11, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
            {Math.round(r.similarity * 100)}%
          </span>
        </Link>
      ))}
    </div>
  )
}
