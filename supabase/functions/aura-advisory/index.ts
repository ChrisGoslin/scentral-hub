// Aura — contextual fragrance intelligence layer.
// NOT a chatbot: one grounded, tentative observation, never prescriptive, <=2 sentences.
// POST body: { fragrance_id, context_type: 'detail'|'shelf'|'general'|'post_wear', weather?, fragrance_data?, shelf_context? }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AURA_SYSTEM_PROMPT = `You are Aura, the fragrance intelligence layer inside a scent app. You are not a
character, avatar, or chatbot — you are a quiet observation surfaced inline. Ground every statement in
concrete physical mechanism: molecule volatility, evaporation curves, skin chemistry (pH, oil levels,
temperature), and thermal diffusion. Tone: calm, tentative, observational. Never over-certify — use "might",
"tends to", "in this weather" rather than absolute claims. Never dominate the surface: you are a single line
beneath other content, not a headline. Never prescribe ("you should") — observe and let the wearer decide.
Respond in ONE, at most TWO sentences. No greetings, no emoji, no exclamation points, no marketing language.`

interface WeatherState {
  temp_c: number
  humidity: number
}

interface FragranceData {
  name: string
  brand: string
  family: string
  projection: string
  optimal_season: string
}

interface AuraAdvisoryRequest {
  fragrance_id: string
  context_type: 'detail' | 'shelf' | 'general' | 'post_wear'
  weather?: WeatherState
  fragrance_data?: FragranceData
  shelf_context?: { top_three: Array<{ name: string; brand: string; family: string }> }
}

function weatherToContext(weather: WeatherState | undefined): string {
  if (!weather) return 'in a temperate environment'
  const { temp_c, humidity } = weather
  if (temp_c >= 28) return 'in hot, dry conditions (28°C+), which accelerates top-note evaporation'
  if (temp_c >= 22) return 'in warm weather (22-27°C)'
  if (temp_c <= 10) return 'in cold air (≤10°C), which slows thermal diffusion and softens projection'
  if (humidity > 75) return 'in humid conditions (>75% humidity), which can mute perceived sillage'
  return 'in typical conditions'
}

function buildPrompt(body: AuraAdvisoryRequest, fragranceNotes: FragranceData | null): string {
  const weatherContext = weatherToContext(body.weather)

  if (body.context_type === 'detail') {
    return `Observe how "${fragranceNotes?.name ?? 'this fragrance'}" (${fragranceNotes?.family ?? 'unknown family'}, ${fragranceNotes?.projection ?? 'unknown'} projection) is likely to sit on skin ${weatherContext}. Ground the observation in evaporation rate or thermal diffusion.`
  }

  if (body.context_type === 'shelf') {
    const families = (body.shelf_context?.top_three ?? []).map(f => f.family).filter(Boolean)
    return `The wearer's top three shelf fragrances share this family signature: ${families.join(', ') || 'a shared profile'}. Observe the pattern without naming it a "type" or being prescriptive.`
  }

  if (body.context_type === 'post_wear') {
    return `The wearer just logged a wear of "${fragranceNotes?.name ?? 'a fragrance'}" ${weatherContext}. Offer one grounded observation about how today's conditions may affect how the rest of the wear reads.`
  }

  return `Offer one grounded, general observation about how skin chemistry or evaporation shapes how a fragrance is perceived over time.`
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: AURA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === 'text')
  return textBlock?.text?.trim() || ''
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = (await req.json()) as AuraAdvisoryRequest

    if (!body.fragrance_id || !body.context_type) {
      return new Response(JSON.stringify({ error: 'Missing fragrance_id or context_type' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const weatherState = body.weather ?? null

    let cacheQuery = supabase
      .from('aura_cache')
      .select('advice_text')
      .eq('fragrance_id', body.fragrance_id)
      .eq('context_type', body.context_type)
      .gt('expires_at', new Date().toISOString())

    cacheQuery = weatherState ? cacheQuery.eq('weather_state', weatherState) : cacheQuery.is('weather_state', null)

    const { data: cached } = await cacheQuery.maybeSingle()

    if (cached) {
      return new Response(JSON.stringify({ success: true, advice_text: cached.advice_text, from_cache: true }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    let fragranceNotes: FragranceData | null = body.fragrance_data ?? null
    if (!fragranceNotes) {
      const { data: frag } = await supabase
        .from('fragrances')
        .select('name, brand, family, projection, optimal_season')
        .eq('id', body.fragrance_id)
        .maybeSingle()
      fragranceNotes = frag as FragranceData | null
    }

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Aura is not configured' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const prompt = buildPrompt(body, fragranceNotes)
    let advice: string
    try {
      advice = await callClaude(prompt, anthropicKey)
    } catch (err) {
      console.error('Claude call failed:', err)
      advice = 'This fragrance reveals itself in its own time — skin chemistry shifts what you notice hour to hour.'
    }

    if (!advice) {
      advice = 'Each wear reads a little differently as skin temperature and evaporation shift through the day.'
    }

    await supabase.from('aura_cache').insert({
      fragrance_id: body.fragrance_id,
      context_type: body.context_type,
      weather_state: weatherState,
      advice_text: advice,
    })

    return new Response(JSON.stringify({ success: true, advice_text: advice, from_cache: false }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('aura-advisory error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
