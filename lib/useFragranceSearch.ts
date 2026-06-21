import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { createClient } from '@/utils/supabase/client'

export type DiscoverFragrance = {
  id: string
  brand: string
  name: string
  full_name: string
  family: string
  projection: string
  optimal_season: string | null
  plain_description: string | null
  inspired_by: string | null
  image_url: string | null
  rating: number | null
  created_at: string
  owner_count: number
}

export function useFragranceSearch(localFragrances: DiscoverFragrance[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [semanticResults, setSemanticResults] = useState<DiscoverFragrance[]>([])
  const [isSemanticSearching, setIsSemanticSearching] = useState(false)
  const [semanticError, setSemanticError] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  // Local fuzzy search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(localFragrances, {
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'brand', weight: 0.3 },
          { name: 'inspired_by', weight: 0.2 },
          { name: 'plain_description', weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [localFragrances]
  )

  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return localFragrances
    return fuse.search(debouncedSearch).map(r => r.item)
  }, [debouncedSearch, fuse, localFragrances])

  // Semantic vector search (if debouncedSearch)
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length === 0) {
      setSemanticResults([])
      setSemanticError(null)
      return
    }

    setIsSemanticSearching(true)
    setSemanticError(null)

    ;(async () => {
      try {
        const embRes = await fetch('/api/fragrances?search=' + encodeURIComponent(debouncedSearch), {
          method: 'GET',
        })
        if (!embRes.ok) {
          console.error('Embedding failed', embRes.status)
          setSemanticError('Failed to search fragrances. Try again.')
          return
        }
        const { similar_fragrances: results } = await embRes.json()
        setSemanticResults(
          (results ?? [])
            .slice(0, 6)
            .map((r: any) => ({
              id: r.id,
              brand: r.brand,
              name: r.name,
              full_name: r.full_name,
              family: r.family,
              projection: r.projection,
              optimal_season: r.optimal_season,
              plain_description: r.plain_description,
              inspired_by: r.inspired_by,
              image_url: r.image_url,
              rating: r.rating,
              created_at: r.created_at,
            }))
        )
        setSemanticError(null)
      } catch (e) {
        console.error('Vector search error', e)
        setSemanticError('Connection error while searching. Please try again.')
      } finally {
        setIsSemanticSearching(false)
      }
    })()
  }, [debouncedSearch])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    searchFocused,
    setSearchFocused,
    searchResults,
    semanticResults,
    isSemanticSearching,
    semanticError,
    setSemanticError,
  }
}
