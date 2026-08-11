---
name: canonical-source-reconciler
description: "Use when new canonical docs, brand doctrine files, or operating-system sources are added, renamed, promoted, or imported. Reconciles ownership, docs routing, stale missing-file warnings, and implementation-drift notes so other CLIs stop reading outdated state."
---

# Skill: canonical-source-reconciler

Resolve the repository root with `git rev-parse --show-toplevel`, then read and follow `<repo-root>/.claude/skills/canonical-source-reconciler/SKILL.md`. Use its `scripts/check_canonical_sources.sh` sweep from the same directory. This wrapper exists only for cross-CLI discovery; do not duplicate or redefine the workflow here.
