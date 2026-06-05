import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorInlineProps {
  message: string
  onRetry?: () => void
  color?: 'danger' | 'warning'
}

export default function ErrorInline({ message, onRetry, color = 'danger' }: ErrorInlineProps) {
  const c = color === 'warning' ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
      <AlertTriangle size={16} strokeWidth={1.75} style={{ color: c, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm" style={{ color: c }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs underline self-start"
            style={{ color: 'var(--text-muted)' }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
