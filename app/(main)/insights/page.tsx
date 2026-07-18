import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { computeCachedInsights, createInsightsDataSource, type CachedInsights } from '@/lib/insights-impact'
import InsightsClient from './InsightsClient'

export const metadata: Metadata = {
  title: 'Insights | nota.',
  description: 'Your scent impact, evolution, and discovery patterns — computed nightly.',
  alternates: { canonical: '/insights' },
}

export const dynamic = 'force-dynamic'

const emptyInsights: CachedInsights = {
  your_impact: {
    interactions_count: 0,
    reactions_received: 0,
    too_real_count: 0,
    summary: 'Start describing scents to build your impact.',
  },
  best_traces: [],
  scentiment_vision: {
    resonance_score: 0,
    warmth_factor: 'awakening',
    summary: 'Your traces are waiting for their first resonance.',
  },
  taste_evolution: [],
  trajectory: {
    start_families: [],
    current_families: [],
    morphing: false,
  },
}

export default async function InsightsPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id ?? null

  if (!userId) {
    return (
      <InsightsClient
        state="no-data"
        userId={null}
        insights={null}
        computedAt={null}
      />
    )
  }

  // Fetch cached insights
  let insights: CachedInsights | null = null
  let computedAt: string | null = null
  let isStale = false

  try {
    const { data } = await supabase
      .from('insights_cache')
      .select('payload, computed_at')
      .eq('user_id', userId)
      .eq('period', 'latest')
      .maybeSingle()

    if (data) {
      const payload = (data.payload ?? {}) as Partial<CachedInsights>
      insights = {
        your_impact: payload.your_impact ?? emptyInsights.your_impact,
        best_traces: payload.best_traces ?? [],
        scentiment_vision: payload.scentiment_vision ?? emptyInsights.scentiment_vision,
        taste_evolution: payload.taste_evolution ?? [],
        trajectory: payload.trajectory ?? emptyInsights.trajectory,
      }
      computedAt = data.computed_at

      // Check if cache is stale (> 24 hours)
      const computedTime = new Date(data.computed_at).getTime()
      const now = Date.now()
      isStale = now - computedTime > 24 * 60 * 60 * 1000
    }
  } catch (error) {
    console.error('Failed to fetch insights cache:', error)
  }

  // If no cached data or stale, compute on-demand. A failed/null refresh
  // should not discard a perfectly usable stale payload — only replace it
  // once recomputation actually succeeds.
  let computedInsights = insights
  if (!insights || isStale) {
    const refreshedInsights = await computeInsights(supabase, userId)
    if (refreshedInsights) {
      computedInsights = refreshedInsights
      computedAt = new Date().toISOString()
      await supabase
        .from('insights_cache')
        .upsert({
          user_id: userId,
          period: 'latest',
          payload: refreshedInsights,
          computed_at: computedAt,
        })
    }
  }

  return (
    <InsightsClient
      state={computedInsights ? 'hydrated' : 'no-data'}
      userId={userId}
      insights={computedInsights}
      computedAt={computedInsights ? (computedAt ?? new Date().toISOString()) : null}
    />
  )
}

async function computeInsights(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<CachedInsights | null> {
  try {
    return await computeCachedInsights(userId, createInsightsDataSource(supabase as never))
  } catch (error) {
    console.error('Failed to compute insights:', error)
    return null
  }
}
