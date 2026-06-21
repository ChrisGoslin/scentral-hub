'use client'

import React, { useMemo } from 'react'
import { Check } from 'lucide-react'
import { normalizeHarmonyScore, getHarmonyColor } from '@/lib/harmony'
import type { AuraResultItem } from './useLayeringWizard'

type HarmonyBadgeProps = {
  score: number
}

/**
 * HarmonyBadge Component
 * Displays harmony score with color coding based on compatibility level.
 * Used in AURA result cards.
 */
export function HarmonyBadge({ score }: HarmonyBadgeProps) {
  const color = getHarmonyColor(score)

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 rounded-[var(--r-btn)] px-3 py-1.5"
      style={{ background: 'var(--surface-2)', border: `1px solid ${color}`, maxWidth: '100%' }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '18px',
        }}
      >
        {score}%
      </span>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Harmony
      </span>
    </div>
  )
}

type AuraResultCardProps = {
  item: AuraResultItem
  used: boolean
  onUse: () => void
  onSave?: (e: React.MouseEvent) => void
  isSaving?: boolean
}

/**
 * AuraResultCard Component
 * Displays a single AURA layering suggestion with harmony score,
 * role description, and action buttons.
 */
export function AuraResultCard({
  item,
  used,
  onUse,
  onSave,
  isSaving,
}: AuraResultCardProps) {
  const harmonyScore = useMemo(
    () => item.harmony_pct ?? normalizeHarmonyScore(item.similarity_score),
    [item]
  )

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[var(--r-card)] relative"
      style={{
        background: 'var(--surface)',
        border: used ? '1px solid var(--accent)' : '1px solid var(--line)',
        transition: 'border-color 0.2s ease',
      }}
    >
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving || used}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: used ? 'var(--positive)' : 'var(--text-muted)',
            background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)',
            padding: '4px 8px',
            borderRadius: 999,
            border: 'none',
            cursor: used || isSaving ? 'default' : 'pointer',
          }}
        >
          {used ? 'Combo saved ✓' : isSaving ? 'Saving...' : '+ Save'}
        </button>
      )}

      <div className="flex items-start justify-between gap-3 pr-16">
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {item.brand}
          </p>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              lineHeight: '22px',
              marginTop: 1,
            }}
          >
            {item.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {item.layering_role}
          </p>
        </div>
        <HarmonyBadge score={harmonyScore} />
      </div>

      <button
        onClick={onUse}
        disabled={used}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[var(--r-btn)] transition-all text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={
          used
            ? {
                background: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                cursor: 'default',
              }
            : {
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
              }
        }
      >
        {used ? (
          <>
            <Check size={14} strokeWidth={2} />
            Layer selected
          </>
        ) : (
          'Use This Layer'
        )}
      </button>
    </div>
  )
}

type CalculateHarmonyParams = {
  baseFamily?: string
  topFamily?: string
  projection?: string
}

/**
 * Calculate harmony score for two fragrances.
 * Simple rule-based scoring for internal use.
 * Primary score comes from AURA API (similarity_score).
 */
export function calculateHarmony(params: CalculateHarmonyParams): number {
  const { baseFamily = '', topFamily = '', projection = '' } = params

  // Base case: if families match, high compatibility
  if (baseFamily && topFamily && baseFamily.toLowerCase() === topFamily.toLowerCase()) {
    return 85
  }

  // Projection matters for layering
  if (projection === 'Strong' || projection === 'Beast Mode') {
    return 75
  }

  // Default moderate harmony
  return 60
}
