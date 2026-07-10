'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ErrorInline from '@/components/ui/ErrorInline'
import { ArrowRight, MapPin, Wind, Thermometer, Droplets, Info } from 'lucide-react'

type Fragrance = {
  id: string
  brand: string
  name: string
  phase: number
  family: string
  projection: string
  anosmia_risk: string
  optimal_season: string
  heart_notes: string[]
  rating: number | null
  embedding: number[] | null
  has_embedding: boolean
}

type IntelligenceClientProps = {
  fragrances: Fragrance[]
}

// Radar Chart Helper
function getRadarPoint(value: number, angle: number, radius: number, centerX: number, centerY: number) {
  const x = centerX + radius * value * Math.cos(angle)
  const y = centerY + radius * value * Math.sin(angle)
  return `${x},${y}`
}

// ── SECTION 1: RADAR CHART ──────────────────────────────────────────────────

function CollectionRadar({ fragrances }: { fragrances: Fragrance[] }) {
  const total = fragrances.length
  
  const stats = useMemo(() => {
    // 1. Projection Power (% Beast Mode or Strong)
    const highProjection = fragrances.filter(f => ['Beast Mode', 'Strong'].includes(f.projection)).length
    const projectionPower = total > 0 ? highProjection / total : 0

    // 2. Anosmia Risk Index (% High risk)
    const highRisk = fragrances.filter(f => f.anosmia_risk === 'High').length
    const anosmiaRisk = total > 0 ? highRisk / total : 0

    // 3. Seasonal Versatility (% All-Year)
    const allYear = fragrances.filter(f => f.optimal_season === 'All-Year').length
    const seasonalVersatility = total > 0 ? allYear / total : 0

    // 4. Complexity (avg heart notes length, capped at 10)
    const avgHeartNotes = fragrances.reduce((acc, f) => acc + f.heart_notes.length, 0) / total
    const complexity = Math.min(1, avgHeartNotes / 10)

    // 5. Phase Balance (100% = perfect 33/33/33 split)
    const p1 = fragrances.filter(f => f.phase === 1).length / total
    const p2 = fragrances.filter(f => f.phase === 2).length / total
    const p3 = fragrances.filter(f => f.phase === 3).length / total
    const ideal = 1/3
    const phaseDeviation = (Math.abs(p1 - ideal) + Math.abs(p2 - ideal) + Math.abs(p3 - ideal)) / 1.33 // normalize to 0-1
    const phaseBalance = Math.max(0, 1 - phaseDeviation)

    return [projectionPower, anosmiaRisk, seasonalVersatility, complexity, phaseBalance]
  }, [fragrances, total])

  const labels = ['Projection', 'Risk', 'Versatility', 'Complexity', 'Balance']
  const size = 300
  const centerX = size / 2
  const centerY = size / 2
  const radius = 100

  const points = stats.map((v, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
    return getRadarPoint(v, angle, radius, centerX, centerY)
  }).join(' ')

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid */}
        {gridLevels.map(level => (
          <polygon
            key={level}
            points={labels.map((_, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
              return getRadarPoint(level, angle, radius, centerX, centerY)
            }).join(' ')}
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {labels.map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
          const p = getRadarPoint(1, angle, radius, centerX, centerY)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={p.split(',')[0]}
              y2={p.split(',')[1]}
              stroke="var(--line)"
              strokeWidth="0.5"
            />
          )
        })}
        {/* Data */}
        <polygon
          points={points}
          fill="var(--accent)"
          fillOpacity="0.2"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        {/* Labels */}
        {labels.map((label, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
          const p = getRadarPoint(1.2, angle, radius, centerX, centerY)
          const [lx, ly] = p.split(',')
          return (
            <text
              key={label}
              x={lx}
              y={ly}
              textAnchor="middle"
              className="text-[10px] font-bold uppercase tracking-widest fill-[var(--text-muted)]"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ── SECTION 2: BAR CHART ─────────────────────────────────────────────────────

function FamilyDistribution({ fragrances, onFilter }: { fragrances: Fragrance[], onFilter: (family: string | null) => void }) {
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {}
    fragrances.forEach(f => {
      counts[f.family] = (counts[f.family] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [fragrances])

  const max = Math.max(...distribution.map(d => d[1]))

  const getColor = (family: string) => {
    const primaryPhase = fragrances.find(f => f.family === family)?.phase || 2
    if (primaryPhase === 1) return 'var(--accent)'
    if (primaryPhase === 2) return 'var(--positive)'
    return 'var(--text-muted)'
  }

  return (
    <div className="space-y-4">
      {distribution.map(([family, count]) => (
        <button
          key={family}
          onClick={() => onFilter(family)}
          className="w-full text-left group"
        >
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              {family}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{count}</span>
          </div>
          <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--line)]">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${(count / max) * 100}%`,
                background: getColor(family)
              }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}

// ── SECTION 3: CLUSTER MAP ────────────────────────────────────────────────────

type ClusterPoint = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  name: string
  brand: string
  similarity?: number
}

function ResonanceMap({ fragrances, activeFamily }: { fragrances: Fragrance[], activeFamily: string | null }) {
  const [points, setPoints] = useState<ClusterPoint[]>([])
  const [hovered, setHovered] = useState<ClusterPoint | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function initCluster() {
      setLoading(true)
      const supabase = createClient()
      const anchors = fragrances
        .filter(f => f.has_embedding)
        .slice(0, 5)

      const matches = await Promise.all(
        anchors.map(a =>
          supabase.rpc('resonance_match', {
            query_embedding: a.embedding,
            match_threshold: 0.3,
            match_count: 4
          })
        )
      )

      const uniqueIds = new Set<string>()
      const clusterPoints: ClusterPoint[] = []

      matches.forEach((res, i) => {
        const anchor = anchors[i]
        if (!uniqueIds.has(anchor.id)) {
          uniqueIds.add(anchor.id)
          clusterPoints.push({
            id: anchor.id,
            x: Math.random() * 200,
            y: Math.random() * 200,
            vx: 0,
            vy: 0,
            radius: ((anchor.rating || 5) / 10) * 10 + 4,
            phase: anchor.phase,
            name: anchor.name,
            brand: anchor.brand
          })
        }

        res.data?.forEach((m: { id: string; name: string; brand: string; similarity?: number }) => {
          if (!uniqueIds.has(m.id)) {
            uniqueIds.add(m.id)
            const frag = fragrances.find(f => f.id === m.id)
            clusterPoints.push({
              id: m.id,
              x: Math.random() * 200,
              y: Math.random() * 200,
              vx: 0,
              vy: 0,
              radius: ((frag?.rating || 5) / 10) * 10 + 4,
              phase: frag?.phase || 2,
              name: m.name,
              brand: m.brand,
              similarity: m.similarity
            })
          }
        })
      })

      setPoints(clusterPoints)
      setLoading(false)
    }

    initCluster()
  }, [fragrances])

  // Simple force simulation
  useEffect(() => {
    if (loading || points.length === 0) return

    let frame: number
    const animate = () => {
      setPoints(prev => {
        const next = [...prev]
        const center = 150

        for (let i = 0; i < next.length; i++) {
          const a = next[i]
          
          // Pull to center
          a.vx += (center - a.x) * 0.001
          a.vy += (center - a.y) * 0.001

          for (let j = i + 1; j < next.length; j++) {
            const b = next[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const minHouseDist = a.radius + b.radius + 10

            if (dist < minHouseDist) {
              const force = (minHouseDist - dist) * 0.05
              const nx = dx / dist
              const ny = dy / dist
              a.vx -= nx * force
              a.vy -= ny * force
              b.vx += nx * force
              b.vy += ny * force
            }
          }

          a.x += a.vx
          a.y += a.vy
          a.vx *= 0.9
          a.vy *= 0.9
        }
        return next
      })
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [loading, points.length])

  return (
    <div ref={containerRef} className="relative aspect-square bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-20 h-20 rounded-full" 
            style={{ 
              background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite'
            }} 
          />
        </div>
      ) : (
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {points.map(p => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill={p.phase === 1 ? 'var(--accent)' : p.phase === 2 ? 'var(--positive)' : 'var(--text-muted)'}
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              onClick={() => setHovered(p)}
              opacity={activeFamily && fragrances.find(f => f.id === p.id)?.family !== activeFamily ? 0.2 : 1}
            />
          ))}
        </svg>
      )}

      {hovered && (
        <div 
          className="absolute bottom-4 left-4 right-4 bg-[var(--bg)] border border-[var(--accent)] p-3 shadow-xl animate-in fade-in slide-in-from-bottom-2"
          onClick={() => setHovered(null)}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{hovered.brand}</p>
          <p className="text-sm font-serif italic text-[var(--text)]">{hovered.name}</p>
          {hovered.similarity && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Resonance: {Math.round(hovered.similarity * 100)}%</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── SECTION 4: SEASONAL ROTATION ─────────────────────────────────────────────

function SeasonalPlanner({ fragrances }: { fragrances: Fragrance[] }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const plannerData = useMemo(() => {
    return MONTHS.map((month, i) => {
      const monthIndex = i + 1
      const isHighHeat = [6, 7, 8].includes(monthIndex)
      const isWinter = [10, 11, 12, 1, 2].includes(monthIndex)
      const isSpring = [3, 4, 5].includes(monthIndex)

      const eligible = fragrances.filter(f => {
        if (f.optimal_season === 'All-Year') return true
        if (f.optimal_season === 'High Heat' && isHighHeat) return true
        if (f.optimal_season === 'Winter/Fall' && isWinter) return true
        if (f.optimal_season === 'Spring/Summer' && isSpring) return true
        return false
      })

      return {
        month,
        top3: eligible.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
      }
    })
  }, [fragrances])

  return (
    <div className="overflow-x-auto -mx-6 px-6 pb-4 no-scrollbar">
      <div className="flex gap-4 min-w-max">
        {plannerData.map(({ month, top3 }) => (
          <div key={month} className="w-32 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-center py-2 border-b border-[var(--line)]">
              {month}
            </p>
            <div className="flex flex-col gap-1">
              {top3.map(f => (
                <div key={f.id} className="px-2 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-[10px] text-[var(--text)] truncate font-medium">
                  {f.name}
                </div>
              ))}
              {top3.length === 0 && <div className="h-6" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SECTION 5: DAILY BRIEF ────────────────────────────────────────────────────

type WeatherData = {
  current: { temperature_2m: number; relative_humidity_2m: number }
}

type AuraRecommendation = {
  id: string
  brand: string
  name: string
  similarity_score: number
}

function DailyBrief() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState<AuraRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBrief() {
      try {
        setLoading(true)
        
        // 1. Geolocation
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        const { latitude: lat, longitude: lon } = pos.coords

        // 2. Weather
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`)
        const weatherData: WeatherData = await weatherRes.json()
        setWeather(weatherData)

        // 3. Preferences
        const useCases = JSON.parse(localStorage.getItem('scentral-use-cases') || '["Daily wear"]')

        // 4. AURA API
        const auraRes = await fetch('/api/aura', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            use_case: useCases[0].toLowerCase(),
            weather: {
              temp_c: weatherData.current.temperature_2m,
              humidity: weatherData.current.relative_humidity_2m
            }
          })
        })
        const auraData = await auraRes.json()
        if (auraData.results?.[0]) {
          setRecommendation(auraData.results[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Brief generation failed')
      } finally {
        setLoading(false)
      }
    }

    fetchBrief()
  }, [])

  if (loading) return (
    <div 
      className="h-40 w-full rounded-[var(--r-card)]" 
      style={{ 
        background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite'
      }} 
    />
  )
  if (error) return <ErrorInline message={error} />

  return (
    <Card className="border-[var(--accent)] bg-[var(--surface)] overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Info size={40} className="text-[var(--accent)]" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest">
            <MapPin size={12} />
            Daily Brief
          </div>
          {weather && (
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Thermometer size={10} />{Math.round(weather.current.temperature_2m)}°C</span>
              <span className="flex items-center gap-1"><Droplets size={10} />{weather.current.relative_humidity_2m}%</span>
            </div>
          )}
        </div>

        {recommendation ? (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Suggested Wear</p>
              <h3 className="text-xl font-serif italic text-[var(--text)] mt-1">
                {recommendation.brand} <span className="text-[var(--accent)]">{recommendation.name}</span>
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                  {recommendation.similarity_score}%
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">AURA Match</span>
              </div>
              
              <Link 
                href={`/lab?anchor=${recommendation.id}`}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:translate-x-1 transition-transform"
              >
                Send to Atelier <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">AURA couldn&apos;t find a recommendation for today&apos;s conditions.</p>
        )}
      </div>
    </Card>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function IntelligenceClient({ fragrances }: IntelligenceClientProps) {
  const [activeFamily, setActiveFamily] = useState<string | null>(null)

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] pb-24">
      <header className="px-6 pt-12 pb-8 border-b border-[var(--line)]">
        <h1 className="text-4xl font-serif italic tracking-tight">Intelligence</h1>
        <p className="text-sm text-[var(--text-muted)] font-light mt-2">Surface deep patterns across your collection.</p>
      </header>

      <main className="px-6 py-10 space-y-16">
        
        {/* Radar & Distro Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--line)] pb-2">Wardrobe Archetype</h2>
            <CollectionRadar fragrances={fragrances} />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--line)] pb-2">Family Saturation</h2>
            <FamilyDistribution fragrances={fragrances} onFilter={setActiveFamily} />
          </div>
        </section>

        {/* Resonance Map */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--line)] pb-2">Resonance Cluster</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <ResonanceMap fragrances={fragrances} activeFamily={activeFamily} />
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text)] flex items-center gap-2">
                  <Wind size={14} className="text-[var(--accent)]" />
                  Cluster Logic
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Dots placed closer together share similar olfactory DNA detected by the **pgvector 3072 Resonance Engine**.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> <span>Phase 1: Anchor</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--positive)]" /> <span>Phase 2: Modulator</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" /> <span>Phase 3: Top</span>
                  </div>
                </div>
                {activeFamily && (
                  <Button variant="secondary" className="w-full mt-4" onClick={() => setActiveFamily(null)}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Planner */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--line)] pb-2">Rotation Planner</h2>
          <SeasonalPlanner fragrances={fragrances} />
        </section>

        {/* Daily Brief */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--line)] pb-2">AURA Context</h2>
          <DailyBrief />
        </section>

      </main>
    </div>
  )
}
