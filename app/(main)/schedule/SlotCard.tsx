'use client'

import React from 'react'
import { Plus, Minus } from 'lucide-react'
import { type SlotConfig, type ScheduleFragrance } from './types'

type SlotCardProps = {
  config: SlotConfig
  selected: ScheduleFragrance | null
  sprays: number
  onTap: () => void
  onSpraysChange: (n: number) => void
}

export { PhaseChip }

export default function SlotCard({ config, selected, sprays, onTap, onSpraysChange }: SlotCardProps) {
  const handleSpraysChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    const next = Math.min(8, Math.max(1, sprays + delta))
    onSpraysChange(next)
  }

  if (!selected) {
    return (
      <button
        onClick={onTap}
        className="w-full text-left bg-[var(--surface)] border border-dashed border-[var(--line)] p-6 transition-all hover:border-[var(--accent)] group"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)]">{config.label} · {config.time}</span>
        </div>
        <p className="text-[12px] text-[var(--text-muted)] font-light mb-4">{config.phaseHint}</p>
        <span className="text-[13px] font-serif italic text-[var(--accent)] group-hover:translate-x-1 transition-transform inline-block">
          Choose a fragrance →
        </span>
      </button>
    )
  }

  return (
    <div 
      onClick={onTap}
      className="w-full bg-[var(--surface)] border-l-[3px] border-l-[var(--accent)] border-y border-r border-[var(--line)] p-6 shadow-sm cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)]">{config.label} · {config.time}</span>
        <PhaseChip phase={selected.phase || 3} />
      </div>

      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mb-1">{selected.brand}</p>
        <h4 className="text-[17px] font-serif italic text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{selected.name}</h4>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-stone-200/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => handleSpraysChange(e, -1)}
            disabled={sprays <= 1}
            className="w-6 h-6 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="text-[13px] font-bold w-4 text-center">{sprays}</span>
          <button 
            onClick={(e) => handleSpraysChange(e, 1)}
            disabled={sprays >= 8}
            className="w-6 h-6 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 transition-colors"
          >
            <Plus size={12} />
          </button>
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)] ml-1">Sprays</span>
        </div>

        {selected.application_zone && (
          <span className="text-[9px] px-2 py-0.5 bg-white border border-[var(--line)] text-[var(--text-muted)] font-bold uppercase tracking-widest rounded-full">
            {selected.application_zone}
          </span>
        )}
      </div>
    </div>
  )
}

function PhaseChip({ phase }: { phase: number }) {
  const styles: Record<number, React.CSSProperties> = {
    1: { background: 'var(--accent)', color: 'var(--bg)' },
    2: { background: 'var(--surface-2)', color: 'var(--text)' },
    3: { background: 'var(--surface)', color: 'var(--text-muted)' }
  }
  const labels: Record<number, string> = { 1: 'Anchor', 2: 'Modulator', 3: 'Top' }

  return (
    <span 
      className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest rounded-[var(--r-chip)]"
      style={styles[phase] || styles[3]}
    >
      {labels[phase] || 'Note'}
    </span>
  )
}
