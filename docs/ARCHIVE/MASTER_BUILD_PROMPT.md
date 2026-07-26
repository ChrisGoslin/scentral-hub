# BaseNote — Master Build Prompt
### Single source of truth for all Claude Code sessions
### Version 3.0 — Complete merged edition
### Generated: 2026-06-27

**This file replaces:**
- `CLAUDE_CODE_PROMPTS.md` (original 18 prompts)
- `FEATURE_PROMPTS.md` (18 feature prompts)
- Previous `MASTER_BUILD_PROMPT.md` (competitive gaps only)

---

## HOW TO USE

1. Paste the **SESSION START BLOCK** at the top of every Claude Code session
2. Paste one prompt per session — the number in the execution table tells you which is next
3. Commit and deploy after each prompt before starting the next
4. Never batch multiple prompts in one session

---

## ═══════════════════════════════════════
## SESSION START BLOCK
## (paste at the top of EVERY Claude Code session)
## ═══════════════════════════════════════

```
# BaseNote — Session Start
# Repo: scentral-hub | DB: scentral-mvp | Display: BaseNote (display-layer only)

## Ground yourself in this order — no code until all four are read:
1. cat AGENTS.md
2. cat BASENOTE_BRAND.md
3. cat COMPETITIVE_INTELLIGENCE.md
4. cat PERSONAS_AI.md

## Session start checklist (AGENTS.md §3)
- npm run test:smoke:prod
- git config --get core.hooksPath → must print .husky
- git log --oneline -5

## The brand throughline — apply to every pixel:
"You already have a scent identity. BaseNote finds it."

## Our three moats vs WhatScent (launched June 2026):
1. No auth — frictionless from first tap. WhatScent requires signup.
2. Inspired By as landing page hero — they bury it. We lead with it.
3. Persona identity system — they have taste profiles. We have identities.

## What we must close vs competitors this sprint:
- Per-fragrance Fit signal (WhatScent Perfume Fit score)
- Wear log note/memory field (Aromoshelf, WhatScent diary)
- Community depth — also-own co-collection, wear counts

## Design constraints — no exceptions:
- CSS variables only. NO hardcoded hex.
- Cormorant Garamond Italic: one emotional moment per screen
- Parfumeur's Gold var(--accent) #B8913A: ALL interactive elements, one colour
- Motion tokens: --motion-instant (80ms), --motion-responsive (200ms),
  --motion-ceremonial (480ms), --motion-organic (800ms)
- DB projection values ONLY: Beast Mode, Strong, Moderate, Medium, Weak
- localStorage keys NEVER renamed: scentral_anon_id, scentral_persona,
  scentral_wishlist, scentral_collection, scentral_discover_sort,
  scentral_discover_vibe, scentral_brief_tutorialSeen
- cabinetSnapshot CustomEvent in WardrobeShelf.tsx — NEVER REMOVE
- createClient() inside handler functions ONLY — never at module level
- npm run build before every push. Never let Vercel be the first check.

## Persona engine: lib/personas.ts — 6 identities
velvet_intellectual, solar_minimalist, dark_alchemist,
ritual_keeper, rebel_experimentalist, comfort_seeker
Import getPersonaById or PERSONAS — never inline persona data.

## After every task:
npm run build → zero errors → git commit -m "[message]" → npx vercel --prod
```

---

## ═══════════════════════════════════════
## MARLOWE'S MANDATE
## (the creative brief that governs all prompts below)
## ═══════════════════════════════════════

*From Marlowe, Studio Marlowe — written after competitive intelligence review:*

WhatScent launched June 2026. They have mechanics but no throughline. "Spotify of perfume" is a borrowed metaphor. "You already have a scent identity. BaseNote finds it." is original. That is the differentiator and it must be visible in every feature.

**Three rules for this build:**

1. Every feature must say something about the user, not just about the fragrance. A fit chip is a score. A fit narrative is a mirror. We build mirrors.

2. The Inspired By engine is our unfair advantage. Make it visible everywhere — on cards, on detail pages, in the rarity index, in the gift card. Every feature should have an Inspired By moment.

3. The Strip must not be empty on launch. The wear log note field seeds it. Ship the note field before the Strip.

The moat is not any one feature. It is the compounding of persona identity + wear history + community. WhatScent can copy a feature in 6 weeks. They cannot copy 18 months of a user's relationship with their own nose.

---

## ═══════════════════════════════════════
## COMPLETE EXECUTION ORDER
## ═══════════════════════════════════════

| # | ID | Name | Sprint | Why this position |
|---|---|---|---|---|
| 1 | F1 | CSS Token Fix + Cormorant | Foundation | Blocks everything visual |
| 2 | F2 | Accent Unification | Foundation | One colour before new UI |
| 3 | F3 | Discover Grid + Gradient Cards | Foundation | Biggest visible fix |
| 4 | F4 | Nav Order + Identity Rename | Foundation | UX baseline |
| 5 | F5 | Saved Chip Fix | Foundation | Filter clarity |
| 6 | G2 | Wear Log Note Field | Gap | Seeds The Strip — ship before Strip |
| 7 | G1 | Per-Fragrance Fit Narrative | Gap | Closes WhatScent gap |
| 8 | G3 | Bottle Scanner MVP | Gap | Closes Parfumo/Scentra gap |
| 9 | A2 | Rarity Index + Inspired By Bridge | Sprint A | Dark Alchemist/Rebel retention |
| 10 | D2 | Persona-Conditional Copy | Sprint A | Zero features, huge felt difference |
| 11 | A1 | Occasion Quick Pick | Sprint A | Solar Minimalist daily driver |
| 12 | A3 | Gift This | Sprint A | Viral acquisition |
| 13 | A4 | Unusual Suspects | Sprint A | Rebel/Alchemist moat deepener |
| 14 | A5 | Signature Finder | Sprint A | Comfort Seeker onboarding |
| 15 | L1 | Landing Hero | Sprint L | Brand presence |
| 16 | L2 | Inspired By Section | Sprint L | Lead with the advantage |
| 17 | L3 | Persona Cards Redesign | Sprint L | Editorial identity |
| 18 | P1 | Onboarding Reveal | Sprint P | The marketing budget moment |
| 19 | P2 | Brief Swipe Affordance | Sprint P | Gesture discoverability |
| 20 | P3 | Identity Tab Upgrade | Sprint P | No-auth identity state |
| 21 | C1 | Scent DNA Surface | Sprint C | Promote buried feature |
| 22 | C2 | Scent DNA Full Overlay | Sprint C | Nadia's post-worthy moment |
| 23 | C3 | Inspired By Language Sweep | Sprint C | Kill clone/dupe everywhere |
| 24 | B2 | Coherence Score + Missing Note | Sprint B | Velvet Intellectual depth |
| 25 | B1 | Ritual Calendar | Sprint B | Ritual Keeper retention |
| 26 | B3 | Formula Card + QR | Sprint B | Rebel shareable |
| 27 | B4 | Identity Tab Full Upgrade | Sprint B | Pulls everything together |
| 28 | S1 | The Strip Post Format | Strip | Score-line post format |
| 29 | D3 | Community Tab + Also Own | Community | Viktor's worst nightmare |
| 30 | D4 | Scent Identity Score + Drift | Capstone | Needs collection data |
| 31 | X1 | The Nose Report | Polish | Monthly identity digest |
| 32 | X2 | Inspired By Value Counter | Polish | Landing social proof |
| 33 | X3 | Affinity Score Explainer | Polish | Shelf legibility |
| 34 | Z1 | BaseNote Name Sweep | Cleanup | Kill AnotherSense everywhere |
| 35 | Z2 | AdSlot Fallback | Cleanup | No blank rectangles |
| 36 | Z3 | Streak Day-1 Toast | Cleanup | Day-1 encouragement |
| 37 | Z4 | Context-Aware Back Link | Cleanup | Layering UX fix |

---

## ═══════════════════════════════════════
## SPRINT: FOUNDATION
## ═══════════════════════════════════════

### F1 — CSS Token Fix + Cormorant Garamond
**Blocks everything visual. Run this first.**

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line on what you read and what you're fixing.

PROBLEM:
app/layout.tsx imports globals.css THEN lib/design/tokens.css.
tokens.css loads after so its values WIN and override globals.css.
Current bugs:
  - tokens.css sets --font-display: var(--font-fraunces) → wrong font everywhere
  - tokens.css sets --r-card: 0px → no border radius anywhere
  - Dead AnotherSense tokens polluting the file: --aura, --aura-surface, --aura-border, --xp-color

FIX lib/design/tokens.css:
1. Change: --font-display: var(--font-fraunces, ...) → --font-display: var(--font-cormorant, "Cormorant Garamond", Georgia, serif)
2. Change: --r-card: 0px → --r-card: 12px
3. Remove entirely: --aura, --aura-surface, --aura-border, --xp-color, any --font-fraunces reference
4. Remove comment: "/* AnotherSense — Aura Design Language */" → "/* BaseNote — Design Language */"

FIX app/layout.tsx:
Replace Instrument_Serif import with Cormorant_Garamond:
  import { Cormorant_Garamond, Unbounded } from 'next/font/google'
  const cormorantGaramond = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '600'],
    style: ['normal', 'italic'],
    variable: '--font-cormorant',
    display: 'swap',
  })
Remove instrumentSerif const and its variable. Add cormorantGaramond.variable to html className.

FIX app/globals.css:
Change: --font-display: var(--font-instrument-serif) → --font-display: var(--font-cormorant)

VERIFY:
grep -r "font-fraunces\|font-instrument-serif\|--aura\b\|--xp-color" lib/design/tokens.css → must return empty
npm run build → zero errors

git commit -m "fix(tokens): resolve CSS cascade conflict — Cormorant Garamond + 12px r-card, remove dead tokens"
```

---

### F2 — Accent Unification to Parfumeur's Gold

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

PROBLEM: Competing accent colours across the app.
- globals.css light: --color-primary: #A0622A
- globals.css dark: --color-primary: #D4884A
- tokens.css: --family-oriental-start: #c49a3c
- lib/personas.ts: 6 different persona accentColors used in interactive elements
These create competing warm tones — "four competing warm tones is not a brand" (Marlowe).

FIX app/globals.css:
- :root → --color-primary: #B8913A
- [data-theme="dark"] → --color-primary: #B8913A (same gold in both modes — consistent)

FIX lib/design/tokens.css:
- Remove --burgundy and --burgundy-press (no burgundy in new palette)
- In [data-theme="dark"]: update --accent-press to #9A7A2E

FIX all components that read persona.ui_theme.accentColor for interactive elements:
Persona accentColor is permitted ONLY for:
  - Persona card background tints (bgGradient, cardBg)
  - Persona name text colour on onboarding reveal
NOT for: buttons, chips, links, icons, progress bars, badges
Replace those usages with var(--accent).

Search for hardcoded hex in app/ and components/:
grep -r "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.tsx"
Replace any hardcoded brand colour with its CSS variable. Flag one-off hex with a comment.

VERIFY:
Visual: one gold (#B8913A) accent across the entire app, no competing colours.
npm run build → zero errors.

git commit -m "fix(design): unify accent to Parfumeur's Gold #B8913A — persona accentColor scoped to card backgrounds only"
```

---

### F3 — Discover Grid + Gradient Fallback Cards

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK 1 — Grid fix in app/(main)/discover/DiscoverGrid.tsx (or DiscoverClient.tsx):
Change grid to 2 columns on mobile, 3 on tablet, 4 on desktop:
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 12,
  padding: '0 12px',
Breakpoints via CSS media query or isMobile hook (AGENTS.md L7, threshold < 480 for phone, < 768 tablet).
Card min-height: 220px on mobile.

TASK 2 — Gradient fallback cards when image_url is null or fails:
Check if lib/familyGradients.ts exists. If yes, use it. If not, create the mapping inline:

const FAMILY_GRADIENTS: Record<string, [string, string]> = {
  'Woody': ['#2C1A11', '#5C3D2E'],
  'Woody Oriental': ['#1A0800', '#4A2200'],
  'Oriental': ['#1A0A00', '#4A2000'],
  'Oud': ['#0D0500', '#3A1500'],
  'Floral': ['#1A0A12', '#4A1A2A'],
  'Soft Floral': ['#150A10', '#3A1525'],
  'Citrus': ['#0A1A00', '#2A4A00'],
  'Aquatic': ['#001A2A', '#003A5A'],
  'Fresh': ['#001A1A', '#003A3A'],
  'Fresh Spicy': ['#001510', '#003530'],
  'Gourmand': ['#1A0A05', '#4A2A10'],
  'Amber': ['#1A0F00', '#4A3000'],
  'Warm Woody': ['#1A0D05', '#3A2010'],
  'Leather': ['#0A0A00', '#2A2A00'],
  'Tobacco': ['#120800', '#352000'],
  'Chypre': ['#0A1A0A', '#1A3A1A'],
  'Aromatic': ['#0A0A1A', '#1A1A3A'],
  'Herbal': ['#051505', '#103010'],
  'Smoky': ['#0A0A0A', '#252525'],
  'Resinous': ['#100800', '#302200'],
  'Incense': ['#0D0A00', '#2A2000'],
  'Green': ['#001A00', '#003A00'],
  'default': ['#1A1208', '#2A2015'],
}

Fallback card layout:
- Background: linear-gradient from family pair
- Brand: 9px, uppercase, letter-spacing 0.12em, top-left, rgba(255,255,255,0.45)
- Fragrance name: Cormorant Garamond italic, 16px, white, vertically centred
- Faint score line above name: border-top 1px solid rgba(255,255,255,0.15) — the blotter mark
- Family chip: 8px mono, bottom-left, Vetiver Grey rgba
- Rating: bottom-right, gold

When image IS available: background-image with onError fallback to gradient state.

npm run build → zero errors.
git commit -m "fix(discover): 2-column grid + gradient fallback cards by family, score line mark"
```

---

### F4 — Nav Order + Identity Tab Rename

```
Read AGENTS.md.

Ground yourself: one line.

In app/components/BottomNav.tsx (or wherever the bottom nav renders):

Change nav order to: Discover → Wardrobe → Lab → Brief → Identity

Display label changes ONLY (do NOT change href or route paths):
  - "Spritz" label → "Brief" (route stays /spritz)
  - "You" label → "Identity" (route stays /you)

Do not touch any other nav logic, icons, or active states.

npm run build → zero errors.
git commit -m "fix(nav): Discover first, Spritz→Brief, You→Identity display labels only"
```

---

### F5 — Saved Chip Fix in DiscoverFilters

```
Read AGENTS.md.

Ground yourself: one line.

In app/(main)/discover/DiscoverFilters.tsx:
The "❤ Saved" chip is rendered in its own block between filter carousels.
Move it to be a standalone row immediately after the search bar, before the Vibe carousel.
It should be the first filter a user encounters — it's their collection, not an afterthought.

Label: keep "❤ Saved"
Position: own full-width row, directly below search input

npm run build → zero errors.
git commit -m "fix(filters): Saved chip promoted above filter carousels"
```

---

## ═══════════════════════════════════════
## SPRINT: COMPETITIVE GAPS
## (Close the WhatScent/Parfumo gaps — but go 3x past parity)
## ═══════════════════════════════════════

### G2 — Wear Log Note Field: "What does it remind you of?"
**Ship before The Strip (S1) — this seeds it.**

*Marlowe: "WhatScent has 'mood'. Aromoshelf has 'impression'. We have a question — and the question is the brand. 'What does it remind you of?' is what The Knowing Friend asks. No other app asks it like this."*

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md.

Ground yourself: one line.

CONTEXT:
- wear_logs already has a 'notes' column but requires user_id + collection_id (auth foreign keys)
- Spritz uses scentral_anon_id (localStorage UUID) — not a Supabase auth user
- DO NOT write notes to wear_logs. DO NOT run any DB migration.
- All notes are localStorage-only for MVP. Post-auth migration is a future task.
- // TODO post-auth: persist to wear_logs.notes with user_id + collection_id

TASK: Add a memory capture field to the Spritz swipe-right flow. This:
- Closes the WhatScent diary gap
- Seeds The Strip before it launches
- Makes BaseNote the only app that builds a private memory record of the user's relationship with scent

STEP 1 — Bottom sheet after swipe-right in app/(main)/spritz/SpritzClient.tsx:
After the wear log fires, slide up a bottom sheet:
  - Height: 40vh max, slides up 200ms ease-out
  - Background: var(--surface), border-radius 20px 20px 0 0
  - Gold score line at very top: 2px, full width, var(--accent)
  - Heading (Cormorant italic, 18px): "What does it remind you of?"
  - Subtext (10px, var(--text-muted)): "Just for you. Never shown publicly unless you choose."
  - Textarea: no border, background var(--surface-2), border-radius 8px, padding 12px
    Font: var(--font-display) italic, 14px — make writing feel meaningful
    maxLength: 140. Auto-expand to 3 lines max.
    Character counter at 100+ chars: 10px, Vetiver Grey, bottom-right of textarea
  - 12-second progress bar at very top of sheet (so auto-dismiss feels intentional)
  - Two buttons:
    "Keep it private" — ghost, 12px, Vetiver Grey
    "Save →" — gold pill

STEP 2 — Save note on "Save →":
localStorage only. Append to scentral_wear_notes:
  const existing = JSON.parse(localStorage.getItem('scentral_wear_notes') ?? '[]')
  existing.push({ fragrance_id, note, date: new Date().toISOString() })
  localStorage.setItem('scentral_wear_notes', JSON.stringify(existing))
DO NOT write to Supabase.

STEP 3 — Strip prompt after saving (inline micro-prompt, not another sheet):
"Add this to The Strip?" [Share →] [Keep private]
If Share →: append to scentral_strip_queue (localStorage array) for posting via The Strip later.

STEP 4 — Memory line on fragrance detail page app/(main)/collection/[id]:
Read from scentral_wear_notes, filter by fragrance_id. Show most recent note:
  <div style={{ borderLeft: '2px solid var(--accent)', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--r-card)', marginTop: 16 }}>
    <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Your memory</p>
    <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--text)' }}>{mostRecentNote}</p>
    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{noteDate}</p>
  </div>

npm run build → zero errors.
git commit -m "feat(brief): wear log note field — localStorage-only memory capture, Strip queue, memory line on detail page"
```

---

### G1 — Per-Fragrance Fit Narrative: Beyond the Score

*Marlowe: "WhatScent has a score. Scores are cold. We tell people who they are. A chip that says 'Strong fit' is a tool. A line that says 'This belongs in your collection' is a mirror."*

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md, lib/personas.ts.

Ground yourself: one line.

TASK: Ship a Fit Narrative that tells users WHY a fragrance fits — in BaseNote's brand voice.

STEP 1 — Create lib/fitNarrative.ts:

import { type Persona } from './personas'

export type FitLevel = 'signature' | 'explore' | 'contrast'

interface FitResult {
  level: FitLevel
  chip: string
  narrative: string
  inspired_by_cue: boolean
}

export function getFitNarrative(
  family: string | null,
  fragrance_name: string,
  persona: Persona | null
): FitResult {
  if (!family || !persona) return {
    level: 'explore', chip: '◇ Worth exploring',
    narrative: 'Something new for your collection.', inspired_by_cue: false,
  }

  const preferred = persona.recommendations.preferred_families.map(f => f.toLowerCase())
  const avoid = persona.recommendations.avoid_families?.map(f => f.toLowerCase()) ?? []
  const f = family.toLowerCase()
  const isPreferred = preferred.some(p => f.includes(p) || p.includes(f))
  const isAvoid = avoid.some(a => f.includes(a) || a.includes(f))

  const SIGNATURE: Record<string, string> = {
    velvet_intellectual: `${fragrance_name} belongs in your archive.`,
    solar_minimalist: `${fragrance_name} is made for how you move.`,
    dark_alchemist: `${fragrance_name} is exactly the kind of thing you'd wear.`,
    ritual_keeper: `${fragrance_name} was made for intentional mornings.`,
    rebel_experimentalist: `${fragrance_name} is the kind of thing most people walk past. You'd reach for it.`,
    comfort_seeker: `${fragrance_name} is what comfort smells like.`,
  }

  const CONTRAST: Record<string, string> = {
    velvet_intellectual: `Not your usual register — which might be exactly why it's interesting.`,
    solar_minimalist: `A departure from your clean lines. For when you want to shift gears.`,
    dark_alchemist: `Lighter than your usual. Sometimes the contrast is the point.`,
    ritual_keeper: `Outside your practice. Worth one deliberate wear.`,
    rebel_experimentalist: `Actually, too safe for you. Unless you're wearing it ironically.`,
    comfort_seeker: `Bolder than your usual warmth. For a day when you want to be noticed.`,
  }

  if (isPreferred) return {
    level: 'signature', chip: '◆ Strong fit',
    narrative: SIGNATURE[persona.id] ?? `${fragrance_name} suits your identity.`,
    inspired_by_cue: true,
  }
  if (isAvoid) return {
    level: 'contrast', chip: '○ Outside your usual',
    narrative: CONTRAST[persona.id] ?? `Outside your usual range.`,
    inspired_by_cue: false,
  }
  return { level: 'explore', chip: '◇ Worth exploring', narrative: `A different direction for your collection.`, inspired_by_cue: false }
}

STEP 2 — On fragrance CARDS (DiscoverClient.tsx or DiscoverGrid.tsx):
Show chip ONLY when level === 'signature' (don't clutter cards with explore/contrast):
  <span style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginTop: 2 }}>
    ◆ Strong fit
  </span>
Only render when scentral_persona is set in localStorage.

STEP 3 — On fragrance DETAIL PAGE app/(main)/collection/[id]:
Full narrative card:
  <div style={{ padding: '14px 16px', background: 'var(--surface)', borderLeft: '2px solid var(--accent)', borderRadius: 'var(--r-card)', marginTop: 16 }}>
    <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>{fitResult.chip}</p>
    <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{fitResult.narrative}</p>
    {fitResult.inspired_by_cue && fragrance.inspired_by && (
      <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 8 }}>
        There's an Inspired By alternative → {fragrance.inspired_by}
      </p>
    )}
  </div>

When no persona set:
  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '16px 0' }}>
    <a href="/onboarding" style={{ color: 'var(--accent)' }}>Find your identity</a> to see how this fits your nose.
  </p>

Verify: set scentral_persona = dark_alchemist. Visit a Floral fragrance → should show contrast narrative.
npm run build → zero errors.
git commit -m "feat(discover): per-fragrance Fit Narrative — persona voice, Inspired By cue, detail page card"
```

---

### G3 — Bottle Scanner: Surface What Already Exists

*Marlowe: "The highest-intent moment in fragrance is standing in a shop holding a bottle. Every other app misses this moment. We capture it."*

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

CONTEXT:
- app/(main)/scanner already exists with barcode scanning via /api/scan/barcode
- app/api/scan/route.ts (Claude Vision) was dead code and has been deleted — do not recreate it
- The scanner currently routes to /collection on success — a dead-end from a Discover flow
- No new OCR or Vision dependencies needed. This prompt is about wiring, not building.

STEP 1 — Add ?from= return flow to app/(main)/scanner/page.tsx:
Read useSearchParams() for ?from param.
On successful barcode scan + fragrance match:
  if (from === 'discover') router.push(`/discover?q=${encodeURIComponent(fragranceName)}`)
  else router.push('/collection')  // existing behaviour unchanged

On failed scan (no barcode match):
  if (from === 'discover') show inline message:
    "Couldn't find this barcode — search by name?"
    with a link: href="/discover" in var(--accent)
  else existing error behaviour

STEP 2 — Camera shortcut in DiscoverClient.tsx search bar:
Add camera icon button to right end of search input.
Only render when navigator.mediaDevices is available (mobile check):
  const canScan = typeof navigator !== 'undefined' && !!navigator.mediaDevices

  <a
    href="/scanner?from=discover"
    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      color: 'var(--accent)', fontSize: 18, lineHeight: 1, textDecoration: 'none' }}
    aria-label="Scan a bottle"
  >
    ⊡
  </a>

STEP 3 — Scan result context banner in DiscoverClient.tsx:
Read useSearchParams() for ?q param on mount.
If ?q is present AND referrer was /scanner (check ?from=scanner or sessionStorage flag):
  Show banner above results:
  <div style={{ background: 'var(--surface)', padding: '10px 16px',
    borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--text-muted)' }}>
    ⊡ Scanned: "{q}" ·
    <button onClick={clearQ} style={{ color: 'var(--accent)', background: 'none',
      border: 'none', fontSize: 12, cursor: 'pointer' }}>Clear</button>
  </div>
  clearQ: router.replace('/discover') to remove the query param.

npm run build → zero errors.
git commit -m "feat(scanner): return-to-discover flow, camera shortcut in search bar, scan result banner"
```

---

## ═══════════════════════════════════════
## SPRINT A — HIGH IMPACT, LOW COMPLEXITY
## ═══════════════════════════════════════

### A2 — Rarity Index + Inspired By Bridge

*Marlowe: "You find something rare and beautiful. Then you find you can smell like it for £18. That's not a feature. That's a feeling."*

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md.

Ground yourself: one line.

TASK: Surface the rarity of each fragrance and bridge it directly to the Inspired By engine.
The existing get_fragrance_social_proof RPC returns owner_count. Use it.

STEP 1 — Rarity badge on fragrance cards:
When owner_count available:
  0:     '◆ Undiscovered' — var(--accent), fontSize 9, uppercase, letterSpacing 0.1em
  1–5:   '◆ Rare · [N]' — var(--accent)
  6–25:  '◆ Cult · [N]' — var(--accent) at 0.7 opacity
  26–100: '[N] members' — var(--text-muted) at 0.6 opacity
  100+:  show nothing

STEP 2 — Rarity block on detail page app/(main)/collection/[id]:
When isRare (owner_count < 26):
  <div>
    <span style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>◆ {rarityLabel}</span>
    {fragrance.inspired_by && (
      <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>
        Rare and beautiful — there's an Inspired By alternative.<br />
        <strong>{fragrance.inspired_by}</strong> · a fraction of the price.
      </p>
    )}
  </div>

STEP 3 — Rarity filter chip in DiscoverFilters.tsx:
Add to Sort row: { label: '◆ Rare', value: 'rare' }
When active:
  - Filter: owner_count < 10
  - Sort: owner_count ASC (least owned first)
  - Count label: "[N] fragrances most people haven't found"
  - Flag results with inspired_by: add 'Inspired By available' marker chip

STEP 4 — First-discovery toast (+25% push):
When user adds a fragrance with owner_count === 0 to collection:
Show toast: "◆ You're the first. Only you own this."
Store in localStorage scentral_first_discoveries (array) — never show the same toast twice.

npm run build → zero errors.
git commit -m "feat(discover): Rarity Index — owner badges, Inspired By bridge, rare filter, first-discovery toast"
```

---

### D2 — Persona-Conditional Copy System

*Marlowe: "No new features. Zero new UI. Three pages now feel like they know the user's name."*

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

STEP 1 — Create lib/personaCopy.ts:

export const PERSONA_COPY = {
  velvet_intellectual: {
    briefTitle: "Today's Selection",
    briefSubtitle: "Your considered choice for today.",
    briefEmpty: "Your selection is waiting.",
    briefDone: "A considered day. Well chosen.",
    briefCTA: "What does it remind you of?",
    discoverHeadline: "Your archive",
    discoverSubtitle: "127,000 fragrances, filtered to what suits you.",
    collectionHeadline: "The Collection",
    collectionEmpty: "Your collection is forming. Begin with one.",
    identityHeadline: "Your identity",
    identityTagline: "The pattern in what you reach for.",
    rareLabel: "Rare reserve",
  },
  solar_minimalist: {
    briefTitle: "Today's Call",
    briefSubtitle: "Two seconds. Done.",
    briefEmpty: "Add bottles to start.",
    briefDone: "Sorted.",
    briefCTA: "Log it.",
    discoverHeadline: "Explore",
    discoverSubtitle: "Clean, confident, always right for the moment.",
    collectionHeadline: "Your Shelf",
    collectionEmpty: "Clean slate. Start building.",
    identityHeadline: "Your profile",
    identityTagline: "Efficient. Specific. Always intentional.",
    rareLabel: "Clean find",
  },
  dark_alchemist: {
    briefTitle: "Tonight's Formula",
    briefSubtitle: "What you reach for when the night begins.",
    briefEmpty: "Your lab is empty. Begin the collection.",
    briefDone: "The night is handled.",
    briefCTA: "What is this one?",
    discoverHeadline: "The deep cuts",
    discoverSubtitle: "What they're not wearing. What you are.",
    collectionHeadline: "The Arsenal",
    collectionEmpty: "Empty lab. Unacceptable.",
    identityHeadline: "Your identity",
    identityTagline: "Bold. Polarising by design.",
    rareLabel: "Underground",
  },
  ritual_keeper: {
    briefTitle: "Morning Intention",
    briefSubtitle: "Begin with intention. Begin with this.",
    briefEmpty: "Your ritual is waiting.",
    briefDone: "The ritual is complete. A good start.",
    briefCTA: "What did this moment hold?",
    discoverHeadline: "Discover",
    discoverSubtitle: "Fragrances that hold meaning.",
    collectionHeadline: "Your Practice",
    collectionEmpty: "Your practice is forming. Every bottle matters.",
    identityHeadline: "Your practice",
    identityTagline: "Intentional. Grounded. Sacred.",
    rareLabel: "Ceremonial",
  },
  rebel_experimentalist: {
    briefTitle: "Today's Experiment",
    briefSubtitle: "The one you're testing today.",
    briefEmpty: "Nothing to experiment with yet. Unacceptable.",
    briefDone: "Experiment complete. Notes?",
    briefCTA: "What happened?",
    discoverHeadline: "Find something unusual",
    discoverSubtitle: "127,000 fragrances. Most of them are wrong for you.",
    collectionHeadline: "The Studio",
    collectionEmpty: "Empty studio. Fix that.",
    identityHeadline: "Your identity",
    identityTagline: "Unconventional. Creative. Always pushing.",
    rareLabel: "Cult obscure",
  },
  comfort_seeker: {
    briefTitle: "Today's Comfort",
    briefSubtitle: "The one that wraps around you today.",
    briefEmpty: "Your comfort awaits. Start here.",
    briefDone: "A good day. A good choice.",
    briefCTA: "What did this remind you of?",
    discoverHeadline: "Find your signature",
    discoverSubtitle: "Warm. Enveloping. Made for how you feel.",
    collectionHeadline: "Your Favourites",
    collectionEmpty: "Your favourites shelf is empty. Let's fix that.",
    identityHeadline: "Your identity",
    identityTagline: "Nurturing. Comforting. Always present.",
    rareLabel: "Hidden gem",
  },
} as const

export type PersonaCopyKey = keyof typeof PERSONA_COPY
export type PersonaCopy = typeof PERSONA_COPY[PersonaCopyKey]

export function getPersonaCopy(personaId: string | null): PersonaCopy {
  if (personaId && personaId in PERSONA_COPY) return PERSONA_COPY[personaId as PersonaCopyKey]
  return PERSONA_COPY.solar_minimalist
}

STEP 2 — Wire into SpritzClient.tsx:
const copy = getPersonaCopy(localStorage.getItem('scentral_persona'))
Replace hardcoded strings:
  h1 "Today's Brief" → copy.briefTitle
  subtitle → copy.briefSubtitle
  empty state → copy.briefEmpty
  end-of-cards state → copy.briefDone
  note field placeholder → copy.briefCTA

STEP 3 — Wire into DiscoverClient.tsx:
When persona is set, show above filter row:
  Headline → copy.discoverHeadline
  Subtitle → copy.discoverSubtitle
Rare chip label → copy.rareLabel (from A2)

STEP 4 — Wire into collection page:
  Page heading → copy.collectionHeadline
  Empty state → copy.collectionEmpty

Test: set scentral_persona = dark_alchemist → Brief shows "Tonight's Formula".
npm run build → zero errors.
git commit -m "feat(copy): persona-conditional copy — Brief, Discover, Collection adapt to identity"
```

---

### A1 — Occasion Quick Pick

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

TASK: 2-tap bottom sheet on the Brief page. Right occasion → right bottle from the user's collection.

OCCASIONS config (geometric glyphs not emoji — brand consistent):
const OCCASIONS = [
  { id: 'work',    label: 'Work',    glyph: '◻', vibes: ['Fresh','Citrus','Aquatic','Aromatic'],     projections: ['Weak','Medium','Moderate'] },
  { id: 'date',    label: 'Date',    glyph: '◆', vibes: ['Woody','Oriental','Floral','Oud','Amber'],  projections: ['Moderate','Strong'] },
  { id: 'gym',     label: 'Gym',     glyph: '◈', vibes: ['Citrus','Fresh','Aquatic'],                projections: ['Weak','Medium'] },
  { id: 'evening', label: 'Evening', glyph: '●', vibes: ['Oud','Amber','Leather','Oriental','Tobacco'], projections: ['Moderate','Strong','Beast Mode'] },
  { id: 'weekend', label: 'Weekend', glyph: '○', vibes: ['Green','Fresh','Floral','Chypre'],         projections: ['Medium','Moderate'] },
  { id: 'special', label: 'Special', glyph: '◇', vibes: ['Oriental','Gourmand','Floral','Oud','Resinous'], projections: ['Strong','Beast Mode'] },
]

BOTTOM SHEET:
Step 1 — Occasion grid:
  Heading (Cormorant italic, 18px): "What's the occasion?"
  2×3 grid of tiles: glyph (20px, var(--accent)) + label (11px, uppercase, var(--text-muted))
  Min tile height: 72px. Active state: 1px gold border.

Step 2 — Single recommendation:
  Filter scentral_collection IDs → match family against occasion vibes
  Fetch from Supabase, sort rating DESC, show first match
  Full-width gradient card: name in Cormorant italic, brand in small caps
  Below name: confidence line —
    1 match: "Your only [occasion] fragrance. Wearing it is the right call."
    3+ matches: "Chosen from [N] options in your collection."
  Two actions: "Wear this →" (fires wear log + G2 note sheet) | "Try another →" (cycles)
  0 matches: "None of your bottles match [occasion] perfectly." + Discover link filtered by vibes

ENTRY POINT — floating pill on Brief page:
<button style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', right: 16, background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 20, padding: '8px 16px', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>◈ Quick Pick</button>

npm run build → zero errors.
git commit -m "feat(brief): Occasion Quick Pick — 2-tap, collection-aware, confidence line"
```

---

### A3 — Gift This + Inspired By Value Line

*Marlowe: "This is the Inspired By engine with a human emotion attached. Someone shares a £140 fragrance as a gift idea. The card shows the inspired-by version for £18. That's a word-of-mouth acquisition loop powered by generosity."*

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Gift This button on fragrance detail page with a share card that surfaces the Inspired By value.

NOTE: npm install html2canvas if not already installed (check package.json first).

GIFT BUTTON on app/(main)/collection/[id] action row:
"◇ Gift This" — ghost button, var(--accent) text, 11px uppercase

SHARE CARD (CSS-only component, snapshot to PNG via html2canvas):
Container: 375×500 proportion, background #1A1208
  Gold score line top: 2px, full width, var(--accent)
  Brand: 10px uppercase, rgba(255,255,255,0.45), padding-top 20px
  Fragrance name: Cormorant italic, 28px, white
  Family + season: 10px mono, var(--color-vetiver)
  Description: truncated 100 chars, 13px italic, rgba(255,255,255,0.55)
  Divider: 1px rgba(255,255,255,0.1)
  IF inspired_by:
    "◆ Inspired By alternative available" — 10px, var(--accent)
    "From [inspired_by] · a fraction of the price" — 11px, var(--accent)
  BaseNote wordmark: 10px, rgba(255,255,255,0.3), bottom-right
  Gold score line bottom: 2px, full width

SHARE OPTIONS (bottom sheet):
1. "Copy link" → navigator.clipboard.writeText(url + '?ref=gift')
2. "Share" → navigator.share if available
3. "WhatsApp →" → pre-written gift message (not fragrance-nerd language):
   "Found something for you — [Name] by [Brand]. [description 80 chars].
    [If inspired_by: 'There's also an inspired-by version for less.']
    [link]"
4. "Download card" → PNG fallback

npm run build → zero errors.
git commit -m "feat(collection): Gift This — share card, Inspired By value line, WhatsApp gift message"
```

---

### A4 — Unusual Suspects

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

TASK: A sort mode that surfaces critically acclaimed but not-yet-mainstream fragrances.
High-rated, low-ownership, biased toward the active persona's families.

Add to DiscoverFilters.tsx Sort row: { label: '⚗ Unusual', value: 'unusual' }

When sort === 'unusual' in DiscoverClient.tsx:
  Sort logic:
    const scoreA = (a.rating ?? 0) * Math.min(a.owner_count ?? 0, 50)
    const scoreB = (b.rating ?? 0) * Math.min(b.owner_count ?? 0, 50)
    sorted.sort((a, b) => scoreB - scoreA)
  Filter: only where owner_count < 150

Count label: "[N] fragrances the crowd hasn't found yet"

+25% persona bias:
If persona is set, further filter results to persona's preferred families.
Label: "[N] unusual picks for [Persona Name]"
This is the personalised niche discovery engine WhatScent cannot build without our persona layer.

npm run build → zero errors.
git commit -m "feat(discover): Unusual Suspects — high-rated low-ownership, persona-biased"
```

---

### A5 — Signature Finder

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: 3-question bottom sheet that maps answers to a filter combination and surfaces
"[N] fragrances that could be your signature." Entry point for new users.

Show on Discover page when no active filters AND no persona set (or as a persistent shortcut).

3-step bottom sheet:
Step 1: "How do you want to feel?"
  Wrapped & Warm | Fresh & Clean | Bold & Present | Mysterious & Deep

Step 2: "When do you wear it most?"
  Every day | Evenings & occasions | Mornings only | No pattern

Step 3: "How much do you want people to notice?"
  Just me → projection: Weak, Medium
  My close circle → projection: Moderate
  Everyone in the room → projection: Strong, Beast Mode

Map answers to family + projection filter combination. Apply silently to Discover.
Change count label: "[N] fragrances that could be your signature"
Scroll to top of grid.

+25% push — retention nudge after 5 seconds on filtered results:
"Save a fragrance to start building your identity →"
One nudge, one action, one retention hook.

npm run build → zero errors.
git commit -m "feat(discover): Signature Finder — 3-step quiz, maps to filter combo, retention nudge"
```

---

## ═══════════════════════════════════════
## SPRINT L — LANDING PAGE
## ═══════════════════════════════════════

### L1 — Landing Hero: Dark Full-Screen

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

In components/landing/HeroSection.tsx (or app/page.tsx hero section):
Replace current hero with a full-viewport dark section.

Background: #1A1208 with CSS noise grain texture:
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")

Centre-aligned headline — Cormorant Garamond italic, white, clamp(3rem, 8vw, 6rem):
  "You already have"
  "a scent identity."
  "BaseNote finds it."

Each line fades in sequentially (CSS animation, 400ms delay between lines, 600ms each).

Single gold CTA: "Begin →" — var(--accent) background, #1A1208 text, pill shape (border-radius 9999px).

Remove: dual CTAs, cyan radial gradient, waitlist link.

npm run build → zero errors.
git commit -m "feat(landing): dark full-screen hero, word-by-word headline, single Begin CTA"
```

---

### L2 — Landing Inspired By Section

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

In the landing page, find the section with aria-hidden placeholder div or a grey gradient placeholder.
Replace entirely with the Inspired By Engine section:

<section style={{ padding: '80px 24px', background: '#1A1208' }}>
  <p style={{ fontSize: 11, color: '#6B635A', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: 8 }}>
    The Inspired By Engine
  </p>
  <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#F5F0E8', textAlign: 'center', marginBottom: 12 }}>
    Your £140 bottle has an inspired-by at £18.
  </h2>
  <p style={{ color: '#6B635A', textAlign: 'center', marginBottom: 48, fontSize: 15 }}>
    We find them. You decide.
  </p>
  <div style={{ display: 'flex', gap: 16, maxWidth: 480, margin: '0 auto' }}>
    <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, #5c4033, #8d7662)', textAlign: 'center' }}>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Designer</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18 }}>Baccarat Rouge 540</p>
      <p style={{ color: '#B8913A', fontSize: 13, marginTop: 4 }}>£285</p>
    </div>
    <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, #c49a3c, #8a4b2e)', textAlign: 'center' }}>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Inspired By</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18 }}>DNA Match · 94%</p>
      <p style={{ color: '#B8913A', fontSize: 13, marginTop: 4 }}>£19</p>
    </div>
  </div>
</section>

npm run build → zero errors.
git commit -m "feat(landing): Inspired By Engine section — replaces placeholder div"
```

---

### L3 — Persona Cards Redesign

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

In components/landing/PersonaTeasers.tsx:
1. Remove onMouseEnter hover scale — replace with opacity: 0.85 → 1 transition on hover
2. Cards: full-height dark editorial style using persona.ui_theme.bgGradient as background
3. Show ONLY persona tagline in large Cormorant italic, white — no other text. Mystery is the CTA.
4. Add subtle vertical score line mark at bottom centre: 1px gold line, 40px tall
5. Mobile: horizontal scroll with scroll-snap-type: x mandatory
6. Section label above: "6 identities. Which is yours?" in 10px uppercase Vetiver Grey
7. Card dimensions: min-height clamp(260px, 40vw, 340px), width clamp(200px, 60vw, 280px)

Persona taglines (from lib/personas.ts — use the actual data, don't hardcode):
  persona.narrative.tagline for each persona

npm run build → zero errors.
git commit -m "feat(landing): persona cards dark editorial, Cormorant taglines only, no sticky hover"
```

---

## ═══════════════════════════════════════
## SPRINT P — PERSONA + ONBOARDING
## ═══════════════════════════════════════

### P1 — Onboarding Reveal Moment

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

Find the component that shows the persona result after quiz completion.
Add a cinematic reveal using Framer Motion (already in codebase):

Phase 1: full-screen overlay (position: fixed, inset: 0, zIndex: 999, background: #1A1208) — 400ms
Phase 2: persona name fades in word by word (120ms between words)
  Font: var(--font-display) italic, clamp(3rem, 8vw, 5rem), white
  Each word: opacity 0→1, translateY 10px→0
Phase 3: hold 1000ms
Phase 4: persona tagline types itself letter by letter (28ms per character)
  Font: 16px, var(--accent) colour
Phase 5: three base scent notes drift up from below (staggered, 200ms apart)
  persona.scent_spectrum.base[0..2], small, mono, Vetiver Grey
Phase 6: CTA fades in
  "This is your base note. →" in var(--accent)
  onClick: dismiss overlay, show actual persona result card

Get all data from lib/personas.ts getPersonaById(personaId).

npm run build → zero errors.
git commit -m "feat(onboarding): cinematic reveal — word-by-word name, typewriter tagline, note drift"
```

---

### P2 — Brief Swipe Affordance + Tutorial Rock

```
Read AGENTS.md.

Ground yourself: one line.

In app/(main)/spritz/SpritzClient.tsx:

1. h1 "Aura" → "Today's Brief" (or use copy.briefTitle from lib/personaCopy.ts if D2 is shipped)
2. Add swipe affordance row below the card:
     ← Later        [card space]        Worn ✓
   "Later" in Vetiver Grey 13px, left. Tapping fires skip action.
   "Worn ✓" in var(--accent) 13px, right. Tapping fires wear action.

3. First-use rock animation:
   Check localStorage.getItem('scentral_brief_tutorialSeen')
   If not set: on mount, animate card with Framer Motion:
     rotateZ: [0, -3, 3, -2, 0] over 600ms
   Then: localStorage.setItem('scentral_brief_tutorialSeen', '1')

4. Empty wardrobe state (no fragrances in scentral_collection):
   Cormorant italic large: "Your brief is waiting."
   Small text: "Add fragrances to your collection to start your daily ritual."
   Gold button: "Explore Fragrances →" → href="/discover"

npm run build → zero errors.
git commit -m "feat(brief): swipe affordance, rock tutorial, empty state, rename to Today's Brief"
```

---

### P3 — Identity Tab Signed-Out State ✅ SHIPPED

**What was built (verified 2026-06-28):**
- `YouClient.tsx` had only an auth-gated email sign-in CTA — no persona-aware view
- Added `localPersona` / `localCollectionCount` / `localScentHistory` state block
- Reads `scentral_persona`, `scentral_collection` from localStorage
- Queries `wear_logs` by `anon_id` (confirmed: `app/api/spritz/log-wear/route.ts` stores anon IDs in `user_id`)
- When persona exists: renders persona identity card (name, tagline, base notes, collection count, streak, last-worn) + "Your Scent History" list
- No `pointerEvents:'none'` blur or fake "Lattafa Asad" data existed — those spec assumptions didn't apply

**Skip this prompt — already live.**

---

## ═══════════════════════════════════════
## SPRINT C — SCENT DNA + INSPIRED BY
## ═══════════════════════════════════════

### C1 — Scent DNA Surface (Promote the Feature)

```
Read AGENTS.md.

Ground yourself: one line.

In app/(main)/discover/DiscoverFilters.tsx:

1. Add full-width card ABOVE the search row:
<button onClick={onSmellsLikeToggle} aria-pressed={smellsLikeMode} style={{
  width: 'calc(100% - 32px)', margin: '0 16px', padding: '14px 16px',
  background: smellsLikeMode ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface)',
  border: `1px solid ${smellsLikeMode ? 'var(--accent)' : 'var(--line)'}`,
  borderRadius: 'var(--r-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  cursor: 'pointer', transition: 'all 0.15s',
}}>
  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: smellsLikeMode ? 'var(--accent)' : 'var(--text-muted)' }}>
    SCENT DNA SEARCH
  </span>
  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
    {smellsLikeMode ? '✓ Active' : 'Describe a scent →'}
  </span>
</button>

2. Remove the "Smells Like" button from inside the search row
3. Rename all "Smells Like" → "Scent DNA" in this file
4. When active: update search input placeholder to "Describe your ideal scent — warm amber, fresh citrus, dry wood…"

npm run build → zero errors.
git commit -m "feat(discover): promote Scent DNA Search to full-width card, rename from Smells Like"
```

---

### C2 — Scent DNA Full Overlay

*Marlowe: "Nadia said 'I typed what I smelled at a wedding 3 years ago and it found matches. No other app does this.' That sentence is a TikTok caption."*

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md.

Ground yourself: one line.

PREREQUISITE: Verify /api/search?mode=smells_like returns results before building. If broken, fix first.

TASK: Rebuild Scent DNA as a full-screen dark overlay.

Trigger: tap SCENT DNA SEARCH card (from C1).

Overlay:
  Full-screen, background #1A1208, z-index 99, slides up from bottom
  Top bar: "SCENT DNA" (10px gold uppercase) | × close (Vetiver Grey)
  Input pinned below top bar:
    Dark background rgba(255,255,255,0.05), border-bottom 1px var(--accent) only
    Font: Cormorant Garamond italic, 18px — feels like writing, not typing
    Placeholder: "Describe your ideal scent..."
    Auto-focus on open
  Results (scroll area below input):
    Each: horizontal card with 4px family gradient strip on left edge
      Fragrance name: Cormorant italic, 16px, white
      Brand: 10px small caps, Vetiver Grey
      Match signal: "[N]% match" in var(--accent) (if similarity score returned by API)
      If inspired_by: "◆ Inspired By: [inspired_by]" — 10px, var(--accent)
    Tap → navigate to /collection/[id]

Saved searches in localStorage scentral_dna_searches: string[] (max 5, FIFO):
  When overlay opens empty: show saved searches as chips "Recent: [query] [query]"
  Tap to restore. "Clear" in Vetiver Grey.

Bottom of results: "Described something else?" — clears input, keeps overlay open.

npm run build → zero errors.
git commit -m "feat(discover): Scent DNA full overlay — dark screen, match %, Inspired By in results, saved searches"
```

---

### C3 — Inspired By Language Sweep

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Kill "clone" and "dupe" everywhere. Replace with "Inspired By" language.

Search entire codebase:
grep -r "clone\|Clone\|dupe\|Dupe" app/ components/ lib/ --include="*.tsx" --include="*.ts" --include="*.css"

Replacements (user-facing strings ONLY — not variable names, not route paths, not file names):
  "Clone" / "clone" (as feature name) → "Inspired By"
  "dupe" → "Inspired By alternative"
  "Clone Finder" → "Inspired By Engine"
  "Find clones" → "Find Inspired By alternatives"

DO NOT rename: route paths, function names, variable names, localStorage keys.
DO NOT rename: scentral_anon_id, scentral_persona, scentral_wishlist, etc.

On fragrance detail page app/(main)/collection/[id], if inspired_by is populated:
<div style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--r-card)', marginTop: 16 }}>
  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
    Inspired By
  </p>
  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)' }}>
    {fragrance.inspired_by}
  </p>
  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
    A fraction of the price. The same DNA.
  </p>
</div>

Verify:
grep -r "\"clone\"\|\"dupe\"\|Clone Finder" app/ components/ --include="*.tsx" → zero user-facing results

npm run build → zero errors.
git commit -m "feat(brand): Inspired By language sweep — kill clone/dupe in all user-facing strings"
```

---

## ═══════════════════════════════════════
## SPRINT B — DEPTH + RETENTION
## ═══════════════════════════════════════

### B2 — Coherence Score + Missing Note

*Marlowe: "The Velvet Intellectual reads: 'Your collection runs dark and resinous — the scent of candlelit rooms.' Then: 'You're missing a citrus top note.' They tap. They find it. Then they find an Inspired By alternative for £18. That is the BaseNote loop at full power."*

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

TASK: Client-side collection reading + missing-note recommendation.
Show when collection has 5+ fragrances. Under 5: show a progress hint.

ALGORITHM (client-side, no API):
1. Get scentral_collection from localStorage (array of fragrance IDs)
2. Fetch: SELECT id, family FROM fragrances WHERE id IN (...)
3. Count family distribution
4. Find dominant (>35%) and secondary (>20%)
5. Look up coherence reading + missing families

COHERENCE_READINGS:
const COHERENCE_READINGS: Record<string, { reading: string; missing: string[] }> = {
  'Woody+Oriental':    { reading: 'Dark, resinous, and candlelit. Your collection has a personality.',         missing: ['Citrus', 'Aquatic'] },
  'Citrus+Aquatic':    { reading: 'Clean lines and open air. Your shelf is built for motion.',                  missing: ['Woody', 'Aromatic'] },
  'Gourmand+Amber':    { reading: 'Warm and unapologetically comforting. A collection that wraps around you.', missing: ['Citrus', 'Green'] },
  'Leather+Tobacco':   { reading: 'Bold and polarising by design. This collection is not for everyone.',        missing: ['Floral', 'Aquatic'] },
  'Floral+Musk':       { reading: 'Soft and present. Your collection whispers before it announces.',            missing: ['Woody', 'Oriental'] },
  'Oud+Resinous':      { reading: "Rare taste. Your shelf reads like a perfumer's private reserve.",            missing: ['Citrus', 'Fresh'] },
  'Aromatic+Herbal':   { reading: 'Intentional and grounded. Your collection is a practice, not a habit.',     missing: ['Amber', 'Woody'] },
  'default':           { reading: 'Your collection is still finding its shape. Every new bottle narrows the focus.', missing: [] },
}

DISPLAY in collection page header:
<div style={{ margin: '0 16px 16px', padding: '16px', borderLeft: '2px solid var(--accent)', background: 'var(--surface)', borderRadius: 'var(--r-card)' }}>
  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Your collection</p>
  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', lineHeight: 1.5 }}>
    {coherenceReading.reading}
  </p>
  {coherenceReading.missing.length > 0 && (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        Your collection doesn't have a {coherenceReading.missing[0].toLowerCase()} note yet.
      </p>
      <a href={`/discover?family=${encodeURIComponent(coherenceReading.missing[0])}`} style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
        Find one → {coherenceReading.missing[0]} fragrances
      </a>
    </div>
  )}
</div>

Under 5 fragrances:
<p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 16px 16px', fontStyle: 'italic' }}>
  Add {5 - collectionCount} more {collectionCount === 1 ? 'fragrance' : 'fragrances'} to unlock your collection reading.
</p>

npm run build → zero errors.
git commit -m "feat(collection): Coherence Score — family pattern reading, missing-note link"
```

---

### B1 — Ritual Calendar

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Monthly wear dot grid in app/(main)/you/YouClient.tsx.
Show when auraStreak > 0 OR wear logs exist.

Layout: 7-column CSS grid, one cell per day of current month
  Filled day (has wear log): 28×28px circle, background var(--accent)
  Empty day: border 1px solid var(--line), background transparent
  Today: border 2px solid var(--accent)
  On tap of a filled dot: tooltip/popover with fragrance name worn that day

Data: query wear_logs WHERE anon_id = scentral_anon_id AND created_at >= first of current month
Join to fragrances for name.

Label above: "Your ritual, [Month] [Year]" — 10px uppercase Vetiver Grey
Below: "[N] days this month" — no emoji, no gamification language (Ritual Keeper persona)

Month navigation (prev/next arrows): shows wear history across months.

Share month →: generates share image of calendar grid (gold dots on dark background,
month label, BaseNote wordmark). Web Share API.

npm run build → zero errors.
git commit -m "feat(you): Ritual Calendar — monthly wear dots, fragrance tooltip, month nav, share"
```

---

### B3 — Formula Card + QR Deep Link

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Shareable layering combination card in the Lab.

In app/(main)/layering/LayeringClient.tsx, when a combination is saved:
Add "Share Formula →" button to the saved combination card.

Formula Card (9:16 portrait — Instagram Stories native):
  Background: #1A1208
  Gold score line: 2px, full width, top
  "FORMULA NO. [N]" — 10px uppercase Vetiver Grey (N from localStorage scentral_formula_count, auto-increment)
  Fragrance 1 name: Cormorant italic, 32px, white
    "BASE" — 9px mono, var(--accent)
  1px rgba(255,255,255,0.1) divider
  Fragrance 2 name: Cormorant italic, 24px, white
    "LAYER" — 9px mono, var(--accent)
  [If 3 fragrances:]
  Fragrance 3 name: Cormorant italic, 20px, 0.7 opacity
    "FINISH" — 9px mono, var(--accent)
  Gold score line: 1px, full width, bottom
  "BaseNote · Find your base note" — 10px Vetiver Grey

Allow user to name the formula before sharing. Default: "Formula No. [N]". Tap to rename.
Store formula names in localStorage.

QR code in bottom-right corner: use qrcode.react (npm install qrcode.react if not present).
QR deep-links to /layering?f1=[id1]&f2=[id2]&f3=[id3] — pre-selects the combination.

Share via Web Share API as PNG blob. Fallback: download.

npm run build → zero errors.
git commit -m "feat(layering): Formula Card — 9:16 shareable, formula naming, QR deep link"
```

---

### B4 — Identity Tab Full Upgrade

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

NOTE: If P3 (Identity Tab Signed-Out State) is already shipped, this prompt extends it
rather than replacing it. Check what's already in app/(main)/you/YouClient.tsx first.

TASK: Complete the Identity tab experience.

When persona IS set:
  Full persona identity card (if not already built in P3)
  Below card: "Your Scent History" vertical timeline
    Last 7 wears from wear_logs (anon_id, joined to fragrance name)
    Each entry: fragrance name Cormorant italic + date mono muted
    If note exists (from G2): show note in quotes below fragrance name

When persona is set AND collection has 3+ fragrances:
  Collection summary strip: [N] in collection · [N] in wishlist
  Link: "View your collection →"

Scent Identity Score teaser (full D4 builds this — here show a preview):
  If collection has 3+ fragrances:
    "Your identity is still forming. Add [N] more to unlock your full score."
    Show a partial bar in var(--accent) at appropriate % fill.

npm run build → zero errors.
git commit -m "feat(identity): full tab upgrade — persona card, wear history timeline, score teaser"
```

---

## ═══════════════════════════════════════
## SPRINT S — THE STRIP (COMMUNITY)
## ═══════════════════════════════════════

### S1 — The Strip Post Format + Wear-to-Post Flow
**PREREQUISITE: G2 (wear log note field) must be shipped first.**

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md.

Ground yourself: one line.

TASK: The Strip post card format + the wear-to-post queue flow.
Verify wear_posts table exists with: anon_id, fragrance_id, note, persona_id, created_at.
Show the table schema and wait for "approved" before writing to it.

STRIP POST CARD:
<div style={{ borderTop: '1px solid var(--accent)', padding: '14px 16px 12px', background: 'var(--bg)' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
    <span style={{ fontSize: 9, color: personaAccentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{personaName}</span>
    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{relativeTime}</span>
  </div>
  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)', margin: '4px 0' }}>{fragranceName}</p>
  <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{brandName}</p>
  {note && (
    <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
      "{note}"
    </p>
  )}
  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
    <button>♡ {likeCount}</button>
    <span>◇ {wearCount} wearing today</span>
  </div>
</div>

STRIP OF THE WEEK:
SELECT from wear_posts WHERE created_at > now()-7days ORDER BY like_count DESC LIMIT 1
Render with 2px gold border and "STRIP OF THE WEEK" label in 9px gold uppercase. Pin at top of feed.

WEAR-TO-POST FLOW:
Check scentral_strip_queue in localStorage (seeded by G2).
When user visits /social (or The Strip feed): show "Post to The Strip?" prompt for each queued note.
Pre-filled: fragrance name (read-only) + saved note (editable).
"Add to The Strip →" → INSERT to wear_posts.
"Keep private" → remove from queue without posting.

Rename "Wear & Share" to "The Strip" in display labels. Do not rename routes or files.

npm run build → zero errors.
git commit -m "feat(strip): score-line post format, wear-to-post queue, Strip of the Week"
```

---

## ═══════════════════════════════════════
## SPRINT COMMUNITY
## ═══════════════════════════════════════

### D3 — Community Tab + Also Own

*Marlowe: "Viktor's worst nightmare: 'People who own Lattafa Asad also own Afnan 9PM.' That's not community data. That's taste-matching. With our persona layer, it becomes personalised taste-matching."*

```
Read AGENTS.md, BASENOTE_BRAND.md, COMPETITIVE_INTELLIGENCE.md.

Ground yourself: one line.

TASK: Community tab on fragrance detail pages app/(main)/collection/[id].

SHOW SQL for Also Own query and wait for "approved" before applying:
SELECT f2.fragrance_id, COUNT(*) as co_own_count
FROM collections f1
JOIN collections f2 ON f1.anon_id = f2.anon_id
WHERE f1.fragrance_id = [current_fragrance_id]
  AND f2.fragrance_id != [current_fragrance_id]
GROUP BY f2.fragrance_id
ORDER BY co_own_count DESC
LIMIT 6

TAB CONTENT:
Section 1 — Ownership stats (from get_fragrance_social_proof RPC):
  "[owner_count] members own this"
  "Worn [N] times this week" — COUNT from wear_logs WHERE fragrance_id = [id] AND created_at > now()-7days
  Two stat pills side by side.

Section 2 — Persona breakdown:
  SELECT persona_id, COUNT(*) FROM wear_logs WHERE fragrance_id = [id] GROUP BY persona_id ORDER BY COUNT(*) DESC LIMIT 3
  "Most worn by" label + persona name chips with count.

Section 3 — Recent Strip posts:
  SELECT from wear_posts WHERE fragrance_id = [id] ORDER BY created_at DESC LIMIT 3
  Mini strip cards: note + persona chip + time. No score line (too dense).

Section 4 — Also Own horizontal scroll:
  Run the approved query above. Render 6 fragrance cards in horizontal scroll.
  Persona bias: if persona is set, filter results to persona's preferred families.
  Label changes: "[Persona Name]s who own this also own:" (personalised)
  Standard label: "Members who own this also own:"

Zero state: "Be the first to wear this." + "Add to collection →"

npm run build → zero errors.
git commit -m "feat(collection): community tab — stats, persona breakdown, Strip posts, persona-biased also-own"
```

---

## ═══════════════════════════════════════
## SPRINT CAPSTONE
## ═══════════════════════════════════════

### D4 — Scent Identity Score + Taste Drift

```
Read AGENTS.md, BASENOTE_BRAND.md, lib/personas.ts.

Ground yourself: one line.

TASK: The real-data identity portrait. Needs collection data to be meaningful.
Show when user has 5+ fragrances. Under 5: hint at what's coming.

ALGORITHM:
1. Fetch all collection fragrances with family field
2. Map each family → persona that most prefers it (use persona.recommendations.preferred_families)
3. Score each persona: % of collection matching their preferred families
4. Return top 2 personas with percentages

DISPLAY in YouClient.tsx:
<div style={{ margin: 16, padding: 16, background: 'var(--surface)', borderRadius: 'var(--r-card)' }}>
  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Your scent identity score</p>

  {/* Identity bar */}
  <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
    <div style={{ width: `${topPercent}%`, background: topPersona.ui_theme.accentColor }} />
    <div style={{ width: `${secondPercent}%`, background: secondPersona.ui_theme.accentColor, opacity: 0.6 }} />
    <div style={{ flex: 1, background: 'var(--line)' }} />
  </div>

  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
    {topPercent}% {topPersona.name.replace('The ', '')}, {secondPercent}% {secondPersona.name.replace('The ', '')}.
  </p>
  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on {collectionCount} fragrances in your collection.</p>

  {hasDriftData && (
    <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 10, fontStyle: 'italic' }}>
      Your taste is shifting toward {driftDirection} this month.
    </p>
  )}

  <button style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
    Share your identity →
  </button>
</div>

TASTE DRIFT:
Compare dominant family from this month's wear_logs vs last month's.
If family → persona mapping changed: show drift line.
"Your taste is shifting toward [darker/lighter/warmer/fresher] territory this month."

SHARE CARD: dark background, identity bar, breakdown text in Cormorant italic, BaseNote wordmark, gold score lines. Web Share API → PNG.

npm run build → zero errors.
git commit -m "feat(identity): Scent Identity Score — persona %, identity bar, taste drift, share card"
```

---

## ═══════════════════════════════════════
## SPRINT POLISH
## ═══════════════════════════════════════

### X1 — The Nose Report: Monthly Identity Digest

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Monthly personal digest — Spotify Wrapped for your nose. Monthly not annually.
Show on first visit of each new month (check localStorage scentral_last_nose_report vs current YYYY-MM).

The Nose Report contains:
1. "[N] fragrances worn this month" — COUNT from wear_logs
2. "Your most-worn: [Fragrance Name]" — mode of fragrance_id in wear_logs this month
3. "Your identity this month: [Persona]" — dominant persona from family distribution of wears
4. "Your longest streak: [N] days" — from user_streaks table
5. "A fragrance you haven't worn yet:" — oldest fragrance in collection by last_worn_date

Modal/sheet slides up on first visit of the month:
  Full dark background #1A1208. Gold score line at top.
  "YOUR NOSE, [MONTH YEAR]" — 9px gold uppercase, letter-spacing 0.15em
  Each stat on its own line in Cormorant italic, white.
  "Save as image →" button — PNG of the report card via html2canvas.
  "Dismiss" closes + sets scentral_last_nose_report = current YYYY-MM.

npm run build → zero errors.
git commit -m "feat(identity): The Nose Report — monthly personal digest, shareable PNG"
```

---

### X2 — Inspired By Value Counter

```
Read AGENTS.md.

Ground yourself: one line.

TASK: Live count of Inspired By matches on the landing page.

API ROUTE app/api/inspired-by-count/route.ts:
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  // createClient inside handler — not module level (AGENTS.md L15)
  const { count } = await supabase
    .from('fragrances')
    .select('id', { count: 'exact', head: true })
    .not('inspired_by', 'is', null)
  return Response.json({ count: count ?? 0 })
}

ON LANDING PAGE — in the Inspired By section (L2):
Fetch /api/inspired-by-count on load.
Display: "[N] Inspired By alternatives in our catalogue"
Format with toLocaleString() for commas.
Animate number counting up from 0 on first render (300ms, easeOut using requestAnimationFrame).

npm run build → zero errors.
git commit -m "feat(landing): live Inspired By count — API route, animated counter"
```

---

### X3 — Affinity Score Tier Explainers

```
Read AGENTS.md, BASENOTE_BRAND.md.

Ground yourself: one line.

TASK: Add subtitle explanations to Living Wardrobe shelf tiers. Zero new features — just clarity.

In WardrobeShelf.tsx or ShelfTier.tsx, each tier has a label. Add a subtitle:

"Top Signatures"    → subtitle: "What you reach for most. Your identity bottles."
"Occasion Modifiers" → subtitle: "Context-specific. Right bottle, right moment."
"Base Anchors"      → subtitle: "Starting points. Building your nose."
"Holding Zone"      → subtitle: "Not yet rated. Give them time."

Subtitle style: 10px, var(--text-muted), italic, margin-top 2px.
Show only when tier has at least 1 fragrance.

Empty Holding Zone state: "Rate a fragrance 1–20 to move it to the right tier."

npm run build → zero errors.
git commit -m "feat(collection): shelf tier subtitles — each tier now self-explanatory"
```

---

## ═══════════════════════════════════════
## SPRINT CLEANUP
## ═══════════════════════════════════════

### Z1 — BaseNote Name Sweep

```
Read AGENTS.md.

Ground yourself: one line.

Search entire codebase for "AnotherSense" and "Sensus":
grep -r "AnotherSense\|Sensus" app/ components/ lib/ --include="*.tsx" --include="*.ts" --include="*.css"

Replace all occurrences with "BaseNote" in display strings and comments.

DO NOT rename or change:
- localStorage keys (any scentral_* key) — renaming breaks existing user data
- Route paths: /spritz, /you, /layering, etc.
- Repo name scentral-hub or any Supabase project references
- Variable names or function names

Verify metadata in app/layout.tsx has title: "BaseNote".

After sweep:
grep -r "AnotherSense\|Sensus" app/ components/ lib/ --include="*.tsx" --include="*.ts" --include="*.css"
→ must return zero results

npm run build → zero errors.
git commit -m "chore(brand): name sweep — AnotherSense → BaseNote, localStorage keys unchanged"
```

---

### Z2 — AdSlot Fallback

```
Read AGENTS.md.

Ground yourself: one line.

Find all Google AdSense slots (search: "adsbygoogle" or "AdSlot" or "data-ad-slot").
Wrap each with a fallback:

const hasAdSense = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

{hasAdSense ? (
  <ins className="adsbygoogle" ... />
) : (
  <div style={{ minHeight: 100, background: 'var(--surface)', borderRadius: 'var(--r-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      Supported by our partners
    </p>
  </div>
)}

npm run build → zero errors.
git commit -m "fix(ads): fallback content for ad slots while AdSense pending"
```

---

### Z3 — Streak Day-1 Toast

```
Read AGENTS.md.

Ground yourself: one line.

In app/(main)/spritz/SpritzClient.tsx, where streak count is managed:
When streakCount === 1 AND localStorage.getItem('scentral_streak_celebrated') is not set:
  Show toast: "🔥 Streak started! Come back tomorrow to keep it alive."
  Style: var(--accent) text, 12px, fades in for 3s then fades out (Framer Motion AnimatePresence)
  Then: localStorage.setItem('scentral_streak_celebrated', '1')

npm run build → zero errors.
git commit -m "feat(brief): streak day-1 toast, single display via localStorage flag"
```

---

### Z4 — Context-Aware Back Link in Layering

```
Read AGENTS.md.

Ground yourself: one line.

In app/(main)/layering/LayeringClient.tsx:
The breadcrumb currently always says "← Wardrobe".

Fix: read useSearchParams() for ?from= parameter.
Map:
  'discover'   → "← Discover"
  'collection' → "← Collection"
  'wardrobe'   → "← Wardrobe" (default)

On click: if from is set use window.history.back(), otherwise navigate to /collection.
Import useSearchParams from 'next/navigation'. Component must be a Client Component.

npm run build → zero errors.
git commit -m "fix(layering): context-aware back link reads ?from= query param"
```

---

## ═══════════════════════════════════════
## VERIFICATION CHECKPOINTS
## ═══════════════════════════════════════

**After Foundation (F1–F5):**
- Cormorant Garamond renders as --font-display everywhere ✓
- All var(--accent) renders as #B8913A in light + dark ✓
- var(--r-card) renders as 12px everywhere ✓
- Nav order: Discover | Wardrobe | Lab | Brief | Identity ✓
- 2-column grid on mobile with gradient fallback cards ✓
- grep -r "AnotherSense\|Sensus\|font-fraunces" → zero results ✓

**After Gap Prompts (G1–G3):**
Viktor test: does no-auth + bottle scanner + fit narrative close the WhatScent gap?
Can a user in a fragrance shop scan a bottle, see the Fit Narrative, find the Inspired By alternative, and add to wishlist — all without creating an account?

**After Sprint A:**
Solar Minimalist test: can they get from "I need to pick a fragrance for work" to "worn and logged" in under 10 seconds?

**After Strip (S1) ships:**
Nadia test: run Nadia trigger prompt from PERSONAS_AI.md. Does she post about BaseNote today?
Required yes on: Inspired By engine, Scent DNA search, wear log note field, Strip format.

**Final — The 5-star review test:**
Read the 5-star review in COMPETITIVE_INTELLIGENCE.md.
Can a user experience every feature described?
If yes → ship to Vercel. If no → identify the gap.

---

## THE MOAT TABLE
### What WhatScent would need to rebuild their entire product to copy

| Our feature | Their dependency gap |
|---|---|
| Fit Narrative (G1) | Their product is taste profiles, not identities |
| Persona-Conditional Copy (D2) | No persona system = no copy system |
| Persona-biased Also Own (D3) | Co-collection without persona layer = just "popular items" |
| The Nose Report (X1) | Requires 30 days of wear data per user — they just launched |
| Coherence Score (B2) | Requires persona-to-family mapping they don't have |
| Scent Identity Score + Drift (D4) | Requires months of wear data they don't have |

The moat is not any one feature.
The moat is the compounding of persona identity + wear history + community.
WhatScent can copy a feature in 6 weeks.
They cannot copy 18 months of a user's relationship with their own nose.

— Marlowe
