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
const MAX_SOURCE_LENGTH = 80
const MAX_TEXT_LENGTH = 12_000
const MAX_METADATA_BYTES = 10_000

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('signals/ingest: missing Supabase configuration')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabaseAdmin
    .from('product_signals')
    .insert({
      source,
      raw_text: text,
      tags: [],
      metadata: metadataPayload,
    })
    .select('id')
    .single()

  if (error) {
    console.error('signals/ingest: insert failed', error)
    return NextResponse.json({ error: 'Failed to record signal' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
