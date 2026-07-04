'use client'

import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'

type FeedbackType = 'bug' | 'enhancement' | 'suggestion'

const TYPE_OPTIONS: Array<{ value: FeedbackType; label: string }> = [
  { value: 'bug', label: 'Bug' },
  { value: 'enhancement', label: 'Idea' },
  { value: 'suggestion', label: 'Suggestion' },
]

// Reuses the app-wide anon identity key so admin-awarded XP lands on the same
// user_xp row as every other XP source (wear logging, contributions) — not a
// disconnected second identity.
function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem('scentral_anon_id')
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem('scentral_anon_id', id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setType(null)
    setTitle('')
    setBody('')
    setSubmitted(false)
    setError(null)
  }

  function close() {
    setOpen(false)
    setTimeout(reset, 250)
  }

  async function handleSubmit() {
    if (!type || !title.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getOrCreateSessionId(),
          type,
          title: title.trim(),
          body: body.trim() || undefined,
          url: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Something went wrong — try again?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed z-40 flex items-center justify-center rounded-full"
        style={{
          right: 16,
          bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 16px)',
          width: 48,
          height: 48,
          background: 'var(--accent)',
          color: 'var(--bg)',
          fontSize: 20,
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        ✦
      </button>

      <Sheet open={open} onClose={close}>
        {submitted ? (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', lineHeight: '28px' }}>
              Received. Every submission shapes what nota. becomes — thank you.
            </p>
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>
              Send feedback
            </h2>

            <div className="flex gap-2">
              {TYPE_OPTIONS.map(opt => (
                <Chip key={opt.value} selected={type === opt.value} onClick={() => setType(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's up?"
              maxLength={120}
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-chip)] focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Tell us more..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-chip)] focus:outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />

            {error && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>}

            <Button
              fullWidth
              disabled={!type || !title.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Sending...' : 'Submit'}
            </Button>
          </div>
        )}
      </Sheet>
    </>
  )
}
