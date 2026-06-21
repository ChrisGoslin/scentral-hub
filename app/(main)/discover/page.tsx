import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import DiscoverClient, { type DiscoverFragrance } from './DiscoverClient'

export const metadata: Metadata = {
  title: 'Discover | AnotherSense',
  description: 'Search and explore the AnotherSense fragrance catalogue. Find your next signature scent from hundreds of designer and niche fragrances.',
}

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const [{ data, error }, { count: totalCount }] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at')
      .order('brand', { ascending: true })
      .range(0, 99),
    supabase
      .from('fragrances')
      .select('id', { count: 'exact', head: true }),
  ])

  const ids = (data ?? []).map(f => f.id)
  const { data: ownerCounts } = ids.length
    ? await supabase.rpc('fragrance_owner_counts', { fragrance_ids: ids })
    : { data: null }
  const ownerCountById = new Map<string, number>(
    (ownerCounts ?? []).map((row: { fragrance_id: string; owner_count: number }) => [row.fragrance_id, row.owner_count])
  )

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
    owner_count: ownerCountById.get(f.id) ?? 0,
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
