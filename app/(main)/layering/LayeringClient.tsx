'use client'

import React, { useState, useMemo } from 'react'
import { Search, X, Check, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Sheet from '@/components/ui/Sheet'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'

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

type AuraResultItem = {
  id: string
  brand: string
  name: string
  layering_role: string
  similarity_score: number
}

const USE_CASES = ['Work', 'Date', 'Casual', 'Interview', 'Home', 'Gym', 'Evening'] as const
type UseCase = typeof USE_CASES[number]

function StepDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3] as const).map(s => (
        <div
          key={s}
          style={{
            width: s === current ? 16 : 6,
            height: 6,
            borderRadius: 3,
            background: s <= current ? 'var(--accent)' : 'var(--line)',
            transition: 'width 0.2s ease, background 0.2s ease',
          }}
        />
      ))}
    </div>
  )
}

function HarmonyBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'var(--accent)' : score >= 60 ? 'var(--text)' : 'var(--text-muted)'
  return (
    <div
      className="flex flex-col items-center flex-shrink-0 rounded-[var(--r-btn)] px-3 py-1.5"
      style={{ background: 'var(--surface-2)', border: `1px solid ${color}` }}
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

function AuraResultCard({
  item,
  used,
  onUse,
}: {
  item: AuraResultItem
  used: boolean
  onUse: () => void
}) {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[var(--r-card)]"
      style={{
        background: 'var(--surface)',
        border: used ? '1px solid var(--accent)' : '1px solid var(--line)',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div className="flex items-start justify-between gap-3">
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
        <HarmonyBadge score={item.similarity_score} />
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

export default function LayeringClient({ fragrances }: { fragrances: LayeringFragrance[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [useCase, setUseCase] = useState<UseCase | null>(null)
  const [baseFragrance, setBaseFragrance] = useState<LayeringFragrance | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AuraResultItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedLayers, setUsedLayers] = useState<Set<string>>(new Set())

  const filteredFragrances = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(
      f => f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, pickerQuery])

  async function callAura(base: LayeringFragrance | null) {
    if (!useCase) return
    setIsLoading(true)
    setError(null)
    setResults(null)
    setUsedLayers(new Set())
    setStep(3)

    try {
      const res = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_case: useCase,
          base_fragrance_id: base?.id ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AURA could not generate suggestions')
      setResults(data.results ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
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

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontStyle: 'italic',
            color: 'var(--text)',
            lineHeight: '34px',
          }}
        >
          AURA Layering Lab
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          AI-guided fragrance layering
        </p>
      </div>

      <div className="px-4 py-6">
        {/* ── Step 1 — Use Case ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <StepDots current={1} />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  lineHeight: '28px',
                  marginTop: 4,
                }}
              >
                What&apos;s the occasion?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                AURA will build a layering stack tailored to the context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map(uc => (
                <Chip key={uc} onClick={() => handleUseCaseSelect(uc)}>
                  {uc}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2 — Base Fragrance ── */}
        {step === 2 && useCase && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <StepDots current={2} />
                <button
                  onClick={() => { setStep(1); setUseCase(null) }}
                  className="flex items-center gap-1 focus-visible:outline-none"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                >
                  <ArrowLeft size={14} strokeWidth={1.75} />
                  Back
                </button>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: 8,
                }}
              >
                {useCase}
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  lineHeight: '28px',
                }}
              >
                Pick your anchor
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Choose a base from your collection, or let AURA build the full stack.
              </p>
            </div>

            <Button fullWidth onClick={handleAuraDecides}>
              ✦ Let AURA decide
            </Button>

            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <button
              onClick={() => { setPickerQuery(''); setPickerOpen(true) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--r-card)] text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
            >
              <Search
                size={16}
                strokeWidth={1.75}
                style={{ color: 'var(--text-muted)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Pick from collection…
              </span>
            </button>
          </div>
        )}

        {/* ── Step 3 — Results ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <StepDots current={3} />
                <button
                  onClick={handleBackToStep2}
                  className="flex items-center gap-1 focus-visible:outline-none"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                >
                  <ArrowLeft size={14} strokeWidth={1.75} />
                  Back
                </button>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: 8,
                }}
              >
                {useCase} · Layering Stack
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  lineHeight: '28px',
                }}
              >
                {baseFragrance ? `Layers for ${baseFragrance.name}` : 'Your AURA stack'}
              </h2>
            </div>

            {isLoading && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      height: 130,
                      borderRadius: 'var(--r-card)',
                      background:
                        'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s ease-in-out infinite',
                    }}
                    aria-hidden="true"
                  />
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
              </div>
            )}

            {error && (
              <ErrorInline
                message={error}
                onRetry={() => callAura(baseFragrance)}
              />
            )}

            {results && results.length > 0 && (
              <div className="flex flex-col gap-3">
                {results.map(item => (
                  <AuraResultCard
                    key={item.id}
                    item={item}
                    used={usedLayers.has(item.id)}
                    onUse={() => setUsedLayers(prev => new Set([...prev, item.id]))}
                  />
                ))}
              </div>
            )}

            {results && results.length === 0 && (
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
            )}

            {(results !== null || error) && (
              <Button variant="secondary" fullWidth onClick={handleReset}>
                Start over
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Fragrance picker sheet */}
      <Sheet
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerQuery('') }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--text)',
              }}
            >
              Pick anchor
            </h2>
            <button
              onClick={() => { setPickerOpen(false); setPickerQuery('') }}
              aria-label="Close picker"
            >
              <X size={18} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="relative">
            <Search
              size={14}
              strokeWidth={1.75}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--r-btn)] text-sm focus:outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                color: 'var(--text)',
              }}
            />
          </div>

          <div className="flex flex-col" style={{ marginLeft: -16, marginRight: -16 }}>
            {filteredFragrances.length === 0 ? (
              <p className="px-4 py-4" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No fragrances match &quot;{pickerQuery}&quot;.
              </p>
            ) : (
              filteredFragrances.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFragrancePick(f)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left focus-visible:outline-none"
                  style={{
                    background:
                      baseFragrance?.id === f.id ? 'var(--surface-2)' : undefined,
                    borderLeft:
                      baseFragrance?.id === f.id
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {f.brand}
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-display)',
                        lineHeight: '18px',
                      }}
                    >
                      {f.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
