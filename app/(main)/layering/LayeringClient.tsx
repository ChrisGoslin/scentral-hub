'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, X, Check, Sparkles, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Sheet from '@/components/ui/Sheet'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'
import Disclosure from '@/components/ui/Disclosure'
import AuthSheet from '@/components/auth/AuthSheet'
import SensoryAnatomy from '@/components/ui/SensoryAnatomy'
import { getCurrentWeather, getUserPosition, weatherLabel, type WeatherData } from '@/utils/weather'

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

export type FormulateResult = {
  combo_name: string
  application_steps: string[]
  sillage_prediction: string
  occasion_tag: string
  anosmia_warning: string | null
  claude_note: string
}

type PendingFormulation = {
  slot1: LayeringFragrance
  slot2: LayeringFragrance
  occasion: string
  result: FormulateResult
}

const PENDING_KEY = 'scentral_pending_formulation'

const OCCASIONS = ['Anytime', 'Date', 'Office', 'Gym', 'Formal'] as const
type Occasion = typeof OCCASIONS[number]

const OCCASION_API_MAP: Record<Occasion, string> = {
  Anytime: 'anytime',
  Date: 'date',
  Office: 'work',
  Gym: 'gym',
  Formal: 'formal',
}

const PHASE_LABEL: Record<number, string> = { 1: 'Anchor', 2: 'Modulator', 3: 'Top' }

/* ── Helpers ────────────────────────────────────────────── */

function parseSprayCount(steps: string[], fragName: string): number | null {
  const words = fragName.toLowerCase().split(' ').slice(0, 2)
  for (const step of steps) {
    const s = step.toLowerCase()
    if (words.some(w => s.includes(w))) {
      const m = s.match(/(\d+)\s*sprays?/)
      if (m) return parseInt(m[1], 10)
    }
  }
  return null
}

function parseLasts(sillage: string): string | null {
  const range = sillage.match(/(\d+)\s*[-–]\s*(\d+)\s*hours?/i)
  if (range) return `~${range[1]}–${range[2]}h`
  const single = sillage.match(/(\d+)\s*hours?/i)
  if (single) return `~${single[1]}h`
  return null
}

const SHOW_COMMERCE_SLOT = false

// ── AURA ────────────────────────────────────────────────────
type AuraMode = 'manual' | 'aura'

const AURA_USE_CASES = [
  { key: 'work',      label: 'Work',      hint: 'Clean, moderate, professional' },
  { key: 'date',      label: 'Date',      hint: 'Intimate, sensual, memorable' },
  { key: 'casual',    label: 'Casual',    hint: 'Relaxed and versatile' },
  { key: 'interview', label: 'Interview', hint: 'Authoritative, restrained' },
  { key: 'home',      label: 'Home',      hint: 'Cozy and indulgent' },
  { key: 'gym',       label: 'Gym',       hint: 'Light, clean, energising' },
  { key: 'evening',   label: 'Evening',   hint: 'Bold, long-lasting sillage' },
] as const

type AuraUseCase = typeof AURA_USE_CASES[number]['key']

type AuraRecommendation = {
  id: string
  brand: string
  name: string
  family: string
  phase: 1 | 2 | 3
  phase_label: string
  projection: string
  harmony_pct: number
  layering_role: string
  image_url: string | null
}

type AuraResult = {
  recommendations: AuraRecommendation[]
  aura_context: {
    profile_description: string
    weather_condition: string
    base_fragrance: string
    resonance_engine: string
  }
}

/* ── Sub-components ─────────────────────────────────────── */

function PhaseTag({ phase }: { phase: 1 | 2 | 3 }) {
  return (
    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {PHASE_LABEL[phase]}
    </span>
  )
}

function PickerSlot({ label, fragrance, onClick }: { label: string; fragrance: LayeringFragrance | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-[var(--r-card)] border p-4 flex flex-col gap-1 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[80px]"
      style={{
        background: 'var(--surface)',
        borderColor: fragrance ? 'var(--accent)' : 'var(--line)',
        boxShadow: fragrance ? '0 0 12px rgba(201,162,75,0.1)' : undefined,
      }}
    >
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {fragrance ? (
        <>
          <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: '18px' }}>{fragrance.name}</p>
          <PhaseTag phase={fragrance.phase} />
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tap to pick</p>
      )}
    </button>
  )
}

function FragrancePickerRow({ f, selected, disabled, onClick }: { f: LayeringFragrance; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
      style={{
        opacity: disabled ? 0.4 : 1,
        background: selected ? 'var(--surface-2)' : undefined,
        borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.brand}</p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '18px' }}>{f.name}</p>
      </div>
      <PhaseTag phase={f.phase} />
    </button>
  )
}

/* ── Result card ────────────────────────────────────────── */

function ResultCard({
  result,
  slot1,
  slot2,
  onTryAnother,
  onSave,
  saveState,
}: {
  result: FormulateResult
  slot1: LayeringFragrance | null
  slot2: LayeringFragrance | null
  onTryAnother: () => void
  onSave: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}) {
  const fragrances = [slot1, slot2].filter(Boolean) as LayeringFragrance[]
  const lasts = parseLasts(result.sillage_prediction)

  const sprayRows = fragrances.map(f => ({
    name: f.name,
    brand: f.brand,
    sprays: parseSprayCount(result.application_steps, f.name),
  }))

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', lineHeight: '28px' }}>
          Olfactory Synthesis
        </h2>
        {result.occasion_tag && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{result.occasion_tag}</p>
        )}
      </div>

      {/* Spray rows */}
      <div className="flex flex-col gap-2">
        {sprayRows.map(({ name, brand, sprays }) => (
          <div key={name} className="flex items-baseline justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{brand} </span>
              <span style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{name}</span>
            </div>
            <span style={{ fontSize: 15, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {sprays !== null ? `→ ${sprays} sprays` : '→ per instructions'}
            </span>
          </div>
        ))}
      </div>

      {/* Sillage + Lasts */}
      <div className="flex flex-col gap-1.5" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <div className="flex justify-between">
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sillage</span>
          <span style={{ fontSize: 13, color: 'var(--text)', maxWidth: '60%', textAlign: 'right' }}>
            {result.sillage_prediction.split('.')[0]}
          </span>
        </div>
        {lasts && (
          <div className="flex justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lasts</span>
            <span style={{ fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{lasts}</span>
          </div>
        )}
      </div>

      {/* Why */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Why</p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: '22px', fontStyle: 'italic' }}>{result.claude_note}</p>
      </div>

      {/* Sensory Anatomy for the base fragrance */}
      {slot1?.application_zone && (
        <SensoryAnatomy zone={slot1.application_zone} />
      )}

      {/* Resonance Links */}
      <div className="flex flex-col gap-2 pt-2">
        {fragrances.map(f => (
          <Link key={f.id} href={`/dna-match?search=${encodeURIComponent(f.family)}`} className="inline-flex items-center gap-1.5 group">
            <span style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'underline' }}>See similar to {f.name}</span>
            <span className="text-[10px] text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        ))}
      </div>

      {/* Commerce slot — HIDDEN in MVP */}
      {SHOW_COMMERCE_SLOT && (
        <div style={{ display: 'none' }} aria-hidden="true">{/* Where to buy — post-MVP */}</div>
      )}

      {/* Anosmia warning */}
      {result.anosmia_warning && (
        <ErrorInline message={result.anosmia_warning} color="warning" />
      )}

      {/* Save button */}
      {saveState === 'saved' ? (
        <div className="flex items-center justify-center gap-2 rounded-[var(--r-btn)] py-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--positive)' }}>
          <Check size={16} strokeWidth={1.75} style={{ color: 'var(--positive)' }} />
          <span style={{ fontSize: 14, color: 'var(--positive)' }}>Saved</span>
        </div>
      ) : (
        <Button fullWidth disabled={saveState === 'saving'} onClick={onSave}>
          {saveState === 'saving' ? 'Saving…' : 'Save formulation'}
        </Button>
      )}

      <Button variant="secondary" fullWidth onClick={onTryAnother}>Try another</Button>

      <Disclosure text="Personal recommendation — not sponsored." />
    </div>
  )
}

/* ── Main component ─────────────────────────────────────── */

export default function LayeringClient({ fragrances }: { fragrances: LayeringFragrance[] }) {
  const [slot1, setSlot1] = useState<LayeringFragrance | null>(null)
  const [slot2, setSlot2] = useState<LayeringFragrance | null>(null)
  const [occasion, setOccasion] = useState<Occasion>('Anytime')
  const [pickerFor, setPickerFor] = useState<'slot1' | 'slot2' | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [resultOpen, setResultOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FormulateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const canFormulate = slot1 !== null && slot2 !== null && slot1.id !== slot2.id

  // ── AURA state ──
  const [mode, setMode] = useState<AuraMode>('manual')
  const [auraUseCase, setAuraUseCase] = useState<AuraUseCase>('casual')
  const [auraBaseId, setAuraBaseId] = useState<string | null>(null)
  const [auraResult, setAuraResult] = useState<AuraResult | null>(null)
  const [auraLoading, setAuraLoading] = useState(false)
  const [auraError, setAuraError] = useState<string | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [auraBasePickerOpen, setAuraBasePickerOpen] = useState(false)
  const [auraBaseQuery, setAuraBaseQuery] = useState('')

  const auraBase = auraBaseId ? fragrances.find(f => f.id === auraBaseId) ?? null : null

  const auraBaseList = useMemo(() => {
    const q = auraBaseQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(f =>
      f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, auraBaseQuery])

  async function fetchWeather() {
    setWeatherLoading(true)
    try {
      const pos = await getUserPosition()
      if (pos) {
        const w = await getCurrentWeather(pos)
        setWeather(w)
      }
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleAuraSubmit() {
    setAuraLoading(true)
    setAuraResult(null)
    setAuraError(null)
    try {
      const res = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_case: auraUseCase,
          base_fragrance_id: auraBaseId ?? undefined,
          weather: weather ? { temp_c: weather.temp_c, humidity: weather.humidity } : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AURA synthesis failed')
      setAuraResult(data)
    } catch (e) {
      setAuraError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setAuraLoading(false)
    }
  }

  function applyAuraRecommendation(rec: AuraRecommendation) {
    const full = fragrances.find(f => f.id === rec.id)
    if (!full) return
    if (auraBase) {
      setSlot1(auraBase as unknown as LayeringFragrance)
      setSlot2(full)
    } else {
      setSlot2(full)
    }
    setMode('manual')
    setResult(null)
    setError(null)
    setSaveState('idle')
  }

  /* ── Pending formulation: restore + auto-save after magic-link return ── */
  const doSave = useCallback(async (
    s1: LayeringFragrance,
    s2: LayeringFragrance,
    occ: string,
    r: FormulateResult
  ) => {
    setSaveState('saving')
    const sprayBase = parseSprayCount(r.application_steps, s1.name)
    const sprayTop = parseSprayCount(r.application_steps, s2.name)

    try {
      const res = await fetch('/api/layering/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_fragrance_id: s1.id,
          top_fragrance_id: s2.id,
          name: r.combo_name,
          occasion: occ,
          time_of_day: 'morning',
          weather: 'moderate',
          rationale: r.claude_note,
          formulation: r,
          base_sprays: sprayBase,
          top_sprays: sprayTop,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PENDING_KEY) : null
    if (!raw) return

    let pending: PendingFormulation | null = null
    try { pending = JSON.parse(raw) } catch { /* ignore */ }
    if (!pending) return

    localStorage.removeItem(PENDING_KEY)

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const { slot1: s1, slot2: s2, occasion: occ, result: r } = pending!
      setSlot1(s1)
      setSlot2(s2)
      setOccasion(occ as Occasion)
      setResult(r)
      setResultOpen(true)
      doSave(s1, s2, occ, r)
    })
  }, [doSave])

  /* ── Picker ── */
  const displayList = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(f =>
      f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, pickerQuery])

  function openPicker(slot: 'slot1' | 'slot2') {
    setPickerQuery('')
    setPickerFor(slot)
  }

  function selectFragrance(f: LayeringFragrance) {
    if (pickerFor === 'slot1') {
      setSlot1(f)
      if (slot2?.id === f.id) setSlot2(null)
    } else if (pickerFor === 'slot2') {
      setSlot2(f)
      if (slot1?.id === f.id) setSlot1(null)
    }
    setPickerFor(null)
    setPickerQuery('')
    setResult(null)
    setError(null)
    setSaveState('idle')
  }

  /* ── Formulate ── */
  async function handleFormulate() {
    if (!slot1 || !slot2) return
    setIsLoading(true)
    setResult(null)
    setError(null)
    setSaveState('idle')
    setResultOpen(true)

    try {
      const res = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance1: {
            name: slot1.name, brand: slot1.brand, phase: slot1.phase,
            phase_label: slot1.phase_label, family: slot1.family,
            projection: slot1.projection, application_zone: slot1.application_zone,
            application_method: slot1.application_method,
            anosmia_risk: slot1.anosmia_risk, lean: slot1.lean,
          },
          fragrance2: {
            name: slot2.name, brand: slot2.brand, phase: slot2.phase,
            phase_label: slot2.phase_label, family: slot2.family,
            projection: slot2.projection, application_zone: slot2.application_zone,
            application_method: slot2.application_method,
            anosmia_risk: slot2.anosmia_risk, lean: slot2.lean,
          },
          context: {
            time_of_day: 'morning',
            weather: 'moderate',
            occasion: OCCASION_API_MAP[occasion],
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Formulation failed')
      setResult(data.result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Save ── */
  async function handleSave() {
    if (!slot1 || !slot2 || !result) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Stash formulation in localStorage, then open auth sheet
      const pending: PendingFormulation = {
        slot1, slot2, occasion: OCCASION_API_MAP[occasion], result,
      }
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
      setAuthSheetOpen(true)
      return
    }

    await doSave(slot1, slot2, OCCASION_API_MAP[occasion], result)
  }

  function handleTryAnother() {
    setResultOpen(false)
    setResult(null)
    setError(null)
    setSaveState('idle')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>The Atelier</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Compose a pairing</p>
      </div>

      {/* Mode toggle */}
      <div className="px-4 pt-4 flex gap-2">
        <button
          onClick={() => setMode('manual')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-btn)] transition-all"
          style={{
            background: mode === 'manual' ? 'var(--accent)' : 'var(--surface)',
            color: mode === 'manual' ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--line)',
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          <SlidersHorizontal size={13} />
          Manual
        </button>
        <button
          onClick={() => setMode('aura')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-btn)] transition-all"
          style={{
            background: mode === 'aura' ? 'var(--accent)' : 'var(--surface)',
            color: mode === 'aura' ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--line)',
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          <Sparkles size={13} />
          Ask AURA
        </button>
      </div>

      {/* ── AURA MODE ── */}
      {mode === 'aura' && (
        <div className="px-4 py-6 flex flex-col gap-6">
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              AURA · Automated Unification & Resonance Alchemist
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Tell AURA your context. It will synthesise the optimal layer from your collection.
            </p>
          </div>

          {/* Use case */}
          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Where are you going?</p>
            <div className="flex gap-2 flex-wrap">
              {AURA_USE_CASES.map(uc => (
                <Chip key={uc.key} selected={auraUseCase === uc.key} onClick={() => setAuraUseCase(uc.key)}>
                  {uc.label}
                </Chip>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>
              {AURA_USE_CASES.find(u => u.key === auraUseCase)?.hint}
            </p>
          </div>

          {/* Base fragrance (optional) */}
          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Base fragrance <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — let AURA decide)</span>
            </p>
            <button
              onClick={() => { setAuraBaseQuery(''); setAuraBasePickerOpen(true) }}
              className="text-left px-4 py-3 rounded-[var(--r-card)] transition-all"
              style={{ background: 'var(--surface)', border: `1px solid ${auraBase ? 'var(--accent)' : 'var(--line)'}` }}
            >
              {auraBase ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{auraBase.brand}</p>
                    <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{auraBase.name}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setAuraBaseId(null) }} style={{ color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pick a base (or leave blank for AURA to choose)</p>
              )}
            </button>
          </div>

          {/* Weather */}
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live weather</p>
              <p style={{ fontSize: 12, color: weather ? 'var(--text)' : 'var(--text-muted)', marginTop: 2 }}>
                {weatherLoading ? 'Detecting…' : weather ? weatherLabel(weather) : 'Not detected — AURA will use defaults'}
              </p>
            </div>
            <button
              onClick={fetchWeather}
              disabled={weatherLoading}
              className="px-3 py-1.5 rounded-[var(--r-btn)] transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}
            >
              {weather ? 'Refresh' : 'Detect'}
            </button>
          </div>

          {/* Submit */}
          <Button fullWidth onClick={handleAuraSubmit} disabled={auraLoading}>
            {auraLoading ? 'AURA is synthesising…' : 'Synthesise with AURA'}
          </Button>

          {auraError && <ErrorInline message={auraError} onRetry={handleAuraSubmit} />}

          {/* AURA results */}
          {auraLoading && (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <LoadingShimmer key={i} variant="line" />)}
            </div>
          )}

          {auraResult && !auraLoading && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  AURA Recommendations
                </p>
                <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                  {auraResult.aura_context.resonance_engine}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: -8 }}>
                {auraResult.aura_context.weather_condition} · {auraResult.aura_context.profile_description}
              </p>

              {auraResult.recommendations.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => applyAuraRecommendation(rec)}
                  className="w-full text-left px-4 py-4 rounded-[var(--r-card)] transition-all hover:border-[var(--accent)] group"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rec.brand}</p>
                      <p style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '20px' }}>{rec.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{rec.family} · {rec.layering_role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span style={{
                        fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        color: rec.harmony_pct >= 75 ? 'var(--accent)' : rec.harmony_pct >= 55 ? 'var(--text)' : 'var(--text-muted)',
                      }}>
                        {rec.harmony_pct}%
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Harmony</span>
                    </div>
                  </div>
                  <p className="mt-3" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}>
                    Tap to use this layer →
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL MODE ── */}
      {mode === 'manual' && (
      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Picker slots */}
        <div className="flex gap-3">
          <PickerSlot label="Anchor" fragrance={slot1} onClick={() => openPicker('slot1')} />
          <PickerSlot label="Top" fragrance={slot2} onClick={() => openPicker('slot2')} />
        </div>

        {/* Occasion chips */}
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Occasion</p>
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map(o => (
              <Chip key={o} selected={occasion === o} onClick={() => setOccasion(o)}>{o}</Chip>
            ))}
          </div>
        </div>

        {/* Formulate button */}
        <Button fullWidth disabled={!canFormulate} onClick={handleFormulate}>Synthesize</Button>

        {!canFormulate && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: -12 }}>
            Select two essences to begin synthesis
          </p>
        )}
      </div>
      )}

      {/* Fragrance picker sheet */}
      <Sheet open={pickerFor !== null} onClose={() => { setPickerFor(null); setPickerQuery('') }}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>
              Pick {pickerFor === 'slot1' ? 'Anchor' : 'Top'}
            </h2>
            <button onClick={() => { setPickerFor(null); setPickerQuery('') }}>
              <X size={18} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--r-btn)] text-sm focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex flex-col" style={{ marginLeft: -16, marginRight: -16 }}>
            {displayList.length === 0 ? (
              <p className="px-4 py-4" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No fragrances match &quot;{pickerQuery}&quot;.
              </p>
            ) : (
              displayList.map(f => {
                const isOtherSlot = pickerFor === 'slot1' ? f.id === slot2?.id : f.id === slot1?.id
                const isCurrentSlot = pickerFor === 'slot1' ? f.id === slot1?.id : f.id === slot2?.id
                return (
                  <FragrancePickerRow
                    key={f.id}
                    f={f}
                    selected={isCurrentSlot}
                    disabled={isOtherSlot}
                    onClick={() => selectFragrance(f)}
                  />
                )
              })
            )}
          </div>
        </div>
      </Sheet>

      {/* Result sheet */}
      <Sheet open={resultOpen} onClose={() => { if (!isLoading) setResultOpen(false) }}>
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Formulating…</p>
            <LoadingShimmer variant="line" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-4 py-4">
            <ErrorInline message={error} onRetry={handleFormulate} />
            <Button variant="secondary" fullWidth onClick={handleTryAnother}>Try another</Button>
          </div>
        ) : result ? (
          <ResultCard
            result={result}
            slot1={slot1}
            slot2={slot2}
            onTryAnother={handleTryAnother}
            onSave={handleSave}
            saveState={saveState}
          />
        ) : null}
      </Sheet>

      {/* AURA base picker sheet */}
      <Sheet open={auraBasePickerOpen} onClose={() => setAuraBasePickerOpen(false)}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>Pick Base</h2>
            <button onClick={() => setAuraBasePickerOpen(false)}>
              <X size={18} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search…"
              value={auraBaseQuery}
              onChange={e => setAuraBaseQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--r-btn)] text-sm focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex flex-col" style={{ marginLeft: -16, marginRight: -16 }}>
            {auraBaseList.map(f => (
              <FragrancePickerRow
                key={f.id}
                f={f}
                selected={f.id === auraBaseId}
                disabled={false}
                onClick={() => { setAuraBaseId(f.id); setAuraBasePickerOpen(false); setAuraBaseQuery('') }}
              />
            ))}
          </div>
        </div>
      </Sheet>

      {/* Auth sheet */}
      <AuthSheet
        open={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
      />
    </div>
  )
}
