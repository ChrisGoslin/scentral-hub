# Handover Template — Verification First

Use this template for any handover that claims code, docs, files, workflows, migrations, or cleanup work are complete. The point is simple: do not report remembered state when live state is available.

## 1. Summary

- Task completed:
- Verified outcome:
- Scope boundary:
- Remaining uncertainty:

## 2. What Was Claimed

- Claim 1:
- Claim 2:
- Claim 3:

If there were no prior claims and this is a direct implementation handover, say so explicitly.

## 3. What Was Actually Verified

For each material claim, record the live check that proved it:

| Claim | Check run | Result | Evidence |
|---|---|---|---|
| Example: file exists | `ls -la path/to/file` | Verified / False / Unverifiable here | file present, size, timestamp |
| Example: content matches | `sed -n '1,80p' file` | Verified / False / Unverifiable here | key lines |
| Example: tracked history | `git log --follow --oneline -- file` | Verified / False / Unverifiable here | commit history or none |
| Example: workspace state | `git status --short` | Verified | modified/untracked paths |
| Example: build claim | `npm run build` | Verified / False / Not run | exit status or blocker |

## 4. Corrections

- Overclaim found:
- What the live check showed:
- Correction made:

If nothing required correction, write `None`.

## 5. Provenance And Timing

- Verification environment:
- Tool-scope limits:
- Checks that could not be run from this environment:
- Time-sensitive findings:

If current file presence could be misleading, check provenance explicitly:

- `git status --porcelain -- <path>`
- `git log --follow --oneline -- <path>`

Do not use "it exists now" as proof that it existed when an earlier claim was made.

## 6. Uncommitted State

- Branch:
- HEAD:
- Relevant modified files:
- Relevant untracked files:
- Unrelated dirty-tree risks:

## 7. Doctrine And Routing Impact

If canon changed, confirm all routing surfaces were updated:

- `docs/index.md`
- `docs/HANDOVER.md`
- ownership table or read-order list
- stale "missing" warnings removed
- doctrine-versus-implementation drift called out honestly

If not applicable, write `No canon/routing change`.

## 8. Next Smallest Safe Action

- Recommended next action:
- Why this is the next safe step:

## 9. Ready-To-Send Closeout

Use this shape for the final human-facing summary:

- verified matches
- mismatches or corrections
- files changed
- checks run
- blockers or uncertainty
- next safe action

## 10. Loop Engineering Record

Choose the required depth before execution:

- Trivial and reversible: verified Version 1
- Standard bounded work: verified Version 2
- Substantial, cross-CLI, canonical, risky, or release-affecting: verified Version 3

Versions are checkpoints of one evolving artifact. Do not create duplicate reports or cosmetic changes merely to satisfy the loop.

The +20 percent stretch means one bounded improvement to quality, resilience, accessibility, or automation within the original acceptance criteria. It is not permission to add 20 percent more product scope.

| Checkpoint | Evidence-led critique | Material delta | Verification | Reusable lesson |
|---|---|---|---|---|
| Version 1 | Initial failure modes and stretch rationale | Requested outcome + bounded stretch | Checks and outcome | Lesson or `none` |
| Version 2 | Weaknesses found in Version 1 | Fixes applied, rejected findings with reasons, or `no patch required` | Checks and outcome | Lesson destination or `none` |
| Version 3 | Residual risks found in Version 2 | Final fixes or `no patch required` | Final checks and outcome | Lesson destination or `none` |

### Version-3 completion gate

- [ ] Canonical sources and worktree boundary verified
- [ ] Two critiques grounded in inspected evidence
- [ ] Accepted findings patched; rejected findings explained
- [ ] Relevant lessons routed to their single owner without duplicating canon
- [ ] Tests, build, diff, and claim checks recorded proportionately
- [ ] Branch, commit, push, deploy, migration, and production claims directly proved
- [ ] Remaining uncertainty and next safe action stated

## Guardrails

- "Unverifiable from this environment" is valid. Do not upgrade it to "missing."
- Rebuild confirmed-missing artifacts from adjacent spec docs, not placeholders.
- If a handover mentions a build, test, migration, or deployment, state whether you personally re-ran it in this turn.
- If a file was created during remediation, say so plainly instead of implying it had always been there.
- Declare the chosen loop depth before execution. If it is reduced, state why and name the residual risk.
