# AnotherSense Skills Directory

Catalog of skills for Claude Code (and reference material for other CLI tools) working on
scentral-hub.

**Location note (2026-06-24):** these moved here from a top-level `skills/` directory. That
location was never actually Claude Code's project-skill discovery path — none of these
auto-loaded in any session despite `docs/SKILLS_GUIDE.md` describing automatic discovery.
`.claude/skills/<name>/SKILL.md` is the real path. If a skill stops showing up as available,
verify it's still here and has valid `name`/`description` frontmatter before assuming the
mechanism is broken again.

## Skills

| Skill | Purpose | Self-maintaining? |
|---|---|---|
| `grounded-agent-guardrails` | Prevent confident invention — verify before asserting, no secrets, real paths, no scope invention. Session-start checklist. | **Yes** — "Known Fabrications" list and "Ground Truth" table are meant to be appended/corrected by whoever catches a new stale fact or invented detail. Don't just fix it in your head, fix it in this file. |
| `branch-hygiene` | Session-start checklist: sync state, check what already exists before building, branch-vs-main decision, safe commit at the end — now includes a mandatory `npm run build` gate before every push. | Partially — branch/main decision logic is stable; the "what already exists" check is always live (`find app -name page.tsx`, not hardcoded). The build gate was added 2026-06-25 after three separate commits reached `origin/main` with no local build check and broke prod 19+ times in a row — append new must-check-before-push patterns here as they're found. |
| `safe-commit-shared-repo` | Commit safely when a concurrent session may be editing this repo at the same time. Explicit-pathspec discipline. Now also covers testing a new git hook safely and the `git reset --hard` blast-radius trap. | Yes — add new "what NOT to do" examples as you hit them. Grew 2026-06-25: a `git reset --hard` used to undo a self-inflicted test commit also wiped unrelated uncommitted work, and a hook "verified" by a real push (rather than direct invocation first) reached `origin/main` before anyone noticed it was never wired up. |
| `diagnose-prod-slowdown` | Runbook for a slow/timing-out prod API route: Vercel logs → Postgres EXPLAIN ANALYZE → fix → re-verify. | Yes — append new root-cause patterns as they're found (this one started from a single real incident). |
| `repo-tidy` | 7-phase cleanup runbook: branches, secrets, dead code, regressions, scope purge, git log sanity, deploy checklist. | Partially — Phase 5 now reads AGENTS.md §1 live instead of a hardcoded scope list (a hardcoded list went stale and would have deleted real shipped features). |
| `verify-cli-claims` | Read-only verification of another agent's "done!" summary against the actual repo/build/DB. | Yes — "Red Flag Phrases" and verification methods should grow as new claim types show up. |
| `testing-framework` | Smoke test / Playwright E2E / manual QA strategy for this Next.js app. | No — mostly generic Next.js testing guidance; the few project-specific bits (deploy URL) need occasional spot-checking against `package.json`'s actual `test:smoke:prod` script. |

## What "self-maintaining" means here

Some of these skills have an explicit instruction to be edited by whoever next catches them
being wrong, rather than treated as a frozen reference. `grounded-agent-guardrails`'s "Known
Fabrications" list is the clearest example — it has grown across sessions as new invented
details got caught, and it should keep growing. The same pattern is now explicit in
`safe-commit-shared-repo` and `diagnose-prod-slowdown`, both of which started from one real
incident each (a swept-in commit, a root-caused prod timeout) and are meant to accumulate more.

The opposite failure mode — what this project ran into before this cleanup — is a skill that
states a fact as if frozen (a row count, a doc path, a route list, a locked MVP scope) and goes
silently stale. When you're about to hardcode a fact in a skill file, ask: will this still be
true in a month? If no, write the verification command instead of the value.

## Using a skill

Claude Code should auto-detect relevant skills by matching your request against each skill's
`description` frontmatter. You can also reference one explicitly: "use the
diagnose-prod-slowdown skill to look at this timeout."

For non-Claude-Code agents (Gemini, Antigravity), these are plain markdown — `Read` or `cat`
the `SKILL.md` directly; `AGENTS.md` points to the ones that matter at session start.

## Creating a new skill

1. `mkdir -p .claude/skills/new-skill-name`
2. Add `SKILL.md` with frontmatter: `name`, `description` (the description is what Claude
   Code matches against — be specific about trigger scenarios, not just the topic)
3. If the skill encodes a lesson from a real incident, say so explicitly and state whether
   future sessions should append to it (see "self-maintaining" above)
4. Add an entry to the table in this README

## Related, not part of this catalog

- `.gemini/skills/sovereign-orchestrator/SKILL.md` — a Gemini-CLI-specific meta-agent persona
  skill (not a Claude Code skill, different tool/format). Legitimate, not lore — despite the
  "Sovereign" branding echoing AGENTS.md's forbidden "Hegemony/Sovereignty" *product-feature*
  fabrications, this is a tool persona, not an invented Scentral feature. Left as-is.
- `.agents/skills/supabase/` and `.agents/skills/supabase-postgres-best-practices/` — vendor-
  maintained by Supabase (versioned, `metadata.author: supabase`), not project-authored. Don't
  edit these; they update via the Supabase plugin, not manually.
