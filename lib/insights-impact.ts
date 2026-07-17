// Shared between app/(main)/insights/page.tsx (Next.js/Node) and
// supabase/functions/compute-insights-nightly/index.ts (Deno). Keep this file
// dependency-free so both runtimes can import it without bundler-specific code.

export interface TraceRow {
  id: string
  body?: string | null
}

export interface ReactionRow {
  trace_id: string
  reaction?: string | null
}

export interface CollectionRow {
  fragrance_id?: string | number | null
}

export interface ShelfEventRow {
  fragrance_id?: string | number | null
  created_at: string
}

export interface FamilyRow {
  family?: string | null
}

export interface CachedInsights {
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

export interface InsightRows {
  traces: TraceRow[]
  collections: CollectionRow[]
  shelfEvents: ShelfEventRow[]
}

export interface InsightDataSource {
  fetchRows(userId: string): Promise<InsightRows>
  fetchReactions(traceIds: string[]): Promise<ReactionRow[]>
  fetchFamilies(fragranceIds: string[]): Promise<FamilyRow[]>
}

interface SupabaseQuery extends PromiseLike<{ data: unknown }> {
  eq(column: string, value: string): SupabaseQuery
  in(column: string, values: string[]): SupabaseQuery
  limit(count: number): SupabaseQuery
  order(column: string, options: { ascending: boolean }): SupabaseQuery
}

interface SupabaseLike {
  from(table: string): {
    select(columns: string): SupabaseQuery
  }
}

export function createInsightsDataSource(supabase: SupabaseLike): InsightDataSource {
  return {
    fetchRows: async (userId) => {
      const [tracesResult, collectionsResult, shelfEventsResult] = await Promise.all([
        supabase.from('traces').select('id, body').eq('user_id', userId).limit(100),
        supabase.from('collections').select('fragrance_id').eq('user_id', userId),
        supabase.from('shelf_events').select('fragrance_id, created_at').eq('user_id', userId).order('created_at', { ascending: true }),
      ])

      return {
        traces: toRows<TraceRow>(tracesResult.data),
        collections: toRows<CollectionRow>(collectionsResult.data),
        shelfEvents: toRows<ShelfEventRow>(shelfEventsResult.data),
      }
    },
    fetchReactions: async (traceIds) => {
      if (traceIds.length === 0) return []
      const { data } = await supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds)
      return toRows<ReactionRow>(data)
    },
    fetchFamilies: async (fragranceIds) => {
      if (fragranceIds.length === 0) return []
      const { data } = await supabase.from('fragrances').select('family').in('id', fragranceIds)
      return toRows<FamilyRow>(data)
    },
  }
}

export function computeImpactAndBestTraces(traces: TraceRow[], reactions: ReactionRow[]) {
  const interactionsCount = traces.length
  const reactionsReceived = reactions.length
  // 'too_real' is one of three peer reactions (on_the_nose/feel_this/too_real)
  // under the current contract, not a save action — the legacy 'saved' value
  // was merged into it during the schema migration. Track it as its own
  // reaction count, not as a stand-in for a "save" that no longer exists.
  const tooRealCount = reactions.filter((r) => r.reaction === 'too_real').length

  const traceReactionMap = new Map<string, number>()
  reactions.forEach((r) => {
    const count = traceReactionMap.get(r.trace_id) ?? 0
    traceReactionMap.set(r.trace_id, count + 1)
  })

  const yourImpact = {
    interactions_count: interactionsCount,
    reactions_received: reactionsReceived,
    too_real_count: tooRealCount,
    summary:
      interactionsCount > 0
        ? `You've described ${interactionsCount} scent${interactionsCount === 1 ? '' : 's'} so far.`
        : 'Start describing scents to build your impact.',
  }

  const bestTraces = traces
    .map((t) => ({
      id: t.id,
      reaction_count: traceReactionMap.get(t.id) ?? 0,
      content: t.body ?? '',
    }))
    .sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0))
    .slice(0, 3)

  // % of traces that received at least one reaction — inherently bounded to
  // [0, 100]. A ratio of total reactions to total traces isn't (a trace can
  // receive reactions from more than one user), which let this read as high
  // as 200% before.
  const tracesWithReactionsCount = traceReactionMap.size
  const resonanceScore = interactionsCount > 0 ? (tracesWithReactionsCount / interactionsCount) * 100 : 0

  const scentimentVision = {
    resonance_score: Math.round(resonanceScore * 10) / 10,
    warmth_factor: reactionsReceived > 0 ? 'thriving' : 'awakening',
    summary:
      reactionsReceived > 0
        ? `Your traces have resonated with ${reactionsReceived} interaction${reactionsReceived === 1 ? '' : 's'}.`
        : 'Your traces are waiting for their first resonance.',
  }

  return { yourImpact, bestTraces, scentimentVision }
}

export async function computeCachedInsights(
  userId: string,
  source: InsightDataSource,
): Promise<CachedInsights> {
  const { traces, collections, shelfEvents } = await source.fetchRows(userId)
  const reactions = await source.fetchReactions(traces.map((t) => t.id))
  const { yourImpact, bestTraces, scentimentVision } = computeImpactAndBestTraces(traces, reactions)

  const tasteEvolution = await buildTasteEvolution(shelfEvents, source.fetchFamilies)
  const trajectory = await buildTrajectory(collections, shelfEvents, source.fetchFamilies)

  return {
    your_impact: yourImpact,
    best_traces: bestTraces,
    scentiment_vision: scentimentVision,
    taste_evolution: tasteEvolution,
    trajectory,
  }
}

async function buildTasteEvolution(
  shelfEvents: ShelfEventRow[],
  fetchFamilies: InsightDataSource['fetchFamilies'],
): Promise<CachedInsights['taste_evolution']> {
  const weekMap = new Map<string, Set<string>>()
  for (const event of shelfEvents) {
    const id = event.fragrance_id?.toString()
    if (!id) continue
    const date = new Date(event.created_at)
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Set())
    weekMap.get(weekKey)!.add(id)
  }

  const tasteEvolution: CachedInsights['taste_evolution'] = []
  for (const [weekKey, fragIds] of weekMap.entries()) {
    const familyDist = countFamilies(await fetchFamilies(Array.from(fragIds)))
    tasteEvolution.push({ period: weekKey, family_distribution: familyDist })
  }
  return tasteEvolution
}

async function buildTrajectory(
  collections: CollectionRow[],
  shelfEvents: ShelfEventRow[],
  fetchFamilies: InsightDataSource['fetchFamilies'],
): Promise<CachedInsights['trajectory']> {
  const collectionFragIds = collections
    .map((collection) => collection.fragrance_id?.toString())
    .filter((id): id is string => Boolean(id))

  if (collectionFragIds.length === 0) {
    return { start_families: [], current_families: [], morphing: false }
  }

  const currentFamilies = uniqueFamilies(await fetchFamilies(collectionFragIds))
  let startFamilies: string[] = []

  const startCutoff = Math.ceil(shelfEvents.length * 0.2)
  if (startCutoff > 0) {
    const startFragIds = shelfEvents
      .slice(0, startCutoff)
      .map((event) => event.fragrance_id?.toString())
      .filter((id): id is string => Boolean(id))
    startFamilies = uniqueFamilies(await fetchFamilies(startFragIds))
  }

  return {
    start_families: startFamilies,
    current_families: currentFamilies,
    morphing: startFamilies.length > 0 && currentFamilies.length > 0 && !arraysEqual(startFamilies, currentFamilies),
  }
}

function countFamilies(rows: FamilyRow[]): Record<string, number> {
  const familyDist: Record<string, number> = {}
  rows.forEach((row) => {
    if (row.family) familyDist[row.family] = (familyDist[row.family] ?? 0) + 1
  })
  return familyDist
}

function uniqueFamilies(rows: FamilyRow[]): string[] {
  return [...new Set(rows.map((row) => row.family).filter((family): family is string => Boolean(family)))]
}

function toRows<T>(data: unknown): T[] {
  return Array.isArray(data) ? data as T[] : []
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((item) => setB.has(item))
}
