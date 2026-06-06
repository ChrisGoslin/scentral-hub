import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Helper to find note overlaps
function getOverlap(arr1: string[] = [], arr2: string[] = []) {
  const set1 = new Set(arr1.map(n => n.toLowerCase().trim()))
  const overlaps = arr2.filter(n => set1.has(n.toLowerCase().trim()))
  return overlaps
}

export async function POST(req: Request) {
  try {
    const { fragrance_a_id, fragrance_b_id, use_case = 'casual' } = await req.json()

    if (!fragrance_a_id || !fragrance_b_id) {
      return NextResponse.json({ error: 'Two fragrances are required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Check cache first (order independent)
    const { data: cached } = await supabase
      .from('chemist_cache')
      .select('result')
      .or(`and(fragrance_a_id.eq.${fragrance_a_id},fragrance_b_id.eq.${fragrance_b_id}),and(fragrance_a_id.eq.${fragrance_b_id},fragrance_b_id.eq.${fragrance_a_id})`)
      .single()

    if (cached) {
      return NextResponse.json({ success: true, ...cached.result, cached: true })
    }

    // Fetch fragrance details
    const { data: frags, error: fetchError } = await supabase
      .from('fragrances')
      .select('id, brand, name, family, top_notes, heart_notes, base_notes, projection, anosmia_risk, phase, lean, rating')
      .in('id', [fragrance_a_id, fragrance_b_id])

    if (fetchError || !frags || frags.length < 2) {
      return NextResponse.json({ error: 'Fragrances not found' }, { status: 404 })
    }

    const [fragA, fragB] = frags[0].id === fragrance_a_id ? [frags[0], frags[1]] : [frags[1], frags[0]]

    // 1. NOTE CONFLICT SCORE (0-100)
    const topOverlap = getOverlap(fragA.top_notes, fragB.top_notes)
    const heartOverlap = getOverlap(fragA.heart_notes, fragB.heart_notes)
    const baseOverlap = getOverlap(fragA.base_notes, fragB.base_notes)

    // Penalty: Base overlap is worst (heavy molecules), Top is redundant but okay
    let conflictScore = 100
    conflictScore -= (baseOverlap.length * 15)
    conflictScore -= (heartOverlap.length * 10)
    conflictScore -= (topOverlap.length * 5)
    conflictScore = Math.max(0, conflictScore)

    // 2. VOLATILITY STACK SCORE
    let volatilityScore = 50
    const p1 = fragA.phase
    const p2 = fragB.phase

    if ((p1 === 1 && p2 === 1)) volatilityScore -= 20 // two anchors clash
    if ((p1 === 1 && p2 === 3) || (p1 === 3 && p2 === 1)) volatilityScore += 30 // perfect stack
    if (p1 === 2 && p2 === 2) volatilityScore -= 10 // mid-heavy
    if ((p1 === 1 && p2 === 2) || (p1 === 2 && p2 === 1)) volatilityScore += 15 // good transition
    volatilityScore = Math.max(0, Math.min(100, volatilityScore))

    // 3. PROJECTION BALANCE SCORE
    let projectionScore = 60
    const projA = fragA.projection
    const projB = fragB.projection

    if (projA === 'Beast Mode' && projB === 'Beast Mode') projectionScore -= 30 // anosmia city
    if ((projA === 'Beast Mode' && ['Medium', 'Moderate'].includes(projB)) || 
        (projB === 'Beast Mode' && ['Medium', 'Moderate'].includes(projA))) {
      projectionScore += 25 // ideal contrast
    }
    projectionScore = Math.max(0, Math.min(100, projectionScore))

    const totalChemistScore = Math.round((conflictScore * 0.4) + (volatilityScore * 0.3) + (projectionScore * 0.3))

    // Call Claude for synthesis
    const prompt = `You are the Scentral Olfactory Chemist. Analyze the following two fragrances for molecular compatibility.
    
    FRAGRANCE A: ${fragA.brand} ${fragA.name} (${fragA.family})
    Phase: ${fragA.phase}, Projection: ${fragA.projection}, Risk: ${fragA.anosmia_risk}
    Notes: Top: ${fragA.top_notes?.join(', ')}, Heart: ${fragA.heart_notes?.join(', ')}, Base: ${fragA.base_notes?.join(', ')}

    FRAGRANCE B: ${fragB.brand} ${fragB.name} (${fragB.family})
    Phase: ${fragB.phase}, Projection: ${fragB.projection}, Risk: ${fragB.anosmia_risk}
    Notes: Top: ${fragB.top_notes?.join(', ')}, Heart: ${fragB.heart_notes?.join(', ')}, Base: ${fragB.base_notes?.join(', ')}

    COMPUTED SCORES:
    Note Conflict: ${conflictScore}/100
    Volatility Stack: ${volatilityScore}/100
    Projection Balance: ${projectionScore}/100
    Total Chemist Score: ${totalChemistScore}/100
    Use Case: ${use_case}

    Return a scientific JSON response only:
    {
      "verdict": "Harmonious | Complementary | Neutral | Risky | Clash",
      "chemist_note": "2-3 sentence scientific explanation of why these molecules work or conflict",
      "application_protocol": ["step 1", "step 2", "step 3"],
      "synergy_accords": ["accord 1", "accord 2"],
      "caution": "string or null"
    }`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const contentBlock = response.content[0]
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }
    const claudeResult = JSON.parse(contentBlock.text)

    const finalResult = {
      chemist_score: totalChemistScore,
      conflict_score: conflictScore,
      volatility_score: volatilityScore,
      projection_score: projectionScore,
      claude_result: claudeResult
    }

    // Cache the result
    await supabase.from('chemist_cache').insert({
      fragrance_a_id,
      fragrance_b_id,
      result: finalResult
    })

    return NextResponse.json({ success: true, ...finalResult })

  } catch (error: any) {
    console.error('Chemist API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
