---
name: canonical-source-reconciler
description: "Use when new canonical docs, brand doctrine files, or operating-system sources are added, renamed, promoted, or imported. Reconciles ownership, docs routing, stale missing-file warnings, and implementation-drift notes so other CLIs stop reading outdated state."
---

# Skill: canonical-source-reconciler

## Purpose

Use this skill when a formerly missing canonical file appears, when a source-of-truth doc is promoted, or when concern ownership changes. The goal is to close routing drift immediately so future CLIs read the real canon instead of stale warnings.

## When to invoke

- A new root doctrine or design file is added
- A handover says a file is missing and that file is later created
- A concern changes owner between docs
- A repo gains a new canonical skill, playbook, or operating rule that other CLIs must discover quickly

## Workflow

1. Confirm the file exists and read it directly.
2. Identify the concern it owns:
   - operating rules
   - doctrine / brand
   - design contract
   - implementation companion
   - handover / reality boundary
   - index / routing
3. Update the routing layer immediately:
   - `docs/index.md`
   - `docs/HANDOVER.md`
   - any owner table or read-order list
4. Remove or rewrite stale "missing file" warnings.
5. If doctrine changed but code did not, record the implementation gap explicitly instead of implying parity.
6. If an existing skill already covers part of the workflow, reconcile it instead of creating a duplicate.
7. Verify the reconciliation with:
   - direct file reads
   - `git diff --check`
   - targeted `git status --short` on touched files

## Output standard

Report:

- what canon changed
- which files now own which concerns
- which routing surfaces were updated
- any remaining doctrine-versus-implementation drift
- exact files still needing confirmation

## Guardrails

- Do not replace `AGENTS.md` wholesale when additive guidance is enough.
- Do not leave a real file unindexed after import.
- Do not claim a concern is reconciled if any routing surface still describes it as missing.
- Do not collapse doctrine and implementation into one claim; call out drift honestly.
