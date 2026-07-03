'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface Trace {
  id: string
  trace_type: string
  body: string
  image_url: string | null
  created_at: string
  fragrance_id: string | null
  fragrance: { id: string; brand: string; name: string } | null
  author: {
    display_name: string
    username: string | null
    noseprint_descriptor: string | null
  }
  reaction_counts: { on_the_nose: number; feel_this: number; too_real: number }
}

const REACTIONS: { key: 'on_the_nose' | 'feel_this' | 'too_real'; label: string }[] = [
  { key: 'on_the_nose', label: 'On the nose' },
  { key: 'feel_this', label: 'Feel this' },
  { key: 'too_real', label: 'Too real' },
]

const TYPE_LABEL: Record<string, string> = {
  fragrance: 'Fragrance',
  moment: 'Moment',
  emotional: 'Emotional',
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

interface TraceCardProps {
  trace: Trace
  showFragranceLink?: boolean
}

export default function TraceCard({ trace, showFragranceLink = true }: TraceCardProps) {
  const [counts, setCounts] = useState(trace.reaction_counts)
  const [activeReaction, setActiveReaction] = useState<string | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)

  const handleReact = async (reaction: 'on_the_nose' | 'feel_this' | 'too_real') => {
    if (isReacting) return
    setIsReacting(true)
    setNeedsAuth(false)

    try {
      const res = await fetch(`/api/traces/${trace.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      })

      if (res.status === 401) {
        setNeedsAuth(true)
        return
      }

      const json = await res.json()
      if (res.ok) {
        setCounts(json.reaction_counts)
        setActiveReaction(reaction)
      }
    } catch {
      // silent — reactions are a light-touch feature, not worth a loud error state
    } finally {
      setIsReacting(false)
    }
  }

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Identity strip */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
          {trace.author.username ? `@${trace.author.username}` : trace.author.display_name}
        </span>
        {trace.author.noseprint_descriptor && (
          <span style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
            {trace.author.noseprint_descriptor}
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {timeAgo(trace.created_at)}
        </span>
      </div>

      {/* Type + fragrance link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '3px 9px',
          }}
        >
          {TYPE_LABEL[trace.trace_type] ?? trace.trace_type}
        </span>
        {showFragranceLink && trace.fragrance && (
          <Link
            href={`/collection/${trace.fragrance.id}`}
            style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {trace.fragrance.brand} {trace.fragrance.name}
          </Link>
        )}
      </div>

      {/* Body */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 17,
          lineHeight: '26px',
          color: 'var(--text)',
        }}
      >
        {trace.body}
      </p>

      {trace.image_url && (
        <div style={{ borderRadius: 'var(--r-card)', overflow: 'hidden', maxWidth: 280 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trace.image_url} alt="" style={{ width: '100%', display: 'block' }} />
        </div>
      )}

      {/* Reactions — small, muted, not a headline metric */}
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        {REACTIONS.map(r => {
          const isActive = activeReaction === r.key
          const count = counts[r.key]
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleReact(r.key)}
              disabled={isReacting}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: isReacting ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {r.label}
              {count > 0 && (
                <span style={{ fontSize: 10, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>
      {needsAuth && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sign in to react.</p>
      )}
    </article>
  )
}
