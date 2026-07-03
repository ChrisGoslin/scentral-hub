import { useState, useEffect, useCallback } from 'react'

interface Temptation {
  id: string
  fragrance_id: string
  status: string
  trigger_reason?: string
  first_shown_at: string
  created_at: string
}

interface UseTemptationsReturn {
  temptation: Temptation | null
  isLoading: boolean
  error: string | null
  updateStatus: (status: 'viewed' | 'wishlisted' | 'bought' | 'dismissed') => Promise<void>
  dismiss: () => Promise<void>
}

export function useTemptations(anonId: string | null): UseTemptationsReturn {
  const [temptation, setTemptation] = useState<Temptation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch active temptation on mount
  useEffect(() => {
    if (!anonId) return

    const fetchTemptation = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/temptations?anonId=${encodeURIComponent(anonId)}`)
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
  }, [anonId])

  const updateStatus = useCallback(
    async (status: 'viewed' | 'wishlisted' | 'bought' | 'dismissed') => {
      if (!temptation || !anonId) return

      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/temptations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anonId,
            temptationId: temptation.id,
            status: status === 'dismissed' ? 'dismissed' : status,
          }),
        })

        if (!res.ok) throw new Error('Failed to update temptation')
        const data = await res.json()

        if (status === 'dismissed') {
          setTemptation(null)
        } else {
          setTemptation(data.temptation)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    },
    [temptation, anonId]
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
