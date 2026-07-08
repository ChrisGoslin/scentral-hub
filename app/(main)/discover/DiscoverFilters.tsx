'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import {
  SORT_OPTIONS,
  VIBE_TAGS,
  LONGEVITY_PROJECTIONS,
  OCCASION_TAGS,
  KNOWN_BRANDS,
  type SortOption,
} from '@/lib/filterConstants'
import { track } from '@/lib/posthog'

type Props = {
  vibe: string[]
  longevity: string | null
  occasion: string[]
  brand: string[]
  sort: SortOption
  showSaved: boolean
  searchTerm: string
  searchFocused: boolean
  smellsLikeMode: boolean

  onSearchTermChange: (term: string) => void
  onSearchFocus: (focused: boolean) => void
  onSmellsLikeToggle: () => void
  onVibeToggle: (v: string) => void
  onLongevityToggle: (l: string) => void
  onOccasionToggle: (o: string) => void
  onBrandToggle: (h: string) => void
  onSortChange: (s: SortOption) => void
  onShowSavedToggle: (v: boolean) => void
}

function FilterCarousel({
  title,
  options,
  isActive,
  onToggle,
  tooltip,
}: {
  title: string
  options: string[]
  isActive: (v: string) => boolean
  onToggle: (v: string) => void
  tooltip?: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16, marginBottom: 10, position: 'relative' }}>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          {title}
        </p>
        {tooltip && (
          <>
            <button
              type="button"
              onClick={() => setShowTooltip(prev => !prev)}
              aria-label={`What is ${title}?`}
              style={{
                background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 11,
                lineHeight: 1,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⓘ
            </button>
            {showTooltip && (
              <>
                <div
                  onClick={() => setShowTooltip(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    zIndex: 46,
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-card)',
                    maxWidth: 240,
                  }}
                >
                  {tooltip}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
        {options.map(v => {
          const active = isActive(v)
          return (
            <Chip
              key={v}
              selected={active}
              onClick={() => onToggle(v)}
              style={{
                flexShrink: 0,
                minHeight: 40,
                scrollSnapAlign: 'start',
                borderRadius: 999,
                paddingLeft: 16,
                paddingRight: 16,
                background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'color-mix(in srgb, var(--surface) 88%, transparent)',
                borderColor: active ? 'color-mix(in srgb, var(--accent) 44%, transparent)' : 'var(--line)',
                boxShadow: active ? '0 10px 24px rgba(224,181,108,0.12)' : 'none',
              }}
            >
              {v}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}

export function DiscoverFilters({
  vibe,
  longevity,
  occasion,
  brand,
  sort,
  showSaved,
  searchTerm,
  searchFocused,
  smellsLikeMode,
  onSearchTermChange,
  onSearchFocus,
  onSmellsLikeToggle,
  onVibeToggle,
  onLongevityToggle,
  onOccasionToggle,
  onBrandToggle,
  onSortChange,
  onShowSavedToggle,
}: Props) {
  const [canScan, setCanScan] = useState(false)

  useEffect(() => {
    setCanScan(typeof navigator !== 'undefined' && !!navigator.mediaDevices)
  }, [])

  const toggleVibe = (v: string) => {
    const isAdding = !vibe.includes(v)
    onVibeToggle(v)
    track('filter_applied', { type: 'vibe', value: v, action: isAdding ? 'add' : 'remove' })
  }

  const toggleLongevity = (l: string) => {
    const isAdding = longevity !== l
    onLongevityToggle(l)
    track('filter_applied', { type: 'longevity', value: l, action: isAdding ? 'add' : 'remove' })
  }

  const toggleOccasion = (o: string) => {
    const isAdding = !occasion.includes(o)
    onOccasionToggle(o)
    track('filter_applied', { type: 'occasion', value: o, action: isAdding ? 'add' : 'remove' })
  }

  const toggleBrand = (h: string) => {
    const isAdding = !brand.includes(h)
    onBrandToggle(h)
    track('filter_applied', { type: 'brand', value: h, action: isAdding ? 'add' : 'remove' })
  }

  const handleSortChange = (s: SortOption) => {
    onSortChange(s)
    localStorage.setItem('scentral_discover_sort', s)
  }

  return (
    <div
      style={{
        padding: '16px 0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Scent DNA Search Card */}
      <div
        onClick={() => {
          onSmellsLikeToggle()
          track('scent_dna_toggled', { active: !smellsLikeMode })
        }}
        style={{
          margin: '0 16px',
          padding: '14px 16px',
          background: smellsLikeMode
            ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent) 6%, transparent))'
            : 'rgba(255,255,255,0.03)',
          border: smellsLikeMode ? '1px solid color-mix(in srgb, var(--accent) 38%, transparent)' : '1px solid color-mix(in srgb, var(--line) 70%, transparent)',
          borderRadius: 20,
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: smellsLikeMode ? '0 18px 30px rgba(224,181,108,0.08)' : '0 12px 28px rgba(0,0,0,0.14)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
            fontWeight: 500,
          }}
        >
          SCENT DNA SEARCH
        </p>
        <span
          style={{
            fontSize: 12,
            color: smellsLikeMode ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 500,
            fontFamily: 'var(--font-hand)',
          }}
        >
          {smellsLikeMode ? '✓ Active' : 'Describe a scent →'}
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px' }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          Discover Fragrances
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <input
              type="text"
              placeholder={smellsLikeMode ? 'Describe your ideal scent — warm amber, fresh citrus, dry wood…' : 'Search by brand or scent…'}
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
              onFocus={() => onSearchFocus(true)}
              onBlur={() => onSearchFocus(false)}
              style={{
                width: '100%',
                padding: '14px 46px 14px 16px',
                fontSize: 14,
                background: 'rgba(255,255,255,0.04)',
                border: searchFocused ? '1px solid color-mix(in srgb, var(--accent) 55%, transparent)' : '1px solid color-mix(in srgb, var(--line) 72%, transparent)',
                borderRadius: 18,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
                boxShadow: searchFocused ? '0 0 0 4px color-mix(in srgb, var(--accent) 10%, transparent)' : 'none',
              }}
            />
            {canScan && <Link
              href="/scanner?from=discover"
              aria-label="Scan a bottle"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent)',
                fontSize: 18,
                lineHeight: 1,
                textDecoration: 'none',
              }}
            >
              ⊡
            </Link>}
          </div>
        </div>
      </div>

      {/* Saved — quick toggle, above filters */}
      <div style={{ padding: '6px 16px 0' }}>
        <Chip
          selected={showSaved}
          onClick={() => onShowSavedToggle(!showSaved)}
          style={{
            minHeight: 40,
            borderRadius: 999,
            paddingLeft: 14,
            paddingRight: 14,
            background: showSaved ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'rgba(255,255,255,0.03)',
            borderColor: showSaved ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--line)',
            boxShadow: showSaved ? '0 10px 22px rgba(224,181,108,0.12)' : 'none',
          }}
        >
          ❤ Saved
        </Chip>
      </div>

      <FilterCarousel
        title="Vibe"
        options={Object.keys(VIBE_TAGS)}
        isActive={v => vibe.includes(v)}
        onToggle={toggleVibe}
        tooltip="The mood or character of the scent — woody, fresh, floral etc."
      />

      <FilterCarousel
        title="Longevity"
        options={Object.keys(LONGEVITY_PROJECTIONS)}
        isActive={v => longevity === v}
        onToggle={toggleLongevity}
        tooltip="How long the scent lasts on your skin after spraying."
      />

      <FilterCarousel
        title="Occasion"
        options={Object.keys(OCCASION_TAGS)}
        isActive={v => occasion.includes(v)}
        onToggle={toggleOccasion}
        tooltip="When and where this fragrance fits best."
      />

      {/* Brand — multi-select */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            paddingLeft: 16,
            marginBottom: 6,
          }}
        >
          Brand
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
          {[...KNOWN_BRANDS, 'Niche'].map(v => {
            const active = brand.includes(v)
            return (
              <Chip
                key={v}
                selected={active}
                onClick={() => toggleBrand(v)}
                style={{
                  flexShrink: 0,
                  minHeight: 40,
                  scrollSnapAlign: 'start',
                  borderRadius: 999,
                  paddingLeft: 16,
                  paddingRight: 16,
                  background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'rgba(255,255,255,0.03)',
                  borderColor: active ? 'color-mix(in srgb, var(--accent) 44%, transparent)' : 'var(--line)',
                  boxShadow: active ? '0 10px 24px rgba(224,181,108,0.12)' : 'none',
                }}
              >
                {v}
              </Chip>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            paddingLeft: 16,
            marginBottom: 6,
          }}
        >
          Sort
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
          {SORT_OPTIONS.map(v => (
            <Chip
              key={v}
              selected={sort === v}
              onClick={() => handleSortChange(v)}
              style={{
                flexShrink: 0,
                minHeight: 40,
                scrollSnapAlign: 'start',
                borderRadius: 999,
                paddingLeft: 16,
                paddingRight: 16,
                background: sort === v ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'rgba(255,255,255,0.03)',
                borderColor: sort === v ? 'color-mix(in srgb, var(--accent) 44%, transparent)' : 'var(--line)',
              }}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
