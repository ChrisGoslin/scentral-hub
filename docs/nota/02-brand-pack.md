# nota. — Brand Pack (Deliverable B)

> Phase 2, 2026-07-04. Evidence: `app/globals.css`, `lib/design/tokens.css`, `app/layout.tsx`, live nav render. Labels: **[V]** verified, **[A]** assumption, **[T]** tentative (depends on a pending decision).

## 1. Wordmark direction

Three routes considered:

- **Route A — Minimal humanist:** `nota.` set lowercase in the humanist sans, generous tracking, the dot in accent gold. Quiet, systematic, reads as a tool.
- **Route B — Segmented/diffused:** letterforms with slight optical dissolution (as if scent diffusing). Clever, but fails the 2036 test — it's an effect, and effects date.
- **Route C — Atmospheric:** wordmark set against a gradient aura field. Beautiful in a hero, illegible at 16px favicon and nav scale.

**Recommendation: Route A.** The name itself is already the idea (a note, taken; a note, smelled; the full-stop of recognition). The only permitted flourish is the dot — see the dot system below. Route A is the only route that works identically at favicon, nav, OG card, and app-store icon scale, and it matches the Apple Notes/Aesop DNA. Routes B/C can live inside *artefacts* (Noseprint OG cards) without being the mark.

**Immediate implication [V]:** the live nav renders `nota.` in Unbounded all-caps — the exact opposite energy (loud, display, techno). The wordmark should be lowercase `nota.` in the humanist sans, never uppercase, never in Unbounded.

## 2. The dot system — a state machine for recognition

The dot is nota.'s one animate element. It means *"I see you / I remember / I've noticed something."* Never decoration, never a loading spinner.

| State | Visual | When | Motion verb |
|---|---|---|---|
| **rest** | solid, `--nota-dot` gold, static | wordmark default | — |
| **noticing** | slow breathe (scale 1→1.06, 2.4s ease) | system has something for you (temptation, evolution detected) | breathe |
| **recognising** | single soft pulse then settle | the moment a Read lands, a trace matches, a shelf completes | settle |
| **thinking** | gentle drift (1px orbit) | generation in progress (The Read) — replaces spinners | drift |
| **absent** | no dot | error/empty states — the system honestly "isn't seeing you" | fade |

Rules: one dot on screen at a time; never faster than `--motion-ceremonial`; `prefers-reduced-motion` collapses all states to rest. The dot is how "This understands me" becomes visible without saying it.

## 3. Colour system

**Current [V]:** dual-theme token system, dark forced on (`data-theme="dark"` hardcoded in layout). Dark: bg `#0F172A` slate, gold primary `#B8913A`, brightened gold `#E8C060`, glass surfaces `rgba(255,255,255,0.03–0.07)`. Light: parchment `#F7F3EE` — currently unreachable.
**Desired mapping:**
- Keep dark ambient + gold as the launch identity — it's distinctive against Fragrantica's white-and-blue and Notino's e-commerce white, and it flatters the family-gradient bottle cards.
- Rename semantics to brand roles: `--nota-ink` (text), `--nota-ground` (bg), `--nota-dot` (accent gold), `--nota-whisper` (muted). Alias, don't break, the existing `--color-*` bridge. **[T — pending founder palette lock, flagged 🟡 in PRODUCT_TRUTH §6]**
- The light parchment theme is good work — hold it for a "daylight" mode post-launch rather than deleting.

**Accessibility [V-checked values]:** `#94A3B8` muted-on-`#0F172A` ≈ 5.9:1 — passes AA. `#64748B` faint-on-`#0F172A` ≈ 3.4:1 — **fails AA for body text**; ReadClient uses it for signals copy at 0.875rem. Reserve `--text-faint` for ≥18px or decorative only, or lift to `#7A8BA3`.

## 4. Typography

**Doctrine:** humanist sans ~90% + editorial serif ~10%.
**Current [V]:** Unbounded (geometric display sans — *not humanist*) + Cormorant Garamond italic (editorial serif — on-doctrine; note: older docs say Instrument Serif, code says Cormorant).
**Verdict:** the serif is right; the sans is wrong in spirit. Unbounded is a statement font — techno, wide, loud — used here for *body and nav*, which is why surfaces shout. Recommendation:
- **Swap Unbounded → a humanist sans** (Inter is already the `--font-ui` fallback stack [V]; Söhne/Untitled Sans-class if budget allows) for nav/body/functional.
- Keep Cormorant Garamond italic strictly for the Aura/identity voice (The Read, Noseprint names, empty-state one-liners) — currently well-disciplined [V].
- Unbounded may survive only as tabular numerals in stats, or retire fully.
- Enforce the 90/10 ratio: serif never for UI labels, sans never for identity copy.

## 5. Iconography

**Current [V]:** no icon system — emoji used as icons (`logoEmoji: '🛍️'` in affiliates, `✦` feedback button), plus ad-hoc glyphs (`✓ ∼ ✕` in Read reactions — these are actually good). No icon library imported.
**Missing set (needed by real flows):** shelf/tier glyphs, BB stamp, trace/reply, trail/step, swap arrows, tested/owned/past-purchase status marks, share, evolution.
**Suggested style:** 1.5px stroke, rounded caps, 20px grid, monochrome `currentColor` — quiet line icons in the Aesop register. The BB stamp is the one exception: a letterpress-style roundel (like a passport stamp) because it marks a *story*, not a function. Build as a small local SVG set (`components/icons/`), not an icon-font dependency.

## 6. Voice guardrails (observed violations to fix)

- "Stop blind buying." / "The $18 answer to the $140 question." [V — PressMarquee] → salesy; violates tone. nota. never tells the user to stop anything.
- "nota. finds it." → becomes "nota. already noticed." (observational, not service-y).
- Keep: "Room to be wrong." / "Once placed, it's locked. No undo." / "Does this feel like you?" — this is the house voice; write everything else to match these three.
