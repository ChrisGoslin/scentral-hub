# nota. — Competitive Intelligence Report
### Phase 1: App Store + Market Research
### Generated: 2026-06-27 | Sources verified via live WebSearch

---

## THE COMPETITIVE LANDSCAPE (June 2026)

More crowded than six months ago. Four serious players have emerged or matured since the last audit:

| App | Positioning | Strengths | Weaknesses |
|---|---|---|---|
| **Fragrantica** | Legacy database, community ratings | 115k+ fragrances, deep note data, huge community | iOS app is new, limited reviews, UI widely criticised as downgraded after 2025 redesign |
| **Parfumo** | Collection management + discovery | 4.8★ App Store, 227k fragrances, barcode scan, Collection Profiler | Reviews repeat/don't refresh, fewer reviews than Fragrantica, no "inspired by" engine |
| **WhatScent** | "Spotify of perfume" — Scent DNA + community | Scent DNA profile, Perfume Fit score, WhatScent Stories (vertical video), community-powered catalog, gift finder | New (public launch June 2026), building community data from scratch, requires account |
| **Aromoshelf** | AI scent wardrobe organiser | Custom shelf categories, Scent of Day diary, AI recommendations, Achievements system, Annual Recap | Loading/navigation issues reported, smaller catalog, less community depth |
| **Scentra** | AI discovery + bottle scanner | Camera-based bottle scanner, Apple Intelligence integration, no sign-up, Apple Watch logging | Catalog of 500 fragrances only — not a serious collection tool yet |

**New entrant to watch:** WhatScent. Launched publicly June 2026. Positioning directly as the "Vivino of perfume" + "TikTok of perfume." Well-funded, SEO-aggressive, vertical video feed. This is the most direct nota. competitor identified.

---

## THE 5 UNMET NEEDS (what users want that no app gives them)

Synthesised from App Store reviews, Parfumo user forum, Fragrantica community boards, and WhatScent's own positioning gaps.

---

### UNMET NEED 1: "Tell me if this fragrance is right for *me* — not just if it's good"

**Evidence:** Parfumo users want auto-sorting by personal preference not just global ratings. WhatScent is building its entire product around this ("Perfume Fit score"). Fragrantica has no personalisation layer at all. Aromoshelf's AI recommendations are praised but described as generic.

**What "right for me" means in user language:**
- "Does this suit my skin type / chemistry?"
- "Would *I* wear this or is it just objectively good?"
- "Show me things that fit my vibe, not the most popular"

**nota.'s answer:** The persona system + Scent DNA Search + Collection Coherence Score. This is already planned. **Priority: ship it before WhatScent's Perfume Fit score becomes the industry standard.**

---

### UNMET NEED 2: "I want to find the same smell for less — without it feeling shameful"

**Evidence:** ScentClones.com has a "Master Fragrance Clone Spreadsheet" with 100+ verified entries — it exists because apps won't touch it. FragranceBuddy and ScentMatch Pro exist specifically to fill this gap. Parfumo and Fragrantica have "similar fragrances" but don't say the quiet part (price). WhatScent lists "more affordable picks" on fragrance pages but doesn't make it a hero feature.

**What users actually say:** They call them "inspired by" in polite company and "dupes" everywhere else. The demand is enormous and underserved by every mainstream app.

**nota.'s answer:** The Inspired By Engine. **This is the only app in the market actively leading with this. It's the biggest differentiation available. Lead harder with it — the landing page, the onboarding, the detail page.**

---

### UNMET NEED 3: "I want to log my wears but I don't want it to feel like a fitness tracker"

**Evidence:** Aromoshelf has a Scent Diary with memories and impressions. WhatScent has "Scent of the Day" with mood. Both are growing because the demand exists. Fragrantica and Parfumo have no wear logging at all. User reviews of tracking apps consistently praise *journaling* features (memories, notes, impressions) over *gamification* features (streaks, XP, leaderboards).

**What users want:** A private record of their relationship with scent — not a game. The Ritual Calendar concept from JTBD analysis maps directly to this.

**nota.'s answer:** The Brief + wear logging already exists. The Ritual Calendar (FEATURE_PROMPTS.md B1) is the missing piece. **Add journaling to each wear log — a single note field ("what does it remind you of?") — and this becomes the best private tracking experience available.**

**Gap identified:** Current nota. wear log appears to capture fragrance + timestamp. No note/memory field. One input field away from being best-in-class.

---

### UNMET NEED 4: "I want the community without the noise — I want to find my people, not everyone"

**Evidence:** WhatScent Stories is a vertical TikTok-style feed. Fragrantica forums are chronological walls of text. r/fragrance is broad. Aromoshelf has SOTD posts with achievements. No app has solved the "find fragrance people who have similar taste to me" problem — every community is broadcast, not matched.

**What users want:** To see what people *with my taste* are wearing, not what's globally trending. The "people who own this also own" feature (FEATURE_PROMPTS.md D3) and the persona community layer (The Strip filtered by persona) are nota.'s answer to this.

**nota.'s differentiation:** The persona system means nota. can show you "what Dark Alchemists are wearing this week" — a taste-matched community feed no other app has. WhatScent has Scent DNA but no persona layer — their community is undifferentiated.

---

### UNMET NEED 5: "I want to know what to buy before I spend £120 on a blind buy"

**Evidence:** The App Store review that recurs most across Parfumo: "I wish it helped me decide before buying." FragHunter exists solely to track prices. Scentra's camera scanner is explicitly designed for "I'm in a shop, what is this?" moments. 86% of buyers regret blind buys (from `NOTA-BRAND-UIUX-PACK.md` research).

**What users want:** Confidence before purchase — not just information. The distinction is: Fragrantica gives you *information* (notes, reviews, ratings). No app gives you *confidence* (fit score + price alternatives + "people like you who own this say…").

**nota.'s answer:** Inspired By Engine + Scent DNA + Rarity Index + "people who own this also own" + Collection Coherence ("what's missing"). **Together these form a pre-purchase confidence layer that no competitor has assembled in one place.**

---

## WHAT WHATSCENT IS DOING THAT nota. MUST MATCH OR BEAT

WhatScent is the most dangerous near-term competitor. Public launch June 2026. Building aggressively. Here's their feature set vs nota.'s current + planned state:

| Feature | WhatScent | nota. (current + planned) |
|---|---|---|
| Scent DNA profile | ✅ Full feature, central to product | ✅ Scent Identity Score (FEATURE_PROMPTS D4) — planned |
| Personalised fit score | ✅ "Perfume Fit" on every fragrance | 🔶 Partial — persona filters Discover but no per-fragrance fit score |
| Vertical video community | ✅ WhatScent Stories | ❌ Not planned |
| Scent of Day logging | ✅ With mood + memories | 🔶 Brief/wear log exists, no note/memory field |
| Virtual shelves | ✅ Private or public | ✅ Collection / Wardrobe |
| Gift finder | ✅ Dedicated feature | 🆕 Gift This (FEATURE_PROMPTS A3) — planned |
| Similar fragrances | ✅ Including affordable picks | ✅ Inspired By Engine — leading more aggressively |
| Community catalog | ✅ Community-curated | ❌ No community submissions |
| Requires account | ✅ (sign-up required) | ✅ No-auth — **this is a moat** |
| Inspired By as hero | ❌ Buried as "affordable picks" | ✅ Landing page hero — **biggest differentiator** |
| Persona identity system | ❌ | ✅ Unique to nota. |
| Layering lab | ❌ | ✅ |
| Daily ritual / Brief | ❌ | ✅ |

**nota.'s three genuine advantages over WhatScent:**
1. **No auth** — WhatScent requires signup. nota. is frictionless from first tap.
2. **Inspired By as a hero feature** — WhatScent buries it. nota. leads with it.
3. **Persona identity system** — WhatScent has Scent DNA (taste profile). nota. has *identity* (who you are). Different and deeper.

**WhatScent's two advantages nota. must close:**
1. **Per-fragrance fit score** — "Is this right for me?" as a number on every card. Planned as Scent Identity Score but needs to extend to individual fragrance pages.
2. **Note/memory field on wear logs** — journaling vs gamification. One input field.

---

## THREE GAPS NOT YET IN FEATURE_PROMPTS.md

These emerged from the competitive analysis and are not covered by existing prompts:

---

### GAP 1: Per-Fragrance Fit Score

**What it is:** On every fragrance card and detail page, a simple indicator: "Good fit for your identity" or a percentage match based on the user's persona + collection family distribution.

**Why it matters:** WhatScent is building their entire brand around this. It's the single most-requested feature across the market. Without it, nota. can't answer "is this right for me?" at a glance.

**How to build it (low complexity):**
```ts
// User's persona has preferred_families and avoid_families (already in lib/personas.ts)
// Fragrance has family field (already in DB)
// Fit logic:
// - family in persona.preferred_families → "Strong fit" (gold indicator)
// - family in persona.avoid_families → "Not your usual" (muted)
// - family neutral → "Worth exploring" (default)
// Display as a 3-state chip on fragrance cards: ◆ Strong fit | ◇ Worth exploring | ○ Not your usual
```

No ML required. Pure logic from existing data. Ships in one session.

---

### GAP 2: Wear Log Note Field (Memory Capture)

**What it is:** When logging a wear (Brief swipe right), show a single optional text input: *"What does it remind you of?"* — max 120 chars. Store in `wear_logs` table as a `note` column (add via migration).

**Why it matters:** Aromoshelf and WhatScent both have this. Every app without it is losing the Ritual Keeper who wants a private diary. It's the single most emotionally resonant feature in the category and requires one DB column + one input field.

**Migration:**
```sql
ALTER TABLE wear_logs ADD COLUMN IF NOT EXISTS note TEXT;
```

---

### GAP 3: Barcode / Bottle Scanner

**What it is:** Scentra and Parfumo both offer camera-based bottle scanning. The user holds their phone over a fragrance bottle and the app identifies it.

**Why it matters:** It's the "I'm in a shop" moment — the highest-intent discovery moment in the category. If nota. can identify a bottle in-store and immediately show: rating, Inspired By alternatives, community notes, and "Add to collection" — that's the purchase confidence feature that converts browsers to users.

**Realistic MVP approach:** Use the existing search — open camera, read bottle text via OCR (device-native, no API), pre-fill the search input. Not full visual recognition but covers 80% of use cases where the bottle has readable text.

---

## COMPETITIVE INTELLIGENCE SUMMARY FOR CLAUDE CODE PROMPT

Paste this block at the top of any Claude Code audit session:

```
COMPETITIVE CONTEXT (June 2026):

Key competitors: WhatScent (launched June 2026, "Spotify of perfume"), Parfumo (4.8★, 227k fragrances), Aromoshelf (AI wardrobe, diary), Fragrantica (legacy, poor iOS UX).

Top 5 unmet market needs:
1. "Is this right for ME?" — per-fragrance personalised fit signal
2. "Same smell for less" — Inspired By as hero, not buried
3. "Private wear diary" — journaling not gamification, note/memory field
4. "Find my people" — taste-matched community, not broadcast
5. "Confidence before purchase" — fit + price + community combined

nota.'s three moats vs WhatScent:
- No auth (WhatScent requires signup)
- Inspired By as landing page hero (WhatScent buries it)
- Persona identity system (WhatScent has taste profile, not identity)

Three gaps to close vs WhatScent:
- Per-fragrance fit score (3-state chip from persona data — 1 session)
- Wear log note/memory field (1 DB column + 1 input — 1 session)
- Bottle scanner MVP (OCR pre-fill search — 1 session)

WhatScent's moat window before nota. ships: estimated 6–8 weeks.
```

---

---

## PHASE 2 — PANEL AUDIT
### Marlowe + Viktor + Nadia respond to the competitive intelligence findings

---

### MARLOWE (Chief Creative Director, Studio Marlowe)

The WhatScent problem isn't a features problem. It's a story problem — and that's where we win.

WhatScent has a "Perfume Fit score." nota. has a *persona*. Those are not the same thing. A score tells you if a fragrance matches your nose. A persona tells you who you are. The first is a tool. The second is an identity. Tools get abandoned. Identities get defended.

The critical finding from Phase 1 is that WhatScent launched in June 2026 with excellent execution and zero soul. They have the mechanics but not the throughline. "Spotify of perfume" and "Vivino of perfume" are borrowed metaphors, not identities. nota. has *"You already have a scent identity. nota. finds it."* That is original. That is defensible. That is the brand.

The two things I'd ship immediately based on this intelligence: the per-fragrance Fit chip (3-state, persona logic — pure code, no ML) and the Inspired By hero treatment on the detail page. The first closes the WhatScent functional gap in one session. The second is the thing WhatScent *refuses* to lead with — because they're not confident enough in the audience. nota. is.

The wear log note field is not a feature. It's a philosophy. "What does it remind you of?" is what separates a tracker from a diary. WhatScent has "mood" (clinical). We have memory (human). That's the brand voice made into product.

**Marlowe's single most important action:** Run C2 (Inspired By sweep) and the per-fragrance Fit chip before anything else. Those two things, shipped this week, make the WhatScent comparison embarrassing for WhatScent.

---

### VIKTOR (CEO, Scentosphere)

I was right about the 6-week copy window. The difference is, WhatScent got there first and I underestimated them.

Here's my honest competitive read on nota. vs WhatScent, applying the framework:

**Acquisition:** WhatScent requires signup — they'll convert higher-intent users but lose the curious. nota.'s no-auth is genuinely differentiated. If I were running nota.'s growth, I'd put a counter on the landing page: "Start in 3 seconds. No account needed." Make the friction gap visible.

**Retention:** WhatScent has Scent of the Day with mood logging. nota. has the Brief + wear logs. nota. wins on ritual depth. Loses on the note/memory field — that's a one-column migration and it should have shipped yesterday. Without it, WhatScent's diary feature beats nota.'s daily habit loop.

**Monetisation:** Both are pre-revenue. WhatScent's gift finder has clearer affiliate monetisation potential than nota.'s current ad slot approach. The AWIN deal is important but slow. nota. should be building toward affiliate-on-detail-page now.

**Defensibility:** This is where nota. surprises me. The persona system is the moat I said they had in 6 weeks. WhatScent is building taste profiles (input: what you like). nota. has identity profiles (output: who you are). You can copy the taste engine. You can't copy the identity system without wholesale rethinking your product. If nota. ships the Scent Identity Score and the Persona-Conditional Copy system before WhatScent notices them, the community that forms around Dark Alchemists and Ritual Keepers will be harder to migrate than Fragrantica's community.

**Viktor's gap verdict:** Three features. Per-fragrance Fit chip. Wear log note field. "Also own" co-collection strip on detail pages. Those three close the gap with WhatScent in a single sprint. Everything else is a moat deepener.

---

### NADIA (r/fragrance moderator, @nosefirst, 48K TikTok)

OK I have thoughts.

The WhatScent thing is real. I've been testing it for two weeks and the community is interested — mainly because of the Stories feed and the Perfume Fit number. People love a number. "94% match" is meme content. Someone's going to post a screenshot of WhatScent saying their signature fragrance is only a 40% fit and it'll get 200k views.

But here's what WhatScent doesn't have and can't fake: the Inspired By feature done with *intention*. Their "affordable picks" are buried two scrolls deep on a detail page. If nota. makes that the hero of the landing page and the detail page, the r/fragrance community will notice. We talk about dupes — sorry, *inspired by* alternatives — constantly. An app that leads with it is a first.

The wear log note field is what I'd post about. Right now every tracker feels like a fitness app. "Logged: Lattafa Asad, 09:14am." That's a receipt, not a memory. Add "what does it remind you of?" and suddenly I'm writing about the Beirut medina I've never been to. *That* is a TikTok. I'd make that video in 30 seconds.

The community tab with "people who own this also own" is my biggest ask. That feature plus the Rarity Index turns nota. into a conversation instead of a catalogue. I showed Parfumo to my followers last month — 80% said the community felt dead. WhatScent is building community from scratch. nota. has the architecture to do it better than both.

**Nadia's honest concern:** The Strip. If it launches empty, it's worse than not launching it. The note/memory field on wear logs directly seeds The Strip with content — every wear with a note becomes a potential Strip post. That's the flywheel. Ship the note field before you launch the Strip, or the Strip will be an empty room.

**What would make me post about nota. today:** The Inspired By detail page card with "A fraction of the price. The same DNA." That line. I'd screenshot it and write three sentences. That's all it takes.

---

## PHASE 3 — GAP ANALYSIS

### What's unplanned that must be added

The three gaps from Phase 1 competitive analysis map directly to what the panel confirmed. Adding three new prompts to address them:

---

### GAP PROMPT G1 🆕 Per-Fragrance Fit Chip
**Source:** Marlowe (ship before WhatScent's Fit score becomes the standard), Viktor (closes the acquisition gap), WhatScent competitive threat

On fragrance cards in `app/(main)/discover/DiscoverClient.tsx` and on `app/(main)/collection/[id]` detail pages, add a 3-state fit indicator based on the active persona.

```tsx
// lib/fitChip.ts
import { type Persona } from './personas'

export type FitState = 'strong' | 'explore' | 'unusual'

export function getFitState(family: string | null, persona: Persona | null): FitState {
  if (!family || !persona) return 'explore'
  const preferred = persona.recommendations.preferred_families.map(f => f.toLowerCase())
  const avoid = persona.avoid_families?.map(f => f.toLowerCase()) ?? []
  const f = family.toLowerCase()
  if (preferred.some(p => f.includes(p) || p.includes(f))) return 'strong'
  if (avoid.some(a => f.includes(a) || a.includes(f))) return 'unusual'
  return 'explore'
}

// Chip render:
// strong: '◆ Strong fit' in var(--accent), fontSize 9
// explore: '◇ Worth exploring' in var(--text-muted), fontSize 9
// unusual: '○ Not your usual' in var(--text-muted) opacity 0.5, fontSize 9
// Show on: fragrance cards (below name, only 'strong' state visible on cards),
//           detail page header (all 3 states visible)
// Only render when persona is set in localStorage
```

Do not show on cards when state is 'explore' or 'unusual' — card density is precious. Only surface the chip when it's meaningful (strong fit). Full 3-state display on detail page only.

```
git commit -m "feat(discover): per-fragrance Fit chip — 3-state, persona-driven, cards + detail page"
```

---

### GAP PROMPT G2 🆕 Wear Log Note Field
**Source:** Nadia (ship before The Strip — seeds it with content), Viktor (closes WhatScent diary gap), Aromoshelf competitive gap

**Migration (run against Supabase scentral-mvp):**
```sql
ALTER TABLE wear_logs ADD COLUMN IF NOT EXISTS note TEXT;
```

In `app/(main)/spritz/SpritzClient.tsx`, after the swipe-right wear log fires, show a brief bottom sheet before dismissing:

```tsx
// Bottom sheet slides up (200ms ease-out), 40vh height
// Heading: "What does it remind you of?" — Cormorant italic, 16px
// Subtext: "Optional. Just for you." — 11px, Vetiver Grey
// Textarea: single line (expandable), maxLength 120, placeholder empty
// Two actions side by side:
//   Left: "Skip" — ghost button, Vetiver Grey
//   Right: "Save →" — gold pill button
// Auto-dismiss after 8 seconds if no interaction (with progress bar)
// On Save: UPDATE wear_logs SET note = [input] WHERE id = [latest wear log id]
// On Skip OR auto-dismiss: just close
```

Store the note. When rendering Strip posts (C4), the note field IS the Strip post content — pre-populated if set.

```
git commit -m "feat(brief): wear log note field — 'what does it remind you of?' optional, seeds Strip"
```

---

### GAP PROMPT G3 🆕 Bottle Scanner MVP (OCR Search)
**Source:** Scentra and Parfumo competitive gap, "I'm in a shop" highest-intent discovery moment

In `app/(main)/discover/DiscoverClient.tsx`, add a camera icon button to the search bar area. On mobile (check `navigator.mediaDevices.getUserMedia` availability):

```tsx
// Camera button: 24px icon, right side of search bar
// Tap → opens device camera via <input type="file" accept="image/*" capture="environment">
// On image select → extract text from image using browser-native OCR:
//   Use the Web Speech API / EasyOCR not available in browser
//   Instead: send image to /api/ocr — a simple Next.js API route that accepts FormData
//   API route uses tesseract.js (npm install tesseract.js) to extract text server-side
//   Return the extracted text
// Take the largest text block (likely the fragrance name), strip punctuation, trim
// Pre-fill the existing search input with that text
// Trigger the search immediately
```

```ts
// app/api/ocr/route.ts
import { createWorker } from 'tesseract.js'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('image') as File
  const buffer = Buffer.from(await file.arrayBuffer())
  const worker = await createWorker('eng')
  const { data: { text } } = await worker.recognize(buffer)
  await worker.terminate()
  // Return the line most likely to be a fragrance name:
  // longest non-numeric line, trimmed
  const lines = text.split('\n').filter(l => l.trim().length > 3)
  const bestLine = lines.sort((a, b) => b.length - a.length)[0] ?? ''
  return Response.json({ text: bestLine.trim() })
}
```

Show a loading state ("Scanning...") on the search bar while OCR runs. On result: pre-fill and focus search input.

**+25% push:** Add a micro-animation on the camera icon when active — a scanning line sweeping up/down (CSS animation, no library). And if OCR returns no result, show: *"Couldn't read the bottle — type the name?"* with the input focused. Cover the failure state gracefully.

```
git commit -m "feat(discover): bottle scanner MVP — camera input, tesseract.js OCR, search pre-fill"
```

---

## PHASE 4 — 5-STAR REVIEW TEST

### The best-case review nota. must earn

> ★★★★★ **"Finally. An app that actually gets fragrance culture."**
>
> I've been on Fragrantica for eight years. I've tried every fragrance app. Nothing stuck until nota.
>
> The persona system is the thing no one else has thought to do — it figured out I was a Dark Alchemist in two questions and then surfaced fragrances I'd never have found otherwise. The Rarity Index shows me how many members own each fragrance — as someone who actively avoids anything mainstream, this single feature has changed how I browse. The Inspired By section on every detail page is what the community has been asking for forever. Afnan 9PM for £25 after seeing it's an inspired-by Paco Rabanne 1 Million? Instant buy.
>
> The Scent DNA search is genuinely magic. I typed "smells like the inside of an old leather-bound book" and it surfaced three fragrances I'd never heard of. Two of them are now in my collection.
>
> nota. is the first app that treats fragrance as culture, not commerce. This is my daily driver.

---

### The worst-case review nota. must prevent

> ★☆☆☆☆ **"Beautiful design, empty inside."**
>
> Looks incredible. Like, genuinely impressive visuals. But after 10 minutes there's nothing to do.
>
> The community section is a ghost town — The Strip has zero posts. The fragrance pages have no reviews, just notes from a database. The persona quiz told me I'm a "Velvet Intellectual" which sounds meaningful but the recommendations felt the same as everyone else's results.
>
> WhatScent has actual community, actual reviews, an actual Fit score that tells me if a fragrance suits me. nota. feels like a design portfolio that accidentally became an app. Come back when there are people here.

### What prevents the 1-star review

| Risk | Mitigation | Status |
|---|---|---|
| Empty Strip | Ship wear log note field (G2) BEFORE Strip (C4) — notes seed it | 🔶 Planned |
| Persona recs feel generic | Per-fragrance Fit chip (G1) makes it feel specific | 🔶 Planned |
| No community data | Community tab (D3) + Rarity Index (A2) show data that already exists | 🆕 Planned |
| Wins vs WhatScent undefined | Inspired By hero, no-auth, persona identity — must be visible on landing | 🔶 Partial |
| Scent DNA buried | Scent DNA overlay (C3) + prime real estate above filters | 🔶 Planned |

### Final sequencing recommendation

Add G1, G2, G3 to the execution order in FEATURE_PROMPTS.md at positions:

- G2 (Note field) → position 4 (before Strip — seeds it)
- G1 (Fit chip) → position 5 (after grid fixed, before community features)
- G3 (Bottle scanner) → position 12 (after core features stable)

```
git commit -m "docs(audit): competitive intelligence + panel audit + gap analysis + 5-star review test"
```

---

## SOURCES

- [Fragrantica AI Perfume — App Store](https://apps.apple.com/us/app/fragrantica-ai-perfume/id6774532380)
- [Parfumo — App Store](https://apps.apple.com/us/app/parfumo/id1220565521)
- [Parfumo Reviews 2026 — JustUseApp](https://justuseapp.com/en/app/1220565521/parfumo/reviews)
- [WhatScent — What Is WhatScent?](https://whatscent.app/magazine/what-is-whatscent)
- [WhatScent — Best App for Perfume Reviews 2026](https://whatscent.app/magazine/best-app-for-perfume-reviews-2026)
- [WhatScent — Best Free Perfume App 2026](https://whatscent.app/magazine/best-free-perfume-app-2026)
- [Aromoshelf — App Store](https://apps.apple.com/us/app/aromoshelf-ai-scent-wardrobe/id1628531505)
- [Scentra — Best Fragrance Finder App 2026](https://perfumeidentifier.com/blog/best-fragrance-finder-app/)
- [ScentClones — Master Fragrance Clone Spreadsheet](https://scentclones.com/fragrance-clone-spreadsheet/)
- [Fragrantica Community Board — App Feedback](https://www.fragrantica.com/board/viewtopic.php?id=345908)
- [Scento — Perfume E-Commerce Mobile Trends 2025](https://www.scento.com/blog/perfume-ecommerce-mobile-trends-2025)
- [WhatScent Magazine — Fragrance Trends 2026](https://www.whatscent.app/magazine/fragrance-trends-2026)
