'use client'

import { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { Scale } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import Button from '@/components/ui/Button'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import AdSlot from '@/components/ads/AdSlot'
import PostItNote from '@/components/ui/PostItNote'
import { getPersonaById } from '@/lib/personas'
import type { Persona } from '@/lib/personas'
import type { DiscoverFragrance } from '@/lib/useFragranceSearch'
import { getFitNarrative } from '@/lib/fitNarrative'
import { useCompare } from '@/hooks/useCompare'
import { LAYERING_DOS_AND_DONTS, FRAGRANCE_FUN_FACTS } from '@/lib/fragrance-education'

function getCardGridClasses(idx: number) {
  // Stagger margins, rotations, and spans to create a true scattered moodboard
  const patterns = [
    'md:rotate-2 md:-translate-y-3 md:-translate-x-2',
    'md:-rotate-3 md:translate-y-4 md:translate-x-1',
    'md:rotate-3 md:-translate-y-2 md:translate-x-3',
    'md:-rotate-2 md:translate-y-6 md:-translate-x-1',
    'md:rotate-1 md:-translate-y-4 md:translate-x-2',
    'md:-rotate-3 md:translate-y-2 md:-translate-x-2',
  ]
  const pattern = patterns[idx % patterns.length]
  return `col-span-1 md:col-span-2 ${pattern}`
}

function getPostItGridClasses(idx: number) {
  // Stagger margins, rotations, and spans for PostItNote on medium/large screens
  const patterns = [
    'md:-rotate-3 md:-translate-y-4 md:-translate-x-2',
    'md:rotate-4 md:translate-y-4 md:-translate-x-1',
    'md:-rotate-2 md:-translate-y-2 md:translate-x-3',
    'md:rotate-3 md:translate-y-6 md:-translate-x-3',
  ]
  const pattern = patterns[idx % patterns.length]
  return `col-span-2 md:col-span-2 ${pattern}`
}

function getPostItContent(index: number, persona: Persona | null) {
  if (persona) {
    const tagline = persona.narrative?.tagline
    const tips = persona.recommendations?.layering_tips || []
    
    // We alternate between tagline and layering tips
    const showTagline = (Math.floor(index / 6) % 2 === 0)
    if (showTagline && tagline) {
      return {
        title: `Your Persona: ${persona.name}`,
        body: tagline,
      }
    } else if (tips.length > 0) {
      const tipIndex = Math.floor(index / 6) % tips.length
      return {
        title: "Personalized Tip",
        body: tips[tipIndex],
      }
    }
  }
  
  // Fallback to static education tip or fun fact if no persona is active
  const useFact = (Math.floor(index / 6) % 2 === 0)
  if (useFact) {
    const facts = FRAGRANCE_FUN_FACTS.default || []
    const factIndex = Math.floor(index / 6) % facts.length
    return {
      title: "Did You Know?",
      body: facts[factIndex],
    }
  } else {
    const rules = LAYERING_DOS_AND_DONTS
    const ruleIndex = Math.floor(index / 6) % rules.length
    const rule = rules[ruleIndex]
    return {
      title: `${rule.type === 'do' ? '✓ Layering Do' : '✗ Layering Don\'t'}`,
      body: `${rule.title}: ${rule.body}`,
    }
  }
}

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
  const [clientPersona, setClientPersona] = useState<Persona | null>(null)

  useEffect(() => {
    const personaId = localStorage.getItem('scentral_persona')
    if (personaId) {
      const p = getPersonaById(personaId)
      if (p) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClientPersona(p)
      }
    }
  }, [])

  const { compareIds, toggleCompare } = useCompare()

  return (
    <>
      {/* Result count */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: 'var(--font-hand)' }}>
            Results page
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
            {countLabel}
          </p>
        </div>
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
        <div style={{ padding: '56px 16px', textAlign: 'center' }}>
          <EmptyState
            headline="No fragrances match this sketch"
            caption="Try clearing one filter or search term to widen the field, then let the shelf redraw itself."
            action={
              <Button onClick={onClearFilters} variant="secondary">
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-y-12 lg:gap-y-16 px-2 md:px-6">
          {filtered.map((f, idx) => {
            const fit = clientPersona ? getFitNarrative(f.family, f.name, clientPersona) : null
            return (
            <Fragment key={f.id}>
              <div className={`relative motion-safe:transition-all motion-safe:duration-300 ease-out hover:scale-105 hover:rotate-0 hover:z-30 hover:shadow-2xl ${getCardGridClasses(idx)}`}>
                {/* Translucent tape overlay */}
                <div
                  className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/10 backdrop-blur-[1px] border-x border-dashed border-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.2)] pointer-events-none rotate-[-1.5deg] z-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02))',
                  }}
                />

                <Link
                  href={`/cabinet/${f.id}?from=study`}
                  style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
                >
                  <FragranceCardMedia imageUrl={f.image_url} brand={f.brand} name={f.name} family={f.family} rating={f.rating} ownerCount={f.owner_count} priority={idx < 4} wall />
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
                      ◆ Matches your pattern
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
                    zIndex: 25,
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
                    zIndex: 25,
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
              </div>
              {(idx + 1) % 6 === 0 && (
                <PostItNote
                  key={`postit-${idx}`}
                  variant={idx % 18 === 5 ? 'clay' : idx % 18 === 11 ? 'brass' : 'ink'}
                  rotation={idx % 12 === 5 ? 'slight-left' : 'slight-right'}
                  className={getPostItGridClasses(idx)}
                >
                  <span className="block text-xs uppercase tracking-widest opacity-65 font-bold mb-2">
                    {getPostItContent(idx, clientPersona).title}
                  </span>
                  <span className="block italic text-base leading-relaxed font-medium">
                    &ldquo;{getPostItContent(idx, clientPersona).body}&rdquo;
                  </span>
                </PostItNote>
              )}
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
      <div style={{ padding: '28px 16px 18px', textAlign: 'center' }}>
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent) 8%, transparent))',
              border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
              borderRadius: 999,
              padding: '12px 28px',
              fontSize: 13,
              color: loadingMore ? 'var(--text-muted)' : 'var(--text)',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'border-color var(--motion-fast), transform var(--motion-fast)',
              boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
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
