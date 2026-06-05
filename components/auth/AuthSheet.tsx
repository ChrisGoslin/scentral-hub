'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sheet from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'

interface AuthSheetProps {
  open: boolean
  onClose: () => void
  redirectTo?: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function AuthSheet({ open, onClose, redirectTo }: AuthSheetProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setStatus('error')
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setStatus('sending')
    setErrorMsg('')

    const supabase = createClient()
    const emailRedirectTo =
      redirectTo ??
      (typeof window !== 'undefined'
        ? `${window.location.origin}/auth/confirm?next=/layering`
        : '/auth/confirm?next=/layering')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  function handleResend() {
    setStatus('idle')
    setErrorMsg('')
  }

  function handleClose() {
    setStatus('idle')
    setEmail('')
    setErrorMsg('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-5 py-4">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', lineHeight: '28px' }}>
            Sign in
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {status === 'sent'
              ? 'Check your email for the link.'
              : "We'll email you a magic link — no password needed."}
          </p>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--r-card)] p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              <p style={{ fontSize: 14, color: 'var(--positive)' }}>
                Link sent to <strong>{email}</strong>. Click it to sign in and your formulation will save automatically.
              </p>
            </div>
            <button
              onClick={handleResend}
              style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              Resend link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-email"
                style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                required
                className="w-full px-4 py-3 rounded-[var(--r-btn)] text-sm focus:outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${status === 'error' ? 'var(--danger)' : 'var(--line)'}`,
                  color: 'var(--text)',
                  minHeight: 48,
                }}
              />
              {status === 'error' && (
                <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errorMsg}</p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '18px' }}>
          After clicking the link, return here and your formulation saves automatically.
        </p>
      </div>
    </Sheet>
  )
}
