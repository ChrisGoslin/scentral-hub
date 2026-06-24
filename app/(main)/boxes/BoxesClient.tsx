'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/posthog'
import EmptyState from '@/components/ui/EmptyState'
import type { DiscoveryBox } from './page'

type Props = {
  boxes: DiscoveryBox[]
  error: string | null
}

export default function BoxesClient({ boxes, error }: Props) {
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let results = boxes
    if (activeTheme) {
      results = results.filter(b => b.theme?.toLowerCase() === activeTheme.toLowerCase())
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      results = results.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.fragrances?.some(f => f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q))
      )
    }
    return results
  }, [boxes, search, activeTheme])

  // Extract unique themes
  const themes = useMemo(() => {
    const themeSet = new Set<string>()
    for (const box of boxes) {
      if (box.theme) themeSet.add(box.theme)
    }
    return Array.from(themeSet).sort()
  }, [boxes])

  const handleBoxClick = (boxId: string, boxName: string) => {
    track('box_viewed', {
      box_id: boxId,
      box_name: boxName,
    })
  }

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState headline="Couldn't load boxes" caption={error} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>

      {/* Hero */}
      <div style={{
        padding: '32px 20px 24px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--bg) 100%)',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
          Discovery Boxes
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>
          Curated sample<br />collections
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
          Explore thoughtfully assembled sets. Perfect for discovery or gifting.
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ padding: '16px 16px 0' }}>
        <input
          type="search"
          placeholder="Search by name or fragrance…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-btn)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {/* Theme filter pills */}
      {themes.length > 0 && !search && (
        <div style={{ padding: '16px 0 0' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 10 }}>
            Themes
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none', paddingBottom: 4 }}>
            <button
              onClick={() => setActiveTheme(null)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${activeTheme === null ? 'var(--accent)' : 'var(--line)'}`,
                background: activeTheme === null ? 'var(--accent)' : 'var(--color-surface)',
                color: activeTheme === null ? '#fff' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--motion-responsive)',
              }}
            >
              All
            </button>
            {themes.map(theme => (
              <button
                key={theme}
                onClick={() => setActiveTheme(activeTheme === theme ? null : theme)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1px solid ${activeTheme === theme ? 'var(--accent)' : 'var(--line)'}`,
                  background: activeTheme === theme ? 'var(--accent)' : 'var(--color-surface)',
                  color: activeTheme === theme ? '#fff' : 'var(--text)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--motion-responsive)',
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      <div style={{ padding: '16px 16px 8px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} box{filtered.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Box grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No boxes found"
            caption="Try a different search or theme."
            action={
              <button
                onClick={() => { setSearch(''); setActiveTheme(null) }}
                style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {filtered.map(box => (
            <Link
              key={box.id}
              href={`/boxes/${box.slug}`}
              onClick={() => handleBoxClick(box.id, box.name)}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                transition: 'all var(--motion-responsive)',
                cursor: 'pointer',
                aspectRatio: '1/1.2',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}>
                {/* Image */}
                <div style={{
                  flex: 1,
                  background: 'var(--color-surface)',
                  backgroundImage: box.image_url ? `url(${box.image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!box.image_url && (
                    <span style={{ fontSize: 32 }}>📦</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '8px', backgroundColor: 'var(--color-surface)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 2 }}>
                    {box.name}
                  </p>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    {box.fragrances?.length || 0} scents
                  </p>
                  {box.price_cents && (
                    <p style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>
                      ${(box.price_cents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
