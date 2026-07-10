'use client'

import Link from 'next/link'
import { track } from '@/lib/posthog'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import { SafeFragranceImage } from '@/components/fragrance/SafeFragranceImage'
import { getSafeFragranceImageUrl } from '@/lib/fragranceImageUrl'
import type { ShopifyProduct } from '@/lib/shopify'

type Props = {
  box: {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    shopify_product_id: string
    theme: string | null
    tier: string
  }
  fragrances: Array<{
    id: string
    name: string
    brand: string
    family: string
    projection: string | null
    image_url: string | null
    rating: number | null
  }>
  shopifyProduct: ShopifyProduct | null
}

export default function BoxDetailClient({ box, fragrances, shopifyProduct }: Props) {
  const safeBoxImageUrl = getSafeFragranceImageUrl(box.image_url)
  const price = shopifyProduct?.priceRange?.minVariantPrice?.amount
    ? `$${parseFloat(shopifyProduct.priceRange.minVariantPrice.amount).toFixed(2)}`
    : null

  const handleAddToCart = () => {
    track('add_to_cart_clicked', {
      box_id: box.id,
      box_name: box.name,
      shopify_product_id: box.shopify_product_id,
    })
  }

  const checkoutUrl = shopifyProduct?.variants[0]?.id
    ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${shopifyProduct.variants[0].id}:1`
    : `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/products/${shopifyProduct?.handle || box.slug}`

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>

      {/* Hero section with image */}
      {safeBoxImageUrl && (
        <div style={{
          width: '100%',
          height: 'clamp(280px, 50vh, 400px)',
          position: 'relative',
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), var(--bg))',
        }}>
          <SafeFragranceImage
            imageUrl={safeBoxImageUrl}
            brand={box.name}
            name={box.name}
            sizes="100vw"
            priority
            wrapperStyle={{ position: 'absolute', inset: 0 }}
            imageStyle={{ objectFit: 'cover' }}
            fallback={null}
          />
        </div>
      )}

      {/* Info section */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--line)',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
          Discovery Box {box.tier && `• ${box.tier}`}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>
          {box.name}
        </h1>
        {box.description && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            {box.description}
          </p>
        )}

        {/* Price & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          {price && (
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              {price}
            </p>
          )}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAddToCart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--r-btn)',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'opacity var(--motion-responsive)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Add to Cart
          </a>
        </div>

        {/* Box contents */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, marginBottom: 8 }}>
          {fragrances.length} fragrance{fragrances.length !== 1 ? 's' : ''} in this box
        </p>
      </div>

      {/* Fragrance grid */}
      <div style={{ padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
          {fragrances.map((f) => (
            <Link
              key={f.id}
              href={`/cabinet/${f.id}?from=boxes`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                transition: 'all var(--motion-responsive)',
              }}>
                <FragranceCardMedia
                  imageUrl={f.image_url}
                  brand={f.brand}
                  name={f.name}
                  family={f.family}
                  compact
                />
              </div>
              <div style={{ padding: '6px 2px 0' }}>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {f.brand}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.2 }}>
                  {f.name}
                </p>
                {f.rating && (
                  <p style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                    ★ {(f.rating / 2).toFixed(1)}/5
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <Link
          href="/boxes"
          style={{
            fontSize: 13,
            color: 'var(--accent)',
            textDecoration: 'none',
          }}
        >
          ← Back to all boxes
        </Link>
      </div>
    </div>
  )
}
