# nota. Imagery Briefs — Asset Pack Generation

**Purpose:** generate the physical-world assets that code cannot draw. Paste each prompt into Firefly / Midjourney / your image model of choice. Generate 4 variations per brief, pick by the selection criteria, deliver as transparent PNG unless noted. Every brief inherits the global rules below. If an output violates one, regenerate — don't retouch on-brand-ness in.

## Global rules (apply to every brief)

- Palette world: ivory `#F7F4EE`, stone `#E5E0D6`, charcoal `#2B2926`, taupe `#766E64`, olive `#6B7250`, moss `#4A5940`, amber `#A0622A` accents only. Nothing pure white, nothing pure black.
- Mood: dimly lit apothecary, perfumer's workbench, archival dossier. Imperfect, human, tactile.
- Universal negative prompt (append to every generation): `no gold, no brass as dominant material, no flowers as glamour, no black marble, no gradients, no glossy luxury advertising, no influencer aesthetics, no faces, no logos, no text, no watermark, not clean vector art, not 3D render`
- Selection criteria: would it pass in 2036? Does it feel like evidence of human presence? If it could sit in a Sephora campaign, reject it.

## Brief 01 — Torn artifact sheet (the tear-sheet base)

**Use:** background of every Wear & Share accord artifact; og-image template layer.

**Prompt:** `Top-down scan of a single sheet of heavy ivory linen paper, warm off-white #F7F4EE, all four edges torn by hand with deep irregular deckled fibres, subtle paper grain and faint pressing marks, archival quality, soft even light from upper left, photographed like a museum document scan, isolated on plain dark charcoal background`

**Specs:** 1800×2400, then cut out to transparent PNG. Deliver 3: pristine, lightly aged (one faint stain), well-handled (soft crease + stain).

## Brief 02 — Ethereal figure study (pulse-point anatomy)

**Use:** the anatomy spray indicator on artifacts and the Ritual surface. Replaces all code-drawn figures.

**Prompt:** `Loose charcoal gesture drawing of a standing human figure on ivory paper, ethereal and unfinished, flowing contour lines with smudged shading, faceless, androgynous, head and shoulders and torso suggested rather than outlined, artist's life-study sketchbook quality, broken lines, visible charcoal dust, generous negative space around neck chest and wrists`

**Specs:** 1200×2000, transparent PNG. The neck, chest and wrist zones must be clear of heavy strokes — amber pulse dots are overlaid in code. Generate front-facing and three-quarter variants.

## Brief 03 — Masking tape strips

**Use:** corner accents on tear-sheets, pinned notes, The Study cards.

**Prompt:** `Strips of aged cream masking tape torn by hand, slightly translucent, ragged ends, faint wrinkles and one lifted corner, photographed flat with soft shadow, on plain background for cutout`

**Specs:** set of 5 at varied lengths/angles, ~800px wide each, transparent PNG.

## Brief 04 — Botanical sketch pack

**Use:** marginalia illustrations across The Study, Trails, empty states.

**Prompt:** `Fine-line ink and pencil botanical studies in a perfumer's field notebook style: a sprig of lavender, a bergamot slice, a vanilla orchid, an oud wood shaving, a fig leaf, a tobacco leaf — delicate, lightly irregular, unfinished sketch quality, charcoal grey ink #2B2926 on transparent, small handwritten-style pencil hatching, no labels`

**Specs:** 6–8 individual pieces, each ~600×600, transparent PNG.

## Brief 05 — Scent strips (blotters)

**Use:** list dividers, loading vignettes, Trace cards.

**Prompt:** `Paper perfume blotter strips scattered at angles, ivory card stock, dipped ends stained faint warm amber that bleeds into the fibres, one strip slightly curled, soft workbench light, photographed for cutout`

**Specs:** set of 4, transparent PNG.

## Brief 06 — Noseprint wax seal

**Use:** app icon refinement, Archive dossier stamp, artifact authentication mark.

**Prompt:** `Macro photograph of a dark charcoal wax seal pressed into heavy ivory paper, embossed with concentric fingerprint-like ridges forming an abstract noseprint, wax has subtle sheen and imperfect pressed edges, one small drip, deep soft shadow, low warm side light`

**Specs:** 1200×1200 on paper + cutout version. One variant with a tiny amber-tinted dot inclusion at lower right of the ridge pattern.

## Brief 07 — Aged paper atmospheres (surface backgrounds)

**Use:** Cabinet/Archive backgrounds, Evening Desk texture, section headers.

**Prompt:** `Full-frame texture of aged ivory writing paper with faint foxing, a pale coffee ring in one corner, soft pencil rule lines almost erased, gentle vignette of warm shadow at the edges, flat archival scan, muted and calm, nothing in focus demands attention`

**Specs:** 2400×1600 JPG (opaque), 3 variants: ivory (morning), stone (neutral), warm amber-cast (evening).

## Brief 08 — Glass & light detail photography (Study detail depth only)

**Use:** fragrance detail pages ONLY — never listing cards (listings stay sketch-first).

**Prompt:** `Close macro of light passing through an unlabeled glass perfume bottle on a worn wooden workbench, condensation and fingerprint smudges on the glass, warm low side light casting long soft shadow, blurred paper and botanical clippings in background, quiet and intimate, film grain`

**Specs:** 1600×2000 JPG. The bottle must be generic/unlabeled — evidence of use (smudges, level of liquid dropped) is the subject, not the bottle.

## Delivery structure

```text
public/brand/assets/
  sheets/      (brief 01)
  figures/     (brief 02)
  tape/        (brief 03)
  botanicals/  (brief 04)
  strips/      (brief 05)
  seals/       (brief 06)
  papers/      (brief 07)
  glass/       (brief 08)
```

Optimize: PNG-8 where flat, WebP/AVIF companions, none >250KB after compression, all with descriptive alt text in the asset manifest (`assets.json`).
