# Homepage/hero follow-ups — agent handoff (2026-07-24)

Findings surfaced during the brand-doc reconciliation + hero-video work (committed on
branch `brand/homepage-canon-reconcile`, commit `46c8dde`). These were deliberately
left out of that scope. Hand the prompt below to a separate agent.

---

## Prompt

You are working in the nota. repo at `~/Projects/scentral-hub` (Next.js 16 App Router,
Supabase, Playwright e2e). Read `AGENTS.md` first and follow its guardrails: verify
before asserting, show any SQL before running it, stage explicit paths only (never
`git add .`), no push without approval, and "verified" means it built/ran — not that
you eyeballed it.

**SCOPE** — do ONLY the items below. Do NOT touch the brand-doc or hero-video work
already committed on branch `brand/homepage-canon-reconcile` (commit `46c8dde`). Do NOT
re-open the surface-glossary docs. Work from `main` or a fresh branch off it. If a task
turns out to need a product decision, STOP and report rather than guessing.

### CODE FIXES (do these)

1. **/lab fetches the entire fragrance catalogue (~127,595 rows) with no pagination.**
   File: `app/(main)/lab/page.tsx`, lines ~21–24 — the `.from('fragrances').select(...)
   .order('brand')` has NO `.range()` or `.limit()`. Contrast with
   `app/(main)/study/page.tsx` line ~24 which correctly caps at `.range(0, 99)`.
   Fix: bound the /lab query the way /study does (paged/limited), preserving the
   `LayeringClient` contract. Confirm the client still works with a paged set (it may
   assume the full list — check `LayeringClient` before changing). Report the row cap
   you chose and why. This is the query behind the e2e "127k-row fetch can exceed
   timeout" comment in `e2e/discover.spec.ts`.

2. **MOOT (2026-08-22):** `HeroSection.tsx` was deleted this date — dead code since
   `5125fe3` (2026-08-18) replaced the homepage hero with a video-free static parallax
   version. This item no longer has a live target; do not action it against the current
   hero without re-verifying it applies. See PR #98.

2. ~~**Mobile hero `<video>` loads the DESKTOP poster, not the portrait mobile poster.**~~
   File: `components/landing/HeroSection.tsx`. The `<video>` `poster` attr (line ~258)
   is hard-set to `/media/atelier-matter-poster.jpg` (1280×676). The portrait
   `/media/atelier-matter-mobile-poster.jpg` (720×1280) is only referenced in the
   static `<picture>` fallback branch (lines ~243–248), so real mobile video visitors
   download the wider desktop still. Fix so mobile video uses the mobile poster
   (e.g. a media-conditioned poster approach). Verify the mobile poster file exists at
   that path. Keep desktop behaviour unchanged.

3. **Guest post-login destination is wrong.** A signed-out request to `/read`
   307-redirects to `/login?next=/welcome` (verified via curl). After login the user
   lands on `/welcome`, not the `/read` they intended. Find the redirect source (Proxy
   Middleware or the `/read` route) and make `next` return the user to `/read` (or
   confirm `/welcome` is deliberate and document why). Verify with a real signed-out
   curl/browser check, not a code read.

### DECISIONS (do NOT fix — investigate and report options only)

4. **Cabinet vs Shelf are two live surfaces backed by two different tables**
   (`/cabinet` → `collections`; `/shelf` → `shelf_items`), both claiming "what the user
   owns/wears." Already flagged in `DESIGN.md` §12 and `NOTA-BRAND-UIUX-PACK.md` §10,
   and in `CLAUDE.md` §5–6 as "two competing shelf models." Do NOT merge them. Produce
   a short options memo (merge vs. keep-distinct-with-clear-positioning) with the code/
   data blast radius of each. Decision is Christopher's.

5. **`NOTA_MANIFESTO.md` and `DESIGN.md` disagree on brand tokens** — e.g.
   taupe/secondary-ink `#766E64` (Manifesto) vs taupe-ink `#756A5C` (DESIGN.md), and
   body font Geist (implied Manifesto/DESIGN) vs Unbounded (`CLAUDE.md` §8 says that's
   what actually ships). Flagged in `docs/HANDOVER.md`. Verify the ACTUAL shipped values
   against `app/layout.tsx` and `app/globals.css`, then report which doc is correct — do
   not edit either doc until Christopher picks the canonical value.

### HOUSEKEEPING

6. **`scripts/debug-env.mjs`** is untracked in the working tree and orphaned (not part
   of any committed work). Read it, confirm it holds no secrets, and either propose
   committing it with a purpose or deleting it. Do not delete without confirmation.

### VERIFICATION REQUIRED before you report done

- `npm run build` passes.
- For each code fix, a concrete before/after check (curl status, query row count,
  rendered poster URL) — labelled "verified", with the command shown.
- Separate commits per concern, explicit pathspecs, no push. Report `git status` and
  `git log --oneline` at the end.

---

## Also outstanding from the original plan (not in the prompt above)

- **Step H e2e verification.** Four specs were remapped to the confirmed route map
  (`/collection`→`/cabinet`, `/layering`→`/lab`, `/discover`→`/study`) on branch
  `brand/homepage-canon-reconcile` but are **uncommitted** and **not yet run** through
  Playwright — reviewed, not verified. Changed files: `e2e/collection.spec.ts`,
  `e2e/collection-drag-drop.spec.ts`, `e2e/layering-lab.spec.ts`,
  `e2e/fragrance-detail.spec.ts`. Needs a Playwright run for before/after pass counts,
  then a separate commit.
