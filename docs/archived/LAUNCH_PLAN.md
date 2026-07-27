# nota. — Pre-Launch Project Plan v2
## App Store & Play Store · Best-in-Class Quality Bar

> **Version:** 2.0 | **Date:** 2026-06-16 | **Owner:** Christopher
> **Stack:** Next.js 16.2.9 · React 19.2.4 · Supabase · Vercel
> **Live:** https://scentral-hub.vercel.app
> **Architecture lock:** NO AUTH for MVP · Pro gate = `isPro = false` · do not touch `/intelligence`, `/dna-match`, `/schedule`

---

## Honest Owner Critique of Current State

> "Would I push this live if all of v1 was implemented?"

**Short answer: no. Here's why.**

The current codebase is a well-built wardrobe app. Tabs work. Images load. Layering lab functions. That's good — but it's table stakes. Fragrantica and Parfumo already do wardrobe management. What they do NOT do is what the `scentral-v1-launch-spec.md` describes: a **sensory-first identity engine** that tells Gavan who he is as a fragrance person.

The single most dangerous gap in v1 of this plan was the missing **Sanctuary Profiler + Persona Reveal**. This is not a nice-to-have. It is the feature that:
- Creates the "wow" first impression that generates word of mouth
- Differentiates nota. from every other fragrance app in the store
- Gives the Discover tab a purpose (personalised results, not a generic grid)
- Gives users a reason to screenshot and share ("I'm a Velvet Intellectual")

**What else was missing from v1:**
1. The Sanctuary Profiler (3-step onboarding → persona reveal) — **critical gap**
2. Sensory theme binding (persona changes the UI's colour/depth/motion) — **high value**
3. Natural-language similarity explanations on the detail page — **high value**
4. Analytics / telemetry — without this you're flying blind post-launch — **overlooked**
5. Privacy policy and Terms of Service — **App Store required, will cause rejection**
6. App Store Connect account registration — **blocks submission entirely**

v2 of this plan closes all of these.

---

## What "Best-in-Class" Means for Gavan

The persona: TikTok-inspired fragrance beginner-to-obsessive. Owns 5–20 bottles. Mixes Lattafa, Zara dupes, one or two designer pieces. Anxious about blind buys. Motivated by self-expression, compliments, and belonging.

The emotional loop nota. must deliver:

```
INSTALL       → "This was made for me. I belong here."
PROFILER      → "Oh — that's exactly me. How did it know?"
PERSONA REVEAL → "I'm sharing this. This is my identity."
DISCOVER      → "These are MY fragrances, not a generic grid."
ADD BOTTLE    → "My wardrobe is real now."
LAYER         → "I didn't know those worked together."
LOG WEAR      → "I have a streak. I want to keep it."
SHARE CARD    → "This looks incredible. I need everyone to see this."
```

Every prompt in this plan serves one step in that loop.

---

## Phase Map

| Phase | Name | Priority | Blocks |
|---|---|---|---|
| **0** | Bug fixes & foundation | 🔴 Critical | Everything else |
| **1** | Sanctuary Profiler + Persona Engine | 🔴 Critical | Discover personalisation |
| **2** | Sensory UI & design token alignment | 🟠 High | App Store differentiation |
| **3** | Discovery polish & social proof | 🟠 High | Retention |
| **4** | Living Wardrobe visual overhaul | 🟠 High | Shareability |
| **5** | Copy rewrite & onboarding | 🟡 Medium | First impression |
| **6** | Analytics & telemetry | 🟡 Medium | Post-launch learning |
| **7** | Legal, store assets & submission | 🔴 Blocks submission | Gate |
| **8** | Post-launch growth | ⚪ After 500 users | Future |

**Run Phases 0–1 in parallel where possible. Phase 7 cannot start until 0–6 are complete.**

---

## PHASE 0 — Foundation Fixes
### Non-negotiable before anything else

---

### Prompt 0-A: PWA & Viewport Hardening
**Fan out: 3 parallel sub-agents**

```
You are a senior mobile web engineer for nota. Read AGENTS.md first.
Do not touch Pro-gated pages (/intelligence, /dna-match, /schedule) or auth flows.

Fan out into 3 parallel sub-agents:

SUB-AGENT A — Viewport & Safe Area
Files: app/layout.tsx, app/globals.css, app/components/BottomNav.tsx

1. Replace ALL `min-h-screen` and `min-h-[100vh]` with `min-h-[100dvh]` across
   the entire codebase. Grep both patterns.
2. Add to globals.css:
     html, body { overflow-x: hidden; height: 100%; }
     main { overflow-y: auto; overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch; }
3. Verify BottomNav paddingBottom:
     paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))'
   If wrong, fix it.
4. Add CSS class .safe-top { padding-top: env(safe-area-inset-top, 0px); }
   Apply to the fixed header element inside BottomNav.tsx.
5. In layout.tsx viewport metadata, add: viewportFit: 'cover'
6. Add to layout.tsx <head>:
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
     <meta name="mobile-web-app-capable" content="yes" />

SUB-AGENT B — Image Audit & Kinetic Scroll
Files: all components rendering fragrance bottle images

1. Grep all <img> and next/image across app/(main)/discover, app/(main)/collection.
2. Every bottle image container must:
   - Use aspect-ratio: 1/1 or 3/4 (fixed, not stretched)
   - Use object-fit: contain (NOT object-cover — transparent backgrounds)
   - Never clip with overflow:hidden on the image element itself
   - Fallback to a neutral placeholder SVG if image_url is null
3. Add kinetic scroll to all feed containers:
     style={{ overflowY: 'auto', overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch' }}
4. Verify BottomNav spacer at bottom of every main scroll container:
     <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />

SUB-AGENT C — PWA Manifest & Standalone Detection
Files: public/manifest.json, app/layout.tsx, app/components/BottomNav.tsx

1. Verify manifest.json has:
   - "display": "standalone"
   - "start_url": "/discover"
   - "theme_color": "#A0622A"
   - "background_color": "#F7F3EE"
   - Icons for 192×192 and 512×512 in /public/icons/
   Fix any missing or incorrect values.
2. Verify BottomNav standalone detection:
   - isStandalone=false → show compact top header, nav opacity 0.85
   - isStandalone=true → hide top header, full-opacity nav
   Fix any inverted condition.

Commit: "fix(pwa): viewport dvh, safe-area, image contain, kinetic scroll, manifest"
Run: node scripts/smoke-test.mjs — confirm 9/9.
```

---

### Prompt 0-B: Sensory Filter Bug Fix + Fuse.js Search
**Fan out: 2 parallel sub-agents**

```
You are a senior React/TypeScript engineer. Read AGENTS.md first.
File: app/(main)/discover/DiscoverClient.tsx

SUB-AGENT A — Filter Bug Fix (BLOCKING — confirmed broken)
The 'Light & Subtle' and 'Warm & Rich' filter families return 0 results.
Root cause: empty arrays in FEEL_FAMILIES and FEEL_PROJECTIONS, plus AND logic.

Fix 1 — Populate empty arrays:
  'Light & Subtle': ['Floral', 'Chypre', 'Powdery', 'Musk', 'Fresh']
  FEEL_PROJECTIONS corrections:
  'Warm & Rich':    ['Heavy', 'Strong', 'Massive']
  'Fresh & Clean':  ['Light', 'Moderate', 'Soft']
  'Bold & Lasting': ['Heavy', 'Strong', 'Massive', 'Moderate']
  'Light & Subtle': ['Light', 'Soft', 'Whisper']

Fix 2 — Change AND logic to OR with null safety:
  const matchFam  = families.length === 0 ||
    (f.family && families.some(fam => (FEEL_FAMILIES[fam] || []).includes(f.family)))
  const matchProj = projs.length === 0 ||
    (f.projection && projs.some(proj => (FEEL_PROJECTIONS[proj] || []).includes(f.projection)))
  if (!matchFam || !matchProj) return false

Test: 'Light & Subtle' must return > 0 results. Log count to console during dev.

SUB-AGENT B — Fuse.js Fuzzy Search
Install: npm install fuse.js

Replace current debounced search (name only) with Fuse.js across 4 fields:
  import Fuse from 'fuse.js'
  const fuse = useMemo(() => new Fuse(fragrances, {
    keys: [
      { name: 'name',              weight: 0.4 },
      { name: 'brand',             weight: 0.3 },
      { name: 'inspired_by',       weight: 0.2 },
      { name: 'plain_description', weight: 0.1 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  }), [fragrances])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return fragrances
    return fuse.search(searchQuery).map(r => r.item)
  }, [searchQuery, fuse, fragrances])

Maintain 250ms debounce on input. Use searchResults as input to filter pipeline.
Test: "sauvage" → Dior Sauvage; "lattafa" → all Lattafa; "oud" → all oud family.

Commit: "feat(discover): fuse.js fuzzy search + filter OR logic + null safety"
```

---

### Prompt 0-C: Stale Branch & Housekeeping
```
Run:
  git push origin --delete claude/elegant-faraday-dknv8d
  git push origin --delete feat/living-wardrobe-wiring
  git branch -a | grep -v main
Confirm only main remains. Report branch list.
```

---

## PHASE 1 — Sanctuary Profiler + Persona Engine
### The single most important feature missing from the app

This is what makes nota. unforgettable. It replaces the current 3-step vibe chip onboarding with a sensory identity quiz that gives Gavan a persona — and that persona shapes everything he sees afterwards.

The spec defines 6 personas. Start with 3 for v1. Full persona list for Phase 8.

---

### Prompt 1-A: Sanctuary Profiler — Onboarding Flow
**Fan out: 2 parallel sub-agents**

```
You are a senior Next.js/React engineer. Read AGENTS.md first.
No auth required. All state in localStorage. Do not touch Pro-gated routes.

This replaces the current onboarding flow. File locations:
  app/onboarding/ — create this directory
  app/onboarding/page.tsx — the 3-step profiler
  app/onboarding/SanctuaryStep.tsx — step 1
  app/onboarding/ProjectionStep.tsx — step 2
  app/onboarding/ContextStep.tsx — step 3
  app/onboarding/PersonaReveal.tsx — the "wow" screen
  lib/personas.ts — persona definitions (see below)

SUB-AGENT A — Persona Definitions + Engine
File: lib/personas.ts

Define 3 launch personas as TypeScript objects. Each has:
  id, name, sanctuary, projection,
  scent_spectrum: { top: string[], heart: string[], base: string[] }
  narrative: { tagline: string, what_this_says: string, environments: string, social_energy: string }
  recommendations: { preferred_families: string[], avoid_families: string[], layering_tips: string[] }
  ui_theme: { accentColor: string, bgGradient: string, cardBg: string }
  discover_filters: { families: string[], projections: string[] }

PERSONA 1 — The Velvet Intellectual
  sanctuary: "archive", projection: "intimate"
  scent_spectrum.top: ["bergamot", "black tea"]
  scent_spectrum.heart: ["iris", "tobacco leaf", "dried paper"]
  scent_spectrum.base: ["mahogany", "amber", "vanilla pod"]
  narrative.tagline: "You collect ideas the way others collect souvenirs."
  narrative.what_this_says: "Your scent stays close, like margin notes in a favourite book. You're not trying to fill a room — you're building an atmosphere."
  narrative.environments: "Quiet corners, after-hours galleries, candlelit restaurants."
  narrative.social_energy: "You prefer one deep conversation to ten shallow ones. Your presence lingers after you leave."
  recommendations.preferred_families: ["Woody", "Amber", "Gourmand", "Oud"]
  recommendations.avoid_families: ["Aquatic", "Fresh Spicy"]
  recommendations.layering_tips: ["Layer a dry cedar over your base to sharpen the wood for daytime.", "Add a single spray of incense at the neck for winter evenings."]
  ui_theme.accentColor: "#c28b5b"
  ui_theme.bgGradient: "linear-gradient(135deg, rgba(44,26,17,0.12) 0%, rgba(92,61,46,0.08) 100%)"
  ui_theme.cardBg: "rgba(44,26,17,0.04)"
  discover_filters.families: ["Woody Oriental", "Oriental", "Amber", "Oud"]
  discover_filters.projections: []

PERSONA 2 — The Solar Minimalist
  sanctuary: "greenhouse", projection: "solar"
  scent_spectrum.top: ["neroli", "bergamot", "white musk"]
  scent_spectrum.heart: ["jasmine", "green fig", "cucumber"]
  scent_spectrum.base: ["white cedar", "vetiver", "light musk"]
  narrative.tagline: "Your scent announces you before you speak."
  narrative.what_this_says: "Clean lines. Confident projection. You wear fragrance like punctuation — it completes the sentence."
  narrative.environments: "Open plan offices, rooftop bars, morning runs."
  narrative.social_energy: "You're energising to be around. People remember how you made them feel, not just what you said."
  recommendations.preferred_families: ["Citrus", "Aquatic", "Green", "Fresh Spicy"]
  recommendations.avoid_families: ["Heavy Oud", "Gourmand"]
  recommendations.layering_tips: ["Layer a citrus soliflore over a white musk base for a clean +40% projection.", "Add a marine accord in summer to extend the fresh phase by 2 hours."]
  ui_theme.accentColor: "#4a9a7a"
  ui_theme.bgGradient: "linear-gradient(135deg, rgba(74,154,122,0.08) 0%, rgba(200,235,215,0.12) 100%)"
  ui_theme.cardBg: "rgba(74,154,122,0.04)"
  discover_filters.families: ["Citrus", "Aquatic", "Green", "Fresh Spicy"]
  discover_filters.projections: ["Light", "Moderate", "Soft"]

PERSONA 3 — The Dark Alchemist
  sanctuary: "alley", projection: "magnetic"
  scent_spectrum.top: ["black pepper", "cardamom", "smoky incense"]
  scent_spectrum.heart: ["oud", "leather", "rose absolute"]
  scent_spectrum.base: ["dark amber", "benzoin", "labdanum"]
  narrative.tagline: "You wear fragrance as armour and invitation at once."
  narrative.what_this_says: "Bold. Polarising on purpose. You know not everyone will get it — that's exactly the point."
  narrative.environments: "Late nights, underground venues, anything with low lighting and good speakers."
  narrative.social_energy: "Magnetic in small groups. You draw people in without trying."
  recommendations.preferred_families: ["Leather", "Tobacco", "Smoky", "Resinous", "Oud"]
  recommendations.avoid_families: ["Aquatic", "Light Floral"]
  recommendations.layering_tips: ["Layer a smoky oud over a leather base for projection that lasts past midnight.", "A drop of rose absolute on the wrist softens the aggression without losing the edge."]
  ui_theme.accentColor: "#8a4a6a"
  ui_theme.bgGradient: "linear-gradient(135deg, rgba(40,20,30,0.14) 0%, rgba(100,40,70,0.08) 100%)"
  ui_theme.cardBg: "rgba(40,20,30,0.06)"
  discover_filters.families: ["Leather", "Tobacco", "Smoky", "Resinous", "Woody Oriental", "Oud"]
  discover_filters.projections: ["Heavy", "Strong", "Massive"]

Export: PERSONAS array, getPersonaById(id: string), getPersonaByInputs(sanctuary, projection) → Persona

SUB-AGENT B — Profiler UI (3 steps + Reveal)
Files: app/onboarding/page.tsx + step components

State: { step: 1|2|3|4, sanctuary: string|null, projection: string|null, context: string[] }
localStorage key: scentral_persona (stores the computed persona id)
localStorage key: scentral_onboarded (set to 'true' after reveal)

STEP 1 — Sanctuary (which environment feels like yours?)
Headline: "Where do you go when the world gets loud?"
Sub: "Choose the space that feels most like you."
Options (tile grid, 2×3, 80×80px each with icon + name + 1-line sensory cue):
  - The Lost Archive — "Leather, dusty vanilla, mahogany"
  - The Sunlit Greenhouse — "Green fig, neroli, wet earth"
  - The Observatory — "Cold air, clean cedar, ozone"
  - The Midnight Alley — "Smoke, oud, rain on stone"
  - The Desert Dune — "Warm amber, dry wood, sunset"
  - The Harbour Dawn — "Salt, citrus, cool linen"
Each tile: border 1px var(--line), border-radius 12px, padding 12px
Active tile: border-color var(--accent), background tinted with persona preview colour
Tap: advance to step 2 immediately (no Next button)

STEP 2 — Projection (how do you want to land?)
Headline: "How close do you want to be felt?"
Sub: "This shapes how your scent moves through a room."
3 options (full-width stacked cards, not a grid):
  - Up Close — "Intimate. A secret shared between you and whoever leans in."
  - In The Room — "Present. You're noticed without being announced."
  - Everywhere — "Unforgettable. You've arrived before you walk in."
Tap: advance to step 3

STEP 3 — Context (when do you usually reach for fragrance?)
Headline: "When do you usually reach for it?"
Sub: "Pick all that apply."
Multi-select pill grid:
  Workday, Date Night, Morning Ritual, Weekend Wander,
  Cosy Night In, Going Out, Travel, Occasion
Min 1 selection. CTA button: "Find my scent identity →"

REVEAL SCREEN (step 4)
- Look up persona from lib/personas.ts using getPersonaByInputs(sanctuary, projection)
- Full-screen reveal with persona ui_theme.bgGradient as page background
- Large persona name in var(--font-display), 32px, italic
- Tagline in --text-muted, 16px
- Three narrative bullets (what_this_says, environments, social_energy)
- Amber separator line
- "Your notes" — three columns: Top / Heart / Base with note tags
- Primary CTA: "Explore scents for [persona name] →"
  → navigates to /discover?persona=[id]
  → writes scentral_persona + scentral_onboarded to localStorage
- Secondary: "Try a different identity →" (goes back to step 1)

Transitions between steps: fade + slide up 120ms ease-out.
Progress indicator: top-right "1/3", "2/3", "3/3" — no dots, no progress bar.
Reduced motion: disable slide, keep fade only (@media prefers-reduced-motion).

Commit: "feat(onboarding): Sanctuary profiler, persona engine, reveal screen"
CSS variables only. No secrets.
```

---

### Prompt 1-B: Persona-Aware Discover Integration

```
You are a senior Next.js/Supabase engineer. Read AGENTS.md first.
Files: app/(main)/discover/DiscoverClient.tsx, app/(main)/discover/page.tsx

TASK: Make Discover persona-aware. When a persona exists in localStorage,
pre-filter and personalise the Discover tab.

1. In DiscoverClient, on mount read localStorage key 'scentral_persona'.
   Import PERSONAS from lib/personas.ts. Find the matching persona.

2. If persona found AND no active filters are set AND URL has ?persona=[id]:
   - Pre-apply discover_filters.families to the feel filter chips (visual highlight)
   - Pre-apply discover_filters.projections to the projection filter chips
   - Show a persona banner above the grid:
     <div style={{
       background: persona.ui_theme.cardBg,
       border: `1px solid ${persona.ui_theme.accentColor}30`,
       borderLeft: `3px solid ${persona.ui_theme.accentColor}`,
       borderRadius: 8, padding: '10px 14px', marginBottom: 16
     }}>
       <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
         Curated for
       </p>
       <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)',
                   fontFamily: 'var(--font-display)' }}>
         {persona.name}
       </p>
       <button onClick={clearPersonaFilter} style={{ fontSize: 11,
         color: 'var(--text-muted)', marginTop: 4 }}>
         Show everything instead →
       </button>
     </div>

3. clearPersonaFilter: remove active filter chips, hide persona banner.
   Do NOT remove localStorage — just clear the active filter state.

4. Page title update: if persona active, show
   "Discover · For {persona.name}" in the page header instead of just "Discover".

5. URL param handling: /discover?persona=velvet_intellectual should auto-apply
   the persona filter on load. This is the deep link from the onboarding reveal CTA.

Commit: "feat(discover): persona-aware pre-filtering + persona banner"
```

---

## PHASE 2 — Sensory UI & Design Token Alignment
### "The UI that feels like the fragrance it's showing you"

The v1 launch spec describes a `sensory_theme` system where the UI's visual treatment changes based on olfactory family. Implement the foundational layer for this.

---

### Prompt 2-A: Design Token Alignment + Instrument Serif

```
You are a senior CSS/design-systems engineer. Read AGENTS.md first.
File: app/globals.css, app/layout.tsx

Current tokens: --accent, --surface, --text, --text-muted, --line, --r-card, --motion-fast, --font-display

TASK: Align with brand system without breaking existing components.
Add brand tokens alongside existing ones via var() bridging.

In :root, add:
  --color-primary: #A0622A;
  --color-bg: #F7F3EE;
  --color-surface: #FAF7F2;
  --color-surface-2: #FDFCF9;
  --color-surface-offset: #EDE9E2;
  --color-text: #1E1714;
  --color-text-muted: #6B635A;
  --color-text-faint: #B5AFA8;
  --color-gold: #C49A3C;
  --color-border: #D8D2CA;
  --color-success: #4A7A50;
  --color-error: #A03050;
  --shadow-sm: 0 1px 3px oklch(0.2 0.02 60 / 0.08);
  --shadow-md: 0 4px 16px oklch(0.2 0.02 60 / 0.10);
  --shadow-lg: 0 12px 40px oklch(0.2 0.02 60 / 0.14);
  --shadow-card: 0 2px 8px oklch(0.2 0.02 60 / 0.08), 0 8px 24px oklch(0.2 0.02 60 / 0.06);

Bridge existing tokens:
  --accent: var(--color-primary);
  --surface: var(--color-surface);
  --text: var(--color-text);
  --text-muted: var(--color-text-muted);
  --line: var(--color-border);

Add dark mode block [data-theme="dark"]:
  --color-bg: #161310;
  --color-surface: #1D1916;
  --color-surface-2: #231F1B;
  --color-primary: #D4884A;
  --color-text: #E8E0D5;
  --color-text-muted: #9E9589;
  --color-gold: #E8C060;
  --color-border: #3A3530;

Add font loading to app/layout.tsx <head>:
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet" />

Set in :root:
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Satoshi', 'Inter', sans-serif;

Apply Instrument Serif to fragrance names:
  Grep for name renders in: BottleCard, DiscoverClient card, detail page heading
  Add fontFamily: 'var(--font-display)' to those elements.
  Fragrance names should ALWAYS render in serif. Brand/house names stay sans-serif.

Commit: "feat(design): brand token alignment, Instrument Serif, dark mode tokens"
```

---

### Prompt 2-B: Sensory Ambient Filter Effect + Persona Theme Layer

```
You are a senior CSS animation engineer. Read AGENTS.md first.
Files: app/(main)/discover/DiscoverClient.tsx, app/globals.css

PART 1 — Ambient filter colour wash (from UAT feedback):
When a feel chip is selected, the page gets a hardware-accelerated ambient colour wash.

Ambient colour map (define as const outside component):
  'Warm & Rich':    { bgGlow: 'rgba(160,98,42,0.06)',   chipColor: '#A0622A' }
  'Fresh & Clean':  { bgGlow: 'rgba(42,130,100,0.06)',  chipColor: '#2A8264' }
  'Bold & Lasting': { bgGlow: 'rgba(60,40,30,0.08)',    chipColor: '#3C281E' }
  'Light & Subtle': { bgGlow: 'rgba(140,110,180,0.05)', chipColor: '#8C6EB4' }

Implementation:
1. Chip active state: border-color → chipColor, background → chipColor at 15% opacity,
   color → chipColor. Transition: 200ms cubic-bezier(0.16, 1, 0.3, 1)
2. Page glow: add a fixed div sibling to the discover container:
   <div aria-hidden="true" style={{
     position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
     background: activeGlow, // state variable, one of the bgGlow values
     transition: 'background 300ms ease',
     willChange: 'background',
   }} />
   When no filter active: activeGlow = 'transparent'
3. Multiple filters: use the colour of the most recently selected chip.

PART 2 — Persona theme overlay (if persona is active from Phase 1):
When a persona is loaded from localStorage:
  Apply persona.ui_theme.bgGradient as the discover page background gradient
  (as a CSS var injected via inline style on the root discover container).
  This creates the effect that the page itself has taken on the character of the persona.
  Fade in on mount: opacity 0 → 1 over 400ms.
  When user clears persona filter: fade gradient out over 300ms, return to default bg.

WCAG note: all text must maintain contrast ratios. The bgGlow values above are chosen
to be very low opacity; verify no text falls below 4.5:1 contrast against them.

Commit: "feat(discover): ambient feel-filter colour + persona theme overlay"
```

---

### Prompt 2-C: Micro-Interaction Foundation

```
You are a senior React/motion engineer. Read AGENTS.md first.
Scope: add foundational micro-interactions to the highest-leverage surfaces.
No external animation library — CSS transitions and keyframes only.

HIGH-LEVERAGE SURFACE 1 — Fragrance card focus/hover (Discover + Collection):
On hover/focus of any fragrance card:
  transform: scale(1.02), transition: 180ms ease
  box-shadow: var(--shadow-md)
  From: transform scale(1), shadow-card
On blur/mouseout: reverse, 120ms ease

HIGH-LEVERAGE SURFACE 2 — Add to collection button (Discover card):
On tap: scale 0.96 for 80ms, then scale 1.04 for 120ms, then scale 1.00 for 100ms
This is the "satisfying press" pattern.

HIGH-LEVERAGE SURFACE 3 — AffinityRater chip selection:
Current: instant colour swap.
Improve: add a subtle radial pulse from the tap point.
CSS keyframe:
  @keyframes chip-pulse {
    0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent); }
    70%  { box-shadow: 0 0 0 8px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
Apply .chip-pulse class (add then remove after 400ms) on chip click.

HIGH-LEVERAGE SURFACE 4 — Log Wear button:
On tap:
  1. Button text flashes to "✓ Logged" for 1.5 seconds
  2. If streak >= 3: show streak toast (see Phase 4)
  3. Return to original state

HIGH-LEVERAGE SURFACE 5 — Persona reveal screen (Phase 1):
Entrance animation for reveal card:
  opacity 0 → 1 over 400ms, transform translateY(24px) → translateY(0) over 400ms
  Each narrative bullet staggers: 0ms, 120ms, 240ms delay
  Note tags in the pyramid: stagger 40ms per tag

All animations: respect @media (prefers-reduced-motion: reduce) — disable or reduce.

Commit: "feat(motion): card hover, button press, chip pulse, log wear flash, reveal entrance"
```

---

## PHASE 3 — Discovery Polish & Social Proof

---

### Prompt 3-A: Natural Language Similarity Explanations

```
You are a senior Next.js engineer. Read AGENTS.md first.
Files: app/(main)/collection/[id]/page.tsx, lib/similarity.ts (create)

The detail page has an "InspiredByClones" section and a "Smells Like [Designer]" card.
Currently these are static links. Make them intelligent.

1. Create lib/similarity.ts with the similarity_explanation function:

type SimilarityBand = 'high' | 'medium' | 'adjacent'
type SimilarityExplanation = {
  title: string
  summary: string
  guidance: { when_to_choose: string; caveats: string }
}

function getSimilarityExplanation(
  scorePct: number,     // 0–100 from inspired_by confidence or manual
  targetName: string,   // the designer original
  cloneName: string,    // the nota. catalogue entry
): SimilarityExplanation {
  if (scorePct >= 90) return {
    title: "Practically twins",
    summary: `${cloneName} and ${targetName} share the same backbone.
               Most people can't tell them apart after 30 minutes on skin.`,
    guidance: {
      when_to_choose: "If you love the drydown of the original but want a smarter price.",
      caveats: "The opening may smell slightly sweeter or lighter on first spray."
    }
  }
  if (scorePct >= 70) return {
    title: "Very close — different first impression",
    summary: `${cloneName} is strongly inspired by ${targetName}.
               The heart and base are nearly identical; the opening takes a different route.`,
    guidance: {
      when_to_choose: "If you care more about how it wears than how it opens.",
      caveats: "If the first spray of the original is what you love, try a sample first."
    }
  }
  return {
    title: "Same family, different character",
    summary: `${cloneName} shares the olfactory DNA of ${targetName}
               but brings its own personality. A great alternative, not a copy.`,
    guidance: {
      when_to_choose: "If you want something in the same mood at a different price point.",
      caveats: "Don't expect them to smell identical — that's not the point."
    }
  }
}

2. Wire into detail page:
   In the "Smells Like [Designer]" card, below the designer name:
   - Compute a default 85% score for direct inspired_by entries (no score in DB yet)
   - Render the explanation:
     <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
       <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
         {explanation.title}
       </strong>
       {' — '}{explanation.summary}
     </p>
     <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
       💡 {explanation.guidance.when_to_choose}
     </p>

3. On InspiredByClones row cards, add a small similarity badge:
   <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-gold)',
     background: 'var(--color-gold-highlight, rgba(196,154,60,0.12))',
     borderRadius: 999, padding: '2px 8px' }}>
     ~90% match
   </span>

Commit: "feat(detail): natural language similarity explanations + clone badges"
```

---

### Prompt 3-B: Social Proof Counts
**Fan out: 2 parallel sub-agents**

```
Read AGENTS.md first. Architecture: NO AUTH. All counts are public aggregates.

SUB-AGENT A — Database RPC
Create Supabase RPC (add via migration file, do NOT use Supabase MCP for schema changes):
  File: supabase/migrations/[timestamp]_social_proof_rpc.sql

  CREATE OR REPLACE FUNCTION get_fragrance_social_proof(fragrance_ids uuid[])
  RETURNS TABLE(fragrance_id uuid, owner_count bigint)
  LANGUAGE sql STABLE AS $$
    SELECT fragrance_id, COUNT(*) as owner_count
    FROM collections
    WHERE fragrance_id = ANY(fragrance_ids)
    GROUP BY fragrance_id;
  $$;

Create API route: app/api/social-proof/route.ts
  POST { fragrance_ids: string[] }
  Returns: Record<string, { ownerCount: number }>
  Add Next.js revalidate: 300

SUB-AGENT B — UI Integration
In DiscoverClient — after fragrances load, batch-fetch social proof:
  const proof = await fetch('/api/social-proof', {
    method: 'POST', body: JSON.stringify({ fragrance_ids: fragrances.map(f => f.id) })
  }).then(r => r.json())
  Store in state.

Per card, show if count > 0:
  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex',
    alignItems: 'center', gap: 4, marginTop: 4 }}>
    <UsersIcon size={11} />
    {count} {count === 1 ? 'person owns this' : 'people own this'}
  </span>

On detail page:
  Single fragrance fetch via same API.
  Show: "X people in the nota. community own this"
  Style: --text-sm, --text-muted, Lucide Users icon (size 14)

Commit: "feat(social): owner count on discover cards + detail page"
```

---

### Prompt 3-C: Social Tab — Top Voices & Rising Voices

```
You are a senior React/TypeScript engineer. Read AGENTS.md first.
File: app/(main)/social/ — upgrade from shell to curated creator directory.
No auth. No DB calls. Static data component.

[Full creator data and implementation as specified in LAUNCH_PLAN v1 Phase 2-B]
(Copy prompt 2-B verbatim from v1 — creator data and card spec unchanged)

Add one enhancement not in v1:
After the creator sections, add a "Trending Right Now" section.
Hardcode 3 trending fragrance name + creator + why it's trending:
  - "Lattafa Asad" by @extraitderayen — "3.2M views this week. The winter oud moment."
  - "Khadlaj Hareem Al Sultan" by @milanscents — "1.8M views. 'Cheaper than Baccarat Red.'"
  - "Afnan 9PM" by @danielrenefragrances — "900K views. The everyman powerhouse."
Each entry links to the fragrance detail page in Discover if the fragrance exists in the DB.

Commit: "feat(social): creator directory + trending section"
```

---

## PHASE 4 — Living Wardrobe Visual Overhaul

---

### Prompt 4-A: Shelf Bug Fix — Bottle Depth & Visual Presence

```
You are a senior CSS engineer. Read AGENTS.md first.
Files: app/(main)/collection/WardrobeShelf.tsx, app/(main)/collection/ShelfTier.tsx,
       app/(main)/collection/BottleCard.tsx

CONFIRMED BUG: Shelf renders as stretched brown background. Bottles appear flat.
DO NOT REMOVE the cabinetSnapshot event hook. Leave all dnd-kit logic intact.

Fix ShelfTier.tsx — shelf plank effect:
  background: linear-gradient(180deg,
    rgba(139,90,43,0.15) 0%, rgba(101,64,28,0.25) 40%, rgba(80,50,20,0.35) 100%);
  border-bottom: 3px solid rgba(60,35,10,0.4);
  box-shadow: 0 4px 12px rgba(40,20,5,0.2), inset 0 1px 0 rgba(255,200,120,0.15);
  border-radius: 2px;
  min-height: 140px;
  padding: 16px 12px 8px;

Shelf lip shadow div after each tier:
  <div style={{ height:8, background:'linear-gradient(180deg,rgba(30,15,5,0.2),transparent)',
    marginBottom:24 }} />

Fix BottleCard.tsx — upright bottles:
  Container: display:flex, flexDirection:column, alignItems:center, width:72px, cursor:grab
  Image area: width:52px, height:88px, display:flex, alignItems:flex-end, justifyContent:center
  Image: maxWidth:'100%', maxHeight:'100%', objectFit:'contain',
         filter:'drop-shadow(0 4px 8px rgba(30,15,5,0.3))'
  Shadow puddle below bottle:
    <div style={{ width:40, height:6,
      background:'radial-gradient(ellipse, rgba(30,15,5,0.25) 0%, transparent 70%)',
      marginTop:-2 }} />
  Bottle name: fontSize:10, textAlign:'center', color:'var(--text-muted)',
               maxWidth:68, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'

Commit: "fix(wardrobe): shelf depth, bottle upright positioning, drop shadows"
```

---

### Prompt 4-B: Shelf View Mode Visual Themes

```
[Copy prompt 3-B verbatim from LAUNCH_PLAN v1 — By Collection/Wishlist/House/Season themes]
All instructions unchanged. Add one addition:

When By House view is active and a persona is loaded (from Phase 1):
If the persona is 'velvet_intellectual' or 'dark_alchemist':
  Highlight Lattafa, Afnan, Khadlaj house headers with slightly warmer tones.
  Override their HOUSE_COLOURS entry to add 0.1 opacity amber overlay on the bg.
This is the persona-shelf binding from the v1 launch spec (Section 10.3).

Commit: "feat(wardrobe): shelf view mode themes + persona-shelf binding"
```

---

## PHASE 5 — Copy Rewrite & Onboarding Polish

---

### Prompt 5-A: Landing Page + Empty States + UX Copy

```
[Copy prompt 1-C verbatim from LAUNCH_PLAN v1]

Additional requirements:
The current landing page CTA is "Join the waitlist" with an archetype chip form.
Now that the Sanctuary profiler exists (Phase 1), the landing CTA must change:
  Primary CTA: "Find your scent identity →" → links to /onboarding
  Remove: waitlist form, archetype chips, "Join 800+ enthusiasts" line
  Keep: the Christopher moment card ("Your £140 bottle has an £18 clone...")
  Add: 3 persona teaser cards below the hero (one per launch persona):
    Small cards, 80px wide, persona name + tagline, persona accent colour strip.
    "Which one are you?" as a section label above them.
    Each taps to /onboarding.

This positions the profiler as the entry point, not a separate onboarding gate.

Commit: "copy: landing page → profiler entry, empty states, British English"
```

---

### Prompt 5-B: Returning User Experience

```
You are a senior React engineer. Read AGENTS.md first.
Files: app/(main)/you/YouClient.tsx

The You tab is where returning users live. Improve it for returning Gavan.

1. Persona card at the top of You tab:
   Read scentral_persona from localStorage. If set, show:
   <div style={{
     background: persona.ui_theme.cardBg,
     border: `1px solid ${persona.ui_theme.accentColor}30`,
     borderLeft: `3px solid ${persona.ui_theme.accentColor}`,
     borderRadius: 12, padding: '14px 16px', marginBottom: 20
   }}>
     <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform:'uppercase',
       letterSpacing:'0.1em' }}>Your Scent Identity</p>
     <p style={{ fontSize: 20, fontFamily:'var(--font-display)', fontStyle:'italic',
       color:'var(--text)', marginTop: 4 }}>{persona.name}</p>
     <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
       {persona.narrative.tagline}</p>
     <button onClick={() => router.push('/onboarding')}
       style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
       Retake profiler →
     </button>
   </div>

2. Daily wear prompt (if no wear logged today — same as LAUNCH_PLAN v1 Prompt 4-A):
   [Full implementation as in v1 Prompt 4-A]

3. Wear streak toast:
   [Full implementation as in v1 Prompt 4-A]

Commit: "feat(you): persona card, daily wear prompt, streak toast"
```

---

## PHASE 6 — Analytics & Telemetry

### This phase was missing entirely from v1. Without it, you can't learn after launch.

---

### Prompt 6-A: PostHog Analytics Integration

```
You are a senior Next.js engineer. Read AGENTS.md first.
Install: npm install posthog-js posthog-node

Create: lib/analytics.ts

import posthog from 'posthog-js'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://eu.posthog.com',
    capture_pageview: false, // we'll do this manually
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    }
  })
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(name, props)
}

export function identifyPersona(personaId: string) {
  posthog.capture('$set', { $set: { persona: personaId } })
}

Add NEXT_PUBLIC_POSTHOG_KEY to .env.local (not committed).
Add to .env.example: NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key-here

Call initAnalytics() in app/layout.tsx useEffect (client component wrapper if needed).

EVENTS TO INSTRUMENT (high-leverage surfaces per spec Section 8):
Wire trackEvent() at these exact moments:

  onboarding_started    — when user lands on /onboarding
  sanctuary_selected    — { sanctuary: string }
  projection_selected   — { projection: string }
  context_selected      — { context: string[] }
  persona_revealed      — { persona_id: string } ← highest leverage
  persona_to_discover   — { persona_id: string } ← activation
  bottle_added          — { fragrance_id: string, brand: string }
  wear_logged           — { fragrance_id: string, streak: number }
  accord_saved          — { fragrance_count: number }
  wishlist_toggled      — { fragrance_id: string, action: 'add'|'remove' }
  affiliate_clicked     — { fragrance_id: string, retailer: string } (future)
  share_card_tapped     — { type: 'accord'|'wardrobe' } (future)
  filter_applied        — { type: 'feel'|'longevity'|'brand', value: string }
  search_used           — { query_length: number } (no PII — length only)

DO NOT track: raw search queries, user email, device identifiers.
Respect: do not track if Do Not Track header is set.

Commit: "feat(analytics): PostHog integration + high-leverage surface events"
Note: Add NEXT_PUBLIC_POSTHOG_KEY to Vercel environment variables (do this manually).
```

---

## PHASE 7 — Legal, Store Assets & Submission
### The gate you must pass

---

### Prompt 7-A: Privacy Policy + Terms of Service

```
You are a legal-tech copywriter specialising in Irish/UK consumer apps.
Create two documents. Output as markdown to:
  app/(main)/privacy/page.tsx — render the privacy policy
  app/(main)/terms/page.tsx — render the terms of service

PRIVACY POLICY requirements:
- GDPR (Ireland) and UK GDPR compliant
- Must cover: what data is collected (localStorage only — no server-side user data in MVP),
  Supabase analytics (wear_logs, collections — anonymous), PostHog analytics (anonymised),
  affiliate link tracking, cookie policy
- Plain English. No legal jargon.
- Data controller: Christopher Goslin, Ireland
- Contact: christophergoslin@outlook.com
- Last updated: 2026-06-16
- Key claim: "We do not require an account. We do not store your email.
  Your collection is anonymous."

TERMS OF SERVICE requirements:
- Governing law: Republic of Ireland
- User-generated content: none in MVP (no UGC rules needed yet)
- Affiliate disclosure: "Some links earn nota. a small commission at no cost to you."
- Age: 13+ (standard for lifestyle apps)
- Limitation of liability: standard

Add links to both from app/(main)/you/YouClient.tsx Settings section:
  "Privacy Policy" and "Terms of Service" as text links.

Commit: "legal: privacy policy + terms of service, GDPR compliant"
```

---

### Prompt 7-B: App Store Assets + Copy

```
TASK: Generate all text assets for App Store and Play Store submission.
Output to docs/app-store-copy.md

APPLE APP STORE:
Short description (30 chars): "Your fragrance wardrobe app."

Full description (British English, 4000 char max):
Lead: "nota. is a fragrance app built for people who actually care about what they smell like.
Not collectors with encyclopaedic knowledge — just people with a growing wardrobe and a nose for what works."

Features (prose, not bullets):
  Discover 280+ fragrances — dupes, Middle Eastern gems, and designer alternatives —
  with honest descriptions written for beginners, not enthusiasts.

  Build your wardrobe in seconds. Search by brand, vibe, or description.
  Rate your bottles by how often you actually reach for them.

  Find your scent identity. The 15-second Sanctuary Profiler asks you two questions
  and gives you back a persona — a curated identity that shapes everything you see in the app.

  Layer like a pro. The Layering Lab suggests what works together and explains why
  in plain English, not note pyramids.

  Know your shelf. The Living Wardrobe organises your collection by affinity tier —
  your signatures at the top, your experiments at the bottom. Drag, drop, sort.

  Discover cheaper alternatives. See what each fragrance was inspired by and how close
  the copy really is. Stop paying £150 for something you can get for £18.

Closing: "No account required. No reviews you didn't ask for. Just a better way to
know your collection."

Keywords (100 chars):
"fragrance,perfume,wardrobe,cologne,scent,oud,lattafa,dupe,layering,collection,parfum"

Category: Lifestyle
Age rating: 4+
Support URL: https://scentral-hub.vercel.app
Privacy URL: https://scentral-hub.vercel.app/privacy
Marketing URL: https://scentral-hub.vercel.app

GOOGLE PLAY STORE:
Short description (80 chars): "Build your fragrance wardrobe. Layer. Discover. Find your scent identity."
Full description: same as App Store.
Content rating: Everyone

SCREENSHOT SEQUENCE (write caption overlays for each):
  1 → "Find your scent identity" (onboarding persona reveal)
  2 → "280+ fragrances, curated for you" (Discover tab, persona-filtered)
  3 → "Know what you own. Know what you love." (Collection + shelf)
  4 → "Layer like you know what you're doing." (Layering Lab)
  5 → "Your £18 bottle smells like your £150 bottle." (Detail page, Smells Like card)
  6 → "The community. The creators. The honest takes." (Social tab)

OUTPUT FILE: docs/app-store-copy.md
Commit: "docs: app store copy, screenshots spec, play store copy"
```

---

### Prompt 7-C: Pre-Submission Quality Checklist

```
You are a senior QA engineer. Read AGENTS.md first.
Run a pre-submission audit. Report PASS/FAIL. Write to docs/presubmission-checklist.md

PHASE 1 GATE:
□ /onboarding exists and completes all 3 steps without error
□ Persona reveal screen renders for all 3 personas
□ localStorage scentral_persona is written after reveal
□ Discover tab reads persona and shows persona banner + pre-filtered results
□ /onboarding clears and resets correctly on "Try a different identity →"

PWA & MOBILE:
□ All 5 tabs load at 390px without horizontal scroll
□ BottomNav does not overlap content with home indicator on iPhone
□ manifest.json: display=standalone, start_url=/discover, icons present
□ Apple meta tags present in <head>
□ min-h-[100dvh] used consistently (grep for min-h-screen)

PERFORMANCE:
□ run `next build` — no chunk > 500KB
□ No console errors on fresh /discover load
□ Images all use object-contain within fixed aspect ratios

CONTENT:
□ No "TODO", "placeholder", "coming soon" visible to users
□ /social tab has creator directory (not blank)
□ Landing page hero has production copy (not waitlist form)
□ Empty states exist on all 5 tabs
□ Privacy policy at /privacy loads
□ Terms of service at /terms loads

LEGAL:
□ Affiliate disclosure visible on any page with outbound purchase links
□ Privacy policy and terms links visible in You tab settings
□ No hardcoded API keys in source (grep: sk-, anon_, service_role)
□ PostHog key only in process.env (not hardcoded)

ANALYTICS:
□ persona_revealed event fires in PostHog on persona reveal
□ bottle_added event fires on add-to-collection
□ wear_logged event fires on log a wear

Run: node scripts/smoke-test.mjs — report 9-route result table.
Flag each FAIL as BLOCKING or NON-BLOCKING.
```

---

## PHASE 5 (continued) — Educational Layer: Fun Facts, Dos & Don'ts, Contextual Tips

These are the moments that make users feel smart. They don't teach at the user — they reveal things they didn't know they already knew.

---

### Prompt 5-C: Fragrance Fun Facts + Dos & Don'ts System

```
You are a senior React/content engineer. Read AGENTS.md first.
No auth. Static content component layer.

CREATE: lib/fragrance-education.ts

The education system has three types of content:
1. FUN FACTS — rotating contextual facts shown on the detail page
2. DOS & DON'TS — layering, storage, wear rules shown in the Layering Lab and detail pages
3. CONTEXTUAL TIPS — persona-aware hints shown in Discover and Collection

------ FUN FACTS (rotate per page load, pick 1 of 3 themed to the fragrance family) ------

Define FRAGRANCE_FUN_FACTS as Record<string, string[]>:

  'Oud': [
    "Real oud comes from infected agarwood trees — only 2% of wild trees produce it naturally. That's why it costs more per gram than gold.",
    "Oud has been traded in the Middle East for over 3,000 years. Ancient Egyptians burned it in temples. Your bottle carries that lineage.",
    "A single kilo of pure oud oil can cost between £30,000 and £100,000. Most 'oud' fragrances use synthetic reconstructions — which is fine. Just interesting.",
  ],
  'Amber': [
    "Amber in fragrance isn't the fossilised tree resin you're thinking of. It's a blend — usually labdanum, benzoin, and vanilla — that recreates a warm, resinous feel.",
    "What we call 'amber' in perfumery was popularised in the 1920s as 'Oriental' — a catch-all for warm, exotic, resinous compositions. The modern term just sounds less dated.",
    "Ambergris — old-school 'amber' — is a waxy substance produced in sperm whale intestines. Worth over £30/gram. It's now banned in many countries, and most ambergris notes are synthetic.",
  ],
  'Floral': [
    "It takes roughly 8 million hand-picked jasmine flowers to produce 1 kilo of absolute. That's why real jasmine in fragrance is expensive and most uses a synthetic surrogate.",
    "Rose absolute and rose otto are completely different things. Absolute is solvent-extracted, dense, and very true. Otto is steam-distilled, lighter, and greener. Both are expensive. Both smell incredible.",
    "Ylang ylang is one of the most versatile floral materials in perfumery — it appears in everything from Chanel No. 5 to masculine leathers. It smells different depending on what surrounds it.",
  ],
  'Woody': [
    "Sandalwood from Mysore, India is some of the most expensive wood in the world — heavily regulated due to near-extinction. Most sandalwood in fragrance today is Australian or synthetic (Javanol, Polysantol).",
    "Vetiver roots grow downward, not outward. The deeper the roots, the richer the oil. Haitian vetiver is smoky; Indian vetiver is earthier; Javanese vetiver is cleaner. Same plant, very different results.",
    "Cedar in fragrance is almost always Virginia cedarwood — a juniper, technically, not a true cedar. Real Atlas cedar (from Morocco) smells significantly different: drier, greener, more pencil-shaving.",
  ],
  'Fresh': [
    "Aquatic notes don't exist in nature. 'Calone', the molecule behind sea-spray scents, was discovered by accident in the 1960s. Issey Miyake's L'Eau d'Issey (1992) launched a category.",
    "Citrus top notes are the most volatile molecules in a fragrance — they evaporate within 15–30 minutes on most skin. Citrus EDPs anchor them with heavier molecules to make them last.",
    "Clean cotton scents use a molecule called 'Galaxolide' — a synthetic musk originally used in laundry detergent. You were already wearing it before perfumery got to it.",
  ],
  'Gourmand': [
    "Vanilla in perfumery comes primarily from vanillin — either natural (from vanilla pods) or synthetic (from lignin). You almost certainly cannot tell the difference, and neither can most noses.",
    "The original gourmand fragrance was Angel by Thierry Mugler (1992) — it was the first mainstream commercial use of ethyl maltol (the molecule that smells like candy floss) in a fine fragrance. It was nearly rejected by every focus group.",
    "Caramel notes in fragrance use the same molecules that form when you heat sugar: furans and maltol. The molecule responsible for 'cotton candy' smell is ethyl maltol — about 6x sweeter-smelling than natural maltol.",
  ],
  'Tobacco': [
    "Tobacco in fragrance is typically reconstructed from molecules like isovaleric acid and tobacco absolute. Actual dried tobacco smells very different from 'tobacco' in perfumery — it's been romanticised.",
    "Most tobacco-forward fragrances are actually built on benzyl benzoate and coumarin (from tonka bean) — they create that slightly sweet, burnt-sugar, aromatic dryness without needing actual tobacco.",
    "The tobacco note in fragrance really took off in the 1970s Aromatic Fougères movement — fragrances like Yves Saint Laurent Pour Homme used it to create something between clean herbs and masculine warmth.",
  ],

// Default (shown for any family not listed above):
  'default': [
    "The first synthetic fragrance ingredient was coumarin, discovered in 1868. Before that, all perfumes used raw natural materials. Synthesis opened modern perfumery.",
    "Perfumers typically evaluate up to 400 ingredients when creating a formula. A simple fragrance might use 40–60 materials. A complex one can use over 100.",
    "Fragrance molecules are measured in parts per million. A 1% concentration in a formula can still be the defining character of an entire perfume.",
  ]

------ DOS & DON'TS (shown in Layering Lab + detail pages) ------

Define LAYERING_DOS_AND_DONTS as an array of { type: 'do'|'dont', title: string, body: string }:

  // DOs
  { type: 'do', title: 'Layer light before heavy',
    body: 'Apply your lighter, more transparent fragrance first. Let it settle for 2–3 minutes, then layer the denser one on top. The lighter note opens the space; the heavier one anchors it.' },
  { type: 'do', title: 'Use one anchor, one accent',
    body: 'Your "anchor" fragrance does the heavy lifting (projection, longevity, base). Your "accent" adds the character (top notes, freshness, surprise). Two anchors fight each other. Two accents disappear together.' },
  { type: 'do', title: 'Apply to pulse points, not clothes',
    body: 'Skin warmth is what activates fragrance. The inside of your wrists, neck, and inner elbows. Clothes trap fragrance differently — it often reads as stale rather than rich.' },
  { type: 'do', title: 'Try the combination on skin before committing',
    body: 'Paper strips lie. Combinations that smell odd on paper often bloom on skin. If you can, do a quick wrist test before deciding a layer doesn\'t work.' },
  { type: 'do', title: 'Match projection levels when layering',
    body: 'Combining an intimate projection fragrance with a crowd-filling beast creates an unbalanced mess. Match your layers: intimate+intimate, room+room, or intentionally use a light top over a strong base.' },
  { type: 'do', title: 'Let your base macerate before judging it',
    body: 'Give freshly opened bottles 2–4 weeks of regular exposure to air before forming a firm opinion. The top notes settle, the alcohol sharpness fades, and the true character emerges.' },

  // DON'Ts
  { type: 'dont', title: 'Don\'t rub your wrists together',
    body: 'Rubbing breaks the molecular structure of the top notes and bruises the accord. You\'re literally destroying the opening. Press, don\'t rub.' },
  { type: 'dont', title: 'Don\'t mix two dominant bases',
    body: 'Two heavy oud or two thick amber fragrances worn together create a wall — not a composition. One should dominate; the other should accent.' },
  { type: 'dont', title: 'Don\'t spray then immediately judge',
    body: 'The first 5 minutes are the most volatile — mostly alcohol and sharp top notes. Wait 15–20 minutes for the true accord to form before deciding if you like a fragrance.' },
  { type: 'dont', title: 'Don\'t store bottles in the bathroom',
    body: 'Humidity and heat degrade fragrance quickly. A cool, dark shelf or drawer is ideal. Direct sunlight turns fragrance flat and sometimes sour within months.' },
  { type: 'dont', title: 'Don\'t apply fragrance directly to broken or sensitive skin',
    body: 'Fragrance molecules can cause reactions on broken skin. If you have eczema or sensitivity, spray on clothes at distance, or pulse points that are fully intact.' },
  { type: 'dont', title: 'Don\'t layer more than 2–3 fragrances at once',
    body: 'Three is already advanced territory. Beyond three, you lose legibility — the composition becomes undefined noise rather than a coherent statement.' },

------ CONTEXTUAL TIPS (persona-aware, shown in Discover) ------

Define PERSONA_TIPS as Record<string, string[]>:

  'velvet_intellectual': [
    "Your DNA leans intimate — look for fragrances labelled 'moderate' or 'soft' projection. You want to be discovered, not announced.",
    "Oud and leather are your natural territory, but don't sleep on florals anchored in dark woods. Iris on mahogany is a Velvet Intellectual signature.",
    "For evening wear, try the 'pyramid layer' — a single citrus spray at the neck over your usual base. It extends your composition without losing the intimacy.",
  ],
  'solar_minimalist': [
    "Your strength is clarity. Look for fragrances described as 'transparent', 'aquatic', or 'green' — they carry without crowding.",
    "In hot weather, your fragrances will project more than the bottle suggests. Start with half your usual spray count and build up.",
    "The best layer for you is almost always a white musk base + a citrus top. It's a formula that works every time and stays cleanly in your register.",
  ],
  'dark_alchemist': [
    "Your profile is high-contrast by design. Don't tone it down — but consider the occasion. What reads as magnetic in a bar can be suffocating on a commute.",
    "For winter, try a drop of incense on the sternum, over your leather or oud base. It adds an ethereal upper register to what can otherwise read as purely dense.",
    "Your fragrances need time. Most of your best bottles will smell strange in the first 5 minutes and magnificent in the drydown. Learn your timings.",
  ],

------ IMPLEMENTATION ------

1. Detail page — Fun Fact card:
   Import getFunFact(family: string): string (random from the relevant array)
   Show below the note pyramid:
   <div style={{ border: '1px solid var(--line)', borderLeft: '3px solid var(--color-gold)',
     borderRadius: 8, padding: '12px 16px', marginTop: 20 }}>
     <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
       letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: 6 }}>Did you know?</p>
     <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
       {getFunFact(fragrance.family)}
     </p>
   </div>

2. Layering Lab — Dos & Don'ts panel:
   Below the suggestion cards, add a collapsible "Layering Rules" section.
   Default: collapsed (shows "5 dos & don'ts for layering →" as a tappable line).
   Expanded: 3 DOs (green left-border) + 3 DON'Ts (amber left-border), randomly selected each load.

3. Discover — Persona tips ticker:
   If persona is active, show a subtle tip above the card grid (not above the banner):
   Single tip from PERSONA_TIPS[persona.id], rotates each time the component mounts.
   Style: fontSize 12, color var(--text-muted), italic, no background, just a thin left border.

Commit: "feat(education): fun facts per family, layering dos & don'ts, persona tips"
```

---

### Prompt 5-D: Web Push Notifications (PWA — No Auth Required)
**Important: Push notifications work in standalone PWA mode via the Web Push API. No Firebase, no auth.**

```
You are a senior PWA engineer. Read AGENTS.md first.
Architecture: Web Push API (VAPID) + Supabase Edge Function. No auth.
Docs: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

SCOPE: 3 notification types. All are permission-gated (user must opt in).

------ Setup ------
Install: npm install web-push (server-side only)
Generate VAPID keys (one-time, not in code):
  Run locally: npx web-push generate-vapid-keys
  Add to .env.local:
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
    VAPID_PRIVATE_KEY=<your-private-key>  ← server only, never client
    VAPID_EMAIL=mailto:christophergoslin@outlook.com

Service Worker: public/sw.js (create/update)
  self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: data.tag ?? 'scentral',
        data: { url: data.url ?? '/discover' },
        vibrate: [100, 50, 100],
      })
    )
  })
  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(clients.openWindow(event.notification.data.url))
  })

Registration hook: lib/push.ts
  export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    // Save subscription to Supabase (anonymous row — no user id needed)
    await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub.toJSON()),
      headers: { 'Content-Type': 'application/json' },
    })
    return sub
  }

API route: app/api/push/subscribe/route.ts
  Saves the subscription object to a new Supabase table `push_subscriptions`:
    CREATE TABLE push_subscriptions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      endpoint text UNIQUE NOT NULL,
      keys jsonb NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  No user_id column — purely anonymous.
  Migration file: supabase/migrations/[timestamp]_push_subscriptions.sql

API route: app/api/push/send/route.ts (internal — called by cron/edge functions, not user-facing)
  Reads all push_subscriptions, sends message via web-push.

------ NOTIFICATION TYPE 1 — Maceration Countdown ------
Triggered: when user adds a new bottle for the first time (bottle_added event)
Scheduled: +7 days from add date (stored in localStorage as
  scentral_maceration_[fragrance_id]: ISO date string)
Check on app load: if any maceration dates have passed (or are within 24h), prompt.

Message:
  title: "Time to revisit 🧪"
  body: "Your [fragrance name] has had a week to settle. This is when they really reveal themselves."
  url: /collection/[fragrance_id]
  tag: maceration_[fragrance_id]

UX: On bottle detail page, show a "Maceration reminder" toggle (default off):
  "Remind me to retry in 7 days"
  When toggled on: call subscribeToPush() if not already subscribed, then save maceration date.

------ NOTIFICATION TYPE 2 — Wear Streak Risk ------
Triggered: if user has logged a wear 2+ consecutive days but hasn't logged one today by 6pm local.
Check: localStorage scentral_last_wear_date vs today.
Message:
  title: "Don't break the streak 🔥"
  body: "You've worn something for [N] days running. Open the app to keep it going."
  url: /collection
  tag: streak_reminder

------ NOTIFICATION TYPE 3 — New Fragrance Added to Discover ------
Triggered: Supabase Edge Function, when a new fragrance is added to the fragrances table.
Fires to all subscribed endpoints.
Message:
  title: "Just landed in Discover 🌿"
  body: "[Fragrance name] by [brand] is now in your catalogue."
  url: /discover
  tag: new_fragrance_[fragrance_id]

Frequency cap: max 1 new-fragrance notification per week per subscriber.

------ Permission prompt UX ------
Do NOT use the browser's native permission dialog on first load.
Instead, show a prompt in You → Settings:
  "Stay in the know — wear reminders, maceration timers, new arrivals."
  Toggle: "Enable notifications" → on toggle, call subscribeToPush()
  If already subscribed: toggle shows as on.

Commit: "feat(pwa-push): VAPID web push, maceration countdown, streak risk, new fragrance alerts"
```

---

## PHASE 8 — Post-Launch Growth
### Build these after your first 500 users

| Feature | Why it waits | Value |
|---|---|---|
| Persona expansion (6 full personas) | Need data on which 3 resonate | Add remaining: Solar Minimalist + 2 more |
| Affiliate link rows | Need retailer API agreements | Highest revenue feature |
| Auth / user accounts | Architecture decision — deliberate | After 500 MAU |
| Creator programme | Needs Stripe Connect | After first partnership |
| Blind-buy prediction engine | Needs wear log data (100+ users × 10 wears) | 6 months post-launch |
| Living Wardrobe Pro themes | Needs billing/Pro unlock | After Stripe |
| Community forum (Wear & Share) | Requires auth + moderation | After auth |
| Short reel uploads | Media storage + moderation | After auth |
| Dark mode toggle | Tokens ready — just needs UI | Quick post-launch win |
| Barcode scanning | Next import lane | Phase 2 product |
| Price comparison (5+ retailers) | Awin/CJ feed integration | After affiliate deals |

---

## Execution Order

```
IMMEDIATE (Week 1, parallel):
  → Prompt 0-A (PWA hardening) — 3 sub-agents
  → Prompt 0-B (Filter fix + Fuse.js) — 2 sub-agents
  → Prompt 0-C (Branch cleanup)

WEEK 1–2 (parallel, after 0-A):
  → Prompt 1-A (Sanctuary Profiler + Persona Engine) ← MOST IMPORTANT
  → Prompt 2-A (Design token alignment + Instrument Serif) — independent
  → Prompt 5-A (Copy rewrite) — independent

WEEK 2 (after 1-A):
  → Prompt 1-B (Persona-aware Discover)
  → Prompt 2-B (Ambient filter + persona theme)
  → Prompt 2-C (Micro-interaction foundation)
  → Prompt 3-A (Similarity explanations)

WEEK 2–3 (parallel):
  → Prompt 3-B (Social proof counts) — 2 sub-agents
  → Prompt 3-C (Social creator directory)
  → Prompt 4-A (Shelf bug fix)
  → Prompt 5-B (Returning user experience)
  → Prompt 5-C (Fun facts + Dos & Don'ts + Persona tips) — independent
  → Prompt 5-D (Web push notifications — maceration, streak, new arrivals)

WEEK 3:
  → Prompt 4-B (Shelf view mode themes, after 4-A)
  → Prompt 6-A (PostHog analytics) — integrate throughout

WEEK 3–4 (submission prep):
  → Prompt 7-A (Privacy policy + Terms of Service) — do this early, takes time
  → Prompt 7-B (App store copy + assets)
  → Prompt 7-C (Pre-submission QA checklist) — run last

Also add to 7-C checklist:
  □ Fun fact renders on detail pages for at least 3 fragrance families
  □ Dos & Don'ts panel renders in Layering Lab (collapsed by default)
  □ Push notification permission prompt visible in You → Settings
  □ Maceration toggle visible on bottle detail page

SUBMIT after 7-C returns 0 BLOCKING failures.
```

---

## The Single Test That Matters

Before you submit to the App Store, hand the phone to Gavan (or someone who is Gavan). Watch silently. If the first thing they say is "wait, that's actually me" on the persona reveal — you're ready. If they look confused or bored at any point in the first 30 seconds — there's still work to do.

The Sanctuary Profiler is the make-or-break feature. Everything else is table stakes for a good fragrance app. The profiler is what makes nota. *nota.*.

---

## Security Checklist (non-negotiable, every prompt)

- No secrets in code. `.env.local` only. `.env.example` has placeholders.
- CSS variables only — no hardcoded hex in component logic.
- Do not touch: ProGate, `/intelligence`, `/dna-match`, `/schedule`, auth flows, applied Supabase migrations.
- Affiliate links: `rel="noopener noreferrer"` on all outbound.
- Service role key: server-side scripts only, never client components.
- PostHog: anonymised events only. No raw search queries, no email, no device IDs.
- GDPR: no personal data collected without consent. Privacy policy must be live before App Store submission.

---

*nota. Pre-Launch Plan v2.0 | Generated: 2026-06-16*
*Next review: after Phase 0 + Phase 1 complete*
