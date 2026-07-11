// POST /api/signals/ingest
// Public intake for product feedback / usage signals (forms, email
// forwarders, DMs, Zapier). Writes to `product_signals`; see
// docs/nota/PRODUCT_LOOP.md for how these feed the weekly product brief.
//
// Request: { source: string, text: string, metadata?: any }

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clientIp, enforce, makeLimiter } from '@/lib/rate-limit'
import { runLLM } from '@/lib/llm'

const signalsLimiter = makeLimiter('signals-ingest', 20, '1 m')

interface SignalEnrichment {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  persona_guess: string | null
  feature_area: string | null
  tags: string[]
}

const ENRICHMENT_SYSTEM_PROMPT = `You triage raw product feedback for nota., a personal scent identity app.
Given a piece of feedback text, return ONLY JSON:
{"summary": "<one sentence>", "sentiment": "positive"|"neutral"|"negative", "persona_guess": "<short persona label or null>", "feature_area": "<short feature/UX area or null>", "tags": ["..."]}`

async function enrichSignal(text: string): Promise<Partial<SignalEnrichment>> {
  try {
    const result = await runLLM({
      system: ENRICHMENT_SYSTEM_PROMPT,
      prompt: text.slice(0, 4000),
      maxTokens: 512,
      json: true,
    })
    return (result as SignalEnrichment) ?? {}
  } catch (err) {
    console.error('signals/ingest: enrichment failed, storing raw signal only', err)
    return {}
  }
}

export async function POST(req: NextRequest) {
  const allowed = await enforce(signalsLimiter, clientIp(req))
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: { source?: string; text?: string; metadata?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { source, text, metadata } = body
  if (!source || typeof source !== 'string' || !text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing required fields: source, text' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('signals/ingest: missing Supabase configuration')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const enrichment = await enrichSignal(text)

  const { data, error } = await supabaseAdmin
    .from('product_signals')
    .insert({
      source,
      raw_text: text,
      summary: enrichment.summary ?? null,
      sentiment: enrichment.sentiment ?? null,
      persona_guess: enrichment.persona_guess ?? null,
      feature_area: enrichment.feature_area ?? null,
      tags: enrichment.tags ?? [],
      metadata: metadata ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('signals/ingest: insert failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
