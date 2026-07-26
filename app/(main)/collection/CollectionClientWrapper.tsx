'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import WardrobeShelf from './WardrobeShelf'
import { type CollectionFragrance } from './CollectionClient'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

export default function CollectionClientWrapper() {
  const [fragrances, setFragrances] = useState<CollectionFragrance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCollection = async () => {
    setLoading(true)
    setError(null)
    try {
      const anonId = localStorage.getItem('scentral_anon_id')
      if (!anonId) {
        setFragrances([])
        setLoading(false)
        return
      }

      const supabase = createClient()

      // OPTIMIZED: INNER JOIN fragrances + collections server-side
      // Fetch only user's collection fragrances in one query
      const { data, error: collectionError } = await supabase
        .from('collections')
        .select(
          `fragrance_id, created_at, maceration_started_at, maceration_ready_at, affinity_score, status, origin_code,
           frag:fragrances!fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url, optimal_season, maturation, use_case)`
        )
        .eq('anon_id', anonId)
        .order('created_at', { ascending: false })

      if (collectionError) {
        throw collectionError
      }

      type CollectionRow = {
        fragrance_id: string
        created_at: string | null
        maceration_started_at: string | null
        maceration_ready_at: string | null
        affinity_score: number | null
        status: string | null
        origin_code: 'B' | 'D' | 'T' | 'O' | 'W' | null
        frag: {
          id: string
          brand: string
          name: string
          phase: 1 | 2 | 3
          phase_label: string
          family: string
          projection: string
          anosmia_risk: 'High' | 'Medium' | 'Low'
          lean: string
          rating: number | null
          image_url: string | null
          optimal_season: string | null
          maturation: string | null
          use_case: string | null
        }
      }

      const collectionFragrances: CollectionFragrance[] = ((data ?? []) as unknown as CollectionRow[]).map((row) => {
        const f = row.frag
        return {
          id: f.id,
          brand: f.brand,
          name: f.name,
          phase: f.phase,
          phase_label: f.phase_label,
          family: f.family,
          projection: f.projection,
          anosmia_risk: f.anosmia_risk,
          lean: f.lean,
          rating: f.rating,
          image_url: f.image_url,
          optimal_season: f.optimal_season,
          maturation: f.maturation ?? null,
          use_case: f.use_case ?? null,
          maceration_started_at: row.maceration_started_at ?? null,
          maceration_ready_at: row.maceration_ready_at ?? null,
          collection_added_at: row.created_at ?? null,
          affinity_score: row.affinity_score ?? null,
          status: row.status ?? null,
          origin_code: (row.origin_code ?? null) as 'B' | 'D' | 'T' | 'O' | 'W' | null,
        }
      })

      setFragrances(collectionFragrances)
    } catch (err) {
      console.error('CollectionClientWrapper load error:', err)
      setError('unable-to-load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollection()
  }, [])

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: 380,
            width: '100%',
            padding: 24,
            borderRadius: 20,
            border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--line))',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Couldn&apos;t load
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            Try again.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '22px', marginBottom: 16 }}>
            We had trouble loading your collection. Check your connection and try again.
          </p>
          <Button fullWidth onClick={() => loadCollection()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px) + 24px)', paddingBottom: '120px' }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-card {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-card"
                style={{
                  aspectRatio: '2/3',
                  borderRadius: 'var(--r-card)',
                  background: `linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)`,
                  border: '1px solid var(--line)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (fragrances.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: 380,
            width: '100%',
            padding: 24,
            borderRadius: 20,
            border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--line))',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Cabinet
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            Begin somewhere.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '22px', marginBottom: 16 }}>
            Explore fragrances, find your next bottle, and build your collection. Every scent tells a story.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <Link href="/discover" style={{ width: '100%', display: 'block' }}>
              <Button fullWidth>Discover fragrances</Button>
            </Link>
            <Link href="/shelf" style={{ width: '100%', display: 'block' }}>
              <Button fullWidth variant="secondary">View your shelf</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <WardrobeShelf fragrances={fragrances} />
}
