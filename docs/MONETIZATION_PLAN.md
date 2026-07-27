# nota. — Monetization Plan

> Created 2026-06-23. Current state: **~0% built.** No AdSense, no Shopify, no working payment path, affiliate IDs are placeholders. This is the buildout plan for the three revenue streams Christopher wants: **ads (PWA/app real-estate), affiliate links, and a Shopify storefront** — plus the existing Pro tier.
> Companion to [`GAP_ANALYSIS.md`](GAP_ANALYSIS.md) and [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md).

---

## Current state (verified in code)
| Stream | State | File |
|---|---|---|
| AdSense / AdWords | ❌ Nothing — zero matches for `adsense`/`adwords`/`doubleclick` | — |
| Affiliate links | ⚠️ Wired but **placeholder IDs** (`'scentral'`, empty params) | `lib/affiliates.ts` (Fragrantica/FeelUnique/Notino) → `BuyLinks.tsx` |
| Shopify | ❌ Nothing — zero matches for "Shopify" in codebase | — |
| Pro / subscription | ⚠️ Real gate, **fake checkout** — no Stripe dep, button is no-op | `lib/subscription.ts`, `/pro` |
| Schema support | ❌ No `buy_link` / `affiliate_url` / `similarity_score` columns | `fragrances` table |

---

## Recommended sequence: **Affiliate → AdSense → Shopify** (Decision #5)
Affiliate is fastest to revenue because the data foundation (`inspired_by`, retailers, `BuyLinks`) already exists.

### 1. Affiliate (fastest revenue)
- **Schema migration** (needs Christopher approval before applying): add `fragrances.buy_link text`, `fragrances.affiliate_url text`, `fragrances.similarity_score int`.
- **Register real programs:**
  - **Awin** — Notino, FragranceNet, Boots (UK-friendly, matches existing `lib/affiliates.ts` retailers).
  - **Amazon Associates** — 3–8% on beauty.
  - **CJ / Jomashop** — what clonespreadsheet.com itself monetizes with (designer + clone coverage).
- **Replace** placeholder `'scentral'` IDs in `lib/affiliates.ts` with real tracking IDs (env vars, not hardcoded).
- **Wire into:** `BuyLinks.tsx` (detail page), the new **`/clones` Clone/Dupe Finder** (highest-intent surface), and Discover cards.
- **Track clicks** — PostHog event on every affiliate-link click (attribution + later revenue-share reporting).
- **Disclosure** — ToS already mentions commission; add a visible "we may earn a commission" line near buy buttons (FTC/ASA compliance).

### 2. AdSense (passive PWA/app real-estate)
- **Prereqs:** AdSense account approval; `public/ads.txt`; privacy-policy update (already have `/privacy`).
- **Integration:** AdSense loader via `next/script` (strategy `afterInteractive`) in `app/layout.tsx`; a reusable `<AdSlot/>` component.
- **Placements:** Discover feed (every ~10 cards, in-feed native), detail-page below-fold, `/you`, `/social`. Keep above-fold and onboarding ad-free (UX + policy).
- **Policy caution:** Google ad policy restricts ads in **native app wrappers** (TWA/WebView) and requires real content density — verify before shipping to the app stores. Revenue est. **£300–800/mo @ 10k MAU** *(single-source estimate, unvalidated — treat as a guess until measured).*

### 3. Shopify storefront (highest margin)
- **Product:** persona-matched **Discovery Kits** (5 samples, £15–25) + seasonal **sample subscription** (Perfume-Society model, ~£21/3mo) + branded boxes. Ties to the 6 scent-identity personas and EPC-style creation kits.
- **A Shopify MCP is already available in this workspace** for store setup.
- **Decision:** headless (Storefront API embedded in-app, seamless UX) vs hosted subdomain (faster, less integration). Recommend hosted to start, headless later.
- **Hooks into app:** persona result → "Your Discovery Kit"; `/clones` → "Buy a sample first"; Layering Lab → ingredient kits.

### 4. Pro tier (defer, Decision #4)
- Keep **beta-open** (`NEXT_PUBLIC_BETA_MODE=true`) for now; the `/pro` page should either get **real Stripe** or be **hidden** until then (currently ships a dead "Subscribe" button — fix this regardless).
- When activated: add Stripe dep, move `getIsPro()` from a **global env flag to per-user** (current global flag is the footgun behind 3 past dead-code bugs).
- Pro value props that already exist to gate: Intelligence dashboards, DNA Match, advanced stats, export/backup.

---

## Compliance / housekeeping checklist
- [ ] Affiliate disclosure visible near all buy buttons (ASA/FTC).
- [ ] `ads.txt` + privacy policy updated for AdSense.
- [ ] Cookie/consent banner if ads + analytics run in EU/UK (GDPR).
- [ ] No secrets in code — all affiliate/ad/Shopify keys via env vars.
- [ ] App-store ad-policy review before bundling AdSense into a native wrapper.
