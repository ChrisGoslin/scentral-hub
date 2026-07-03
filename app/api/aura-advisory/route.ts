// app/api/aura-advisory/route.ts
// Aura Contextual Intelligence Layer
// POST /api/aura-advisory
// Input: { fragrance_id, context_type, weather? }
// Output: cached or computed advice text (Haiku-generated)

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface WeatherState {
  temp_c: number
  humidity: number
}

interface AuraAdvisoryRequest {
  fragrance_id: string
  context_type: 'detail' | 'shelf' | 'general'
  weather?: WeatherState
  fragrance_data?: {
    name: string
    brand: string
    family: string
    projection: string
    optimal_season: string
  }
  shelf_context?: {
    top_three: Array<{ name: string; brand: string; family: string }>
  }
}

async function getFragranceNotes(supabase: any, fragrance_id: string) {
  const { data: frags } = await supabase
    .from('fragrances')
    .select('id, name, brand, family, pyramid, projection, optimal_season')
    .eq('id', fragrance_id)
    .single()

  if (!frags?.pyramid) return null

  // pyramid is a JSON structure with top/mid/base notes
  try {
    const pyramid = typeof frags.pyramid === 'string' ? JSON.parse(frags.pyramid) : frags.pyramid
    return {
      name: frags.name,
      brand: frags.brand,
      family: frags.family,
      projection: frags.projection,
      optimal_season: frags.optimal_season,
      notes: pyramid,
    }
  } catch {
    return null
  }
}

function weatherToContext(weather: WeatherState | undefined): string {
  if (!weather) return 'in a temperate environment'

  const { temp_c, humidity } = weather
  if (temp_c >= 28) return 'in hot, dry conditions (28°C+)'
  if (temp_c >= 22) return 'in warm weather (22-27°C)'
  if (temp_c <= 10) return 'in cold weather (≤10°C)'
  if (humidity > 75) return 'in humid conditions (>75% humidity)'

  return 'in typical conditions'
}

function getVolatilityAdvice(projection: string, weather: WeatherState | undefined): string {
  if (!projection) return ''

  const isHot = weather && weather.temp_c >= 25
  const isCold = weather && weather.temp_c <= 10

  if (projection === 'Beast Mode') {
    if (isHot) return ' In this heat, it will project aggressively—apply sparingly.'
    return ' It will carry all day and then some.'
  }

  if (projection === 'Strong') {
    if (isHot) return ' Expect stronger projection in this warmth.'
    if (isCold) return ' Cold air may soften its sillage slightly.'
    return ' It will maintain presence throughout the day.'
  }

  if (projection === 'Moderate') {
    if (isHot) return ' Moderate projection will feel just right in this heat.'
    return ' A balanced presence that works most occasions.'
  }

  if (projection === 'Weak' || projection === 'Light') {
    if (isHot) return ' Light projection in warmth—apply where your skin touches fabric.'
    return ' Apply to pulse points to maximize presence.'
  }

  return ''
}

async function generateAuraAdvice(
  context: AuraAdvisoryRequest,
  fragranceNotes: any
): Promise<string> {
  const weatherContext = weatherToContext(context.weather)
  const volatilityHint = getVolatilityAdvice(fragranceNotes?.projection, context.weather)

  let prompt = ''

  if (context.context_type === 'detail') {
    // On fragrance detail page: advice tied to fragrance + weather
    const notesStr = fragranceNotes?.notes
      ? `top notes (${[fragranceNotes.notes.top].flat().slice(0, 2).join(', ')}), base family (${fragranceNotes.notes.base || fragranceNotes.family})`
      : `family (${fragranceNotes?.family})`

    prompt = `You are Aura, the contextual intelligence spirit of a fragrance app. Generate ONE sentence of warmly framed advice about wearing "${fragranceNotes?.name}" ${weatherContext}.

Context:
- Projection: ${fragranceNotes?.projection || 'unknown'}
- Notes: ${notesStr}
- Optimal season: ${fragranceNotes?.optimal_season || 'all-year'}

Advice tone: intimate, knowledgeable, gently suggestive. Example: "This might sit differently on your skin. Try it in cooler air if you want subtlety."

Generate advice that acknowledges weather/volatility, is actionable, and encourages the wearer to experiment. One sentence only.`
  } else if (context.context_type === 'shelf') {
    // On shelf page: advice about the top 3 fragrances converging
    const topThree = context.shelf_context?.top_three || []
    const families = topThree.map((f: any) => f.family).filter(Boolean)
    const familyStr = families.length > 0 ? families.join(', ') : 'similar profiles'

    prompt = `You are Aura. You notice the wearer's top-three fragrances in their collection all lean toward ${familyStr}. Generate ONE sentence of advice, warmly framed.

Example: "Your top three all dry down to amber. This is your comfort frequency—explore what lives in that warm base."

Be insightful, encouraging, and gently suggestive. One sentence only.`
  } else {
    // General: context-less advice
    prompt = `You are Aura. Generate ONE sentence of warm, evocative advice about fragrance wearing in general. Be poetic but actionable.

Example: "A fragrance's true life unfolds as it dries down. Give yourself time to discover its heart."

One sentence only.`
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    const advice = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    return advice || 'Each fragrance reveals itself in time. Trust your skin.'
  } catch (err) {
    console.error('Claude Haiku call failed:', err)
    return 'Let this fragrance speak to you in its own time.'
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not configured; Aura advice will use fallback')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 503 }
      )
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const body = (await req.json()) as AuraAdvisoryRequest

    if (!body.fragrance_id || !body.context_type) {
      return NextResponse.json(
        { error: 'Missing fragrance_id or context_type' },
        { status: 400 }
      )
    }

    const weatherStateStr = body.weather ? JSON.stringify(body.weather) : null

    // Check cache first
    let cacheQuery = supabase
      .from('aura_cache')
      .select('advice_text, created_at')
      .eq('fragrance_id', body.fragrance_id)
      .eq('context_type', body.context_type)

    if (weatherStateStr) {
      cacheQuery = cacheQuery.eq('weather_state', weatherStateStr)
    } else {
      cacheQuery = cacheQuery.is('weather_state', null)
    }

    const { data: cached } = await cacheQuery.maybeSingle()

    if (cached) {
      return NextResponse.json({
        success: true,
        advice_text: cached.advice_text,
        from_cache: true,
      })
    }

    // Fetch fragrance data if not provided
    let fragranceNotes = null
    if (!body.fragrance_data) {
      fragranceNotes = await getFragranceNotes(supabase, body.fragrance_id)
    } else {
      fragranceNotes = body.fragrance_data
    }

    // Generate advice via Haiku
    const advice = await generateAuraAdvice(body, fragranceNotes)

    // Store in cache
    await supabase.from('aura_cache').insert({
      fragrance_id: body.fragrance_id,
      context_type: body.context_type,
      weather_state: body.weather || null,
      advice_text: advice,
    })

    return NextResponse.json({
      success: true,
      advice_text: advice,
      from_cache: false,
    })
  } catch (err) {
    console.error('Aura advisory route error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}
