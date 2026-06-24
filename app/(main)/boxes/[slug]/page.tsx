import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getShopifyProduct } from '@/lib/shopify'
import BoxDetailClient from './BoxDetailClient'
import EmptyState from '@/components/ui/EmptyState'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: box } = await supabase
    .from('discovery_boxes')
    .select('name, description')
    .eq('slug', slug)
    .single()

  return {
    title: `${box?.name || 'Box'} | AnotherSense`,
    description: box?.description || 'Curated fragrance sample set',
  }
}

export default async function BoxDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch box
  const { data: box, error: boxError } = await supabase
    .from('discovery_boxes')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (boxError || !box) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState headline="Box not found" caption="This discovery box doesn't exist or has been removed." />
      </div>
    )
  }

  // Fetch fragrances in this box
  const { data: fragrances } = await supabase
    .from('fragrances')
    .select('id, name, brand, family, projection, image_url, rating')
    .in('id', box.fragrance_ids)

  // Fetch Shopify product metadata
  const shopifyProduct = await getShopifyProduct(box.shopify_product_id)

  const enrichedFragrances = box.fragrance_ids
    .map((id: string) => fragrances?.find(f => f.id === id))
    .filter(Boolean)

  return (
    <BoxDetailClient
      box={{
        id: box.id,
        name: box.name,
        slug: box.slug,
        description: box.description,
        image_url: box.image_url,
        shopify_product_id: box.shopify_product_id,
        theme: box.theme,
        tier: box.tier,
      }}
      fragrances={enrichedFragrances ?? []}
      shopifyProduct={shopifyProduct}
    />
  )
}
