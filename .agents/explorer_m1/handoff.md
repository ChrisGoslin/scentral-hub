# Handoff Report: Milestone 1 Codebase Analysis & Style Recommendations

**Date**: 2026-07-08

## 1. Observation

### 1.1 Font and Style Variables Configurations
I inspected the style variables and font loading configuration across the following files:

*   **`app/layout.tsx`**: Loads the "Caveat" font (along with `Space_Grotesk` and `Fraunces`) using `next/font/google` and injects it as a CSS variable:
    ```typescript
    // Lines 29-34:
    const caveat = Caveat({
      subsets: ["latin"],
      weight: ["400", "700"],
      variable: "--font-caveat",
      display: "swap",
    });
    ...
    // Line 93:
    className={`h-[100dvh] antialiased ${spaceGrotesk.variable} ${fraunces.variable} ${caveat.variable}`}
    ```
*   **`app/globals.css`**: Defines CSS variables under `:root` and `@theme inline`.
    *   Line 36: `--font-hand: var(--font-caveat), 'Caveat', cursive;`
    *   Lines 127-132:
        ```css
        @theme inline {
          --color-background: var(--color-bg);
          --color-foreground: var(--color-text);
          --font-sans: var(--font-body);
          --font-mono: "SFMono-Regular", Consolas, monospace;
        }
        ```
*   **`lib/design/tokens.css`**: Reinforces style bridges.
    *   Line 55: `--font-hand: var(--font-caveat, "Caveat", cursive);`

### 1.2 Review of Target UI Components
I examined the design patterns, markup, and positioning strategies in:

*   **`app/(main)/discover/DiscoverGrid.tsx`**: Renders a standard layout utilizing columns:
    ```tsx
    // Line 113:
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-2">
    ```
    Cards (`FragranceCardMedia`) have absolute position markers overlayed (e.g. wishlist button, comparison scale button, resonance match dots).
*   **`app/(main)/collection/WardrobeShelf.tsx`**: Uses `@dnd-kit/core` to facilitate drag-and-drop across different shelf levels. It renders shelves as wooden cabinet rows using:
    ```tsx
    // Line 496-515:
    background: `
      repeating-linear-gradient(90deg, ...),
      repeating-linear-gradient(178deg, var(--cabinet-grain-a, ...) 0px, ...)
    `
    ```
*   **`app/(main)/collection/ShelfTier.tsx`**: Generates a standard flexible auto-fill grid column structure inside each tier:
    ```tsx
    // Lines 124-129:
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 10,
    ```
*   **`app/(main)/you/InsightsPanel.tsx`**: Combines stat panels, horizontal scroll containers for weekly wears, wishlist link-cards, and vertical lists for saved pairings.
*   **`components/ui/EmptyState.tsx`**: Leverages the handwritten font for user guidance captions:
    ```tsx
    // Line 17-19:
    <p style={{ fontSize: 13, lineHeight: '18px', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
      {caption}
    </p>
    ```

### 1.3 Best Practices for Scrapbook/Moodboard Layouts
I executed `npx -y modern-web-guidance@latest search "moodboard layout"` and `npx -y modern-web-guidance@latest search "overlapping staggered layout"` to retrieve layout architectures. The retrieved `css-layout` guidelines state:

*   **Flexbox**: 1D, wrap-friendly, content-first.
*   **Grid**: 2D skeleton, layout-first.
*   **Progressive Enhancement**: Staggered or masonry flows should degrade gracefully. Grid lanes (masonry) lack standard Baseline support; dense auto-packing or multi-column layout is recommended today.
*   **Container Queries**:
    ```css
    .card-wrapper { container: inline-size / card; }
    @container card (inline-size > 400px) { ... }
    ```
    Allows viewport-independent responsiveness, making components highly reusable.

---

## 2. Logic Chain

1. **Caveat Integration**:
   *   `next/font/google` correctly loads "Caveat" and outputs `--font-caveat`.
   *   `:root` variables assign `--font-hand` to `var(--font-caveat)`.
   *   However, Tailwind CSS v4 configures its inline theme rules strictly via the `@theme` directive in CSS (`app/globals.css`). Currently, there is no Tailwind utility alias mapped to `--font-hand` inside `@theme inline`.
   *   *Therefore*, to make a Tailwind utility class (e.g. `font-handwritten`) available globally, we must add `--font-handwritten: var(--font-hand);` inside `@theme inline` in `app/globals.css`.

2. **Scrapbook / Moodboard Layout**:
   *   **Overlapping and Staggering**: A tactile layout relies on items crossing vertical and horizontal boundaries. In CSS Grid, overlapping is achieved by assigning items to intersecting track numbers (e.g., Row 1-3, Col 1-2 overlapping with Row 2-4, Col 2-3).
   *   **Physical/Tactile Styling**: Elements should look like physical objects. Polaroid white borders, subtle rotated angles (`rotate-1`, `-rotate-2`), tape visual styling (translucent overlay headers), and mismatched sizing achieve this.
   *   **Responsive Guarding**: Overlapping layouts collapse in small dimensions (causing overlaps to clip text or block button clicks).
   *   *Therefore*, the layout must render as a simple vertical stack or standard grid column flow on mobile viewports. On larger screens, container queries (`@container (inline-size >= 640px)`) should progressively apply layout overrides, absolute positions, negative offsets, and slight rotations.

---

## 3. Caveats
*   **No Code Changes**: In adherence to the "Read-only investigation" constraint, I have not modified any source code. My recommendations must be implemented by the next agent.
*   **Layout Safety**: Absolute overlaps can obstruct keyboard or click access to buttons (e.g. comparison scales or heart buttons on cards). Z-index layering needs strict testing.

---

## 4. Conclusion

### 4.1 "Caveat" Font Integration Strategy
To enable the use of `className="font-handwritten"` in React components, implement the following change in `app/globals.css`:

```diff
  @theme inline {
    --color-background: var(--color-bg);
    --color-foreground: var(--color-text);
    --font-sans: var(--font-body);
    --font-mono: "SFMono-Regular", Consolas, monospace;
+   --font-handwritten: var(--font-hand);
  }
```

### 4.2 Tactile Overlapping Moodboard Design Sketch
To implement a tactile moodboard (e.g., in a new `MoodboardGrid.tsx` or as an option in `DiscoverGrid.tsx`), follow this styling model:

```tsx
// Moodboard wrapper defining a responsive container context
export function MoodboardLayout({ children }) {
  return (
    <div className="moodboard-container @container w-full min-h-screen bg-stone-50 p-6">
      <div className="grid grid-cols-1 gap-6 @[40rem]:grid-cols-4 @[40rem]:grid-rows-[repeat(6,100px)] @[40rem]:gap-4">
        {/* Children mapped with specific track alignment and rotations */}
        {children}
      </div>
    </div>
  )
}

// Child component representing a tactile Polaroid / Scrapbook note
export function ScrapbookCard({ fragrance, index }) {
  // Select alternating rotations and z-index offsets based on index
  const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
  const rotation = rotations[index % rotations.length];
  
  // Set distinct grid tracks on desktop to force staggering and overlapping
  const desktopGrids = [
    '@[40rem]:col-start-1 @[40rem]:col-span-2 @[40rem]:row-start-1 @[40rem]:row-span-2',
    '@[40rem]:col-start-2 @[40rem]:col-span-2 @[40rem]:row-start-2 @[40rem]:row-span-2 @[40rem]:-mt-6 @[40rem]:-ml-4 z-10',
    '@[40rem]:col-start-4 @[40rem]:col-span-1 @[40rem]:row-start-1 @[40rem]:row-span-3 @[40rem]:mt-4',
    '@[40rem]:col-start-3 @[40rem]:col-span-2 @[40rem]:row-start-4 @[40rem]:row-span-2 @[40rem]:-mt-4 z-20',
  ];
  const gridPlacement = desktopGrids[index % desktopGrids.length];

  return (
    <div className={`luxury-card p-4 pb-8 relative flex flex-col items-center bg-white border border-stone-200 shadow-md ${rotation} ${gridPlacement} transition-transform hover:scale-105 hover:z-30 hover:shadow-lg`}>
      {/* Tape effect */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/30 border-l border-r border-amber-200/50 backdrop-blur-[1px] rotate-[-8deg] shadow-sm pointer-events-none mix-blend-multiply" />
      
      {/* Media Content */}
      <div className="w-full aspect-square relative bg-stone-100 overflow-hidden mb-4">
        {fragrance.image_url ? (
          <img src={fragrance.image_url} alt={fragrance.name} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-stone-300 text-3xl">✦</div>
        )}
      </div>

      {/* Handwritten Label */}
      <div className="text-center font-handwritten text-lg text-stone-800 tracking-wide mt-2">
        <p className="font-bold text-xs uppercase tracking-widest text-stone-500 font-sans mb-1">{fragrance.brand}</p>
        <p className="line-clamp-1">{fragrance.name}</p>
      </div>
    </div>
  )
}
```

---

## 5. Verification Method

To verify these changes after implementation:

1.  **Expose font utility**:
    Ensure `--font-handwritten: var(--font-hand);` is present in `app/globals.css`.
2.  **Verify Tailwind Build**:
    Run `npm run build` to verify that Tailwind parses the custom `@theme` properties without errors.
3.  **Inspect UI Layout**:
    In a browser window, apply class `font-handwritten` to any text element (e.g. caption in `EmptyState.tsx`) and inspect to ensure the browser successfully resolves the font-family to `Caveat, cursive`.
