import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CachedInsights {
  your_impact: {
    interactions_count: number
    reactions_received: number
    saves_count: number
    summary: string
  }
  best_traces: Array<{
    id: string
    reaction_count: number
    content: string
  }>
  scentiment_vision: {
    resonance_score: number
    warmth_factor: string
    summary: string
  }
  taste_evolution: Array<{
    period: string
    family_distribution: Record<string, number>
  }>
  trajectory: {
    start_families: string[]
    current_families: string[]
    morphing: boolean
  }
}

export async function handler(): Promise<Response> {
  try {
    // Fetch all unique anon_ids from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('anon_id')

    if (profilesError) throw profilesError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No profiles to process' }), { status: 200 })
    }

    const anonIds = profiles.map(p => p.anon_id)

    // Process insights for each user
    const results: { anon_id: string; status: 'success' | 'error'; error?: string }[] = []

    for (const anonId of anonIds) {
      try {
        const insights = await computeUserInsights(anonId)
        if (insights) {
          await supabase
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
          results.push({ anon_id: anonId, status: 'success' })
        }
      } catch (error) {
        console.error(`Error computing insights for ${anonId}:`, error)
        results.push({ anon_id: anonId, status: 'error', error: String(error) })
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Nightly insights computation failed:', error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}

async function computeUserInsights(anonId: string): Promise<CachedInsights | null> {
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
      period: string
      family_distribution: Record<string, number>
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
    console.error(`Failed to compute insights for ${anonId}:`, error)
    return null
  }
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every(item => setB.has(item))
}

// Start the handler
Deno.serve(handler)
