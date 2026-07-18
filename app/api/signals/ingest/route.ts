// POST /api/signals/ingest
// Public intake for product feedback / usage signals (forms, email
// forwarders, DMs, Zapier). Writes to `product_signals`; see
// docs/nota/PRODUCT_LOOP.md for how these feed the weekly product brief.
//
// Request: { source: string, text: string, metadata?: any }

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clientIp, enforce, makeLimiter } from '@/lib/rate-limit'

const signalsLimiter = makeLimiter('signals-ingest', 20, '1 m')
// Defense-in-depth against a single IP sustaining bursts just under the
// per-minute limit for hours (e.g. one caller filling the weekly brief's
// selection window well before the per-source fairness cap in
// scripts/generate_weekly_product_brief.ts even sees the data). This does
// not solve fairness across many IPs/a botnet — that's handled at selection
// time — it only raises the cost of a single-IP flood.
const signalsDailyLimiter = makeLimiter('signals-ingest-daily', 300, '1 d')
const MAX_SOURCE_LENGTH = 80
const MAX_TEXT_LENGTH = 12_000
const MAX_METADATA_BYTES = 10_000

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const allowed = await enforce(signalsLimiter, ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const allowedDaily = await enforce(signalsDailyLimiter, ip)
  if (!allowedDaily) {
    return NextResponse.json({ error: 'Daily rate limit exceeded' }, { status: 429 })
  }

  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const body = parsed as { source?: string; text?: string; metadata?: unknown }
  const { source, text, metadata } = body
  if (!source || typeof source !== 'string' || !text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing required fields: source, text' }, { status: 400 })
  }
  if (source.length > MAX_SOURCE_LENGTH || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'source or text exceeds allowed length' }, { status: 400 })
  }

  let metadataPayload: unknown = null
  if (metadata !== undefined) {
    const serialized = JSON.stringify(metadata)
    if (!serialized || Buffer.byteLength(serialized, 'utf8') > MAX_METADATA_BYTES) {
      return NextResponse.json({ error: 'metadata exceeds allowed size' }, { status: 400 })
    }
    metadataPayload = metadata
  }

  // Anon key, not service-role: docs/nota/06-testing-security-abuse.md §2.3
  // requires the service-role key never appear in an app/ code path. Writes
  // are scoped by the "Allow anon insert" RLS policy on product_signals
  // (INSERT only — no read/update/delete for anon), so this can't be used
  // to do anything beyond adding a row even if fully compromised.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    console.error('signals/ingest: missing Supabase configuration')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Generate the id up front rather than chaining .select().single() after
  // the insert: the anon policy is INSERT-only (no SELECT), so asking
  // PostgREST to return the inserted row would fail the whole request under
  // RLS even though the row was written successfully — the row lands, but
  // the caller gets a false 500.
  const id = crypto.randomUUID()
  const { error } = await supabaseAnon.from('product_signals').insert({
    id,
    source,
    raw_text: text,
    tags: [],
    metadata: metadataPayload,
  })

  if (error) {
    console.error('signals/ingest: insert failed', error)
    return NextResponse.json({ error: 'Failed to record signal' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id })
}
