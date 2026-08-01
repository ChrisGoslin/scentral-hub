---
name: implementation-preflight
description: >-
  Run BEFORE writing or changing any UI/feature code in an existing product.
  Six gates preventing: building before reading the repo, happy-path-only
  screens, claiming "verified" without a build, adding sources of truth,
  measurement claims without a measurement plan, and gold-plating low-value
  surfaces. Trigger on "implement", "build", "convert", "add a component",
  "wire this up", "before I start coding", or any design-to-implementation
  hand-off.
---

# Implementation Preflight

Resolve the repository root with `git rev-parse --show-toplevel`, then read and follow `<repo-root>/.claude/skills/implementation-preflight/SKILL.md`. This Gemini discovery pointer does not redefine the canonical gates.
