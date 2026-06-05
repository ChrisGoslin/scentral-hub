// app/api/aura/route.ts
// AURA — Automated Unification & Resonance Alchemist
// POST /api/aura
// Input: { base_fragrance_id?, use_case, time_of_day, weather? }
// Output: ranked layering recommendations from the collection with harmony scores

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// Use-case → phase preference + family affinities
const USE_CASE_PROFILE: Record<string, {
  preferred_phases: number[]
  avoid_families: string[]
  prefer_families: string[]
  max_projection: string[]
  description: string
}> = {
  work: {
    preferred_phases: [2, 3],
    avoid_families: ['Amber Gourmand', 'Coffee Gourmand', 'Smoky Leather', 'Smoky Woody'],
    prefer_families: ['Aromatic Woody', 'Fresh Aromatic', 'Woody Citrus', 'Musky Fresh'],
    max_projection: ['Medium', 'Moderate', 'Strong'],
    description: 'Office-appropriate — clean, moderate, non-invasive',
  },
  date: {
    preferred_phases: [1, 2],
    avoid_families: ['Fresh Aquatic', 'Citrus Aromatic'],
    prefer_families: ['Spicy Amber', 'Leather Oriental', 'Oriental Amber', 'Woody Gourmand'],
    max_projection: ['Strong', 'Beast Mode'],
    description: 'Intimate, sensual, memorable',
  },
  casual: {
    preferred_phases: [2, 3],
    avoid_families: [],
    prefer_families: ['Aromatic Woody', 'Fruity Chypre', 'Fresh Aromatic'],
    max_projection: ['Medium', 'Moderate', 'Strong'],
    description: 'Relaxed, approachable, versatile',
  },
  interview: {
    preferred_phases: [2, 3],
    avoid_families: ['Amber Gourmand', 'Smoky Leather', 'Coffee Gourmand', 'Boozy Gourmand'],
    prefer_families: ['Woody Citrus', 'Aromatic Woody', 'Musky Fresh', 'Powdery Woody'],
    max_projection: ['Medium', 'Moderate'],
    description: 'Authoritative but restrained — commands respect',
  },
  home: {
    preferred_phases: [1, 2],
    avoid_families: [],
    prefer_families: ['Amber Gourmand', 'Vanilla Amber', 'Creamy Gourmand', 'Lactonic Gourmand'],
    max_projection: ['Medium', 'Moderate', 'Strong', 'Beast Mode'],
    description: 'Cozy, comforting, indulgent',
  },
  gym: {
    preferred_phases: [3],
    avoid_families: ['Amber Gourmand', 'Leather Oriental', 'Oud Amber'],
    prefer_families: ['Fresh Aquatic', 'Citrus Aromatic', 'Fruity Aquatic', 'Aromatic Fresh'],
    max_projection: ['Medium', 'Moderate'],
    description: 'Light, clean, energising',
  },
  evening: {
    preferred_phases: [1, 2],
    avoid_families: ['Fresh Aquatic', 'Citrus Aromatic'],
    prefer_families: ['Spicy Amber', 'Oriental Amber', 'Leather Oriental', 'Smoky Woody', 'Boozy Gourmand'],
    max_projection: ['Strong', 'Beast Mode'],
    description: 'Bold, complex, long-lasting sillage',
  },
}

// Weather modifier — adjusts phase and family preferences
function weatherModifier(temp_c: number, humidity: number) {
  if (temp_c >= 25) {
    // Hot: prefer light, aquatic, citrus tops; penalise heavy bases
    return { boost_phases: [3], penalise_families: ['Amber Gourmand', 'Leather Oriental', 'Smoky Woody'] }
  }
  if (temp_c <= 10) {
    // Cold: prefer warm anchors, gourmands, orientals
    return { boost_phases: [1], penalise_families: ['Fresh Aquatic', 'Citrus Aromatic'] }
  }
  if (humidity > 75) {
    // Humid: prefer dry, woody, avoid heavy musks that amplify
    return { boost_phases: [2], penalise_families: ['Amber Gourmand', 'Lactonic Gourmand'] }
  }
  return { boost_phases: [2], penalise_families: [] }
}

// Score a candidate fragrance against context
function scoreCandidate(
  frag: Record<string, any>,
  profile: typeof USE_CASE_PROFILE[string],
  weather: { boost_phases: number[]; penalise_families: string[] },
  basePhase: number | null
): number {
  let score = 50

  // Phase preference
  if (frag.phase && profile.preferred_phases.includes(frag.phase)) score += 20
  if (frag.phase && weather.boost_phases.includes(frag.phase)) score += 10

  // Complementary phase to base (avoid same-phase clashes)
  if (basePhase && frag.phase === basePhase) score -= 15
  if (basePhase === 1 && frag.phase === 3) score += 15 // anchor + top = ideal
  if (basePhase === 1 && frag.phase === 2) score += 10

  // Family affinity
  if (frag.family && profile.prefer_families.some((f: string) => frag.family.includes(f))) score += 15
  if (frag.family && profile.avoid_families.some((f: string) => frag.family.includes(f))) score -= 25
  if (frag.family && weather.penalise_families.some((f: string) => frag.family.includes(f))) score -= 15

  // Projection fit
  if (frag.projection && profile.max_projection.includes(frag.projection)) score += 10

  // Rating boost
  if (frag.rating) score += Math.min(frag.rating, 10) * 1.5

  // Anosmia risk penalty (avoid stacking two High-risk)
  if (frag.anosmia_risk === 'High') score -= 5

  return Math.max(0, Math.min(100, score))
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const body = await req.json()
    const {
      base_fragrance_id,
      use_case = 'casual',
      time_of_day = 'evening',
      weather,
    }: {
      base_fragrance_id?: string
      use_case?: string
      time_of_day?: string
      weather?: { temp_c: number; humidity: number }
    } = body

    const profile = USE_CASE_PROFILE[use_case] ?? USE_CASE_PROFILE.casual

    // Fetch base fragrance if provided
    let baseFrag: Record<string, any> | null = null
    if (base_fragrance_id) {
      const { data } = await supabase
        .from('fragrances')
        .select('id, brand, name, family, phase, phase_label, projection, anosmia_risk, lean, rating, use_case, embedding')
        .eq('id', base_fragrance_id)
        .single()
      baseFrag = data
    }

    // If base has embedding, use pgvector resonance_match to find chemically similar
    let resonanceResults: Array<{ id: string; similarity: number }> = []
    if (baseFrag?.embedding) {
      const { data: resonance } = await supabase.rpc('resonance_match', {
        query_embedding: baseFrag.embedding,
        match_threshold: 0.2,
        match_count: 20,
      })
      if (resonance) {
        resonanceResults = resonance.filter((r: any) => r.id !== base_fragrance_id)
      }
    }

    // Fetch all candidate fragrances (exclude base)
    let query = supabase
      .from('fragrances')
      .select('id, brand, name, family, phase, phase_label, projection, anosmia_risk, lean, rating, use_case, image_url')
      .order('brand')

    if (base_fragrance_id) {
      query = query.neq('id', base_fragrance_id)
    }

    const { data: candidates, error } = await query

    if (error || !candidates) {
      return NextResponse.json({ error: 'Failed to fetch fragrances' }, { status: 500 })
    }

    // Build resonance lookup map
    const resonanceMap = new Map(resonanceResults.map(r => [r.id, r.similarity]))

    // Weather modifier
    const weatherMod = weather
      ? weatherModifier(weather.temp_c, weather.humidity)
      : { boost_phases: [2], penalise_families: [] }

    // Score all candidates
    const scored = candidates.map(frag => {
      let score = scoreCandidate(frag, profile, weatherMod, baseFrag?.phase ?? null)

      // Blend in resonance similarity if available (0–1 → 0–20 bonus)
      const similarity = resonanceMap.get(frag.id)
      if (similarity !== undefined) {
        score += similarity * 20
      }

      const harmonyPct = Math.round(Math.min(score, 100))

      return {
        ...frag,
        harmony_pct: harmonyPct,
        layering_role: frag.phase === 1 ? 'Anchor' : frag.phase === 2 ? 'Modulator' : 'Top Layer',
        resonance_similarity: similarity ?? null,
      }
    })

    // Sort by score descending, take top 6
    const recommendations = scored
      .sort((a, b) => b.harmony_pct - a.harmony_pct)
      .slice(0, 6)

    // Build AURA's reasoning summary
    const aura_context = {
      use_case,
      time_of_day,
      profile_description: profile.description,
      weather_condition: weather
        ? weather.temp_c >= 25 ? 'Hot — lighter layers recommended'
          : weather.temp_c <= 10 ? 'Cold — warm anchors preferred'
          : weather.humidity > 75 ? 'Humid — dry woods recommended'
          : 'Temperate — balanced recommendations'
        : 'No weather data',
      base_fragrance: baseFrag ? `${baseFrag.brand} ${baseFrag.name}` : 'AURA selected',
      resonance_engine: resonanceResults.length > 0 ? 'pgvector 3072-dim active' : 'heuristic mode',
    }

    return NextResponse.json({
      success: true,
      recommendations,
      aura_context,
      total_candidates: candidates.length,
    })
  } catch (err) {
    console.error('AURA route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
