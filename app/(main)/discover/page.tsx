import { createClient } from '@/utils/supabase/server'
import DiscoverClient, { type DiscoverFragrance } from './DiscoverClient'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const [{ data, error }, { count: totalCount }] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at')
      .order('brand', { ascending: true })
      .range(0, 39),
    supabase
      .from('fragrances')
      .select('id', { count: 'exact', head: true }),
  ])

  const fragrances: DiscoverFragrance[] = (data ?? []).map(f => ({
    id: f.id,
    brand: f.brand,
    name: f.name,
    full_name: f.full_name ?? `${f.brand} ${f.name}`,
    family: f.family ?? '',
    projection: f.projection ?? '',
    optimal_season: f.optimal_season ?? null,
    plain_description: f.plain_description ?? null,
    inspired_by: f.inspired_by ?? null,
    image_url: f.image_url ?? null,
    rating: f.rating ? Number(f.rating) : null,
    created_at: f.created_at,
  }))

  const hasMore = (data?.length ?? 0) < (totalCount ?? 0)

  return (
    <DiscoverClient
      fragrances={fragrances}
      error={error?.message ?? null}
      hasMore={hasMore}
      totalCount={totalCount ?? 0}
    />
  )
}
