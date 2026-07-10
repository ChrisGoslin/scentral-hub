import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * Manual trigger for noseprint evolution detection.
 * POST /api/evolution/detect — run detection for current user (anon_id from localStorage)
 * Query params: ?limit=10 (for testing, default all)
 *
 * In production, this would be called by a scheduled cron job or Edge Function timer.
 */

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get current user context if available (optional for debug)
    const { data: { session } } = await supabase.auth.getSession()
    const anonId = session?.user?.id || null

    if (!anonId) {
      return new Response(
        JSON.stringify({ error: 'No authenticated user; must be called with anon_id context' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get recent collections for this user
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentCollections, error: collectionsError } = await supabase
      .from('collections')
      .select('fragrance_id, affinity_score, scent_memory')
      .eq('anon_id', anonId)
      .gte('updated_at', thirtyDaysAgo.toISOString())

    if (collectionsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch collections', details: collectionsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!recentCollections || recentCollections.length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: 'Not enough recent interactions',
          interactions_count: recentCollections?.length || 0,
          min_required: 10
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get fragrance families
    const fragranceIds = recentCollections.map(c => c.fragrance_id)
    const { data: fragrances } = await supabase
      .from('fragrances')
      .select('id, family')
      .in('id', fragranceIds)

    // Calculate family distribution
    const familyDist: { [key: string]: number } = {}
    for (const f of fragrances || []) {
      if (f.family) {
        familyDist[f.family] = (familyDist[f.family] || 0) + 1
      }
    }

    const topFamilies = Object.entries(familyDist)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([fam]) => fam)

    // Analyze descriptors
    const memories = recentCollections
      .map(c => c.scent_memory)
      .filter(Boolean)

    const descriptorKeywords = ['woody', 'floral', 'fresh', 'fruity', 'spicy', 'oriental', 'musky', 'citrus', 'sweet']
    const foundDescriptors: { [key: string]: number } = {}

    for (const mem of memories) {
      for (const kw of descriptorKeywords) {
        if ((mem as string).toLowerCase().includes(kw)) {
          foundDescriptors[kw] = (foundDescriptors[kw] || 0) + 1
        }
      }
    }

    const sortedDescriptors = Object.entries(foundDescriptors)
      .sort(([, a], [, b]) => b - a)
      .map(([d]) => d)

    const novelDescriptors = sortedDescriptors.slice(0, 3).length

    // Determine if shift detected
    const familyShift = topFamilies.length > 0 ? 0.25 : 0 // Simplified heuristic
    const shiftDetected = familyShift > 0.2 || novelDescriptors > 3

    if (!shiftDetected) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: 'No significant shift detected',
          family_shift: familyShift,
          novel_descriptors: novelDescriptors,
          top_families: topFamilies,
          descriptors: sortedDescriptors
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Map to new persona (simplified heuristic)
    const mapAnalysisToPersona = (families: string[], descriptors: string[]): string => {
      const descriptorStr = descriptors.join(',')

      if (families.includes('Citrus') || descriptorStr.includes('fresh')) {
        return 'solar_minimalist'
      }
      if (families.includes('Woody') || descriptorStr.includes('spicy')) {
        return 'dark_alchemist'
      }
      if (families.includes('Floral') || descriptorStr.includes('sweet')) {
        return 'ritual_keeper'
      }
      if (descriptorStr.includes('musky')) {
        return 'rebel_experimentalist'
      }
      if (families.includes('Oriental')) {
        return 'velvet_intellectual'
      }

      return 'comfort_seeker'
    }

    const newPersona = mapAnalysisToPersona(topFamilies, sortedDescriptors)

    // Get current noseprint
    const { data: currentNoseprint } = await supabase
      .from('noseprint_history')
      .select('identity_json, version')
      .eq('anon_id', anonId)
      .eq('status', 'current')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const oldPersona = currentNoseprint?.identity_json?.persona_id || 'unknown'
    const oldVersion = currentNoseprint?.version || 0

    // Create evolution event
    const { data: evolutionEvent, error: eventError } = await supabase
      .from('evolution_events')
      .insert({
        anon_id: anonId,
        old_identity: oldPersona,
        new_identity: newPersona,
        shift_type: familyShift > 0.2 ? 'family_shift' : 'descriptor_drift',
        confidence: Math.min(100, Math.round(familyShift * 100 + novelDescriptors * 15)),
        status: 'active',
        user_choice: null
      })
      .select()
      .single()

    if (eventError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create evolution event', details: eventError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mark old noseprint as previous
    if (currentNoseprint) {
      await supabase
        .from('noseprint_history')
        .update({ status: 'previous' })
        .eq('anon_id', anonId)
        .eq('version', currentNoseprint.version)
    }

    // Insert new noseprint snapshot
    await supabase
      .from('noseprint_history')
      .insert({
        anon_id: anonId,
        version: oldVersion + 1,
        identity_json: {
          persona_id: newPersona,
          confidence: evolutionEvent.confidence,
          detected_at: new Date().toISOString(),
          reason: familyShift > 0.2 ? `Top families shifted to ${topFamilies.join(', ')}` : `Descriptor pattern evolved with ${novelDescriptors} new dominants`
        },
        status: 'current'
      })

    return new Response(
      JSON.stringify({
        success: true,
        evolution_event: evolutionEvent,
        old_persona: oldPersona,
        new_persona: newPersona,
        confidence: evolutionEvent.confidence,
        analysis: {
          top_families: topFamilies,
          descriptors: sortedDescriptors,
          family_shift: familyShift,
          novel_descriptors: novelDescriptors,
          interactions_count: recentCollections.length
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Evolution detection error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
