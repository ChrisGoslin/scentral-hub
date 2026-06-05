import React from 'react'

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  dot?: string
}

export default function Chip({
  selected = false,
  dot,
  children,
  className = '',
  ...props
}: ChipProps) {
  const base = 'inline-flex items-center gap-1.5 rounded-[var(--r-chip)] border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[32px]'
  const idle = 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]'
  const active = 'border-[var(--accent)] text-[var(--accent)]'

  return (
    <button className={`${base} ${selected ? active : idle} ${className}`} {...props}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      )}
      {children}
    </button>
  )
}
