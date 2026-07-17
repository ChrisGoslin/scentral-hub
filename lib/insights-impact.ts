// Pure computation shared between app/(main)/insights/page.tsx (on-demand,
// Next.js/Node) and supabase/functions/compute-insights-nightly/index.ts
// (scheduled, Deno). Deliberately dependency-free — no Supabase client, no
// runtime-specific API — so a plain relative/local import works unmodified
// in both environments. Duplicating this logic previously let the same
// reaction-ownership bug exist in both places at once; this is the fix for
// that failure mode, not just the SonarQube duplication gate.
//
// Taste Evolution and Trajectory aren't here: both need mid-computation
// Supabase queries (fetching fragrance families by id), which makes sharing
// them across Deno/Node a real cross-runtime typing question rather than a
// pure-function extraction — tracked as a follow-up, not done blind here.

export interface TraceRow {
  id: string
  body?: string | null
}

export interface ReactionRow {
  trace_id: string
  reaction?: string | null
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
