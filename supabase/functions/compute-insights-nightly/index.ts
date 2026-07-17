import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'
import { computeImpactAndBestTraces } from '../../../lib/insights-impact.ts'

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
    // Fetch all user ids from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) throw profilesError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No profiles to process' }), { status: 200 })
    }

    const userIds = profiles.map(p => p.id)

    // Process insights for each user
    const results: { user_id: string; status: 'success' | 'error'; error?: string }[] = []

    for (const userId of userIds) {
      try {
        const insights = await computeUserInsights(userId)
        if (insights) {
          const { error: upsertError } = await supabase
            .from('insights_cache')
            .upsert({
              user_id: userId,
              period: 'latest',
              payload: insights,
              computed_at: new Date().toISOString(),
            })
          if (upsertError) throw upsertError
          results.push({ user_id: userId, status: 'success' })
        }
      } catch (error) {
        console.error(`Error computing insights for ${userId}:`, error)
        results.push({ user_id: userId, status: 'error', error: String(error) })
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

async function computeUserInsights(userId: string): Promise<CachedInsights | null> {
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
    console.error(`Failed to compute insights for ${userId}:`, error)
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
