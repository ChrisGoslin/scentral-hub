# Scentral — Customer Personas
*Last updated: 2026-06-13*

> These personas are the filter for every feature, label, and design decision.
> Before shipping anything, ask: "Does this serve Gavan or Christopher?"

---

## Persona 1 — Gavan (The Awakening Collector)

**Age:** 28  
**Location:** Dublin, Ireland  
**Occupation:** Office worker, corporate environment  

### Backstory

Gavan has always had an instinct for scent. Growing up he noticed when people smelled good. He never had more than one or two bottles at a time — fragrance felt like a luxury he'd dip into occasionally, not a hobby.

His approach was simple:
- One **gatekept signature scent** — something he's proud of, that feels like *him*. He only buys it when it goes on sale once or twice a year. It's not about the price; it's about the ritual of it.
- Two or three **cheaper dailies** that earn him compliments. The problem: they don't last. He has to carry them to work and reapply throughout the day.

### The Turning Point

A colleague — Christopher, a Middle Eastern fragrance enthusiast — pulled out a bottle at the office one afternoon. Gavan recognised the scent immediately. It was a 1:1 match for his gatekept signature.

Christopher explained it was an *inspired by* — a Middle Eastern house interpretation, a fraction of the price.

Gavan was floored. He ordered one on Notino that evening.

Then he ordered five more.

His collection is now building. He's crossed a threshold — from "one or two bottles" to someone who *collects*. He doesn't have the language for it yet. He doesn't know note pyramids or fragrance families. But he knows what he likes, he trusts his nose, and now he knows the inspired-by world exists.

### What Gavan needs from Scentral

1. **A bridge between what he knows and what's out there.** He knows his signature scent. Show him what else is in that universe.
2. **Plain language.** "Warm, long-lasting, works all day without reapplying" — not "amber base with synthetic musks."
3. **Longevity guidance.** His core pain point is his dailies fading. He needs to understand concentration (EDP vs EDT), projection, and which bottles will last without being taught a lecture.
4. **Inspired-by discovery.** This is his entry point. He wants to find more "Christopher moments" — stumbling onto something that sounds too good to be true and turning out to be real.
5. **A way to track and organise his growing collection.** He's gone from 2 bottles to 7+ fast. He's losing track.
6. **Layering basics.** Christopher showed him you can combine scents. He's curious but has no idea where to start.

### What Gavan does NOT need (yet)

- DNA match scoring with percentages
- pgvector / resonance terminology
- Spritz scheduler (his pain is longevity, not scheduling)
- Community features / following creators
- Monetisation / affiliate tracking

### Language filter — Gavan's voice test

| ❌ Don't say | ✅ Say instead |
|---|---|
| "Olfactory profile" | "Your nose" or "your taste" |
| "Woody oriental with amber dry-down" | "Warm, rich, stays close to skin" |
| "Add to your wardrobe" | "Save this one" |
| "Formulate an accord" | "Try layering these two" |
| "Resonance score: 87%" | "These two work really well together" |
| "Inspired by reference catalogue" | "Smells like [Designer Name]" |
| "Concentration: EDP" | "Lasts all day — won't need to reapply" |
| "Projection: moderate sillage" | "People nearby will notice it" |

### Design signal

Gavan responds to warmth and confidence, not minimalism and tech. The app should feel like a knowledgeable friend who happens to know a lot about fragrance — not a database. The amber palette (`#b45309`, `#d97706`) on dark (`#1a1a1a`) is right for him. Keep it editorial, not clinical.

---

## Persona 2 — Christopher (The Enthusiast Evangelist)

**Age:** 34  
**Location:** Dublin, Ireland (originally from the Middle East)  
**Occupation:** Senior professional, office environment

### Backstory

Christopher grew up surrounded by fragrance culture. In the Middle East, scent is part of daily life — layering oud, applying attar, understanding projection and longevity is second nature, not a hobby niche. He's carried that into his life in Ireland.

He has a large, curated collection — Lattafa, Afnan, Rasasi, Swiss Arabian, Khadlaj, and others. He knows note pyramids, house styles, the difference between a clone and an inspired-by, and which Middle Eastern houses punch above their weight against European luxury maisons.

He's the person who introduced Gavan to the inspired-by world. He does this regularly — showing colleagues, friends, and family that you don't have to pay €150 for a great scent.

### What Christopher needs from Scentral

1. **A tool to organise and showcase his collection.** He has 30–50+ bottles. He wants to log them, categorise by role (foundation, enhancer, modifier), and track layering combinations that work.
2. **Layering intelligence.** He already knows his combinations instinctively. He wants an app that confirms, extends, and helps him articulate *why* they work — so he can share the reasoning with others like Gavan.
3. **Discovery within the Middle Eastern fragrance world.** Even he doesn't know every brand. He wants to find new Lattafa lines, new Afnan releases, hidden gems.
4. **A way to be the expert.** Scentral should let Christopher *share* — a collection profile, layering recommendations, "if you like X try Y" lists — so he can be the in-app version of what he already is in real life.
5. **Inspired-by mapping.** He knows these intuitively but wants confirmation and discovery. "What does Lattafa Asad compare to?"

### What Christopher does NOT need

- Onboarding hand-holding
- Plain-language translations of note terminology
- "Start here" moments

### Design signal

Christopher can handle density and information. He appreciates precision. For him, showing the note pyramid is a feature, not jargon. The gap between Gavan and Christopher is the reason Scentral needs two tiers of language — simple by default, depth available on demand.

---

## How These Two Personas Work Together

Gavan is Scentral's **growth engine** — there are millions of him. The inspired-by moment is the hook that brings him in.

Christopher is Scentral's **content engine** — he creates the collections, layering combinations, and "smells like" mappings that make the app valuable for Gavan.

The product should be:
- **Gavan's front door** — simple, warm, "help me find something"
- **Christopher's workshop** — deep, organised, shareable

Neither persona should feel like they're in the wrong place.

---

## Immediate Product Implications

### Fix now (language — no code changes needed in Claude Code)
- [ ] Landing page hero copy — written for Gavan, not Christopher
- [ ] Nav labels — "Library" → "Your Bottles", "Lab" → "Try Layering"
- [ ] Empty states — currently blank; should say something warm and inviting
- [ ] AURA rename — "AURA Layering Lab" → "Layer Builder" (or similar)
- [ ] "Formulate" → "Build"
- [ ] Note pyramid labels — add plain-English translation alongside technical terms

### Build next (features)
- [ ] **Inspired-by lookup** — search or scan → "This smells like [Designer]" — this is THE Gavan hook
- [ ] **Discover page** — browse 176 fragrances without needing to own one first
- [ ] **Longevity filter** — "show me only long-lasting scents" (EDP, high projection)
- [ ] **Onboarding flow** — 3-question quiz: what do you own, what do you like, what do you need → personalised starting point

### Deprioritise
- [ ] Spritz scheduler — keep in app, remove from main nav
- [ ] Payout dashboard / affiliate tracking — hide entirely from Gavan's view
- [ ] DNA match page — rename and simplify or bury in Christopher's power-user section

---

## Free vs Pro Feature Tier

All features are preserved. Pro features are gated behind `ProGate` — a visual lock component that shows a blurred teaser and "Coming Soon" upgrade button. No payment logic yet. To unlock any feature, change `isPro = false` → `isPro = true` in `components/ui/ProGate.tsx`.

### Free (Gavan's world — always visible)
| Feature | Route | Nav label |
|---|---|---|
| My Bottles | `/collection` | My Bottles |
| Layer Builder | `/layering` | Layering |
| Discover / Browse | `/collection?browse=true` | Discover |
| You / Profile | `/you` | You |

### Pro (Christopher's world — gated)
| Feature | Route | Pro name |
|---|---|---|
| Intelligence / Collection Radar | `/intelligence` | Deep Dive |
| DNA Match / Resonance | `/dna-match` | Compare Scents |
| Spritz Scheduler | `/schedule` | My Schedule |
| Rotation Intelligence | `/you` (section) | Rotation Intel |

**Rule:** Gavan should never feel like he's missing something. Pro features are framed as "more, when you're ready" — not as locked basics.

---

## Vercel Cleanup (Do This First)

**Source of truth:** GitHub repo `ChrisGoslin/scentral` → Vercel project `scentral`

**Delete these Vercel projects (they are dead):**
- `scentral-hub` — one deploy, empty
- `scentral-vmrf` — dead fork
- `scentral-z32m` — dead fork
- `scentral-znjm` — dead fork
- `fragrance-community` — original prototype, fully superseded

**Action:** Go to vercel.com → each project → Settings → Delete Project.
Then work exclusively from `scentral` going forward.
