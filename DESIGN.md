---
colors:
  surface: "#F7F4EE"              # Ivory — raw linen canvas
  on-surface: "#2B2926"           # Charcoal — authority and wet ink
  surface-variant: "#E5E0D6"      # Stone — borders, tape, quiet structure
  taupe: "#B8AC9C"                # Taupe — atmospheric + line work (2.03:1)
  taupe-ink: "#756A5C"            # Taupe ink — load-bearing TEXT (4.82:1)
  primary: "#A0622A"              # Amber — biological heat, wordmark period
  alignment: "#6B7250"            # Olive — progress, resonance, recommendation
  evolution: "#4A5940"            # Moss — transformation and identity shifts
  accent-experimental: "#B4674E"  # Terracotta — rare experimental warmth
typography:
  headline-display: "Instrument Serif Italic"
  body-sans: "Geist"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
motion:
  responsive: "200ms cubic-bezier(0.16, 1, 0.3, 1)"
  ceremonial: "480ms cubic-bezier(0.16, 1, 0.3, 1)"
  slow: "1400ms cubic-bezier(0.16, 1, 0.3, 1)"
  hold: "1200ms"
---

## 1. Overview

nota. is an intimate, emotionally aware fragrance journal and community for scent curators. It should feel like a private perfumer's archive: tactile, human, quiet, imperfect, and physically grounded.

It is **not** a generic SaaS dashboard, a sterile fragrance database, a glossy beauty marketplace, a synthetic luxury advertisement, or a gamified social feed.

Every screen must pass the **15-second test**: "I understand immediately what this is and why I want it." The user should feel this is a sanctuary, not a storefront; a diary, not a database; emotionally intelligent, not performatively luxurious.

### Governing principles

- **Human presence** — every surface shows evidence of human touch: paper grain, ink bleed, dust, tape, fingerprints, condensation, residue, physical wear.
- **Analog dissonance** — controlled irregularity may create human presence (slightly rotated labels, illustrations bleeding off an edge, imperfect tape). Optional, never mandatory. "Imperfect" must never become careless.
- **Mystery only where it adds meaning** — poetry belongs in identity, memory, and discovery. Utility stays explicit: "Settings" stays "Settings"; "Log out" stays "Log out"; cancellation stays direct.
- **Silence is a feature** — the interface does not constantly animate, notify, celebrate, or demand attention.
- **Performance is a brand attribute** — tactile effects must not make the app feel slow. Budgets in §11.

## 2. Colour rules

- **Ivory** — onboarding, reading, safety, paper surfaces
- **Charcoal** — authoritative text, identity reveals, blind ranking
- **Stone** — structure, tape, borders, quiet separation
- **Taupe** — memory, history, anatomy line work (see the two-token split below)
- **Olive** — alignment, recommendations, progress, resonance
- **Moss** — evolution, transformation, meaningful identity change
- **Terracotta** — rare experimental accent
- **Amber** — wordmark period, pulse points, biological heat, evening ambient casts

Do not use amber as a large background, standard button colour, or gamification device. Do not use pure white (`#FFFFFF`) or pure black (`#000000`).

### Measured contrast on ivory `#F7F4EE`

| Token | Ratio | AA normal | AA large | Permitted use |
|---|---|---|---|---|
| Charcoal `#2B2926` | 13.21:1 | pass | pass | any text |
| Moss `#4A5940` | 6.85:1 | pass | pass | any text |
| Olive `#6B7250` | 4.61:1 | pass | pass | any text |
| **Taupe ink `#756A5C`** | 4.82:1 | pass | pass | **all load-bearing taupe text** |
| Amber `#A0622A` | 4.47:1 | **fail** | pass | ≥24px / non-text only |
| Terracotta `#B4674E` | 3.83:1 | **fail** | pass | ≥24px / non-text only |
| Taupe `#B8AC9C` | 2.03:1 | **fail** | **fail** | line work, borders, marks — **never text** |
| Stone `#E5E0D6` | 1.20:1 | **fail** | **fail** | borders and fills only |

Taupe carries the meaning *memory and metadata*. At 2.03:1 it cannot carry text that a contributor must read — but the faintness is intentional, not a defect, so we split the role rather than discard it:

- **`taupe`** — atmospheric and decorative-adjacent only: hairlines, borders, the archive spine, marginal annotations, anatomy line work. Anything that could be deleted without losing information.
- **`taupe-ink`** — load-bearing text that must still read as memory: the observation, specimen keys, navigation labels, timestamps a contributor acts on.

`taupe-ink` is `oklch(0.5316 0.0263 75.2deg)` — **identical chroma and hue to `taupe`**, with lightness dragged down in OKLCH only. It is the same aged pigment at a deeper concentration, not a sterile gray. The 4.82:1 rather than a bare 4.53:1 leaves headroom for the 2.8% grain multiply.

The audit test: *if this element vanished, would the contributor lose information?* Yes → `taupe-ink`. No → `taupe`.

Amber's 4.47:1 is sufficient for the wordmark period and the Dot (both non-text or large), and insufficient for labels or body copy. Do not set small text in amber.

## 3. Typography

### The Vessel — Instrument Serif Italic (~10%)

Identity names, major reveals, memories, emotional copy, selected editorial headlines. Recommended tracking: `-0.01em`.

### The Instrument — Geist (~90%)

Navigation, body copy, labels, chemistry, timestamps, system feedback, forms and controls.

Do not introduce additional geometric display fonts without explicit brand review. Satoshi and Unbounded are **not** part of the core system.

## 4. Layout and spacing

Generous negative space. Separate concepts through composition before borders. 8px base spacing system. A 12-column grid may guide responsive web layouts, but mobile screens should use practical mobile columns rather than forcing a literal 12-column implementation.

Alignment must be intentional before analog dissonance is added. Never use deliberate misalignment to excuse a broken layout.

## 5. Shape system

**Structural** — sharp or nearly sharp edges for primary cards, paper sheets, panels, heavy glass surfaces. Default structural radius: `0px`.

**Organic** — rounded forms reserved for biological or fluid signals: The Dot, pulse points, small organic markers, circular indicators. Circles `9999px`; subtle organic accent `2px`.

`0px` is the structural default, not a universal rule. The glass navigation surface follows its intended organic or pill shape.

## 6. Material system

### Paper
Ivory base, subtle 2% grain, visible fibres where appropriate. No flat, pristine digital white.

### Ink and charcoal
Use `mix-blend-mode: multiply` where appropriate. Preserve dust, bleed, residue, uneven density. Never reduce readability to simulate authenticity.

### Liquid glass
Use sparingly for floating navigation or overlays.

```css
backdrop-filter: blur(20px) saturate(1.6) brightness(1.05);
```

Volumetric shadow is an aesthetic direction, not a mandated layer count. Use the smallest shadow stack that creates believable weight without harming performance or contrast.

### Global grain
Apply once as a fixed or pseudo-element compositor layer. It must not intercept pointer events, and must not sit above text in a way that reduces legibility.

## 7. The Dot

The Dot is a functional identity signal, not decoration. It represents recognition, presence, memory, confirmation, and system intelligence.

### States
1. **Idle** — static and quiet
2. **Save** — fills or settles over roughly 200ms
3. **Active** — restrained breathing pulse
4. **Alignment** — subtle olive glow when resonance is achieved

### Requirements
- Never pulse continuously without purpose
- Support reduced motion
- Remain legible at small sizes
- Use colour only when the state has meaning
- Do not use the Dot as a generic bullet, badge, or status light

## 8. Motion and temporal design

Motion communicates material consequence or emotional pacing.

**Responsive (~200ms)** — save confirmation, selection, state change, tactile settling.

**Ceremonial (480ms)** — significant moments only: The Read, identity shifts, meaningful reveals.

**Slow (1400ms)** — reserved for the materialisation of an identity: the Noseprint arriving in The Read, an Evolution shift resolving. One element, once per screen. The `1200ms` hold is a working creative direction, not an absolute rule. Do not freeze interaction unnecessarily; respect reduced motion and test whether the pause strengthens anticipation or merely delays the user.

Avoid bouncy easing, decorative entrance animations, scroll-linked ceremony, and spinners where honest progress or immediate content is possible.

## 9. Anti-slop rules

Reject any output containing the following unless deliberately justified:

- generic white cards on a coloured background
- large rounded rectangles everywhere
- gradients or neon accents
- floating phone mockups
- glossy beauty-ad rendering
- 3D vector illustrations
- arbitrary glassmorphism
- generic box shadows
- badge-heavy gamification
- infinite feed mechanics
- random typography changes
- centred symmetry by default
- decorative overlap that harms reading
- "luxury" expressed only through black, gold, and whitespace

A proposal is not approved merely because it includes paper grain, serif typography, or rotated labels. It must also solve the user's task clearly.

## 10. Asset selection tests

Every asset must pass:

- **2036 test** — does it feel durable rather than trend-bound?
- **human-presence test** — is there believable physical evidence?
- **not-Sephora test** — does it avoid polished cosmetic-ad sameness?
- **functional test** — will it support the interface rather than compete with it?

## 11. Performance guardrails

Performance is a brand attribute. Working budgets:

- no more than three glass layers per viewport
- one fixed compositor layer for global grain
- target LCP below 2.5 seconds
- no ceremonial animation on scroll-critical paths
- preserve reduced-motion support

Silence is the default state.

### Open conflict: the hold vs. LCP

The `1200ms` hold followed by `1400ms` materialisation means the Noseprint — the largest contentful element on The Read — is not visually complete until ~2.6s. The LCP budget on this page is 2.5s. **These two rules cannot both hold.**

This is not resolved by argument; it is resolved by measurement. Before treating the hold as final:

1. Confirm in the field whether the browser attributes LCP to the observation (which paints immediately) or to the Noseprint. Opacity-0 elements are not LCP candidates, so a delayed fade-in can shift the LCP element later.
2. If the Noseprint is the LCP element, either shorten the hold, or start the Noseprint at a low non-zero opacity so it paints on first frame and *resolves* rather than *appears*.
3. Instrument how many contributors tap through the pause. High skip rates mean it reads as latency, not anticipation — that is the signal to cut it, per the correction in the master guide.

Until measured, the hold ships behind the three escape hatches documented in §8.

## 12. Surface glossary (canonical names)

**Superseded 2026-07-22.** This table previously invented names (Shelf, Trails, Traces) with no route to back them. A homepage/hero build on `brand/sensory-sanctuary` exposed the real, shipped route map via failing E2E specs (`/collection` vs `/cabinet`, `/discover` vs `/study`, `/layering` vs `/lab`). **The shipped routes are the ground truth now** — this doc's job is to catch up to them, not the other way round.

| Canonical name | Route | Layer | Status |
|---|---|---|---|
| **The Read** | `/read` | identity reveal | Confirmed — route ships, matches doctrine |
| **Cabinet** | `/cabinet` | truth layer — what the user actually wears | Confirmed route. Retires "Shelf" / "The Shelf" as the UI name — use **Cabinet** in copy and code going forward |
| **Study** | `/study` | discovery / learning surface | Confirmed route. Mapping to doctrine's Profiler/Trails is **unconfirmed** — needs a repo read of `app/study` to see what it actually contains before this row is trusted |
| **Lab** | `/lab` | fragrance formulation / blending ("Layering Lab") | Confirmed route. **This is likely NOT the same surface as doctrine's "Traces"** (Traces = memories/expression; Lab = chemistry/formulation per earlier project specs). Treat as a distinct, additional surface until verified — do not silently merge it into Traces |
| Noseprint | — | behavioural scent identity | Unconfirmed against routes — verify still shipped |
| Blind Ranking | — | bias removal | Unconfirmed against routes |
| Traces | — | expression layer — memories, not descriptions | **Do not assume this is `/lab`.** Verify whether Traces exists as its own route or was never built |
| Insights | — | reflection layer | Unconfirmed against routes |
| Scentiment | — | resonance metric inside Insights | Unconfirmed |
| Temptations | — | personalised commerce | Unconfirmed |
| Aura | — | fragrance intelligence layer | Unconfirmed |
| Houses | — | belonging layer | Unconfirmed |

**Retired UI names — replace on sight:** "Shelf" / "The Shelf" → **Cabinet**. "Discover" → **Study**. "Layering" (as a UI label, not the chemistry concept) → **Lab**. `nota.lab`, `Trace Composer` remain retired regardless of route naming.

**Action required before this table can be trusted:** someone with repo access must open `app/study/page.tsx` and `app/lab/page.tsx` (or equivalent) and confirm what each surface actually does, then update the "Layer" and "Status" columns from "unconfirmed" to "confirmed." Until then, treat every unconfirmed row as a hypothesis, not a fact — this is the same mistake ("verified" vs "reviewed") flagged in `lessons.md` L5.

Naming register unchanged: short, concrete, slightly literary nouns. Never tech-y compounds (`nota.lab`, `ScentMatch`, `FragranceAI`) and never gamified labels (Streaks, XP, Badges).

Retired product names — Scentral, BaseNote, AnotherSense, ScentOI, NosePrint™, ScentBloom™, Scent Tarot™ — never appear in new user-facing work.

## 13. Definition of done

A nota. UI change is complete only when:

- the user goal is clear and the primary action is obvious
- existing tokens and components are reused
- typography follows the 90/10 Geist–Instrument Serif model
- tactile effects support, rather than obscure, content
- spacing and alignment are coherent before irregularity is introduced
- mobile, large text, keyboard, contrast, loading, empty, error, and reduced-motion states are checked
- performance budgets are respected
- the result has been compared against a generic SaaS or beauty-marketplace failure mode
- remaining assumptions and trade-offs are documented honestly
