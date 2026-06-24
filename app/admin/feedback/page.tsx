'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import EmptyState from '@/components/ui/EmptyState'

type FeedbackRow = {
  id: string
  type: 'bug' | 'enhancement' | 'suggestion'
  title: string
  body: string | null
  url: string | null
  status: 'in_review' | 'building' | 'captured'
  xp_awarded: number
  admin_note: string | null
  created_at: string
}

const TYPE_LABELS: Record<FeedbackRow['type'], string> = {
  bug: 'Bug',
  enhancement: 'Idea',
  suggestion: 'Suggestion',
}

const STATUS_LABELS: Record<FeedbackRow['status'], string> = {
  in_review: 'In Review',
  building: "It's Being Built ✦",
  captured: 'Captured',
}

const STATUS_COLOR: Record<FeedbackRow['status'], string> = {
  in_review: 'var(--text-muted)',
  building: 'var(--accent)',
  captured: 'var(--xp-color)',
}

const STORAGE_KEY = 'scentral_admin_passcode'

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        color,
        border: `1px solid ${color}`,
        borderRadius: 'var(--r-chip)',
        padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export default function AdminFeedbackPage() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  async function fetchFeedback(code: string): Promise<boolean> {
    const res = await fetch('/api/admin/feedback', { headers: { 'x-admin-passcode': code } })
    if (!res.ok) return false
    const { feedback } = await res.json()
    setRows(feedback)
    return true
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setChecking(false)
      return
    }
    fetchFeedback(stored).then(ok => {
      if (ok) {
        setAuthed(true)
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
      setChecking(false)
    })
  }, [])

  async function handleUnlock() {
    setError(null)
    const ok = await fetchFeedback(passcode)
    if (ok) {
      sessionStorage.setItem(STORAGE_KEY, passcode)
      setAuthed(true)
    } else {
      setError('Incorrect passcode')
    }
  }

  async function handleAction(row: FeedbackRow, action: 'building' | 'captured') {
    const code = sessionStorage.getItem(STORAGE_KEY)
    if (!code) return
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/admin/feedback/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': code },
        body: JSON.stringify({ action, admin_note: notes[row.id]?.trim() || row.admin_note || undefined }),
      })
      if (!res.ok) throw new Error()
      const { xp_awarded } = await res.json()
      setRows(prev =>
        prev.map(r =>
          r.id === row.id
            ? { ...r, status: action, xp_awarded: action === 'building' ? xp_awarded : 0, admin_note: notes[row.id]?.trim() || r.admin_note }
            : r
        )
      )
    } catch {
      setError('Action failed — try again')
    } finally {
      setBusyId(null)
    }
  }

  if (checking) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh', padding: 24 }}>
        <LoadingShimmer variant="card" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="w-full max-w-sm flex flex-col gap-4">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>
            Admin access
          </h1>
          {process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Restricted to {process.env.NEXT_PUBLIC_ADMIN_EMAIL}
            </p>
          )}
          <input
            type="password"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="Passcode"
            className="w-full px-3 py-2.5 text-sm rounded-[var(--r-chip)] focus:outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          {error && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
          <Button fullWidth onClick={handleUnlock}>Unlock</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)' }}>
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)' }}>Feedback</h1>
      </div>

      {rows.length === 0 ? (
        <EmptyState headline="No feedback yet" />
      ) : (
        <div className="flex flex-col">
          {rows.map(row => (
            <div key={row.id} className="px-4 py-4 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge color="var(--text-muted)">{TYPE_LABELS[row.type]}</Badge>
                <Badge color={STATUS_COLOR[row.status]}>{STATUS_LABELS[row.status]}</Badge>
                {row.xp_awarded > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--xp-color)' }}>+{row.xp_awarded} XP</span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{row.title}</p>
              {row.body && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.body}</p>}
              {row.url && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.url}</p>}

              <input
                value={notes[row.id] ?? row.admin_note ?? ''}
                onChange={e => setNotes(prev => ({ ...prev, [row.id]: e.target.value }))}
                placeholder="Admin note (optional)"
                className="px-2.5 py-1.5 text-xs rounded-[var(--r-chip)] focus:outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
              />

              <div className="flex gap-2 mt-1">
                <Button
                  variant="secondary"
                  disabled={busyId === row.id || row.status === 'building'}
                  onClick={() => handleAction(row, 'building')}
                  className="!min-h-[36px] !px-4 text-xs"
                >
                  {"It's being built"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={busyId === row.id || row.status === 'captured'}
                  onClick={() => handleAction(row, 'captured')}
                  className="!min-h-[36px] !px-4 text-xs"
                >
                  Captured
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
