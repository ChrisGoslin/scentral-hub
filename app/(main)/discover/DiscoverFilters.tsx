'use client'

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
  house: string[]
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
  onHouseToggle: (h: string) => void
  onSortChange: (s: SortOption) => void
  onShowSavedToggle: (v: boolean) => void
}

function FilterCarousel({
  title,
  options,
  isActive,
  onToggle,
}: {
  title: string
  options: string[]
  isActive: (v: string) => boolean
  onToggle: (v: string) => void
}) {
  return (
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
        {title}
      </p>
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
                minHeight: 44,
                scrollSnapAlign: 'start',
                boxShadow: active ? '0 0 0 2px var(--accent)' : 'none',
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
  house,
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
  onHouseToggle,
  onSortChange,
  onShowSavedToggle,
}: Props) {
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

  const toggleHouse = (h: string) => {
    const isAdding = !house.includes(h)
    onHouseToggle(h)
    track('filter_applied', { type: 'house', value: h, action: isAdding ? 'add' : 'remove' })
  }

  const handleSortChange = (s: SortOption) => {
    onSortChange(s)
    localStorage.setItem('scentral_discover_sort', s)
  }

  return (
    <div style={{ padding: '16px 0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          <input
            type="text"
            placeholder="Search by brand or scent…"
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            onFocus={() => onSearchFocus(true)}
            onBlur={() => onSearchFocus(false)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 14px',
              fontSize: 14,
              background: 'var(--surface)',
              border: searchFocused ? '1px solid var(--accent)' : '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              onSmellsLikeToggle()
              track('smells_like_toggled', { active: !smellsLikeMode })
            }}
            aria-pressed={smellsLikeMode}
            style={{
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderRadius: 'var(--r-card)',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: smellsLikeMode
                ? 'color-mix(in srgb, var(--accent) 16%, transparent)'
                : 'var(--surface)',
              border: smellsLikeMode ? '1px solid var(--accent)' : '1px solid var(--line)',
              color: smellsLikeMode ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {smellsLikeMode ? '✓ Smells Like' : 'Smells Like'}
          </button>
        </div>
      </div>

      <FilterCarousel
        title="Vibe"
        options={Object.keys(VIBE_TAGS)}
        isActive={v => vibe.includes(v)}
        onToggle={toggleVibe}
      />

      <FilterCarousel
        title="Longevity"
        options={Object.keys(LONGEVITY_PROJECTIONS)}
        isActive={v => longevity === v}
        onToggle={toggleLongevity}
      />

      <FilterCarousel
        title="Occasion"
        options={Object.keys(OCCASION_TAGS)}
        isActive={v => occasion.includes(v)}
        onToggle={toggleOccasion}
      />

      {/* House — multi-select, includes Saved alongside */}
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
          House
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4">
          {[...KNOWN_BRANDS, 'Niche'].map(v => {
            const active = house.includes(v)
            return (
              <Chip
                key={v}
                selected={active}
                onClick={() => toggleHouse(v)}
                style={{
                  flexShrink: 0,
                  minHeight: 44,
                  scrollSnapAlign: 'start',
                  boxShadow: active ? '0 0 0 2px var(--accent)' : 'none',
                }}
              >
                {v}
              </Chip>
            )
          })}
          <Chip
            selected={showSaved}
            onClick={() => onShowSavedToggle(!showSaved)}
            style={{ flexShrink: 0, minHeight: 44, scrollSnapAlign: 'start' }}
          >
            ❤ Saved
          </Chip>
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
              style={{ flexShrink: 0, minHeight: 44, scrollSnapAlign: 'start' }}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
