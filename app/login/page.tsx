'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/noseprint'
  const fromWelcome = next === '/read'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        shouldCreateUser: true,
      },
    })
    setLoading(false)
    if (err) setError('Something went wrong. Try again in a moment.')
    else setSent(true)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'lowercase' as const, marginBottom: '3rem', textAlign: 'center' as const }}>nota.</div>
        {sent ? (
          <div style={{ textAlign: 'center' as const }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--color-text)', lineHeight: 1.3, marginBottom: '1rem' }}>Check your inbox.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>We sent a link to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.<br />It expires in 10 minutes.</p>
            <button onClick={() => { setSent(false); setEmail('') }} style={{ marginTop: '2rem', background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--color-text-faint)', cursor: 'pointer', textDecoration: 'underline' }}>Use a different email</button>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.625rem, 4.5vw, 2.25rem)', color: 'var(--color-text)', lineHeight: 1.2, marginBottom: '0.625rem', textAlign: 'center' as const }}>
              {fromWelcome ? 'Your identity is waiting.' : 'Come back to your shelf.'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' as const, marginBottom: '2.5rem', lineHeight: 1.6 }}>
              {fromWelcome ? "Enter your email and we'll send a link to reveal it." : "Enter your email — we'll send a sign-in link, no password needed."}
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus style={{ padding: '0.875rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem', outline: 'none', width: '100%' }} />
              {error && <p style={{ fontSize: '0.8125rem', color: 'var(--color-error)', textAlign: 'center' as const }}>{error}</p>}
              <button type="submit" disabled={loading || !email.trim()} style={{ padding: '0.875rem', background: loading ? 'var(--color-surface-offset)' : 'var(--color-text)', color: loading ? 'var(--color-text-muted)' : 'var(--color-bg)', border: 'none', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send link'}
              </button>
            </form>
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--color-text-faint)', textAlign: 'center' as const, lineHeight: 1.6 }}>No password. No noise. Just your scent identity.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
