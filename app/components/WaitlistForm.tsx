'use client'

import { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, archetype: 'collector' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-[var(--text-muted)] font-light">
        You&apos;re on the list ✓
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === 'loading'}
          style={{ minHeight: 44 }}
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-btn)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors flex-1 min-w-0"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{ minHeight: 44 }}
          className="bg-transparent border border-[var(--line)] rounded-[var(--r-btn)] px-5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? '…' : 'Join waitlist →'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-400">Something went wrong — try again</p>
      )}
    </div>
  )
}
