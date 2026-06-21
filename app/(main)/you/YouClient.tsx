'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getPersonaById } from '@/lib/personas'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import AuthSheet from '@/components/auth/AuthSheet'
import ThemeToggle from '@/components/ThemeToggle'
import WardrobeIntelligence from './WardrobeIntelligence'

export type SavedCombination = {
  id: string
  name: string | null
  occasion: string | null
  created_at: string | null
  base_sprays: number | null
  top_sprays: number | null
  base_frag: { brand: string; name: string } | null
  top_frag: { brand: string; name: string } | null
}

export type WeekWearEntry = {
  fragrance_id: string
  brand: string
  name: string
  count: number
}

export type WishlistFragrance = {
  id: string
  brand: string
  name: string
  image_url: string | null
}

export type YouClientProps =
  | { state: 'signed-out' }
  | { state: 'signed-in'; email: string; saves: SavedCombination[]; fetchError: string | null; weekWear: WeekWearEntry[]; ownedCount: number }

type Persona = {
  name: string
  narrative: { tagline: string }
  ui_theme: { cardBg: string; accentColor: string }
}

type EngagementState = {
  isWornToday: boolean
  isAtRisk: boolean
  streak: number
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}

function SavedItem({ combo }: { combo: SavedCombination }) {
  const baseName = combo.base_frag?.name ?? null
  const topName = combo.top_frag?.name ?? null
  const displayPair =
    baseName && topName
      ? `${baseName} → ${topName}`
      : combo.name ?? 'Formulation'

  const meta = [
    combo.occasion ? combo.occasion.charAt(0).toUpperCase() + combo.occasion.slice(1) : null,
    formatDate(combo.created_at),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card>
      <p style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '20px' }}>
        {displayPair}
      </p>
      {meta && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{meta}</p>
      )}
    </Card>
  )
}

const ENVIRONMENTS = ['Office', 'WFH', 'Outdoor', 'Creative', 'Client-facing'] as const
const USE_CASES = ['Daily wear', 'Date night', 'Work', 'Sport', 'Evening out', 'Travel', 'Formal', 'Casual'] as const

type WeatherData = { city: string; temp: number; humidity: number }

function ScentProfile() {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('loading')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<string>('')
  const [useCases, setUseCases] = useState<string[]>([])

  // Hydrate localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setEnvironment(localStorage.getItem('scentral-environment') ?? '')
    try {
      const stored = localStorage.getItem('scentral-use-cases')
      if (stored) setUseCases(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  // Request geolocation + fetch weather on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`),
          ])
          const [weatherJson, geoJson] = await Promise.all([weatherRes.json(), geoRes.json()])
          const city =
            geoJson.address?.city ??
            geoJson.address?.town ??
            geoJson.address?.village ??
            geoJson.address?.county ??
            'Unknown'
          setWeather({ city, temp: weatherJson.current.temperature_2m, humidity: weatherJson.current.relative_humidity_2m })
          setGeoStatus('ok')
        } catch {
          setGeoStatus('error')
          setGeoError('Unable to fetch weather')
        }
      },
      () => {
        setGeoStatus('error')
        setGeoError('Location access denied')
      },
      { timeout: 10000 }
    )
  }, [])

  function selectEnvironment(env: string) {
    setEnvironment(env)
    localStorage.setItem('scentral-environment', env)
  }

  function toggleUseCase(uc: string) {
    setUseCases(prev => {
      const next = prev.includes(uc) ? prev.filter(x => x !== uc) : [...prev, uc]
      localStorage.setItem('scentral-use-cases', JSON.stringify(next))
      return next
    })
  }

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Scent Profile
      </p>

      {/* Current conditions */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Current conditions</p>
        {geoStatus === 'loading' && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Detecting location…</p>
        )}
        {geoStatus === 'ok' && weather && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{weather.city}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{weather.temp}°C · {weather.humidity}% humidity</span>
          </div>
        )}
        {geoStatus === 'error' && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{geoError}</p>
        )}
      </div>

      {/* Work environment — single-select */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Work environment</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ENVIRONMENTS.map(env => (
            <Chip key={env} selected={environment === env} onClick={() => selectEnvironment(env)}>
              {env}
            </Chip>
          ))}
        </div>
      </div>

      {/* Use cases — multi-select */}
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Preferred use cases</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {USE_CASES.map(uc => (
            <Chip key={uc} selected={useCases.includes(uc)} onClick={() => toggleUseCase(uc)}>
              {uc}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

function RotationIntelligence({ weekWear, ownedCount }: { weekWear: WeekWearEntry[]; ownedCount: number }) {
  if (weekWear.length === 0) return null

  const top = weekWear[0]
  const anosmiaCandidates = weekWear.filter(w => w.count >= 3)
  const neverWornCount = Math.max(0, ownedCount - weekWear.length)

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Rotation Intelligence
      </p>

      <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Most worn this week</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 2 }}>
            {top.brand} {top.name}
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'var(--accent)',
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 999, padding: '3px 10px', flexShrink: 0,
        }}>
          {top.count}&times;
        </span>
      </div>

      {anosmiaCandidates.length > 0 && (
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-start gap-2">
            <span style={{ fontSize: 14, lineHeight: '20px', color: '#d97706', flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Anosmia risk</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {anosmiaCandidates.map(w => `${w.name} (${w.count}×)`).join(', ')} — worn too frequently this week
              </p>
            </div>
          </div>
        </div>
      )}

      {neverWornCount > 0 && (
        <div className="flex items-center justify-between" style={{ padding: '10px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Never worn</p>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>
            {neverWornCount} {neverWornCount === 1 ? 'fragrance' : 'fragrances'}
          </span>
        </div>
      )}
    </div>
  )
}

function SettingsSection({ email, onSignOut, signingOut, onReset }: { email: string; onSignOut: () => void; signingOut: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-1" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Settings
      </p>

      {/* Account email */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Account</p>
        <p style={{ fontSize: 13, color: 'var(--text)', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </p>
      </div>

      {/* Push Notifications toggle */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Push notifications</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Maceration alerts & streak protection</p>
        </div>
        <button
          onClick={async () => {
            try {
              const { registerPush } = await import('@/lib/push')
              await registerPush()
              alert('Push notifications enabled!')
            } catch (e: any) {
              alert('Failed to enable push: ' + e.message)
            }
          }}
          style={{ padding: '6px 12px', fontSize: 12, borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
        >
          Enable
        </button>
      </div>

      {/* Affiliate disclosure toggle — non-functional placeholder */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)', opacity: 0.45 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Affiliate disclosure</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Show when content is sponsored</p>
        </div>
        {/* Toggle pill — non-functional, coming post-MVP */}
        <div
          aria-hidden="true"
          style={{ width: 40, height: 22, borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--line)', position: 'relative', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: '50%', background: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Dark mode toggle */}
      <div style={{ borderBottom: '1px solid var(--line)', paddingTop: 8, paddingBottom: 8 }}>
        <ThemeToggle />
      </div>

      {/* Reset preferences */}
      <button
        onClick={onReset}
        className="text-left py-3 w-full transition-colors"
        style={{ fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
      >
        Reset my preferences
      </button>

      {/* AnotherSense Pro */}
      <div className="flex flex-col">
        <Link href="/pro" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          ✦ Unlock AnotherSense Pro
        </Link>
      </div>

      {/* Legal Links */}
      <div className="flex flex-col">
        <Link href="/privacy" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
          Terms of Service
        </Link>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        disabled={signingOut}
        className="text-left py-3 transition-colors"
        style={{ fontSize: 14, color: signingOut ? 'var(--text-muted)' : 'var(--danger)', background: 'none', border: 'none', cursor: signingOut ? 'not-allowed' : 'pointer' }}
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

function EngagementPrompt({ engagement }: { engagement: EngagementState }) {
  if (engagement.isWornToday) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Worn today · <span style={{ color: 'var(--text)' }}>{engagement.streak} day streak</span>
        </p>
      </div>
    )
  }

  if (engagement.isAtRisk) {
    return (
      <div 
        className="p-4 rounded-xl border mb-6 animate-pulse" 
        style={{ background: '#fffbeb', borderColor: '#fef3c7', borderLeft: '4px solid #d97706' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          At Risk
        </p>
        <p style={{ fontSize: 13, color: '#92400e', marginTop: 2 }}>
          Keep your {engagement.streak} day streak alive. Log a wear before midnight.
        </p>
      </div>
    )
  }

  return null
}

function PersonaCard({ persona }: { persona: Persona }) {
  const router = useRouter()
  return (
    <div
      className="relative rounded-[16px] p-5 mb-2 overflow-hidden shadow-sm border"
      style={{
        background: persona.ui_theme.cardBg,
        borderColor: `${persona.ui_theme.accentColor}30`,
        borderLeft: `4px solid ${persona.ui_theme.accentColor}`,
        '--persona-accent': persona.ui_theme.accentColor,
      } as React.CSSProperties}
    >
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
        Your Scent Identity
      </p>
      <p style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 4 }}>
        {persona.name}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: '18px' }}>
        {persona.narrative.tagline}
      </p>
      <button 
        onClick={() => router.push('/onboarding')}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: 0, 
          fontSize: 11, 
          color: 'var(--text-muted)', 
          marginTop: 12, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
        className="hover:opacity-70 transition-opacity"
      >
        Retake profiler <span style={{ color: 'var(--persona-accent)' }}>→</span>
      </button>
    </div>
  )
}

function StatTiles({ ownedCount, weekWear }: { ownedCount: number; weekWear: WeekWearEntry[] }) {
  const totalWears = weekWear.reduce((sum, e) => sum + e.count, 0)
  const topPick = weekWear[0]?.name ?? '—'
  const displayTopPick = topPick.length > 12 ? topPick.slice(0, 12) + '...' : topPick

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: 12
    }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{ownedCount}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>Bottles</p>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{totalWears}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>This week</p>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{displayTopPick}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>Top pick</p>
      </div>
    </div>
  )
}

export default function YouClient(props: YouClientProps) {
  const router = useRouter()
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [signingOut, startSignOut] = useTransition()

  const [wishlistItems, setWishlistItems] = useState<WishlistFragrance[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [vibe, setVibe] = useState<string | null>(null)

  const [mounted, setMounted] = useState(false)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [engagement, setEngagement] = useState<EngagementState>({
    isWornToday: false,
    isAtRisk: false,
    streak: 0
  })

  useEffect(() => {
    setVibe(localStorage.getItem('scentral_vibe'))

    // 1. Persona
    const storedPersona = localStorage.getItem('scentral_persona')
    if (storedPersona) {
      const p = getPersonaById(storedPersona)
      if (p) {
        setPersona(p)
      }
    }

    // 2. Engagement & Streak
    const now = new Date()
    const lastWearRaw = localStorage.getItem('scentral_last_wear')
    const lastWearDate = lastWearRaw ? new Date(lastWearRaw) : null
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const isWornToday = lastWearDate ? lastWearDate >= startOfToday : false
    const currentHour = now.getHours()
    
    const storedStreak = parseInt(localStorage.getItem('scentral_streak') || '0', 10)
    
    setEngagement({
      isWornToday,
      isAtRisk: !isWornToday && currentHour >= 18,
      streak: storedStreak
    })

    setMounted(true)
  }, [])

  const [weekWear, setWeekWear] = useState<WeekWearEntry[]>(props.state === 'signed-in' ? props.weekWear : [])
  const [ownedCount, setOwnedCount] = useState(props.state === 'signed-in' ? props.ownedCount : 0)
  const [totalWearsMonth, setTotalWearsMonth] = useState(0)

  useEffect(() => {
    if (props.state !== 'signed-in') return

    // Fetch wishlist (existing)
    const storedWishlist = localStorage.getItem('scentral_wishlist')
    if (storedWishlist) {
      try {
        const ids: string[] = JSON.parse(storedWishlist)
        if (ids.length > 0) {
          const fetchWishlist = async () => {
            setLoadingWishlist(true)
            const supabase = createClient()
            const { data } = await supabase
              .from('fragrances')
              .select('id, brand, name, image_url')
              .in('id', ids)
            if (data) setWishlistItems(data)
            setLoadingWishlist(false)
          }
          fetchWishlist()
        }
      } catch (e) {
        console.error('Error parsing wishlist', e)
      }
    }

    // Fetch wear logs and collection count
    const fetchStats = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Owned count
      const { count } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'owned')
      
      setOwnedCount(count ?? 0)

      // Total wears this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count: monthCount } = await supabase
        .from('wear_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('logged_at', startOfMonth.toISOString())
      
      setTotalWearsMonth(monthCount ?? 0)

      // Recent wear logs (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: logs } = await supabase
        .from('wear_logs')
        .select(`
          id,
          logged_at,
          collections (
            fragrance_id,
            fragrances ( brand, name )
          )
        `)
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false })

      if (logs) {
        const counts: Record<string, { brand: string, name: string, count: number }> = {}
        logs.forEach((log: any) => {
          const fid = log.collections?.fragrance_id
          if (!fid) return
          if (!counts[fid]) {
            counts[fid] = {
              brand: log.collections.fragrances?.brand ?? 'Unknown',
              name: log.collections.fragrances?.name ?? 'Unknown',
              count: 0
            }
          }
          counts[fid].count++
        })

        const aggregated = Object.entries(counts)
          .map(([id, info]) => ({ fragrance_id: id, ...info }))
          .sort((a, b) => b.count - a.count)

        setWeekWear(aggregated)
      }
    }
    
    fetchStats()
  }, [props.state])

  function handleSignOut() {
    startSignOut(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
    })
  }

  function handleReset() {
    localStorage.removeItem('scentral_onboarded')
    localStorage.removeItem('scentral_vibe')
    router.push('/onboarding')
  }

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
        <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
        </div>
        <div className="px-4 py-6">
          <LoadingShimmer variant="card" />
        </div>
      </div>
    )
  }

  if (props.state === 'signed-out') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
        <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
        </div>

        <div className="px-6 py-8 animate-up">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', lineHeight: '28px' }}>
            See your scent profile.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: '20px' }}>
            Sign in to track what you wear, save combinations, and see patterns in your collection.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {[
              { label: 'THIS WEEK', value: 'Lattafa Asad', sub: 'Most reached for · 4 wears' },
              { label: 'STREAK', value: '7 days', sub: "You've worn something every day this week" },
              { label: 'SAVED', value: '3 combinations', sub: "Asad → Bade'e Al Oud · Office · 2 days ago" }
            ].map((card, i) => (
              <Card 
                key={i} 
                style={{ 
                  padding: '14px 16px', 
                  opacity: 0.45, 
                  pointerEvents: 'none', 
                  userSelect: 'none', 
                  filter: 'blur(2px)' 
                }}
              >
                <p style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {card.label}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', marginTop: 2 }}>
                  {card.value}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {card.sub}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Button fullWidth onClick={() => setAuthSheetOpen(true)}>
              Sign in to see yours
            </Button>
            <p className="mt-3 text-center" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              No account needed to browse —{' '}
              <Link href="/discover" className="hover:underline transition-all" style={{ color: 'var(--accent)' }}>
                Explore scents →
              </Link>
            </p>
          </div>
        </div>

        <AuthSheet
          open={authSheetOpen}
          onClose={() => setAuthSheetOpen(false)}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/you` : '/auth/confirm?next=/you'}
        />
      </div>
    )
  }

  const { email, saves, fetchError } = props

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6">
        {persona && <PersonaCard persona={persona} />}
        <EngagementPrompt engagement={engagement} />
        
        <StatTiles ownedCount={ownedCount} weekWear={weekWear} />

        {/* My Vibe */}
        <section>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            MY VIBE
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'warm', label: 'Warm & Rich' },
              { key: 'fresh', label: 'Fresh & Clean' },
              { key: 'bold', label: 'Bold & Lasting' },
              { key: 'soft', label: 'Light & Subtle' },
            ].map((opt) => (
              <Chip
                key={opt.key}
                selected={vibe === opt.key}
                onClick={() => {
                  localStorage.setItem('scentral_vibe', opt.key)
                  setVibe(opt.key)
                }}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
          <button
            onClick={handleReset}
            style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
          >
            Reset onboarding
          </button>
        </section>

        {/* Weekly Stats Section */}
        <section>
          <div className="mb-6">
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              THIS WEEK
            </p>
            {weekWear.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {weekWear.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.fragrance_id}
                    style={{
                      minWidth: 140,
                      flexShrink: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-card)',
                      padding: 12
                    }}
                  >
                    <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                      0{idx + 1}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
                      {item.brand}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', lineHeight: '18px', marginTop: 2, height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.count} {item.count === 1 ? 'wear' : 'wears'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                headline="Your scent trail starts here"
                caption="Log a wear on any bottle to begin tracking your rotation."
              />
            )}
          </div>

          {/* Wishlist Section */}
          <div className="mb-6">
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              MY WISHLIST
            </p>
            {loadingWishlist ? (
              <LoadingShimmer variant="line" />
            ) : wishlistItems.length === 0 ? (
              <EmptyState 
                headline="Your wishlist is empty" 
                caption="Heart a fragrance in the catalogue to save it for later."
                action={<Button variant="secondary" onClick={() => router.push('/discover')}>Explore Catalogue</Button>}
              />
            ) : (
              <div className="flex flex-col">
                {wishlistItems.map((item) => (
                  <Link 
                    key={item.id}
                    href={`/collection/${item.id}`}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: '12px 0', 
                      borderBottom: '1px solid var(--line)',
                      textDecoration: 'none'
                    }}
                  >
                    <Image 
                      src={item.image_url ?? '/placeholder-bottle.png'} 
                      alt={item.name} 
                      width={48} 
                      height={48} 
                      style={{ objectFit: 'contain', borderRadius: 8 }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {item.brand}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', marginTop: 2 }}>
                        {item.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Saved list */}
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Saved ({saves.length})
          </p>

          {fetchError ? (
            <ErrorInline message={fetchError} />
          ) : saves.length === 0 ? (
            <EmptyState
              headline="No saves yet."
              caption="Formulate a pairing in the Lab and save it here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {saves.map(combo => (
                <SavedItem key={combo.id} combo={combo} />
              ))}
            </div>
          )}
        </div>

        {/* Rotation Intelligence */}
        <RotationIntelligence weekWear={weekWear} ownedCount={ownedCount} />

        {/* Wardrobe Intelligence */}
        <WardrobeIntelligence />

        {/* Scent Profile */}
        <ScentProfile />

        {/* Settings */}
        <SettingsSection
          email={email}
          onSignOut={handleSignOut}
          signingOut={signingOut}
          onReset={handleReset}
        />
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
