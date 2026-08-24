'use client'

/**
 * "I tried something" — a ~30s capture flow for logging a Tested interaction.
 * Search → confirm (+ optional note) → done. Writes to `collections` via
 * POST /api/collection/tested (status='tested'). Follows the same search
 * pattern as the Shelf's search sheet (/api/search?mode=exact) and the same
 * calm completion-moment doctrine as the Shelf share action — one quiet line,
 * no fanfare, no dead ends (nota-customer-experience).
 */

import { useState, useRef, useEffect, useCallback } from 'react'

type Fragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  image_url: string | null
}

type SearchResult = { fragrance: Record<string, unknown> }

type Step = 'search' | 'confirm' | 'done' | 'error'

export default function TriedSomethingSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fragrance[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Fragrance | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trimmedQuery = query.trim()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (trimmedQuery.length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&mode=exact`)
        const data = await res.json()
        const fragrances: Fragrance[] = (data.results ?? []).map((r: SearchResult) => ({
          id: r.fragrance.id as string,
          brand: r.fragrance.brand as string,
          name: r.fragrance.name as string,
          family: (r.fragrance.family as string) ?? null,
          image_url: (r.fragrance.image_url as string) ?? null,
        }))
        setResults(fragrances)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trimmedQuery])

  const handleSubmit = useCallback(async () => {
    if (!selected) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/collection/tested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance_id: selected.id,
          ...(note.trim() ? { personal_notes: note.trim() } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMessage(data?.error || "That didn't save. Try once more.")
        setStep('error')
        return
      }
      setStep('done')
    } catch {
      setErrorMessage("That didn't save. Try once more.")
      setStep('error')
    } finally {
      setSubmitting(false)
    }
  }, [selected, note])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--surface, #111827)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)' }}>
            I tried something
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {step === 'search' && (
          <>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What did you try?"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--line, #334155)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: 15,
              }}
            />
            {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Searching…</p>}
            {!loading && trimmedQuery.length >= 2 && results.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing found yet — try the brand name too.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelected(f)
                    setStep('confirm')
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--line, #334155)',
                    background: 'transparent',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.brand}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'confirm' && selected && (
          <>
            <div>
              <p style={{ fontSize: 15, color: 'var(--text)' }}>{selected.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.brand}</p>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 500))}
              placeholder="How did it wear? (optional)"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--line, #334155)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: 14,
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep('search')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 999,
                  border: '1px solid var(--line, #334155)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '10px 0',
                  borderRadius: 999,
                  border: 'none',
                  background: 'var(--color-primary, #B8913A)',
                  color: '#0F172A',
                  fontWeight: 600,
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Logging…' : 'Log it'}
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{ padding: '18px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--text)' }}>Logged. It&apos;s yours to remember.</p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 14,
                padding: '8px 20px',
                borderRadius: 999,
                border: '1px solid var(--color-primary, #B8913A)',
                background: 'transparent',
                color: 'var(--color-primary, #B8913A)',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div style={{ padding: '10px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{errorMessage}</p>
            <button
              type="button"
              onClick={() => setStep('confirm')}
              style={{
                marginTop: 10,
                padding: '8px 20px',
                borderRadius: 999,
                border: '1px solid var(--color-primary, #B8913A)',
                background: 'transparent',
                color: 'var(--color-primary, #B8913A)',
                cursor: 'pointer',
              }}
            >
              Try once more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
