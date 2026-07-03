/**
 * Temptation Trigger Logic
 *
 * High-affinity signals for Commerce AI:
 * 1. Repeat revisit: user viewed fragrance ≥3 times from collection detail page
 * 2. Wishlist age: fragrance in wishlist ≥14 days without being added to shelf
 * 3. Blind rank match: fragrance matches blind-ranking top pick but not in collection
 */

import { createClient } from '@supabase/supabase-js'

export interface TemptationTrigger {
  userId: string
  fragranceId: string
  reason: 'repeat_revisit' | 'wishlist_age' | 'blind_rank_match'
}

/**
 * Check for repeat revisits (≥3 views within 30 days)
 * Uses wear_logs or view tracking if available; fallback to collection access patterns.
 */
export async function checkRepeatRevisit(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<TemptationTrigger[]> {
  // TODO: Implement wear_logs analysis or view-tracking RPC
  // For now, this is a placeholder. In production, query wear_logs for
  // fragrances with ≥3 entries in the past 30 days where action='viewed'.
  return []
}

/**
 * Check for long-wishlist items (≥14 days, not yet added to shelf)
 */
export async function checkWishlistAge(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<TemptationTrigger[]> {
  const triggers: TemptationTrigger[] = []

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data, error } = await supabase
    .from('collections')
    .select('fragrance_id')
    .eq('user_id', userId)
    .eq('status', 'wishlist')
    .lt('created_at', twoWeeksAgo.toISOString())
    .limit(1)
    .returns<{ fragrance_id: string }[]>()

  if (error) {
    console.error('checkWishlistAge error:', error)
    return []
  }

  if (data && data.length > 0 && data[0].fragrance_id) {
    triggers.push({
      userId,
      fragranceId: data[0].fragrance_id,
      reason: 'wishlist_age',
    })
  }

  return triggers
}

/**
 * Check for blind-rank matches (fragrance in top blind picks but not in collection)
 * This requires blind ranking data to be stored somewhere (likely in profiles or a new table).
 */
export async function checkBlindRankMatch(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<TemptationTrigger[]> {
  // TODO: Implement blind ranking matching
  // Query user's blind_rank_top_picks (if stored in profiles.metadata or separate table)
  // Cross-reference against collections — if match and not in collection, trigger.
  return []
}

/**
 * Get all active triggers for a user (respecting max-1/week throttle)
 */
export async function getActiveTriggers(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<TemptationTrigger | null> {
  // Max 1 temptation surfaced per week, regardless of how it was resolved.
  const weekStart = new Date()
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
  weekStart.setUTCHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from('temptations')
    .select('id')
    .eq('user_id', userId)
    .gte('shown_at', weekStart.toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return null // Already surfaced a temptation this week
  }

  const triggers = await Promise.all([
    checkRepeatRevisit(supabase, userId),
    checkWishlistAge(supabase, userId),
    checkBlindRankMatch(supabase, userId),
  ])

  const allTriggers = triggers.flat()
  return allTriggers.length > 0 ? allTriggers[0] : null
}
