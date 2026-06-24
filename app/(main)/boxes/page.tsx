import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import BoxesClient from './BoxesClient'

export const metadata: Metadata = {
  title: 'Discovery Boxes | AnotherSense',
  description: 'Curated fragrance sample sets. Explore, discover, and expand your scent wardrobe.',
}

export const dynamic = 'force-dynamic'

export type DiscoveryBox = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  fragrance_ids: string[]
  shopify_product_id: string
  price_cents: number | null
  tier: string
  theme: string | null
  fragrances?: Array<{
    id: string
    name: string
    brand: string
    family: string
    image_url: string | null
  }>
}

export default async function BoxesPage() {
  const supabase = await createClient()

  // Fetch all active discovery boxes
  const { data: boxes, error } = await supabase
    .from('discovery_boxes')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch discovery boxes:', error)
  }

  // Fetch fragrance metadata for each box
  const enrichedBoxes: DiscoveryBox[] = await Promise.all(
    (boxes ?? []).map(async (box) => {
      const { data: fragrances } = await supabase
        .from('fragrances')
        .select('id, name, brand, family, image_url')
        .in('id', box.fragrance_ids)

      return {
        id: box.id,
        name: box.name,
        slug: box.slug,
        description: box.description,
        image_url: box.image_url,
        fragrance_ids: box.fragrance_ids,
        shopify_product_id: box.shopify_product_id,
        price_cents: box.price_cents,
        tier: box.tier,
        theme: box.theme,
        fragrances: fragrances ?? [],
      }
    })
  )

  return (
    <BoxesClient
      boxes={enrichedBoxes}
      error={error?.message ?? null}
    />
  )
}
