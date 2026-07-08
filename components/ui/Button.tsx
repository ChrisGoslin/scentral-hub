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
  const base = 'inline-flex items-center justify-center text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[48px] px-6 rounded-[var(--r-btn)] tracking-[0.02em]'

  const variants: Record<Variant, string> = {
    primary: 'bg-[linear-gradient(135deg,var(--accent)_0%,color-mix(in_srgb,var(--accent)_80%,white)_100%)] text-[var(--bg)] shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:brightness-[1.03] active:brightness-[0.97]',
    secondary: 'bg-transparent text-[var(--text)] hover:text-[var(--accent)] border border-[color-mix(in_srgb,var(--line)_75%,transparent)] backdrop-blur-sm',
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
