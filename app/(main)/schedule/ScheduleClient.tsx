'use client'

import React, { useState, useMemo } from 'react'
import { Search, Check, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { SLOTS, type SlotKey, type SlotConfig, type ScheduleFragrance, type SavedSchedule } from './types'
import SlotCard, { PhaseChip } from './SlotCard'
import Sheet from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import AuthSheet from '@/components/auth/AuthSheet'
import SaveSheet from './SaveSheet'

interface ScheduleClientProps {
  fragrances: ScheduleFragrance[]
  savedSchedules: SavedSchedule[]
  isSignedIn: boolean
}

export type { ScheduleFragrance, SavedSchedule } from './types'

export default function ScheduleClient({ fragrances, savedSchedules: initialSavedSchedules, isSignedIn }: ScheduleClientProps) {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'exploration'
  const [explorationMode, setExplorationMode] = useState(initialMode)

  const [slots, setSlots] = useState<Record<SlotKey, ScheduleFragrance | null>>({
    morning: null,
    midday: null,
    evening: null
  })
  const [sprays, setSprays] = useState<Record<SlotKey, number>>({
    morning: 2,
    midday: 2,
    evening: 2
  })
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(initialSavedSchedules)

  // Filter and sort fragrances for the picker — memoised so spray-tap re-renders don't re-sort
  const filteredFragrances = useMemo(() => {
    const preferred = activeSlot ? (SLOTS.find(s => s.key === activeSlot)?.preferredPhases ?? []) : []
    const q = searchQuery.toLowerCase()
    return fragrances
      .filter(f => {
        // In Exploration Mode, prioritize low-wear items (Scent Debt)
        if (explorationMode && f.wear_count && f.wear_count > 5) return false
        return !q || `${f.brand} ${f.name}`.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        // Exploration Mode sorts by least worn first
        if (explorationMode) {
          return (a.wear_count || 0) - (b.wear_count || 0)
        }
        const aPref = a.phase ? preferred.includes(a.phase) : false
        const bPref = b.phase ? preferred.includes(b.phase) : false
        if (aPref !== bPref) return aPref ? -1 : 1
        return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
      })
  }, [fragrances, searchQuery, activeSlot, explorationMode])

  const highAnosmiaCount = Object.values(slots).filter(f => f?.anosmia_risk === 'High').length
  const hasHighAnosmiaRisk = highAnosmiaCount >= 2
  const totalSprays = (Object.keys(slots) as SlotKey[]).reduce((sum, k) => slots[k] ? sum + sprays[k] : sum, 0)
  const isFilled = Object.values(slots).some(s => s !== null)

  const handleSelect = (fragrance: ScheduleFragrance | null) => {
    if (activeSlot) {
      setSlots(prev => ({ ...prev, [activeSlot]: fragrance }))
      if (fragrance?.spritz_count) {
        setSprays(prev => ({ ...prev, [activeSlot]: fragrance.spritz_count || 2 }))
      }
      setActiveSlot(null)
      setSearchQuery('')
      setLastSavedId(null)
    }
  }

  const handleSaveClick = () => {
    if (!isSignedIn) {
      setAuthSheetOpen(true)
    } else {
      setSaveSheetOpen(true)
    }
  }

  const loadSchedule = (s: SavedSchedule) => {
    setSlots({
      morning: s.morning_frag,
      midday: s.midday_frag,
      evening: s.evening_frag
    })
    setSprays({
      morning: s.morning_sprays ?? 2,
      midday: s.midday_sprays ?? 2,
      evening: s.evening_sprays ?? 2
    })
    setLastSavedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveSuccess = (id: string, name: string, occasion: string | null) => {
    setLastSavedId(id)
    // Add to local list (optimistic)
    const newSaved: SavedSchedule = {
      id,
      name,
      occasion,
      created_at: new Date().toISOString(),
      morning_sprays: sprays.morning,
      midday_sprays: sprays.midday,
      evening_sprays: sprays.evening,
      morning_frag: slots.morning,
      midday_frag: slots.midday,
      evening_frag: slots.evening
    }
    setSavedSchedules(prev => [newSaved, ...prev].slice(0, 10))
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4 border-b border-[var(--line)] flex justify-between items-end">
        <div>
          <h1 className="text-[28px] leading-tight font-serif italic text-[var(--text)]">The Ritual</h1>
          <p className="text-[13px] text-[var(--text-muted)]">Compose your daily fragrance sequence.</p>
        </div>
        <button 
          onClick={() => setExplorationMode(!explorationMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            explorationMode 
              ? 'bg-[var(--hf-gold)] border-[var(--hf-gold)] text-white shadow-lg' 
              : 'bg-white border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--hf-gold)]'
          }`}
        >
          <Sparkles size={14} className={explorationMode ? 'animate-pulse' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {explorationMode ? 'Exploration' : 'Standard'}
          </span>
        </button>
      </div>

      <div className="px-4 py-6 flex flex-col gap-4">
        {SLOTS.map(config => (
          <SlotCard
            key={config.key}
            config={config}
            selected={slots[config.key]}
            sprays={sprays[config.key]}
            onTap={() => setActiveSlot(config.key)}
            onSpraysChange={(n) => {
              setSprays(prev => ({ ...prev, [config.key]: n }))
              setLastSavedId(null)
            }}
          />
        ))}

        {/* Spray summary + anosmia pill */}
        {isFilled && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
              {totalSprays} total spray{totalSprays !== 1 ? 's' : ''}
            </span>
            {hasHighAnosmiaRisk && (
              <span
                title="Two high anosmia-risk fragrances selected — consider spacing 2+ hours apart"
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border cursor-help"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--line)', background: 'var(--surface)' }}
              >
                ⚠ ARR
              </span>
            )}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <Button
            fullWidth
            disabled={!isFilled || !!lastSavedId}
            onClick={handleSaveClick}
            variant={lastSavedId ? 'secondary' : 'primary'}
          >
            {lastSavedId ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Preserved!
              </span>
            ) : 'Preserve this ritual'}
          </Button>
          
          {!isSignedIn && (
            <p className="text-center text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
              Sign in to preserve your rituals
            </p>
          )}
        </div>

        {/* Saved Schedules */}
        {isSignedIn && (
          <div className="mt-8 pt-8 border-t border-[var(--line)]">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)] mb-6">Preserved rituals</p>
            {savedSchedules.length === 0 ? (
              <EmptyState headline="No preserved rituals yet." />
            ) : (
              <div className="flex flex-col gap-4">
                {savedSchedules.map(s => (
                  <SavedScheduleRow key={s.id} schedule={s} onLoad={loadSchedule} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Picker Sheet */}
      <Sheet open={!!activeSlot} onClose={() => setActiveSlot(null)}>
        <div className="flex flex-col gap-6 py-4">
          <div>
            <h2 className="text-[20px] font-serif italic text-[var(--text)]">Select Essence</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">
              {activeSlot && SLOTS.find(s => s.key === activeSlot)?.phaseHint}
            </p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              autoFocus
              type="text"
              placeholder="Search by brand or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-btn)] px-11 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col max-h-[50vh] overflow-y-auto">
            {activeSlot && slots[activeSlot] && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full text-left px-2 py-4 text-[var(--danger)] text-[12px] font-bold uppercase tracking-widest border-b border-[var(--line)]"
              >
                Clear slot
              </button>
            )}
            
            {filteredFragrances.map(f => (
              <button
                key={f.id}
                onClick={() => handleSelect(f)}
                className="w-full text-left px-2 py-4 border-b border-[var(--line)] last:border-0 flex justify-between items-center group"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">{f.brand}</p>
                  <p className="text-[15px] font-serif italic text-[var(--text)] truncate">{f.name}</p>
                </div>
                {f.phase && <PhaseChip phase={f.phase} />}
              </button>
            ))}

            {filteredFragrances.length === 0 && (
              <p className="text-center py-8 text-[var(--text-muted)] text-[13px]">No matching essences found.</p>
            )}
          </div>
        </div>
      </Sheet>

      {/* Save Sheet */}
      <SaveSheet
        open={saveSheetOpen}
        onClose={() => setSaveSheetOpen(false)}
        slots={slots}
        sprays={sprays}
        onSuccess={handleSaveSuccess}
      />

      {/* Auth Sheet */}
      <AuthSheet
        open={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
        redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/schedule` : '/schedule'}
      />
    </div>
  )
}

function SavedScheduleRow({ schedule, onLoad }: { schedule: SavedSchedule; onLoad: (s: SavedSchedule) => void }) {
  const count = [schedule.morning_frag, schedule.midday_frag, schedule.evening_frag].filter(Boolean).length
  const date = schedule.created_at ? new Date(schedule.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <button
      onClick={() => onLoad(schedule)}
      className="w-full text-left bg-white border border-[var(--line)] p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group"
    >
      <div className="flex justify-between items-start">
        <h4 className="text-[17px] font-serif italic text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{schedule.name}</h4>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{date}</span>
      </div>
      <div className="flex items-center gap-2">
        {schedule.occasion && (
          <span className="text-[9px] px-2 py-0.5 bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
            {schedule.occasion}
          </span>
        )}
        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
          {count} essence{count !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  )
}
