# nota. Imagery Brief — Phase 7 Launch Direction

**Project:** nota. — Personal Scent Identity Platform
**Audience:** People aged 22–45 who distrust influencer beauty/fragrance culture
**Display Name:** nota. (internal names unchanged: scentral-hub repo, scentral-mvp DB)

---

## Visual Language: The Trace, Not the Product

nota.'s visual identity celebrates **scent's invisible impact on human moments**. We photograph *absence*, *residue*, *human presence*, and *the passage of time*—never the glamorous bottle.

### Core Visual Principles

1. **Light through glass.** Soft diffusion. Condensation beading. Blurred edges where fragrance meets air.
2. **Worn surfaces.** Fingerprints on glass. Patina on wood. Creased paper. A used coffee cup beside a journal entry.
3. **Residue and trace.** Wet marks on a shelf. Dust around a vase that held flowers. The outline of what was worn.
4. **No faces.** Hands only. Bare shoulders, blurred. The *evidence* of a person, never the person.
5. **Everyday intimacy.** A moment at dawn. A desk at 3 AM. A nightstand with a book, a glass of water, one carefully chosen scent.
6. **Time lived.** Shadows lengthening through a window. Seasons shifting on a shelf. The feeling of *becoming*.

### BANNED Visual Tropes

- **Bottles as glamour.** No product shots. No flat-lay "aesthetic" styling. No luxury lifestyle porn.
- **Flowers, botanicals, or "natural" imagery.** Avoid garden scenes, petals, fields. (This is beauty marketing 101—we actively reject it.)
- **Gold, marble, yachts, watches, influencers.** Zero luxury signifiers. Zero aspirational lifestyle imagery.
- **AI startup gradients.** No neon, no tech-bro color schemes. No synthetic smooth abstractions.
- **Before/after transformation.** This isn't a beauty product with a "result." It's a mirror.
- **Posed beauty.** Avoid models. Avoid perfection. Favor real hands, real moments, real wear.

---

## Mood Board & Reference Links

### Design Inspiration
- **Kinfolk editorial aesthetic:** [Kinfolk Magazine](https://kinfolk.com) — intimate, real, understated
- **RYE Magazine approach:** Quiet editorial luxury without the reach-for-status angle
- **Iris + Beau visual language:** Focus on ritual, trace, and human presence
- **Literary photography:** Tove Jansson's personal archives; Sally Mann's landscape/time work
- **Japanese minimalism:** Negative space, seasonality, impermanence (wabi-sabi)

### Color + Light Study
- **Diffuse window light:** 8 AM through thin curtains
- **Candlelight warmth:** Deep amber tones reflecting on skin
- **Overcast daylight:** Neutral, shadowless, meditative
- **Nighttime table lamps:** Warm pools of light, sharp contrast with dark edges

---

## Color Palette (CSS Variables)

### Primary System (Existing, Verified)
- **`--color-primary` / `--accent`:** `#B8913A` (Parfumeur's Gold—warm amber, worn leather)
- **`--color-bg`:** `#F7F3EE` (Pale cream—aged paper, linen, parchment)
- **`--color-surface`:** `#FAF7F2` (Off-white, frosty glass)
- **`--color-text`:** `#1E1714` (Deep brown—ink on aged paper)
- **`--color-text-muted`:** `#6B635A` (Warm taupe—old wood)

### Extend for Photography
- **`--image-warm-overlay`:** `oklch(0.35 0.06 40 / 0.15)` (soft amber cast for dawn light)
- **`--image-cool-overlay`:** `oklch(0.45 0.04 220 / 0.08)` (cool cast for night photography)
- **`--aura`:** `oklch(0.72 0.08 60)` (soft gold for accent highlights, XP glow)
- **`--text-faint`:** `#B5AFA8` (whisper-light for layered text)

### Avoid
- High saturation colors
- Pure white (`#FFF`) on pure black (`#000`)
- Neon or electric accents
- Anything that reads "premium luxury"

---

## Photography Production Brief

### 1. **Shelf Study** (for Collection page hero / App Store screenshot)
- **Scene:** A wooden shelf (walnut, oak, or weathered pine) holding 3–5 bottles of varying heights
- **Lighting:** Overcast window light, diffused through sheer curtain; late afternoon softness
- **Mood:** The bottles are *lived-with*, not displayed. One slightly dusty. Shadows cast by window frame.
- **Composition:** Shot at eye level. Allow negative space (empty shelf rail visible). Include a single object nearby—a book, a pen, a candle (unlit)
- **Retouching:** Minimal. Preserve fingerprints on shelf, dust on bottle shoulders, the *realness*

### 2. **Trace Study** (for Traces page / onboarding flow)
- **Scene:** A table surface showing *evidence* of scent worn earlier: a glass with a ring of condensation, a journal with a pen beside it, a hand resting on the table (no face visible)
- **Lighting:** Warm lamp light (5000K–5500K tungsten feel). Create sharp shadow geometry.
- **Mood:** Intimate, late-night focus, intentional. This is the moment *after*—reflection, memory
- **Composition:** Shallow depth of field; blur the background. Let the hand and journal dominate.
- **Retouching:** Enhance shadows slightly. Warm the white balance to reinforce amber-hour feeling

### 3. **Morning Ritual** (for landing page hero / paid social)
- **Scene:** A bare nightstand or desk. One small bottle. Morning light (8–9 AM) streaming across the surface. A window frame casting crosshatch shadows.
- **Lighting:** Single directional window light. High-key, bright but with visible shadow structure.
- **Mood:** Quiet intention. Beginning. Choice made with thought, not habit
- **Composition:** Overhead or 45°. Include texture (wood grain, linen). Empty negative space reinforces *simplicity*
- **Retouching:** Enhance clarity. Warm shadows slightly. Keep highlights clean (no blown-out areas)

### 4. **Hands Detail** (for close-up cards, detail views, App Store preview)
- **Scene:** Hands applying fragrance, or hands resting near a bottle (no active application—too "how-to")
- **Lighting:** Window light or soft studio light at 45°
- **Mood:** Care, attention, ritual. Hands should show *character* (real nails, real texture, real skin tone variation)
- **Composition:** Macro or close telephoto. Blurred background (bokeh). Skin tones warm and grounded.
- **Retouching:** Minimal smoothing. Preserve detail. This is about humanity, not perfection.

### 5. **Seasonal Moments** (for Wheel page, /you profile, insights cards)
- **Scenes (one per season):**
  - **Spring:** Morning light on a shelf reorganized (fresh start; bottles rearranged)
  - **Summer:** Afternoon shadow geometry; a shelf in full sunlight, some bottles casting geometric shadows
  - **Autumn:** Warm golden light, late afternoon, bottles arranged with warm-toned objects (wood, fabric)
  - **Winter:** Cool overcast light, nighttime table lamp, deep shadows, intimate single-fragrance moment
- **Lighting:** Match the season's natural light quality
- **Mood:** Shift throughout the year feels natural, earned, not forced
- **Composition:** Consistent angle (same shelf, different light), so users see *their collection* evolve
- **Retouching:** Adjust color temperature per season. Keep other retouching minimal.

---

## Hero Imagery for Homepage

**Style:** Quiet, meditative, unposed
**Key Rule:** No bottles. Show *what scent does* (creates moments, marks time, shapes identity)

### Option A: Shelf in Morning Light
- Shelf (could be empty, could have 2–3 ambient objects: book, plant, lamp)
- Window frame casting sharp shadows
- Single architectural element (a white wall, a wooden beam)
- Tagline: "Your evolving scent identity"

### Option B: Hands + Journal
- Open journal, pen, hand holding or near fragrance bottle
- Window light source casting warm shadows
- Depth of field blur in background
- Tagline: "Track what moves you. Evolve with intention."

### Option C: Table Study
- Nightstand or small desk (real household item, not styled "set")
- One carefully chosen fragrance
- Ambient objects that feel lived-in (water glass, book, candle)
- Soft, warm light from lamp or window
- Tagline: "Remember how you smell."

---

## OG Image Strategy (Copy-to-Imagery Guidelines)

### Homepage OG Image
- **Size:** 1200×630
- **Layout:** Textured background (aged linen or wood), centered nota. wordmark in Cormorant serif, 1-line tagline below
- **Color palette:** Cream background, gold text, minimal
- **Text:** "nota. — Your Daily Scent Ritual"

### Fragrance Detail OG Image
- **Size:** 1200×630
- **Layout:** Subtle texture or color wash (family-specific gradient from tokens), bottle silhouette (not photo), brand + name + family_vibe
- **Text:** "[Brand Name] [Fragrance Name] — {family_vibe}" (e.g., "Diptyque L'Eau Rose — Fresh & Floral")
- **Fallback:** Use family gradient if no image available

### Insight Card OG Image
- **Size:** 1200×630
- **Layout:** Gradient (persona-specific), centered text with XP level, username, main insight tagline
- **Text:** "Your scent story — {persona_name}" (e.g., "Your scent story — The Ritual Keeper")

### Traces / Moments OG Image
- **Size:** 1200×630
- **Layout:** Subtle texture, handwriting-style font (if available), date + scent name + feeling
- **Text:** "I wore {fragrance} on {date} — {mood}" (e.g., "I wore Calone on July 3rd — Energized")

---

## Typography in Photography

When overlaying text on images, use:
- **Display:** Cormorant Serif Italic (for emotional, narrative moments)
- **Functional:** Unbounded or system sans (for labels, metadata)
- **Avoid:** Script fonts, shadows, or hard outlines. Let the image breathe behind light text.

---

## Seasonality & Refresh Cadence

- **Monthly hero image rotation** on landing page (aligns with launch month, then seasonal shifts)
- **Seasonal shelf photo refreshes** for /you profile hero (spring rearrangement → summer light → autumn glow → winter intimacy)
- **OG images update** per fragrance addition or persona unlock (not labor-intensive; system-generated from templates)

---

## Asset Delivery Checklist

For photographer/designer, provide:
- [ ] 5 primary scene briefs (Shelf, Trace, Morning, Hands, Seasonal—above)
- [ ] Color palette swatch (CSS variables exported as visual reference)
- [ ] Reference moodboard link (Pinterest or Figma board with Kinfolk, RYE, Sally Mann, etc.)
- [ ] Brand guidelines summary (1-pager: "Trace, Not Glamour")
- [ ] Retouching specifications (minimal, preserve character, warm light priority)
- [ ] Delivery format & resolution (2x resolution for retina; max 5 MB per image JPEG)

---

## Tech Implementation Notes

### Image Hosting
- Primary images (hero, shelf studies): Supabase Storage (`fragrance-images` bucket)
- Fallback: Family gradients (CSS variables, no external request)
- OG images: Dynamic generation via `@vercel/og` (no external asset needed)

### Add to next.config.ts remotePatterns
If any new photography source is used (e.g., a stock photo vendor), register the hostname:
```javascript
{
  protocol: 'https',
  hostname: 'your-cdn.example.com',
}
```

### Responsive Image Sizing
Use `next/image` with `priority` for hero, `lazy` for scrollable sections:
```tsx
<Image
  src="/imagery/shelf-study-01.jpg"
  alt="Wooden shelf holding personal fragrance collection"
  width={1200}
  height={630}
  priority
/>
```

---

## Final Direction

**nota. is a mirror, not a mannequin. Our imagery should make users see *themselves* in fragrance, not aspire to someone else's life.**

Every photograph should answer: *What do scents do? They mark time. They shape mood. They become part of who you are—worn on your skin, remembered in your rituals, tracked in your journal, celebrated on your shelf.*

When in doubt, ask: **Is this a photograph of human presence and the trace of a moment, or is this a luxury lifestyle advertisement?** The first belongs in nota. The second does not.

---

*Brief prepared for Phase 7 launch. Revisit seasonally or when adding new features (e.g., social sharing, gifting).*
