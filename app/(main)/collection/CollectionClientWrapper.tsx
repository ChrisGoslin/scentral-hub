'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import WardrobeShelf from './WardrobeShelf'
import { type CollectionFragrance } from './CollectionClient'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function CollectionClientWrapper() {
  const [fragrances, setFragrances] = useState<CollectionFragrance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCollection = async () => {
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
          .order('affinity_score', { ascending: false, foreignTable: 'frag' })

        if (collectionError) {
          throw collectionError
        }

        const collectionFragrances: CollectionFragrance[] = (data ?? []).map((row: any) => {
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
        const message = err instanceof Error ? err.message : 'Failed to load collection'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [])

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load fragrances"
          caption={error}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your collection...</div>
      </div>
    )
  }

  return <WardrobeShelf fragrances={fragrances} />
}
