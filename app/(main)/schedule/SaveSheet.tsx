'use client'

import React, { useState } from 'react'
import { type SlotKey, type ScheduleFragrance } from './types'
import Sheet from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'

interface SaveSheetProps {
  open: boolean
  onClose: () => void
  slots: Record<SlotKey, ScheduleFragrance | null>
  sprays: Record<SlotKey, number>
  onSuccess: (id: string, name: string, occasion: string | null) => void
}

const OCCASIONS = ['Work', 'Date', 'Gym', 'Casual']

export default function SaveSheet({ open, onClose, slots, sprays, onSuccess }: SaveSheetProps) {
  const [name, setName] = useState('My Schedule')
  const [occasion, setOccasion] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/schedule/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          occasion,
          morning_fragrance_id: slots.morning?.id || null,
          midday_fragrance_id: slots.midday?.id || null,
          evening_fragrance_id: slots.evening?.id || null,
          morning_sprays: slots.morning ? sprays.morning : null,
          midday_sprays: slots.midday ? sprays.midday : null,
          evening_sprays: slots.evening ? sprays.evening : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save schedule')
      }

      onSuccess(data.id, name, occasion)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-8 py-4">
        <div>
          <h2 className="text-[20px] font-serif italic text-[var(--text)]">Save Schedule</h2>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">
            Give your ritual a name and occasion for future reference.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Schedule Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-btn)] px-5 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)]"
              placeholder="e.g. Rainy Day Routine"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Occasion</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(o => (
                <Chip
                  key={o}
                  selected={occasion === o}
                  onClick={() => setOccasion(occasion === o ? null : o)}
                >
                  {o}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-xs">
            {error}
          </div>
        )}

        <Button
          fullWidth
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? 'Saving...' : 'Confirm & Save'}
        </Button>
      </div>
    </Sheet>
  )
}
