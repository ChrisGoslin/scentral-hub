import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { clientIp, enforce, makeLimiter } from '@/lib/rate-limit'

const cloneConfidenceLimiter = makeLimiter('clone-confidence', 20, '1 m')

export async function POST(req: Request) {
  try {
    if (!(await enforce(cloneConfidenceLimiter, clientIp(req)))) {
      return NextResponse.json({ error: 'Too many verdict requests. Try again in a minute.' }, { status: 429 })
    }

    const { cloneName, cloneBrand, inspirationName, inspirationBrand, cloneId } = await req.json()

    if (!cloneName || !cloneBrand || !inspirationName || !inspirationBrand) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Build cache key
    const cacheKey = `clone_confidence_${cloneName}_${inspirationName}`

    // Check cache first
    const { data: cached } = await supabase
      .from('chemist_cache')
      .select('result')
      .ilike('result->key', cacheKey)
      .maybeSingle()

    if (cached?.result) {
      return NextResponse.json({ success: true, ...cached.result })
    }

    // Call Claude Haiku
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const prompt = `You are a fragrance expert. Rate how closely '${cloneBrand} ${cloneName}' matches '${inspirationBrand} ${inspirationName}'. Return JSON only, no markdown: { "score": number (1-10), "verdict": "string (max 12 words, e.g. 'Excellent value — nearly identical drydown at a fifth of the price')", "buyRecommendation": "yes" | "maybe" | "skip" }`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: 'text'; text: string }).text
    const result = JSON.parse(text)
    result.key = cacheKey

    // Cache the result
    await supabase.from('chemist_cache').insert({
      fragrance_a_id: cloneId || null,
      fragrance_b_id: null,
      result,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('clone-confidence error:', error)
    return NextResponse.json({ error: 'Failed to generate verdict' }, { status: 500 })
  }
}
