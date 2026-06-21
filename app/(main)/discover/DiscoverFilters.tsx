'use client'

import Chip from '@/components/ui/Chip'
import {
  SORT_OPTIONS,
  FEEL_FAMILIES,
  FEEL_AMBIENT,
  LONGEVITY_PROJECTIONS,
  KNOWN_BRANDS,
  FEEL_PROJECTIONS,
  type SortOption,
} from '@/lib/filterConstants'
import { track } from '@/lib/posthog'

type Props = {
  feel: string | null
  longevity: string | null
  brand: string | null
  sort: SortOption
  showSaved: boolean
  searchTerm: string
  searchFocused: boolean
  activeGlow: string

  onSearchTermChange: (term: string) => void
  onSearchFocus: (focused: boolean) => void
  onFeelToggle: (f: string) => void
  onLongevityToggle: (l: string) => void
  onBrandToggle: (b: string) => void
  onSortChange: (s: SortOption) => void
  onShowSavedToggle: (v: boolean) => void
  onClearFilters: () => void
}

export function DiscoverFilters({
  feel,
  longevity,
  brand,
  sort,
  showSaved,
  searchTerm,
  searchFocused,
  activeGlow,
  onSearchTermChange,
  onSearchFocus,
  onFeelToggle,
  onLongevityToggle,
  onBrandToggle,
  onSortChange,
  onShowSavedToggle,
}: Props) {
  const toggleFeel = (f: string) => {
    onFeelToggle(f)
    track('feel_filter_applied', { feel: f })
  }

  const toggleLongevity = (l: string) => {
    const isAdding = longevity !== l
    onLongevityToggle(l)
    track('filter_applied', {
      type: 'longevity',
      value: l,
      action: isAdding ? 'add' : 'remove',
    })
  }

  const toggleBrand = (b: string) => {
    const isAdding = brand !== b
    onBrandToggle(b)
    track('filter_applied', {
      type: 'brand',
      value: b,
      action: isAdding ? 'add' : 'remove',
    })
  }

  const handleSortChange = (s: SortOption) => {
    onSortChange(s)
    localStorage.setItem('scentral_discover_sort', s)
  }

  return (
    <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search */}
      <div>
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
        <input
          type="text"
          placeholder="Search by brand or scent…"
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          onFocus={() => onSearchFocus(true)}
          onBlur={() => onSearchFocus(false)}
          style={{
            width: '100%',
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
      </div>

      {/* Feel */}
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
          Feel
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingLeft: 16,
            paddingRight: 16,
            scrollbarWidth: 'none',
          }}
        >
          {Object.keys(FEEL_FAMILIES).map(v => {
            const isActive = feel === v
            return (
              <Chip
                key={v}
                selected={isActive}
                onClick={() => toggleFeel(v)}
                style={{
                  flexShrink: 0,
                  borderColor: isActive ? (FEEL_AMBIENT[v]?.chipActive ?? 'var(--accent)') : 'var(--line)',
                  backgroundColor: isActive ? `${FEEL_AMBIENT[v]?.chipActive ?? 'var(--accent)'}15` : 'transparent',
                  boxShadow: isActive
                    ? `0 0 0 1px ${FEEL_AMBIENT[v]?.chipActive ?? 'var(--accent)'}`
                    : 'none',
                  transition:
                    'border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {v}
              </Chip>
            )
          })}
        </div>
      </div>

      {/* Longevity */}
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
          Longevity
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingLeft: 16,
            paddingRight: 16,
            scrollbarWidth: 'none',
          }}
        >
          {Object.keys(LONGEVITY_PROJECTIONS).map(v => (
            <Chip
              key={v}
              selected={longevity === v}
              onClick={() => toggleLongevity(v)}
              style={{ flexShrink: 0 }}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>

      {/* Brand */}
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
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingLeft: 16,
            paddingRight: 16,
            scrollbarWidth: 'none',
          }}
        >
          {[...KNOWN_BRANDS, 'Other'].map(v => (
            <Chip
              key={v}
              selected={brand === v}
              onClick={() => toggleBrand(v)}
              style={{ flexShrink: 0 }}
            >
              {v}
            </Chip>
          ))}
          <Chip
            selected={showSaved}
            onClick={() => onShowSavedToggle(!showSaved)}
            style={{ flexShrink: 0 }}
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
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingLeft: 16,
            paddingRight: 16,
            scrollbarWidth: 'none',
          }}
        >
          {SORT_OPTIONS.map(v => (
            <Chip
              key={v}
              selected={sort === v}
              onClick={() => handleSortChange(v)}
              style={{ flexShrink: 0 }}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
