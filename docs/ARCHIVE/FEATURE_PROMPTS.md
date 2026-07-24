# BaseNote — Feature Build Prompts
### Synthesised from: Marlowe (Creative Director), Viktor (Competitor CEO), Nadia (Community Insider), JTBD Analysis
### Generated: 2026-06-27 | +25% experience push on every feature

---

## HOW TO USE THIS FILE

Each prompt below is self-contained. Paste directly into Claude Code.
- Read AGENTS.md first (mandatory per session start checklist)
- Each prompt includes the git commit inline
- Features are ordered by user impact, not complexity
- ✅ = already partially implemented in codebase — prompt upgrades it
- 🆕 = net new feature

---

## ALREADY CONFIRMED BUILT (skip these — verified in code)
- `SpritzClient.tsx` h1 already says "Today's Brief" ✅
- Tutorial card rock animation already implemented ✅
- Streak day-1 toast (`scentral_streak_celebrated`) already implemented ✅
- Empty wardrobe state on Brief already implemented ✅
- `← Later` / `Worn ✓` swipe affordance buttons already in JSX ✅

---

## SPRINT A — HIGH IMPACT, LOW COMPLEXITY

---

### A1 🆕 Occasion Quick Pick
**Source:** Marlowe ("the Brief is not a ritual for Solar Minimalist — it's a decision made for them"), JTBD Solar Minimalist ("Tell me what to wear today so I don't have to think about it")
**Persona:** Solar Minimalist primarily; all personas benefit

Create a new component `components/discover/OccasionPick.tsx` and wire it into `app/(main)/spritz/SpritzClient.tsx` as a secondary entry point shown when the user has a collection but wants a quick pick outside the Brief.

The component renders a single-screen 2-tap flow:

**Step 1 — Occasion selector:**
```tsx
const OCCASIONS = [
  { label: 'Work', emoji: '💼', vibe: ['Fresh', 'Clean', 'Aquatic'] },
  { label: 'Date', emoji: '🕯️', vibe: ['Woody', 'Oriental', 'Floral'] },
  { label: 'Gym', emoji: '⚡', vibe: ['Citrus', 'Fresh', 'Aquatic'] },
  { label: 'Evening', emoji: '🌙', vibe: ['Oud', 'Amber', 'Leather'] },
  { label: 'Weekend', emoji: '☀️', vibe: ['Green', 'Fresh', 'Floral'] },
  { label: 'Special', emoji: '✨', vibe: ['Oriental', 'Gourmand', 'Floral'] },
]
```

Render as a 2x3 grid of large tappable tiles (min 80px height). Each tile: emoji large (32px), label in small caps below.

**Step 2 — Single recommendation:**
- Filter `localStorage.getItem('scentral_collection')` IDs against the occasion vibes
- Fetch those fragrances from Supabase, pick the highest-rated match
- Show a single full-width card: fragrance name in Cormorant italic, brand in small caps, family gradient background, one-line description
- Two actions: "Wear this →" (fires wear log, same as Brief swipe right) and "Pick another →" (cycles to next match)

**+25% push:** Add a confidence line below the recommendation: *"Chosen from your [N] [occasion] fragrances."* If only 1 match: *"This is your only [occasion] fragrance. Time to explore?"* with a link to Discover filtered by that vibe.

Surface the Occasion Quick Pick as a floating pill button on the Brief page:
```tsx
<Link href="/discover?quickpick=true" style={{ ... }}>
  ⚡ Quick Pick
</Link>
```
Or implement as a bottom sheet on the same page — bottom sheet is preferred (no route change, faster).

```
git commit -m "feat(brief): Occasion Quick Pick — 2-tap flow, collection-aware, single recommendation"
```

---

### A2 🆕 Rarity Index
**Source:** Viktor ("Only 3 members own this — that's the Dark Alchemist's catnip"), JTBD Dark Alchemist ("feel powerful wearing something most people don't understand")
**Persona:** Dark Alchemist, Rebel Experimentalist

The `get_fragrance_social_proof` RPC already returns `owner_count` per fragrance. Surface it as a rarity signal on fragrance cards and detail pages.

**On DiscoverGrid cards** — add below the fragrance name when `owner_count < 10`:
```tsx
{ownerCount !== null && ownerCount < 10 && (
  <p style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
    {ownerCount === 0 ? 'Undiscovered' : `${ownerCount} member${ownerCount !== 1 ? 's' : ''} own this`}
  </p>
)}
```

**On fragrance detail page** (`app/(main)/collection/[id]`) — add a rarity badge in the header area:
- 0 owners: `◆ Undiscovered` in gold
- 1–5 owners: `◆ Rare · [N] members` in gold
- 6–25 owners: `◆ Cult · [N] members` in muted gold
- 26–100 owners: `[N] members own this` in Vetiver Grey
- 100+: omit entirely (not rare)

**+25% push:** Add a "Rarity Filter" chip to the Discover Sort row — `◆ Rare only` — that filters to fragrances where `owner_count < 10`. When active, sort defaults to `owner_count ASC` (least owned first). Label the filtered state: *"[N] undiscovered fragrances"* instead of the normal count label. This turns rarity into a browseable dimension, not just a badge.

```
git commit -m "feat(discover): Rarity Index — owner_count badges on cards + detail page + rare filter"
```

---

### A3 🆕 Gift This — Shareable Fragrance Card
**Source:** JTBD Comfort Seeker ("help me give it to someone I love"), Nadia ("zero engineering — just a share card format")
**Persona:** Comfort Seeker primarily; viral acquisition for all

On `app/(main)/collection/[id]` (fragrance detail page), add a "Gift This" button in the action row alongside the existing wishlist/add buttons.

Tapping opens a bottom sheet with a pre-rendered share card:

```tsx
// Share card layout (canvas-rendered or pure CSS — pure CSS preferred for speed)
// Dark background #1A1208, 375×500px proportion
// Top: gold score line (full width, 1px)
// Centre top: brand name in 10px small caps, Vetiver Grey
// Centre: fragrance name in Cormorant italic, 28px, white
// Below name: family + season in 11px mono, muted
// Description line: plain_description truncated to 100 chars, italic, 13px, Vetiver Grey
// Bottom section (separated by thin line):
//   Left: "Inspired By" price if inspired_by exists — "From £[X] Inspired By"
//   Right: BaseNote wordmark in 10px
// Gold score line at very bottom
```

Share options:
- **Copy link** → `https://scentral-hub.vercel.app/collection/[id]?ref=gift`
- **Share image** → uses Web Share API (`navigator.share`) with the card as a blob if supported; falls back to download
- **WhatsApp** → `https://wa.me/?text=` pre-populated with fragrance name + link

**+25% push:** Pre-write the WhatsApp message in "gift language" not "fragrance nerd language":
> *"Found this for you — [Fragrance Name] by [Brand]. [One-line plain description]. Available from £[price] (or an inspired-by version from £[inspired_by_price]). Thought of you 🖤 [link]"*

This is the message a Comfort Seeker actually wants to send. Zero thinking required.

```
git commit -m "feat(collection): Gift This — shareable card, WhatsApp pre-written message, Web Share API"
```

---

### A4 🆕 The Unusual Suspects Filter
**Source:** Marlowe ("Discover for Rebel should surface outliers, not crowd-pleasers"), JTBD Rebel Experimentalist ("give me something I've never smelled before")
**Persona:** Rebel Experimentalist, Dark Alchemist

In `app/(main)/discover/DiscoverFilters.tsx`, add a new filter chip to the Sort row:

```tsx
{ label: '⚗ Unusual', value: 'unusual' }
```

When `sort === 'unusual'`, apply this sort logic in `DiscoverClient.tsx`:

```ts
// "Unusual Suspects" = high saves (owner_count > 5) but low overall ownership relative to rating
// Proxy: sort by (rating * owner_count) DESC but exclude anything with owner_count > 200
// i.e. critically acclaimed but not yet mainstream
sorted.sort((a, b) => {
  const scoreA = (a.rating ?? 0) * Math.min(a.owner_count ?? 0, 50)
  const scoreB = (b.rating ?? 0) * Math.min(b.owner_count ?? 0, 50)
  return scoreB - scoreA
})
// Then filter: only show where owner_count < 150 (niche, not mainstream)
results = results.filter(f => (f.owner_count ?? 0) < 150)
```

When Unusual Suspects is active, change the count label to:
*"[N] fragrances the crowd hasn't found yet"*

**+25% push:** When Unusual Suspects is active AND the user has a persona set, further bias the results toward that persona's preferred families. Unusual + persona-filtered = "unusual things *you* would actually wear." Label it: *"[N] unusual picks for [Persona Name]"*. This is Viktor's worst nightmare — a personalised discovery engine for niche finds.

```
git commit -m "feat(discover): Unusual Suspects sort — high-rated, low-ownership, persona-biased"
```

---

### A5 🆕 The Signature Finder
**Source:** JTBD Comfort Seeker ("overwhelmed by 127,000 fragrances — 3-question filter to one recommendation"), Nadia ("the quiz needs to land specific bottles, not vibes")
**Persona:** Comfort Seeker primarily; new users of all personas

Add a "Find My Signature" entry point to `app/(main)/discover/DiscoverClient.tsx` — shown only when no filters are active and the user has no persona set (or as a persistent shortcut).

A 3-step bottom sheet:

**Step 1:** *"How do you want to feel?"*
- Wrapped & Warm | Fresh & Clean | Bold & Present | Mysterious & Deep

**Step 2:** *"When do you wear it most?"*
- Every day | Evenings & occasions | Mornings only | No pattern

**Step 3:** *"How much do you want people to notice?"*
- Just me | My close circle | Everyone in the room

Each answer maps to a filter combination (family + projection). Step 3 maps to projection: Just me = Weak/Medium, Close circle = Moderate, Everyone = Strong/Beast Mode.

After step 3: dismiss sheet, apply filters silently to Discover, change count label to *"[N] fragrances that could be your signature"*, and scroll to top of grid.

**+25% push:** After 5 seconds on the filtered results, show a subtle inline nudge:
*"Save a fragrance to start building your identity →"*
This converts a casual browser into a collector. One nudge, one action, one retention hook.

```
git commit -m "feat(discover): Signature Finder — 3-step bottom sheet, maps to filter combo, retention nudge"
```

---

## SPRINT B — MEDIUM COMPLEXITY, HIGH RETENTION

---

### B1 🆕 Ritual Calendar
**Source:** JTBD Ritual Keeper ("be the keeper of my practice — hold the record so I can see how far I've come"), Marlowe ("every community feature needs a private equivalent")
**Persona:** Ritual Keeper primarily; all personas with 7+ wears logged

Add a new section to `app/(main)/you/YouClient.tsx` — visible when `auraStreak > 0` or wear logs exist.

The Ritual Calendar is a monthly grid of wear dots. Each day that has a wear log gets a filled dot in `var(--accent)`. Days without: empty dot in `var(--line)`.

```tsx
// Layout: 7-column CSS grid, one cell per day of current month
// Each cell: 28px × 28px circle
// Filled: background var(--accent), opacity 1
// Empty: border 1px solid var(--line), background transparent
// Today: border 2px solid var(--accent)
// On tap of a filled dot: show tooltip with fragrance name worn that day
```

Data source: query `wear_logs` table filtered by `anon_id` and current month. Join to `fragrances` table to get fragrance name for tooltip.

Label above the grid: *"Your ritual, [Month] [Year]"* in 10px uppercase Vetiver Grey.

Below the grid: *"[N] days this month"* — no emoji, no gamification language for this persona.

**+25% push:** Add a month navigation arrow (`← [prev month]` / `[next month] →`) so the user can look back across their history. Seeing 3 months of dots is profoundly motivating — it's a visual record of a practice. Also add a subtle "Share your month →" option that generates a share image of the calendar grid (gold dots on dark background, month label, BaseNote wordmark). Ritual Keepers who share this will bring in other Ritual Keepers — the most valuable acquisition loop.

```
git commit -m "feat(you): Ritual Calendar — monthly wear dot grid, fragrance tooltip, month navigation, share"
```

---

### B2 🆕 Collection Coherence Score
**Source:** JTBD Velvet Intellectual ("help me understand the pattern in what I already love so I can articulate it"), Marlowe ("the collection page should ask 'what does your collection say about you?'")
**Persona:** Velvet Intellectual primarily; any user with 5+ fragrances

In `app/(main)/collection/page.tsx` or `YouClient.tsx`, after a user has 5+ fragrances in their collection, compute and display a coherence reading.

**Algorithm (client-side, no API call):**
```ts
// 1. Get all fragrances in collection from localStorage IDs
// 2. Count family distribution
// 3. Find dominant family (>40% of collection) and secondary family (>20%)
// 4. Generate a one-line reading based on dominant families

const COHERENCE_READINGS: Record<string, string> = {
  'Woody+Oriental': 'Your collection runs dark and resinous — the scent of candlelit rooms.',
  'Citrus+Fresh': 'Clean lines, high energy. Your shelf is built for motion.',
  'Gourmand+Amber': 'Warm, enveloping, and unapologetically comforting.',
  'Leather+Tobacco': 'Bold and polarising by design. Not for everyone — exactly as intended.',
  'Floral+Musk': 'Soft but present. Your collection whispers rather than announces.',
  'Oud+Resinous': 'Rare taste. Your shelf reads like a perfumer\'s private reserve.',
  // ... extend for other combinations
  'default': 'Your collection is still finding its shape. Every bottle narrows the focus.',
}
```

Display as a card in the collection page header:
```tsx
<div style={{ margin: '0 16px 16px', padding: '16px', borderLeft: '2px solid var(--accent)', background: 'var(--surface)' }}>
  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
    Your collection
  </p>
  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)' }}>
    {coherenceReading}
  </p>
</div>
```

Show only when collection has 5+ fragrances. Below 5: *"Add [5 - count] more fragrances to unlock your collection reading."*

**+25% push:** Below the reading, surface 2 "what's missing" suggestions — families not in their collection that pair well with their dominant family. Example: *"Your collection is all dark woods and ambers. You're missing a citrus top note — here's what would complete it →"* Link to Discover filtered by that family. This is the Velvet Intellectual's killer feature — it tells them what to buy next based on coherence, not popularity.

```
git commit -m "feat(collection): Coherence Score — family pattern reading, missing-note suggestions"
```

---

### B3 🆕 Formula Card — Shareable Layer Combination
**Source:** JTBD Rebel Experimentalist ("document experiments like a sketchbook"), Marlowe ("made to be shared on Instagram Stories")
**Persona:** Rebel Experimentalist, Dark Alchemist

In `app/(main)/layering/LayeringClient.tsx`, when a user saves a layer combination, add a "Share Formula →" button to the saved combination card.

Tapping renders a share card using an `<canvas>` element or pure CSS snapshot:

**Formula Card layout** (portrait, 9:16 ratio — Instagram Stories native):
```
Background: #1A1208 (Encre)
Top: gold score line (full width, 2px)

[10px uppercase, Vetiver Grey]  FORMULA NO. [auto-incrementing number from localStorage]

[Cormorant italic, 32px, white]
[Fragrance 1 Name]
[9px mono, gold]  BASE

[1px line, rgba(255,255,255,0.1)]

[Cormorant italic, 24px, white]
[Fragrance 2 Name]
[9px mono, gold]  LAYER

[if 3 fragrances:]
[1px line]
[Cormorant italic, 20px, white, 0.7 opacity]
[Fragrance 3 Name]
[9px mono, gold]  FINISH

Bottom: gold score line (full width, 1px)
[10px, Vetiver Grey]  BaseNote · Find your base note
```

Allow user to name the formula before sharing. Default name: *"Formula No. [N]"* — tap to rename. Rename stored in localStorage alongside the combination.

Share via Web Share API as PNG blob. Falls back to download button.

**+25% push:** Add a QR code in the bottom-right corner of the Formula Card that deep-links to the Layering Lab with those exact fragrances pre-selected. Anyone who scans it lands in the Lab with the combination ready to explore. Zero friction community cross-pollination — Nadia would screenshot and post this immediately.

```
git commit -m "feat(layering): Formula Card — shareable 9:16 combination image, naming, QR deep link"
```

---

### B4 ✅ Identity Tab — Full Upgrade
**Source:** Marlowe ("everything feels like a record of who you are as a fragrance person"), Viktor ("no account means no re-engagement — make the anonymous identity feel real")
**Persona:** All

The signed-out state in `YouClient.tsx` shows `state: 'signed-out'` — upgrade the entire experience.

**Signed-out (no persona set):**
```tsx
// Full-height centred layout
// Large Cormorant italic: "Your identity is waiting."
// Small text: "Take the 2-minute quiz to discover your scent identity."  
// Gold pill button: "Find Your Base Note →" → href="/onboarding"
```

**Signed-out (persona set in localStorage):**
Load the persona and show a rich identity card:
```tsx
// Persona name in large Cormorant italic, persona accent colour
// Persona tagline in 14px, white
// Three scent notes from persona.scent_spectrum.base in small mono, Vetiver Grey
// Below: collection count, streak, last worn date — all from localStorage
// CTA: "Explore your [Persona Name] fragrances →" → Discover filtered by persona
```

Remove `pointerEvents: 'none'` from any blurred cards. Replace with the above states entirely.

**+25% push:** Add a "Your Scent History" timeline below the identity card — a vertical list of the last 7 wears (fragrance name + date), pulled from localStorage wear logs. Each entry: fragrance name in Cormorant italic, date in mono muted. This is the private record. The Ritual Keeper will scroll it every morning. The Velvet Intellectual will notice when their taste shifted. No auth required — all local data.

```
git commit -m "feat(identity): full signed-out upgrade — persona card, local history timeline, no blurred cards"
```

---

## SPRINT C — BRAND + LANDING

---

### C1 ✅ CSS Token Unification + Cormorant Garamond
**Source:** Marlowe ("four competing warm tones is not a brand"), Viktor ("the design system inconsistency would make a Series A investor nervous")
**Already in CLAUDE_CODE_PROMPTS.md as Prompt 1 + 2 — run those first.**

---

### C2 🆕 "Inspired By" Language Sweep + Engine Rename
**Source:** Nadia ("they say 'inspired by' — never dupe or clone. It matters."), Marlowe ("lead with honesty")
**Persona:** All — affects trust

Search the entire codebase for:
- `"clone"` → replace with `"Inspired By"` in all user-facing strings
- `"dupe"` → replace with `"Inspired By alternative"` in all user-facing strings  
- `"Clone Finder"` → `"Inspired By Engine"` in all user-facing strings and route labels
- `/clones` route display label → `"Inspired By"` (keep the route path `/clones` unchanged)

In `app/(main)/collection/[id]` detail page, if `inspired_by` field is populated:
```tsx
// Current: probably says "Clone of [X]" or similar
// New format:
<div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--r-card)', marginTop: 16 }}>
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
```

**+25% push:** On the landing page Inspired By section, add a live counter that updates based on actual DB count: *"[N] Inspired By matches in our catalogue."* Pull this from a lightweight `/api/inspired-by-count` endpoint that runs `SELECT COUNT(*) FROM fragrances WHERE inspired_by IS NOT NULL`. This makes the feature feel substantial and real, not aspirational.

```
git commit -m "feat(brand): Inspired By language sweep — kill clone/dupe, rename engine, detail page card"
```

---

### C3 🆕 Scent DNA Search — Full Surface
**Source:** Viktor ("the Smells Like feature is buried — if I were them I'd put it above the fold"), Nadia ("describe a scent that doesn't exist yet and find what comes closest")
**Already partially in CLAUDE_CODE_PROMPTS.md as Prompt 13 — this expands it.**

In `app/(main)/discover/DiscoverFilters.tsx`, the Scent DNA card (from Prompt 13) opens the existing Smells Like search. Expand the overlay:

When Scent DNA is active and the user has typed 2+ characters, show results in a dedicated dark overlay (not inline in the grid):

```tsx
// Full-screen overlay: background #1A1208, z-index 99
// Header: "SCENT DNA SEARCH" in 9px gold uppercase + X close button
// Input pinned to top: same search input, auto-focused
// Results below: each result as a horizontal card
//   - Fragrance name in Cormorant italic, 16px, white
//   - Brand in 10px small caps, Vetiver Grey
//   - DNA match percentage in gold: "94% match"
//   - Family gradient strip (4px wide, full height) on left edge
// Tap result → navigate to /collection/[id]
```

The DNA match percentage comes from the existing semantic search similarity score (already returned by `/api/search?mode=smells_like`). If no score returned, omit the percentage.

**+25% push:** At the bottom of the Scent DNA results, add a "Describe another →" nudge that clears the input but keeps the overlay open. And add a "Save this search →" that stores the query in localStorage as `scentral_dna_searches` (array, max 5). Show saved searches as chips when the overlay opens with an empty input — *"Recent: [query 1] [query 2]"*. This is the feature that makes Nadia post about BaseNote: "I can describe a scent I smelled at a wedding 3 years ago and it finds matches. No other app does this."

```
git commit -m "feat(discover): Scent DNA full overlay — dark fullscreen, match %, saved searches, recent queries"
```

---

### C4 🆕 The Strip — Post Format + Feed
**Source:** Marlowe ("the constraint is the brand — one fragrance, one line, one reaction"), Nadia ("if it's empty it's worse than not having it")
**Persona:** All community-facing

Find the Wear & Share / social component (likely in `app/(main)/you/YouClient.tsx` or `app/social`). The Strip needs a proper post card format.

**Strip post card:**
```tsx
// Top: gold score line (full width, 1px, var(--accent))
// Row 1: [persona name in 9px uppercase, persona accent colour] · [fragrance brand in 9px muted]
// Row 2: fragrance name in Cormorant italic, 18px, var(--text)
// Row 3: user note in quotes, 13px, italic, var(--text-muted), max 2 lines with ellipsis
// Row 4: [❤ N] [💬 N] [↗ Share] — all 12px, Vetiver Grey, spaced evenly
// No card border, no shadow — the score line is the separator
// Padding: 16px horizontal, 12px vertical
```

**Creating a Strip post:** When a user logs a wear (swipe right on Brief), offer: *"Share this to The Strip? →"* (dismissible, shown once per session). Tapping opens a bottom sheet:
- Fragrance name pre-filled (read-only)
- Note field: *"What does it remind you of?"* — placeholder, max 120 chars
- Post button: *"Add to The Strip →"*
- Skip: *"Keep it private"*

Store posted strips in `wear_posts` table (already exists in DB schema per AGENTS.md): `anon_id`, `fragrance_id`, `note`, `persona_id`, `created_at`.

**+25% push:** Add a "Strip of the Week" pinned card at the top of the feed — the single most-liked Strip post from the last 7 days. Gold border, slightly larger. Label: *"STRIP OF THE WEEK"* in 9px gold uppercase. This is zero-cost editorial curation that gives community members a reason to post well — they might be featured. Nadia said she'd post about this.

```
git commit -m "feat(strip): score-line post format, wear-to-post flow, Strip of the Week pinned card"
```

---

## SPRINT D — POLISH + RETENTION

---

### D1 ✅ Discover Grid — 2-Column + Gradient Cards
**Already in CLAUDE_CODE_PROMPTS.md as Prompt 3 + 4. Run those.**

---

### D2 🆕 Persona-Conditional Copy System
**Source:** Marlowe ("the same screen should feel different for each persona — not just filtered but *felt*"), JTBD analysis (Brief = "Today's call" for Solar Minimalist, "Your morning intention" for Ritual Keeper)
**Persona:** All — affects every screen

Create `lib/personaCopy.ts`:

```ts
// Persona-conditional copy for key UI moments
// Read persona from localStorage('scentral_persona') at mount
// Returns the right string for each persona

export const PERSONA_COPY = {
  velvet_intellectual: {
    briefTitle: "Today's Selection",
    briefEmpty: "Your selection is waiting.",
    briefDone: "A considered day.",
    discoverLabel: "Your archive",
    collectionLabel: "The collection",
    identityTitle: "Your identity",
  },
  solar_minimalist: {
    briefTitle: "Today's Call",
    briefEmpty: "Add bottles to start.",
    briefDone: "Sorted.",
    discoverLabel: "Explore",
    collectionLabel: "Your shelf",
    identityTitle: "Your profile",
  },
  dark_alchemist: {
    briefTitle: "Tonight's Formula",
    briefEmpty: "Your lab is empty.",
    briefDone: "The night is handled.",
    discoverLabel: "The deep cuts",
    collectionLabel: "The arsenal",
    identityTitle: "Your identity",
  },
  ritual_keeper: {
    briefTitle: "Morning Intention",
    briefEmpty: "Your ritual is waiting.",
    briefDone: "The ritual is complete.",
    discoverLabel: "Discover",
    collectionLabel: "Your practice",
    identityTitle: "Your practice",
  },
  rebel_experimentalist: {
    briefTitle: "Today's Experiment",
    briefEmpty: "Nothing to experiment with yet.",
    briefDone: "Experiment complete.",
    discoverLabel: "Find something unusual",
    collectionLabel: "The studio",
    identityTitle: "Your identity",
  },
  comfort_seeker: {
    briefTitle: "Today's Comfort",
    briefEmpty: "Your comfort awaits.",
    briefDone: "A good day.",
    discoverLabel: "Find your signature",
    collectionLabel: "Your favourites",
    identityTitle: "Your identity",
  },
} as const

export function getPersonaCopy(personaId: string | null) {
  return PERSONA_COPY[personaId as keyof typeof PERSONA_COPY] ?? PERSONA_COPY.solar_minimalist
}
```

Wire into `SpritzClient.tsx` — replace hardcoded `"Today's Brief"` with `copy.briefTitle`. Wire `briefEmpty` into empty state text. Wire `briefDone` into the end-of-cards state.

**+25% push:** Also apply `collectionLabel` to the collection page header, and `discoverLabel` to the Discover page subtitle. Three pages, six strings, zero new features — but the app now feels like it *knows* the user. Viktor doesn't have this. Nadia will notice.

```
git commit -m "feat(copy): persona-conditional copy system — Brief, Discover, Collection adapt to identity"
```

---

### D3 🆕 Fragrance Detail Page — Community Layer
**Source:** Viktor ("127k fragrances with no community data is a database, not a platform"), Nadia ("I want to see who else is wearing this right now")
**Persona:** All

On `app/(main)/collection/[id]`, add a "Community" tab alongside the existing Notes/Details tabs.

Community tab content (all data already in DB):
```tsx
// "X members own this" — from owner_count via get_fragrance_social_proof RPC
// "Worn [N] times this week" — COUNT from wear_logs WHERE fragrance_id = [id] AND created_at > now()-7days
// "Most worn by [Persona Name]" — JOIN wear_logs → profiles/anon users → persona breakdown
// Recent Strip posts featuring this fragrance — SELECT from wear_posts WHERE fragrance_id = [id] LIMIT 3
//   Render each as a mini Strip card (no score line, just note + persona chip)
```

If all counts are 0 (new fragrance): *"Be the first to wear this. →"* as CTA to add to collection.

**+25% push:** Add "People who own this also own:" — a horizontal scroll of 6 fragrances frequently co-owned. Query: `SELECT fragrance_id, COUNT(*) FROM collections WHERE anon_id IN (SELECT anon_id FROM collections WHERE fragrance_id = [id]) AND fragrance_id != [id] GROUP BY fragrance_id ORDER BY COUNT(*) DESC LIMIT 6`. This is Letterboxd's "fans also like" — the single feature Viktor said he'd copy in 6 weeks. Build it first.

```
git commit -m "feat(collection): community tab — owner count, weekly wears, persona breakdown, also-own strip"
```

---

### D4 🆕 Scent Identity Score
**Source:** Marlowe ("shareable identity moment — the app that knows your nose"), JTBD all personas ("see the pattern in what I love")
**Persona:** All with 5+ wears logged

In `app/(main)/you/YouClient.tsx`, below the identity card, compute and display a Scent Identity Score.

**Algorithm:**
```ts
// 1. Get all fragrances in collection (localStorage IDs)
// 2. Fetch their families from Supabase (batch select)
// 3. Map families to personas using persona.recommendations.preferred_families
// 4. Score each persona by % of collection matching their preferred families
// 5. Return top 2 personas with percentages

// Display:
// "Your identity is [N]% [Persona 1], [N]% [Persona 2]"
// Example: "Your identity is 60% Dark Alchemist, 30% Velvet Intellectual"
```

Visual: a horizontal bar split by persona accent colours, proportional to percentages. Below: *"Based on [N] fragrances in your collection."*

Share button generates a card: dark background, bar chart, persona breakdown text in Cormorant italic, BaseNote wordmark. Web Share API.

**+25% push:** Below the score, show a drift indicator if the user has been active for 30+ days. Compare this month's wear families to last month's. If shifted: *"Your taste is shifting toward [new direction] this month."* This is the seasonal identity drift insight from the JTBD analysis — the only app in the world that can tell a fragrance enthusiast their taste is evolving in real time.

```
git commit -m "feat(identity): Scent Identity Score — persona % breakdown, share card, taste drift indicator"
```

---

## EXECUTION ORDER

Run in this sequence for maximum compounding impact:

| Order | Prompt | Why first |
|---|---|---|
| 1 | CLAUDE_CODE_PROMPTS.md #1 | Token conflict blocks everything visual |
| 2 | CLAUDE_CODE_PROMPTS.md #2 | Accent unification before any new UI |
| 3 | CLAUDE_CODE_PROMPTS.md #3 + #4 | Grid + gradient cards — biggest visible fix |
| 4 | **A2 Rarity Index** | One query, massive Dark Alchemist / Rebel retention signal |
| 5 | **C2 Inspired By sweep** | Trust fix — zero complexity, high Nadia impact |
| 6 | **D2 Persona Copy** | Zero features, enormous felt difference per persona |
| 7 | **A1 Occasion Quick Pick** | Solar Minimalist daily driver — DAU hook |
| 8 | **A3 Gift This** | Viral acquisition — Comfort Seeker brings new users |
| 9 | **A4 Unusual Suspects** | Rebel/Alchemist retention + Viktor's moat threat |
| 10 | **C3 Scent DNA Overlay** | Feature Nadia would post about |
| 11 | **B2 Coherence Score** | Velvet Intellectual depth signal |
| 12 | **C4 The Strip** | Community layer — needs users first |
| 13 | **B1 Ritual Calendar** | Ritual Keeper retention — private practice record |
| 14 | **B3 Formula Card** | Rebel shareable moment |
| 15 | **D3 Community Tab** | Needs Strip data — run after C4 |
| 16 | **B4 Identity Tab upgrade** | Pulls everything together |
| 17 | **A5 Signature Finder** | Comfort Seeker onboarding — run after grid fixed |
| 18 | **D4 Scent Identity Score** | Capstone — needs collection data to be meaningful |

---

## VERIFICATION AFTER EACH SPRINT

After A1–A5: `npm run build` → zero errors. Check Discover on mobile — 2 columns, gradient cards showing.
After B1–B4: Test with a collection of 5+ fragrances. Coherence reading must appear. Calendar must show dots.
After C1–C4: Run Nadia trigger prompt from PERSONAS_AI.md. Would she post about it now?
After D1–D4: Run Viktor trigger prompt. Does his "6-week copy window" still apply, or has the moat deepened?
