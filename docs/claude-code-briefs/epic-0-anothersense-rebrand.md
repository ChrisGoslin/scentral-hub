# Claude Code Session: Epic 0 — AnotherSense Rebrand
### Est. time: 30 minutes | Week 1, Day 1

---

## Context (read before writing a single line)

```
Product: AnotherSense (codebase: scentral-hub, DB: scentral-mvp — names unchanged internally)
Stack: Next.js 16.2.9 App Router, React 19.2.4, Supabase JS 2.x, Tailwind CSS, Vercel
Design system: CSS variables only — app/globals.css + lib/design/tokens.css. No hardcoded hex. Ever.
No secrets in code. npm run build must pass at session end.
The cabinetSnapshot CustomEvent in WardrobeShelf.tsx must NEVER be removed.
Full spec: docs/specs/AnotherSense_Final_UX_Overhaul.md
Sprint plan: docs/AnotherSense_Execution_Brief.md
```

---

## Ground yourself first

Before writing any code, run:
```bash
git log --oneline -5
grep -r "Scentral" app/layout.tsx app/page.tsx public/manifest.json 2>/dev/null | head -20
cat app/globals.css | grep -E "^\s*--" | head -30
```

State what you found in your first reply.

---

## Task: Epic 0 — AnotherSense Display Rebrand

This is a display-layer-only rebrand. Every internal name stays the same (repo, DB, tables, env vars, localStorage keys, component names). Only what users SEE changes.

### 1. CSS design tokens — add to `app/globals.css` (or `lib/design/tokens.css` if it exists)

Add these to the `:root` block. Do NOT overwrite existing tokens — append:

```css
/* AnotherSense — Aura Design Language tokens */
--aura: oklch(0.72 0.08 60);
--aura-surface: oklch(0.18 0.04 60 / 0.6);
--aura-border: oklch(0.45 0.06 60 / 0.3);
--xp-color: oklch(0.78 0.14 85);

/* Motion system */
--motion-instant:    80ms  cubic-bezier(0.4, 0.0, 0.2, 1);
--motion-responsive: 200ms cubic-bezier(0.2, 0.6, 0.2, 1);
--motion-ceremonial: 480ms cubic-bezier(0.16, 1, 0.3, 1);
--motion-organic:    800ms cubic-bezier(0.34, 1.56, 0.64, 1);

/* Shadow system */
--shadow-object:
  0 1px 2px oklch(0 0 0 / 0.04),
  0 2px 4px oklch(0 0 0 / 0.04),
  0 4px 8px oklch(0 0 0 / 0.06),
  0 8px 16px oklch(0 0 0 / 0.06),
  0 16px 32px oklch(0 0 0 / 0.04),
  0 32px 64px oklch(0 0 0 / 0.03),
  inset 0 1px 0 oklch(1 0 0 / 0.08),
  inset 0 -1px 0 oklch(0 0 0 / 0.06);

--shadow-elevated:
  var(--shadow-object),
  0 0 0 1px var(--aura-border);
```

Also add this utility class:

```css
.surface-glass {
  background: oklch(from var(--surface, oklch(0.15 0.02 60)) calc(l * 1.02) calc(c * 0.8) calc(h + 5deg) / 0.82);
  backdrop-filter: blur(20px) saturate(1.6) brightness(1.05);
  -webkit-backdrop-filter: blur(20px) saturate(1.6) brightness(1.05);
  border: 1px solid var(--aura-border);
}
```

### 2. App metadata — `app/layout.tsx`

Update the `<title>` and `metadata` export. Change:
- Title: `AnotherSense`
- Description: `Your daily scent ritual. Remember how you smell.`
- Keep all existing font variables unchanged (Instrument_Serif + Unbounded are already there)

### 3. Landing page — `app/page.tsx` (or `app/(main)/page.tsx` — verify which exists)

Find all instances of "Scentral" in user-facing copy (headings, subheadings, CTAs, `<title>`) and replace with "AnotherSense". Do NOT change:
- Import paths
- Component names
- Variable names
- Class names
- Any `scentral_` localStorage key references

### 4. Web manifest — `public/manifest.json` (if it exists)

Update:
- `"name"`: `"AnotherSense"`
- `"short_name"`: `"AnotherSense"`
- `"description"`: `"Your daily scent ritual"`

### 5. Any other user-visible "Scentral" strings

Run: `grep -r "Scentral" app/ components/ public/ --include="*.tsx" --include="*.ts" --include="*.json" --include="*.html" -l`

For each file found: replace user-facing copy occurrences with "AnotherSense". Skip any occurrence that is:
- A variable name, function name, or import path
- Inside a `localStorage.getItem('scentral_...')` call
- A CSS class name
- A comment

---

## Definition of done

- [ ] `npm run build` passes with 0 errors
- [ ] `grep -r '"Scentral"' app/ public/` returns 0 results for user-visible strings
- [ ] `--aura`, `--motion-instant`, `--shadow-object` exist in CSS output
- [ ] `cabinetSnapshot` CustomEvent still present in `WardrobeShelf.tsx` (verify: `grep cabinetSnapshot app/\(main\)/collection/WardrobeShelf.tsx`)
- [ ] No hardcoded hex values added
- [ ] No secrets in any file

## Commit message
```
feat: epic-0 anothersense rebrand + aura design tokens
```

## Deploy
```bash
npx vercel --prod
```

---

## What comes next (do NOT build this tonight)

Epic 1 (next session): motion/material CSS token wiring, `.surface-glass` used on first component, `--shadow-object` applied to cards.
