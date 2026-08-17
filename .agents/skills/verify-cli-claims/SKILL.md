---
name: verify-cli-claims
description: "Read-only verification agent. Takes a CLI agent's 'done!' summary and proves each claim against the actual repo, filesystem, and build output. Returns Verified / Unverified / False per claim. Run after any Claude Code, Antigravity, or Gemini session before merging or deploying."
---

# Verify CLI Claims

Resolve the repository root with `git rev-parse --show-toplevel`, then read and follow `<repo-root>/.claude/skills/verify-cli-claims/SKILL.md`. This wrapper exists only for cross-CLI discovery; do not duplicate or redefine the workflow here.
