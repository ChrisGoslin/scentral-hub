import React from 'react'

interface EmptyStateProps {
  headline: string
  caption?: string
  action?: React.ReactNode
}

export default function EmptyState({ headline, caption, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: '26px', color: 'var(--text)' }}>
        {headline}
      </p>
      {caption && (
        <p style={{ fontSize: 13, lineHeight: '18px', color: 'var(--text-muted)' }}>
          {caption}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
