import { createClient } from '@/utils/supabase/server'
import CollectionClient, { type CollectionFragrance } from './CollectionClient'
import EmptyState from '@/components/ui/EmptyState'
import { cookies } from 'next/headers'

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
      .select('fragrance_id, maceration_started_at, maceration_ready_at'),
  ])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load collection"
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
  }))

  return <CollectionClient fragrances={fragrances} />
}
