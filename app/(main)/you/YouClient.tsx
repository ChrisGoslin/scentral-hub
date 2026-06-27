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
import YourContributions from '@/components/feedback/YourContributions'

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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px', fontStyle: 'italic', marginBottom: 16 }}>
            Your identity is waiting.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '20px', maxWidth: 320, marginBottom: 32 }}>
            Take the 2-minute quiz to discover your scent identity.
          </p>
          <Button fullWidth onClick={() => setAuthSheetOpen(true)} style={{ maxWidth: 280 }}>
            Find Your Base Note →
          </Button>
        </div>

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
    </div>
  )
}
