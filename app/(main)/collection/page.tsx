import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import WardrobeShelf from './WardrobeShelf'
import { type CollectionFragrance } from './CollectionClient'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'My Bottles | Scentral',
  description: 'Your personal fragrance wardrobe. Track your collection, manage bottle levels, and organize your scents on virtual walnut shelves.',
}

export const dynamic = 'force-dynamic'

export default async function CollectionPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
const [{ data, error }, { data: collectionRows }] = await Promise.all([
  supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url, optimal_season, maturation')
    .order('brand', { ascending: true }),
  supabase
    .from('collections')
    .select('fragrance_id, created_at, maceration_started_at, maceration_ready_at, affinity_score, status'),
])
if (error) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        headline="Couldn't load fragrances"
        caption={error.message}
      />
    </div>
  )
}

const collectionMap = new Map(
  (collectionRows ?? []).map(r => [r.fragrance_id, r])
)

  const fragrances: CollectionFragrance[] = (data ?? []).map(f => ({
    ...f,
    maturation: f.maturation ?? null,
    maceration_started_at: collectionMap.get(f.id)?.maceration_started_at ?? null,
    maceration_ready_at: collectionMap.get(f.id)?.maceration_ready_at ?? null,
    collection_added_at: collectionMap.get(f.id)?.created_at ?? null,
    affinity_score: collectionMap.get(f.id)?.affinity_score ?? null,
    status: collectionMap.get(f.id)?.status ?? null,
  }))

  return <WardrobeShelf fragrances={fragrances} />
}
