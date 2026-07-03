// app/admin/enrichment/page.tsx
// Admin review UI for description enrichment queue
// Displays pending descriptions with approve/reject actions
// Protected by simple token auth check

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface QueueRecord {
  id: string
  fragrance_id: string
  fragrance_name?: string
  fragrance_brand?: string
  fragrance_image?: string
  generated_description: string
  status: 'pending_review' | 'approved' | 'rejected'
  created_at: string
}

interface Stats {
  pending: number
  approved_today: number
  rejected: number
}

interface PaginatedResponse {
  data: QueueRecord[]
  total: number
  page: number
  per_page: number
}

export default function EnrichmentReviewPage() {
  const [records, setRecords] = useState<QueueRecord[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, approved_today: 0, rejected: 0 })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const PAGE_SIZE = 10

  useEffect(() => {
    fetchRecords(page)
    fetchStats()
  }, [page])

  async function fetchRecords(pageNum: number) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/admin/enrichment/list?page=${pageNum}&per_page=${PAGE_SIZE}`
      )

      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized')
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const data: PaginatedResponse = await res.json()
      setRecords(data.data)
      setTotal(data.total)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('Error fetching records:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/enrichment/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')

      const data: Stats = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  async function handleAction(queueId: string, action: 'approve' | 'reject') {
    try {
      setProcessing(queueId)
      setError(null)

      const res = await fetch('/api/admin/enrichment/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''}`
        },
        body: JSON.stringify({ queue_id: queueId, action })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `Failed: ${res.status}`)
      }

      // Refresh records and stats
      fetchRecords(page)
      fetchStats()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('Error performing action:', err)
    } finally {
      setProcessing(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Description Enrichment Review
      </h1>

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            padding: '1rem',
            border: '1px solid var(--line, #e0e0e0)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--surface, #fafafa)'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted, #666)' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent, #000)' }}>
            {stats.pending}
          </div>
        </div>
        <div
          style={{
            padding: '1rem',
            border: '1px solid var(--line, #e0e0e0)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--surface, #fafafa)'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted, #666)' }}>
            Approved Today
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent, #000)' }}>
            {stats.approved_today}
          </div>
        </div>
        <div
          style={{
            padding: '1rem',
            border: '1px solid var(--line, #e0e0e0)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--surface, #fafafa)'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted, #666)' }}>
            Rejected
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent, #000)' }}>
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fce4e4',
            color: '#c41e3a',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #e0b0b0'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #666)' }}>
          Loading...
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #666)' }}>
          No pending descriptions to review.
        </div>
      ) : (
        <>
          {/* Records grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {records.map((record) => (
              <div
                key={record.id}
                style={{
                  border: '1px solid var(--line, #e0e0e0)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--surface, #fafafa)',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '1.5rem',
                  alignItems: 'start'
                }}
              >
                {/* Fragrance image */}
                <div style={{ flex: '0 0 100px' }}>
                  {record.fragrance_image ? (
                    <img
                      src={record.fragrance_image}
                      alt={record.fragrance_name || 'Fragrance'}
                      style={{
                        width: '100px',
                        height: '140px',
                        objectFit: 'cover',
                        borderRadius: '0.25rem'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100px',
                        height: '140px',
                        backgroundColor: 'var(--surface-2, #f0f0f0)',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted, #999)'
                      }}
                    >
                      No image
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {record.fragrance_brand} — {record.fragrance_name}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-muted, #666)',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    ID: {record.fragrance_id}
                  </p>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--surface-2, #f5f5f5)',
                      borderRadius: '0.25rem',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      color: 'var(--text, #000)'
                    }}
                  >
                    {record.generated_description}
                  </div>
                  <div
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted, #999)'
                    }}
                  >
                    Created: {new Date(record.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAction(record.id, 'approve')}
                    disabled={processing === record.id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: processing === record.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: processing === record.id ? 0.6 : 1
                    }}
                  >
                    {processing === record.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(record.id, 'reject')}
                    disabled={processing === record.id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: processing === record.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: processing === record.id ? 0.6 : 1
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '2rem'
            }}
          >
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page === 1 ? 'var(--surface-2, #f0f0f0)' : 'var(--accent, #000)',
                color: page === 1 ? 'var(--text-muted, #999)' : 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem 1rem', color: 'var(--text-muted, #666)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page === totalPages ? 'var(--surface-2, #f0f0f0)' : 'var(--accent, #000)',
                color: page === totalPages ? 'var(--text-muted, #999)' : 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
