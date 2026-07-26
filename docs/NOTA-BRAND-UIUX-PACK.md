# nota. — UI/UX Brand & Design Pack

> Canonical UI/UX reference for CLI agents (Claude Code, Codex, etc.) working on
> `scentral-hub`. This file supersedes every earlier design brief. If another
> doc disagrees with this one, this one wins — then flag the conflict.
>
> **Read this before writing any user-facing code, copy, or asset.**
> Pair with `AGENTS.md` (operating rules) and the `implementation-preflight` +
> `screen-state-completeness` skills.

---

## 0. THE DIRECTION CHANGED — read this first

**Retired positioning: "quiet luxury."** Do not design for it. If your instinct
reaches for hushed minimalism, black-and-gold restraint, empty space as
prestige, perfume-bottle-as-hero, or "understated premium" — stop. That is the
old nota. and it is wrong now.

**Current positioning: the modern, authentic fragrance chemist's workshop —
creative and hyper-personalised.**

nota. is a working perfumer's bench, not a boutique. It is lab notation, decanted
samples, hand-labelled vials, pipettes, blotter strips, ink annotations, and
evidence of experiments in progress. It is *alive and specific to you*, not
polished and universal. The feeling is "someone is formulating *me*, by hand,
right now" — not "this is expensive and tasteful."

| Axis | OLD (retired: quiet luxury) | NEW (current: chemist's workshop, hyper-personalised) |
|---|---|---|
| Metaphor | Boutique, gallery, atelier showroom | Working lab bench, perfumer's archive, formulation desk |
| Emotion | Prestige, restraint, exclusivity | Recognition, authorship, live experimentation |
| Surface | Pristine, empty, gallery-white/black | Paper with grain, ink residue, tape, worn labels |
| Colour use | Black + gold + whitespace | Ivory paper / charcoal ink + biological warmth accents |
| Personalisation | Implied, aspirational | Explicit, specific, "this is measurably *you*" |
| Ornament | Luxury signifiers (gold, marble, serif flourish) | Lab signifiers (notation, vials, botanical studies, annotations) |
| Density | Sparse = premium | Calm but *evidenced* — the bench has things on it |

**Still banned (unchanged):** perfume bottles as glamour, flowers as decoration,
gold, black marble, yachts/watches/sports cars, influencers, gradients, glossy
UI, generic SaaS, crypto/Web3/AI-startup visuals. Never look like Fragrantica,
Sephora, Reddit, TikTok, or Pinterest.

**Reference blend (new):** a perfumer's lab notebook × Aesop's material honesty ×
Apple Notes' calm utility × Letterboxd's identity-through-taste × Figma's
precision. The workshop is *authentic and a little imperfect*, never sterile.

---

## 1. What nota. is

A personal scent-identity system: discover, understand, express, and evolve your
taste through fragrance. Not a marketplace, review site, influencer platform,
perfume database, or beauty-commerce feed. **Recognition before interaction. If
it isn't personalised, it shouldn't exist.**

The name is always `nota.` — lowercase, with the dot — in every context including
sentence starts and headlines. Never "Nota", "NOTA", "Nota.", or "nota" without
the dot.

---

## 2. Colour system

Meanings are locked. The app runs **two modes** (see §3); components reference
semantic roles, never raw pigments.

### Raw pigments (the paint)

```
--pig-ivory       #F7F4EE   raw linen paper / bench surface
--pig-stone       #E5E0D6   structure, tape, quiet borders
--pig-charcoal    #2B2926   wet ink, authority
--pig-taupe       #B8AC9C   memory, history, anatomy line work
--pig-taupe-ink   #756A5C   taupe at text-safe depth (see §2.2)
--pig-olive       #6B7250   alignment, progress, resonance, recommendation
--pig-moss        #4A5940   transformation, evolution, identity shift
--pig-amber       #A0622A   biological heat — wordmark period, pulse points
--pig-amber-glow  #B98A58   amber for dark ground
--pig-ground-dark #1F1D1A   evening bench (dark mode ground)
```

Amber is biological warmth — a pulse point, a drop of oil, skin heat. Never a
gamification device, never a large fill, never a "gold" luxury signifier. Do not
use pure white `#FFFFFF` or pure black `#000000`.

### 2.2 Contrast is a hard rule (measured, both grounds)

| Role | Light (ivory) | ratio | Dark (#1F1D1A) | ratio |
|---|---|---|---|---|
| body ink `--on-surface` | charcoal | 13.2:1 | ivory | 15.3:1 |
| metadata `--ink-quiet` | taupe-ink `#756A5C` | 4.82:1 | taupe `#B8AC9C` | 7.54:1 |
| atmospheric `--ink-faint` (NON-TEXT) | taupe `#B8AC9C` | 2.03:1 | taupe@60% | — |
| alignment edge `--line-resonant` | olive | 4.61:1 | olive | 3.32:1 † |
| heat accent `--accent-heat` | amber `#A0622A` | 4.47:1 ‡ | amber-glow `#B98A58` | 5.48:1 |

† Olive on dark is AA-large only — fine for edges/glow, never body text.
‡ Amber on ivory is AA-large only — wordmark period and Dot (non-text/large)
only; never small text. Moss is never text on either ground.

**Rule:** taupe `#B8AC9C` is 2.03:1 on ivory — never set readable text in it on
light. Use `--ink-quiet` for text, `--ink-faint` for pure atmosphere. If an
element carries information, it must clear 4.5:1 against its ground.

---

## 3. Dual mode — light bench / evening bench

The Grimoire's light paper and the shipped dark app are reconciled as two modes
of the same bench, bound to the existing `data-presence-mode` attribute set by
`AmbientModeController` (values: `morning-ritual`, `evening-desk`).

- **Light (default):** ivory paper, charcoal ink. Onboarding, reading, The Read,
  daytime. This is the canonical nota. surface.
- **Dark (evening):** near-black bench `#1F1D1A`, ivory ink. Evening ambient
  mode.

Components use **semantic roles only** — `--surface`, `--surface-raised`,
`--surface-sunk`, `--on-surface`, `--ink-quiet`, `--ink-faint`, `--line`,
`--line-resonant`, `--accent-heat`, `--accent-align`, `--accent-evolve`. Only the
theme layer maps role→pigment, differently per mode. **Never reference a raw
`--pig-*` or a hex in a component.** Set `data-presence-mode` before first paint
(blocking inline script) to avoid a light-flash for evening users.

---

## 4. Typography — 90 / 10

- **The Instrument — Geist (~90%):** navigation, body, labels, chemistry,
  timestamps, forms, system feedback. Uppercase labels track `+0.15em`.
- **The Vessel — Instrument Serif Italic (~10%):** identity names, major
  reveals, memories, emotional copy. Tracking `-0.01em`. This is wet ink; use it
  sparingly, as emphasis on the moment that carries the emotion.

**Retired fonts — do not use:** Satoshi, Unbounded, Space Grotesk, Caveat,
Cormorant Garamond. If found in the codebase, migrate to Geist / Instrument
Serif. Do not add geometric display fonts (they read tech-startup and fail the
2036 test).

---

## 5. Materials — the workshop made of pixels

Every surface resolves to a physical bench material. This is where the new
direction lives.

- **Paper:** ivory base, subtle **2% grain** (one fixed compositor layer, never
  above text, never intercepting pointer events). Visible fibre where fitting.
  No flat digital white.
- **Ink & charcoal:** `mix-blend-mode: multiply` so ink sinks into the paper.
  Preserve dust, bleed, uneven density. Never sacrifice legibility for texture.
- **Lab evidence (the new layer):** hand-labelled vials, blotter strips, decant
  samples, pipettes, masking tape, ink annotations, botanical/charcoal studies,
  specimen numbers, `fig.` captions, marginal notes in a human hand. These are
  what make it a *workshop* and *hyper-personalised* — they should feel specific
  to the user (their reading, their date, their sample no.), not stock.
- **Real assets only:** botanical/charcoal illustrations come from the asset
  pipeline (`assets.json`), scanned with genuine ink bleed. **Never** code-drawn
  SVG approximations of nature — absence beats a synthetic stand-in.
- **Liquid glass:** floating nav/overlays only. Recipe:
  `backdrop-filter: blur(20px) saturate(1.6) brightness(1.05)`, wrapped in a
  small believable shadow stack. Max **3 glass layers per viewport**.

### Analog dissonance (optional, intentional)
Slight rotation of a label, an illustration bleeding off an edge, tape placed
by a human hand. Controlled irregularity signals authenticity. Never let it
break alignment, legibility, or responsiveness. "Imperfect" must never become
careless — alignment is intentional first, dissonance second.

---

## 6. Shape & layout

- **Structural radius `0px`** — cards, sheets, panels, heavy glass: cut-paper /
  glass-edge geometry. Reject bubble aesthetics.
- **Organic radius** reserved for biological signals — the Dot, pulse points,
  pills, circular markers (`9999px`; subtle accent `2px`).
- Generous negative space; separate concepts by composition before borders. 8px
  base spacing. 12-column grid guides web; mobile uses practical columns.

---

## 7. The Dot

The single most load-bearing element. A functional identity signal —
recognition, presence, memory, confirmation, system intelligence. **Never a
bullet, badge, decoration, or generic status light.** It is the only element
permitted to break the colour rules.

States: **idle** (static, quiet) · **save** (fills/settles ~200ms) · **active**
(restrained breathing pulse, purpose-bound) · **alignment** (subtle olive glow
when resonance is detected). Support reduced motion (no continuous pulse), stay
legible small, use colour only when the state carries meaning.

---

## 8. Motion — observed, not performed

Verbs: reveal, drift, morph, fade, settle, breathe. **Banned:** bounce,
overshoot, wiggle, flip, shake, spinners where honest content is possible,
scroll-linked ceremony.

```
--motion-responsive  200ms   taps, save, selection, tactile settling
--motion-ceremonial  480ms   meaningful reveals
--motion-slow       1400ms   identity materialisation (once per screen)
--motion-hold       1200ms   the held breath before an identity reveal
ease: cubic-bezier(0.16, 1, 0.3, 1)
```

Ceremony is always an **enhancement**: it must degrade to a fully readable
screen if JS fails, and end immediately on any deliberate input. Always honour
`prefers-reduced-motion` (arrive, don't perform). **Silence is the default
state.**

---

## 9. Voice

Observational second person, present tense. Short sentences that land and stop.
The product notices; it never announces. Inference over instruction, warmth over
enthusiasm. No exclamation marks, no corporate padding, no hype.

- Save: **"Noted."** (not "Success! Added! 🎉")
- Recommendation: **"You've been close to this. Cedar again — but drier."**
- Re-engagement: **"Your shelf hasn't moved in a while. Worth a look."**
- Headline: **"You already smell like someone. Find out who."**
- The product misread you: **"The Read missed. That's on us — it learns from
  this."**

Utility stays plain — "Settings", "Log out", cancellation stay literal. Mystery
only where it adds meaning.

---

## 10. Surface glossary — reconciled to shipped routes (2026-07-22)

**This section previously invented names with no route behind them.** The
homepage/hero build on `brand/sensory-sanctuary` surfaced the real route map via
failing E2E specs. Shipped routes now win over doctrine names:

| Confirmed route | UI name | Notes |
|---|---|---|
| `/read` | **The Read** | matches doctrine, no change |
| `/cabinet` | **Cabinet** | retires "Shelf" / "The Shelf" — use Cabinet everywhere |
| `/study` | **Study** | retires "Discover"; contents vs. Profiler/Trails **unconfirmed**, verify against `app/study` before assuming |
| `/lab` | **Lab** | retires "Layering" as a UI label; likely a distinct formulation/chemistry surface, **not** the same thing as Traces — do not merge |

Everything below is **unconfirmed against the live route map** — treat as
hypothesis, verify against the repo before use in copy or code: Noseprint,
Blind Ranking, Traces, Trails, Insights, Scentiment, Temptations, Aura, Houses,
Mood Canvas, Today's Arc.

**Retired — never ship:** Scentral, BaseNote, AnotherSense, ScentOI, NosePrint™,
ScentBloom™, Scent Tarot™, nota.lab, Trace Composer, and the UI labels "Shelf"
and "Discover" (routes renamed to Cabinet/Study). Feature names are short,
concrete, slightly literary nouns — never tech compounds (ScentMatch,
FragranceAI) or gamified labels (Streaks, XP, Badges).

---

## 11. Experience doctrine

Recognition before interaction · Expression before analytics · Understanding
before commerce · Evolution before gamification · Personalisation before
everything.

**War on cognitive load:** every question costs trust; if behaviour can answer,
don't ask (observe → infer → reflect); one decision per screen; ≤3 actions per
screen; no dead ends; never punish honesty.

**Emotion map (each surface has ONE target feeling):** Home = belonging · The
Read = recognition · Shelf = ownership · Trails = curiosity · Traces =
expression · Market = discovery · Insights = reflection · Evolution =
transformation. Elements serving a different emotion move to their own surface.

**Commerce (Temptations):** rare, subtle, never urgency ("only 2 left" is
banned), never inside Traces/Trails, always offers "maybe later". Tone: "Oh no.
This again."

---

## 12. Every screen must be complete

Not done at the happy path. A surface ships only with its full state matrix —
**loading · empty · error · success · the trust/recovery state · partial/thin** —
plus accessibility: keyboard, visible focus, `aria-live` for async reveals,
reduced motion, large text.

Build the **emotion-carrying element first** (e.g. The Read's reaction loop:
✅ That feels like me / 😅 Close / ❌ Not quite — where "Not quite" regenerates
calmly and never argues). Theatre never substitutes for it. Empty states are
invitations, not voids ("Room to be wrong."). Errors own the failure and offer
the next step, never blame the user.

---

## 13. Performance is a brand attribute

≤3 glass layers per viewport · one fixed grain layer · LCP < 2.5s · no
ceremonial animation on scroll-critical paths · always support reduced motion.
If a ceremonial hold pushes the identity past the LCP budget, start it at low
non-zero opacity so it *resolves* rather than *appears*, or shorten it — and
instrument the skip rate.

---

## 14. Anti-slop checklist (reject unless justified)

Generic white cards on colour · rounded rectangles everywhere · gradients or
neon · floating phone mockups · glossy beauty-ad rendering · 3D vector art ·
arbitrary glassmorphism · generic box shadows · badge gamification · infinite
feeds · random typography changes · centred symmetry by default · decorative
overlap that harms reading · "luxury" via black + gold + whitespace (the retired
direction). Paper grain and a serif do not make a proposal on-brand — it must
also solve the user's task and feel like *the workshop*, specific to this user.

---

## 15. The two tests (apply to everything)

1. **2036 test:** would this still feel right in 2036? Reject trend-chasing and
   clever-for-clever's-sake.
2. **Final test:** if it disappeared tomorrow, would users miss the utility or
   the *feeling*? Utility-only = a feature. Feeling = nota. The goal is not to
   help people find fragrance — it is to help people find *themselves* through
   fragrance.
