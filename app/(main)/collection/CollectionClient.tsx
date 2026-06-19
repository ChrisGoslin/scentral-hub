'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Chip from '@/components/ui/Chip'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import Sheet from '@/components/ui/Sheet'
import ErrorInline from '@/components/ui/ErrorInline'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { useFragranceSearch } from '@/app/hooks/useFragranceSearch'
import { track } from '@/lib/posthog'
import WardrobeShelf from './WardrobeShelf'

export type CollectionFragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  projection: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  lean: string
  rating: number | null
  image_url: string | null
  optimal_season: string | null
  use_case?: string | null
  maturation?: string | null
  maceration_started_at?: string | null
  maceration_ready_at?: string | null
  collection_added_at?: string | null
  is_user_created?: boolean | null
  affinity_score?: number | null
  status?: string | null
  origin_code?: 'B' | 'D' | 'T' | 'O' | 'W' | null
}

type SeasonFilter = 'All' | 'Summer' | 'All-Year' | 'Winter' | 'Spring'

const SEASON_DB_MAP: Record<SeasonFilter, string | null> = {
  All: null,
  Summer: 'High Heat',
  'All-Year': 'All-Year',
  Winter: 'Winter/Fall',
  Spring: 'Spring/Summer',
}

const PHASE_MAP: Record<number, string> = {
  1: 'Anchor',
  2: 'Modulator',
  3: 'Top',
}

const PHASE_DOT: Record<string, string> = {
  Anchor: 'var(--accent)',
  Modulator: 'var(--positive)',
  Top: 'var(--text-muted)',
}

function FragranceImage({ imageUrl, brand, name }: { imageUrl: string | null; brand: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (!imageUrl || failed) {
    return (
      <div
        style={{
          width: '100%', aspectRatio: '3/4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 10,
          padding: 8,
          background: 'var(--surface)',
          position: 'relative',
          border: '1px solid var(--line)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6v3H9zM6 6h12v15H6zM9 11h6M9 15h6" />
        </svg>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 10, position: 'relative', background: 'var(--surface-2)' }}>
      <Image
        src={imageUrl}
        alt={`${brand} ${name}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        style={{ objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function maturationStatus(f: CollectionFragrance): 'maturing' | 'macerated' | 'recommended' | null {
  const now = new Date()
  const readyAt = f.maceration_ready_at ? new Date(f.maceration_ready_at) : null
  const startedAt = f.maceration_started_at ? new Date(f.maceration_started_at) : null
  if (readyAt && readyAt > now) return 'maturing'
  if (readyAt && readyAt <= now) return 'macerated'
  if (startedAt) return 'macerated'
  if (f.maturation) return 'recommended'
  return null
}

function FragranceCard({ f }: { f: CollectionFragrance }) {
  const phaseLabel = PHASE_MAP[f.phase] ?? f.phase_label
  const dot = PHASE_DOT[phaseLabel]
  const shortName = f.name.length > 24 ? f.name.slice(0, 22) + '…' : f.name
  const mStatus = maturationStatus(f)

  let affinityBadge = null
  if (f.affinity_score) {
    if (f.affinity_score >= 16) affinityBadge = '★ Signature'
    else if (f.affinity_score >= 8) affinityBadge = '◆ Occasion'
    else if (f.affinity_score >= 1) affinityBadge = '● Base'
  }

  return (
    <Card className="flex flex-col gap-2 transition-colors h-full group">
      <Link href={`/collection/${f.id}`} className="flex flex-col gap-2 flex-1">
        <FragranceImage imageUrl={f.image_url} brand={f.brand} name={f.name} />
        <div className="flex-1">
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '14px' }}>
            {f.brand}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '18px', marginTop: 1 }} title={f.name}>
            {shortName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: '14px' }}>{phaseLabel}</p>
            </div>
            {affinityBadge && (
              <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {affinityBadge}
              </span>
            )}
          </div>
          {mStatus === 'maturing' && (
            <p style={{ fontSize: 10, color: 'var(--accent)', marginTop: 3, lineHeight: '13px' }}>⏳ Maturing</p>
          )}
          {mStatus === 'macerated' && (
            <p style={{ fontSize: 10, color: 'var(--positive)', marginTop: 3, lineHeight: '13px' }}>Macerated ✓</p>
          )}
        </div>
        {f.anosmia_risk === 'High' && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sensory Caution</p>
          </div>
        )}
      </Link>

      {/* Secondary action — seeds the DNA Match flow with this essence preselected */}
      <Link
        href={`/dna-match?a=${f.id}`}
        className="flex items-center justify-center mt-1 min-h-[36px] rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{ border: '1px solid var(--line)', background: 'var(--surface-2)' }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--burgundy)' }}>
          Match this →
        </span>
      </Link>
    </Card>
  )
}

export default function CollectionClient({ fragrances, totalCount }: { fragrances: CollectionFragrance[]; totalCount?: number }) {
  const router = useRouter()
  const supabase = createClient()
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('All')
  const [search, setSearch] = useState('')
  const [ownedOnly, setOwnedOnly] = useState(true)
  const [wardrobeMode, setWardrobeMode] = useState(false)

  // Add bottle sheet state
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const { results: searchResults, loading: isLoadingPicker, error: pickerErrorHook } = useFragranceSearch(pickerSearch)
  
  const [selectedToConfirm, setSelectedToConfirm] = useState<any | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [localPickerError, setLocalPickerError] = useState<string | null>(null)

  const pickerError = pickerErrorHook || localPickerError

  async function handleAddBottle() {
    if (!selectedToConfirm) return
    setIsAdding(true)
    setLocalPickerError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLocalPickerError('You must be signed in to add bottles.')
      setIsAdding(false)
      return
    }

    const { error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        fragrance_id: selectedToConfirm.id,
        status: 'owned'
      })

    if (error) {
      setLocalPickerError(error.message)
      setIsAdding(false)
    } else {
      track('bottle_added', { fragrance_id: selectedToConfirm.id, fragrance_name: `${selectedToConfirm.brand} ${selectedToConfirm.name}` })
      setAddSuccess(true)
      setIsAdding(false)
      setTimeout(() => {
        setIsAddSheetOpen(false)
        setAddSuccess(false)
        setSelectedToConfirm(null)
        setPickerSearch('')
        router.refresh()
      }, 2000)
    }
  }

  const seasonFilters: SeasonFilter[] = ['All', 'Summer', 'All-Year', 'Winter', 'Spring']

  // Owned = has been added to the user's collection
  const ownedFragrances = fragrances.filter(f => f.collection_added_at !== null)
  const displayFragrances = ownedOnly ? ownedFragrances : fragrances

  const filtered = displayFragrances.filter(f => {
    if (seasonFilter !== 'All' && f.optimal_season !== SEASON_DB_MAP[seasonFilter]) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (!f.brand.toLowerCase().includes(q) && !f.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
              My Bottles
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {filtered.length} of {totalCount ?? fragrances.length} scents
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Add bottle button */}
            <button
              onClick={() => setIsAddSheetOpen(true)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent)', color: 'white',
                border: 'none', cursor: 'pointer',
                fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingBottom: 2
              }}
            >
              +
            </button>
            {/* Wardrobe toggle */}
            <button
              onClick={() => setWardrobeMode(m => !m)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
              style={{
                background: wardrobeMode ? 'var(--burgundy)' : 'var(--surface)',
                border: '1px solid var(--line)',
                color: wardrobeMode ? 'white' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {wardrobeMode ? '⬛ Wardrobe' : '⬜ Wardrobe'}
            </button>
            {/* Owned toggle — hidden in wardrobe mode */}
            {!wardrobeMode && (
              <button
                onClick={() => setOwnedOnly(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: ownedOnly ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid var(--line)',
                  color: ownedOnly ? 'white' : 'var(--text-muted)',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}
              >
                {ownedOnly ? '★ My Bottles' : '☆ All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wardrobe view */}
      {wardrobeMode ? (
        <WardrobeShelf fragrances={fragrances} />
      ) : (
        <>
          <div className="px-4 pt-3 pb-2">
            <input
              type="search"
              placeholder="Search brand or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-chip)',
                color: 'var(--text)',
                fontSize: 13,
                padding: '8px 12px',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
            />
          </div>

          <div className="flex gap-2 px-4 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--line)' }}>
            {seasonFilters.map(s => (
              <Chip
                key={s}
                selected={seasonFilter === s}
                onClick={() => setSeasonFilter(s)}
                style={{ flexShrink: 0 }}
              >
                {s}
              </Chip>
            ))}
          </div>

          <div className="px-4 pt-3">
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="px-4 py-3">
            {ownedOnly && ownedFragrances.length === 0 ? (
              <div className="max-w-[360px] mx-auto pt-12 flex flex-col items-center text-center animate-up">
                <div className="w-8 h-[2px] mb-6" style={{ background: 'var(--accent)' }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '32px', color: 'var(--text)', fontStyle: 'italic' }}>
                  Your wardrobe begins here.
                </p>
                <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 12, fontWeight: 300 }}>
                  Add your first bottle to unlock personalised layering combinations, inspired-by alternatives, and curation insights.
                </p>
                <div className="mt-7 w-full">
                  <Link href="/discover" className="block w-full">
                    <Button fullWidth>Explore the Catalogue</Button>
                  </Link>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
                  Already have a signature scent?{' '}
                  <button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="hover:text-[var(--accent)] transition-all font-bold border-b border-transparent hover:border-[var(--accent)] pb-0.5"
                    style={{ background: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Add it manually →
                  </button>
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                headline="No matches"
                caption="Try adjusting your filters or search term."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(f => (
                  <FragranceCard key={f.id} f={f} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Bottle Sheet */}
      <Sheet open={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)}>
        <div className="space-y-6">
          <header>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>
              Add a bottle
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Search the catalogue to add to your collection.
            </p>
          </header>

          {addSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center animate-up">
              <span className="text-4xl mb-4">✓</span>
              <p className="font-bold text-[var(--accent)] uppercase tracking-widest text-xs">Added to your collection</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <input
                  type="search"
                  placeholder="Search by name or brand..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-chip)',
                    color: 'var(--text)',
                    fontSize: 14,
                    padding: '12px 16px',
                    outline: 'none',
                  }}
                  autoFocus
                />

                {pickerError && <ErrorInline message={pickerError} />}

                <div 
                  className="overflow-y-auto space-y-1" 
                  style={{ maxHeight: '40vh', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', background: 'var(--bg)' }}
                >
                  {isLoadingPicker ? (
                    <div className="p-8"><LoadingShimmer variant="line" /></div>
                  ) : pickerSearch.length < 2 ? (
                    <p className="p-8 text-center text-sm text-[var(--text-muted)]">Type at least 2 characters to search</p>
                  ) : searchResults.length === 0 ? (
                    <p className="p-8 text-center text-sm text-[var(--text-muted)]">No fragrances found</p>
                  ) : (
                    searchResults.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedToConfirm(f)}
                        className="w-full text-left p-3 hover:bg-[var(--surface)] transition-colors border-b border-[var(--line)] last:border-none"
                        style={{ background: selectedToConfirm?.id === f.id ? 'var(--surface)' : 'transparent' }}
                      >
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.brand}</p>
                        <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 1 }}>{f.name}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedToConfirm && (
                <div className="p-4 bg-[var(--surface-subtle)] rounded-[var(--r-card)] border border-[var(--line)] animate-up">
                  <p className="text-sm mb-4">
                    Add <span className="font-bold">{selectedToConfirm.brand} {selectedToConfirm.name}</span> to your collection?
                  </p>
                  <div className="flex gap-4 items-center">
                    <Button 
                      fullWidth 
                      onClick={handleAddBottle} 
                      disabled={isAdding}
                    >
                      {isAdding ? 'Adding...' : 'Confirm'}
                    </Button>
                    <button 
                      onClick={() => setSelectedToConfirm(null)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Sheet>

      {/* Bottom spacer */}
      <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
