// supabase/functions/enrich-descriptions-batch/index.ts
// Batch description generation for fragrances with null plain_description.
// Trigger: manual HTTP POST (Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>) or pg_cron.
// Calls Claude Haiku to generate nota-tone descriptions, inserts pending_review rows into
// description_enrichment_queue. Never writes to fragrances directly — that only happens via
// the description_enrichment_queue_approval trigger when an admin approves a row.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2'

const BATCH_CAP = 50
const POPULARITY_POOL = 500

interface FragranceRow {
  id: string
  name: string
  brand: string
  family: string | null
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
}

function buildPrompt(f: FragranceRow): string {
  const notes = [f.top_notes, f.heart_notes, f.base_notes]
    .flat()
    .filter((n): n is string => Boolean(n))
    .join(', ') || f.family || 'unknown notes'

  return `Generate a 2-3 sentence fragrance description in nota-tone style — opening, then a heart turn, then drydown — for: ${f.name} by ${f.brand}. Notes: ${notes}. Be sensory, never technical or marketing-speak (no words like "luxurious", "captivating", "unforgettable"). Example reference tone: "Opens with citrus brightness that softens as it dries. The heart blooms with florals before settling into warm woods." Reply with only the description, no quotes or preamble.`
}

async function generateDescription(f: FragranceRow, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: buildPrompt(f) }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === 'text')
  const text = textBlock?.text?.trim()
  if (!text) throw new Error('Unexpected Claude response format')
  return text
}

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!anthropicApiKey) {
      return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Rank fragrances by view popularity from `interactions` (entity_type='fragrance').
    // interactions currently has 0 rows for this product, so this is a best-effort ranking —
    // it fills in as usage data accumulates rather than assuming data that doesn't exist yet.
    const { data: recentInteractions } = await supabase
      .from('interactions')
      .select('entity_id')
      .eq('entity_type', 'fragrance')
      .not('entity_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5000)

    const viewCounts = new Map<string, number>()
    for (const row of recentInteractions ?? []) {
      const id = row.entity_id as string
      viewCounts.set(id, (viewCounts.get(id) ?? 0) + 1)
    }
    const popularIds = Array.from(viewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, POPULARITY_POOL)
      .map(([id]) => id)

    // Already-queued fragrance_ids (any status) must never be re-queued.
    const { data: queuedRows } = await supabase.from('description_enrichment_queue').select('fragrance_id')
    const alreadyQueued = new Set((queuedRows ?? []).map(r => r.fragrance_id as string))

    const FRAG_COLUMNS = 'id, name, brand, family, top_notes, heart_notes, base_notes'
    const candidates = new Map<string, FragranceRow>()

    if (popularIds.length > 0) {
      const { data: popularFrags } = await supabase
        .from('fragrances')
        .select(FRAG_COLUMNS)
        .in('id', popularIds.filter(id => !alreadyQueued.has(id)))
        .is('plain_description', null)
        .limit(BATCH_CAP)
      for (const f of popularFrags ?? []) candidates.set(f.id, f as FragranceRow)
    }

    // Fill remaining slots (up to BATCH_CAP) with any other fragrance lacking a description,
    // deterministically ordered so repeated runs make steady progress through the catalogue.
    if (candidates.size < BATCH_CAP) {
      const { data: fillerFrags } = await supabase
        .from('fragrances')
        .select(FRAG_COLUMNS)
        .is('plain_description', null)
        .order('id', { ascending: true })
        .limit(BATCH_CAP * 3)
      for (const f of fillerFrags ?? []) {
        if (candidates.size >= BATCH_CAP) break
        if (alreadyQueued.has(f.id) || candidates.has(f.id)) continue
        candidates.set(f.id, f as FragranceRow)
      }
    }

    const batch = Array.from(candidates.values()).slice(0, BATCH_CAP)

    let created = 0
    let errored = 0
    const results: Array<{ fragrance_id: string; status: 'success' | 'error'; error?: string }> = []

    for (const fragrance of batch) {
      try {
        const description = await generateDescription(fragrance, anthropicApiKey)

        const { error: insertError } = await supabase.from('description_enrichment_queue').insert({
          fragrance_id: fragrance.id,
          name: fragrance.name,
          brand: fragrance.brand,
          ai_description: description,
          status: 'pending_review',
        })

        if (insertError) throw insertError

        created++
        results.push({ fragrance_id: fragrance.id, status: 'success' })
      } catch (err) {
        errored++
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`Error processing ${fragrance.id}:`, errorMsg)
        results.push({ fragrance_id: fragrance.id, status: 'error', error: errorMsg })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: { considered: batch.length, created, errored },
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Edge function error:', errorMsg)
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
