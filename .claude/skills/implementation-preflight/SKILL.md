---
name: Implementation Preflight
description: Run BEFORE writing or changing any UI/feature code in an existing product (nota. / scentral-hub). A six-gate checklist that prevents building before reading the repo, shipping happy-path-only screens, claiming "verified" without a build, silently adding sources of truth, asserting things need measuring without a measurement plan, and gold-plating low-value surfaces. Use when starting any non-trivial implementation task, and pair with the `screen-state-completeness` skill for user-facing surfaces.
version: 0.1.0
---

# Implementation Preflight

Companion doc: `docs/CANONICAL-GUARDRAILS.md` (the `lessons.md` section — each gate below maps to a specific, previously-made mistake; read it once for the "why").

Answer each gate in writing before authoring code. If a gate can't be passed, that is the finding — surface it and stop, don't proceed on assumption.

## Six gates

### Gate 1 — Read before build
- Have I read the existing implementation of this surface in the repo?
- Does something like it already exist that I should extend, not duplicate?
- If I don't have repo access yet, STOP and request it. Never author components for an existing product sight-unseen.

Failure this prevents: building a duplicate suite, then discovering a fuller version already shipped.

### Gate 2 — Full state matrix, not the happy path
List every state the surface must handle before building any of them: loading · empty · error · success · the product-specific trust/recovery state · accessibility states (keyboard, focus, `aria-live`, reduced motion). See `screen-state-completeness` for the full breakdown. A screen delivered with only the success state is incomplete, not a draft.

### Gate 3 — Reserve the word "verified"
- "Verified" = passed a build, a type-check, and the existing test suite.
- Structural checks (tag balance, grep, file counts) are "reviewed", never "verified". State which one every claim is.
- If you cannot run the build in this environment, say so, and mark the work "reviewed, unbuilt" — do not imply otherwise.

### Gate 4 — Sources of truth go down, not up
- Am I adding a config/token/canonical file? Does it REPLACE or merely out-rank an existing one?
- Name the single canonical source for this concern. If my change increases the count of competing sources, justify it explicitly or consolidate instead.
- Winning by load order / specificity is debt, not a fix.

### Gate 5 — Every "needs measuring" ships with its events
- Did I claim any decision "should be tested / measured / validated"?
- Then attach the measurement plan in the same breath: which analytics events, which properties, what threshold would decide it.
- No measurement assertion without a measurement plan.

### Gate 6 — Opportunity cost
- Where does this work sit in the product's value hierarchy?
- Is this the highest-value thing to build right now, or am I polishing a low-traffic / non-core surface?
- State the answer plainly. Craft on the wrong surface is still waste.

## Self-review before delivery (the seventh, implicit gate)

Re-run the project's own brand/design hard-rules over YOUR diff — not just over the input you were reviewing. The violation you flagged in someone else's work is the one you're most likely to commit in your own.

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

Then implement. Then run `verify-cli-claims` on the result.
