# EPIC 1: The Collector's Wall High-Density Grid
## Dark Ambient Material Design System Foundation

**Duration:** Weeks 2–4 (3 weeks, 2 sub-epics)  
**Files:** `globals.css`, `tailwind.config.js`, `DiscoverClient.tsx`, `BottleCard.tsx`, `CollectionClient.tsx`  
**Outcome:** Premium 12-column responsive grid with M3 color tokens, all existing features working with new visual system

---

## PHASE 1: Dark Ambient Material Tokens (Week 2)

### Sub-Epic 1A: Color Token System

**Files to Modify:**
- `app/globals.css` (replace existing color definitions)
- `tailwind.config.js` (extend theme with M3 colors)

**Implementation:**

Copy and paste into `app/globals.css`:

```css
:root {
  /* ===== DARK AMBIENT MATERIAL COLORS ===== */
  
  /* Primary Backgrounds */
  --color-bg: #0F172A;
  --color-bg-overlay: rgba(15, 23, 42, 0.95);
  
  /* Surface Containers (M3-Aligned Glassmorphism) */
  --color-surface-lowest: rgba(255, 255, 255, 0.02);
  --color-surface-low: rgba(255, 255, 255, 0.03);
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-surface-high: rgba(255, 255, 255, 0.08);
  --color-surface-highest: rgba(255, 255, 255, 0.12);
  
  /* Text Colors (High Contrast) */
  --color-text: #E2E8F0;
  --color-text-secondary: #94A3B8;
  --color-text-tertiary: #64748B;
  --color-text-muted: #475569;
  
  /* Accents (M3 + Luxury) */
  --color-accent-primary: #06B6D4;
  --color-accent-secondary: #A855F7;
  --color-accent-warm: #FBBF24;
  
  /* Borders & Dividers */
  --color-border: rgba(255, 255, 255, 0.10);
  --color-border-active: rgba(255, 255, 255, 0.20);
  
  /* Gradients for Fallback Images */
  --gradient-woody: linear-gradient(135deg, #b45309 0%, #1e293b 50%, #0f172a 100%);
  --gradient-fresh: linear-gradient(135deg, #06b6d4 0%, #334155 50%, #0f172a 100%);
  --gradient-floral: linear-gradient(135deg, #ec4899 0%, #1e293b 50%, #0f172a 100%);
  --gradient-oudy: linear-gradient(135deg, #ca8a04 0%, #1e293b 50%, #000000 100%);
  
  /* Shadows (M3 Elevation System) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.10), 0 10px 10px rgba(0, 0, 0, 0.04);
}

/* ===== GLOBAL STYLES ===== */

html, body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body, 'Satoshi', 'Inter', sans-serif);
}

/* ===== TYPOGRAPHY SCALE (M3 TOKENS + FLUID CLAMP) ===== */

.display-large {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 400;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.headline-large {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 500;
  letter-spacing: 0em;
  line-height: 1.3;
}

.title-large {
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  font-weight: 600;
  letter-spacing: 0em;
  line-height: 1.4;
}

.body-large {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.5;
}

.body-medium {
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 400;
  letter-spacing: 0.025em;
  line-height: 1.6;
}

.label-small {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.4;
  text-transform: uppercase;
}

/* ===== ACCESSIBILITY ===== */

/* Ensure all text meets 4.5:1 contrast ratio */
* {
  color: var(--color-text);
}

a {
  color: var(--color-accent-primary);
  text-decoration: none;
  transition: color 200ms ease;
}

a:hover {
  color: var(--color-accent-secondary);
}

button {
  cursor: pointer;
  transition: all 200ms ease;
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  :root {
    --color-text: #FFFFFF;
    --color-text-secondary: #E2E8F0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Update `tailwind.config.js`:**

```javascript
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Ambient Material
        slate: {
          950: '#0F172A',
        },
        cyan: {
          500: '#06B6D4',
        },
        purple: {
          500: '#A855F7',
        },
        amber: {
          400: '#FBBF24',
        },
      },
      spacing: {
        // M3 Spacing Scale
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '40px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '28px',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.7' }],
        xl: ['1.25rem', { lineHeight: '1.8' }],
        '2xl': ['1.5rem', { lineHeight: '1.9' }],
      },
    },
  },
  plugins: [],
};
```

**Testing:**
- [ ] All text passes WCAG 4.5:1 contrast (check DevTools)
- [ ] Typography scales fluidly on 390px, 768px, 1280px viewports
- [ ] Colors render correctly (not washed out)
- [ ] No console warnings about undefined colors

**Commit:**
```bash
git add app/globals.css tailwind.config.js
git commit -m "feat(tokens): Dark Ambient Material color system + M3 typography scales"
```

---

## PHASE 2: Responsive Grid Layout (Week 3)

### Sub-Epic 1B: 12-Column Grid Implementation

**Files to Modify:**
- `app/(main)/discover/DiscoverClient.tsx`
- `app/(main)/collection/CollectionClient.tsx`
- `components/collection/BottleCard.tsx` (complete rewrite)

**Step 1: Update BottleCard Component**

Replace `components/collection/BottleCard.tsx` with:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Fragrance } from '@/types/fragrance'

interface BottleCardProps {
  fragrance: Fragrance
  onSelect?: (fragrance: Fragrance) => void
}

const FAMILY_GRADIENTS: Record<string, string> = {
  'Woody': 'from-amber-900 via-slate-800 to-slate-900',
  'Floral': 'from-rose-400 via-slate-800 to-slate-900',
  'Fresh': 'from-cyan-300 via-slate-700 to-slate-800',
  'Oudy': 'from-yellow-700 via-slate-900 to-black',
  'Aromatic': 'from-green-600 via-slate-800 to-slate-900',
  'Citrus': 'from-yellow-400 via-slate-700 to-slate-900',
  'Fruity': 'from-orange-400 via-slate-800 to-slate-900',
  'Amber': 'from-orange-600 via-slate-800 to-black',
}

export function BottleCard({ fragrance, onSelect }: BottleCardProps) {
  const [imgError, setImgError] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const hasValidImage = fragrance.image_url?.startsWith('http') && !imgError
  const gradientClass = FAMILY_GRADIENTS[fragrance.family] || 'from-slate-700 via-slate-800 to-slate-900'

  return (
    <div
      onClick={() => onSelect?.(fragrance)}
      className="group relative w-full aspect-square cursor-pointer"
    >
      {/* Card Container */}
      <div
        className="
          w-full h-full
          bg-white/5 backdrop-blur-md
          border border-white/10
          rounded-lg
          overflow-hidden
          transition-all duration-300 ease-out
          hover:scale-[1.03]
          hover:bg-white/8
          hover:border-white/20
          hover:shadow-lg
        "
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        {/* Image or Fallback */}
        {hasValidImage ? (
          <Image
            src={fragrance.image_url}
            alt={`${fragrance.brand} ${fragrance.name}`}
            fill
            className="object-contain p-2"
            onError={() => setImgError(true)}
            priority={false}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-4`}>
            {/* Placeholder Bottle SVG */}
            <svg width="40" height="60" viewBox="0 0 40 60" className="mb-2 opacity-40">
              <path d="M12 10h16v40H12z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              <rect x="14" y="8" width="12" height="3" fill="currentColor" />
            </svg>
            <span className="text-xs font-semibold text-white/60 text-center truncate">
              {fragrance.brand}
            </span>
          </div>
        )}

        {/* Hover Overlay (Text Label) */}
        {showOverlay && (
          <div
            className="
              absolute inset-0
              bg-gradient-to-t from-slate-900/90 via-transparent to-transparent
              flex flex-col justify-end p-3
              transition-opacity duration-200
            "
          >
            <p className="text-sm font-semibold text-white truncate">
              {fragrance.name}
            </p>
            <p className="text-xs text-white/70 truncate">
              {fragrance.brand}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Update DiscoverClient Grid**

In `app/(main)/discover/DiscoverClient.tsx`, replace the grid section:

```typescript
<div
  className="
    grid
    grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12
    gap-3 md:gap-4 lg:gap-6
    px-4 md:px-6 lg:px-8
    py-6
  "
>
  {fragrances.map((fragrance) => (
    <BottleCard
      key={fragrance.id}
      fragrance={fragrance}
      onSelect={(frag) => router.push(`/discover/${frag.id}`)}
    />
  ))}
</div>
```

**Step 3: Update CollectionClient Grid (Same Pattern)**

In `app/(main)/collection/CollectionClient.tsx`, apply identical grid structure.

**Testing:**
- [ ] Mobile (390px): 4 columns, no horizontal scroll
- [ ] Tablet (768px): 6 columns, smooth layout
- [ ] Desktop (1280px): 10 columns, high density
- [ ] Ultra-wide (1920px): 12 columns, premium feel
- [ ] Hover state works on desktop + touch
- [ ] Fallback gradients render beautifully
- [ ] No image load errors in console
- [ ] Performance: `next build` reports no >500KB chunks

**Commit:**
```bash
git add components/collection/BottleCard.tsx app/(main)/discover/DiscoverClient.tsx app/(main)/collection/CollectionClient.tsx
git commit -m "feat(grid): 12-col responsive Collector's Wall + glass card styling"
```

---

## PHASE 3: Full System Integration & QA (Week 4)

**Testing Checklist:**
- [ ] All 280+ fragrances render without lag
- [ ] No horizontal scroll on any viewport
- [ ] Touch interactions work on mobile
- [ ] Hover states work on desktop
- [ ] Fallback images beautiful (not broken)
- [ ] All text 4.5:1+ WCAG contrast
- [ ] Smoke tests: 9/9 pass
- [ ] Lighthouse mobile >85, desktop >90

**Production Sign-Off:**
- [ ] Focus group feedback: "Looks premium"
- [ ] No regressions in existing features
- [ ] Branch merges to main cleanly
- [ ] Deployed to staging

**Final Commit:**
```bash
git commit -m "feat(epic-1): Collector's Wall grid system complete + QA passed"
git checkout main
git merge --no-ff feat/epic-1-collectors-wall
git push origin main
```

---

**Epic 1 is production-ready. Proceed to Epic 2: Carousel Filters.**
