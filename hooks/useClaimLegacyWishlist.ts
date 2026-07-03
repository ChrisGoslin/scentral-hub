import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { claimLegacyWishlist } from '@/lib/auth/claimLegacyData'

/**
 * Hook to claim localStorage wishlist into collections table on first authenticated session
 * Run this in a top-level component that renders after auth is confirmed
 */
export function useClaimLegacyWishlist(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    const claim = async () => {
      try {
        const supabase = createClient()
        await claimLegacyWishlist(supabase, userId)
      } catch (err) {
        console.error('Failed to claim legacy wishlist:', err)
      }
    }

    claim()
  }, [userId])
}
