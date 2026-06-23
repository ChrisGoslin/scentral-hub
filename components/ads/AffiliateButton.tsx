'use client'

import { track } from '@/lib/posthog'

type Props = {
  buyUrl: string
  buyLabel?: string
  fragranceName: string
  fragranceId: string
  className?: string
  compact?: boolean
}

/**
 * AffiliateButton — renders a "Buy" CTA that opens the affiliate link in a new tab.
 * Only renders when buyUrl is provided. Tracks click events via PostHog.
 */
export default function AffiliateButton({ buyUrl, buyLabel, fragranceName, fragranceId, className, compact }: Props) {
  if (!buyUrl) return null

  const label = buyLabel ?? 'Buy Now'

  const handleClick = () => {
    track('affiliate_click', {
      fragrance_id: fragranceId,
      fragrance_name: fragranceName,
      buy_url: buyUrl,
      buy_label: label,
    })
  }

  if (compact) {
    return (
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--accent)',
          textDecoration: 'none',
          letterSpacing: '0.04em',
        }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        {label}
      </a>
    )
  }

  return (
    <a
      href={buyUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={className}
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
        letterSpacing: '0.04em',
        transition: 'opacity var(--motion-responsive)',
        minHeight: 44,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {label}
    </a>
  )
}
