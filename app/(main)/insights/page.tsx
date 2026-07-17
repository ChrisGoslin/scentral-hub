import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { computeImpactAndBestTraces } from '@/lib/insights-impact'
import InsightsClient from './InsightsClient'

export const metadata: Metadata = {
  title: 'Insights | nota.',
  description: 'Your scent impact, evolution, and discovery patterns — computed nightly.',
  alternates: { canonical: '/insights' },
}

export const dynamic = 'force-dynamic'

interface CachedInsights {
  your_impact: {
    interactions_count?: number
    reactions_received?: number
    saves_count?: number
    summary?: string
  }
  best_traces?: Array<{
    id: string
    reaction_count?: number
    content?: string
  }>
  scentiment_vision?: {
    resonance_score?: number
    warmth_factor?: string
    summary?: string
  }
  taste_evolution?: Array<{
    period?: string
    family_distribution?: Record<string, number>
  }>
  trajectory?: {
    start_families?: string[]
    current_families?: string[]
    morphing?: boolean
  }
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
        your_impact: payload.your_impact ?? {},
        best_traces: payload.best_traces ?? [],
        scentiment_vision: payload.scentiment_vision ?? {},
        taste_evolution: payload.taste_evolution ?? [],
        trajectory: payload.trajectory ?? {},
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

  // If no cached data or stale, compute on-demand
  let computedInsights = insights
  if (!insights || isStale) {
    computedInsights = await computeInsights(supabase, userId)
    if (computedInsights) {
      // Store in cache
      await supabase
        .from('insights_cache')
        .upsert({
          user_id: userId,
          period: 'latest',
          payload: computedInsights,
          computed_at: new Date().toISOString(),
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
    // Traces must be fetched first: reactions are counted by trace ownership
    // (reactions *received* on this user's traces), not by who reacted.
    const [tracesResult, collectionsResult, shelfEventsResult] = await Promise.all([
      supabase.from('traces').select('id, user_id, body').eq('user_id', userId).limit(100),
      supabase.from('collections').select('id, fragrance_id, affinity_score').eq('user_id', userId),
      supabase.from('shelf_events').select('id, fragrance_id, event_type, created_at').eq('user_id', userId).order('created_at', { ascending: true }),
    ])

    const traces = tracesResult.data ?? []
    const collections = collectionsResult.data ?? []
    const shelfEvents = shelfEventsResult.data ?? []

    const traceIds = traces.map(t => t.id)
    const reactionsResult = traceIds.length > 0
      ? await supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds)
      : { data: [] }
    const reactions = reactionsResult.data ?? []

    const { yourImpact, bestTraces, scentimentVision } = computeImpactAndBestTraces(traces, reactions)

    // Compute Taste Evolution (shelf events + family distribution)
    const tasteEvolution: Array<{
      period?: string
      family_distribution?: Record<string, number>
    }> = []

    if (shelfEvents.length > 0) {
      // Group events by week
      const weekMap = new Map<string, Set<string>>()
      for (const event of shelfEvents) {
        const date = new Date(event.created_at)
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Set())
        if (event.fragrance_id) weekMap.get(weekKey)!.add(event.fragrance_id.toString())
      }

      // For each week, fetch fragrances and count by family
      for (const [weekKey, fragIds] of weekMap.entries()) {
        if (fragIds.size === 0) continue
        const { data: frags } = await supabase
          .from('fragrances')
          .select('family')
          .in('id', Array.from(fragIds))

        const familyDist: Record<string, number> = {}
        frags?.forEach(f => {
          if (f.family) familyDist[f.family] = (familyDist[f.family] ?? 0) + 1
        })

        tasteEvolution.push({ period: weekKey, family_distribution: familyDist })
      }
    }

    // Compute Trajectory (start → now)
    let startFamilies: string[] = []
    let currentFamilies: string[] = []

    if (collections.length > 0) {
      const collectionFragIds = collections.map(c => c.fragrance_id.toString())
      const { data: frags } = await supabase
        .from('fragrances')
        .select('family')
        .in('id', collectionFragIds)

      const allFamilies = frags?.map(f => f.family).filter(Boolean) as string[]
      if (allFamilies && allFamilies.length > 0) {
        currentFamilies = [...new Set(allFamilies)]
        // Assume first 20% of events define "start"
        const startCutoff = Math.ceil(shelfEvents.length * 0.2)
        if (startCutoff > 0) {
          const { data: startFrags } = await supabase
            .from('fragrances')
            .select('family')
            .in('id', shelfEvents.slice(0, startCutoff).map(e => e.fragrance_id.toString()).filter(Boolean))
          startFamilies = [...new Set(startFrags?.map(f => f.family).filter(Boolean) as string[])]
        }
      }
    }

    const trajectory = {
      start_families: startFamilies,
      current_families: currentFamilies,
      morphing: startFamilies.length > 0 && currentFamilies.length > 0 && !arraysEqual(startFamilies, currentFamilies),
    }

    return {
      your_impact: yourImpact,
      best_traces: bestTraces,
      scentiment_vision: scentimentVision,
      taste_evolution: tasteEvolution,
      trajectory,
    }
  } catch (error) {
    console.error('Failed to compute insights:', error)
    return null
  }
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every(item => setB.has(item))
}
