# HANDOVER: PR #102 — canon guards, six review rounds, unresolved Sonar gate
Date: 2026-08-30 · Repo: scentral-hub · Session focus: harden `check-contrast-claims.mjs` and `check-hook-source-of-truth.mjs` against an automated reviewer that found a new evasion every round

## 1. Goal

PR #102 began as remediation of the 2026-08-19 canon-duplication audit. That premise
collapsed at the first check: `main` had already landed the same work via #98/#99. The
PR was reset to the one thing with no equivalent on `main` — a guard that recomputes
every published WCAG contrast ratio — and then grew a second guard after review exposed
that the pre-push hook's documented install silently deleted every gate it carried.

## 2. Background and constraints

- Codex (`chatgpt-codex-connector`) reviews each push. Six rounds so far. **Every finding
  it raised was reproduced and valid.** None were rejected.
- Christopher chose "keep addressing every round" over stopping at non-convergence, and
  "extend with an explicit retired-figure marker" over narrowing the contrast guard's
  scope. Both are live standing decisions.
- `sonarcloud.io` is **blocked by this environment's egress proxy** (`curl` → 403 tunnel
  refusal, `WebFetch` → `EGRESS_BLOCKED`). Sonar findings cannot be read from here.
- `core.hooksPath` was unset in the session container, so `.husky/pre-push` never fired
  on push. All hook verification was done by invoking `sh .husky/pre-push` directly.

## 3. Current state

- **Six commits pushed** (`b2c83c2` … `0975e4b`), branch
  `claude/canon-duplication-docs-audit-lzp95f`, PR #102 open, mergeable.
- **Vercel ×3: green. CodeRabbit: skipped** (repo under 10 stars — a skip reported as
  success, not a review).
- **`claude-review`: PASSING as of `2d4d68d`.** It failed on every earlier commit on an
  empty `ANTHROPIC_API_KEY`; it now succeeds. Nothing in this PR fixed it, so the secret
  was presumably set outside this branch. Treat the earlier "blocks every PR" note in
  `docs/SESSION-BACKLOG-2026-08-22-ci-and-e2e-followups.md` item 4 as resolved-unverified —
  the secret's state in repo settings was never inspected directly.
- **`SonarCloud Code Analysis`: FAILING — D Reliability Rating on New Code (required ≥A).**
  First appeared on `b0e68a6`, still failing on `0975e4b`. This one **is** this PR's code.
  See §5 — it is the main unresolved item.
- **The partial Sonar regex work is COMMITTED**, in `2d4d68d` alongside this handover —
  not sitting in the working tree. (This section originally said "UNCOMMITTED" and told
  the next agent to decide whether to commit it, which was already false when written;
  corrected in round 7.) It is behaviour-preserving and verified, but it does **not**
  clear the rule locally. There is nothing to decide about it — only the gate to clear.
- The 2026-08-24 canon diff-review doc was never landed — `main` deleted the duplicate
  design docs via #98 before it could be useful. Not blocking anything.

## 4. Key decisions (and why)

- **Guards derive their expectations, never hardcode them.** `check-hook-source-of-truth`
  compares the hook's check list against the workflow's rather than against an array in
  the script — a fixed list would be a third copy of the truth, the exact defect the
  guard exists to remove. Cost, accepted deliberately: adding a gate means editing both
  files.
- **Retraction passages are exempted by an explicit `<!-- contrast:retired -->` marker**,
  block-scoped, not by inferred negation. Two earlier heuristic exemptions were evaded.
  Verified load-bearing: removing the marker makes the retraction fail.
- **The contrast guard reads the shipped cascade, not declared tokens**, for any claim
  saying shipped/renders/paints — it parses the winning `[data-theme="dark"]` rule out of
  `app/globals.css`. Claims naming the design token still measure against the token.
- **The brand pack's dark column was deliberately NOT rewritten.** Its header names
  `Dark (#1F1D1A)` and its numbers are correct for that ground; against the shipped
  `#1D1B18` they would read 3.42 and 3.25. Only `DESIGN.md` claimed shipped reality.
- **`scripts/hooks/pre-push` was deleted**, not synced. Two files that must agree forever
  is the same defect class as the canon fork this PR descends from.

## 5. Traps and dead ends

**The Sonar gate — unresolved, and the reason matters.**
The failing rule was finally reproduced locally, after two rounds of guessing at it:

```
cd /tmp && mkdir sonarcheck && cd sonarcheck
npm i eslint eslint-plugin-sonarjs
# eslint.config.mjs exporting sonarjs.configs.recommended
npx eslint <copied script>
```

It is `sonarjs/super-linear-regex` (a **bug**-type rule, hence Reliability), not the
unescaped-interpolation issue guessed in `0975e4b`'s message. Then the important part —
bisecting each regex in isolation showed the rule fires on patterns as simple as:

```js
/(\d+\.\d+):1/g        // flagged
/#[ \t]*([^—\n]+)—/gm  // flagged
```

Four rewrites cleared two of five findings. Remaining two survive every reasonable form
tried: horizontal-only whitespace classes, non-overlapping character classes,
atomic-group emulation via `(?=(...))\1`, trimming moved into JS. **Chasing it further
was stopped as non-convergent.**

Unverified and load-bearing: `eslint-plugin-sonarjs`'s `recommended` config may be
stricter than SonarCloud's actual "Sonar way" quality profile for this project. Nobody
has compared them. If they differ, the local reproduction over-reports and the real gate
may need something else entirely — or may already be satisfiable.

**Rejected approaches, with reasons:**
- Carry-forward of a contrast claim's subject from the preceding sentence — misattributed
  `4.82:1` to `taupe` because the `taupe-ink` bullet says "identical chroma and hue to
  `taupe`". Reverted; the two sentences were made self-naming instead.
- Negation-keyword exemptions in the hook guard — a ±4-line window let a live `cp`
  instruction through three lines after an unrelated "removed"; same-line-only then
  flagged the lesson entry documenting the fix. Replaced by line-shape matching.
- Deduplicating the design docs — moot, `main` did it first.

**The recurring pattern, worth knowing before round 7:** rounds 2–4 each produced a
*reshaped* version of an already-fixed finding (cp matcher: bare → options → quoting →
chaining; prose checker: uncovered → ambiguity → named tokens). Rounds 5 and 6 broke that
pattern and found genuinely new defect classes (hook contents unchecked; ground resolved
from declared token rather than cascade).

## 6. Files and pointers

- `scripts/check-contrast-claims.mjs` — the contrast guard. Tables + prose claims, named
  token resolution, retired marker, shipped-ground resolution. **Currently uncommitted
  changes.**
- `scripts/check-hook-source-of-truth.mjs` — hook uniqueness, executable bit, `cp`
  instruction detection, hook↔CI parity.
- `.husky/pre-push` — seven always-on checks; hook-source-of-truth runs FIRST by design.
- `.github/workflows/skill-integrity.yml` — server-side twin, all seven checks. Header
  explains why (UI merges skip hooks).
- `docs/lessons.md` L82 — the hook-install defect and every limit found in review.
- `DESIGN.md` ~L96-110 — the shipped-ground blockquote, corrected twice.
- `NOTA-BRAND-UIUX-PACK.md` §2.2 — dual-ground table, deliberately unchanged.
- PR #102 comments `5468277271` and `5470332373` — round 5 and 6 replies.

## 7. Open work

- **Sonar D Reliability** — unresolved. Two `sonarjs/super-linear-regex` findings survive.
  Depends on either reading the real SonarCloud findings (needs egress, or Christopher
  pasting them) or establishing whether the local `recommended` profile matches the
  project's actual quality profile.
- **The regex work is committed and does not clear the gate.** No decision pending on
  it; it stays until the real findings say otherwise.
- ~~`ANTHROPIC_API_KEY`~~ — `claude-review` went green on `2d4d68d`. No longer open.
- **Three Vercel projects build from this repo** (`scentral-hub`, `scentral`,
  `nota-deploy-0a1b96c`). `CLAUDE.md` §1 records `scentral` as archived read-only after
  the Phase 6 consolidation, so at least one is a leftover. Flagged, never investigated.
- A `send_later` check-in (`trig_01GuWB7vTT2C3Sv85siUDj66`) fires ~18:42Z to re-check the
  gate.

## 8. Verification status

**Run, with output observed:**
- All seven pre-push checks green via `sh .husky/pre-push` (not via a real push —
  `core.hooksPath` was unset).
- Contrast guard: eight planted wrong values across all rounds, each blocked; both
  negatives correct (retired marker load-bearing, unrelated file ignored).
- Hook guard: seven check-removals each blocked *and named*; workflow-side removal
  blocked; nine `cp` spellings incl. chained/quoted/`./`-prefixed; non-executable hook;
  rival copy on disk; `docs/notes-pre-push` correctly ignored.
- `git restore --source=HEAD -- .husky/pre-push` restores an identical executable file —
  actually deleted the hook and ran it.
- Every WCAG figure quoted in this session recomputed from hex, not copied.
- `sonarjs/super-linear-regex` reproduced locally and bisected.

**Asserted, NOT verified:**
- That the local `eslint-plugin-sonarjs` recommended profile matches SonarCloud's
  quality profile for this project.
- That the remaining two findings are what SonarCloud is actually failing on.
- `claude-review`'s root cause is read from job logs showing an empty `ANTHROPIC_API_KEY`
  and from the failure pattern across #98/#99/#101 — the secret's state in repo settings
  was never inspected directly.

---
## Prompt for the fresh agent

You are picking up PR #102 in `scentral-hub`, branch
`claude/canon-duplication-docs-audit-lzp95f`. It adds two repo guards: one that
recomputes every published WCAG contrast ratio in `DESIGN.md` and
`NOTA-BRAND-UIUX-PACK.md`, and one that keeps `.husky/pre-push` the single source of
truth for the pre-push hook and in parity with the CI workflow.

An automated reviewer has produced six rounds of findings; all were valid and all were
fixed. The branch is green except `SonarCloud` (D Reliability Rating, which *is* this branch's
code and is not resolved). `claude-review` was failing on an empty repo secret and is now
passing. The failing Sonar rule has been reproduced
locally as `sonarjs/super-linear-regex` but the last two findings resist every rewrite
attempted, and it is unconfirmed whether the local rule profile matches the project's
real one. The regex changes from that attempt are committed, verified behaviour-preserving, and do
not clear the gate.

Before responding, read every file listed under "Files and pointers" above. Do not
summarize, paraphrase, or claim you already have context — actually read each file.
Treat every claim in this handover as context to verify against the code, not fact
to trust. Then wait for instructions before taking any action.
