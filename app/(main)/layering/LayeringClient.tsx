'use client'

import React, { useMemo } from 'react'
import { Search, X, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Sheet from '@/components/ui/Sheet'
import LayeringRules from '@/components/ui/LayeringRules'
import ErrorInline from '@/components/ui/ErrorInline'
import dynamic from 'next/dynamic'
import {
  useLayeringWizard,
  USE_CASES_LIST,
  type LayeringFragrance,
  type AuraResultItem,
  type UseCase,
} from './useLayeringWizard'
import { AuraResultCard } from './ChemistryCalculator'
import { handleSaveCombination, handleShareCombination } from './LayerCart'

const ChemistPanel = dynamic(() => import('@/components/ChemistPanel'), { ssr: false })
const AuraShareCard = dynamic(() => import('@/app/components/AuraShareCard'), { ssr: false })

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

export default function LayeringClient({ fragrances }: { fragrances: LayeringFragrance[] }) {
  const wizard = useLayeringWizard(fragrances)

  const filteredFragrances = useMemo(() => {
    const q = wizard.pickerQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(
      f => f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, wizard.pickerQuery])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
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
          Layer Builder
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Find two scents that work together
        </p>
        <LayeringRules />
      </div>

      <div className="px-4 py-6">
        {/* ── Manual mode (pre-filled from DNA Match) ── */}
        {mode === 'manual' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  lineHeight: '28px',
                }}
              >
                Your Combination
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Anchor and top note loaded from Olfactory Resonance.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {([
                { label: 'Anchor', frag: slot1 },
                { label: 'Top Note', frag: slot2 },
              ] as const).map(({ label, frag }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-[var(--r-card)]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: 10,
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginTop: 2,
                      }}
                    >
                      {frag?.brand}
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
                      {frag?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!manualSynthesized ? (
              <Button fullWidth onClick={() => setManualSynthesized(true)}>
                Synthesize
              </Button>
            ) : (
              <div
                className="flex flex-col gap-3 p-5 rounded-[var(--r-card)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Stack ready
                </p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: '20px' }}>
                  Apply <strong>{slot1?.name}</strong> as your anchor layer, then layer{' '}
                  <strong>{slot2?.name}</strong> on top. Allow 60–90 seconds between applications.
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {slot1?.application_zone && `Anchor: ${slot1.application_zone}`}
                  {slot1?.application_zone && slot2?.application_zone && ' · '}
                  {slot2?.application_zone && `Top: ${slot2.application_zone}`}
                </p>
              </div>
            )}

            {manualSynthesized && slot1 && slot2 && (
              <ChemistPanel 
                fragranceAId={slot1.id} 
                fragranceBId={slot2.id} 
                fragranceAName={slot1.name} 
                fragranceBName={slot2.name} 
                useCase={useCase || undefined}
              />
            )}

            <button
              onClick={() => {
                setMode('aura')
                setManualSynthesized(false)
              }}
              style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}
            >
              Switch to AURA mode →
            </button>
          </div>
        )}

        {/* ── Step 1 — Use Case ── */}
        {mode === 'aura' && step === 1 && (
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
            {auraEnvironment && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  padding: '5px 10px',
                  borderRadius: 'var(--r-btn)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                }}
              >
                Your environment: {auraEnvironment}
              </p>
            )}
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
        {mode === 'aura' && step === 2 && useCase && (
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
        {mode === 'aura' && step === 3 && (
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
              <div className="flex flex-col gap-6">
                {results.map(item => (
                  <div key={item.id} className="flex flex-col gap-3">
                    <AuraResultCard
                      item={item}
                      used={usedLayers.has(item.id)}
                      onUse={() => setUsedLayers(prev => new Set([...prev, item.id]))}
                      onSave={(e) => handleSaveCombination(item, e)}
                      isSaving={isSaving}
                    />

                    {saveError && lastSavedId === item.id && (
                      <ErrorInline 
                        message={saveError} 
                        onRetry={() => handleSaveCombination(item, { stopPropagation: () => {} } as any)} 
                      />
                    )}

                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => handleShare(item)}
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

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
