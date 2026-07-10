'use client'

import Button from '@/components/ui/Button'

interface TemptationCardProps {
  fragrance: {
    id: string
    name: string
    brand: string
    image_url?: string
    family?: string
  }
  onView: () => void
  onBlindBuy: () => void
  onWishlist: () => void
  onDismiss: () => void
  isLoading?: boolean
  whyText?: string
}

export default function TemptationCard({
  fragrance,
  onView,
  onBlindBuy: _onBlindBuy,
  onWishlist,
  onDismiss,
  isLoading = false,
  whyText = "You've viewed this before",
}: TemptationCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: '16px',
        marginBottom: '16px',
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity var(--motion-responsive)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginBottom: '6px' }}>
          Oh no. This again.
        </p>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 4px 0',
          }}
        >
          {fragrance.brand} {fragrance.name}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
          {whyText}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexDirection: 'column',
        }}
      >
        <Button onClick={onView} disabled={isLoading}>
          View
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={onWishlist}
            disabled={isLoading}
            style={{ flex: 1, fontSize: 13 }}
          >
            Wishlist
          </Button>
          <Button
            onClick={onDismiss}
            disabled={isLoading}
            style={{ flex: 1, fontSize: 13 }}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  )
}
