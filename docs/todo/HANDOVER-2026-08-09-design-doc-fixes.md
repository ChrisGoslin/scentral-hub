# Handover — 2026-08-09 design doc fixes, for Claude Code

> **ARCHIVED 2026-08-10 — audit history only; no execution authority.** The findings
> below preserve prior reasoning, but they do not authorize commits, deletions,
> design-doctrine changes, or work outside `scentral-hub`. Re-verify any surviving
> proposal against live state and obtain fresh approval where required.

**From:** Cowork session (read/write-only mount, cannot commit or run git status/diff
against the worktree). All research below is verified, none of it has touched this repo
except this file and the audit helper. Historical "pending" language below is not a
current task queue.

**Source artifacts** (full detail, in the Cowork session's output folder, not this repo):
00-FINDINGS-scentoi-rejected, 01-contrast-table-1d1b18, 02-fork-resolution,
03-design-md-pointer-refactor, 04-lessons-consolidation-checklist,
05-taupe-ink-terracotta-resolution. This is the condensed historical sequence; do not
apply it as a runbook.

---

## Historical step 1 — review root corrections and the stale docs/ fork

**Why first:** root `DESIGN.md` and `NOTA-BRAND-UIUX-PACK.md` have real corrections
(IBM Plex Sans, XP-not-retired, Shelf/Cabinet reconciliation) sitting uncommitted in the
working tree — confirmed by mtime (2026-08-09, newer than their own commit history) vs
git log (last commit `bc2d60f`, 2026-07-27). If these are lost before committing, "root is
canonical" stops being true. `docs/DESIGN.md` and `docs/NOTA-BRAND-UIUX-PACK.md` are a
separately-diverged fork — confirmed via independent commit lineage (root:
`79c610e`/`84fcb41`; docs/: `54ef6ea`/`bc5c614`) — and are stale on every axis checked
(font, XP status, Shelf/Cabinet glossary, taupe-ink ratio internally contradicts itself:
12.2:1 in docs/ vs 4.82:1 in root, same hex, same background).

`docs/todo/commit-2026-08-09-design-doc-corrections.sh` is retained as a read-only audit
helper. It prints the current diff and exits; it does not stage, commit, or delete files.
Any decision about the root design edits or older `docs/` copies is separate work and
must start from fresh repository evidence.

**Separate bug, not blocking:** `DESIGN.md` says LCP target 2.5s, `NOTA-BRAND-UIUX-PACK.md`
(root) says 3.0s. Pick one, align the other, in a follow-up commit.

## Step 2 — add the taupe-ink CSS variable, leave terracotta as-is

**Why now:** the pointer refactor in step 3 references this. Doing it out of order means
writing a "NOT YET DEFINED IN CSS" placeholder and re-editing it immediately after.

Verified before proposing: grepped `app/`, `components/`, `lib/` for `taupe-ink` and
`terracotta` — zero matches, neither token renders anywhere today. This is a doctrine-only
fix, no shipping risk.

Add to `app/globals.css`, in both the `:root` block and the `[data-theme="dark"]` block
(single value — no light theme ships; `app/layout.tsx:86` hardcodes `data-theme="dark"`):

```css
--taupe-ink: #948A7D;
```

`#948A7D` computed at 5.07:1 against the real shipped background `#1d1b18` (WCAG AA
requires 4.5:1 for normal text) — chosen over closer/borderline candidates (`#8A8175` at
4.48:1, right on the edge) for real margin. Same hue family as the existing `--taupe`, not
a new color family — consistent with DESIGN.md's own restraint/anti-slop doctrine.

Terracotta (`#B4674E`) needs no change — already passes AA-large (4.08:1) against the
corrected background, and DESIGN.md's existing "≥24px/non-text only" restriction already
covers its AA-normal failure. Keep it as a literal, not a variable — narrow enough use
that promoting it to a CSS variable adds indirection with no current benefit.

## Step 3 — paste the corrected contrast table into DESIGN.md

**Why:** the existing table (DESIGN.md lines ~58–80) was measured against ivory
`#F7F4EE`, which is never the effective rendered background — `app/layout.tsx:86`
hardcodes dark theme, which overrides `--color-bg` to `#1d1b18`. Recomputed against the
real background, several tokens that were documented as safe for body text actually fail
AA at normal size.

Replace with:

```markdown
### Measured contrast on dark `#1d1b18`

The product ships `data-theme="dark"` hardcoded on `<html>` (`app/layout.tsx:86`), which
overrides `--color-bg` to `#1d1b18` (`app/globals.css` `[data-theme="dark"]` block). The
`:root` value `#1f1d1a` is never the effective background in shipped UI. All ratios below
are measured against `#1d1b18`. Last verified 2026-08-09.

| Token | Hex | Ratio | AA normal | AA large | Permitted use |
|---|---|---|---|---|---|
| Ivory / `--color-text` | `#F7F4EE` | 15.65:1 | pass | pass | primary body/UI text |
| Text-muted | `#989188` resolved | 5.52:1 | pass | pass | secondary text |
| Stone | `#E5E0D6` | 13.06:1 | pass | pass | any text (rarely used as text) |
| Amber-glow / `--color-gold` (live token) | `#B98A58` | 5.60:1 | pass | pass | any text, incl. small |
| Taupe-ink `#948A7D` (corrected 2026-08-09) | `#948A7D` | 5.07:1 | pass | pass | body text — specimen keys, timestamps, memory metadata |
| Terracotta | `#B4674E` | 4.08:1 | fail | pass | ≥24px / non-text only |
| Text-faint | `#686158` resolved | 2.81:1 | fail | fail | decorative/disabled only, never load-bearing |
| Amber (doc frontmatter) `#A0622A` | `#A0622A` | 3.50:1 | fail | pass | ≥24px / non-text only — orphaned token, see §note below |
| Taupe `#766E64` | `#766E64` | 3.42:1 | fail | pass | ≥24px / non-text only — **was "any text, any size"** |
| Olive / `--color-primary` `#6B7250` | `#6B7250` | 3.39:1 | fail | pass | ≥24px / non-text, buttons/large labels only |
| Moss `#4A5940` | `#4A5940` | 2.29:1 | fail | fail | non-text; fails even 3:1 icon/border threshold |
| Charcoal `#2B2926` | `#2B2926` | 1.18:1 | fail | fail | do not use as text on dark bg — near-invisible |
```

**Action items surfaced by this table, separate from the paste:**

- Charcoal at 1.18:1 is a live-bug candidate, not just a doc fix — grep for any hardcoded
  `color: var(--charcoal)` used as text outside a theme-conditional block.
- `--taupe` itself (not just taupe-ink) drops below AA-normal on dark; if any component
  currently renders `--taupe` as small body text, it needs the same fix pattern as
  taupe-ink, or should route through `--color-text-muted` instead (5.52:1, already passes).
- `#A0622A` (cited in DESIGN.md's frontmatter as "primary/amber") does not match any live
  CSS variable — the actual shipped amber token is `--amber-glow: #B98A58`. This is a
  separate drift item, addressed in step 4.

## Step 4 — DESIGN.md pointer refactor (restated tokens → CSS references)

**Why:** ~38 literal token values are restated in DESIGN.md that also live in
`app/globals.css` — this is the entire drift surface flagged in the original handover.
Every restated value silently goes stale unless both places are remembered.

Convert the frontmatter color/typography/spacing/motion block and the §2 contrast table's
hex column to reference CSS variables instead of restating hex. Doctrine/reasoning
sections (§1, §5–§10, §12–§13) are NOT in scope — they don't restate values, leave as-is.

Example, frontmatter before:
```yaml
colors:
  surface: "#F7F4EE"
  taupe-ink: "#756A5C"
  primary: "#A0622A"
typography:
  body-sans: "IBM Plex Sans"
motion:
  responsive: "200ms cubic-bezier(0.16, 1, 0.3, 1)"
```

After:
```yaml
# Token VALUES live in app/globals.css :root and are not restated here.
colors:
  surface: var(--ivory)              # see app/globals.css:4
  taupe-ink: var(--taupe-ink)        # #948A7D, added 2026-08-09 — see step 2 above
  primary: var(--amber-glow)         # see app/globals.css:11
                                      # NOTE: doctrine historically named this #A0622A;
                                      # that value is dead/legacy (only survives as a
                                      # hardcoded fallback in app/onboarding/page.tsx and
                                      # one !important in globals.css:247). Shipped token
                                      # is --amber-glow #B98A58. Resolve which is correct
                                      # before citing either as canon.
typography:
  body-sans: var(--font-body)        # see app/globals.css:35
motion:
  responsive: var(--motion-responsive)  # NOTE: doc currently cites easing
                                         # cubic-bezier(0.16, 1, 0.3, 1); shipped value is
                                         # cubic-bezier(0.2, 0.6, 0.2, 1). Curve drifted,
                                         # duration (200ms) did not. Fix the curve citation.
```

**Other drift found during this audit, fix alongside the refactor:**

- No `--sp-*` spacing scale exists in CSS despite `CLAUDE.md` §8 claiming one — components
  use ad hoc pixel values. Flag to whoever owns `CLAUDE.md` §8; that claim is stale.
- Consider a pre-push guard rejecting new hex/px literals introduced outside this
  reference block, so the drift surface can't silently regrow (this was item #4 on the
  original 2026-08-09 handover, still open).

## Step 5 — LESSONS.md consolidation (Christopher's call, not blocking steps 1-4)

Full checklist is in the Cowork session's `04-lessons-consolidation-checklist.md` — five
independently-approvable/vetoable items, total savings only ~1,225–1,265 bytes (short of
the 1,500–2,000 target; the file is already lean, no true duplicates found). Ask
Christopher for verdicts, then apply the approved subset as a single small diff.

---

## Rejected, no action needed

A document describing itself as "ScentOI Master Architectural Ledger V2" was surfaced
during this session (not found as a file anywhere in this repo). It contradicts shipped
canon on nearly every design law it states (24px radius vs. shipped 0px/sharp-edge
doctrine, "Liquid Glass" framed as novel when it's already listed as an anti-pattern,
`#121212`/`#F9F9F9` contrast limits vs. shipped `#1d1b18`/`#f7f4ee`, XP framed as core
gamification vs. canon's badge/streak rejection) and cites unverifiable authorities
("Orizon 2026," "Eleken 2026," a "Mochi Game Economy framework"). Rejected in full as a
design-law source. Two genuinely reusable ideas were salvaged conceptually (a
Curious/Collector/Alchemist vocabulary-tier system, and a set of ethical dark-pattern
constraints) — if these get built, they should become their own `docs/nota/` product spec
and policy doc respectively, written fresh against this repo, not copied from the rejected
source. See the Cowork session's `00-FINDINGS-scentoi-rejected-2026-08-09.md` for full
citation-by-citation verification.
