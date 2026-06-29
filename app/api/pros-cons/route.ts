import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  try {
    const { fragranceId, brand, name, description } = await req.json()

    if (!fragranceId) {
      return NextResponse.json({ error: 'Missing fragranceId' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Check cache first
    const cacheKey = `pros_cons_${fragranceId}`
    const { data: cached } = await supabase
      .from('chemist_cache')
      .select('result')
      .eq('key', cacheKey)
      .maybeSingle()

    if (cached?.result) {
      return NextResponse.json({ success: true, ...cached.result })
    }

    // Call Claude Haiku
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const prompt = `You are a fragrance expert. Give 3 pros and 3 cons for the fragrance ${name} by ${brand}, described as: "${description}". Return JSON only: { "pros": ["pro1", "pro2", "pro3"], "cons": ["con1", "con2", "con3"] }`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: 'text'; text: string }).text
    const result = JSON.parse(text)

    // Cache the result
    await supabase.from('chemist_cache').upsert({
      key: cacheKey,
      result,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('pros-cons error:', error)
    return NextResponse.json({ error: 'Failed to generate verdict' }, { status: 500 })
  }
}
