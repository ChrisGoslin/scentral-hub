# EPIC 2: Edge-to-Edge Carousel Filters
## Dark Ambient Material 3 Horizontal Scrolling & Filter Architecture

**Duration:** Weeks 5 (1 week, parallel execution)  
**Files:** `components/DiscoverFilters.tsx`, `components/collection/CollectionFilters.tsx`, `app/(main)/discover/page.tsx`  
**Outcome:** Full-width horizontal filter carousels replacing vertical stacks. All filters always visible, always accessible.

---

## DESIGN PHILOSOPHY

In Material 3, filters are **assist chips**—low-priority interactive elements that guide discovery without claiming screen real estate. But in Dark Ambient Material, we elevate them: carousels become signature interaction patterns, allowing users to swipe through options continuously while maintaining visual hierarchy.

**Key Principles:**
- **Edge-to-edge scrolling:** Filters span full viewport width, gutters included
- **No wrapping:** Chips stay in single horizontal row (use `whitespace-nowrap`)
- **Snap alignment:** `snap-x snap-mandatory` ensures smooth thumb-friendly scrolling
- **Touch-first:** All interaction targets ≥44px (M3 standard)
- **Persistent visibility:** Filters never hide behind content or modals

---

## IMPLEMENTATION

### Phase 1: Component Rewrite (Week 5, Day 1–2)

**File: `components/DiscoverFilters.tsx` (Complete Rewrite)**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'

interface FilterConfig {
  id: string
  label: string
  icon?: React.ReactNode
}

interface DiscoverFiltersProps {
  onFilterChange: (filterType: string, value: string, isActive: boolean) => void
  activeFilters: Record<string, string[]>
}

const FILTER_CATEGORIES = {
  vibe: [
    { id: 'woody', label: 'Woody' },
    { id: 'floral', label: 'Floral' },
    { id: 'oudy', label: 'Oudy' },
    { id: 'fresh', label: 'Fresh' },
    { id: 'amber', label: 'Amber' },
    { id: 'aromatic', label: 'Aromatic' },
    { id: 'citrus', label: 'Citrus' },
    { id: 'green', label: 'Green' },
    { id: 'fruity', label: 'Fruity' },
  ],
  longevity: [
    { id: 'beast-mode', label: 'Beast Mode' },
    { id: 'strong', label: 'Strong' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'medium', label: 'Medium' },
    { id: 'weak', label: 'Weak' },
  ],
  occasion: [
    { id: 'work', label: 'Work' },
    { id: 'date-night', label: 'Date Night' },
    { id: 'nsfw', label: 'NSFW' },
    { id: 'gym', label: 'Gym' },
    { id: 'wfh', label: 'WFH' },
    { id: 'travel', label: 'Travel' },
    { id: 'weekend', label: 'Weekend' },
  ],
  house: [
    { id: 'dior', label: 'Dior' },
    { id: 'ysl', label: 'YSL' },
    { id: 'prada', label: 'Prada' },
    { id: 'lattafa', label: 'Lattafa' },
    { id: 'afnan', label: 'Afnan' },
    { id: 'khadlaj', label: 'Khadlaj' },
    { id: 'tom-ford', label: 'Tom Ford' },
    { id: 'niche', label: 'Niche Houses' },
    // ... add all 50+ houses here
  ],
}

function FilterCarousel({
  title,
  filters,
  categoryId,
  activeFilters,
  onFilterChange,
  isMultiSelect = true,
}: {
  title: string
  filters: FilterConfig[]
  categoryId: string
  activeFilters: string[]
  onFilterChange: (value: string, isActive: boolean) => void
  isMultiSelect?: boolean
}) {
  return (
    <div className="mb-4">
      <h3 className="label-small text-white/60 mb-2 px-4 md:px-6 lg:px-8">
        {title}
      </h3>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar whitespace-nowrap gap-2 px-4 md:px-6 lg:px-8 py-2">
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter.id)
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id, !isActive)}
              className={`
                px-4 py-2 rounded-full
                label-small
                transition-all duration-200 ease-out
                flex-shrink-0
                whitespace-nowrap
                ${
                  isActive
                    ? 'bg-white/10 border border-white/20 ring-2 ring-cyan-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/8 hover:border-white/15'
                }
              `}
              style={{ minHeight: '44px', minWidth: 'fit-content' }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DiscoverFilters({
  onFilterChange,
  activeFilters,
}: DiscoverFiltersProps) {
  const handleVibeChange = useCallback(
    (value: string, isActive: boolean) => {
      onFilterChange('vibe', value, isActive)
    },
    [onFilterChange]
  )

  const handleLongevityChange = useCallback(
    (value: string, isActive: boolean) => {
      onFilterChange('longevity', value, isActive)
    },
    [onFilterChange]
  )

  const handleOccasionChange = useCallback(
    (value: string, isActive: boolean) => {
      onFilterChange('occasion', value, isActive)
    },
    [onFilterChange]
  )

  const handleHouseChange = useCallback(
    (value: string, isActive: boolean) => {
      onFilterChange('house', value, isActive)
    },
    [onFilterChange]
  )

  const clearAllFilters = useCallback(() => {
    // Dispatch clear all action
    console.log('Clear all filters')
  }, [])

  return (
    <div className="w-full bg-gradient-to-b from-white/2 to-transparent backdrop-blur-sm border-b border-white/10 py-4">
      <FilterCarousel
        title="Vibe / Family"
        filters={FILTER_CATEGORIES.vibe}
        categoryId="vibe"
        activeFilters={activeFilters.vibe || []}
        onFilterChange={handleVibeChange}
        isMultiSelect={true}
      />

      <FilterCarousel
        title="Longevity"
        filters={FILTER_CATEGORIES.longevity}
        categoryId="longevity"
        activeFilters={activeFilters.longevity || []}
        onFilterChange={handleLongevityChange}
        isMultiSelect={false}
      />

      <FilterCarousel
        title="Occasion"
        filters={FILTER_CATEGORIES.occasion}
        categoryId="occasion"
        activeFilters={activeFilters.occasion || []}
        onFilterChange={handleOccasionChange}
        isMultiSelect={true}
      />

      <FilterCarousel
        title="House / Designer"
        filters={FILTER_CATEGORIES.house}
        categoryId="house"
        activeFilters={activeFilters.house || []}
        onFilterChange={handleHouseChange}
        isMultiSelect={true}
      />

      {/* Clear All Button (Optional) */}
      {Object.values(activeFilters).some((arr) => arr.length > 0) && (
        <button
          onClick={clearAllFilters}
          className="mx-4 md:mx-6 lg:mx-8 mt-3 px-4 py-2 text-xs font-semibold text-white/60 hover:text-white/80 transition-colors duration-200"
        >
          Clear all filters →
        </button>
      )}
    </div>
  )
}
```

**CSS Helper (add to `app/globals.css`):**

```css
/* Hide scrollbar for filter carousels */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Snap scroll behavior */
.snap-x {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.snap-x > * {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

### Phase 2: Integration into Discover Page (Week 5, Day 3–4)

**File: `app/(main)/discover/DiscoverClient.tsx`**

Replace the filters section with:

```typescript
'use client'

import { useState, useCallback } from 'react'
import { DiscoverFilters } from '@/components/DiscoverFilters'

export function DiscoverClient() {
  const [activeFilters, setActiveFilters] = useState({
    vibe: [] as string[],
    longevity: [] as string[],
    occasion: [] as string[],
    house: [] as string[],
  })

  const handleFilterChange = useCallback(
    (filterType: string, value: string, isActive: boolean) => {
      setActiveFilters((prev) => ({
        ...prev,
        [filterType]: isActive
          ? [...(prev[filterType] || []), value]
          : (prev[filterType] || []).filter((v) => v !== value),
      }))

      // Call API to fetch filtered fragrances
      // await fetchFragrances(activeFilters)
    },
    []
  )

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      {/* Sticky Filters */}
      <div className="sticky top-0 z-40">
        <DiscoverFilters
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Grid content below */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        {/* Render fragrances based on activeFilters */}
      </div>
    </div>
  )
}
```

### Phase 3: Testing & Optimization (Week 5, Day 5)

**Testing Checklist:**
- [ ] Carousels scroll smoothly on mobile (iOS + Android)
- [ ] Carousels scroll smoothly on desktop (mouse wheel + trackpad)
- [ ] Chips do NOT wrap to second line
- [ ] Active state visually distinct (cyan ring + highlight)
- [ ] Touch targets ≥44px (DevTools measurement)
- [ ] Filter logic works: clicking chips updates grid
- [ ] Multi-select vibe filters: OR logic ("Woody OR Floral")
- [ ] Single-select longevity: Only one active at a time
- [ ] Performance: Scroll 60fps, no jank
- [ ] WCAG: All chips labelled, keyboard accessible (Tab/Enter)

**Commit:**
```bash
git add components/DiscoverFilters.tsx components/collection/CollectionFilters.tsx app/(main)/discover/DiscoverClient.tsx app/globals.css
git commit -m "feat(epic-2): Edge-to-edge carousel filters + M3 assist chips"
git checkout main
git merge --no-ff feat/epic-2-carousel-filters
git push origin main
```

---

**Epic 2 complete. Proceed to Epic 3: Smells Like Search.**
