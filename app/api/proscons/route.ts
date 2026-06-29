import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  try {
    const { fragranceId } = await req.json()

    if (!fragranceId) {
      return NextResponse.json({ error: 'Missing fragranceId' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Check cache first
    const cacheMode = `proscons_${fragranceId}`
    const { data: cached } = await supabase
      .from('sommelier_cache')
      .select('result, created_at')
      .eq('mode', cacheMode)
      .single()

    if (cached) {
      const createdAt = new Date(cached.created_at)
      const now = new Date()
      const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays < 30) {
        return NextResponse.json({ success: true, ...cached.result })
      }
    }

    // Fetch fragrance data
    const { data: fragrance, error: fragError } = await supabase
      .from('fragrances')
      .select('id, brand, name, family, projection, plain_description')
      .eq('id', fragranceId)
      .single()

    if (fragError || !fragrance) {
      return NextResponse.json({ error: 'Fragrance not found' }, { status: 404 })
    }

    // Call Claude Haiku
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const prompt = `You are a fragrance expert. Analyze this fragrance and provide pros and cons.

FRAGRANCE:
Brand: ${fragrance.brand}
Name: ${fragrance.name}
Family: ${fragrance.family}
Projection: ${fragrance.projection}
Description: ${fragrance.plain_description}

Return JSON only with no markdown:
{
  "pros": ["string", "string", "string"],
  "cons": ["string", "string"]
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: 'text'; text: string }).text
    const result = JSON.parse(text)

    // Cache the result
    await supabase.from('sommelier_cache').upsert({
      mode: cacheMode,
      result,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('proscons error:', error)
    return NextResponse.json({ error: 'Failed to generate pros/cons' }, { status: 500 })
  }
}
