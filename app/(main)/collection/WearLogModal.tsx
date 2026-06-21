'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTemporalCurve, sliderToVector } from './hooks/useTemporalCurve'
import { useWearLogForm } from './hooks/useWearLogForm'
import { Stage1, Stage2, Stage3 } from './WearLogStages'
import { StageDots, ChipGroup } from './WearLogDatePicker'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WearLogModalProps {
  fragranceId: string
  fragranceName: string
  userId?: string
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

type Stage = 1 | 2 | 3 | 'final'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateAnonId(): string {
  try {
    const existing = localStorage.getItem('scentral_anon_id')
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem('scentral_anon_id', id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WearLogModal({
  fragranceId,
  fragranceName,
  userId,
  isOpen,
  onClose,
  onSaved,
}: WearLogModalProps) {
  const [stage, setStage] = React.useState<Stage>(1)
  const temporal = useTemporalCurve()
  const form = useWearLogForm()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStage(1)
      temporal.reset()
      form.reset()
    }
  }, [isOpen, temporal, form])

  // Trap focus + close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleNext = useCallback(() => {
    if (stage === 1) setStage(2)
    else if (stage === 2) setStage(3)
    else if (stage === 3) setStage('final')
  }, [stage])

  const handleBack = useCallback(() => {
    if (stage === 2) setStage(1)
    else if (stage === 3) setStage(2)
    else if (stage === 'final') setStage(3)
  }, [stage])

  const handleSave = useCallback(async () => {
    if (!form.overallRating) {
      form.setError('Please choose Like or Dislike before saving.')
      return
    }

    form.setSaving(true)
    form.setError(null)

    const effectiveUserId = userId ?? getOrCreateAnonId()
    const temporalCurve = temporal.toTemporalCurve()
    const contextTags = form.toContextTags()
    const avgVector = temporal.getAverageVector()
    const baseRating = form.overallRating === 'like' ? 3 : 1
    const ratingInt = Math.min(5, Math.round(baseRating + avgVector * 2))

    try {
      const response = await fetch('/api/wear-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: effectiveUserId,
          fragrance_id: fragranceId,
          worn_on: new Date().toISOString().slice(0, 10),
          occasion: form.occasion || null,
          weather: form.weather || null,
          rating: ratingInt,
          metadata: {
            temporal_curve: temporalCurve,
            overall_rating: form.overallRating,
            context_tags: contextTags,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save wear log')
      }

      onSaved?.()
      onClose()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Something went wrong. Please try again.'
      form.setError(msg)
    } finally {
      form.setSaving(false)
    }
  }, [form, userId, fragranceId, temporal, onSaved, onClose])

  if (!isOpen) return null

  const stageNum = stage === 'final' ? 4 : stage

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose()
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 900,
          background: 'rgba(20, 15, 10, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Log wear for ${fragranceName}`}
      >
        {/* Modal card — bottom sheet on mobile, centered card on desktop */}
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--color-surface)',
            borderRadius: '20px 20px 0 0',
            padding: '28px 24px calc(28px + env(safe-area-inset-bottom, 0px))',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
          }}
          className="wear-log-card"
        >
          {/* Drag handle pill */}
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: 'var(--color-border)',
              margin: '0 auto 20px',
            }}
          />

          {/* Fragrance name */}
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {fragranceName}
          </p>

          {/* Stage indicator dots */}
          <StageDots current={stage} />

          {/* ── Stage 1 / 2 / 3 ───────────────────────────────────────────────── */}
          {stage === 1 && (
            <Stage1 value={temporal.s1} onChange={temporal.setS1} />
          )}

          {stage === 2 && (
            <Stage2 value={temporal.s2} onChange={temporal.setS2} />
          )}

          {stage === 3 && (
            <Stage3 value={temporal.s3} onChange={temporal.setS3} />
          )}

          {/* ── Final stage ────────────────────────────────────────────────────── */}
          {stage === 'final' && (
            <>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 400,
                  color: 'var(--color-text)',
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                Overall
              </h2>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 1.4,
                }}
              >
                How was it overall?
              </p>

              {/* Like / Dislike pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {(['like', 'dislike'] as const).map((opt) => {
                  const active = form.overallRating === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => form.setOverallRating(opt)}
                      style={{
                        minHeight: 56,
                        borderRadius: 16,
                        border: `2px solid ${active ? (opt === 'like' ? 'var(--color-success)' : 'var(--color-error)') : 'var(--color-border)'}`,
                        background: active
                          ? opt === 'like'
                            ? 'rgba(74, 122, 80, 0.10)'
                            : 'rgba(160, 48, 80, 0.10)'
                          : 'var(--color-surface-2)',
                        color: active
                          ? opt === 'like'
                            ? 'var(--color-success)'
                            : 'var(--color-error)'
                          : 'var(--color-text-muted)',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                      aria-pressed={active}
                    >
                      <span style={{ fontSize: 20 }}>{opt === 'like' ? '👍' : '👎'}</span>
                      {opt === 'like' ? 'Like' : 'Dislike'}
                    </button>
                  )
                })}
              </div>

              {/* Context chips */}
              <ChipGroup
                label="Weather"
                options={form.WEATHER_OPTIONS}
                selected={form.weather}
                onToggle={form.toggleWeather}
              />
              <ChipGroup
                label="Occasion"
                options={form.OCCASION_OPTIONS}
                selected={form.occasion}
                onToggle={form.toggleOccasion}
              />

              {/* Inline error */}
              {form.error && (
                <div
                  role="alert"
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(160, 48, 80, 0.08)',
                    border: '1px solid var(--color-error)',
                    color: 'var(--color-error)',
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {form.error}
                </div>
              )}
            </>
          )}

          {/* ── Navigation buttons ─────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 32,
            }}
          >
            {/* Back — hidden on stage 1 */}
            {stageNum > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={form.saving}
                style={{
                  flex: '0 0 auto',
                  minHeight: 48,
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: '1.5px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontWeight: 650,
                  cursor: form.saving ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                }}
              >
                ←
              </button>
            )}

            {/* Next / Save */}
            <button
              type="button"
              onClick={stage === 'final' ? handleSave : handleNext}
              disabled={form.saving}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 14,
                border: 0,
                background: form.saving ? 'var(--color-border)' : 'var(--color-primary)',
                color: form.saving ? 'var(--color-text-muted)' : '#fffaf5',
                fontWeight: 650,
                fontSize: 15,
                cursor: form.saving ? 'not-allowed' : 'pointer',
                boxShadow: form.saving ? 'none' : '0 8px 22px rgb(160 98 42 / 24%)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {form.saving ? (
                'Saving…'
              ) : stage === 'final' ? (
                'Save Log'
              ) : (
                <>
                  Next{' '}
                  <span style={{ opacity: 0.7 }}>
                    {stage === 1 ? '· Stage 2 of 3' : '· Stage 3 of 3'}
                  </span>
                </>
              )}
            </button>

            {/* Close (X) — top right */}
            <button
              type="button"
              onClick={onClose}
              disabled={form.saving}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: 999,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Desktop centering override — injected as a style tag so we can use @media */}
      <style>{`
        @media (min-width: 640px) {
          [role="dialog"] {
            align-items: center !important;
          }
          .wear-log-card {
            border-radius: 20px !important;
            margin-bottom: 0 !important;
          }
        }

        /* Range thumb cross-browser */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 2px 8px rgba(160, 98, 42, 0.32);
          cursor: pointer;
          border: 2px solid #fffaf5;
          margin-top: -8px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 2px 8px rgba(160, 98, 42, 0.32);
          cursor: pointer;
          border: 2px solid #fffaf5;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 999px;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          border-radius: 999px;
          background: var(--color-border);
        }
        input[type="range"]:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 4px;
          border-radius: 999px;
        }
      `}</style>
    </>
  )
}
