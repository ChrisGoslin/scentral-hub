---
name: alignment-sweep
description: "Monthly whole-system drift check. Runs every alignment check in one pass — canon vs shipped code, skill divergence across Cowork/repo/global, retired assets still loading, broken routing pointers, doc freshness, and whether canon itself has gone generic. Produces one ranked report and changes nothing. Trigger monthly, before a release, after a multi-session sprint, or on 'run the sweep' / 'check for drift' / 'is everything still aligned'."
---

# Alignment Sweep

Resolve the repository root with `git rev-parse --show-toplevel`, then read and
follow `<repo-root>/.claude/skills/alignment-sweep/SKILL.md`. This wrapper exists
only for cross-CLI discovery; do not duplicate or redefine the sweep.
