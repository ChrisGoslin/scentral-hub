import { useState, useEffect, useRef } from 'react'

export type FragranceResult = {
  id: string
  brand: string
  name: string
  family: string
  image_url: string | null
}

export function useFragranceSearch(query: string) {
  const [results, setResults] = useState<FragranceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const handler = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller
      
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/fragrances?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setResults(data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }, 250) // debounce 250ms

    return () => {
      clearTimeout(handler)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query])

  return { results, loading, error }
}
