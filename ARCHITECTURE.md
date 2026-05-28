# Layering Lab Architecture

## Component Hierarchy

```
LayeringLab (main, state holder)
├── FragranceSlot[0,1,2] (controlled, dropdown on demand)
├── ScoreCard (derived from state, sticky)
└── NotesDisplay (shown only if 2+ frags selected)
```

## State Flow

```
User selects fragrance in slot 0
  ↓
selectFragrance(0, frag) triggered
  ↓
setState: fragrances[0] = frag
  ↓
useEffect dependency on fragrances array fires
  ↓
calculateHarmonyScore(fragrances) runs
  ↓
setState: harmonyScore, breakdown updated
  ↓
useEffect watches state, triggers debounced localStorage sync
  ↓
500ms timer saves to localStorage
```

## Data Flow

### Input: Fragrance Selection
```typescript
interface Fragrance {
  id: string;
  name: string;
  brand: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  }
}
```

### Processing: Harmony Engine
```typescript
calculateHarmonyScore(fragrances) → {
  score: 0-100,
  breakdown: {
    topMatchPct: 0-100,
    heartMatchPct: 0-100,
    baseMatchPct: 0-100,
    dominantProfile: 'top' | 'heart' | 'base' | 'balanced'
  }
}
```

Algorithm:
1. Filter nulls (only active fragrances)
2. For each note level (top, heart, base):
   - Compare notes between every pair
   - Substring match (case-insensitive)
   - Aggregate to percentage
3. Weight: top 25%, heart 50%, base 25%
4. Identify dominant profile (highest % above 50%)

### Output: UI Render
```
[Score Card] ← harmonyScore + breakdown
[Fragrance Slots] ← fragrances array
[Notes Display] ← fragrances + breakdown
```

## Persistence

**localStorage key:** `scentral_layering_state`
**Format:** Full CombinerState object (JSON)
**Sync:** Debounced 500ms after state change
**Load:** On component mount (hydrates from stored state)
**Fallback:** If parse fails, silently resets

## Client-Only, No Auth

- No API calls
- No authentication
- No database
- 100% client-side state
- Presets hardcoded (3 Middle Eastern fragrances)

## Tailwind Theming

**Palette:**
- BG: `gray-900` (#0f0f0f charcoal)
- Accent: `amber-400–700` (warm gold)
- Text: `white` / `gray-400` (hierarchy)

**Components:**
- Cards: `bg-gray-800` border `border-gray-700`
- Buttons: `bg-amber-700` hover `bg-amber-600`
- Gauges: `bg-amber-500` fill

**Responsive:**
- Desktop: 3-column (2-col combiner, 1-col score card)
- Mobile: 1-column stack via `lg:` breakpoints
