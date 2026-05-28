# Scentral Hub: Brand Alignment Audit & Next Steps

## Current State

### What We've Built
- ✅ **Layering Lab MVP** — Interactive fragrance combiner (free, client-side)
  - Harmony score calculation (weighted: top 25%, heart 50%, base 25%)
  - 3 preset fragrances (Lattafa Raghba, Afnan Turathi, Ajmal Wazn)
  - localStorage persistence
  - Charcoal dark mode + amber accents
  - Zero auth required

### What You've Designed (In Scentral Brand System)
- ✅ **Brand Identity System** — Complete voice, personality, visual language
- ✅ **Consumer Psychology Framework** — 6 core drivers + trust signals
- ✅ **Product Naming** — Accord (combos), Arc (day schedule), Shelf (collection), Card (export)
- ✅ **Design System** — Satoshi font, amber/cream/charcoal palette, UX principles
- ✅ **Fragrance Data Requirements** — Complete schema (notes, longevity, sillage, dupes, etc.)
- ✅ **User Research** — Extensive fragrance market deep-dives in Google Drive

### The Gap
The Layering Lab MVP is **technically sound** but **not yet aligned with Scentral's full identity**:

| Aspect | Current | Scentral Vision | Action |
|--------|---------|-----------------|--------|
| **Product name** | "Layering Lab" | "Accord Creator" or just "Scentral" | Rename to match brand |
| **Visual identity** | Generic amber + charcoal | Satoshi font + cream/amber/charcoal system | Update typography + spacing |
| **Brand voice** | Silent (no copy) | Warm, knowing, never gatekeeping | Add copy + microcopy |
| **Fragrance count** | 3 presets | 50–200+ quality fragrances | Expand library |
| **User experience** | Standalone tool | Part of Shelf → Accord → Arc → Export flow | Integrate into broader product |
| **Commerce integration** | None | Affiliate rows (TikTok Shop, Fragrance Direct, etc.) | Add shopping features |
| **Community** | Solo experience | Public profiles, trending, shares | Add social layer |
| **Landing page** | None | Full marketing funnel | Build landing page |

---

## Immediate Next Steps (This Month)

### Phase 1: Rebrand & Align Current MVP (1–2 weeks)

**Task 1.1: Rename to "Accord Creator"**
- "Scentral" is the app; "Accord Creator" is this specific feature
- Update: component names, page title, UI labels, documentation

**Task 1.2: Apply Scentral Design System**
- Typography: Switch to Satoshi (or Instrument Sans as fallback)
- Colors: Adopt --color-primary (amber), --color-text-primary, --color-background-primary from your system
- Spacing: Use 8px grid consistently (currently ad-hoc)
- Borders: Use --border-radius-md (8px), --border-radius-lg (12px) per system
- Remove generic "Harmony Score" heading; use warmer framing ("This combo vibes")

**Task 1.3: Add Brand Voice & Microcopy**
- Replace generic labels with Scentral voice:
  - "Harmony Score" → "Vibe match: X%"
  - "Load Preset" → "Explore a combo →"
  - "Slot 1" → "First layer"
  - "+ Add Fragrance" → "Pick a bottle →"
- Add help tooltip: "Layer 2–3 of your bottles to discover new combos"

**Task 1.4: Expand Fragrance Library (50+)**
- Add 47 more fragrances to the current 3
- Target: mix of Zara (affordable), Lattafa/Afnan (niche), 1–2 designer (trust anchor)
- Use data from your fragrance research Google Sheets
- Include: notes (top/heart/base), longevity, sillage, price

**Task 1.5: Deploy Rebranded MVP to Vercel**
- Update project name to `scentral` (if not already)
- Deploy and get live URL

---

### Phase 2: Build Landing Page (1–2 weeks)

**Task 2.1: Review `scentral-landing-spec.md`**
- Read your existing landing page specification
- Confirm design constraints, copy, CTA
- Identify any dependencies on fragrance data or auth

**Task 2.2: Implement Landing Page**
- Build following your spec exactly
- Integrate with Accord Creator (link from CTA)
- Components needed:
  - Hero section (headline, subheading, CTA)
  - Value prop section (3–4 key benefits)
  - Feature showcase (how Accord Creator works)
  - Social proof (if available)
  - Pricing (if applicable)
  - FAQ
  - Footer

**Task 2.3: SEO & Metadata**
- Title tag: "Create fragrance layering combos | Scentral"
- Meta description: ~160 chars with keyword "fragrance" + "combo" / "accord"
- Open Graph image (1200×630px, brand colors)
- Favicon: bottle silhouette per your design system

**Task 2.4: Analytics Setup**
- Install Vercel Analytics (or Plausible)
- Track: page views, CTA clicks, Accord Creator link-outs
- Track: fragrance selections (anonymised)

---

### Phase 3: Validation & Iteration (Ongoing)

**Task 3.1: Launch & Monitor**
- Deploy landing page + rebranded Accord Creator to Vercel
- Share URL with 10–20 target users (Luna + Marcus proxies from your research)
- Collect feedback via form or 1:1 interviews

**Task 3.2: Measure & Iterate**
- Week 1: Are users clicking "Explore a combo"? (target: 20%+ CTA click rate)
- Week 2: Are users trying 2–3 fragrances? (target: 60%+ composition rate)
- Week 3: Do users return? (target: 10%+ repeat visits)
- Adjust copy, design, or library based on data

---

## Naming Alignment (Critical)

Your brand system specifies these names; ensure consistency across all platforms:

| Concept | Name | Example |
|---------|------|---------|
| App | **Scentral** | "Open Scentral" |
| 2–3 fragrance combo | **Accord** | "Save this Accord" |
| Day scent schedule | **Arc** | "Build your Arc" |
| Fragrance collection | **Shelf** | "Your Shelf" |
| Exported combo card | **Card** | "Export Card" |
| This specific feature | **Accord Creator** | "Create an Accord →" |
| Landing page | **Scentral.co / Scentral.app** | Domain TBD |

---

## Brand Voice Checklist (Every Component)

Before shipping any UI text, verify:

- [ ] Does it sound warm and welcoming? (not clinical)
- [ ] Is it free of gatekeeping language? (avoid "notes," "olfactory," "prestige")
- [ ] Does it explain fragrance concepts briefly if needed?
- [ ] Is it action-oriented? ("Pick a bottle" not "Select a fragrance")
- [ ] Is it honest about commerce? (affiliate disclosures clear)
- [ ] Does it reduce anxiety or increase confidence?

---

## Alignment Scorecard

Rate current state (0–5 scale):

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Brand voice | 0 | 5 | 🔴 Critical |
| Design system alignment | 2 | 5 | 🔴 Critical |
| Fragrance library | 1 | 4 | 🔴 Critical |
| Landing page | 0 | 5 | 🔴 Critical |
| Social integration | 0 | 3 | 🟡 High |
| Affiliate setup | 0 | 3 | 🟡 High |
| Auth + accounts | 0 | 4 | 🟡 High |
| **Overall** | **0.4/5** | **4/5** | **Significant work ahead, but foundation is strong** |

---

## Success Metrics (Month 1)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Landing page live | Day 5 | Deploy check + Vercel URL live |
| CTA click rate (landing → Accord Creator) | 20%+ | Vercel Analytics |
| Composition rate (users create 1+ Accord) | 50%+ | Client-side event tracking |
| Return visitors | 5%+ | Repeat session tracking |
| Library size | 50+ fragrances | Hardcoded presets count |
| Brand voice consistency | 90%+ | Manual audit of all copy |
| Design system compliance | 95%+ | Figma + code review |

---

## Implementation Order (This Week)

```
DAY 1: Read scentral-landing-spec.md + review your fragrance research
DAY 2: Expand library from 3 → 50+ fragrances (use your Google Sheets data)
DAY 3–4: Apply Scentral design system to Accord Creator (typography, colors, spacing)
DAY 5: Add brand voice microcopy throughout Accord Creator
DAY 6–7: Build landing page (hero, benefits, features, CTA, footer)
DAY 8: SEO + analytics setup
DAY 9: Test end-to-end (landing → Accord Creator → export flow)
DAY 10: Deploy to Vercel; prepare for user validation
```

---

## Questions to Answer Before Building

1. **Fragrance data source:** Where are you pulling the 50+ fragrances? (Your Google Sheets? Hardcoded? API?)
2. **Landing page design:** Do you have Figma mockups for the landing page, or should I build from `scentral-landing-spec.md` text description?
3. **Affiliate URLs:** Are you ready to integrate affiliate links (TikTok Shop, Fragrance Direct, ASOS, etc.) or ship without commerce first?
4. **Domain:** Do you own `scentral.co` / `scentral.app` yet? Or deploy to `scentral-hub.vercel.app` for now?
5. **Auth:** Should landing page have sign-up, or is Accord Creator guest-only for MVP?

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Fragrance data expansion is slow | Pre-populate with 30 from your research; expand incrementally post-launch |
| Landing page takes too long | Use template (e.g., Framer, Webflow) if custom build is slow |
| Brand voice feels off | Test copy with 3–5 target users before launch; iterate fast |
| No auth = no retention | Fine for MVP; add accounts + Shelf in Phase 2 (month 2) |

---

**Status:** Ready to execute. Awaiting clarity on fragrance data source + landing page spec format.
