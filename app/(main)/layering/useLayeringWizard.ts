/**
 * useLayeringWizard Hook
 * Manages 3-step layering wizard state machine:
 * 1. Use Case selection
 * 2. Base fragrance selection
 * 3. AURA results / suggestions
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { track } from '@/lib/posthog'

export type LayeringFragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  projection: string
  application_zone: string
  application_method: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  lean: string
  rating: number | null
  image_url: string | null
}

export type AuraResultItem = {
  id: string
  brand: string
  name: string
  layering_role: string
  similarity_score: number
  phase?: 1 | 2 | 3
  harmony_pct?: number
  family?: string
  projection?: string
}

const USE_CASES = ['Work', 'Date', 'Casual', 'Interview', 'Home', 'Gym', 'Evening'] as const
export type UseCase = typeof USE_CASES[number]

export const USE_CASES_LIST = USE_CASES

export function useLayeringWizard(fragrances: LayeringFragrance[]) {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [mode, setMode] = useState<'aura' | 'manual'>('aura')
  const [useCase, setUseCase] = useState<UseCase | null>(null)
  const [baseFragrance, setBaseFragrance] = useState<LayeringFragrance | null>(null)

  // Manual mode state
  const [slot1, setSlot1] = useState<LayeringFragrance | null>(null)
  const [slot2, setSlot2] = useState<LayeringFragrance | null>(null)
  const [manualSynthesized, setManualSynthesized] = useState(false)

  // Picker state
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')

  // Results state
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AuraResultItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedLayers, setUsedLayers] = useState<Set<string>>(new Set())

  // Environment context
  const [auraEnvironment, setAuraEnvironment] = useState<string | null>(null)

  // Search params (for DNA Match integration)
  const searchParams = useSearchParams()

  // Initialize from localStorage
  useEffect(() => {
    try {
      const env = localStorage.getItem('scentral-environment')
      if (env) setAuraEnvironment(env)

      const raw = localStorage.getItem('scentral-use-cases')
      if (raw) {
        const stored: string[] = JSON.parse(raw)
        if (stored.length === 1) {
          const matched = USE_CASES.find(uc => uc.toLowerCase() === stored[0].toLowerCase())
          if (matched) {
            setUseCase(matched)
            setStep(2)
          }
        }
      }
    } catch {
      // localStorage unavailable or malformed JSON — silently ignore
    }
  }, [])

  // Initialize from search params (DNA Match pre-fill)
  useEffect(() => {
    const anchorId = searchParams.get('anchor')
    const topId = searchParams.get('top')
    if (!anchorId || !topId) return

    const anchor = fragrances.find(f => f.id === anchorId) ?? null
    const top = fragrances.find(f => f.id === topId) ?? null
    if (anchor && top) {
      setSlot1(anchor)
      setSlot2(top)
      setMode('manual')
    }
  }, [searchParams, fragrances])

  async function callAura(base: LayeringFragrance | null) {
    if (!useCase) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setUsedLayers(new Set())
    setStep(3)

    track('layering_suggestion_requested', {
      use_case: useCase,
      has_base_fragrance: base !== null,
      base_fragrance_id: base?.id ?? '',
    })

    try {
      const res = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_case: useCase ?? '',
          base_fragrance_id: base?.id ?? null,
          ...(auraEnvironment ? { environment: auraEnvironment } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AURA could not generate suggestions')
      setResults(data.results ?? [])

      track('layering_suggestions_received', {
        use_case: useCase ?? '',
        suggestion_count: data.results?.length ?? 0,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      track('layering_suggestion_error', {
        use_case: useCase ?? '',
        error_message: e instanceof Error ? e.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleUseCaseSelect(uc: UseCase) {
    setUseCase(uc)
    setStep(2)
  }

  function handleAuraDecides() {
    setBaseFragrance(null)
    callAura(null)
  }

  function handleFragrancePick(f: LayeringFragrance) {
    setBaseFragrance(f)
    setPickerOpen(false)
    setPickerQuery('')
    callAura(f)
  }

  function handleReset() {
    setStep(1)
    setUseCase(null)
    setBaseFragrance(null)
    setResults(null)
    setError(null)
    setUsedLayers(new Set())
  }

  function handleBackToStep2() {
    setStep(2)
    setResults(null)
    setError(null)
  }

  function toggleUsedLayer(layerId: string) {
    setUsedLayers(prev => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
  }

  return {
    // Wizard steps
    step,
    setStep,
    mode,
    setMode,

    // Step 1: Use Case
    useCase,
    handleUseCaseSelect,

    // Step 2: Base Selection
    baseFragrance,
    setBaseFragrance,
    pickerOpen,
    setPickerOpen,
    pickerQuery,
    setPickerQuery,
    handleFragrancePick,
    handleAuraDecides,

    // Step 3: Results
    isLoading,
    results,
    error,
    usedLayers,
    toggleUsedLayer,
    handleBackToStep2,
    callAura,

    // Manual mode
    slot1,
    setSlot1,
    slot2,
    setSlot2,
    manualSynthesized,
    setManualSynthesized,

    // Context
    auraEnvironment,

    // Actions
    handleReset,
  }
}
