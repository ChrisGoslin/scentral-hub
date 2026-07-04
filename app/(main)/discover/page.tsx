import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import DiscoverClient, { type DiscoverFragrance } from './DiscoverClient'
import ActiveChallengeSection from '@/components/features/ActiveChallengeSection'

export const metadata: Metadata = {
  title: 'Discover | nota.',
  description: 'Search and explore the nota. fragrance catalogue. Find your next signature scent from hundreds of designer and niche fragrances.',
  alternates: { canonical: '/discover' },
}

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const [{ data, error }, { count: totalCount }] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, full_name, family, projection, optimal_season, use_case, plain_description, inspired_by, image_url, rating, created_at')
      .order('image_url', { ascending: false, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
      .order('brand', { ascending: true })
      .range(0, 99),
    supabase
      .from('fragrances')
      .select('id', { count: 'exact', head: true }),
  ])

  const ids = (data ?? []).map(f => f.id)
  const { data: ownerCounts } = ids.length
    ? await supabase.rpc('get_fragrance_social_proof', { fragrance_ids: ids })
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
    use_case: f.use_case ?? null,
    plain_description: f.plain_description ?? null,
    inspired_by: f.inspired_by ?? null,
    image_url: f.image_url ?? null,
    rating: f.rating ? Number(f.rating) : null,
    created_at: f.created_at,
    owner_count: ownerCountById.get(f.id) ?? 0,
  }))

  const hasMore = (data?.length ?? 0) < (totalCount ?? 0)

  return (
    <>
      <ActiveChallengeSection />
      <DiscoverClient
        fragrances={fragrances}
        error={error?.message ?? null}
        hasMore={hasMore}
        totalCount={totalCount ?? 0}
      />
    </>
  )
}
