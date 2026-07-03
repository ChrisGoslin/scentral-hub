import { useState, useEffect, useCallback } from 'react'

interface Temptation {
  id: string
  fragrance_id: string
  status: string
  reason?: string
  shown_at: string
}

interface UseTemptationsReturn {
  temptation: Temptation | null
  isLoading: boolean
  error: string | null
  updateStatus: (status: 'viewed' | 'wishlisted' | 'bought' | 'dismissed') => Promise<void>
  dismiss: () => Promise<void>
}

// Identity is derived server-side from the Supabase auth session cookie —
// this hook doesn't take or pass any user identifier.
export function useTemptations(enabled: boolean): UseTemptationsReturn {
  const [temptation, setTemptation] = useState<Temptation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchTemptation = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/temptations')
        if (!res.ok) throw new Error('Failed to fetch temptation')
        const data = await res.json()
        setTemptation(data.temptation)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemptation()
  }, [enabled])

  const updateStatus = useCallback(
    async (status: 'viewed' | 'wishlisted' | 'bought' | 'dismissed') => {
      if (!temptation) return

      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/temptations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temptationId: temptation.id,
            status,
          }),
        })

        if (!res.ok) throw new Error('Failed to update temptation')

        // Every PATCH resolves the temptation server-side, so clear it locally too.
        setTemptation(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    },
    [temptation]
  )

  const dismiss = useCallback(async () => {
    await updateStatus('dismissed')
  }, [updateStatus])

  return {
    temptation,
    isLoading,
    error,
    updateStatus,
    dismiss,
  }
}
