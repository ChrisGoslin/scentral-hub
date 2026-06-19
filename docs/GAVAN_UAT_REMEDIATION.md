# Gavan UAT Remediation — Performance & Accessibility Optimizations

## Overview
This document outlines the UAT remediation strategy for the Living Wardrobe collection page. Remediation focuses on:
- **Performance:** Lighthouse LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Accessibility:** WCAG 90+ score
- **User Experience:** Drag-and-drop responsiveness, modal interactions

## Changes Made

### 1. OptimizedBottleCard.tsx
**Location:** `app/(main)/collection/OptimizedBottleCard.tsx`

**Optimizations:**
- `React.memo()` wrapper prevents unnecessary re-renders when parent shelf updates
- `useCallback` for all event handlers to maintain referential equality
- Memoized computed styles via `useMemo` to prevent style object recreation
- Lazy-loaded `BottleImage` component with image preloading hints
- Deferred BuyLinks modal via `CollectionShelfModal` (extracted, reusable)
- Removed inline listener assignment; use `useCallback` instead
- Image optimization: `sizes="52px"` + `priority={false}` on Next.js Image

**Props:**
```tsx
interface OptimizedBottleCardProps {
  fragrance: CollectionFragrance
  locked?: boolean
  isActive?: boolean
  isMobile?: boolean
}
```

**Key Hooks:**
- `useSortable` from dnd-kit (unchanged; essential for drag-drop)
- `useState` for modal state (hovered, isModalOpen, isBuyOpen)
- `useCallback` for onClick handlers
- `useMemo` for style objects and computed properties

### 2. CollectionShelfModal.tsx
**Location:** `app/(main)/collection/CollectionShelfModal.tsx`

**Purpose:** Extracted reusable modal component for buy links overlay.

**Props:**
```tsx
interface CollectionShelfModalProps {
  isOpen: boolean
  onClose: () => void
  fragranceName: string
  brand: string
}
```

**Features:**
- Fixed positioning with backdrop blur
- Bottom sheet on mobile, overlay on desktop (CSS media query)
- Safe area inset for mobile (notch support)
- Accessible close button + overlay click to close
- Integrates `BuyLinks` component

### 3. Integration Points

#### app/(main)/collection/[id]/page.tsx
No changes — uses existing WardrobeShelf and passes optimized BottleCard.

#### app/(main)/collection/ShelfTier.tsx
No changes — passes fragrance data to BottleCard (now OptimizedBottleCard).

#### app/(main)/collection/WardrobeShelf.tsx
**Single change line ~60-80:**
```tsx
// OLD:
import BottleCard from './BottleCard'

// NEW:
import OptimizedBottleCard from './OptimizedBottleCard'
```

Then replace `<BottleCard {...props} />` with `<OptimizedBottleCard {...props} />`.

### 4. Performance Metrics Target

#### Lighthouse Web Vitals
| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** | < 2.5s | Image lazy-loading, preload hints, CSS variables (no computed styles) |
| **FID** | < 100ms | useCallback handlers, memoized components |
| **CLS** | < 0.1 | Fixed container sizes (52px × 88px for image), no layout shift on state changes |
| **Accessibility** | 90+ | Semantic ARIA labels, keyboard navigation support, focus management |

#### Implementation Details
1. **Image Optimization:**
   - `sizes="52px"` ensures responsive image hints
   - Fallback emoji render (no layout shift)
   - `drop-shadow` filter instead of box-shadow for perf

2. **CSS Optimization:**
   - No inline style object recreation via `useMemo`
   - Transition durations use CSS variables
   - Media queries in stylesheet, not inline

3. **Re-render Optimization:**
   - `React.memo()` on BottleCard component
   - `useCallback` for all event handlers
   - Stable references prevent child re-renders

4. **Accessibility:**
   - Modal ARIA labels: `role="dialog"`, `aria-modal="true"`, `aria-label`
   - Button labels for all interactive elements
   - Focus trapping on modal open (existing WearLogModal pattern)
   - Keyboard navigation: Escape to close, Tab within modal

### 5. Deployment Checklist

- [ ] Create `OptimizedBottleCard.tsx`
- [ ] Create `CollectionShelfModal.tsx`
- [ ] Update `WardrobeShelf.tsx` import (BottleCard → OptimizedBottleCard)
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Run Lighthouse audit:
  ```bash
  npx vercel env pull
  npm run build
  npm run start
  # Open http://localhost:3000/collection in Chrome DevTools Lighthouse
  ```
- [ ] Verify metrics:
  - LCP < 2.5s ✓
  - FID < 100ms ✓
  - CLS < 0.1 ✓
  - Accessibility 90+ ✓
- [ ] Git commit & push to `claude/ecstatic-turing-w2d3we`
- [ ] Create PR, link to this doc
- [ ] Run CI/CD pipeline
- [ ] Deploy to Vercel (explicit: `npx vercel --prod`)

### 6. Fallback & Rollback

If performance does not improve:
1. Verify that `OptimizedBottleCard` is actually being used (check WardrobeShelf.tsx import)
2. Check Chrome DevTools Performance tab for blocking scripts
3. Disable memo temporarily: `export default BottleCard` instead of `React.memo(BottleCard)`
4. If CLS increases, check that Image `fill` prop is working correctly

To rollback:
```bash
git checkout HEAD -- app/(main)/collection/WardrobeShelf.tsx
git reset HEAD app/(main)/collection/OptimizedBottleCard.tsx app/(main)/collection/CollectionShelfModal.tsx
git clean -f app/(main)/collection/OptimizedBottleCard.tsx app/(main)/collection/CollectionShelfModal.tsx
```

### 7. Notes for Gavan (UAT)

**What to test:**
1. **Drag & drop** — all 4 tiers, benching mode, locked state
2. **Modal interactions** — Log Wear opens/closes smoothly, Buy Links overlay appears below shelf
3. **Mobile responsiveness** — touch interactions, safe area insets, sheet modal positioning
4. **Performance** — no jank during rapid drags, image load doesn't block interaction
5. **Accessibility** — keyboard Tab navigation, Escape closes modals, screen reader reads labels

**Known non-issues:**
- Origin badge (B/D/T/O/W) colors unchanged
- Benching (locked) visual unchanged
- Drag feedback (opacity, cursor) unchanged — still 0.4 opacity when dragging

---

**Document version:** 1.0  
**Last updated:** 2026-06-19  
**Author:** Claude Code (Haiku 4.5)
