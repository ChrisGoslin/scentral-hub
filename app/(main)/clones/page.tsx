import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import ClonesClient from './ClonesClient'

export const metadata: Metadata = {
  title: 'Inspired By | BaseNote',
  description: 'Find affordable alternatives to your favourite designer and niche fragrances. 100+ Middle Eastern clones mapped to their inspirations.',
  alternates: { canonical: '/clones' },
}

export const dynamic = 'force-dynamic'

export type CloneFragrance = {
  id: string
  brand: string
  name: string
  full_name: string
  family: string
  projection: string
  inspired_by: string
  image_url: string | null
  rating: number | null
  buy_url: string | null
  buy_label: string | null
}

export default async function ClonesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, full_name, family, projection, inspired_by, image_url, rating, buy_url, buy_label')
    .not('inspired_by', 'is', null)
    .neq('inspired_by', '')
    .order('inspired_by', { ascending: true })

  const clones: CloneFragrance[] = (data ?? []).map(f => ({
    id: f.id,
    brand: f.brand,
    name: f.name,
    full_name: f.full_name ?? `${f.brand} ${f.name}`,
    family: f.family ?? '',
    projection: f.projection ?? '',
    inspired_by: f.inspired_by ?? '',
    image_url: f.image_url ?? null,
    rating: f.rating ? Number(f.rating) : null,
    buy_url: f.buy_url ?? null,
    buy_label: f.buy_label ?? null,
  }))

  // Top cloned originals (excluding generic labels)
  const genericLabels = new Set(['Original Designer', 'Niche Fresh', 'Niche Fresh Woody', 'Dark Smoky Niche', 'Pure Oud/Musk Primer'])
  const countMap = new Map<string, number>()
  for (const c of clones) {
    if (!genericLabels.has(c.inspired_by)) {
      countMap.set(c.inspired_by, (countMap.get(c.inspired_by) ?? 0) + 1)
    }
  }
  const topOriginals = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }))

  return (
    <ClonesClient
      clones={clones}
      topOriginals={topOriginals}
      error={error?.message ?? null}
    />
  )
}
