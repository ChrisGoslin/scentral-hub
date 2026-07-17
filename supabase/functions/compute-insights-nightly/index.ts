import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'
import { computeCachedInsights, type CachedInsights } from '../../../lib/insights-impact.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function handler(): Promise<Response> {
  try {
    // Fetch all user ids from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) throw profilesError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No profiles to process' }), { status: 200 })
    }

    const userIds = profiles.map(p => p.id)

    // Process insights for each user
    const results: { user_id: string; status: 'success' | 'error'; error?: string }[] = []

    for (const userId of userIds) {
      try {
        const insights = await computeUserInsights(userId)
        if (insights) {
          const { error: upsertError } = await supabase
            .from('insights_cache')
            .upsert({
              user_id: userId,
              period: 'latest',
              payload: insights,
              computed_at: new Date().toISOString(),
            })
          if (upsertError) throw upsertError
          results.push({ user_id: userId, status: 'success' })
        }
      } catch (error) {
        console.error(`Error computing insights for ${userId}:`, error)
        results.push({ user_id: userId, status: 'error', error: String(error) })
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Nightly insights computation failed:', error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}

async function computeUserInsights(userId: string): Promise<CachedInsights | null> {
  try {
    return await computeCachedInsights(userId, {
      fetchRows: async (targetUserId) => {
        const [tracesResult, collectionsResult, shelfEventsResult] = await Promise.all([
          supabase.from('traces').select('id, body').eq('user_id', targetUserId).limit(100),
          supabase.from('collections').select('fragrance_id').eq('user_id', targetUserId),
          supabase.from('shelf_events').select('fragrance_id, created_at').eq('user_id', targetUserId).order('created_at', { ascending: true }),
        ])
        return {
          traces: tracesResult.data ?? [],
          collections: collectionsResult.data ?? [],
          shelfEvents: shelfEventsResult.data ?? [],
        }
      },
      fetchReactions: async (traceIds) => {
        if (traceIds.length === 0) return []
        const { data } = await supabase.from('trace_reactions').select('trace_id, reaction').in('trace_id', traceIds)
        return data ?? []
      },
      fetchFamilies: async (fragranceIds) => {
        if (fragranceIds.length === 0) return []
        const { data } = await supabase.from('fragrances').select('family').in('id', fragranceIds)
        return data ?? []
      },
    })
  } catch (error) {
    console.error(`Failed to compute insights for ${userId}:`, error)
    return null
  }
}

// Start the handler
Deno.serve(handler)
