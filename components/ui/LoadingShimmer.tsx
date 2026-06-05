import React from 'react'

interface LoadingShimmerProps {
  variant?: 'line' | 'card'
  count?: number
}

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 6,
}

export default function LoadingShimmer({ variant = 'line', count = 3 }: LoadingShimmerProps) {
  if (variant === 'line') {
    return (
      <>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
        <div style={{ ...shimmerStyle, height: 16, width: '60%' }} aria-hidden="true" />
      </>
    )
  }

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{ ...shimmerStyle, height: 120, borderRadius: 'var(--r-card)' }}
            aria-hidden="true"
          />
        ))}
      </div>
    </>
  )
}
