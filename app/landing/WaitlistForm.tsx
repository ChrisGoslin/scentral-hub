'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), archetype: 'experimenter' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
        You&apos;re on the list ✓
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            minHeight: 44,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-btn)',
            padding: '0 14px',
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '…' : 'Join waitlist →'}
        </Button>
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Something went wrong — try again
        </p>
      )}
    </form>
  )
}
