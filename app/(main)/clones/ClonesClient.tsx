'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import AdSlot from '@/components/ads/AdSlot'
import EmptyState from '@/components/ui/EmptyState'
import AffiliateButton from '@/components/ads/AffiliateButton'
import type { CloneFragrance } from './page'

type Props = {
  clones: CloneFragrance[]
  topOriginals: { name: string; count: number }[]
  error: string | null
}

export default function ClonesClient({ clones, topOriginals, error }: Props) {
  const [search, setSearch] = useState('')
  const [activeOriginal, setActiveOriginal] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let results = clones
    if (activeOriginal) {
      results = results.filter(c =>
        c.inspired_by.toLowerCase().includes(activeOriginal.toLowerCase())
      )
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      results = results.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.inspired_by.toLowerCase().includes(q) ||
          c.family.toLowerCase().includes(q)
      )
    }
    return results
  }, [clones, search, activeOriginal])

  // Group filtered results by inspired_by
  const grouped = useMemo(() => {
    const map = new Map<string, CloneFragrance[]>()
    for (const c of filtered) {
      const key = c.inspired_by
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState headline="Couldn't load clones" caption={error} />
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
          Clone Finder
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>
          Smells like<br />your favourite
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
          {clones.length} Middle Eastern alternatives mapped to their designer &amp; niche inspirations — at a fraction of the price.
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <input
          type="search"
          placeholder="Search by name, brand or inspiration…"
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

      {/* Top originals pill carousel */}
      {!search && (
        <div style={{ padding: '16px 0 0' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 10 }}>
            Most Cloned
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none', paddingBottom: 4 }}>
            <button
              onClick={() => setActiveOriginal(null)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${activeOriginal === null ? 'var(--accent)' : 'var(--line)'}`,
                background: activeOriginal === null ? 'var(--accent)' : 'var(--color-surface)',
                color: activeOriginal === null ? '#fff' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--motion-responsive)',
              }}
            >
              All
            </button>
            {topOriginals.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setActiveOriginal(activeOriginal === name ? null : name)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1px solid ${activeOriginal === name ? 'var(--accent)' : 'var(--line)'}`,
                  background: activeOriginal === name ? 'var(--accent)' : 'var(--color-surface)',
                  color: activeOriginal === name ? '#fff' : 'var(--text)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--motion-responsive)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {name}
                <span style={{
                  fontSize: 9,
                  background: activeOriginal === name ? 'rgba(255,255,255,0.25)' : 'var(--color-surface-offset)',
                  borderRadius: 999,
                  padding: '1px 5px',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      <div style={{ padding: '16px 16px 8px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} alternative{filtered.length !== 1 ? 's' : ''}
          {activeOriginal ? ` · inspired by ${activeOriginal}` : ''}
        </p>
      </div>

      {/* Grouped sections */}
      {grouped.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No matches found"
            caption="Try a different search term or clear the filter."
            action={
              <button
                onClick={() => { setSearch(''); setActiveOriginal(null) }}
                style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ paddingBottom: 16 }}>
          {(() => {
            let itemCount = 0
            return grouped.map(([original, items]) => {
              const startCount = itemCount
              itemCount += items.length
              const showAdAfter = Math.floor(startCount / 12) !== Math.floor((itemCount - 1) / 12)

              return (
                <div key={original}>
                  <div style={{ marginBottom: 32 }}>
                    {/* Section header */}
                    <div style={{
                      padding: '12px 16px 10px',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                    }}>
                      <p style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        flexShrink: 0,
                      }}>
                        Inspired by
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        color: 'var(--text)',
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {original}
                      </p>
                      <span style={{
                        flexShrink: 0,
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--line)',
                        borderRadius: 999,
                        padding: '1px 7px',
                      }}>
                        {items.length}
                      </span>
                    </div>

                    {/* Card row — horizontal scroll */}
                    <div style={{
                      display: 'flex',
                      gap: 10,
                      overflowX: 'auto',
                      paddingLeft: 16,
                      paddingRight: 16,
                      scrollbarWidth: 'none',
                    }}>
                      {items.map(f => (
                        <div key={f.id} style={{ flexShrink: 0, width: 120 }}>
                          <Link
                            href={`/collection/${f.id}?from=clones`}
                            style={{ textDecoration: 'none' }}
                          >
                            <div style={{
                              border: '1px solid var(--line)',
                              borderRadius: 'var(--r-card)',
                              overflow: 'hidden',
                            }}>
                              <FragranceCardMedia
                                imageUrl={f.image_url}
                                brand={f.brand}
                                name={f.name}
                                family={f.family}
                                compact
                              />
                            </div>
                            <div style={{ padding: '6px 2px 0' }}>
                              <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.brand}</p>
                              <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.3 }}>{f.name}</p>
                            </div>
                          </Link>
                          {f.buy_url && (
                            <div style={{ padding: '4px 2px 0' }}>
                              <AffiliateButton
                                buyUrl={f.buy_url}
                                buyLabel={f.buy_label ?? undefined}
                                fragranceName={f.name}
                                fragranceId={f.id}
                                compact
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {showAdAfter && (
                    <div style={{ padding: '24px 16px 32px', textAlign: 'center' }}>
                      <AdSlot slot="clones-grid" />
                    </div>
                  )}
                </div>
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
