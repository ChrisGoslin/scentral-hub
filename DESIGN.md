---
colors:
  surface: "#F7F4EE" 
  on-surface: "#2B2926" 
  surface-variant: "#E5E0D6" 
  secondary-ink: "#766E64" 
  primary: "#A0622A" 
  alignment: "#6B7250"
  evolution: "#4A5940"
  accent-experimental: "#B4674E"
typography:
  headline-display: "Instrument Serif Italic"
  body-sans: "Geist"
spacing:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
motion:
  responsive: "200ms cubic-bezier(0.16, 1, 0.3, 1)"
  ceremonial: "480ms cubic-bezier(0.16, 1, 0.3, 1)"
  hold: "1200ms"
---

## 1. Overview (Brand & Style)
nota. is an intimate, emotionally aware digital sanctuary and olfactory journal for scent curators. It is a dimly lit apothecary and a heavy, paper-bound dossier. Every surface must resolve into heavy paper, liquid glass, or physical objects.

## 2. Colors
- **surface (#F7F4EE):** The raw linen canvas (Ivory). Use for safety, onboarding, and reading backgrounds.
- **on-surface (#2B2926):** Absolute authority (Charcoal). Use exclusively for deep identity reveals, blind ranking, and wet-ink typography.
- **surface-variant (#E5E0D6):** Neutral borders, tape, and quiet structure (Stone).
- **secondary-ink (#766E64):** Faded ink for metadata, history, and timestamps (Taupe).
- **alignment (#6B7250):** Progress and precision (Olive). Use for alignment states, progress arcs.
- **evolution (#4A5940):** Transformation (Moss). Use strictly for evolution moments.
- **accent-experimental (#B4674E):** Experimental accent (Terracotta).
- **primary (#A0622A):** Biological heat accent (Amber). Use strictly for the wordmark period, pulse points, and evening desk ambient casts. Never use for backgrounds.

## 3. Typography
- **The Vessel (Instrument Serif Italic):** Represents wet ink on paper. Comprises exactly 10% of the UI. Apply a strict tracking of `-0.01em`. Used exclusively for identities, memories, reveals.
- **The Instrument (Geist):** Represents the analytical system. Comprises 90% of the UI. Clean, humanist sans-serif. Used for labels, chemistry, and timestamps.

## 4. Layout & Spacing
Generous, quiet, breathable. Rely on negative space. Use a 12-column Collector's Wall grid with an 8px base spacing scale.

## 5. Elevation & Depth
Use a heavy 8-layer volumetric shadow with ambient occlusion to give overlaid elements physical weight.

## 6. Shapes
We enforce a Two-Tier Radius Rule:
- **Structural (0px):** All primary containers, cards, and glass panels must have 0px border-radius to mimic cut paper and heavy glass.
- **Organic (Subtle/Full):** Elements denoting human touch, fluid, or biology (pulse points, The Dot) receive fully rounded borders.

## 7. Components
- **Liquid Glass:** Use `backdrop-filter: blur(20px) saturate(1.6) brightness(1.05)` wrapped in volumetric shadow.
- **Botanical Stamps & Charcoal:** Must use `mix-blend-multiply` to physically sink ink into the ivory paper grain.

## 8. Do's and Don'ts
- **DO NOT** use pure white (#FFFFFF) or pure black (#000000).
- **DO NOT** use gradients, neon colors, or 3D vector illustrations.
- **DO** overlay a 2% SVG fractal noise grain globally to simulate raw paper.
- **PERFORMANCE GUARDRAILS:** ≤3 glass layers per viewport, grain as one fixed compositor layer.

## 9. The Dot
The biological core. Four states: Idle (static), Save (fills over 200ms), Active (subtle breathing pulse), Alignment (emits olive glow).
