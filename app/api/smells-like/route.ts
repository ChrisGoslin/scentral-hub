import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

type SearchTerms = {
  families: string[]
  notes: string[]
  occasions: string[]
  longevity: string | null
}

const SYSTEM_PROMPT = `You are a fragrance expert helping users find their perfect scent.

A user has described what they want to smell like. Your job is to extract search terms from their description.

Return a JSON object with exactly this structure:
{
  "families": ["family1", "family2"],
  "notes": ["note1", "note2"],
  "occasions": ["occasion1"],
  "longevity": "Beast Mode" | "Strong" | "Moderate" | "Medium" | "Weak" | null
}

Rules:
- families: Extract fragrance families (floral, woody, citrus, oriental, fresh, aromatic, etc.)
- notes: Extract specific scent notes mentioned (e.g., amber, vanilla, sandalwood, vetiver, bergamot)
- occasions: Extract use cases (work, casual, date, formal, travel, gym, office-safe, etc.)
- longevity: Only include if user mentions duration/projection. Use ONLY these values: Beast Mode, Strong, Moderate, Medium, Weak. If not mentioned, set to null.

Be inclusive — if they say "warm," include woody/oriental families. If they mention "office," include office-safe occasions.
Always return valid JSON only. No markdown, no preamble.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body as { query?: string }

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Smells Like search is not configured' },
        { status: 500 }
      )
    }

    // Call Claude Haiku to parse the query
    const anthropic = new Anthropic({ apiKey })

    let response
    try {
      response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Parse this scent description: "${query.trim()}"`,
          },
        ],
      })
    } catch (claudeError) {
      console.error('Claude API error:', claudeError)
      return NextResponse.json(
        { error: 'Failed to call Claude API' },
        { status: 500 }
      )
    }

    // Extract the text content from the response
    const content = response.content[0]
    if (content.type !== 'text') {
      console.error('Unexpected response type from Claude:', content.type)
      throw new Error('Unexpected response type from Claude')
    }

    let searchTerms: SearchTerms
    try {
      searchTerms = JSON.parse(content.text)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text, parseError)
      return NextResponse.json(
        { error: 'Failed to parse search query' },
        { status: 500 }
      )
    }

    // Query Supabase for matching fragrances
    const supabase = await createClient()
    let baseQuery = supabase
      .from('fragrances')
      .select(
        'id, brand, name, full_name, family, projection, optimal_season, plain_description, inspired_by, image_url, rating, created_at'
      )

    // Build filter conditions
    const conditions: string[] = []

    // Family filter (OR logic)
    if (searchTerms.families.length > 0) {
      const familyConditions = searchTerms.families
        .map(f => `family.ilike.%${f.trim()}%`)
        .join(',')
      conditions.push(`(${familyConditions})`)
    }

    // Note filter (OR logic) — search in description and inspired_by
    if (searchTerms.notes.length > 0) {
      const noteConditions = searchTerms.notes
        .map(n => `plain_description.ilike.%${n.trim()}%,inspired_by.ilike.%${n.trim()}%`)
        .join(',')
      conditions.push(`(${noteConditions})`)
    }

    // Occasion filter (OR logic) — search in use_case
    if (searchTerms.occasions.length > 0) {
      const occasionConditions = searchTerms.occasions
        .map(o => `use_case.ilike.%${o.trim()}%`)
        .join(',')
      conditions.push(`(${occasionConditions})`)
    }

    // Longevity filter (single match)
    if (searchTerms.longevity) {
      conditions.push(`projection.eq.${searchTerms.longevity}`)
    }

    // Apply filters
    if (conditions.length > 0) {
      baseQuery = baseQuery.or(conditions.join(','))
    }

    const { data, error } = await baseQuery
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    // Transform results to match SmellsLikeResult type
    const results = (data ?? []).map(f => ({
      fragrance: {
        id: f.id,
        brand: f.brand,
        name: f.name,
        family: f.family ?? '',
        image_url: f.image_url,
      },
      matchType: 'exact' as const,
      confidence: 100,
    }))

    return NextResponse.json({ results, searchTerms })
  } catch (error) {
    console.error('Smells Like error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
