'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { SpritzEvent } from '@/lib/aura'

type Props = {
  event: SpritzEvent
  isTop: boolean
  onSwipeRight: () => void
  onSwipeLeft: () => void
}

export default function SpritzCard({ event, isTop, onSwipeRight, onSwipeLeft }: Props) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isTop) return

    const hasHinted = localStorage.getItem('scentral_swipe_hinted')
    setShowHint(!hasHinted)
  }, [isTop])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTop || touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const distance = touchStart - touchEnd
    const threshold = 50

    if (Math.abs(distance) < threshold) {
      setTouchStart(null)
      return
    }

    localStorage.setItem('scentral_swipe_hinted', 'true')
    setShowHint(false)

    if (distance > 0) {
      onSwipeRight()
    } else {
      onSwipeLeft()
    }

    setTouchStart(null)
  }

  return (
    <motion.div
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      animate={showHint && isTop ? { scale: [1, 1.02, 1] } : {}}
      transition={showHint && isTop ? { duration: 0.6, delay: 1 } : {}}
      style={{ cursor: isTop ? 'grab' : 'default' }}
    >
      <Card
        style={{
          padding: '20px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Fragrance Info */}
        <div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 4,
            }}
          >
            {event.slot === 'morning' && '🌅 Morning'}
            {event.slot === 'midday' && '☀️ Midday'}
            {event.slot === 'evening' && '🌙 Evening'}
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}
          >
            {event.etaLabel}
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            {event.fragrance.brand}
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontStyle: 'italic',
              color: 'var(--text)',
              lineHeight: '30px',
              marginBottom: 12,
            }}
          >
            {event.fragrance.name}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: '18px',
              marginBottom: 8,
            }}
          >
            {event.copy}
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            {event.sprays} sprays • {event.pulsePoints.join(' · ')}
          </p>
        </div>

        {/* Swipe Hint */}
        {isTop && showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Defer</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Swipe</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Worn</span>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Swipe left or right to rate
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
