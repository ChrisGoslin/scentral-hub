'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { SpritzEvent } from '@/lib/aura'
import DryDownTimeline from './DryDownTimeline'

const SWIPE_THRESHOLD = 120

const ZONE_POSITIONS: Record<string, { top: string; left: string }> = {
  neck:   { top: '16%', left: '50%' },
  wrists: { top: '52%', left: '82%' },
  wrist:  { top: '52%', left: '82%' },
  chest:  { top: '33%', left: '50%' },
  behind_ears: { top: '10%', left: '68%' },
  hair:   { top: '5%',  left: '50%' },
}

interface SpritzCardProps {
  event: SpritzEvent
  isTop: boolean
  onSwipeRight: () => void
  onSwipeLeft: () => void
}

export default function SpritzCard({ event, isTop, onSwipeRight, onSwipeLeft }: SpritzCardProps) {
  const [infoOpen, setInfoOpen] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const rightOpacity = useTransform(x, [20, 120], [0, 1])
  const leftOpacity = useTransform(x, [-120, -20], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight()
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft()
  }

  const zones = event.pulsePoints.length ? event.pulsePoints : ['neck', 'wrists']

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="surface-glass"
      role="group"
      aria-label={`${event.slot} spritz suggestion`}
      style={{
        x,
        rotate,
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 24,
        touchAction: 'none',
        border: '1px solid var(--aura-border)',
        background: 'var(--aura-surface)',
      }}
    >
      <motion.div
        style={{ opacity: rightOpacity, position: 'absolute', top: 24, right: 24, color: 'var(--xp-color)' }}
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      >
        Worn ✓
      </motion.div>
      <motion.div
        style={{ opacity: leftOpacity, position: 'absolute', top: 24, left: 24, color: 'var(--text-muted)' }}
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      >
        Later
      </motion.div>

      <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, color: 'var(--aura)', fontWeight: 700 }}>
        {event.slot} · {event.etaLabel}
      </div>

      {/* Silhouette with pulse points */}
      <div style={{ position: 'relative', height: 220, margin: '16px 0' }}>
        <svg viewBox="0 0 100 220" style={{ height: '100%', margin: '0 auto', display: 'block', opacity: 0.35 }}>
          {/* Head */}
          <ellipse cx="50" cy="18" rx="11" ry="13" fill="var(--text-muted)" />
          {/* Neck */}
          <rect x="45" y="30" width="10" height="8" rx="2" fill="var(--text-muted)" />
          {/* Shoulders + torso */}
          <path d="M20 42 Q50 36 80 42 L76 110 Q50 116 24 110 Z" fill="var(--text-muted)" />
          {/* Left arm */}
          <path d="M24 46 Q14 70 16 100 Q20 104 24 100 Q24 72 28 50 Z" fill="var(--text-muted)" />
          {/* Right arm */}
          <path d="M76 46 Q86 70 84 100 Q80 104 76 100 Q76 72 72 50 Z" fill="var(--text-muted)" />
          {/* Left leg */}
          <path d="M32 110 Q28 155 26 190 Q32 194 36 190 Q38 155 42 110 Z" fill="var(--text-muted)" />
          {/* Right leg */}
          <path d="M58 110 Q62 155 64 190 Q70 194 74 190 Q72 155 68 110 Z" fill="var(--text-muted)" />
        </svg>
        {zones.map(zone => {
          const pos = ZONE_POSITIONS[zone] ?? ZONE_POSITIONS.chest
          return (
            <span
              key={zone}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--aura)',
                boxShadow: '0 0 0 6px var(--aura-surface)',
                transform: 'translate(-50%, -50%)',
                animation: 'spritz-pulse 1.6s ease-in-out infinite',
              }}
            />
          )
        })}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: '0 0 4px', color: 'var(--text)' }}>
        {event.fragrance.brand} {event.fragrance.name}
      </h2>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-muted)', margin: '0 0 16px' }}>
        {event.copy}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{event.sprays} sprays</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {zones.join(', ')}</span>
      </div>

      {event.fragrance.id && <DryDownTimeline fragranceId={event.fragrance.id} />}

      <button
        onClick={() => setInfoOpen(true)}
        style={{ fontSize: 13, color: 'var(--aura)', fontWeight: 600, background: 'none', padding: 0, marginTop: 8 }}
      >
        More info
      </button>

      {infoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setInfoOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="surface-glass"
            style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: 24, color: 'var(--text)' }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 12 }}>
              {event.fragrance.brand} {event.fragrance.name}
            </h3>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {event.fragrance.family && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Family</dt>
                  <dd>{event.fragrance.family}</dd>
                </>
              )}
              {event.fragrance.projection && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Projection</dt>
                  <dd>{event.fragrance.projection}</dd>
                </>
              )}
              {event.fragrance.anosmia_risk && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Anosmia risk</dt>
                  <dd>{event.fragrance.anosmia_risk}</dd>
                </>
              )}
            </dl>
            <button
              onClick={() => setInfoOpen(false)}
              style={{
                marginTop: 20,
                width: '100%',
                minHeight: 48,
                borderRadius: 'var(--r-btn)',
                background: 'var(--aura)',
                color: 'var(--bg)',
                fontWeight: 700,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spritz-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </motion.div>
  )
}
