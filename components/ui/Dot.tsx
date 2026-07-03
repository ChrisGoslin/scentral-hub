'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type DotState = 'idle' | 'save' | 'active' | 'alignment'

interface DotProps {
  state?: DotState
  className?: string
  style?: React.CSSProperties
}

/**
 * Dot — nota.'s singular brand asset
 * States: idle (static), save (fills + settles), active (breathes), alignment (glows)
 * Never decorative — every appearance means recognition, presence, memory, or confirmation
 */
export default function Dot({ state = 'idle', className, style }: DotProps) {
  const prefersReducedMotion = useReducedMotion()

  const size = 12
  const sizeStr = `${size}px`

  // Disable motion variants if prefers-reduced-motion
  if (prefersReducedMotion || state === 'idle') {
    return (
      <div
        className={className}
        style={{
          width: sizeStr,
          height: sizeStr,
          borderRadius: '50%',
          background: 'var(--color-primary)', // Gold
          display: 'inline-block',
          ...style,
        }}
      />
    )
  }

  // Save state: fill + settle (200ms settle motion)
  if (state === 'save') {
    return (
      <motion.div
        initial={{ scale: 0.3, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        className={className}
        style={{
          width: sizeStr,
          height: sizeStr,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'inline-block',
          ...style,
        }}
      />
    )
  }

  // Active state: subtle pulse (breathe easing, 800ms)
  if (state === 'active') {
    return (
      <motion.div
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1], // breathe easing
          repeat: Infinity,
        }}
        className={className}
        style={{
          width: sizeStr,
          height: sizeStr,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'inline-block',
          ...style,
        }}
      />
    )
  }

  // Alignment state: subtle glow (200ms reveal)
  if (state === 'alignment') {
    return (
      <motion.div
        initial={{ boxShadow: '0 0 0 0px var(--color-primary, #B8913A)' }}
        animate={{ boxShadow: '0 0 0 8px rgba(184, 145, 58, 0)' }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          repeat: 1,
        }}
        className={className}
        style={{
          width: sizeStr,
          height: sizeStr,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'inline-block',
          ...style,
        }}
      />
    )
  }

  return null
}
