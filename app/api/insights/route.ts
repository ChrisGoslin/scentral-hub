import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * GET /api/insights
 * Fetch cached insights for the current user.
 * If cache is stale (> 24h), compute fresh insights.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get anon_id from request (passed via query param or header)
    const anonId = request.nextUrl.searchParams.get('anon_id') || request.headers.get('x-anon-id')

    if (!anonId) {
      return NextResponse.json({ error: 'Missing anon_id' }, { status: 400 })
    }

    // Fetch cached insights
    const { data: cached, error: fetchError } = await supabase
      .from('insights_cache')
      .select('*')
      .eq('anon_id', anonId)
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
          your_impact: cached.your_impact,
          best_traces: cached.best_traces,
          scentiment_vision: cached.scentiment_vision,
          taste_evolution: cached.taste_evolution,
          trajectory: cached.trajectory,
        },
        computed_at: cached.computed_at,
      })
    }

    // Compute fresh insights
    const insights = await computeInsights(supabase, anonId)

    if (!insights) {
      return NextResponse.json(
        { error: 'Failed to compute insights' },
        { status: 500 }
      )
    }

    // Store in cache
    const { error: upsertError } = await supabase
      .from('insights_cache')
      .upsert({
        anon_id: anonId,
        your_impact: insights.your_impact,
        best_traces: insights.best_traces,
        scentiment_vision: insights.scentiment_vision,
        taste_evolution: insights.taste_evolution,
        trajectory: insights.trajectory,
        computed_at: new Date().toISOString(),
      })
      .eq('anon_id', anonId)

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

async function computeInsights(
  supabase: Awaited<ReturnType<typeof createClient>>,
  anonId: string
): Promise<any> {
  try {
    // Fetch all user data in parallel
    const [tracesResult, reactionsResult, collectionsResult, shelfEventsResult] = await Promise.all([
      supabase.from('traces').select('id, anon_id, content').eq('anon_id', anonId).limit(100),
      supabase.from('trace_reactions').select('id, trace_id, reaction_type').eq('anon_id', anonId),
      supabase.from('collections').select('id, fragrance_id, affinity_score').eq('anon_id', anonId),
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
    console.error('Failed to compute insights:', error)
    return null
  }
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every(item => setB.has(item))
}
