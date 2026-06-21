'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTemporalCurve, sliderToVector } from './hooks/useTemporalCurve'
import { useWearLogForm, WEATHER_OPTIONS, OCCASION_OPTIONS } from './hooks/useWearLogForm'
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
  const [stage, setStage] = useState<Stage>(1)

  // Alignment vectors (0–100 slider values)
  const [s1, setS1] = useState(50)
  const [s2, setS2] = useState(50)
  const [s3, setS3] = useState(50)

  // Final stage
  const [overallRating, setOverallRating] = useState<'like' | 'dislike' | null>(null)
  const [weather, setWeather] = useState<(typeof WEATHER_OPTIONS)[number] | ''>('')
  const [occasion, setOccasion] = useState<(typeof OCCASION_OPTIONS)[number] | ''>('')

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStage(1)
      setS1(50)
      setS2(50)
      setS3(50)
      setOverallRating(null)
      setWeather('')
      setOccasion('')
      setError(null)
    }
  }, [isOpen])

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
    if (!overallRating) {
      setError('Please choose Like or Dislike before saving.')
      return
    }

    setSaving(true)
    setError(null)

    const effectiveUserId = userId ?? getOrCreateAnonId()

    const temporalCurve: TemporalCurve = {
      stage_1_first_spray: { alignment_vector: sliderToVector(s1) },
      stage_2_the_heart: { alignment_vector: sliderToVector(s2) },
      stage_3_dry_down: { alignment_vector: sliderToVector(s3) },
    }

    const contextTags: ContextTags = {
      weather: weather || '',
      occasion: occasion || '',
    }

    // Derive a 1–5 integer rating from overall + average alignment
    const avgVector = (sliderToVector(s1) + sliderToVector(s2) + sliderToVector(s3)) / 3
    const baseRating = overallRating === 'like' ? 3 : 1
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
          occasion: occasion || null,
          weather: weather || null,
          rating: ratingInt,
          metadata: {
            temporal_curve: temporalCurve,
            overall_rating: overallRating,
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
      setError(msg)
    } finally {
      setSaving(false)
    }
  }, [
    overallRating,
    userId,
    fragranceId,
    s1,
    s2,
    s3,
    weather,
    occasion,
    supabase,
    onSaved,
    onClose,
  ])

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
          // Override to centered card on wider viewports via inline media trick:
          // we can't use @media inline, so we use CSS custom properties + a wrapper class.
          // The wrapping overlay uses align-items: flex-end for mobile, overridden below.
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
          {(stage === 1 || stage === 2 || stage === 3) && (() => {
            const meta = STAGE_META[stage]
            const value = stage === 1 ? s1 : stage === 2 ? s2 : s3
            const setter = stage === 1 ? setS1 : stage === 2 ? setS2 : setS3

            return (
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
                  {meta.label}
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 14,
                    textAlign: 'center',
                    marginBottom: 32,
                    lineHeight: 1.4,
                  }}
                >
                  {meta.sublabel}
                </p>

                <AlignmentSlider
                  value={value}
                  onChange={setter}
                  label={`${meta.label} alignment`}
                />
              </>
            )
          })()}

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
                  const active = overallRating === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOverallRating(opt)}
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
                options={WEATHER_OPTIONS}
                selected={weather}
                onToggle={(v) => setWeather((prev) => (prev === v ? '' : v))}
              />
              <ChipGroup
                label="Occasion"
                options={OCCASION_OPTIONS}
                selected={occasion}
                onToggle={(v) => setOccasion((prev) => (prev === v ? '' : v))}
              />

              {/* Inline error */}
              {error && (
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
                  {error}
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
                disabled={saving}
                style={{
                  flex: '0 0 auto',
                  minHeight: 48,
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: '1.5px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontWeight: 650,
                  cursor: saving ? 'not-allowed' : 'pointer',
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
              disabled={saving}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 14,
                border: 0,
                background: saving ? 'var(--color-border)' : 'var(--color-primary)',
                color: saving ? 'var(--color-text-muted)' : '#fffaf5',
                fontWeight: 650,
                fontSize: 15,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 22px rgb(160 98 42 / 24%)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {saving ? (
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
              disabled={saving}
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
