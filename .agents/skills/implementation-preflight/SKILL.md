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

Resolve the repository root with `git rev-parse --show-toplevel`, then read and follow `<repo-root>/.claude/skills/implementation-preflight/SKILL.md`. This wrapper exists only for cross-CLI discovery; do not duplicate or redefine the gates here.
