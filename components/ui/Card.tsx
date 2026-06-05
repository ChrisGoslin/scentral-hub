import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  as?: 'div' | 'button' | 'article'
}

export default function Card({
  selected = false,
  as: Tag = 'div',
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const base = 'rounded-[var(--r-card)] border p-4 transition-all duration-[var(--motion-fast)]'
  const idle = 'bg-[var(--surface)] border-[var(--line)]'
  const selectedStyle = selected
    ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),0_0_12px_rgba(201,162,75,0.12)]'
    : ''

  return (
    <Tag
      className={`${base} ${idle} ${selectedStyle} ${className}`}
      style={style}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  )
}
