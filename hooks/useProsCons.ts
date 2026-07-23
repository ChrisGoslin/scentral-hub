/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'

interface UseProsConsParams {
  endpoint: string
  body: Record<string, any>
}

interface UseProsConsResult {
  pros: string[]
  cons: string[]
  loading: boolean
  error: boolean
  retry: () => void
}

export function useProsCons({ endpoint, body }: UseProsConsParams): UseProsConsResult {
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const bodyString = JSON.stringify(body)

  const fetchVerdict = useCallback(async () => {
    setError(false)
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (data.unavailable) {
        setError(true)
      } else {
        setPros(data.pros ?? [])
        setCons(data.cons ?? [])
        setError(false)
      }
    } catch (err) {
      console.error('useProsCons fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [endpoint, bodyString])

  useEffect(() => {
    fetchVerdict()
  }, [fetchVerdict])

  return {
    pros,
    cons,
    loading,
    error,
    retry: fetchVerdict,
  }
}
