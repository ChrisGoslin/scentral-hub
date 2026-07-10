'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type SavedCombination = {
  id: string
  name: string | null
  occasion: string | null
  created_at: string | null
  base_sprays: number | null
  top_sprays: number | null
  base_frag: { brand: string; name: string } | null
  top_frag: { brand: string; name: string } | null
}

export function useSavedCombinations(userId: string | null) {
  const [saves, setSaves] = useState<SavedCombination[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSaves = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('layer_recipes')
          .select(
            `
            id,
            name,
            occasion,
            created_at,
            base_sprays,
            top_sprays,
            base_frag:base_fragrance_id(brand, name),
            top_frag:top_fragrance_id(brand, name)
          `
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSaves((data || []) as unknown as SavedCombination[])
        setFetchError(null)
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : 'Failed to load saved combinations')
        setSaves([])
      } finally {
        setLoading(false)
      }
    }

    fetchSaves()
  }, [userId])

  return { saves, fetchError, loading }
}
