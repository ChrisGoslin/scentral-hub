'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AuraAdvisoryProps {
  fragranceId: string
  contextType: 'detail' | 'shelf' | 'general' | 'post_wear'
  fragranceData?: {
    name: string
    brand: string
    family: string
    projection: string
    optimal_season: string
  }
  shelfContext?: {
    top_three: Array<{ name: string; brand: string; family: string }>
  }
  className?: string
}

export default function AuraAdvisory({
  fragranceId,
  contextType,
  fragranceData,
  shelfContext,
  className = '',
}: AuraAdvisoryProps) {
  const [advice, setAdvice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdvice() {
      try {
        setLoading(true)
        setError(null)

        // Optional: fetch weather from a free API (e.g., open-meteo, which requires no key)
        let weather = null
        try {
          const abortController = new AbortController()
          const timeoutId = setTimeout(() => abortController.abort(), 3000) // 3s timeout

          const geoRes = await fetch('https://ipapi.co/json/', { signal: abortController.signal })
          const geoData = await geoRes.json()

          clearTimeout(timeoutId)

          if (geoData.latitude && geoData.longitude) {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`,
              { signal: abortController.signal }
            )
            const weatherData = await weatherRes.json()
            if (weatherData.current) {
              weather = {
                temp_c: weatherData.current.temperature_2m,
                humidity: weatherData.current.relative_humidity_2m,
              }
            }
          }
        } catch (err) {
          // Silently fail on weather; advice will still generate
          console.debug('Weather fetch failed (non-critical):', String(err))
        }

        const supabase = createClient()
        const { data, error: invokeError } = await supabase.functions.invoke('aura-advisory', {
          body: {
            fragrance_id: fragranceId,
            context_type: contextType,
            weather,
            fragrance_data: fragranceData,
            shelf_context: shelfContext,
          },
        })

        if (invokeError) {
          throw invokeError
        }

        setAdvice(data?.advice_text || null)
      } catch (err) {
        console.error('Failed to fetch Aura advice:', err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchAdvice()
  }, [fragranceId, contextType, fragranceData, shelfContext])

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center py-2 text-sm ${className}`}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-amber-600" />
        <span className="text-text-muted">Aura is thinking...</span>
      </div>
    )
  }

  if (error || !advice) {
    return null
  }

  return (
    <div
      className={`
        rounded-lg px-4 py-3
        bg-gradient-to-r from-aura-surface to-transparent
        border border-aura-border
        shadow-sm backdrop-blur-sm
        ${className}
      `}
      style={{
        boxShadow: '0 0 1px var(--aura-border), inset 0 1px 2px var(--aura-surface)',
      }}
    >
      <p
        className="text-sm leading-relaxed text-text"
        style={{
          fontFamily: 'var(--font-instrument-serif)',
          fontStyle: 'italic',
          fontWeight: 500,
        }}
      >
        ✨ {advice}
      </p>
    </div>
  )
}
