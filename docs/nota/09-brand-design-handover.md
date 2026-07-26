# nota. Brand Design Handover

**Date:** 2026-07-09  
**Status:** Active source of truth for brand, sensory direction, and experience language  
**Audience:** Claude Code, Codex, design agents, frontend engineers, creative collaborators  
**Use this for:** Rebuilding, extending, or reviewing any nota. surface so it remains in the same emotional universe

---

## 1. What nota. Is

`nota.` is not a SaaS dashboard, utility app, or generic fragrance catalogue.

It is:
- an editorial sanctuary
- an alchemical laboratory
- a living scrapbook
- a leather-bound scent journal
- a personal intelligence layer for fragrance curators

If a screen feels mechanical, perfectly symmetrical, sterile, over-instructive, or “default product UI”, it fails.

The correct feeling is:
- dimly lit apothecary
- perfumer’s workbench
- archival dossier
- handwritten field notes
- tactile materials with memory

---

## 2. Non-Negotiables

These rules are locked.

### Naming
- Always write the brand as `nota.` with the period, always lowercase.
- Never refer to the audience as `users` in contributor-facing copy.
- Preferred nouns: `contributor`, `curator`, `dossier`, `trace`, `tear-sheet`, `archive`, `cabinet`, `study`, `ritual`, `workbench`.

### Visual rules
- No pure white `#FFFFFF`.
- No pure black `#000000`.
- No default “card grid on white background” layouts.
- No generic spinners as core emotional moments.
- No bouncy motion.
- No flat boxes without atmosphere.

### Brand renames
- `Discover` → `The Study`
- `Collection` → `The Cabinet`
- `You` → `The Archive`
- `Layering` → `nota.Lab`
- `Spritz` → `Ritual`

### Route plan
- `/discover` → `/study`
- `/collection` → `/cabinet`
- `/you` → `/archive`
- `/layering` → `/lab`
- `/spritz` → `/ritual`

Legacy routes may exist for compatibility, but canonical language and navigation must use branded names.

---

## 3. Brand World

### Editorial point of view
nota. should feel like:
- a perfumer’s notebook
- a cut-and-paste mood board
- a cabinet of bottles with private history
- intelligence written by someone observant, not algorithmic

### Emotional register
The product is:
- intimate
- observant
- calm
- ceremonial
- human
- slightly mysterious

The product is not:
- loud
- salesy
- gamified in a childish way
- over-optimised
- glossy-luxury in a cold fashion-editorial sense

### Copy point of view
Write like:
- marginalia
- private recommendations from a trusted perfumer
- short observational notes
- tactile and sensory language

Avoid:
- dashboard language
- empty optimisation jargon
- “manage”, “configure”, “settings”, “workflow”, “engagement”
- overexplaining simple moments

---

## 4. Material System

These tokens are locked and should be treated as the physical laws of the universe.

### Core palette
- `--ivory: #F7F4EE`
- `--stone: #E5E0D6`
- `--charcoal: #2B2926`
- `--olive: #6B7250`
- `--moss: #4A5940`
- `--taupe: #766E64`

### Material behavior
- Surfaces should feel like heavy paper, glass, linen, wood, or tracing paper.
- Add global 2% SVG noise / linen grain.
- Use blur sparingly as “adaptive liquid glass”, not as a generic frosted-glass trend effect.
- Shadows should feel volumetric and atmospheric, not card-elevation boilerplate.
- Patina should imply time, ownership, and memory.

### Surface types
- `ivory / stone`: safe onboarding, archive paper, editorial reading surfaces
- `charcoal`: authority, focus, identity reveal, The Read climax
- `olive / moss`: alignment, evolution, successful resonance, quiet intelligence
- `taupe`: history, age, memory, soft metadata

---

## 5. Typography

### Type system
- `--font-display`: Instrument Serif Italic
- `--font-ui`: Unbounded or Satoshi

### Usage rules
- Instrument Serif Italic is for:
  - emotional copy
  - scent identities
  - hero headlines
  - reveal moments
  - narrative fragments
- Unbounded or Satoshi is for:
  - labels
  - controls
  - metadata
  - timestamps
  - chemistry logic
  - route labels

### Typographic behavior
- Use high contrast in scale, not just weight.
- Let headlines breathe.
- Use uppercase UI labels sparingly, with tracking.
- Avoid dense text blocks.
- Avoid default sans body + bold heading patterns that feel template-driven.

### Handwritten layer
- Marginal notes, annotations, and private cues should feel handwritten or sketchbook-like.
- Handwritten accents should be used as editorial punctuation, not everywhere.

---

## 6. Imagery POV

### Imagery direction
The visual world should reference:
- perfumery workrooms
- pinned references
- stained paper
- scent strips
- sketched botanicals
- tracing-paper overlays
- cabinet shelves
- glass bottles catching low light

### Good imagery qualities
- imperfect
- human
- tactile
- archival
- intimate
- atmospheric

### Avoid
- generic AI beauty shots
- luxury ecommerce flat-lays
- over-airbrushed product renders
- neon cyberpunk fragrance tropes
- glossy stock imagery

### Asset motifs to repeat
- notebook margins
- torn edges
- stamps
- botanical sketches
- pencil arrows
- scent trail marks
- shelf labels
- tiny private annotations tied to curator identity

---

## 7. Iconography

### Icon style
- Fine line, ink-like, lightly irregular
- Should feel sketched or etched, not system-default
- Less “app icon set”, more “studio notation system”

### Avoid
- chunky generic tab icons
- cartoon luxury icons
- overfilled rounded icons that feel fintech or productivity-app-like

### Preferred subjects
- bottle silhouettes
- paper slips
- shelves
- scent arcs
- dossier marks
- alignment dots
- pulse-point markers

---

## 8. Motion and Idle Behavior

### Motion philosophy
Motion should feel like:
- breath
- wet ink settling
- a card being placed down
- a surface gently revealing itself

Motion should not feel like:
- springy
- game-like
- flashy
- eager

### Timing
- Use named non-linear timing tokens.
- `--motion-ceremonial`: 480ms to 2000ms
- Reveal motion should use slow easing such as `cubic-bezier(0.16, 1, 0.3, 1)`.

### Idle animations
Allowed:
- subtle grain drift
- quiet glow breathing on alignment states
- slow opacity shifts
- tiny staggered reveals
- hovering paper/parchment atmosphere

Avoid:
- looping gimmicks
- floating widgets
- parallax for its own sake
- microinteractions that draw attention constantly

### Critical ritual motion
The Read sequence must include:
- 2.4s pre-reveal breath
- charcoal descent
- strict 1200ms hold
- slow dossier materialisation
- haptic reveal lock

This is a ceremonial climax, not onboarding UI.

---

## 9. Sensory Design

### Haptics
The shared semantic model is:
- `reveal`
- `alignment`
- `drag`
- `destroy`
- `clink`

Mapped intent:
- `reveal`: heavy ceremonial confirmation
- `alignment`: quiet positive lock
- `drag`: low-intensity wobble / object weight
- `destroy`: heavy impact
- `clink`: heavy glass contact in nota.Lab

### Acoustic direction
Audio should be:
- faint
- muffled
- analogue
- material-aware

Examples:
- heavy glass tap
- bottle clink
- paper contact
- quiet room-tone style confirmation

Avoid:
- digital bleeps
- synthetic UI chirps
- casino-style reward sounds

### Music / soundscape POV
If music is ever used in brand films, trailers, or ritual moments, it should feel like:
- ambient analogue textures
- intimate chamber minimalism
- low piano, bowed textures, tape warmth
- quiet ceremonial rhythm

Avoid:
- EDM
- glossy luxury-ad beats
- over-dramatic cinematic trailer music

---

## 10. Emotional Modes

nota. should respond to time and emotional context.

### Morning Ritual
- cooler ivory
- slightly brighter contrast
- cleaner typography
- faster but still restrained motion
- more forward energy

### Evening Desk
- warmer amber / charcoal cast
- slower transitions
- fewer simultaneous choices
- softer contrast
- exact social counts suppressed
- more reflective atmosphere

### Social suppression rule
In Evening Desk:
- hide exact likes
- hide exact saves
- hide exact traces counts
- prefer phrases like:
  - `quietly circulating`
  - `recently pinned`
  - `saved into your journal`

---

## 11. Copy System

Every primary surface should have 3 layers:
- section title
- one handwritten note or marginalia line
- one contextual helper cue / tip / presence cue

### Example pattern
- Title: `The Study`
- Marginal note: `Start where your nose lingers, not where the algorithm points.`
- Helper cue: `Fresh citrus, dry woods, and skin-close musks are surfacing around your archive this week.`

### Copy rules
- Short
- Observational
- Human
- Slightly poetic
- Specific

Avoid:
- generic placeholder lines
- “discover new fragrances”
- “manage your collection”
- “view analytics”
- “continue”

Prefer:
- `Enter The Study`
- `Open The Cabinet`
- `Continue the read`
- `Pin to Wear & Share`
- `Take this to nota.Lab`

---

## 12. Core Journey Language

### Welcome / Read
- Tone: ceremonial, intimate, exacting
- Feeling: “someone has seen me”

### The Study
- Tone: editorial exploration
- Feeling: annotated library + scent atlas

### The Cabinet
- Tone: physical ownership, patina, arrangement
- Feeling: private bottle room

### The Archive
- Tone: dossier, memory, accumulation
- Feeling: life story told through scent

### Ritual
- Tone: bodily rhythm, pulse points, wearing moments
- Feeling: daily private ceremony

### nota.Lab
- Tone: workbench, chemistry, experiment
- Feeling: heavy bottles on paper under warm light

### Wear & Share
- Tone: communal scrapbook
- Feeling: pinned traces and torn pages, not social feed mechanics

---

## 13. The Read Ritual Specification

This is the single most important emotional sequence in the product.

### Sequence
1. Pre-reveal breath
   - 2.4 seconds
   - animated arc from 0 to 100
   - line: `Reading your scent signature...`

2. Charcoal descent
   - viewport crosses fully into `--charcoal`
   - opening observational line appears
   - strict 1200ms hold
   - no competing UI

3. Dossier reveal
   - identity title in Instrument Serif
   - 3 behavioral signals
   - 3 starter matches
   - 1 stretch note

4. Alignment
   - reveal haptic at typography lock
   - response options:
     - `That feels like me`
     - `Close`
     - `Not quite`

### Acceptance standard
If it feels like a signup flow, it is wrong.

---

## 14. Personalisation Layer

Every touchpoint should be capable of quietly nodding to the curator.

### Sources of personalisation
- scent identity
- current archive composition
- recently worn fragrances
- streak / ritual history
- saved traces
- dominant families
- untouched cabinet items

### Personalised details can appear as
- handwritten notes
- subtle helper text
- route intros
- reorder suggestions
- cabinet annotations
- ritual prompts
- starter recommendations in The Study

### Good example
`You keep circling dry woods and candlelit amber. Start on the left rail today.`

---

## 15. Implementation Rules for Agents

When another CLI agent works on nota., it should follow these rules:

### Do
- preserve the existing material system
- use canonical branded route names
- extend the copy registry instead of inventing random labels
- add marginalia and helper cues to new core surfaces
- prefer tactile, editorial language
- route legacy paths through redirects, not silent duplication
- keep the repo / DB / internal legacy identifiers unchanged unless explicitly approved

### Do not
- revert to generic tab, card, or dashboard language
- introduce pure white or pure black
- add generic loading spinners to emotional moments
- use `user` in contributor-facing product copy
- collapse everything into a minimal monochrome luxury aesthetic
- treat the brand shift as “hero section only”

---

## 16. Current Technical Anchors

These files currently encode much of the active brand direction:

- `app/globals.css`
- `lib/design/tokens.css`
- `lib/experience.ts`
- `lib/rebrand.ts`
- `app/components/BottomNav.tsx`
- `app/components/PageTracker.tsx`
- `app/hooks/useSymphonicSensory.ts`
- `app/welcome/WelcomeClient.tsx`
- `app/read/ReadClient.tsx`
- `app/(main)/study/*`
- `app/(main)/cabinet/*`
- `app/(main)/archive/*`
- `app/(main)/lab/*`
- `app/(main)/ritual/*`
- `proxy.ts`

If a future agent changes the brand and does not touch these systems thoughtfully, the product will drift.

---

## 17. Exact Transfer Brief for Another CLI Agent

Use the block below as the direct brand instruction set for Claude or another coding agent.

```md
You are working on nota. This is not a generic software app. It is an editorial sanctuary, an alchemical laboratory, and a tactile scent journal for contributors and curators.

Non-negotiables:
- Always write the brand as `nota.`
- Never use `user` in contributor-facing copy
- No pure white `#FFFFFF`
- No pure black `#000000`
- No SaaS dashboard language
- No generic loading spinners for emotional moments

Canonical names:
- The Study (`/study`)
- The Cabinet (`/cabinet`)
- The Archive (`/archive`)
- nota.Lab (`/lab`)
- Ritual (`/ritual`)

Material system:
- `--ivory: #F7F4EE`
- `--stone: #E5E0D6`
- `--charcoal: #2B2926`
- `--olive: #6B7250`
- `--moss: #4A5940`
- `--taupe: #766E64`
- global 2% SVG linen grain

Typography:
- Instrument Serif Italic for identity, narrative, reveal, emotional copy
- Unbounded or Satoshi for UI, metadata, chemistry, labels

Experience rules:
- Every core screen needs a title, one handwritten/marginal note, and one contextual helper cue
- Motion should feel like breath and wet ink, not springs or bounce
- The Read sequence is ceremonial and must not feel like onboarding SaaS
- The Cabinet should feel like a physical arrangement surface with patina
- The Study should feel like an annotated atlas, not a search page
- Ritual should feel bodily and intimate
- nota.Lab should feel like a perfumer's workbench
- Wear & Share should feel like a communal scrapbook, not a feed

Copy style:
- observational
- tactile
- personal
- slightly poetic
- never sterile

If a component feels mechanical, symmetrical, emotionally detached, or product-template-like, rewrite it.
```

---

## 18. How to Judge Whether Work Is On-Brand

Ask:
- Does this feel tactile?
- Does this feel emotionally aware?
- Does this feel specific to fragrance and memory?
- Could this belong in any random wellness, beauty, or productivity app?
- Is there enough editorial personality?
- Is the surface merely styled, or actually re-authored?

If the answer to “could this belong anywhere?” is yes, it is not finished.

---

## 19. Recommended Next Design Passes

1. Community routes
   - unify Wear & Share, social, and trace surfaces under scrapbook language
2. Secondary route families
   - boxes, notes, wheel, intelligence, compare, clones
3. Illustration system
   - handwritten marks, scent strips, shelving motifs, botanical sketch pack
4. Sound and haptic contract
   - shared semantic spec for web fallback and native delivery
5. Artifact system
   - tear-sheet exports, stamps, saved trace relationships

---

## 20. Final Principle

Do not “apply a skin” to nota.

Rebuild each surface as if it belongs to the same physical world:
- same paper
- same perfumer
- same archive
- same private handwriting
- same emotional intelligence

That continuity is the brand.
