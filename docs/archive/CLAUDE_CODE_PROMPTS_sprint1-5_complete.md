# nota. — Claude Code Implementation Prompts
### Sprint 1–5 · Full UX Fix + Brand Build
### Generated: 2026-06-27

Run these prompts in Claude Code in order. Each is self-contained. Do NOT split files — one prompt = one commit.

---

## SPRINT 1 — Foundation

---

### Prompt 1: Resolve CSS token cascade conflict

The app imports `globals.css` then `lib/design/tokens.css` in `app/layout.tsx`. `tokens.css` defines `--font-display: var(--font-fraunces)` which overrides `globals.css` `--font-display: var(--font-instrument-serif)`, and `--r-card: 0px` which overrides `16px`. This cascade conflict means the wrong font and no border radius at runtime.

Fix `lib/design/tokens.css`:

1. Change line 60: `--font-display: var(--font-fraunces, "Fraunces", Georgia, serif);` → `--font-display: var(--font-cormorant, "Cormorant Garamond", Georgia, serif);`
2. Change line 43: `--r-card: 0px;` → `--r-card: 12px;`
3. Remove the nota./Aura tokens block (lines 63-65): `--aura:`, `--aura-surface:`, `--aura-border:`, `--xp-color:` — these are dead tokens from a retired design language.

Fix `app/layout.tsx`:

1. Replace the `Instrument_Serif` import with `Cormorant_Garamond`:
```
import { Cormorant_Garamond, Unbounded } from "next/font/google";
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
```
2. Remove the `instrumentSerif` const and its font variable `--font-instrument-serif`.
3. Update the `<html>` className to include `cormorantGaramond.variable` instead of `instrumentSerif.variable`.

Fix `app/globals.css`: change `--font-display: var(--font-instrument-serif)` to `--font-display: var(--font-cormorant)`.

Confirm: after this change, `--font-display` everywhere resolves to Cormorant Garamond. `--r-card` everywhere resolves to 12px.

```
git commit -m "fix(tokens): resolve CSS cascade conflict — Cormorant Garamond + 12px r-card"
```

---

### Prompt 2: Unify accent to Parfumeur's Gold

The app has competing accent colours: `--color-primary: #A0622A` in globals.css light mode, `#D4884A` in dark mode, and `--family-oriental-start: #c49a3c` in tokens.css. This produces visual inconsistency.

Update `app/globals.css`:
1. In `:root`: change `--color-primary` from `#A0622A` to `#B8913A`
2. In `[data-theme="dark"]`: change `--color-primary` from `#D4884A` to `#B8913A` (same gold in both modes — gold should be consistent)

Update `lib/design/tokens.css`:
1. Remove `--burgundy` and `--burgundy-press` from `:root` (no burgundy in the new palette)
2. Remove `--surface-deep` from `:root` and dark override — no longer needed
3. In `[data-theme="dark"]`, update `--accent-press` to `#9A7A2E`

This ensures every `var(--accent)` resolves to `#B8913A` — Parfumeur's Gold — on both light and dark.

```
git commit -m "fix(tokens): unify accent to Parfumeur's Gold #B8913A across light + dark"
```

---

### Prompt 3: Fix DiscoverGrid — 2-column on mobile

In `app/(main)/discover/DiscoverGrid.tsx`, find the grid container style. It currently uses `grid-cols-4` on mobile, making cards ~80px wide — unusable.

Change the grid to 2 columns on mobile, 3 on tablet, 4 on desktop. Use inline style (not Tailwind class) to stay consistent with the rest of the file:

```ts
display: 'grid',
gridTemplateColumns: 'repeat(2, 1fr)',
gap: 12,
padding: '0 12px',
```

Add a CSS media query via a `<style>` tag injected once at the top of the component (or use a `min-width` via the existing responsive pattern in the codebase). If the file uses Tailwind classes, use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.

Also: make each fragrance card min-height `220px` on mobile to give the gradient/image breathing room. The card should show brand (small caps, muted) on top, fragrance name (Cormorant italic, 16px) in the lower third.

```
git commit -m "fix(discover): 2-column grid on mobile, card min-height 220px"
```

---

### Prompt 4: Fix gradient fallback cards

In `app/(main)/discover/DiscoverGrid.tsx` (or the `FragranceCardMedia` component it uses), when `imageUrl` is null or empty, the card currently shows a grey placeholder or an SVG bottle icon.

Update the fallback to use the family gradient tokens already defined in `lib/design/tokens.css`. Read `lib/familyGradients.ts` to understand the existing mapping.

The fallback card should:
1. Show a `background: linear-gradient(160deg, var(--family-{family}-start), var(--family-{family}-end))` where `family` is the fragrance's `family` field lowercased and snake-cased.
2. Display the brand name centred in small caps at 10px, Vetiver Grey (`#6B635A`), top quarter.
3. Display the fragrance name centred in Cormorant italic at 16px, white, lower third.
4. Display a faint horizontal score line (`border-top: 1px solid rgba(255,255,255,0.2)`) above the name — the blotter strip brand mark.

Use the family gradient map already in `lib/familyGradients.ts` for the CSS variable names. Fall back to `--family-default-start` / `--family-default-end` if the family isn't in the map.

```
git commit -m "fix(cards): gradient fallback when no image — uses family tokens + score line mark"
```

---

### Prompt 5: Nav order + Identity tab rename

In `app/components/BottomNav.tsx`, the current nav order is: Wardrobe → Lab → Discover → Spritz → You.

Change the order to: **Discover → Wardrobe → Lab → Brief → Identity**

- Rename "Spritz" tab label to "Brief" (keep the route `/spritz` unchanged — only the display label changes)
- Rename "You" tab label to "Identity" (keep the route `/you` unchanged)
- Discover should be first — it's the entry point for new users

Do NOT change any href values or route paths. Only the display labels and order of nav items.

```
git commit -m "fix(nav): Discover first, rename Spritz→Brief, You→Identity tab labels"
```

---

### Prompt 6: "Saved" chip fix in DiscoverFilters

In `app/(main)/discover/DiscoverFilters.tsx`, the `❤ Saved` chip is currently rendered in its own standalone block between Occasion and Brand carousels. This makes it look like a separate filter category.

Move the Saved chip to be the **first item** in the Sort carousel row, before the sort options. It should be visually grouped with the sort options, separated by a subtle pipe `|` or a small gap.

Alternatively (cleaner): move it to be a standalone row but label it "My Collection" and position it immediately after the search row, before the Vibe carousel. This makes the user's saved items a primary navigation act, not a buried afterthought.

Use the second approach — rename to "❤ Saved" but move to top, right after the search bar, before Vibe filters.

```
git commit -m "fix(filters): Saved chip moved above filter carousels for better discoverability"
```

---

## SPRINT 2 — Landing Page

---

### Prompt 7: Landing page hero — dark full-screen section

In `components/landing/HeroSection.tsx`, replace the current hero with a full-viewport dark section.

Requirements:
- Background: `#1A1208` (Encre) with subtle CSS noise grain texture:
  ```css
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  ```
- Centre-aligned headline in Cormorant Garamond Italic, white, `clamp(3rem, 8vw, 6rem)`:
  > *You already have*
  > *a scent identity.*
  > *nota. finds it.*
- Each line fades in sequentially (CSS animation, 400ms delay between lines)
- Single gold CTA button: **Begin →** using `var(--accent)` background, `#1A1208` text, pill shape
- Remove the "Find Your Identity →" and "Explore Collection →" dual CTAs
- Remove the cyan radial gradient (`rgba(6,182,212,0.10)`)
- Remove the waitlist link

The page should feel like the opening frame of a film, not a SaaS signup page.

```
git commit -m "feat(landing): dark full-screen hero, single Begin CTA, Cormorant headline"
```

---

### Prompt 8: Landing page — replace placeholder div with Inspired By section

In `components/landing/HeroSection.tsx` or `app/page.tsx`, there is a section with `aria-hidden="true"` containing a grey gradient placeholder div where a product image should appear.

Replace this entire section with a new **Inspired By Engine** section:

```tsx
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
  <div style={{ display: 'flex', gap: 16, maxWidth: 480, margin: '0 auto', justifyContent: 'center' }}>
    {/* Designer card */}
    <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, #5c4033, #8d7662)', textAlign: 'center' }}>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Designer</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18 }}>Baccarat Rouge 540</p>
      <p style={{ color: '#B8913A', fontSize: 13, marginTop: 4 }}>£285</p>
    </div>
    {/* Inspired By card */}
    <div style={{ flex: 1, padding: '24px 16px', borderRadius: 12, background: 'linear-gradient(160deg, #c49a3c, #8a4b2e)', textAlign: 'center' }}>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Inspired By</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F5F0E8', fontSize: 18 }}>DNA Match · 94%</p>
      <p style={{ color: '#B8913A', fontSize: 13, marginTop: 4 }}>£19</p>
    </div>
  </div>
</section>
```

```
git commit -m "feat(landing): replace placeholder div with Inspired By Engine section"
```

---

### Prompt 9: Landing page persona cards redesign

In `components/landing/PersonaTeasers.tsx`, the current cards use `flex: 0 0 240px` and a `hover:scale-105` that causes sticky glitch on mobile.

Redesign the persona section:

1. Remove `onMouseEnter` hover scale — replace with `opacity: 0.85` → `opacity: 1` transition on hover
2. Make cards full-height dark editorial style. Each card should use the persona's `ui_theme.bgGradient` as background
3. Show only the persona's tagline in large Cormorant italic, white, no other text (the mystery is the CTA)
4. Add a subtle vertical score line mark (1px gold line, 40px tall) at bottom centre of each card
5. On mobile: horizontal scroll with `scroll-snap-type: x mandatory`
6. Add section label above: "6 identities. Which is yours?" in 10px uppercase Vetiver Grey
7. Each card minimum height: `clamp(260px, 40vw, 340px)`, width: `clamp(200px, 60vw, 280px)`

Persona taglines (from `lib/personas.ts`):
- Velvet Intellectual: "You collect ideas the way others collect souvenirs."
- Dark Alchemist: "You wear fragrance as armour and invitation at once."
- Solar Minimalist: "Your scent announces you before you speak."
- Ritual Keeper: "You believe scent is a form of meditation, not decoration."
- Rebel Experimentalist: "You treat fragrance like art — always pushing boundaries."
- Comfort Seeker: "Your scent is like a warm hug — it makes people feel at ease."

```
git commit -m "feat(landing): persona cards dark editorial style, Cormorant taglines, no sticky hover"
```

---

## SPRINT 3 — Onboarding + Persona Immersion

---

### Prompt 10: Onboarding reveal moment

Find the component that shows the persona result after quiz completion. It likely renders a `PersonaResult` or similar. Add a cinematic reveal animation **before** the result card appears.

Implement as a full-screen overlay using Framer Motion (already imported in the codebase):

```tsx
// Phase 1: black screen 400ms
// Phase 2: persona name fades in word by word (120ms between words)
//   - Each word: opacity 0→1, translateY 10px→0
//   - Font: var(--font-display), italic, clamp(3rem, 8vw, 5rem), white
// Phase 3: hold 1000ms
// Phase 4: persona tagline types itself letter by letter (28ms per character)
//   - Font: var(--font-body), 16px, var(--accent) colour
// Phase 5: three scent notes drift up from below (staggered, 200ms apart)
//   - Small, DM Mono or var(--font-body), Vetiver Grey
// Phase 6: CTA fades in
//   - "This is your base note. →" in var(--accent)
//   - onClick: dismiss overlay, show the actual persona result card
```

The overlay uses `position: fixed, inset: 0, zIndex: 999, background: #1A1208`.

Get persona data (name, tagline, scent_spectrum) from the `lib/personas.ts` persona object. The three scent notes should come from `persona.scent_spectrum.base` (the base notes — what remains, matching the brand name).

```
git commit -m "feat(onboarding): cinematic reveal — word-by-word name, typewriter tagline, note drift"
```

---

### Prompt 11: Spritz/Brief — naming fix + swipe affordance

In `app/(main)/spritz/SpritzClient.tsx`:

1. Find the `<h1>` that says "Aura" — change it to "Today's Brief"
2. Find the page `<title>` or document.title assignment — change to "Your Brief | nota."

Add swipe affordance to the card:
- Below the main card, add a row with three elements in a flex layout:
  ```
  ← Later        [card]        Worn ✓
  ```
- "Later" text in Vetiver Grey, 13px, left. Tapping fires the "skip" action.
- "Worn ✓" text in Parfumeur's Gold, 13px, right. Tapping fires the "worn" action.
- This makes the gestures discoverable without instructions.

First-use animation (check `localStorage.getItem('scentral_brief_tutorialSeen')`):
- If not set: card should do a single gentle rock animation on mount:
  `rotateZ: [0, -3, 3, -2, 0]` over 600ms using Framer Motion
- Set `localStorage.setItem('scentral_brief_tutorialSeen', '1')` after the animation completes

Fix empty wardrobe state:
- If the user has no fragrances in `localStorage.getItem('scentral_collection')`, show:
  ```
  [Cormorant italic, large] "Your brief is waiting."
  [small text] "Add fragrances to your collection to start your daily ritual."
  [gold button] "Explore Fragrances →" → href="/discover"
  ```

```
git commit -m "feat(brief): rename to Today's Brief, swipe affordance, rock tutorial, empty state"
```

---

### Prompt 12: Identity tab — signed-out upsell upgrade

In `app/(main)/you/YouClient.tsx`:

1. Find the signed-out upsell state (look for `pointerEvents: 'none'` on blurred preview cards)

2. Replace the blurred card approach with a clean full-screen Identity state:
   ```tsx
   <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
     <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--text)', marginBottom: 16 }}>
       Your identity is waiting.
     </p>
     <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, maxWidth: 280 }}>
       Take the 2-minute quiz to discover your scent identity.
     </p>
     <a href="/quiz" style={{ background: 'var(--accent)', color: '#1A1208', padding: '14px 28px', borderRadius: 9999, fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>
       Find Your Base Note →
     </a>
   </div>
   ```

3. Remove the hardcoded fake data references to "Lattafa Asad" in the upsell state (those should only appear if the user actually has Lattafa Asad in their collection)

4. Remove `pointerEvents: 'none'` from the blurred cards — replace with the full-screen identity state above instead

```
git commit -m "fix(identity): replace blurred upsell with clean signed-out state, remove fake data"
```

---

## SPRINT 4 — Scent DNA Search

---

### Prompt 13: Surface Scent DNA Search

In `app/(main)/discover/DiscoverFilters.tsx`, the "Smells Like" button is currently a small inline button next to the search input. This buries the most innovative feature in the app.

Promote it:

1. Add a new full-width card **above** the search row:
   ```tsx
   <button
     onClick={onSmellsLikeToggle}
     aria-pressed={smellsLikeMode}
     style={{
       width: '100%',
       padding: '14px 16px',
       background: smellsLikeMode ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface)',
       border: `1px solid ${smellsLikeMode ? 'var(--accent)' : 'var(--line)'}`,
       borderRadius: 'var(--r-card)',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
       cursor: 'pointer',
       transition: 'all 0.15s',
       margin: '0 16px',
       width: 'calc(100% - 32px)',
     }}
   >
     <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: smellsLikeMode ? 'var(--accent)' : 'var(--text-muted)' }}>
       SCENT DNA SEARCH
     </span>
     <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
       {smellsLikeMode ? '✓ Active' : 'Describe a scent →'}
     </span>
   </button>
   ```

2. Remove the "Smells Like" button from inside the search row (it's now the card above)

3. When Scent DNA is active (`smellsLikeMode === true`), update the search input placeholder to: "Describe your ideal scent — warm amber, fresh citrus, dry wood…"

4. Update the feature name everywhere it appears in this file: "Smells Like" → "Scent DNA"

```
git commit -m "feat(discover): promote Scent DNA Search to full-width card, rename from Smells Like"
```

---

## SPRINT 5 — Community

---

### Prompt 14: The Strip — Wear & Share redesign

Find the Wear & Share feature (likely in `app/(main)/you/YouClient.tsx` or a dedicated component). Rename all occurrences of "Wear & Share" to "The Strip" in display labels only — do not rename file paths, route paths, or function names.

If The Strip/Wear & Share has a post format component, update it to the constrained notation format:

Each Strip post should render as:
```
[Gold horizontal score line, full width, 1px]
[Top row: persona name in small 9px uppercase · fragrance brand in muted]
[Fragrance name in Cormorant italic, 16px]
[User's note in quotes, 13px, italic, muted — max 2 lines, truncated]
[Bottom row: ❤ count  💬 count  ↗ Share  —  all in 12px muted]
```

Style each post with: no card shadow, just the top gold score line as the separator. Narrow padding (12px). Stack posts with no gap — the score line is the divider.

```
git commit -m "feat(strip): rename Wear & Share → The Strip, constrained post format with score line"
```

---

### Prompt 15: nota. name sweep — kill nota.

Search the entire codebase for "nota." and "nota." — replace all occurrences with "nota.".

Key locations known:
- `lib/design/tokens.css` line 63: comment `/* nota. — Aura Design Language tokens */` → `/* nota. — Design Language tokens */`
- Any metadata, OG tags, or manifest.json references
- AGENTS.md if it still says nota.

DO NOT rename or change:
- localStorage keys: `scentral_anon_id`, `scentral_persona`, `scentral_wishlist`, `scentral_collection`, `scentral_discover_sort`, `scentral_discover_vibe`, `scentral_brief_tutorialSeen` — these stay as-is. Renaming them breaks existing users' stored data.
- Route paths: `/spritz`, `/you`, `/layering` — keep as-is
- The repo name `scentral-hub` or any Supabase project references

After sweeping, verify `app/layout.tsx` metadata has `title: "nota."` (it already does — just confirm it's clean).

```
git commit -m "chore(brand): full name sweep — nota. → nota., keep all localStorage keys unchanged"
```

---

### Prompt 16: AdSlot fallback content

In whatever component renders Google AdSense ad slots (search for `ins.adsbygoogle` or `AdSlot` or `data-ad-slot`), the slots currently render as blank rectangles while AdSense is pending approval.

Add a fallback that shows until ads load:

```tsx
<div style={{
  minHeight: 100,
  background: 'var(--surface)',
  borderRadius: 'var(--r-card)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--line)',
}}>
  <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
    Supported by our partners
  </p>
</div>
```

Wrap the actual `<ins>` tag conditionally: if `process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID` is defined, render the real ad slot. Otherwise (or while loading), render the fallback div.

```
git commit -m "fix(ads): fallback content for ad slots while AdSense pending — no blank rectangles"
```

---

### Prompt 17: Streak day-1 encouragement

In `app/(main)/spritz/SpritzClient.tsx` (or wherever the streak state is managed):

Find the code that tracks/displays the wear streak count. When `streakCount === 1` (first ever log), show a one-time toast or inline message:

```
🔥 Streak started! Come back tomorrow to keep it alive.
```

Style: gold text, small (12px), fades in for 3 seconds then fades out. Use Framer Motion `AnimatePresence` + opacity transition.

Store a flag `scentral_streak_celebrated` in localStorage so this message only ever shows once.

```
git commit -m "feat(brief): streak day-1 encouragement toast with auto-dismiss"
```

---

### Prompt 18: Context-aware back link in Layering

In `app/(main)/layering/LayeringClient.tsx`, the breadcrumb always says `← Wardrobe` regardless of where the user came from.

Fix:
1. Read `?from=` query parameter (e.g. `?from=discover`, `?from=collection`, `?from=wardrobe`)
2. Map it to a label:
   - `discover` → `← Discover`
   - `collection` → `← Collection`
   - `wardrobe` → `← Wardrobe` (default)
3. Use `window.history.back()` on click if `from` is set, otherwise navigate to `/wardrobe`

This is a read from `useSearchParams()` — import from `next/navigation`. The component is a Client Component so this is safe.

```
git commit -m "fix(layering): context-aware back link reads ?from= query param"
```

---

## FINAL CHECKS

After all prompts run, verify:
1. `npm run build` passes with zero type errors
2. Cormorant Garamond loads and renders as `var(--font-display)`
3. All `var(--accent)` renders as `#B8913A` in both light + dark
4. `var(--r-card)` renders as `12px` everywhere
5. Nav shows: Discover | Wardrobe | Lab | Brief | Identity
6. No "nota." or "nota." visible in the app UI
7. Discover grid shows 2 columns on mobile
8. Cards without images show gradient fallbacks, not blank
9. Scent DNA Search card appears above filters

Run: `grep -r "nota.\|nota." app/ components/ lib/ --include="*.tsx" --include="*.ts" --include="*.css"` — should return zero results.
