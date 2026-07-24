import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { fetchUserTraces, fetchUserCollections, fetchShelfEvents } from '@/lib/insightsQueries'

/**
 * GET /api/insights
 * Fetch cached insights for the current user.
 * If cache is stale (> 24h), compute fresh insights.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch cached insights
    const { data: cached, error: fetchError } = await supabase
      .from('insights_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('period', 'latest')
      .maybeSingle()

    if (fetchError) {
      console.error('Failed to fetch insights cache:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    // Check if cache is stale (> 24 hours)
    const isStale = cached
      ? Date.now() - new Date(cached.computed_at).getTime() > 24 * 60 * 60 * 1000
      : true

    if (cached && !isStale) {
      return NextResponse.json({
        source: 'cache',
        insights: {
          your_impact: cached.payload?.your_impact,
          best_traces: cached.payload?.best_traces,
          scentiment_vision: cached.payload?.scentiment_vision,
          taste_evolution: cached.payload?.taste_evolution,
          trajectory: cached.payload?.trajectory,
        },
        computed_at: cached.computed_at,
      })
    }

    // Compute fresh insights
    const insights = await computeInsights(supabase, userId)

    if (!insights) {
      if (cached) {
        return NextResponse.json({
          source: 'cache-stale',
          insights: cached.payload,
          computed_at: cached.computed_at,
        })
      }
      return NextResponse.json(
        { error: 'Failed to compute insights' },
        { status: 500 }
      )
    }

    // Store in cache
    const { error: upsertError } = await supabase
      .from('insights_cache')
      .upsert({
        user_id: userId,
        period: 'latest',
        payload: insights,
        computed_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Failed to cache insights:', upsertError)
    }

    return NextResponse.json({
      source: 'computed',
      insights,
      computed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type InsightsResult = {
  your_impact: {
    interactions_count: number
    reactions_received: number
    too_real_count: number
    summary: string
  }
  best_traces: Array<{ id: string; reaction_count: number; content: string }>
  scentiment_vision: { resonance_score: number; warmth_factor: string; summary: string }
  taste_evolution: Array<{ period?: string; family_distribution?: Record<string, number> }>
  trajectory: { start_families: string[]; current_families: string[]; morphing: boolean }
}

async function computeInsights(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<InsightsResult | null> {
  try {
    // Fetch all user data in parallel
    const [tracesResult, collectionsResult, shelfEventsResult] = await Promise.all([
      fetchUserTraces(supabase, userId),
      fetchUserCollections(supabase, userId),
      fetchShelfEvents(supabase, userId),
    ])

    const traces = tracesResult.data ?? []
    const collections = collectionsResult.data ?? []
    const shelfEvents = shelfEventsResult.data ?? []
    const traceIds = traces.map(t => t.id)
    const reactionsResult = traceIds.length > 0
      ? await supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds)
      : { data: [] as Array<{ trace_id: string; reaction: string }> }
    const reactions = reactionsResult.data ?? []

    // Compute Your Impact
    const interactionsCount = traces.length
    const reactionsReceived = reactions.length
    const tooRealCount = reactions.filter(r => r.reaction === 'too_real').length

    const yourImpact = {
      interactions_count: interactionsCount,
      reactions_received: reactionsReceived,
      too_real_count: tooRealCount,
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
        content: t.body ?? '',
      }))
      .sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0))
      .slice(0, 3)

    // Compute Scentiment Vision
    const resonanceScore = interactionsCount > 0 ? (reactionsReceived / interactionsCount) * 100 : 0

    const scentimentVision = {
      resonance_score: Math.round(resonanceScore * 10) / 10,
      warmth_factor: reactionsReceived > 0 ? 'thriving' : 'awakening',
      summary:
        reactionsReceived > 0
          ? `Your traces have resonated with ${reactionsReceived} interaction${reactionsReceived === 1 ? '' : 's'}.`
          : 'Your traces are waiting for their first resonance.',
    }

    // Compute Taste Evolution
    const tasteEvolution: Array<{
      period?: string
      family_distribution?: Record<string, number>
    }> = []

    if (shelfEvents.length > 0) {
      const weekMap = new Map<string, Set<string>>()
      for (const event of shelfEvents) {
        const date = new Date(event.created_at)
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Set())
        if (event.fragrance_id) weekMap.get(weekKey)!.add(event.fragrance_id.toString())
      }

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

    // Compute Trajectory
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
    console.error(`Failed to compute insights for ${userId}:`, error)
    return null
  }
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every(item => setB.has(item))
}
