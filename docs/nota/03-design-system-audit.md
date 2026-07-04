# nota. — Design System Audit (Deliverable C)

> Phase 2, 2026-07-04. Evidence: `components/ui/` inventory, `app/globals.css` (1226 lines), `lib/design/tokens.css`, grep audits. Labels: **[V]** verified.

## 1. Component inventory [V]

**`components/ui/` (19):** Button, Card, Chip, CompareBar, DidYouKnow, Disclosure, EmptyState, ErrorInline, FirstDiscoveryToast, Footer, GradientPlaceholder, LayeringRules, LoadingShimmer, NoseReportSheet, PersonaTipTicker, PressMarquee, ProGate, SensoryAnatomy, Sheet.
**Feature kits:** `components/aura/` (advisory), `components/temptations/` (provider + card), `components/traces/` (composer + card), `components/auth/AuthSheet`, `components/collection/OptimizedBottleCard`, landing kit.
**Gaps for in-scope features:** TierRow / TierHeader (S/A/B/C), BBStamp, ShareCard (OG-artefact trigger), StatusMark (tested/owned/past-purchase), FilterSheet (modern low-friction filters), WishlistShelf, SwapOffer. None exist yet.

## 2. The systemic problem: inline styles everywhere [V]

Nearly every surface is built with React inline `style={{}}` objects, and ~130 hardcoded hex values live in `app/**.tsx` outside the token files. Consequences:
- ReadClient hardcodes its full palette (`#0F172A`, `#F1F5F9`, `#64748B`, `#B8913A`) — the app's most important screen is *disconnected from the theme system*.
- No hover/focus states via CSS (inline `onMouseEnter` hacks in ReadClient) — keyboard focus styling is inconsistent.
- A future designer cannot restyle anything centrally.

**Fix strategy (pragmatic, not a rewrite):** keep inline layout styles, but *ban raw colour/typography/motion literals* — every colour, font, duration must reference a token. One ESLint rule (`no-restricted-syntax` on hex-in-tsx) + incremental sweep, highest-traffic surfaces first (Read, Shelf, landing).

## 3. Motion audit

**Tokens [V]:** `--motion-instant` 80ms / `--motion-responsive` 200ms / `--motion-ceremonial` 480ms / `--motion-organic` 800ms (+ legacy `--motion-fast` 150ms / `--motion-base` 220ms — retire these two).
**Keyframes [V]:** fade-up, chip-pulse, card-scale, button-press, text-flash (globals.css) + ad-hoc `fadeUp` uses in clients + `bn-marquee` (inline in PressMarquee).
**`prefers-reduced-motion` [V]:** two blocks in globals.css exist — but inline-styled animations in clients (ReadClient's `animation: 'fadeUp 600ms ease both'`, marquee) bypass them. Reveal sequences must respect reduced-motion (show final state immediately).
**Verb mapping (brief verbs → tokens):**
| Verb | Use | Token |
|---|---|---|
| reveal | Read/Blind reveal sequences | ceremonial, staggered ≤5 items |
| settle | drag-drop landing, dot after pulse | organic (spring curve) |
| drift | dot thinking, card hover lift | responsive |
| fade | exits, dismissals | instant→responsive |
| morph | tier transitions, count-ups | ceremonial |
| breathe | dot noticing, empty-state idle | 2.4s bespoke (add `--motion-breathe`) |

**Timing rule already discovered by the codebase [V]:** ShelfClient hand-rolled a 300ms drag transition because no token exists between 200 and 480 — add `--motion-drag: 300ms` with the organic curve rather than letting each surface improvise.

## 4. Proposed lean token set (the whole system a small team needs)

```css
:root {
  /* colour — brand roles (alias onto existing --color-* bridge) */
  --nota-ground:  var(--color-bg);
  --nota-surface: var(--color-surface);
  --nota-ink:     var(--color-text);
  --nota-whisper: var(--color-text-muted);
  --nota-dot:     var(--color-gold);      /* the accent. singular. */
  --nota-line:    var(--color-border);
  --nota-risk:    var(--color-error);     /* C-tier 'at risk', destructive */

  /* type — two families, four roles */
  --font-ui:      /* humanist sans (see Brand Pack §4) */;
  --font-voice:   var(--font-cormorant);  /* serif italic — identity copy only */
  --type-whisper: 0.8125rem;
  --type-body:    0.9375rem;
  --type-title:   clamp(1.125rem, 1rem + .5vw, 1.375rem);
  --type-moment:  clamp(2rem, 5vw, 3.25rem);   /* Read openings, Noseprint names */

  /* space & shape */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 16px; --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;
  --r-card: 12px; --r-pill: 999px; --r-tile: 8px;

  /* motion — six verbs */
  --motion-instant: 80ms cubic-bezier(.4,0,.2,1);
  --motion-responsive: 200ms cubic-bezier(.2,.6,.2,1);
  --motion-drag: 300ms cubic-bezier(.34,1.56,.64,1);
  --motion-ceremonial: 480ms cubic-bezier(.16,1,.3,1);
  --motion-organic: 800ms cubic-bezier(.34,1.56,.64,1);
  --motion-breathe: 2400ms ease-in-out;
}
```

Everything else already in globals.css (family gradients, shadows, glass) stays — it's good. This layer goes *on top*, and new components use only `--nota-*` / `--type-*` / `--motion-*` names.

## 5. Structured findings

```json
[
  {"id":"DS-001","area":"Tokens","severity":"high","finding":"~130 hardcoded hex values in app/**.tsx; ReadClient (flagship screen) fully detached from theme tokens","recommendation":"Token-only colour rule + lint guard; sweep Read, Shelf, landing first","effort":"medium","priority":"pre-launch"},
  {"id":"DS-002","area":"Typography","severity":"high","finding":"Unbounded (geometric display) used as the functional sans — off-doctrine (humanist 90%)","recommendation":"Swap functional sans to humanist (Inter already in fallback stack); keep Cormorant italic for voice","effort":"medium","priority":"pre-launch"},
  {"id":"DS-003","area":"Motion","severity":"medium","finding":"Inline-styled animations bypass prefers-reduced-motion blocks; drag timing hand-rolled (no 300ms token)","recommendation":"Add --motion-drag + --motion-breathe; route reveal sequences through classes covered by the reduced-motion media block","effort":"small","priority":"pre-launch"},
  {"id":"DS-004","area":"Icons","severity":"medium","finding":"No icon system; emoji-as-icons in production surfaces","recommendation":"Local 20px line-icon SVG set (components/icons/), letterpress BB stamp as the one expressive mark","effort":"medium","priority":"pre-launch"},
  {"id":"DS-005","area":"Components","severity":"medium","finding":"No TierRow/BBStamp/ShareCard/StatusMark/FilterSheet components for in-scope features","recommendation":"Build alongside Shelf v2 work, not speculatively","effort":"large","priority":"pre-launch"},
  {"id":"DS-006","area":"A11y","severity":"medium","finding":"--text-faint (#64748B) on dark bg ≈3.4:1, used for body-size text in ReadClient signals","recommendation":"Reserve faint for ≥18px/decorative or lift value; audit focus-visible on inline-styled buttons","effort":"small","priority":"pre-launch"},
  {"id":"DS-007","area":"Theme","severity":"low","finding":"Light parchment theme fully built but unreachable (data-theme='dark' hardcoded)","recommendation":"Keep dark as launch identity; ship 'daylight' post-launch via ThemeToggle (component exists)","effort":"small","priority":"post-launch"},
  {"id":"DS-008","area":"Motion","severity":"low","finding":"Legacy --motion-fast/--motion-base duplicate the scale","recommendation":"Deprecate; migrate usages to the six-verb set","effort":"small","priority":"post-launch"}
]
```
