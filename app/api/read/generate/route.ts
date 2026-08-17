import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'
import { parseReadIdentity } from '@/lib/ai/read-identity'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FEELINGS_META: Record<string, { families: string[]; archetype: string }> = {
  warm_skin:   { families: ['Woody', 'Oriental', 'Amber'],     archetype: 'sensual warmth' },
  rain_stone:  { families: ['Aquatic', 'Chypre', 'Green'],     archetype: 'atmospheric texture' },
  sunlit_wood: { families: ['Woody', 'Citrus', 'Fresh'],       archetype: 'radiant clarity' },
  night_air:   { families: ['Oriental', 'Floral', 'Musk'],     archetype: 'nocturnal mystery' },
  green_alive: { families: ['Green', 'Fresh', 'Aquatic'],      archetype: 'vital aliveness' },
  deep_rich:   { families: ['Oud', 'Resinous', 'Oriental'],   archetype: 'depth and gravity' },
  crisp_clean: { families: ['Citrus', 'Fresh', 'Aquatic'],    archetype: 'sharp precision' },
  soft_safe:   { families: ['Musk', 'Powder', 'Floral'],      archetype: 'quiet shelter' },
  smoke_ember: { families: ['Smoky', 'Leather', 'Woody'],     archetype: 'burning edge' },
  salt_breeze: { families: ['Aquatic', 'Citrus', 'Marine'],   archetype: 'restless freedom' },
  sweet_dark:  { families: ['Gourmand', 'Oriental', 'Vanilla'], archetype: 'seductive shadow' },
  wild_earth:  { families: ['Earthy', 'Aromatic', 'Green'],   archetype: 'untamed ground' },
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Server-side rate limit: max 1 Read generation per hour per user
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentReads } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('event_type', 'read_generated')
    .gte('created_at', oneHourAgo)

  if ((recentReads ?? 0) >= 1) {
    return NextResponse.json(
      { error: 'Rate limited. Try again later.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { feelings = [], ownedFamilies = [], signals = [] } = body

  // Derive archetypes and families from chosen feelings
  const archetypes = feelings.map((id: string) => FEELINGS_META[id]?.archetype).filter(Boolean)
  const families = [...new Set(feelings.flatMap((id: string) => FEELINGS_META[id]?.families ?? []))]
  const topFamilies = families.slice(0, 4)

  // Get 3 matching fragrances from catalog (text-based since embeddings are sparse)
  const { data: matches } = await supabase
    .from('fragrances')
    .select('id, name, brand, family, plain_description')
    .in('family', topFamilies)
    .not('plain_description', 'is', null)
    .order('popularity_rank', { ascending: true })
    .limit(20)

  const candidateList = (matches || [])
    .slice(0, 3)
    .map((f: { name: string; brand: string; family: string; plain_description?: string }) =>
      `${f.name} by ${f.brand} (${f.family}) — ${(f.plain_description || '').slice(0, 80)}`
    )
    .join('\n')

  // Determine dominant dwell signals for behavioural lines
  const topSignals = [...signals]
    .sort((a: { dwellMs: number }, b: { dwellMs: number }) => b.dwellMs - a.dwellMs)
    .slice(0, 3)
    .map((s: { chipId: string }) => FEELINGS_META[s.chipId]?.archetype)
    .filter(Boolean)

  const prompt = `You are writing the identity reveal for a fragrance app called nota.

The user chose these feeling-words to describe what draws them in: ${feelings.join(', ')}.
Their archetypes: ${archetypes.join(', ')}.
${ownedFamilies.length ? `Families they already own: ${ownedFamilies.join(', ')}.` : ''}
${topSignals.length ? `They lingered longest on: ${topSignals.join(', ')}.` : ''}

Fragrance candidates from the catalog:
${candidateList || 'No direct matches found — use your best judgment.'}

Write a Noseprint reveal in this exact JSON structure:
{
  "opening": "A single sharp sentence. Maximum 12 words. Must hit hard — like it knows them. No generic openers. No 'You are' starts.",
  "noseprintName": "Two or three words. Editorial serif quality. Not a fragrance name. A poetic identity label. Examples: The Still Night, Warm Gravity, Clear After Rain.",
  "descriptor": "One sentence. Second person. What their nose gravitates toward and why it's distinct.",
  "signals": [
    "Signal 1 — one sentence, behavioural, observational. Starts with 'You…'",
    "Signal 2 — one sentence, same format.",
    "Signal 3 — one sentence, same format."
  ],
  "stretchNote": "One sentence. A fragrance direction slightly beyond their comfort zone — written as an invitation, not a challenge."
}

Rules:
- The opening must stop them. Reread it. If it could describe anyone, rewrite it.
- The Noseprint name is the ONE thing they'll share. It must be worth sharing.
- Signals read like observations from someone watching closely, not a quiz result.
- No jargon. No fragrance note names. Emotion and sensation only.
- Second person throughout (you, your).`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { text: string }).text.trim()
  const identity = parseReadIdentity(raw)
  if (!identity) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }

  // Attach fragrance match IDs
  const matchIds = (matches || []).slice(0, 3).map((f: { id: string }) => f.id)
  const matchData = (matches || []).slice(0, 3).map((f: { id: string; name: string; brand: string; family: string }) => ({
    id: f.id,
    name: f.name,
    brand: f.brand,
    family: f.family,
  }))

  // Save interactions record
  await supabase.from('interactions').insert({
    user_id: user.id,
    event_type: 'read_generated',
    entity_type: 'noseprint',
    entity_id: null,
    metadata: { feelings, signals: signals.slice(0, 10) },
  })

  return NextResponse.json({
    identity,
    matchIds,
    matchData,
  })
}
