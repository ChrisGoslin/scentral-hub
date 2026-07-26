# BaseNote — Brand Vision & Strategy
### Creative Director Brief + Customer Immersion Research
### Last updated: 2026-06-27

---

## THE NORTH STAR

> **BaseNote is the app that knows your nose.**

Not your wishlist. Not your reviews. Your *nose*. The pattern of what you reach for, what you wear, when you wear it, how you layer it. Over time, BaseNote becomes the only system in the world that holds a complete record of your scent identity.

**Single throughline, every surface, every word:**
> *You already have a scent identity. BaseNote finds it.*

**Brand voice: The Knowing Friend.**
Not a perfumery curator talking down to you. Not a DTC brand hyping you up. The friend who's worn everything, knows what works, tells you the truth, and remembers what you like. Warm. Specific. A little mysterious. Never clinical.

---

## CUSTOMER IMMERSION FINDINGS

### Who the fragrance hobbyist is (2026 research)

Embedded with 12 enthusiasts across Dublin, London, Amsterdam and Beirut. Ages 19–41.

**They don't just smell. They collect, curate, debate and perform.**

- A 26-year-old in Amsterdam has 34 bottles on an IKEA Kallax shelf arranged by family. She photographs it every time she adds something new. She posts *the shelf* — the shelf is the identity.
- A 19-year-old in Dublin follows 60 fragrance accounts on TikTok. Discovers everything through 60-second reviews. Buys samples before committing. Uses sommelier language without being taught it.
- A 38-year-old in Beirut has a 4-minute morning ritual. Same bottle every morning — Lattafa Asad. Two sprays chest, one wrist. Wrist to nose, eyes closed, 3 seconds. He doesn't think of it as a fragrance routine. He thinks of it as *how he begins*.
- A 31-year-old in London has 6 bottles for 6 moods. She has names for them. "Tuesday's office bottle." "What I wear when I need to feel like myself." She says *"my scents"* — deep personal ownership.

### Key statistics (cited sources below)

- Average fragrance ownership: **6–10 bottles** (Gen Z: 8–12)
- **73%** wear fragrance 3+ times a week
- **80%** choose fragrance specifically to enhance their emotional state
- **86%** regret blind buys — they sample first, research obsessively
- **45%** of social media fragrance purchases in the US driven by TikTok
- Gen Z prefers "vibes" language: "cozy", "main character energy", "clean girl"
- **83%** of Gen Z incorporates fragrance into their routine
- r/fragrance: 1.2M members. #perfumetok: billions of views
- Crossover passions: fashion, music, interior design, travel, wellness, culture

### What they don't have
A digital home. Reddit is too broad. Fragrantica is too clinical. TikTok is too ephemeral. They want the place that's *for them* — holds their collection, knows their nose, connects them to people who get it.

**That is BaseNote.**

### Language note
They say **"inspired by"** — never "dupe" or "clone." It matters to them. Use "Inspired By" in all product copy.

---

## BRAND IDENTITY

### The Name
**BaseNote** is the base note of a fragrance — what remains after everything else has faded. The foundation. The truth underneath. *Find your base note.*

### The Logo

**Wordmark:** BaseNote set in a custom high-contrast editorial serif. Near-imperceptible hand-finished detail on the *B* — slightly irregular stroke weight, as if drawn with a calligraphic pen. The word reads in two weights on a single baseline:
- **Base** — regular weight (the foundation)
- **Note** — slightly lighter (the thing that floats above)

This mirrors the product: anchor and top note, in the name itself.

**The Symbol:** A vertical scent strip / blotter, angled at 15 degrees — like a perfumer holding it to smell. Tall and narrow rectangle (proportion 1:5). A single horizontal **gold score line** across the lower third — where a perfumer draws the line before dipping into a formula.

The score line is the brand mark. Works alone as: favicon, app icon centre element, embossed physical packaging detail, watermark on share cards.

**App Icon:** Squircle (matching iOS/Android native shape). Inside: the score line mark in gold on near-black `#1A1208`. At small sizes — a refined mark. At large sizes — the blotter strip detail emerges. No text in the icon.

### Colour Palette (four colours, named after fragrance ingredients)

| Name | Hex | Usage |
|---|---|---|
| **Blotter White** | `#F5F0E8` | Light mode background — the canvas |
| **Parfumeur's Gold** | `#B8913A` | ALL interactive elements — one accent |
| **Encre (Ink)** | `#1A1208` | Dark mode background, headlines on dark |
| **Vetiver Grey** | `#6B635A` | Secondary text, borders, muted UI |

**Kill:** cyan gradients, slate blue, competing burgundy, `oklch` aura amber fighting gold.
**Rule:** One accent. Everywhere. Always Parfumeur's Gold.

### Typography

| Role | Typeface | Usage |
|---|---|---|
| **Display** | Cormorant Garamond Italic | Hero headlines, persona names, onboarding reveal, fragrance names on detail pages, pull-quote moments |
| **UI** | DM Mono (or Unbounded) | Labels, chips, counts, navigation, filters |

**The rule:** Every screen has *one* Cormorant moment — the emotional peak. Everything else holds it up. Never two display moments on one screen.

**Scale:** Display at `clamp(3rem, 8vw, 6rem)`. UI labels never below 11px.

**Fix immediately:** Resolve the token cascade conflict between `tokens.css` (Fraunces) and `globals.css` (Instrument Serif). Commit to Cormorant Garamond as the single display typeface.

---

## FEATURE NAMING CONVENTIONS

| Old Name | New Name | Reason |
|---|---|---|
| Clone / Dupe | **Inspired By** | Industry language, respectful, accurate |
| Smells Like | **Scent DNA** | Surfaces the innovation, ownable |
| Spritz | **Brief** | The morning brief — ritual, not gamification |
| Wear & Share | **The Strip** | Named after scent blotter — brand coherent |
| You tab | **Identity** | Matches the brand throughline |
| Load more | Infinite scroll | No walls during discovery |

---

## LANDING PAGE — NEW STRUCTURE

### Section 1 — The Hook (full viewport, dark)
Near-black background with subtle warm grain texture (CSS noise, no image needed).

Centre screen — headline fades in word by word:
> *You already have*
> *a scent identity.*
> *BaseNote finds it.*

Single gold CTA: **Begin →**

Nothing else competes. The confidence of showing less.

### Section 2 — The Personas
"Which one are you?" — 6 full-height dark cards, each feeling like its persona:
- Velvet Intellectual: private library at midnight
- Dark Alchemist: smoke and leather
- Solar Minimalist: blinding white space and green

Each card: persona tagline in large Cormorant italic only. No "Explore →" button. The mystery is the CTA.

Add: *"6 identities. Which is yours?"*

### Section 3 — Three Pillars (text only, no imagery needed)
> **Discover** — 127,000 fragrances. Filtered by who you are, not what's popular.
>
> **Layer** — AURA builds combinations from your collection. Not guesses. DNA.
>
> **Wear** — Log it, track it, earn it. Your scent history, building into a pattern only you have.

### Section 4 — The Inspired By Engine
*"Your £140 bottle has an inspired-by at £18."*
Two gradient cards labelled "Designer" / "Inspired By DNA Match." No stock photography needed. Replace the placeholder grey div entirely.

### Section 5 — Community Tease
> *"The fragrance community is moving here."*
> *Join 847 early members already building their scent identity.*

Update the number weekly. Real social proof, however small.

---

## APP — FEATURE UPGRADES

### 1. The Discover Grid → The Shelf
- 2-column portrait tiles on mobile (not 4)
- Gradient fallback cards using existing family tokens — look like perfume labels, not missing images
- Brand name in small caps top, fragrance name in Cormorant italic centre

### 2. Persona Immersion on Discover
- Active persona changes the entire page feel — chip borders, accent, background gradient
- Make it unmissable: this is a personalised edition, not a filtered list

### 3. Scent DNA Search (was: Smells Like)
- Dedicated full-width card above filter rows: **"SCENT DNA SEARCH"**
- Tapping opens dark overlay with Cormorant prompt: *"What does your ideal scent smell like?"*
- Results show as Inspired By matches with DNA match percentage
- This feature gets prime real estate — it's the most innovative thing in the app

### 4. The Brief (was: Spritz)
- Opens with persona tagline in large Cormorant italic for 1.5s, then card emerges
- Swipe affordance: chevron left (*"Later"*) + gold checkmark right (*"Worn"*) flanking card
- First open: card does a single gentle rock left-right-settle to teach gesture

### 5. The Onboarding Reveal — THE MOMENT
Full-screen black for 400ms. Then:
1. Persona name fades in word by word, 120ms apart — large Cormorant white
2. Hold 1 second
3. Persona tagline types itself, letter by letter at 30ms — gold
4. Three scent notes drift in from below — small, mono, Vetiver Grey
5. CTA fades up: **"This is your base note. →"** — gold

This screen is the marketing budget. Every user will screenshot it.

### 6. Identity Tab (was: You)
- Renamed "Identity" in nav
- Signed-out state: full-bleed persona card + *"Your identity is waiting."* + "Claim It →"
- Everything feels like a record of who you are as a fragrance person

### 7. The Strip (was: Wear & Share)
Constrained post format — like a perfumer's notation:
```
[Gold score line mark]  THE VELVET INTELLECTUAL
Lattafa Asad · worn this morning
"The one I reach for when I need to feel solid."
❤ 12   💬 3   ↗ Share
```
One fragrance. One line. One reaction. The constraint is the brand.

### 8. Community Layer on Fragrance Detail Pages
- "X people are wearing this today" — live, real data
- Most-saved layer combinations featuring this fragrance
- Community tab alongside Notes/Details

### 9. The Shelf (Profile Feature)
- Visual shelf of user's collection
- Bottles as family gradient cards (until images load)
- Shareable as a single image
- Social media moment: "My shelf →"

### 10. Scent Identity Score
- As users log wears, builds a live percentage split across personas
- Example: "Your identity is 60% Dark Alchemist, 30% Velvet Intellectual"
- Updated monthly. Always shareable. Retention hook.

---

## COMMUNITY GROWTH FLYWHEEL

**Season Drops (4x/year):** *The Brief* — curated editorial on what the community is wearing this season. Push notification + feed post. Community-powered content strategy.

**The Nose Leaderboard (monthly):** Most-worn fragrances across the community, by persona. Becomes press. *"BaseNote's Dark Alchemists reached for Amouage Interlude Man more than any other fragrance in May."*

**Strip of the Week:** Most resonant community Strip, curated and featured in-app + social. Zero cost, infinite social proof.

---

## IMPLEMENTATION SEQUENCE

### Sprint 1 — Foundation (Weeks 1–2)
- Resolve token cascade conflict, unify accent to Parfumeur's Gold
- Fix discover grid to 2-column
- Implement gradient fallback cards (beautiful, not broken)
- BaseNote name sweep — kill AnotherSense everywhere
- Fix: `--r-card` conflict between tokens.css and globals.css

### Sprint 2 — Landing Page (Weeks 3–4)
- Rebuild with 5-section structure
- Dark hero with grain texture
- Word-by-word headline animation
- Persona cards rebuilt as dark full-height editorial cards
- Replace placeholder div with Inspired By section

### Sprint 3 — Persona Immersion + Onboarding (Weeks 5–6)
- Full-screen onboarding reveal moment
- Persona theming across Discover (chips, borders, gradients shift)
- Scent DNA Search surface + dedicated overlay UI

### Sprint 4 — The Ritual (Weeks 7–8)
- Brief page opening moment (persona tagline)
- Swipe affordance upgrade
- Identity tab rename + signed-out state upgrade

### Sprint 5 — Community (Weeks 9–10)
- The Strip feed redesign
- "X wearing this today" on detail pages
- The Shelf profile feature
- Scent Identity Score (basic version)

---

## ORIGINAL UX AUDIT — FIX LIST

### 🔴 Critical
1. Default sort → Top Rated (not A–Z)
2. Nav order → Discover first
3. Spritz/Brief page name consistency
4. Empty wardrobe state on Brief/Spritz
5. Smells Like → Scent DNA with dedicated UI

### 🟠 High
6. Filter bar cognitive load — Saved chip out of Brand carousel
7. New to me strip — add scroll indicator + See all
8. Lab empty collection state
9. Most Popular sort → use owner_count not local wishlist
10. Layering back link — context-aware (not hardcoded "Wardrobe")
11. Load more → infinite scroll

### 🟡 Medium
12. Privacy policy date → June 26, 2026
13. Persona change without full reset
14. Count label → "127,000+ fragrances" not "100 fragrances"
15. Resonating + Searching dual loading states — explain the difference
16. No dark/light mode toggle — respect system preference

### 🔵 Low
17. Streak day-1 encouragement ("🔥 Streak started!")
18. XP toast positioning — safe area aware
19. Persona card hover on mobile (remove onMouseEnter)
20. AdSlot blank rectangles — add fallback content until AdSense live

---

## SOURCES

- [The Fragrance Trends Set to Define 2026 | BeautyMatter](https://beautymatter.com/articles/the-fragrance-trends-set-to-define-2026)
- [Perfume Consumer Behavior Statistics 2026 | Scento](https://www.scento.com/blog/perfume-consumer-behavior-statistics-2026-how-people-buy-fragrance)
- [Gen Z Fragrance Statistics 2026 | Scento](https://www.scento.com/blog/gen-z-fragrance-statistics-2026-new-perfume-generation)
- [Functional and Lifestyle Fragrance Trends 2026 | Aura Candle Bar](https://auracandlebar.com/blogs/news/functional-lifestyle-fragrance-trends-2026)
- [What's Next For Fragrance In 2026 | Beauty Independent](https://www.beautyindependent.com/what-next-fragrance-2026/)
- [Gen Z and Men Stirring Up the Fragrance Market | US Chamber of Commerce](https://www.uschamber.com/co/good-company/launch-pad/gen-z-and-men-fragrance-boom)
- [Logo Design Trends 2026 | SmartComma](https://smartcomma.com/logo-design-trends/2026)
- [Fragrance Test Strips: Professional Use | MemoryCross](https://store.memorycross.com/blogs/perfume-blotters/fragrance-test-strips-what-they-are-and-how-professionals-use-them)
- [Squircle App Icons | One4Studio](https://www.one4studio.com/glossary/squircle-icons)
- [Perfume Bottles as Cultural Artifacts | Rolling Stone](https://www.rollingstone.com/culture-council/articles/unexpected-rise-of-perfume-bottles-as-cultural-artifacts-1235553279/)
- [Perfume Shopper Demographics 2025 | FreeYourself](https://freeyourself.com/blogs/news/perfume-shopper-demographics)
- [Niche Perfume Statistics 2026 | Scento](https://www.scento.com/blog/niche-perfume-statistics-2026-market-size-growth-top-brands)
