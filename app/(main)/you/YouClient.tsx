'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { calculateEngagement, formatDate as formatRelativeDate } from '@/lib/engagement'
import { useSavedCombinations } from '@/hooks/useSavedCombinations'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import AuthSheet from '@/components/auth/AuthSheet'
import ProfileCard from './ProfileCard'
import InsightsPanel, { type WeekWearEntry, type SavedCombination } from './InsightsPanel'
import YourContributions from '@/components/feedback/YourContributions'
import { getPersonaById, type Persona } from '@/lib/personas'
import { calculateIdentityScore, type IdentityScore } from '@/lib/identityScore'
import NoseReportSheet from '@/components/ui/NoseReportSheet'

export type { WeekWearEntry, SavedCombination }
import { track } from '@/lib/posthog'

export type YouClientProps =
  | { state: 'signed-out' }
  | {
      state: 'signed-in'
      email: string
      weekWear: WeekWearEntry[]
      ownedCount: number
      saves?: SavedCombination[]
      fetchError?: string | null
    }

export default function YouClient(props: YouClientProps) {
  const router = useRouter()
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [signingOut, startSignOut] = useTransition()

  // Persona & Engagement
  const [mounted, setMounted] = useState(false)
  const [vibe, setVibe] = useState<string | null>(null)
  const [engagement, setEngagement] = useState({ isWornToday: false, isAtRisk: false, streak: 0 })

  // Stats
  const [weekWear, setWeekWear] = useState<WeekWearEntry[]>(props.state === 'signed-in' ? props.weekWear : [])
  const [ownedCount, setOwnedCount] = useState(props.state === 'signed-in' ? props.ownedCount : 0)
  const [auraStreak, setAuraStreak] = useState(0)
  const [localPersona, setLocalPersona] = useState<Persona | null>(null)
  const [localCollectionCount, setLocalCollectionCount] = useState(0)
  const [localScentHistory, setLocalScentHistory] = useState<{ fragranceId: string; brand: string; name: string; loggedAt: string }[]>([])
  const [identityScore, setIdentityScore] = useState<IdentityScore | null>(null)
  
  // Nose Report
  const [noseReportData, setNoseReportData] = useState<any>(null)

  // Fetch saved combinations
  const userId = props.state === 'signed-in' ? (props.email ? 'user-id' : null) : null
  const { saves, fetchError } = useSavedCombinations(userId)

  // Initialize persona & engagement on mount
  useEffect(() => {
    setVibe(localStorage.getItem('scentral_vibe'))
    setEngagement(calculateEngagement())
    setMounted(true)

    const personaId = localStorage.getItem('scentral_persona')
    if (personaId) {
      const p = getPersonaById(personaId)
      if (p) setLocalPersona(p)
    }

    const supabase = createClient()

    try {
      const col: string[] = JSON.parse(localStorage.getItem('scentral_collection') ?? '[]')
      setLocalCollectionCount(col.length)
      if (col.length > 0) {
        // Fetch families for identity score
        supabase.from('fragrances').select('family').in('id', col).then(({ data }) => {
          if (data) {
            const families = data.map(f => f.family).filter(Boolean) as string[]
            setIdentityScore(calculateIdentityScore(families))
          }
        })
      }
    } catch {
      // best-effort
    }

    // Aura Spritz Schedule streak & Nose Report
    const anonId = localStorage.getItem('scentral_anon_id')
    if (anonId) {
      ;(async () => {
        try {
          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak')
            .eq('anon_id', anonId)
            .maybeSingle()
          setAuraStreak(streakData?.current_streak ?? 0)

          const { data: logs } = await supabase
            .from('wear_logs')
            .select('fragrance_id, logged_at, fragrances ( brand, name )')
            .eq('user_id', anonId)
            .order('logged_at', { ascending: false })
            
          if (logs && logs.length > 0) {
            setLocalScentHistory(
              logs.slice(0, 7).map((log: any) => ({
                fragranceId: log.fragrance_id,
                brand: log.fragrances?.brand ?? 'Unknown',
                name: log.fragrances?.name ?? 'Unknown',
                loggedAt: log.logged_at,
              }))
            )
          }

          // Nose Report logic
          const date = new Date()
          const currentMonthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()
          const lastReport = localStorage.getItem('scentral_last_nose_report')
          
          if (lastReport !== currentMonthYear && logs && logs.length > 0) {
            // Check if they have wears *this month*
            const thisMonthLogs = logs.filter((l: any) => new Date(l.logged_at).getMonth() === date.getMonth())
            if (thisMonthLogs.length > 0) {
              const countMap = new Map<string, { count: number, name: string, brand: string }>()
              thisMonthLogs.forEach((l: any) => {
                const existing = countMap.get(l.fragrance_id)
                if (existing) {
                  existing.count++
                } else {
                  countMap.set(l.fragrance_id, { count: 1, name: l.fragrances?.name, brand: l.fragrances?.brand })
                }
              })
              let mostWorn = { count: 0, name: '', brand: '' }
              countMap.forEach(v => { if (v.count > mostWorn.count) mostWorn = v })

              // Unworn calculation
              let unwornName = null
              try {
                const col: string[] = JSON.parse(localStorage.getItem('scentral_collection') ?? '[]')
                const wornIds = new Set(logs.map((l: any) => l.fragrance_id))
                const unwornIds = col.filter(id => !wornIds.has(id))
                if (unwornIds.length > 0) {
                  const { data: unwornData } = await supabase.from('fragrances').select('name').eq('id', unwornIds[0]).single()
                  if (unwornData) unwornName = unwornData.name
                }
              } catch {}

              setNoseReportData({
                monthYear: currentMonthYear,
                wornsThisMonth: thisMonthLogs.length,
                mostWornName: mostWorn.name,
                mostWornBrand: mostWorn.brand,
                dominantPersonaId: personaId,
                longestStreak: streakData?.longest_streak ?? streakData?.current_streak ?? 0,
                unwornName
              })
            } else if (logs.length > 0) {
               // They have logs, but none this month. Maybe set report so it doesn't keep checking?
               // Let's not trigger it if they have 0 wears this month to avoid "0 wears" empty states
               localStorage.setItem('scentral_last_nose_report', currentMonthYear)
            }
          }
        } catch {
          // best-effort
        }
      })()
    }
  }, [])

  // Fetch stats when signed in
  useEffect(() => {
    if (props.state !== 'signed-in') return

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
        const counts: Record<string, { brand: string; name: string; count: number }> = {}
        logs.forEach((log: any) => {
          const fid = log.collections?.fragrance_id
          if (!fid) return
          if (!counts[fid]) {
            counts[fid] = {
              brand: log.collections.fragrances?.brand ?? 'Unknown',
              name: log.collections.fragrances?.name ?? 'Unknown',
              count: 0,
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

  useEffect(() => {
    track('profile_tab_viewed', { section: 'main_profile', signed_in: props.state === 'signed-in' })
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

  function handleVibeChange(newVibe: string) {
    setVibe(newVibe)
  }

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))' }}>
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
      <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))' }}>
        <div className="px-4 pt-8 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
          {auraStreak > 0 && (
            <Link href="/spritz" style={{ fontSize: 13, fontWeight: 700, color: 'var(--xp-color)' }}>
              🔥 {auraStreak}-day streak
            </Link>
          )}
        </div>

        {!localPersona ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px', fontStyle: 'italic', marginBottom: 16 }}>
              Your identity is waiting.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '20px', maxWidth: 320, marginBottom: 32 }}>
              Take the 2-minute quiz to discover your scent identity.
            </p>
            <Link href="/onboarding" style={{ width: '100%', maxWidth: 280 }}>
              <Button fullWidth>Find Your Base Note →</Button>
            </Link>
          </div>
        ) : (
          <div className="px-4 py-6 flex flex-col gap-6">
            <div
              className="relative rounded-[16px] p-5 overflow-hidden shadow-sm border"
              style={{
                background: localPersona.ui_theme.cardBg,
                borderColor: `${localPersona.ui_theme.accentColor}30`,
                borderLeft: `4px solid ${localPersona.ui_theme.accentColor}`,
              }}
            >
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                Your Scent Identity
              </p>
              <p style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: localPersona.ui_theme.accentColor, marginTop: 4 }}>
                {localPersona.name}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text)', marginTop: 4, lineHeight: '20px' }}>
                {localPersona.narrative.tagline}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {localPersona.scent_spectrum.base.slice(0, 3).map((note) => (
                  <span key={note} style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                    {note}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{localCollectionCount} in collection</span>
                {auraStreak > 0 && <span>🔥 {auraStreak}-day streak</span>}
                {localScentHistory[0] && <span>Last worn {formatRelativeDate(localScentHistory[0].loggedAt)}</span>}
              </div>

              {localCollectionCount >= 3 && localCollectionCount < 5 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Your identity is still forming. Add {5 - localCollectionCount} more to unlock your full score.
                  </p>
                  <div style={{ height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--surface-2)', display: 'flex' }}>
                    <div style={{ width: `${(localCollectionCount / 5) * 100}%`, background: localPersona.ui_theme.accentColor }} />
                  </div>
                </div>
              )}

              {localCollectionCount >= 5 && identityScore && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Your scent identity score</p>

                  {/* Identity bar */}
                  <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
                    <div style={{ width: `${identityScore.topPercent}%`, background: identityScore.topPersona.ui_theme.accentColor }} />
                    <div style={{ width: `${identityScore.secondPercent}%`, background: identityScore.secondPersona.ui_theme.accentColor, opacity: 0.6 }} />
                    <div style={{ flex: 1, background: 'var(--line)' }} />
                  </div>

                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
                    {identityScore.topPercent}% {identityScore.topPersona.name.replace('The ', '')}, {identityScore.secondPercent}% {identityScore.secondPersona.name.replace('The ', '')}.
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on {identityScore.collectionCount} fragrances in your collection.</p>

                  <button style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                    Share your identity →
                  </button>
                </div>
              )}

              <Link
                href={`/discover?persona=${localPersona.id}`}
                style={{ display: 'inline-block', marginTop: 16, fontSize: 13, fontWeight: 600, color: localPersona.ui_theme.accentColor }}
              >
                Explore your {localPersona.name} fragrances →
              </Link>
            </div>

            {localScentHistory.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 12 }}>
                  Your Scent History
                </p>
                <div className="flex flex-col gap-3">
                  {localScentHistory.map((entry, i) => (
                    <div key={`${entry.fragranceId}-${i}`} className="flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)' }}>
                        {entry.brand} {entry.name}
                      </p>
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                        {formatRelativeDate(entry.loggedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-6 pb-8">
          <YourContributions />
        </div>

        <AuthSheet
          open={authSheetOpen}
          onClose={() => setAuthSheetOpen(false)}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/you` : '/auth/confirm?next=/you'}
        />
      </div>
    )
  }

  const { email } = props

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', color: 'var(--text)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
        {auraStreak > 0 && (
          <Link href="/spritz" style={{ fontSize: 13, fontWeight: 700, color: 'var(--xp-color)' }}>
            🔥 {auraStreak}-day streak
          </Link>
        )}
      </div>

      {/* Nav Links */}
      <div className="px-4 py-3 flex gap-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <Link href="/wear-and-share" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-75 transition-opacity">
          The Strip
        </Link>
        <Link href="/creator" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-75 transition-opacity">
          Creator Studio
        </Link>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Profile Section — Persona, Vibe, Settings */}
        <ProfileCard
          email={email}
          vibe={vibe}
          onVibeChange={handleVibeChange}
          onSignOut={handleSignOut}
          signingOut={signingOut}
          onReset={handleReset}
        />

        {/* Insights — Wear history, Wishlist, Saved combos, Rotation */}
        <InsightsPanel
          saves={saves as SavedCombination[]}
          fetchError={fetchError}
          weekWear={weekWear}
          ownedCount={ownedCount}
          isWornToday={engagement.isWornToday}
          isAtRisk={engagement.isAtRisk}
          streak={engagement.streak}
        />

        <YourContributions />
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />

      {noseReportData && (
        <NoseReportSheet
          isOpen={true}
          onClose={() => {
            setNoseReportData(null)
            localStorage.setItem('scentral_last_nose_report', noseReportData.monthYear)
          }}
          {...noseReportData}
        />
      )}
    </div>
  )
}
