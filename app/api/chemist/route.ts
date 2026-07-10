import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/chemist
 * Analytical output for fragrance layering and dry-down profiling.
 *
 * Request:
 *   { fragranceId: string, layerId?: string }
 *
 * Response:
 *   { similarity?, phaseCancellation?, dryDown }
 */

export async function POST(req: Request) {
  try {
    const { fragranceId, layerId } = await req.json()

    if (!fragranceId) {
      return NextResponse.json({ error: 'fragranceId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch primary fragrance
    const { data: frag, error: fragError } = await supabase
      .from('fragrances')
      .select('id, brand, name, notes')
      .eq('id', fragranceId)
      .single()

    if (fragError || !frag) {
      return NextResponse.json({ error: 'Fragrance not found' }, { status: 404 })
    }

    const result: {
      similarity?: { score: number; label: string; explanation: string }
      phaseCancellation?: { warning: boolean; message: string }
      dryDown?: {
        topPeakMins: number
        heartPeakMins: number
        baseSettleMins: number
        timeline: Array<{ minute: number; dominantClass: string }>
      }
    } = {}

    // 1. SIMILARITY (if layerId provided)
    if (layerId) {
      const { data: layerFrag, error: layerError } = await supabase
        .from('fragrances')
        .select('id, brand, name, notes')
        .eq('id', layerId)
        .single()

      if (layerError || !layerFrag) {
        return NextResponse.json({ error: 'Layer fragrance not found' }, { status: 404 })
      }

      // Parse note strings into sets (comma-separated)
      const notesA = new Set(
        (frag.notes ?? '')
          .split(',')
          .map((n: string) => n.trim().toLowerCase())
          .filter((n: string) => n.length > 0)
      )
      const notesB = new Set(
        (layerFrag.notes ?? '')
          .split(',')
          .map((n: string) => n.trim().toLowerCase())
          .filter((n: string) => n.length > 0)
      )

      // Jaccard similarity: |intersection| / |union|
      const intersection = new Set([...notesA].filter(n => notesB.has(n)))
      const union = new Set([...notesA, ...notesB])
      const jaccardScore = union.size > 0 ? intersection.size / union.size : 0

      // Map score to label
      let label: 'Clone' | 'Close' | 'Complementary' | 'Contrasting'
      if (jaccardScore >= 0.82) {
        label = 'Clone'
      } else if (jaccardScore >= 0.6) {
        label = 'Close'
      } else if (jaccardScore >= 0.35) {
        label = 'Complementary'
      } else {
        label = 'Contrasting'
      }

      result.similarity = {
        score: parseFloat(jaccardScore.toFixed(2)),
        label,
        explanation: `${frag.brand} ${frag.name} and ${layerFrag.brand} ${layerFrag.name} share ${Math.round(jaccardScore * 100)}% of their note profiles.`,
      }
    }

    // 2. PHASE CANCELLATION (if layerId provided)
    if (layerId) {
      const { data: layerFrag, error: layerError } = await supabase
        .from('fragrances')
        .select('id, brand, name, notes')
        .eq('id', layerId)
        .single()

      if (!layerError && layerFrag) {
        // Parse notes and fetch volatility data
        const notesA = (frag.notes ?? '')
          .split(',')
          .map((n: string) => n.trim().toLowerCase())
          .filter((n: string) => n.length > 0)
        const notesB = (layerFrag.notes ?? '')
          .split(',')
          .map((n: string) => n.trim().toLowerCase())
          .filter((n: string) => n.length > 0)

        // Fetch note properties from fragrance_notes
        const { data: notePropsA } = await supabase
          .from('fragrance_notes')
          .select('name, volatility_class, molecular_weight')
          .in('name', notesA)

        const { data: notePropsB } = await supabase
          .from('fragrance_notes')
          .select('name, volatility_class, molecular_weight')
          .in('name', notesB)

        // Check for phase cancellation:
        // If A has top notes (MW < 150) AND B has base notes (MW > 220)
        const topNotesA = notePropsA?.filter(n => n.volatility_class === 'top') ?? []
        const baseNotesB = notePropsB?.filter(n => n.volatility_class === 'base') ?? []

        const hasConflict = topNotesA.length > 0 && baseNotesB.length > 0

        if (hasConflict) {
          result.phaseCancellation = {
            warning: true,
            message: `These scents fight for attention at different stages. Apply ${frag.brand} ${frag.name} to pulse points and ${layerFrag.brand} ${layerFrag.name} to fabric for the best result.`,
          }
        }
      }
    }

    // 3. DRY-DOWN TIMELINE
    const noteNames = (frag.notes ?? '')
      .split(',')
      .map((n: string) => n.trim().toLowerCase())
      .filter((n: string) => n.length > 0)

    const { data: noteProps } = await supabase
      .from('fragrance_notes')
      .select('volatility_class, molecular_weight')
      .in('name', noteNames)

    // Categorize notes by volatility
    const topNotes = noteProps?.filter(n => n.volatility_class === 'top') ?? []
    const heartNotes = noteProps?.filter(n => n.volatility_class === 'heart') ?? []
    const baseNotes = noteProps?.filter(n => n.volatility_class === 'base') ?? []

    // Build timeline based on evaporation rates
    // Top: peak 0-30 mins, fades by 60 mins
    // Heart: peak 30-90 mins, fades by 180 mins
    // Base: settles 90+ mins, lasts 4-8 hours
    const timeline: Array<{ minute: number; dominantClass: string }> = []

    if (topNotes.length > 0) {
      timeline.push({ minute: 0, dominantClass: 'top' })
    }
    if (heartNotes.length > 0) {
      timeline.push({ minute: 30, dominantClass: 'heart' })
    }
    if (baseNotes.length > 0) {
      timeline.push({ minute: 120, dominantClass: 'base' })
    }

    // If no notes found in fragrance_notes, still return basic timeline
    if (timeline.length === 0) {
      timeline.push({ minute: 0, dominantClass: 'top' })
      timeline.push({ minute: 30, dominantClass: 'heart' })
      timeline.push({ minute: 120, dominantClass: 'base' })
    }

    result.dryDown = {
      topPeakMins: topNotes.length > 0 ? 30 : 0,
      heartPeakMins: heartNotes.length > 0 ? 90 : 0,
      baseSettleMins: baseNotes.length > 0 ? 120 : 0,
      timeline,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Chemist API Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
