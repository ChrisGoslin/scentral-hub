import React from 'react'

type Variant = 'primary' | 'secondary' | 'disabled'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[48px] px-6 rounded-[var(--r-btn)]'

  const variants: Record<Variant, string> = {
    primary: 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-press)] active:bg-[var(--accent-press)]',
    secondary: 'bg-transparent text-[var(--text)] hover:text-[var(--accent)]',
    disabled: 'bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed pointer-events-none',
  }

  const resolvedVariant: Variant = disabled ? 'disabled' : variant
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || resolvedVariant === 'disabled'}
      className={`${base} ${variants[resolvedVariant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
