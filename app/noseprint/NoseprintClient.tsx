'use client'

import { useState } from 'react'
import Link from 'next/link'

type Noseprint = {
  id: string
  name: string
  descriptor: string
  read_text: string
  signals: string[]
  matches: string[]
  stretch_note: string | null
  status: string
  created_at: string
}

type Match = { id: string; name: string; brand: string; family: string }

export default function NoseprintClient({
  noseprint,
  history,
  matches,
}: {
  noseprint: Noseprint
  history: Noseprint[]
  matches: Match[]
  userId: string
}) {
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scentral-hub.vercel.app'
  const shareText = `My Noseprint is "${noseprint.name}". Find yours at nota.`
  const shareUrl = `${siteUrl}/noseprint`
  const ogImageUrl = `${siteUrl}/api/og/noseprint?name=${encodeURIComponent(noseprint.name)}&descriptor=${encodeURIComponent(noseprint.descriptor)}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `My Noseprint: ${noseprint.name}`, text: shareText, url: shareUrl })
        return
      } catch { /* fallthrough to copy */ }
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const formattedDate = new Date(noseprint.created_at).toLocaleDateString('en-IE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      paddingBottom: '4rem',
    }}>
      {/* Header */}
      <div style={{
        padding: '2rem 1.5rem 0',
        maxWidth: 520,
        margin: '0 auto',
      }}>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-faint)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '0.25rem',
        }}>
          nota.
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-faint)',
        }}>
          Your Noseprint · since {formattedDate}
        </p>
      </div>

      {/* Noseprint identity card */}
      <div style={{
        background: '#0F172A',
        margin: '1.5rem',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: 488,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-20%',
          width: '60%',
          paddingBottom: '60%',
          borderRadius: '50%',
          background: 'rgba(184,145,58,0.06)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#64748B',
          marginBottom: '0.875rem',
        }}>
          Current Identity
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          color: '#F1F5F9',
          lineHeight: 1.15,
          marginBottom: '0.75rem',
        }}>
          {noseprint.name}
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: '#94A3B8',
          lineHeight: 1.65,
          marginBottom: '1.5rem',
        }}>
          {noseprint.descriptor}
        </p>

        {/* The opening line */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: '#64748B',
          lineHeight: 1.6,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1rem',
        }}>
          "{noseprint.read_text}"
        </p>

        {/* Share button */}
        <button
          onClick={handleShare}
          style={{
            marginTop: '1.5rem',
            padding: '0.625rem 1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#F1F5F9',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'background 150ms',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
        >
          {copied ? 'Link copied' : '↗ Share my Noseprint'}
        </button>

        {/* Hidden OG preload */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ogImageUrl} alt="" style={{ display: 'none' }} aria-hidden />
      </div>

      {/* Signals */}
      <div style={{ padding: '0 1.5rem', maxWidth: 520, margin: '0 auto' }}>
        {Array.isArray(noseprint.signals) && noseprint.signals.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: '0.875rem',
            }}>
              What we see in you
            </p>
            {noseprint.signals.map((s: string, i: number) => (
              <p
                key={i}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '0.5rem',
                  paddingLeft: '0.875rem',
                  borderLeft: '2px solid var(--color-border)',
                }}
              >
                {s}
              </p>
            ))}
          </div>
        )}

        {/* Fragrance matches */}
        {matches.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: '0.875rem',
            }}>
              Start here
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {matches.map(f => (
                <Link
                  key={f.id}
                  href={`/collection/${f.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    textDecoration: 'none',
                    color: 'var(--color-text)',
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{f.name}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 8, fontSize: '0.8125rem' }}>{f.brand}</span>
                  </span>
                  <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stretch note */}
        {noseprint.stretch_note && (
          <div style={{
            padding: '1rem 1.125rem',
            borderRadius: '10px',
            background: 'rgba(184,145,58,0.06)',
            border: '1px solid rgba(184,145,58,0.18)',
            marginBottom: '2rem',
          }}>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              lineHeight: 1.65,
            }}>
              {noseprint.stretch_note}
            </p>
          </div>
        )}

        {/* Identity timeline */}
        {history.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(h => !h)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              Previously
              <span style={{
                transform: showHistory ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms',
                display: 'inline-block',
              }}>
                ↓
              </span>
            </button>

            {showHistory && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map(h => (
                  <div
                    key={h.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      opacity: 0.65,
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: '1.125rem',
                      color: 'var(--color-text)',
                      marginBottom: '0.25rem',
                    }}>
                      {h.name}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      {h.descriptor}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-faint)',
                      marginTop: '0.5rem',
                    }}>
                      {new Date(h.created_at).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
