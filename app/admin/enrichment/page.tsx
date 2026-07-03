// app/admin/enrichment/page.tsx
// Admin review UI for the description enrichment queue.
// Passcode-gated (mirrors /admin/feedback). Per-row approve/reject only — no bulk actions,
// since approval writes to fragrances.plain_description on a 127k-row production table.

'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import EmptyState from '@/components/ui/EmptyState'

interface QueueRecord {
  id: string
  fragrance_id: string
  fragrance_name?: string
  fragrance_brand?: string
  fragrance_image?: string
  ai_description: string
  status: 'pending_review' | 'approved' | 'rejected'
  created_at: string
}

interface Stats {
  pending: number
  approved_today: number
  rejected: number
}

const STORAGE_KEY = 'scentral_admin_passcode'
const PAGE_SIZE = 10

export default function EnrichmentReviewPage() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const [records, setRecords] = useState<QueueRecord[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, approved_today: 0, rejected: 0 })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchRecords(code: string, pageNum: number): Promise<boolean> {
    const res = await fetch(`/api/admin/enrichment/list?page=${pageNum}&per_page=${PAGE_SIZE}`, {
      headers: { 'x-admin-passcode': code },
    })
    if (!res.ok) return false
    const data = await res.json()
    setRecords(data.data)
    setTotal(data.total)
    return true
  }

  async function fetchStats(code: string) {
    const res = await fetch('/api/admin/enrichment/stats', { headers: { 'x-admin-passcode': code } })
    if (!res.ok) return
    setStats(await res.json())
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setChecking(false)
      return
    }
    setLoading(true)
    fetchRecords(stored, page)
      .then(ok => {
        if (ok) {
          setAuthed(true)
          fetchStats(stored)
        } else {
          sessionStorage.removeItem(STORAGE_KEY)
        }
      })
      .finally(() => {
        setChecking(false)
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!authed) return
    const code = sessionStorage.getItem(STORAGE_KEY)
    if (!code) return
    setLoading(true)
    fetchRecords(code, page).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handleUnlock() {
    setAuthError(null)
    setLoading(true)
    const ok = await fetchRecords(passcode, page)
    if (ok) {
      sessionStorage.setItem(STORAGE_KEY, passcode)
      setAuthed(true)
      fetchStats(passcode)
    } else {
      setAuthError('Incorrect passcode')
    }
    setLoading(false)
  }

  async function handleAction(queueId: string, action: 'approve' | 'reject') {
    const code = sessionStorage.getItem(STORAGE_KEY)
    if (!code) return
    try {
      setProcessing(queueId)
      setError(null)

      const res = await fetch('/api/admin/enrichment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': code },
        body: JSON.stringify({ queue_id: queueId, action }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed: ${res.status}`)
      }

      fetchRecords(code, page)
      fetchStats(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setProcessing(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
          <input
            type="password"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="Passcode"
            className="w-full px-3 py-2.5 text-sm rounded-[var(--r-chip)] focus:outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          {authError && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{authError}</p>}
          <Button fullWidth onClick={handleUnlock}>Unlock</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)' }}>
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)' }}>
          Description Enrichment
        </h1>
        <div className="flex gap-6 mt-4">
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>{stats.pending}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Approved today</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--positive)' }}>{stats.approved_today}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rejected</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-muted)' }}>{stats.rejected}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', border: '1px solid var(--danger)', borderRadius: 'var(--r-card)', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-4 pt-6"><LoadingShimmer variant="card" /></div>
      ) : records.length === 0 ? (
        <EmptyState headline="No pending descriptions to review" />
      ) : (
        <>
          <div className="flex flex-col">
            {records.map(record => (
              <div key={record.id} className="px-4 py-4 flex gap-4" style={{ borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 72, height: 100, flexShrink: 0, borderRadius: 'var(--r-chip)', overflow: 'hidden', background: 'var(--surface-2)' }}>
                  {record.fragrance_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={record.fragrance_image} alt={record.fragrance_name || 'Fragrance'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {record.fragrance_brand} — {record.fragrance_name}
                  </p>
                  <p
                    className="mt-2"
                    style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: 'var(--r-chip)', padding: '10px 12px' }}
                  >
                    {record.ai_description}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => handleAction(record.id, 'approve')}
                    disabled={processing === record.id}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--r-chip)',
                      border: '1px solid var(--positive)',
                      background: 'color-mix(in srgb, var(--positive) 12%, transparent)',
                      color: 'var(--positive)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: processing === record.id ? 'not-allowed' : 'pointer',
                      opacity: processing === record.id ? 0.6 : 1,
                    }}
                  >
                    {processing === record.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(record.id, 'reject')}
                    disabled={processing === record.id}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--r-chip)',
                      border: '1px solid var(--line)',
                      background: 'var(--surface)',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: processing === record.id ? 'not-allowed' : 'pointer',
                      opacity: processing === record.id ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 py-6">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </>
      )}
    </div>
  )
}
