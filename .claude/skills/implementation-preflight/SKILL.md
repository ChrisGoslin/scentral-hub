---
name: implementation-preflight
description: >-
  Run BEFORE writing or changing any UI/feature code in an existing product.
  A six-gate checklist that prevents the recurring failures of building before
  reading the repo, shipping happy-path-only screens, claiming "verified"
  without a build, adding sources of truth, asserting things need measuring
  without a measurement plan, and gold-plating low-value surfaces. Trigger when
  asked to "implement", "build", "convert", "add a component/screen/feature",
  "wire this up", or when about to author front-end code against an existing
  codebase. Also trigger on "is this ready to build", "before I start coding",
  or any hand-off from design to implementation. Complements
  grounded-agent-guardrails (invention) and verify-cli-claims (post-hoc proof);
  this runs at the START.
---

# Implementation Preflight

Six gates. Answer each in writing before authoring code. If a gate can't be
passed, that is the finding — surface it and stop, don't proceed on assumption.
The gates exist because each maps to a real, expensive mistake already made.

Output a short **Preflight** block (the six answers) before any implementation.
Keep it proportional — a few lines per gate, not an essay.

## Gate 1 — Read before build

- Have I read the existing implementation of this surface in the repo?
- Does something like it already exist that I should extend, not duplicate?
- Any "I don't have access to X" claim must be preceded by a fresh
  `ls`/read attempt in the SAME turn — access changes; a limitation observed
  once is not a fact forever (L11).
- Before asking the user anything: (a) can a tool call I have right now
  answer it? Then make the call. (b) Is it genuinely their judgment (taste,
  priority), or a decision I'm avoiding? Only ask for (b) (L9).

Failure this prevents: building a duplicate suite; pushing work back onto the
user that one command would have resolved.

## Gate 2 — Full state matrix, not the happy path

List every state the surface must handle before building any of them:

- loading · empty · error · success
- **the product-specific trust/recovery state** — the moment the product is
  wrong and must own it gracefully (for nota.: the "you misread me" reaction
  and regenerate loop)
- accessibility states: keyboard, focus, screen-reader announcement of async
  changes (`aria-live`), reduced motion

A screen delivered with only the success state is incomplete, not a draft.
Build the trust/recovery state FIRST — it carries the emotion.

## Gate 3 — Reserve the word "verified"

- "Verified" = passed a build, a type-check, and the existing test suite.
- Structural checks (tag balance, grep, file counts) are "reviewed", never
  "verified". State which one every claim is.
- If you cannot run the build in this environment, say so, and mark the work
  "reviewed, unbuilt" — do not imply otherwise.

## Gate 4 — Sources of truth go down, not up

- Am I adding a config/token/canonical file? Does it REPLACE or merely
  out-rank an existing one?
- Name the single canonical source for this concern. If my change increases
  the count of competing sources, justify it explicitly or consolidate instead.
- Winning by load order / specificity is debt, not a fix.
- Is this written where the consuming tool auto-loads it, unprompted? If not,
  that's the finding (L10). If a staging copy was used to get it there,
  delete the staging copy in the same change (L13).
- Does every file/skill/path my change references actually exist? A doc that
  points at a missing file is a broken build (L12).

## Gate 5 — Every "needs measuring" ships with its events

- Did I claim any decision "should be tested / measured / validated"?
- Then attach the measurement plan in the same breath: which analytics events,
  which properties, what threshold would decide it.
- No measurement assertion without a measurement plan.

## Gate 6 — Opportunity cost

- Where does this work sit in the product's value hierarchy?
- Is this the highest-value thing to build right now, or am I polishing a
  low-traffic / non-core surface?
- State the answer plainly. Craft on the wrong surface is still waste.

## Self-review before delivery (the seventh, implicit gate)

Re-run the project's own brand/design hard-rules over YOUR diff — not just over
the input you were reviewing. The violation you flagged in someone else's work
is the one you're most likely to commit in your own.

## Output shape

```
Preflight
1. Read: <what exists / extend vs new>
2. States: <full matrix + which trust state, built first>
3. Verified vs reviewed: <what level of proof this will carry>
4. Canonical source: <named; file count going up/down>
5. Measurement: <events, or "none needed because…">
6. Opportunity cost: <value-hierarchy placement>
```

Then implement. Then run verify-cli-claims on the result.
