import { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import InsightsClient from './InsightsClient'

export const metadata: Metadata = {
  title: 'Insights | BaseNote',
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
    warmth_factor?: number
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
  const headerList = await headers()

  // Get anon_id from localStorage bridge via cookie
  // In a real implementation, this would be read from the request
  let anonId: string | null = null
  try {
    const anonIdCookie = cookieStore.get('scentral_anon_id')
    anonId = anonIdCookie?.value ?? null
  } catch {
    // Silent fail
  }

  if (!anonId) {
    return (
      <InsightsClient
        state="no-data"
        anonId={null}
        insights={null}
        computedAt={null}
      />
    )
  }

  const supabase = await createClient(cookieStore)

  // Fetch cached insights
  let insights: CachedInsights | null = null
  let computedAt: string | null = null
  let isStale = false

  try {
    const { data } = await supabase
      .from('insights_cache')
      .select('your_impact, best_traces, scentiment_vision, taste_evolution, trajectory, computed_at')
      .eq('anon_id', anonId)
      .maybeSingle()

    if (data) {
      insights = {
        your_impact: data.your_impact ?? {},
        best_traces: data.best_traces ?? [],
        scentiment_vision: data.scentiment_vision ?? {},
        taste_evolution: data.taste_evolution ?? [],
        trajectory: data.trajectory ?? {},
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
    computedInsights = await computeInsights(supabase, anonId)
    if (computedInsights) {
      // Store in cache
      await supabase
        .from('insights_cache')
        .upsert({
          anon_id: anonId,
          your_impact: computedInsights.your_impact ?? {},
          best_traces: computedInsights.best_traces ?? [],
          scentiment_vision: computedInsights.scentiment_vision ?? {},
          taste_evolution: computedInsights.taste_evolution ?? [],
          trajectory: computedInsights.trajectory ?? {},
          computed_at: new Date().toISOString(),
        })
        .eq('anon_id', anonId)
    }
  }

  return (
    <InsightsClient
      state={computedInsights ? 'hydrated' : 'loading'}
      anonId={anonId}
      insights={computedInsights}
      computedAt={computedAt ?? new Date().toISOString()}
    />
  )
}

async function computeInsights(supabase: Awaited<ReturnType<typeof createClient>>, anonId: string): Promise<CachedInsights | null> {
  try {
    // Fetch all user data in parallel
    const [tracesResult, reactionsResult, collectionsResult, shelfEventsResult] = await Promise.all([
      // Get traces (if available)
      supabase.from('traces').select('id, anon_id, content').eq('anon_id', anonId).limit(100),
      // Get reactions
      supabase.from('trace_reactions').select('id, trace_id, reaction_type').eq('anon_id', anonId),
      // Get collection
      supabase.from('collections').select('id, fragrance_id, affinity_score').eq('anon_id', anonId),
      // Get shelf events
      supabase.from('shelf_events').select('id, fragrance_id, event_type, created_at').eq('anon_id', anonId).order('created_at', { ascending: true }),
    ])

    const traces = tracesResult.data ?? []
    const reactions = reactionsResult.data ?? []
    const collections = collectionsResult.data ?? []
    const shelfEvents = shelfEventsResult.data ?? []

    // Compute Your Impact
    const interactionsCount = traces.length
    const reactionsReceived = reactions.length
    const savesCount = reactions.filter(r => r.reaction_type === 'saved').length

    const yourImpact = {
      interactions_count: interactionsCount,
      reactions_received: reactionsReceived,
      saves_count: savesCount,
      summary:
        interactionsCount > 0
          ? `You've described ${interactionsCount} scent${interactionsCount === 1 ? '' : 's'} so far.`
          : 'Start describing scents to build your impact.',
    }

    // Compute Best Traces
    const traceReactionMap = new Map<string, number>()
    reactions.forEach(r => {
      const count = traceReactionMap.get(r.trace_id) ?? 0
      traceReactionMap.set(r.trace_id, count + 1)
    })

    const bestTraces = traces
      .map(t => ({
        id: t.id,
        reaction_count: traceReactionMap.get(t.id) ?? 0,
        content: t.content ?? '',
      }))
      .sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0))
      .slice(0, 3)

    // Compute Scentiment Vision (reactions per trace)
    const resonanceScore = interactionsCount > 0 ? (reactionsReceived / interactionsCount) * 100 : 0

    const scentimentVision = {
      resonance_score: Math.round(resonanceScore * 10) / 10,
      warmth_factor: reactionsReceived > 0 ? 'thriving' : 'awakening',
      summary:
        reactionsReceived > 0
          ? `Your traces have resonated with ${reactionsReceived} interaction${reactionsReceived === 1 ? '' : 's'}.`
          : 'Your traces are waiting for their first resonance.',
    }

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
