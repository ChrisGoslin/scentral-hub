# Scentral Landing — Design Spec (Concise)

Purpose: provide a compact, developer-friendly design spec to hand off to designers and to guide implementation.

## Palette

- Background deep: #06070a (hero start)
- Surface deep: #071022
- Accent warm amber: #F5B76A (used for primary CTA and accents)
- Accent rose: #E8B7C8 (secondary subtle)
- Accent sage: #9FBFA8 (optional)
- Text muted: #94A3B8

## Typography

- Display (hero): 48–56px desktop, 32–40px mobile. Font: a high-contrast serif or elegant geometric sans (Playfair / Inter Display). Use increased letter-spacing -0.01em.
- Body: 16–18px, line-height 1.5 (system sans or Inter/Roboto).

## Layout

- Two-column hero: left content, right decorative art.
- Generous vertical padding: 96–140px on desktop. Center content vertically.

## Micro-interactions

- Card hover: translateY(-4px), scale 1.02, shadow increase (transition 160ms).
- CTA hover: -translateY(2px) + slight brightness increase.
- Toast: slide in from bottom + fade, auto-dismiss after 3s.
- Focus: 4px ring using accent color and 8px visual offset.

## Accessibility

- Respect prefers-reduced-motion.
- Minimum color contrast for text and CTAs >= 4.5:1.
- All animations interruptible; provide visible focus states.

## Assets

- `public/images/landing-art.svg` — decorative layered circles. Use as-is or replace with Figma export.

## Handoff notes for designers

- Export hero art at 2x for retina.
- Provide small icon set (line icons) in SVG.
- Supply heading font weight 600–700 and body 400.

## Acceptance criteria

- Landing page matches hero mock, CTAs interactive, demo save triggers toast, animations respect reduced-motion.
