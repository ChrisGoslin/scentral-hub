import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'
import { fetchUserTraces, fetchUserCollections, fetchShelfEvents } from '../../lib/insightsQueries.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CachedInsights {
  your_impact: {
    interactions_count: number
    reactions_received: number
    too_real_count: number
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

function redactId(id: string): string {
  if (typeof id !== 'string') return String(id)
  return id.substring(0, 8) + '-****-****-****-************'
}

export async function handler(): Promise<Response> {
  try {
    const results: { user_id: string; status: 'success' | 'error'; error?: string }[] = []
    let page = 0
    const pageSize = 500
    let hasMore = true
    let totalProfilesFetched = 0

    while (hasMore) {
      const fromRange = page * pageSize
      const toRange = (page + 1) * pageSize - 1

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .range(fromRange, toRange)

      if (profilesError) throw profilesError
      if (!profiles || profiles.length === 0) {
        hasMore = false
        break
      }

      totalProfilesFetched += profiles.length
      const userIds = profiles.map(p => p.id)

      const batchConcur = 5
      for (let i = 0; i < userIds.length; i += batchConcur) {
        const batchUserIds = userIds.slice(i, i + batchConcur)
        await Promise.all(
          batchUserIds.map(async (userId) => {
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
                results.push({ user_id: redactId(userId), status: 'success' })
              } else {
                throw new Error('computeUserInsights returned null or empty')
              }
            } catch (error) {
              console.error(`Error computing insights for ${redactId(userId)}:`, error)
              results.push({ user_id: redactId(userId), status: 'error', error: String(error) })
            }
          })
        )
      }

      if (profiles.length < pageSize) {
        hasMore = false
      } else {
        page++
      }
    }

    if (totalProfilesFetched === 0) {
      return new Response(JSON.stringify({ message: 'No profiles to process' }), { status: 200 })
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
    console.error(`Failed to compute insights for ${redactId(userId)}:`, error)
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
