import React from 'react'

interface EmptyStateProps {
  headline: string
  caption?: string
  action?: React.ReactNode
}

export default function EmptyState({ headline, caption, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ width: 52, height: 2, borderRadius: 999, background: 'linear-gradient(to right, transparent, var(--accent), rgba(255,255,255,0.18))', opacity: 0.8 }} />
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: '26px', color: 'var(--text)' }}>
        {headline}
      </p>
      {caption && (
        <p style={{ fontSize: 13, lineHeight: '18px', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
          {caption}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
