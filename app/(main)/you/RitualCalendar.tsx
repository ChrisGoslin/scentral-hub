'use client'

import { useEffect, useMemo, useState } from 'react'

type WearEvent = { fragrance_id: string; fragrance_name: string; date: string }

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function RitualCalendar({ auraStreak }: { auraStreak: number }) {
  const [history, setHistory] = useState<WearEvent[]>([])
  const [monthOffset, setMonthOffset] = useState(0)
  const [activeDay, setActiveDay] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('scentral_wear_history') ?? '[]')
      setHistory(stored)
    } catch {
      setHistory([])
    }
  }, [])

  const viewDate = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [monthOffset])

  const wearsByDay = useMemo(() => {
    const map: Record<string, WearEvent[]> = {}
    for (const h of history) {
      const day = h.date.slice(0, 10)
      if (!map[day]) map[day] = []
      map[day].push(h)
    }
    return map
  }, [history])

  if (history.length === 0 && auraStreak === 0) return null

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = new Date().toISOString().slice(0, 10)

  const cells: Array<{ key: string; day: number } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ key, day: d })
  }

  const daysWornThisMonth = cells.filter(c => c && wearsByDay[c.key]?.length).length

  async function handleShare() {
    const text = `${daysWornThisMonth} days this month — ${MONTH_NAMES[month]} ${year}\nnota. · Find your base note`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch { /* user cancelled */ }
    }
  }

  return (
    <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 'var(--r-card)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Your ritual, {MONTH_NAMES[month]} {year}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            aria-label="Previous month"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
          >
            ←
          </button>
          <button
            onClick={() => setMonthOffset(o => Math.min(0, o + 1))}
            aria-label="Next month"
            disabled={monthOffset === 0}
            style={{ background: 'none', border: 'none', color: monthOffset === 0 ? 'var(--line)' : 'var(--text-muted)', cursor: monthOffset === 0 ? 'default' : 'pointer', fontSize: 14 }}
          >
            →
          </button>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 12 }}>
        {daysWornThisMonth} {daysWornThisMonth === 1 ? 'day' : 'days'} this month
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, position: 'relative' }}>
        {cells.map((c, i) => {
          if (!c) return <div key={`empty-${i}`} />
          const worn = !!wearsByDay[c.key]?.length
          const isToday = c.key === todayKey
          return (
            <button
              key={c.key}
              onClick={() => worn && setActiveDay(activeDay === c.key ? null : c.key)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: worn ? 'var(--accent)' : 'transparent',
                border: isToday ? '2px solid var(--accent)' : worn ? 'none' : '1px solid var(--line)',
                color: worn ? 'var(--bg)' : 'var(--text-muted)',
                fontSize: 10,
                cursor: worn ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {c.day}
            </button>
          )
        })}
      </div>

      {activeDay && wearsByDay[activeDay] && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          {wearsByDay[activeDay].map((w, i) => (
            <p key={i} style={{ fontSize: 12, color: 'var(--text)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
              {w.fragrance_name}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleShare}
        style={{
          marginTop: 12,
          background: 'none',
          border: 'none',
          color: 'var(--accent)',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        Share month →
      </button>
    </div>
  )
}
