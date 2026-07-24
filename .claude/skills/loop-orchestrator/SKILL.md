---
name: loop-orchestrator
description: >-
  Run the three-version adversarial loop on any substantial task. Referenced by
  CLAUDE.md rule 12 — this file makes that rule executable. Trigger for any
  substantial cross-CLI task, any UI/feature build, "run the loop", "assured
  mode", or before declaring significant work complete. V1 build → critique →
  V2 → independent critique → V3, with every pass recording its critique,
  delta, verification, and reusable lesson into docs/lessons.md.
---

# Loop Orchestrator

The loop always runs to **Version 3**. Versions are checkpoints of one evolving
artifact, not three duplicated deliverables.

## The loop

**V1 — build.** Initial output plus one accepted, bounded stretch (~20% beyond
the ask). Before building, run `implementation-preflight` (six gates) and, for
any user-facing surface, `screen-state-completeness`.

**Critique 1 → V2.** Evidence-led adversarial review of V1 by a different
persona/lens than the builder. Attack: correctness, brand doctrine
(DESIGN.md / NOTA-BRAND-UIUX-PACK.md), the full state matrix, accessibility,
performance budgets, and every claim marked "verified" (was it actually built
and tested, or merely reviewed?). Patch what the critique justifies.

**Critique 2 → V3.** Second, independent critique — different lens again
(e.g. if Critique 1 was engineering, make Critique 2 CX/brand, or vice versa).
Patch. V3 is the deliverable.

## Per-pass record (mandatory, no exceptions)

Each pass appends to the task's completion record:

```
Pass: <V1|V2|V3>
Critique: <the strongest objections found, or "n/a" for V1>
Delta: <what materially changed, or "no patch required">
Verification: <build/lint/test/screenshot evidence — "verified" only if it ran>
Lesson: <reusable lesson, or "none">
```

- If a critique finds no justified patch, record `no patch required` — never
  manufacture churn to look thorough.
- Any pass whose Lesson is not `none` MUST also be appended to
  `docs/lessons.md` in the standard format (what happened → rule → enforced
  by). Lessons that stay in a completion record die there; lessons.md is the
  memory that compounds.

## Trivial tasks

Declare the reduced loop BEFORE execution ("trivial: single-pass with
self-review"), then still verify the result. Never retroactively decide a task
was trivial after skipping the loop.

## Vocabulary

"Verified" = built, type-checked, tests ran. Anything else is "reviewed".
State which one, every time.
