import { useState, useMemo, useEffect, useRef } from 'react'
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
  use_case: string | null
  plain_description: string | null
  inspired_by: string | null
  image_url: string | null
  rating: number | null
  created_at: string
  owner_count: number
}

const DB_SEARCH_LIMIT = 50

export function useFragranceSearch(localFragrances: DiscoverFragrance[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Full-DB ilike results
  const [dbResults, setDbResults] = useState<DiscoverFragrance[]>([])
  const [isDbSearching, setIsDbSearching] = useState(false)

  const [semanticResults, setSemanticResults] = useState<DiscoverFragrance[]>([])
  const [isSemanticSearching, setIsSemanticSearching] = useState(false)
  const [semanticError, setSemanticError] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  // Local fuzzy search with Fuse.js — instant fallback while DB query is in-flight
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

  const fuseResults = useMemo(() => {
    if (!debouncedSearch.trim()) return localFragrances
    return fuse.search(debouncedSearch).map(r => r.item)
  }, [debouncedSearch, fuse, localFragrances])

  // Full-DB ilike query — fires whenever debouncedSearch has 2+ chars
  useEffect(() => {
    const q = debouncedSearch.trim()
    if (q.length < 2) {
      setDbResults([])
      return
    }

    let cancelled = false
    setIsDbSearching(true)

    ;(async () => {
      try {
        const supabase = createClient()
        const pattern = `%${q}%`

        // Search name + brand + inspired_by with ilike, union via or()
        const { data, error } = await supabase
          .from('fragrances')
          .select(
            'id, brand, name, full_name, family, projection, optimal_season, use_case, plain_description, inspired_by, image_url, rating, created_at'
          )
          .or(`name.ilike.${pattern},brand.ilike.${pattern},inspired_by.ilike.${pattern}`)
          .order('brand', { ascending: true })
          .limit(DB_SEARCH_LIMIT)

        if (cancelled) return
        if (error) {
          console.error('DB search error', error)
          setDbResults([])
          return
        }

        // Fetch owner counts for all returned fragrances (batched)
        const fragrances = data ?? []
        const ownerCounts: Record<string, number> = {}

        if (fragrances.length > 0) {
          try {
            const fragIds = fragrances.map(f => f.id)
            const { data: socialProof, error: spError } = await supabase.rpc(
              'get_fragrance_social_proof',
              { fragrance_ids: fragIds }
            )
            if (!spError && socialProof) {
              socialProof.forEach((row: { fragrance_id: string; owner_count: number }) => {
                ownerCounts[row.fragrance_id] = Number(row.owner_count)
              })
            }
          } catch (err) {
            console.error('Failed to fetch owner counts:', err)
          }
        }

        setDbResults(
          fragrances.map(f => ({
            id: f.id,
            brand: f.brand,
            name: f.name,
            full_name: f.full_name ?? `${f.brand} ${f.name}`,
            family: f.family ?? '',
            projection: f.projection ?? '',
            optimal_season: f.optimal_season ?? null,
            use_case: f.use_case ?? null,
            plain_description: f.plain_description ?? null,
            inspired_by: f.inspired_by ?? null,
            image_url: f.image_url ?? null,
            rating: f.rating ? Number(f.rating) : null,
            created_at: f.created_at,
            owner_count: ownerCounts[f.id] ?? 0,
          }))
        )
      } catch (e) {
        console.error('DB search exception', e)
        if (!cancelled) setDbResults([])
      } finally {
        if (!cancelled) setIsDbSearching(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  // searchResults: DB results when available, fuse fallback while in-flight
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return localFragrances
    if (dbResults.length > 0) return dbResults
    return fuseResults // instant result while DB query loads
  }, [debouncedSearch, dbResults, fuseResults, localFragrances])

  // Semantic vector search
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
            .map((r: DiscoverFragrance) => ({
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
              owner_count: r.owner_count ?? 0,
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
    isDbSearching,
    semanticResults,
    isSemanticSearching,
    semanticError,
    setSemanticError,
  }
}
