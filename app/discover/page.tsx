import { createClient } from '@/utils/supabase/server'
import DiscoverClient, { type DiscoverFragrance } from './DiscoverClient'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, projection, optimal_season, plain_description, inspired_by, image_url')
    .order('brand', { ascending: true })

  const fragrances: DiscoverFragrance[] = (data ?? []).map(f => ({
    id: f.id,
    brand: f.brand,
    name: f.name,
    family: f.family ?? '',
    projection: f.projection ?? '',
    optimal_season: f.optimal_season ?? null,
    plain_description: f.plain_description ?? null,
    inspired_by: f.inspired_by ?? null,
    image_url: f.image_url ?? null,
  }))

  return <DiscoverClient fragrances={fragrances} error={error?.message ?? null} />
}
