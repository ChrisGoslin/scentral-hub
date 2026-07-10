'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
import FormulaCard from './FormulaCard'

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
  const searchParams = useSearchParams()
  const wizard = useLayeringWizard(fragrances)
  const [backLink, setBackLink] = useState<{ href: string; label: string; useHistory: boolean } | null>(null)
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set())
  const [formulaCardItem, setFormulaCardItem] = useState<AuraResultItem | null>(null)

  useEffect(() => {
    const from = searchParams.get('from')
    if (from === 'discover' || from === 'study') {
      setBackLink({ href: '/study', label: 'The Study', useHistory: true })
    } else if (from === 'collection' || from === 'cabinet') {
      setBackLink({ href: '/cabinet', label: 'The Cabinet', useHistory: true })
    } else {
      setBackLink({ href: '/cabinet', label: 'The Cabinet', useHistory: false })
    }
  }, [searchParams])

  const filteredFragrances = useMemo(() => {
    const q = wizard.pickerQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(
      f => f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, wizard.pickerQuery])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', color: 'var(--text)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        {backLink && (
          backLink.useHistory ? (
            <button
              onClick={() => window.history.back()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                marginBottom: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ArrowLeft size={12} />
              ← {backLink.label}
            </button>
          ) : (
            <Link
              href={backLink.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                marginBottom: 10,
              }}
            >
              <ArrowLeft size={12} />
              ← {backLink.label}
            </Link>
          )
        )}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontStyle: 'italic',
            color: 'var(--text)',
            lineHeight: '34px',
          }}
        >
          nota.Lab
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Build an accord on the workbench, then test how it settles.
        </p>
        <LayeringRules />
      </div>

      <div className="px-4 py-6">
        {/* ── Manual mode (pre-filled from DNA Match) ── */}
        {wizard.mode === 'manual' && (
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
                { label: 'Anchor', frag: wizard.slot1 },
                { label: 'Top Note', frag: wizard.slot2 },
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

            {!wizard.manualSynthesized ? (
              <Button fullWidth onClick={() => wizard.setManualSynthesized(true)}>
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
                  Apply <strong>{wizard.slot1?.name}</strong> as your anchor layer, then layer{' '}
                  <strong>{wizard.slot2?.name}</strong> on top. Allow 60–90 seconds between applications.
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {wizard.slot1?.application_zone && `Anchor: ${wizard.slot1.application_zone}`}
                  {wizard.slot1?.application_zone && wizard.slot2?.application_zone && ' · '}
                  {wizard.slot2?.application_zone && `Top: ${wizard.slot2.application_zone}`}
                </p>
              </div>
            )}

            {wizard.manualSynthesized && wizard.slot1 && wizard.slot2 && (
              <ChemistPanel
                fragranceAId={wizard.slot1.id}
                fragranceBId={wizard.slot2.id}
                fragranceAName={wizard.slot1.name}
                fragranceBName={wizard.slot2.name}
                useCase={wizard.useCase || undefined}
              />
            )}

            <button
              onClick={() => {
                wizard.setMode('aura')
                wizard.setManualSynthesized(false)
              }}
              style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}
            >
              Switch to AURA mode →
            </button>
          </div>
        )}

        {/* ── Step 1 — Use Case ── */}
        {wizard.mode === 'aura' && wizard.step === 1 && (
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
            {wizard.auraEnvironment && (
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
                Your environment: {wizard.auraEnvironment}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {USE_CASES_LIST.map(uc => (
                <Chip key={uc} onClick={() => wizard.handleUseCaseSelect(uc)}>
                  {uc}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2 — Base Fragrance ── */}
        {wizard.mode === 'aura' && wizard.step === 2 && wizard.useCase && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <StepDots current={2} />
                <button
                  onClick={() => { wizard.setStep(1); wizard.handleReset() }}
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
                {wizard.useCase}
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

            <Button fullWidth onClick={wizard.handleAuraDecides}>
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
              onClick={() => { wizard.setPickerQuery(''); wizard.setPickerOpen(true) }}
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
        {wizard.mode === 'aura' && wizard.step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <StepDots current={3} />
                <button
                  onClick={wizard.handleBackToStep2}
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
                {wizard.useCase} · Layering Stack
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
                {wizard.baseFragrance ? `Layers for ${wizard.baseFragrance.name}` : 'Your AURA stack'}
              </h2>
            </div>

            {wizard.isLoading && (
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

            {wizard.error && (
              <ErrorInline
                message={wizard.error}
                onRetry={() => wizard.callAura(wizard.baseFragrance)}
              />
            )}

            {wizard.results && wizard.results.length > 0 && (
              <div className="flex flex-col gap-6">
                {wizard.results.map((item: AuraResultItem) => (
                  <div key={item.id} className="flex flex-col gap-3">
                    <AuraResultCard
                      item={item}
                      used={wizard.usedLayers.has(item.id)}
                      onUse={() => wizard.toggleUsedLayer(item.id)}
                      onSave={() => handleSaveCombination({
                        baseFragrance: wizard.baseFragrance,
                        topItem: item,
                        useCase: wizard.useCase,
                        auraEnvironment: wizard.auraEnvironment,
                      }).then(() => {
                        wizard.toggleUsedLayer(item.id)
                        setSavedItemIds(prev => new Set([...prev, item.id]))
                      }).catch(() => {
                        // Handle error
                      })}
                    />

                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => handleShareCombination(wizard.baseFragrance, item, wizard.useCase)}
                      style={{ border: '1px solid var(--line)' }}
                    >
                      Share this layer
                    </Button>

                    {savedItemIds.has(item.id) && (
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={() => setFormulaCardItem(item)}
                        style={{ border: '1px solid var(--accent)' }}
                      >
                        Share Formula →
                      </Button>
                    )}
                  </div>
                ))}

                {/* Share card — uses top result */}
                {wizard.results[0] && wizard.baseFragrance && (
                  <AuraShareCard
                    data={{
                      anchor: { brand: wizard.baseFragrance.brand, name: wizard.baseFragrance.name, phase: wizard.baseFragrance.phase },
                      top: { brand: wizard.results[0].brand, name: wizard.results[0].name, phase: wizard.results[0].phase ?? 2 },
                      harmony_pct: wizard.results[0].harmony_pct ?? Math.round((wizard.results[0].similarity_score ?? 0.7) * 100),
                      use_case: wizard.useCase ?? 'casual',
                      aura_description: `${wizard.results[0].family ?? ''} · ${wizard.results[0].layering_role} · ${wizard.results[0].projection ?? ''} projection`.replace('·  ·', '·'),
                    }}
                  />
                )}
              </div>
            )}

            {wizard.results && wizard.results.length === 0 && (
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

            {(wizard.results !== null || wizard.error) && (
              <Button variant="secondary" fullWidth onClick={wizard.handleReset}>
                Start over
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Fragrance picker sheet */}
      <Sheet
        open={wizard.pickerOpen}
        onClose={() => { wizard.setPickerOpen(false); wizard.setPickerQuery('') }}
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
              onClick={() => { wizard.setPickerOpen(false); wizard.setPickerQuery('') }}
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
              value={wizard.pickerQuery}
              onChange={e => wizard.setPickerQuery(e.target.value)}
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
              wizard.pickerQuery.trim() === '' ? (
                <div className="px-4 py-4 flex flex-col gap-3">
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Your cabinet is empty. Add fragrances from The Study first.
                  </p>
                  <Link href="/study" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                    Go to The Study →
                  </Link>
                </div>
              ) : (
                <p className="px-4 py-4" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  No fragrances match &quot;{wizard.pickerQuery}&quot;.
                </p>
              )
            ) : (
              filteredFragrances.map(f => (
                <button
                  key={f.id}
                  onClick={() => wizard.handleFragrancePick(f)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left focus-visible:outline-none"
                  style={{
                    background:
                      wizard.baseFragrance?.id === f.id ? 'var(--surface-2)' : undefined,
                    borderLeft:
                      wizard.baseFragrance?.id === f.id
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

      <FormulaCard
        open={formulaCardItem != null}
        onClose={() => setFormulaCardItem(null)}
        base={wizard.baseFragrance}
        top={formulaCardItem}
      />

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}

export type { LayeringFragrance, AuraResultItem, UseCase }
