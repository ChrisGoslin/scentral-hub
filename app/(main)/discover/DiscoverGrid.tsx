'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import Button from '@/components/ui/Button'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import { track } from '@/lib/posthog'
import type { DiscoverFragrance } from '@/lib/useFragranceSearch'

type Props = {
  filtered: DiscoverFragrance[]
  semanticResults: DiscoverFragrance[]
  debouncedSearch: string
  wishlist: string[]
  isMobile: boolean
  isSemanticSearching: boolean
  semanticError: string | null
  loadingMore: boolean
  loadMoreError: string | null
  hasMore: boolean
  totalCount: number

  onWishlistToggle: (id: string) => void
  onLoadMore: () => void
  onClearFilters: () => void
  onRetrySearch: () => void
}

export function DiscoverGrid({
  filtered,
  semanticResults,
  debouncedSearch,
  wishlist,
  isMobile,
  isSemanticSearching,
  semanticError,
  loadingMore,
  loadMoreError,
  hasMore,
  totalCount,
  onWishlistToggle,
  onLoadMore,
  onClearFilters,
  onRetrySearch,
}: Props) {
  return (
    <>
      {/* Result count */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} fragrance{filtered.length !== 1 ? 's' : ''}
        </p>
        {isSemanticSearching && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="resonance-loader" />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.05em' }}>
              RESONATING...
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
          }}
        >
          {filtered.map(f => (
            <Link
              key={f.id}
              href={`/collection/${f.id}?from=discover`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'border-color var(--motion-fast), transform 180ms ease, box-shadow 180ms ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--line)'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Image + wishlist toggle */}
                <div style={{ position: 'relative' }}>
                  <FragranceCardMedia imageUrl={f.image_url} brand={f.brand} name={f.name} family={f.family} />
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      onWishlistToggle(f.id)
                    }}
                    aria-label={wishlist.includes(f.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 28,
                      height: 28,
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
                      width={18}
                      height={18}
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
                </div>

                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Owner count */}
                  {f.owner_count > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Users size={11} />
                      <span>
                        {f.owner_count} {f.owner_count === 1 ? 'person owns' : 'people own'} this
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  {f.rating !== null && (
                    <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                      {'★'.repeat(Math.round(f.rating / 2)) + '☆'.repeat(5 - Math.round(f.rating / 2))}
                    </div>
                  )}

                  {/* Plain description */}
                  {f.plain_description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '16px' }}>
                      {f.plain_description}
                    </p>
                  )}

                  {/* Inspired-by badge */}
                  {f.inspired_by && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                        borderRadius: 999,
                        padding: '3px 8px',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Smells like {f.inspired_by}
                    </div>
                  )}

                  {/* Resonance Badge */}
                  {debouncedSearch && semanticResults.some(sr => sr.id === f.id) && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <div
                        style={{ width: 4, height: 4, background: 'var(--accent)', borderRadius: '50%' }}
                      />
                      Resonance Match
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
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
