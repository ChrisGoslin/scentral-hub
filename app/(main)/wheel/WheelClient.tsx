'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { track } from '@/lib/posthog'

// Map every DB family string to one of 9 radar axes
const AXIS_MAP: Record<string, string> = {
  'Fresh Aromatic': 'Fresh',
  'Fresh Woody': 'Fresh',
  'Fresh Aquatic': 'Aquatic',
  'Fresh Marine': 'Aquatic',
  'Fresh Floral': 'Fresh',
  'Fresh Fougere': 'Fresh',
  'Fresh Citrus': 'Fresh',
  'Citrus Woody': 'Fresh',
  'Woody Aromatic': 'Woody',
  'Woody Spicy': 'Woody',
  'Woody Oud': 'Oud',
  'Woody Oriental': 'Oriental',
  'Woody Powdery': 'Woody',
  'Aromatic Woody': 'Woody',
  'Aromatic Fougere': 'Aromatic',
  'Dark Leather Oud': 'Oud',
  'Floral Oriental': 'Floral',
  'Floral Musk': 'Floral',
  'Floral Fruity': 'Floral',
  'Floral Powdery': 'Floral',
  'Floral Musky': 'Floral',
  'Fresh Floral Musk': 'Floral',
  'White Floral Woody': 'Floral',
  'Fruity Chypre': 'Fruity',
  'Fruity Floral': 'Fruity',
  'Fruit Oriental': 'Fruity',
  'Oriental Amber': 'Oriental',
  'Oriental Spicy': 'Oriental',
  'Oriental Floral': 'Oriental',
  'Oriental Musk': 'Oriental',
  'Oriental Vanilla': 'Oriental',
  'Oriental Woody': 'Oriental',
  'Spicy Amber': 'Spicy',
  'Spicy Oriental': 'Spicy',
  'Sweet Aromatic': 'Gourmand',
  'Amber Gourmand': 'Gourmand',
  Gourmand: 'Gourmand',
  'Vanilla Amber': 'Gourmand',
  Aromatic: 'Aromatic',
  Musky: 'Aromatic',
}

const AXES = ['Fresh', 'Aquatic', 'Woody', 'Oud', 'Oriental', 'Spicy', 'Floral', 'Fruity', 'Gourmand'] as const
type AxisName = (typeof AXES)[number]

const AXIS_COLORS: Record<AxisName, string> = {
  Fresh: '#06B6D4',
  Aquatic: '#0EA5E9',
  Woody: '#92400E',
  Oud: '#78350F',
  Oriental: '#D97706',
  Spicy: '#DC2626',
  Floral: '#DB2777',
  Fruity: '#7C3AED',
  Gourmand: '#B45309',
}

const AXIS_EMOJI: Record<AxisName, string> = {
  Fresh: '🌿',
  Aquatic: '🌊',
  Woody: '🪵',
  Oud: '🖤',
  Oriental: '✨',
  Spicy: '🌶️',
  Floral: '🌸',
  Fruity: '🍇',
  Gourmand: '🍯',
}

interface WheelData {
  axis: AxisName
  count: number
}

interface State {
  wheelData: WheelData[]
  total: number
  loading: boolean
  error: string | null
}

function PolarChart({
  wheelData,
  active,
  onAxisClick,
}: {
  wheelData: WheelData[]
  active: AxisName | null
  onAxisClick: (axis: AxisName) => void
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
    }
  })

  const polygonPath =
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

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
        <polygon key={i} points={pts} fill="none" stroke="var(--line)" strokeWidth={0.75} opacity={0.6} />
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
      <path d={polygonPath} fill="var(--accent)" fillOpacity={0.18} stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />

      {/* Active axis highlight */}
      {active &&
        (() => {
          const idx = wheelData.findIndex(d => d.axis === active)
          if (idx < 0) return null
          const p = points[idx]
          return (
            <line
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(p.angle)}
              y2={cy + maxR * Math.sin(p.angle)}
              stroke={AXIS_COLORS[active]}
              strokeWidth={2.5}
              opacity={1}
            />
          )
        })()}

      {/* Data points */}
      {points.map((p, i) => {
        const isActive = active === p.axis
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isActive ? 6 : 4}
            fill={AXIS_COLORS[p.axis]}
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
        const anchor =
          p.angle > Math.PI / 2 && p.angle < (3 * Math.PI) / 2
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
            fill={isActive ? AXIS_COLORS[p.axis] : 'var(--text-muted)'}
            style={{
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              userSelect: 'none',
              transition: 'fill 150ms',
            }}
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
        Your collection
      </text>
    </svg>
  )
}

export default function WheelClient() {
  const [state, setState] = useState<State>({
    wheelData: [],
    total: 0,
    loading: true,
    error: null,
  })
  const [active, setActive] = useState<AxisName | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadUserCollection()
  }, [])

  const loadUserCollection = async () => {
    try {
      const anonId = localStorage.getItem('scentral_anon_id')
      if (!anonId) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'User ID not found',
        }))
        return
      }

      const supabase = createClient()

      // Get user's collection
      const { data: collections, error: collError } = await supabase
        .from('collections')
        .select('fragrance_id')
        .eq('anon_id', anonId)

      if (collError) throw collError

      if (!collections || collections.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          wheelData: AXES.map(axis => ({ axis, count: 0 })),
          total: 0,
        }))
        return
      }

      const fragIds = collections.map(c => c.fragrance_id)

      // Get fragrance details for user's collection
      const { data: fragrances, error: fragError } = await supabase.from('fragrances').select('id, family').in('id', fragIds)

      if (fragError) throw fragError

      const axisCounts = new Map<AxisName, number>(AXES.map(a => [a, 0]))

      for (const frag of fragrances ?? []) {
        const family = frag.family ?? ''
        const axis = AXIS_MAP[family]
        if (axis && AXES.includes(axis as AxisName)) {
          const axisName = axis as AxisName
          axisCounts.set(axisName, (axisCounts.get(axisName) ?? 0) + 1)
        }
      }

      const total = fragrances?.length ?? 0
      const wheelData: WheelData[] = AXES.map(axis => ({
        axis,
        count: axisCounts.get(axis) ?? 0,
      }))

      setState({
        wheelData,
        total,
        loading: false,
        error: null,
      })

      track('wheel_loaded', {
        total_scents: total,
        axes_represented: wheelData.filter(d => d.count > 0).length,
      })
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load collection',
      }))
    }
  }

  const handleExportPNG = async () => {
    if (!wheelRef.current) return

    setIsExporting(true)
    try {
      // Find the SVG element and render it to canvas
      const svg = wheelRef.current.querySelector('svg')
      if (!svg) throw new Error('Chart not found')

      // Get SVG dimensions
      const svgRect = svg.getBoundingClientRect()
      const scale = 2

      // Create canvas with padding
      const padding = 40 * scale
      const canvas = document.createElement('canvas')
      canvas.width = svgRect.width * scale + padding * 2
      canvas.height = svgRect.height * scale + padding * 2

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      // Fill background
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#F7F3EE'
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Serialize SVG and render
      const svgClone = svg.cloneNode(true) as SVGElement
      const svgString = new XMLSerializer().serializeToString(svgClone)
      const img = new Image()

      img.onload = () => {
        ctx.drawImage(img, padding, padding, svgRect.width * scale, svgRect.height * scale)

        // Add title
        ctx.font = `bold ${28 * scale}px 'Instrument Serif', Georgia, serif`
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#1E1714'
        ctx.textAlign = 'left'
        ctx.fillText('Your Fragrance Wheel', padding, padding / 2)

        // Download
        canvas.toBlob(blob => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `fragrance-wheel-${new Date().toISOString().split('T')[0]}.png`
          link.click()
          URL.revokeObjectURL(url)
          setIsExporting(false)
          track('wheel_exported', { total_scents: state.total })
        })
      }

      img.onerror = () => {
        throw new Error('Failed to render chart')
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgString)
    } catch (err) {
      console.error('Export failed:', err)
      setState(prev => ({
        ...prev,
        error: 'Failed to export wheel as image',
      }))
      setIsExporting(false)
    }
  }

  if (state.loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '64px 20px' }}>
        <LoadingShimmer />
      </div>
    )
  }

  if (state.error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{state.error}</p>
          <button
            onClick={loadUserCollection}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-btn)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (state.total === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <EmptyState
          headline="Build your collection first"
          caption="Add fragrances to your collection to see your fragrance wheel."
          action={
            <a href="/discover" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              Explore fragrances
            </a>
          }
        />
      </div>
    )
  }

  const activeData = active ? state.wheelData.find(d => d.axis === active) : null
  const maxCount = Math.max(...state.wheelData.map(d => d.count), 1)
  const represented = state.wheelData.filter(d => d.count > 0).length

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* Hero */}
      <div style={{ padding: '32px 20px 20px', borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
          Your Fragrance Wheel
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 8 }}>
          Scent distribution
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
          {state.total} fragrances across {represented} scent families. Tap an axis to explore.
        </p>
      </div>

      {/* Radar chart */}
      <div
        ref={wheelRef}
        style={{ padding: '24px 16px 8px', background: 'var(--bg)' }}
      >
        <PolarChart wheelData={state.wheelData} active={active} onAxisClick={setActive} />
      </div>

      {/* Active axis detail */}
      {activeData && (
        <div style={{ margin: '8px 16px', padding: '16px', background: 'var(--color-surface)', border: `1px solid ${AXIS_COLORS[activeData.axis]}`, borderRadius: 'var(--r-card)', transition: 'all var(--motion-responsive)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{AXIS_EMOJI[activeData.axis]}</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: AXIS_COLORS[activeData.axis], fontStyle: 'italic' }}>
                {activeData.axis}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {activeData.count} fragrances · {Math.round((activeData.count / state.total) * 100)}% of your collection
              </p>
            </div>
          </div>

          {/* Strength bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(activeData.count / maxCount) * 100}%`,
                  background: AXIS_COLORS[activeData.axis],
                  borderRadius: 2,
                  transition: 'width var(--motion-ceremonial)',
                }}
              />
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

      {/* All axes breakdown */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          Collection breakdown
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...state.wheelData].sort((a, b) => b.count - a.count).map(d => {
            const pct = Math.round((d.count / state.total) * 100)
            const isActive = active === d.axis
            return (
              <button
                key={d.axis}
                onClick={() => setActive(prev => (prev === d.axis ? null : d.axis))}
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
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? AXIS_COLORS[d.axis] : 'var(--text)',
                    width: 72,
                    flexShrink: 0,
                    transition: 'color 150ms',
                  }}
                >
                  {d.axis}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--color-surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(d.count / maxCount) * 100}%`,
                      background: AXIS_COLORS[d.axis],
                      borderRadius: 3,
                      opacity: isActive ? 1 : 0.65,
                      transition: 'width var(--motion-ceremonial), opacity 150ms',
                    }}
                  />
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
      <GapAnalysis wheelData={state.wheelData} />

      {/* Export button */}
      <div style={{ padding: '24px 16px 0', display: 'flex', gap: 12 }}>
        <Button onClick={handleExportPNG} disabled={isExporting} variant="primary" className="flex-1">
          {isExporting ? 'Exporting...' : 'Share as PNG'}
        </Button>
        <Button onClick={loadUserCollection} variant="secondary" className="flex-1">
          Refresh
        </Button>
      </div>

      {/* CTA to discover */}
      <div style={{ padding: '12px 16px 0', textAlign: 'center' }}>
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
          Explore more →
        </Link>
      </div>
    </div>
  )
}

function GapAnalysis({ wheelData }: { wheelData: WheelData[] }) {
  const sorted = [...wheelData].sort((a, b) => b.count - a.count)
  const strong = sorted.slice(0, 2).filter(d => d.count > 0)
  const weak = sorted.slice(-2).filter(d => d.count === 0)

  let message = 'Your collection is diverse across scent families.'

  if (strong.length > 0 && weak.length > 0) {
    const strongText = strong.map(d => d.axis).join(' & ')
    const weakText = weak.map(d => d.axis).join(' & ')
    message = `You're strong in ${strongText}, but haven't explored ${weakText} yet.`
  } else if (strong.length > 0) {
    const strongText = strong.map(d => d.axis).join(' & ')
    message = `Your collection leans heavily toward ${strongText}.`
  }

  return (
    <div style={{ margin: '24px 16px 0', padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)' }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
        Your taste profile
      </p>
      <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.5 }}>
        {message}
      </p>
    </div>
  )
}
