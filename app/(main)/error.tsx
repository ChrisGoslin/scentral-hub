'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 320 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            color: 'var(--text)',
            lineHeight: '32px',
            marginBottom: 12,
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            lineHeight: '20px',
            marginBottom: 24,
          }}
        >
          This page encountered an error. Try refreshing or return to explore.
        </p>

        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button
            onClick={() => reset()}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r-btn)',
              padding: '10px 32px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity var(--motion-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Try again
          </button>
          <Link href="/study" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-btn)',
                padding: '10px 32px',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'border-color var(--motion-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              Enter The Study
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
