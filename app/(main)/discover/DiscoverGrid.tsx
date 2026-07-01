'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { Scale } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import Button from '@/components/ui/Button'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import AdSlot from '@/components/ads/AdSlot'
import { track } from '@/lib/posthog'
import type { DiscoverFragrance } from '@/lib/useFragranceSearch'
import { getPersonaById, type Persona } from '@/lib/personas'
import { getFitNarrative } from '@/lib/fitNarrative'
import { useCompare } from '@/hooks/useCompare'

type Props = {
  filtered: DiscoverFragrance[]
  countLabel: string
  semanticResults: DiscoverFragrance[]
  debouncedSearch: string
  wishlist: string[]
  isDbSearching: boolean
  isSemanticSearching: boolean
  semanticError: string | null
  loadingMore: boolean
  loadMoreError: string | null
  hasMore: boolean
  totalCount: number
  sort: string

  onWishlistToggle: (id: string) => void
  onLoadMore: () => void
  onClearFilters: () => void
  onRetrySearch: () => void
}

export function DiscoverGrid({
  filtered,
  countLabel,
  semanticResults,
  debouncedSearch,
  wishlist,
  isDbSearching,
  isSemanticSearching,
  semanticError,
  loadingMore,
  loadMoreError,
  hasMore,
  totalCount,
  sort,
  onWishlistToggle,
  onLoadMore,
  onClearFilters,
  onRetrySearch,
}: Props) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const { compareIds, toggleCompare } = useCompare()

  useEffect(() => {
    const personaId = localStorage.getItem('scentral_persona')
    setPersona(personaId ? getPersonaById(personaId) ?? null : null)
  }, [])

  return (
    <>
      {/* Result count */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {countLabel}
        </p>
        {(isDbSearching || isSemanticSearching) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="resonance-loader" />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.05em' }}>
              {isDbSearching ? 'SEARCHING...' : 'RESONATING...'}
            </span>
          </div>
        )}
      </div>

      {/* Semantic search error */}
      {semanticError && (
        <div style={{ padding: '8px 16px' }}>
          <ErrorInline message={semanticError} onRetry={onRetrySearch} color="warning" />
        </div>
      )}

      <style>{`
        @keyframes pulse-gold {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
        .resonance-loader {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse-gold 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No fragrances match right now"
            caption="Try adjusting your filters to find your next scent."
            action={
              <Button onClick={onClearFilters} variant="secondary">
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-2">
          {filtered.map((f, idx) => {
            const fit = persona ? getFitNarrative(f.family, f.name, persona) : null
            return (
            <Fragment key={f.id}>
              <Link
                href={`/collection/${f.id}?from=discover`}
                style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
              >
                <FragranceCardMedia imageUrl={f.image_url} brand={f.brand} name={f.name} family={f.family} rating={f.rating} ownerCount={f.owner_count} wall />
                {fit?.level === 'signature' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
                      borderRadius: 999,
                      padding: '2px 8px',
                      zIndex: 2,
                    }}
                  >
                    ◆ Strong fit
                  </span>
                )}
                {sort === '◆ Rare' && f.inspired_by && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      fontSize: 9,
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      zIndex: 2,
                      fontWeight: 600,
                    }}
                  >
                    Inspired By available
                  </span>
                )}
                <button
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleCompare(f.id)
                  }}
                  aria-label={compareIds.includes(f.id) ? 'Remove from compare' : 'Add to compare'}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 28,
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: compareIds.includes(f.id) ? 'var(--accent)' : 'color-mix(in srgb, var(--bg) 70%, transparent)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: 0,
                    color: compareIds.includes(f.id) ? 'rgba(0,0,0,0.85)' : 'var(--text-muted)',
                    zIndex: 2,
                  }}
                >
                  <Scale size={11} />
                </button>
                <button
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onWishlistToggle(f.id)
                  }}
                  aria-label={wishlist.includes(f.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: 0,
                    color: wishlist.includes(f.id) ? 'var(--accent)' : 'var(--text-muted)',
                    zIndex: 2,
                  }}
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill={wishlist.includes(f.id) ? 'var(--accent)' : 'none'}
                    stroke={wishlist.includes(f.id) ? 'var(--accent)' : 'currentColor'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                {debouncedSearch && semanticResults.some(sr => sr.id === f.id) && (
                  <div
                    aria-label="Resonance match"
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      width: 6,
                      height: 6,
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      zIndex: 2,
                    }}
                  />
                )}
              </Link>
              {(idx + 1) % 12 === 0 && (
                <div key={`ad-${idx}`} style={{ gridColumn: '1 / -1', padding: '16px 0' }}>
                  <AdSlot slot="discover-grid" />
                </div>
              )}
            </Fragment>
            )
          })}
        </div>
      )}

      {/* Load more error */}
      {loadMoreError && (
        <div style={{ padding: '0 16px 16px' }}>
          <ErrorInline message={loadMoreError} onRetry={onLoadMore} color="warning" />
        </div>
      )}

      {/* Load more */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-btn)',
              padding: '10px 32px',
              fontSize: 13,
              color: loadingMore ? 'var(--text-muted)' : 'var(--text)',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'border-color var(--motion-fast)',
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '16px 0' }}>
            All {totalCount} fragrances loaded
          </p>
        )}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </>
  )
}
