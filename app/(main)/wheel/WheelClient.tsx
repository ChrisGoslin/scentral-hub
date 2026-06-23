'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { WheelFamily } from './page'

type Props = {
  wheelData: WheelFamily[]
  total: number
}

const AXIS_COLORS: Record<string, string> = {
  Fresh:     '#06B6D4',
  Aquatic:   '#0EA5E9',
  Woody:     '#92400E',
  Oud:       '#78350F',
  Oriental:  '#D97706',
  Spicy:     '#DC2626',
  Floral:    '#DB2777',
  Fruity:    '#7C3AED',
  Gourmand:  '#B45309',
  Aromatic:  '#059669',
}

const AXIS_EMOJI: Record<string, string> = {
  Fresh:     '🌿',
  Aquatic:   '🌊',
  Woody:     '🪵',
  Oud:       '🖤',
  Oriental:  '✨',
  Spicy:     '🌶️',
  Floral:    '🌸',
  Fruity:    '🍇',
  Gourmand:  '🍯',
  Aromatic:  '🌱',
}

function PolarChart({ wheelData, active, onAxisClick }: {
  wheelData: WheelFamily[]
  active: string | null
  onAxisClick: (axis: string) => void
}) {
  const cx = 160
  const cy = 160
  const maxR = 120
  const n = wheelData.length
  const maxCount = Math.max(...wheelData.map(d => d.count), 1)

  // Calculate polygon points for each axis
  const points = wheelData.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const r = (d.count / maxCount) * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      ...d,
      angle,
      fullR: cx + maxR * Math.cos(angle),
      fullY: cy + maxR * Math.sin(angle),
    }
  })

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  // Concentric grid rings at 25%, 50%, 75%, 100%
  const gridRings = [0.25, 0.5, 0.75, 1].map(scale => {
    const pts = wheelData.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      const r = scale * maxR
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    })
    return pts.join(' ')
  })

  return (
    <svg
      viewBox="0 0 320 320"
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-label="Fragrance wheel radar chart"
    >
      {/* Grid rings */}
      {gridRings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="var(--line)"
          strokeWidth={0.75}
          opacity={0.6}
        />
      ))}

      {/* Axis spokes */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(p.angle)}
          y2={cy + maxR * Math.sin(p.angle)}
          stroke="var(--line)"
          strokeWidth={0.75}
          opacity={0.5}
        />
      ))}

      {/* Filled radar polygon */}
      <path
        d={polygonPath}
        fill="var(--accent)"
        fillOpacity={0.18}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Active axis highlight */}
      {active && (() => {
        const idx = wheelData.findIndex(d => d.axis === active)
        if (idx < 0) return null
        const p = points[idx]
        const color = AXIS_COLORS[active] ?? 'var(--accent)'
        return (
          <line
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(p.angle)}
            y2={cy + maxR * Math.sin(p.angle)}
            stroke={color}
            strokeWidth={2.5}
            opacity={1}
          />
        )
      })()}

      {/* Data points */}
      {points.map((p, i) => {
        const isActive = active === p.axis
        const color = AXIS_COLORS[p.axis] ?? 'var(--accent)'
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isActive ? 6 : 4}
            fill={color}
            stroke="var(--bg)"
            strokeWidth={2}
            style={{ cursor: 'pointer', transition: 'r 150ms' }}
            onClick={() => onAxisClick(p.axis)}
          />
        )
      })}

      {/* Axis labels */}
      {points.map((p, i) => {
        const labelX = cx + (maxR + 22) * Math.cos(p.angle)
        const labelY = cy + (maxR + 22) * Math.sin(p.angle)
        const anchor = p.angle > Math.PI / 2 && p.angle < (3 * Math.PI) / 2
          ? 'end'
          : Math.abs(Math.cos(p.angle)) < 0.1
          ? 'middle'
          : 'start'
        const isActive = active === p.axis
        return (
          <text
            key={i}
            x={labelX.toFixed(1)}
            y={labelY.toFixed(1)}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={10}
            fontWeight={isActive ? 700 : 500}
            fill={isActive ? (AXIS_COLORS[p.axis] ?? 'var(--accent)') : 'var(--text-muted)'}
            style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', userSelect: 'none', transition: 'fill 150ms' }}
            onClick={() => onAxisClick(p.axis)}
          >
            {p.axis}
          </text>
        )
      })}

      {/* Centre label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={20} dominantBaseline="middle">
        🌸
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-body)">
        {wheelData.reduce((s, d) => s + d.count, 0)} mapped
      </text>
    </svg>
  )
}

export default function WheelClient({ wheelData, total }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const activeData = active ? wheelData.find(d => d.axis === active) : null
  const maxCount = Math.max(...wheelData.map(d => d.count), 1)

  const handleAxisClick = (axis: string) => {
    setActive(prev => prev === axis ? null : axis)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>

      {/* Hero */}
      <div style={{
        padding: '32px 20px 20px',
        borderBottom: '1px solid var(--line)',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
          Fragrance Wheel
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 8 }}>
          Your scent universe
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
          {total} fragrances across {wheelData.filter(d => d.count > 0).length} scent families. Tap an axis to explore.
        </p>
      </div>

      {/* Radar chart */}
      <div style={{ padding: '24px 16px 8px' }}>
        <PolarChart
          wheelData={wheelData}
          active={active}
          onAxisClick={handleAxisClick}
        />
      </div>

      {/* Active axis detail panel */}
      {activeData && (
        <div style={{
          margin: '8px 16px',
          padding: '16px',
          background: 'var(--color-surface)',
          border: `1px solid ${AXIS_COLORS[activeData.axis] ?? 'var(--line)'}`,
          borderRadius: 'var(--r-card)',
          transition: 'all var(--motion-responsive)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{AXIS_EMOJI[activeData.axis]}</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: AXIS_COLORS[activeData.axis] ?? 'var(--accent)', fontStyle: 'italic' }}>
                {activeData.axis}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {activeData.count} fragrances · {Math.round((activeData.count / total) * 100)}% of catalogue
              </p>
            </div>
          </div>

          {/* Strength bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(activeData.count / maxCount) * 100}%`,
                background: AXIS_COLORS[activeData.axis] ?? 'var(--accent)',
                borderRadius: 2,
                transition: 'width var(--motion-ceremonial)',
              }} />
            </div>
          </div>

          {/* Sub-families */}
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Sub-families
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeData.families.map(f => (
                <Link
                  key={f}
                  href={`/discover?family=${encodeURIComponent(f)}`}
                  style={{
                    fontSize: 11,
                    color: 'var(--text)',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 999,
                    padding: '4px 10px',
                    textDecoration: 'none',
                    transition: 'border-color var(--motion-fast)',
                  }}
                >
                  {f}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActive(null)}
            style={{
              marginTop: 14,
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* All axes bar chart */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          Catalogue breakdown
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...wheelData].sort((a, b) => b.count - a.count).map(d => {
            const pct = Math.round((d.count / total) * 100)
            const isActive = active === d.axis
            const color = AXIS_COLORS[d.axis] ?? 'var(--accent)'
            return (
              <button
                key={d.axis}
                onClick={() => handleAxisClick(d.axis)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 14, width: 20, flexShrink: 0 }}>{AXIS_EMOJI[d.axis]}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? color : 'var(--text)',
                  width: 72,
                  flexShrink: 0,
                  transition: 'color 150ms',
                }}>
                  {d.axis}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--color-surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(d.count / maxCount) * 100}%`,
                    background: color,
                    borderRadius: 3,
                    opacity: isActive ? 1 : 0.65,
                    transition: 'width var(--motion-ceremonial), opacity 150ms',
                  }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, textAlign: 'right', flexShrink: 0 }}>
                  {d.count}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, textAlign: 'right', flexShrink: 0 }}>
                  {pct}%
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gap analysis */}
      <div style={{
        margin: '24px 16px 0',
        padding: '16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Catalogue gaps
        </p>
        {wheelData
          .filter(d => d.count < Math.round(maxCount * 0.3))
          .sort((a, b) => a.count - b.count)
          .map(d => (
            <div key={d.axis} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>{AXIS_EMOJI[d.axis]}</span>
              <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{d.axis}</span>
              <span style={{
                fontSize: 10,
                color: '#DC2626',
                background: 'rgba(220,38,38,0.1)',
                borderRadius: 999,
                padding: '2px 8px',
                fontWeight: 600,
              }}>
                Only {d.count}
              </span>
            </div>
          ))
        }
        {wheelData.filter(d => d.count < Math.round(maxCount * 0.3)).length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>All families well-represented 🎉</p>
        )}
      </div>

      {/* CTA to discover */}
      <div style={{ padding: '24px 16px 0', textAlign: 'center' }}>
        <Link
          href="/discover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--r-btn)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          Explore the catalogue →
        </Link>
      </div>
    </div>
  )
}
