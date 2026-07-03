/**
 * Claim legacy anon_id data into authenticated user_id
 * Silently migrates: temptations, shelf_events, evolution_events, noseprint_history
 * Called on first authenticated session to preserve user history
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export async function claimLegacyData(
  supabase: SupabaseClient,
  userId: string,
  anonId: string
): Promise<void> {
  // Claim temptations
  await supabase
    .from('temptations')
    .update({ user_id: userId })
    .eq('anon_id', anonId)
    .is('user_id', null)
    .throwOnError()

  // Claim shelf_events
  await supabase
    .from('shelf_events')
    .update({ user_id: userId })
    .eq('anon_id', anonId)
    .is('user_id', null)
    .throwOnError()

  // Claim evolution_events
  await supabase
    .from('evolution_events')
    .update({ user_id: userId })
    .eq('anon_id', anonId)
    .is('user_id', null)
    .throwOnError()

  // Claim noseprint_history
  await supabase
    .from('noseprint_history')
    .update({ user_id: userId })
    .eq('anon_id', anonId)
    .is('user_id', null)
    .throwOnError()

  // Migrate user_xp if it exists
  const { data: xpRecord } = await supabase
    .from('user_xp')
    .select('*')
    .eq('anon_id', anonId)
    .maybeSingle()

  if (xpRecord) {
    // Insert into auth-keyed version (if one exists) or update the record with user_id
    // For now, assume user_xp stays anon_id keyed; this just marks it claimed
  }

  // Migrate localStorage scentral_wishlist → collections(user_id)
  // (Requires client-side code; see claimLegacyWishlist in useAuth)
}

/**
 * Claim localStorage wishlist into collections table
 * Must be called client-side where localStorage is accessible
 */
export async function claimLegacyWishlist(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const wishlistJson = typeof window !== 'undefined' ? localStorage.getItem('scentral_wishlist') : null
  if (!wishlistJson) return

  try {
    const wishlistIds = JSON.parse(wishlistJson) as string[]
    if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) return

    const toInsert = wishlistIds.map(fragranceId => ({
      user_id: userId,
      fragrance_id: fragranceId,
      status: 'wishlist' as const,
    }))

    await supabase
      .from('collections')
      .upsert(toInsert, { onConflict: 'user_id,fragrance_id' })
      .throwOnError()

    // Clear localStorage after successful migration
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scentral_wishlist')
    }
  } catch (err) {
    console.error('Failed to claim legacy wishlist:', err)
    // Don't throw — allow app to continue even if wishlist migration fails
  }
}
