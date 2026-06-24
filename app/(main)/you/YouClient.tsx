'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { calculateEngagement } from '@/lib/engagement'
import { useSavedCombinations } from '@/hooks/useSavedCombinations'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import AuthSheet from '@/components/auth/AuthSheet'
import ProfileCard from './ProfileCard'
import InsightsPanel, { type WeekWearEntry, type SavedCombination } from './InsightsPanel'

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

  // Fetch saved combinations
  const userId = props.state === 'signed-in' ? (props.email ? 'user-id' : null) : null
  const { saves, fetchError } = useSavedCombinations(userId)

  // Initialize persona & engagement on mount
  useEffect(() => {
    setVibe(localStorage.getItem('scentral_vibe'))
    setEngagement(calculateEngagement())
    setMounted(true)

    // Aura Spritz Schedule streak — anon_id-keyed, independent of auth state.
    const anonId = localStorage.getItem('scentral_anon_id')
    if (anonId) {
      ;(async () => {
        try {
          const { data } = await createClient()
            .from('user_streaks')
            .select('current_streak')
            .eq('anon_id', anonId)
            .maybeSingle()
          setAuraStreak(data?.current_streak ?? 0)
        } catch {
          // best-effort — badge just won't show
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
        <div className="px-4 pt-8 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
          {auraStreak > 0 && (
            <Link href="/spritz" style={{ fontSize: 13, fontWeight: 700, color: 'var(--xp-color)' }}>
              🔥 {auraStreak}-day streak
            </Link>
          )}
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

  const { email } = props

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
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
          Wear & Share
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
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
