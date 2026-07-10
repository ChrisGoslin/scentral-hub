'use client'

import React, { useState } from 'react'
import { Share2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import ErrorInline from '@/components/ui/ErrorInline'
import AuraShareCard from '@/app/components/AuraShareCard'
import { track } from '@/lib/posthog'
import type { AuraResultItem, LayeringFragrance, UseCase } from './useLayeringWizard'

type LayerCartProps = {
  baseFragrance: LayeringFragrance | null
  results: AuraResultItem[]
  useCase: UseCase | null
  onSaveCombination: (item: AuraResultItem, e: React.MouseEvent) => Promise<void>
  onShare: (item: AuraResultItem) => void
}

/**
 * LayerCart Component
 * Renders AURA layering suggestions with save/share actions.
 * Manages cart-like state for saved combinations.
 */
export function LayerCart({
  baseFragrance,
  results,
  useCase,
  onSaveCombination,
  onShare,
}: LayerCartProps) {
  const [, setIsSaving] = useState(false)
  const [, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)
  const [sharedId] = useState<string | null>(null)
  const [, setUsedLayers] = useState<Set<string>>(new Set())

  async function handleSaveClick(item: AuraResultItem, e: React.MouseEvent) {
    e.stopPropagation()
    setIsSaving(true)
    setSaveStatus('idle')
    setSaveError(null)
    setLastSavedId(item.id)

    try {
      await onSaveCombination(item, e)
      setSaveStatus('success')
      setUsedLayers(prev => new Set([...prev, item.id]))
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (e) {
      setSaveStatus('error')
      setSaveError(e instanceof Error ? e.message : 'Could not save combination')
    } finally {
      setIsSaving(false)
    }
  }

  function handleShareClick(item: AuraResultItem) {
    onShare(item)
  }

  if (!results || results.length === 0) {
    return (
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '24px 0',
        }}
      >
        No suggestions found. Try a different use case or anchor.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {results.map(item => (
        <div key={item.id} className="flex flex-col gap-3">
          {/* Render via parent — LayerCart is a composition container */}
          {saveError && lastSavedId === item.id && (
            <ErrorInline message={saveError} onRetry={() => handleSaveClick(item, { stopPropagation: () => {} } as unknown as React.MouseEvent)} />
          )}

          <Button
            fullWidth
            variant="secondary"
            onClick={() => handleShareClick(item)}
            style={{ border: '1px solid var(--line)' }}
          >
            <Share2 size={16} className="mr-2" strokeWidth={2} />
            {sharedId === item.id ? 'Copied!' : 'Share this layer'}
          </Button>
        </div>
      ))}

      {/* Share card — uses top result */}
      {results[0] && baseFragrance && (
        <AuraShareCard
          data={{
            anchor: { brand: baseFragrance.brand, name: baseFragrance.name, phase: baseFragrance.phase },
            top: { brand: results[0].brand, name: results[0].name, phase: results[0].phase ?? 2 },
            harmony_pct: results[0].harmony_pct ?? Math.round((results[0].similarity_score ?? 0.7) * 100),
            use_case: useCase ?? 'casual',
            aura_description: `${results[0].family ?? ''} · ${results[0].layering_role} · ${results[0].projection ?? ''} projection`.replace('·  ·', '·'),
          }}
        />
      )}
    </div>
  )
}

type LayerSaveHandlerProps = {
  baseFragrance: LayeringFragrance | null
  topItem: AuraResultItem
  useCase: UseCase | null
  auraEnvironment: string | null
}

/**
 * Handle saving a layering combination to Supabase.
 * Tracks the save action and updates UI state.
 */
export async function handleSaveCombination(
  props: LayerSaveHandlerProps
): Promise<{ success: boolean; id?: string }> {
  const { baseFragrance, topItem, useCase, auraEnvironment } = props

  try {
    const res = await fetch('/api/layering/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_fragrance_id: baseFragrance?.id ?? null,
        top_fragrance_id: topItem.id,
        name: `${baseFragrance?.name ?? 'Unknown'} & ${topItem.name}`,
        occasion: useCase,
        time_of_day: null,
        weather: auraEnvironment,
        rationale: `${topItem.layering_role} layer for ${useCase} environment. Harmony: ${topItem.similarity_score}%`,
        formulation: {},
        base_sprays: 1,
        top_sprays: 2,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Save failed')

    track('layering_combo_saved', {
      use_case: useCase ?? '',
      base_fragrance_id: baseFragrance?.id ?? '',
      top_fragrance_id: topItem.id,
      harmony_score: topItem.similarity_score,
      layering_role: topItem.layering_role,
    })

    return { success: true, id: data.id }
  } catch (e) {
    track('layering_save_error', {
      use_case: useCase ?? '',
      error_message: e instanceof Error ? e.message : 'Unknown error',
    })
    throw e
  }
}

/**
 * Handle sharing a layering combination via Web Share API or clipboard.
 */
export async function handleShareCombination(
  baseFragrance: LayeringFragrance | null,
  topItem: AuraResultItem,
  useCase: UseCase | null
): Promise<boolean> {
  const base = baseFragrance?.name || 'My anchor'
  const top = topItem.name
  const occasion = useCase || 'daily'
  const shareText = `I'm wearing ${base} + ${top} — ${occasion} combo 💫 via nota.`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'nota. Layering',
        text: shareText,
        url: window.location.href,
      })
      return true
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        return copyToClipboard(shareText)
      }
      return false
    }
  } else {
    return copyToClipboard(shareText)
  }
}

function copyToClipboard(text: string): boolean {
  navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  return true
}
