# Brand token drift — verified against shipped code (investigation only)

**Date:** 2026-07-24. Written per `docs/todo/homepage-followups-2026-07-24.md` item 5.
**Status:** verification only — neither `NOTA_MANIFESTO.md` nor `DESIGN.md` edited.
Canonical value is Christopher's call.

## Taupe / secondary-ink hex

| Source | Value |
|---|---|
| `NOTA_MANIFESTO.md:57` | `#766E64` |
| `DESIGN.md:6,32` | `#766E64` |
| **Shipped (`app/globals.css:18-19`)** | `--taupe: #B8AC9C` (`--secondary-ink` aliases to it) |

**Finding:** the two docs agree with each other (`#766E64`) — the "756A5C vs 766E64"
disagreement recorded in `CLAUDE.md` §5 is itself stale; that's not what's in
`DESIGN.md` today. The real mismatch is doc (`#766E64`) vs shipped code
(`#B8AC9C`) — neither doc matches what actually renders. `--color-text-muted`
and `--color-text-faint` are derived from `--taupe` via `color-mix()`, so this
value is live in production text colour, not just decorative.

## Body-sans font

| Source | Value |
|---|---|
| `DESIGN.md:13,40` | `Geist` |
| `NOTA_MANIFESTO.md:38,62` | `Geist` |
| **Shipped (`app/layout.tsx:2`)** | `Unbounded` (imported from `next/font/google`; no `Geist` import anywhere in `app/layout.tsx`, `app/globals.css`, or `package.json`) |

**Finding:** `CLAUDE.md` §8 currently states this was "corrected" in DESIGN.md
to `Unbounded` on 2026-07-23 — that correction is not present in the file as it
stands now (`DESIGN.md` still reads `Geist` at both cited lines). Either the
2026-07-23 edit was reverted by a later session, or the CLAUDE.md note describing
it is itself inaccurate. Either way, `CLAUDE.md` §8's claim should not be trusted
without re-checking `DESIGN.md` directly — which is what this memo did.

## Recommendation framing (not a decision)

Shipped code (`Unbounded`, `#B8AC9C`) is the ground truth for what users see
today. If the docs are meant to describe current shipped brand, both `DESIGN.md`
and `NOTA_MANIFESTO.md` need updating to match code, and `CLAUDE.md` §8's "resolved"
claim needs re-verifying at the next doc edit. If the docs describe an intended
*future* rebrand not yet shipped, that should be stated explicitly in both files
rather than left ambiguous — as-is, a reader can't tell which case they're in.

## Taupe hex — RESOLVED 2026-07-26

Code was migrated to `#766E64` (`app/globals.css` verified live). Docs and
code now agree: `DESIGN.md`, `NOTA_MANIFESTO.md`, `NOTA-BRAND-UIUX-PACK.md`,
and `docs/brand/nota-imagery-briefs.md` all read `#766E64`, 10.35:1 on ivory.
`NOTA-BRAND-UIUX-PACK.md` still had the stale `#B8AC9C`/2.03:1 rule until this
date — fixed alongside the rest. Font drift (Geist target vs. shipped
Unbounded) remains open and separate; see `docs/HANDOVER.md`.
