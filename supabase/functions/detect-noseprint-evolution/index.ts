import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2'

interface EvolutionDetectionResult {
  anon_id: string
  old_identity?: string
  new_identity?: string
  shift_type?: string
  confidence?: number
  reason?: string
}

interface FamilyDistribution {
  [key: string]: number
}

interface DescriptorPattern {
  descriptors: string[]
  frequency: number
}

type SupabaseClient = ReturnType<typeof createClient>

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all anon_ids with at least 10 interactions in past 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeUsers, error: userError } = await supabase
      .from('collections')
      .select('anon_id')
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .then((res) => {
        if (res.error) return res
        return {
          data: Array.from(new Set(res.data?.map((r: { anon_id: string }) => r.anon_id) || [])),
          error: null
        }
      })

    if (userError) {
      console.error('Error fetching active users:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch active users' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results: EvolutionDetectionResult[] = []

    for (const anon_id of activeUsers || []) {
      // Get current noseprint (latest in history)
      const { data: currentNoseprint } = await supabase
        .from('noseprint_history')
        .select('identity_json, version')
        .eq('anon_id', anon_id)
        .eq('status', 'current')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const oldPersona = currentNoseprint?.identity_json?.persona_id || null
      const oldVersion = currentNoseprint?.version || 0

      // Analyze recent interactions
      const analysis = await analyzeUserInteractions(supabase, anon_id)

      if (!analysis.detected) continue

      const { new_persona, shift_type, confidence, reason } = analysis

      // Check for full circle (new persona matches a kept/previous identity)
      const circleMatch = await checkFullCircle(supabase, anon_id, new_persona)

      // Create evolution_events record
      const { error: eventError } = await supabase
        .from('evolution_events')
        .insert({
          anon_id,
          old_identity: oldPersona || 'unknown',
          new_identity: new_persona,
          shift_type,
          confidence,
          status: 'active',
          user_choice: null
        })

      if (eventError) {
        console.error(`Error creating evolution event for ${anon_id}:`, eventError)
        continue
      }

      // Mark old noseprint as 'previous' if it exists
      if (currentNoseprint) {
        await supabase
          .from('noseprint_history')
          .update({ status: 'previous' })
          .eq('anon_id', anon_id)
          .eq('version', currentNoseprint.version)
      }

      // Insert new noseprint snapshot
      await supabase
        .from('noseprint_history')
        .insert({
          anon_id,
          version: oldVersion + 1,
          identity_json: {
            persona_id: new_persona,
            confidence,
            detected_at: new Date().toISOString(),
            reason,
            full_circle: circleMatch
          },
          status: 'current'
        })

      results.push({
        anon_id,
        old_identity: oldPersona,
        new_identity: new_persona,
        shift_type,
        confidence,
        reason: circleMatch ? `Full circle: returning to ${circleMatch}` : reason
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: activeUsers?.length || 0,
        evolutions_detected: results.length,
        results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('Noseprint evolution detection error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

type CollectionRow = {
  fragrance_id: string
  affinity_score: number | null
  scent_memory: string | null
}

async function analyzeUserInteractions(
  supabase: SupabaseClient,
  anon_id: string
): Promise<{
  detected: boolean
  new_persona?: string
  shift_type?: string
  confidence?: number
  reason?: string
}> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get recent shelf interactions (collections)
  const { data: recentCollections } = await supabase
    .from('collections')
    .select('fragrance_id, affinity_score, scent_memory')
    .eq('anon_id', anon_id)
    .gte('updated_at', thirtyDaysAgo.toISOString())

  if (!recentCollections || recentCollections.length < 10) {
    return { detected: false }
  }

  // Get fragrance families for recent interactions
  const fragranceIds = recentCollections.map((c: CollectionRow) => c.fragrance_id)
  const { data: fragrances } = await supabase
    .from('fragrances')
    .select('id, family')
    .in('id', fragranceIds)

  // Calculate family distribution shift
  const familyDist = calculateFamilyDistribution(fragrances || [])
  const topFamilies = Object.entries(familyDist)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([fam]) => fam)

  // Analyze descriptor patterns in scent_memory
  const scent_memories = recentCollections
    .map((c: CollectionRow) => c.scent_memory)
    .filter(Boolean)

  const descriptors = extractDescriptors(scent_memories)

  // Determine if shift exceeds threshold (>20% family shift OR >3 new dominant descriptors)
  const familyShift = calculateFamilyShift(topFamilies)
  const descriptorNovelta = descriptors.novel_count

  if (familyShift > 0.2 || descriptorNovelta > 3) {
    const newPersona = mapAnalysisToPersona(topFamilies, descriptors)

    return {
      detected: true,
      new_persona: newPersona,
      shift_type: familyShift > 0.2 ? 'family_shift' : 'descriptor_drift',
      confidence: Math.min(100, Math.round((familyShift * 100 + descriptorNovelta * 15))),
      reason:
        familyShift > 0.2
          ? `Top families shifted to ${topFamilies.join(', ')}`
          : `Descriptor pattern evolved with ${descriptorNovelta} new dominants`
    }
  }

  return { detected: false }
}

function calculateFamilyDistribution(fragrances: Array<{ id: string; family: string | null }>): FamilyDistribution {
  const dist: FamilyDistribution = {}
  for (const f of fragrances) {
    if (f.family) {
      dist[f.family] = (dist[f.family] || 0) + 1
    }
  }
  return dist
}

function calculateFamilyShift(topFamilies: string[]): number {
  // Simplified: >20% shift if top families changed significantly
  // In production: compare against previous 30-day baseline
  return topFamilies.length > 0 ? 0.25 : 0
}

function extractDescriptors(memories: string[]): DescriptorPattern {
  // Extract noun/adjective descriptors from scent_memory text
  const keywords = ['woody', 'floral', 'fresh', 'fruity', 'spicy', 'oriental', 'musky', 'citrus', 'sweet']
  const found: { [key: string]: number } = {}

  for (const mem of memories) {
    for (const kw of keywords) {
      if (mem.toLowerCase().includes(kw)) {
        found[kw] = (found[kw] || 0) + 1
      }
    }
  }

  const sorted = Object.entries(found).sort(([, a], [, b]) => b - a)
  const novel_count = sorted.length > 0 ? sorted.slice(0, 3).length : 0

  return {
    descriptors: sorted.map(([d]) => d),
    frequency: novel_count
  }
}

function mapAnalysisToPersona(topFamilies: string[], descriptors: DescriptorPattern): string {
  // Heuristic: map family distribution + descriptors to persona
  // solar_minimalist → citrus, fresh
  // dark_alchemist → woody, spicy, oriental
  // ritual_keeper → floral, warm
  // etc.

  const descriptorStr = descriptors.descriptors.join(',')

  if (topFamilies.includes('Citrus') || descriptorStr.includes('fresh')) {
    return 'solar_minimalist'
  }
  if (topFamilies.includes('Woody') || descriptorStr.includes('spicy')) {
    return 'dark_alchemist'
  }
  if (topFamilies.includes('Floral') || descriptorStr.includes('sweet')) {
    return 'ritual_keeper'
  }
  if (descriptorStr.includes('musky')) {
    return 'rebel_experimentalist'
  }
  if (topFamilies.includes('Oriental')) {
    return 'velvet_intellectual'
  }

  // Default: pick random
  return 'comfort_seeker'
}

async function checkFullCircle(
  supabase: SupabaseClient,
  anon_id: string,
  new_persona: string
): Promise<string | null> {
  // Check if new_persona matches any previous/kept identities
  const { data: history } = await supabase
    .from('noseprint_history')
    .select('identity_json')
    .eq('anon_id', anon_id)
    .in('status', ['previous', 'kept'])
    .order('created_at', { ascending: false })
    .limit(10)

  for (const record of history || []) {
    if (record.identity_json?.persona_id === new_persona) {
      return record.identity_json.persona_id
    }
  }

  return null
}
