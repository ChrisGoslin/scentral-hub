'use client'

import { useState, useCallback } from 'react'

export interface ContextTags {
  weather: string
  occasion: string
}

export type OverallRating = 'like' | 'dislike' | null

export const WEATHER_OPTIONS = ['Hot', 'Mild', 'Cold'] as const
export const OCCASION_OPTIONS = ['Work', 'Casual', 'Evening', 'Sport'] as const

export function useWearLogForm() {
  const [overallRating, setOverallRating] = useState<OverallRating>(null)
  const [weather, setWeather] = useState<(typeof WEATHER_OPTIONS)[number] | ''>('')
  const [occasion, setOccasion] = useState<(typeof OCCASION_OPTIONS)[number] | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleWeather = useCallback((v: (typeof WEATHER_OPTIONS)[number]) => {
    setWeather((prev) => (prev === v ? '' : v))
  }, [])

  const toggleOccasion = useCallback((v: (typeof OCCASION_OPTIONS)[number]) => {
    setOccasion((prev) => (prev === v ? '' : v))
  }, [])

  const reset = useCallback(() => {
    setOverallRating(null)
    setWeather('')
    setOccasion('')
    setError(null)
  }, [])

  const toContextTags = useCallback((): ContextTags => {
    return {
      weather: weather || '',
      occasion: occasion || '',
    }
  }, [weather, occasion])

  return {
    overallRating,
    setOverallRating,
    weather,
    toggleWeather,
    occasion,
    toggleOccasion,
    error,
    setError,
    saving,
    setSaving,
    reset,
    toContextTags,
    WEATHER_OPTIONS,
    OCCASION_OPTIONS,
  }
}
