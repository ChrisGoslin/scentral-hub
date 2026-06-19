'use client'

import { AFFILIATE_RETAILERS, buildAffiliateUrl } from '@/lib/affiliates'

interface BuyLinksProps {
  fragranceName: string
  brand: string
}

export default function BuyLinks({ fragranceName, brand }: BuyLinksProps) {
  const searchTerm = `${brand} ${fragranceName}`

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {AFFILIATE_RETAILERS.map((retailer) => (
        <a
          key={retailer.name}
          href={buildAffiliateUrl(retailer, searchTerm)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 44,
            padding: '0 14px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            fontSize: 13,
            color: 'var(--text)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)'
            e.currentTarget.style.color = 'var(--text)'
          }}
        >
          <span>{retailer.logoEmoji}</span>
          <span>{retailer.name}</span>
        </a>
      ))}
    </div>
  )
}
