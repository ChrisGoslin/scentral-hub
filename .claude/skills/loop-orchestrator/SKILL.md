---
name: loop-orchestrator
description: Orchestrate evidence-gated delivery loops for substantial, cross-CLI, canonical, risky, or release-affecting work. Use when a task needs coordinated building, independent critique, remediation through Version 2 or Version 3, verified completion claims, or reusable lesson routing; also use when deciding whether a request needs quick, standard, or assured loop depth.
---

# Loop Orchestrator

Coordinate one evolving artifact through proportionate build, critique, remediation, and verification checkpoints. Keep product truth in canonical docs; this skill owns sequencing and evidence only.

## 1. Orient

Before delegation or edits:

1. Read `AGENTS.md` first, then follow `docs/HANDOVER.md` concern ownership and `docs/index.md` routing. For conflicts, identify the concern owner and verify current implementation; do not choose whichever file was read first.
2. Verify repository, branch, HEAD, dirty-tree boundary, and requested scope.
3. Convert the request into observable acceptance criteria.
4. Identify actions requiring human approval. Never widen authority through orchestration.
5. Create an in-memory findings ledger; do not add progress files unless requested or required by the environment.

## 2. Select loop depth

Choose the lowest mode justified by risk:

| Mode | Use for | Required checkpoints |
|---|---|---|
| `quick` | Trivial, reversible, single-surface work | Version 1 + verification |
| `standard` | Bounded multi-step work with moderate regression risk | Version 1 → independent critique → Version 2 → verification |
| `assured` | Cross-CLI, canonical, security/auth/data, release, migration-planning, or high-blast-radius work | Version 1 → independent Critic 1 → Version 2 → different independent Critic 2 → Version 3 → independent verification |

Escalate one level when acceptance criteria are unclear, the worktree is shared, claims depend on external state, or failure would be difficult to reverse. Declare the selected mode and rationale before execution. If using less than the table requires, state residual risk.

## 3. Establish the contract

Record:

- requested outcome
- builder identity
- non-goals and authority boundary
- acceptance criteria
- bounded +20 percent stretch
- checks that could falsify completion
- selected mode and required reviewers
- coordination budget: why each delegated role is worth its context and latency cost

Propose one stretch to quality, resilience, accessibility, observability, or automation. Implement it only when it is explicitly inside the accepted criteria; otherwise record `declined`. It is never permission to add product scope or touch extra paths implicitly.

If required information or authority is missing, stop before Version 1 and issue a blocker handoff with the missing decision, evidence gathered, and next safe action. Do not validate or label that record complete.

## 4. Run the loop

Treat versions as checkpoints of the same artifact, not duplicated deliverables.

### Version 1

Have the builder implement the requested outcome and any accepted bounded stretch. Capture changed paths and raw verification output.

### Critique 1

Give an independent reviewer the acceptance criteria, artifact or diff, canonical constraints, and raw evidence. Do not give the builder's confidence statement as ground truth. Ask the reviewer to find counterexamples, regressions, overclaims, scope drift, missing tests, and automation opportunities.

Classify every finding as:

- `accepted` — patch it
- `rejected` — retain the artifact and record an evidence-based reason
- `unresolved` — name the blocker or required decision

### Version 2

Patch accepted findings only. Re-run the smallest checks that could falsify the revised claims. Route genuinely reusable learning to its single canonical owner; use `none` when the observation is task-specific.

### Critique 2 and Version 3

Required in `assured` mode. Use a second reviewer who is independent of the builder and Critic 1. Review Version 2 rather than the original narrative, patch accepted residual findings, and run final verification. `No patch required` is valid when supported by evidence; never manufacture churn. If the required independent reviewers are unavailable, downgrade the declared mode and state the residual risk; never call the result `assured`.

## 5. Delegate economically

- Stay inline when delegation costs more than the review value; `quick` mode normally needs no subagent.
- Run dependent passes sequentially; never fan out Version 2 before Version 1 critique is complete.
- Parallelise only genuinely independent review lenses.
- In `quick` mode, the builder may verify with direct automated or filesystem evidence and must state the residual risk. In `standard` and `assured`, the builder must not be a required reviewer or final verifier.
- `standard` requires one reviewer independent of the builder. `assured` requires two different independent reviewers. If they are unavailable, downgrade the mode and state the residual confidence limitation.
- Give reviewers raw artifacts and criteria, not expected findings.
- Re-run decisive verification in the orchestrator context before accepting a builder's claim.
- Do not delegate a separate builder merely because one is available. Delegate when specialisation, isolation, or parallel discovery materially exceeds handoff cost.

## 6. Close with evidence

Use [references/completion-record.md](references/completion-record.md). Report the selected mode, checkpoint reached, findings ledger, material deltas, exact checks, lesson destination, dirty-tree boundary, unresolved risk, and next safe action.

Before claiming completion, run:

```bash
repo_root="$(git rev-parse --show-toplevel)"
bash "$repo_root/.claude/skills/loop-orchestrator/scripts/validate-completion-record.sh" <quick|standard|assured> <record.md>
```

The script validates record structure, not the truth of its contents. Direct inspection and real checks remain mandatory.

## Guardrails

- Do not become a source of product, brand, schema, or release truth.
- Do not let a builder approve its own completion claim.
- Do not write every critique into permanent lessons.
- Do not infer permission for commits, pushes, deployments, migrations, destructive changes, or external messages.
- Do not hide `unresolved` findings to achieve a clean verdict.
