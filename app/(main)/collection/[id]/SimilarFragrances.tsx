'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { getBrandEmoji } from '@/lib/brandEmoji'

type SimilarResult = {
  id: string
  brand: string
  name: string
  image_url: string | null
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
        match_count: 5, // +1 because it may return self
      })

      if (rpcErr) {
        setError('Could not load similar fragrances.')
        return
      }

      // Exclude self
      const filtered = (data as SimilarResult[])
        .filter(r => r.id !== fragranceId)
        .slice(0, 4)

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
    return null
  }

  return (
    <div>
      <p style={{ 
        fontSize: 11, 
        textTransform: 'uppercase', 
        letterSpacing: '0.08em', 
        color: 'var(--text-muted)', 
        marginBottom: 12 
      }}>
        More like this
      </p>
      
      <div 
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {results.map(r => (
          <Link
            key={r.id}
            href={`/collection/${r.id}`}
            style={{ 
              flexShrink: 0,
              width: 140,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              padding: '12px',
              textDecoration: 'none'
            }}
          >
            <div style={{ 
              width: '100%',
              aspectRatio: '3/4',
              margin: '0 auto 8px',
              position: 'relative',
              background: 'var(--surface-2)',
              borderRadius: 8,
            }}>
              {r.image_url ? (
                <Image
                  src={r.image_url}
                  alt={r.name}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {getBrandEmoji(r.brand)}
                </div>
              )}
            </div>
            
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.brand}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
              {r.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                {Math.round(r.similarity * 100)}% Match
              </span>
            </div>
          </Link>
        ))}
        <div style={{ flexShrink: 0, width: 16 }} />
      </div>
    </div>
  )
}
