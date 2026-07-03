// app/(main)/collection/[id]/FragranceTraces.tsx
// Server component: fetches this fragrance's traces + the "People like you also
// said" insight strip, then hands them to the client composer/list.
//
// "People like you also said" heuristic (per AGENTS.md Prompt 11 spec — kept
// deliberately simple, this is social proof, not a recommendation engine):
// traces on OTHER fragrances that share the same `fragrances.family` as the
// fragrance being viewed, authored by users who have a `current` noseprint.
// Implemented as a plain application-code join (no SQL view) per the DB change
// policy — see the migration file left on disk for a possible future view,
// noted in the final report.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import FragranceTracesClient from './FragranceTracesClient'
import type { Trace } from '@/components/traces/TraceCard'

interface FragranceTracesProps {
  fragranceId: string
  family: string | null
}

const INSIGHT_LIMIT = 6

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

async function enrichTraces(
  supabase: ReturnType<typeof createServiceClient>,
  rows: { id: string; user_id: string; fragrance_id: string | null; trace_type: string; body: string; image_url: string | null; created_at: string }[]
): Promise<Trace[]> {
  if (rows.length === 0) return []

  const userIds = Array.from(new Set(rows.map(r => r.user_id)))
  const traceIds = rows.map(r => r.id)
  const fragranceIds = Array.from(new Set(rows.map(r => r.fragrance_id).filter((id): id is string => Boolean(id))))

  const [{ data: profiles }, { data: noseprints }, { data: reactions }, { data: fragrances }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, username').in('id', userIds),
    supabase
      .from('noseprints')
      .select('user_id, descriptor, created_at')
      .in('user_id', userIds)
      .eq('status', 'current')
      .order('created_at', { ascending: false }),
    supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds),
    fragranceIds.length > 0
      ? supabase.from('fragrances').select('id, brand, name').in('id', fragranceIds)
      : Promise.resolve({ data: [] as { id: string; brand: string; name: string }[] }),
  ])

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))
  const noseprintByUser = new Map<string, string>()
  for (const n of noseprints ?? []) {
    if (!noseprintByUser.has(n.user_id)) noseprintByUser.set(n.user_id, n.descriptor)
  }
  const fragranceById = new Map((fragrances ?? []).map(f => [f.id, f]))

  const reactionCounts = new Map<string, { on_the_nose: number; feel_this: number; too_real: number }>()
  for (const r of reactions ?? []) {
    const counts = reactionCounts.get(r.trace_id) ?? { on_the_nose: 0, feel_this: 0, too_real: 0 }
    if (r.reaction in counts) counts[r.reaction as keyof typeof counts]++
    reactionCounts.set(r.trace_id, counts)
  }

  return rows.map(t => {
    const profile = profileById.get(t.user_id)
    const fragrance = t.fragrance_id ? fragranceById.get(t.fragrance_id) : undefined
    return {
      id: t.id,
      trace_type: t.trace_type,
      body: t.body,
      image_url: t.image_url,
      created_at: t.created_at,
      fragrance_id: t.fragrance_id,
      fragrance: fragrance ? { id: fragrance.id, brand: fragrance.brand, name: fragrance.name } : null,
      author: {
        display_name: profile?.display_name ?? 'A BaseNote member',
        username: profile?.username ?? null,
        noseprint_descriptor: noseprintByUser.get(t.user_id) ?? null,
      },
      reaction_counts: reactionCounts.get(t.id) ?? { on_the_nose: 0, feel_this: 0, too_real: 0 },
    }
  })
}

export default async function FragranceTraces({ fragranceId, family }: FragranceTracesProps) {
  const supabase = serviceClient()

  const { data: ownTraceRows } = await supabase
    .from('traces')
    .select('id, user_id, fragrance_id, trace_type, body, image_url, created_at')
    .eq('fragrance_id', fragranceId)
    .order('created_at', { ascending: false })
    .limit(20)

  const ownTraces = await enrichTraces(supabase, ownTraceRows ?? [])

  // "People like you also said" — simple heuristic, not a recommendation engine.
  let insightTraces: Trace[] = []
  if (family) {
    const { data: sameFamilyFragrances } = await supabase
      .from('fragrances')
      .select('id')
      .eq('family', family)
      .neq('id', fragranceId)
      .limit(200)

    const familyFragranceIds = (sameFamilyFragrances ?? []).map(f => f.id)

    if (familyFragranceIds.length > 0) {
      const { data: currentNoseprintUsers } = await supabase
        .from('noseprints')
        .select('user_id')
        .eq('status', 'current')

      const userIdsWithNoseprint = new Set((currentNoseprintUsers ?? []).map(n => n.user_id))

      if (userIdsWithNoseprint.size > 0) {
        const { data: candidateRows } = await supabase
          .from('traces')
          .select('id, user_id, fragrance_id, trace_type, body, image_url, created_at')
          .in('fragrance_id', familyFragranceIds)
          .in('user_id', Array.from(userIdsWithNoseprint))
          .order('created_at', { ascending: false })
          .limit(INSIGHT_LIMIT)

        insightTraces = await enrichTraces(supabase, candidateRows ?? [])
      }
    }
  }

  return (
    <FragranceTracesClient
      fragranceId={fragranceId}
      initialTraces={ownTraces}
      insightTraces={insightTraces}
    />
  )
}
