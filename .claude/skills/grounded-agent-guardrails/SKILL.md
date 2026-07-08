---
name: grounded-agent-guardrails
description: "Prevent confident invention by CLI agents. Encodes the 5 safeguards from AGENTS.md — verify before asserting, no secrets in code, real paths only, no scope invention, flag confidence honestly. Run at session start and before any DB change, migration, or merge."
---

# Skill: grounded-agent-guardrails

## Purpose
Prevent confident invention. This skill encodes the five safeguards from `AGENTS.md` into a session-start checklist any CLI agent (Claude Code, Gemini, Antigravity, etc.) must run before acting.

The root failure this guards against: **sounding certain while being wrong** — fabricated paths, versions, table names, features, and keys stated as verified facts.

---

## When to invoke
- At the start of every session in this repo
- Before any DB schema change, migration, or file deletion
- Before citing a third-party API capability
- Before asserting a version, path, or feature exists

---

## The Five Safeguards

### S1 — Verify before asserting
Never state a version, API capability, file path, table/column name, or third-party feature as fact without checking it.

**How to verify:**
- File/path exists? → `ls` or `Read` the path
- DB table/column exists? → `list_tables` or `execute_sql SELECT column_name FROM information_schema.columns WHERE table_name = 'X'`
- Next.js version? → `cat package.json | grep '"next"'` — never assert from memory
- Third-party tool does X? → web-search and cite a source, or label it Unverified

**Label every material claim:** `[Verified]`, `[Assumption]`, or `[Unknown]`

### S2 — No secrets in code or docs, ever
Keys, tokens, and credentials go in `.env.local` (gitignored), referenced via `process.env.VAR_NAME`.

If you see a hardcoded secret anywhere: **stop**, flag it for rotation, never copy or echo it.

### S3 — Real paths only
Confirm a path exists before referencing it. Never invent a plausible-sounding directory or file.

Run: `ls <path>` or `Read <path>` before citing it.

### S4 — No scope/feature invention
Build only what the source-of-truth docs specify. If you have an idea beyond scope: **propose it, don't build it.**

Source-of-truth docs for nota. (repo `scentral-hub`) — **verify these paths still exist before
trusting them, they have moved before** (`docs/SCENTRAL-BASELINE.md`, `-HANDOVER.md`,
`-CLAUDE-CODE-PACK.md` were the old names and no longer exist as of 2026-06-24):
- `CLAUDE.md` (this repo, root — living memory, supersedes contradictions in older docs; read first)
- `AGENTS.md` (this repo, root — binding operational rules + lessons L1–L17)
- `docs/HANDOVER.md`
- `docs/nota/01-cx-journey-audit.md` through `07-engineering-handover.md` (7 phase docs)

#### Corrections (2026-07-05)
`docs/AnotherSense_Execution_Brief.md` and `docs/specs/AnotherSense_Final_UX_Overhaul.md` (the two
paths previously listed here) **no longer exist** — `docs/specs/` is now an empty directory and the
brief file is gone. This is itself an instance of the "docs move" pattern this section warns about.
The project's binding-docs order is now, per `CLAUDE.md` itself: `CLAUDE.md` (wins on contradiction)
> `AGENTS.md` (operational rules L1–L17, git hygiene, deploy — still binding) > `README.md` >
`docs/HANDOVER.md` > `docs/nota/` phase docs. `docs/PRODUCT_TRUTH.md` still exists on disk but is
explicitly flagged stale in `CLAUDE.md` §1 (wrong brand name, wrong fragrance count) — don't cite it
as source-of-truth. Re-verify: `ls docs/AnotherSense_Execution_Brief.md docs/specs/ CLAUDE.md
AGENTS.md docs/HANDOVER.md docs/nota/*.md`.

### S5 — Flag confidence honestly
No hype framing. No "MASTERPIECE", "breakthrough", "elite", or certainty-inflating language.

Format for any claim with uncertainty:
```
[Verified] Next.js version is 16.2.6 (from package.json)
[Assumption] This table exists — should verify with list_tables before migrating
[Unknown] Whether this Supabase edge function supports streaming — needs web-search
```

---

## Session-Start Checklist (run before first action)

```
□ Read AGENTS.md
□ Read the relevant source-of-truth doc for today's task
□ State in one line what I grounded on: "Grounded on: AGENTS.md + docs/AnotherSense_Execution_Brief.md"
□ Verify Next.js version from package.json (not memory)
□ Confirm target file paths exist before referencing them
```

---

## Known Fabrications — Never Reintroduce

These were invented by prior agents and must never appear again:

- "Morocco Marketplace Demo"
- "Resonance Engine / pgvector" (unless referring to the real `/dna-match` route)
- "Alchemist Knowledge Base / dossiers"
- Any specific fragrance count stated from memory — this number has changed multiple times
  (76 → 282 → 127,595 after the 2026-07-03 bulk import — corrected from an earlier 127,195 typo,
  see Corrections below) and will change again. Always run `SELECT count(*) FROM fragrances`
  instead of citing a number from a prior session.
- "Next.js 16" asserted without checking (always verify from package.json)
- "Agent Luna / Sovereign Focus Group"
- "Hegemony / Sovereignty / Shadow Branching / autopilot-shadow" as *product/feature* framing
  (note: a Gemini-authored meta-agent persona skill legitimately uses "Sovereign Orchestrator"
  branding at `.gemini/skills/sovereign-orchestrator/` — that's a tool persona, not a fabricated
  Scentral feature; don't confuse the two)
- "Olfactory NFTs / Invisible Commerce"
- "Elite Council breakthrough" framing

**Add to this list** the moment you catch a new one — don't just silently correct it and move on.

---

## Before Declaring Done — Self-Check

Answer all four before finishing any task:

1. Did I verify every factual claim (paths, versions, capabilities, schema)? How?
2. Are there any secrets in my output? (must be: no)
3. Did I stay within source-of-truth scope?
4. Did I label assumptions vs verified facts?

If any answer is unsatisfactory: fix it before declaring done.

---

## Ground Truth (Scentral)

Facts that decay (row counts, nav structure, scope) are listed here as **verify commands
only**, not hardcoded values — every prior hardcoded number in this table has gone stale and
misled a session. Facts that don't decay (repo name, project ID) are listed as values.

| Fact | Value / How to verify |
|------|--------------------|
| Repo | `ChrisGoslin/scentral` (local: `scentral-hub`) — `git remote -v` |
| Supabase project | `scentral-mvp` (`lrkdwobnemczvhpixpky`) |
| Fragrance count | **Don't hardcode — it changes.** `SELECT count(*) FROM fragrances` |
| Stack / versions | Never assert from memory — `cat package.json` |
| Current routes / nav structure | `find app -name "page.tsx" \| sort`, then cross-check against AGENTS.md §1 (which itself drifts — verify against the filesystem, not just the doc) |
| Current MVP scope (in/out) | AGENTS.md §1 "Routes" — re-read every session, it expands as epics ship; do not assume something is "out of scope" from a prior session's memory |

### Operating condition: concurrent sessions
A separate Claude/Gemini/Antigravity session is frequently editing this same repo and DB in
parallel, uncoordinated. Expect to find work already done, done differently than asked, or
`AGENTS.md` edits reverted right after you save them. Always verify current file/DB/route
state directly — never trust a doc's claim about what exists. See `safe-commit-shared-repo`
for the git-specific consequence of this.

## When NOT to use this skill

This is the always-on, session-start safeguard layer — it doesn't replace task-specific skills.
For the git-commit-safety mechanics of concurrent editing, use `safe-commit-shared-repo`. For
verifying a *specific* agent's "done" summary against the repo (a one-time audit, not a standing
checklist), use `verify-cli-claims`. For security-specific ground truth (RLS, secrets, GDPR), see
`security-hardening`.

## See also

- `nota-architecture-contract` — the canonical, re-verifiable route/table/API list this skill's S1/S3 verification steps should check against first, instead of re-deriving it from scratch each session.
- `nota-failure-archaeology` — full narrative history of past fabrication incidents (Morocco Marketplace Demo, Agent Luna, etc.) referenced tersely in "Known Fabrications" above.
- `fragrance-domain-reference` — canonical domain vocabulary (personas, projection enum, note pyramid) to check invented-sounding domain terms against before assuming they're fabrications or accepting them as real.
- `verify-cli-claims` — the concrete verification technique for S1, applied to a specific agent session's claims.

## Provenance and maintenance

Derived from: `AGENTS.md` (this repo, root), `CLAUDE.md` §1 (rebrand/doctrine history), direct
filesystem checks of every path cited in S4, live Supabase schema.

Re-verify when picking this skill back up:
- Source-of-truth doc paths still exist: `ls CLAUDE.md AGENTS.md docs/HANDOVER.md docs/nota/*.md`.
- Fragrance count (never hardcode): Supabase MCP `execute_sql: SELECT count(*) FROM fragrances`.
- Next.js/React/Supabase versions: `cat package.json | grep -E '"next"|"react"|"@supabase'`.
- No new fabricated-lore name has appeared: `grep -rn "agent.luna\|shadow.*branch\|autopilot-shadow\|hegemony\|olfactory.*nft\|invisible.commerce\|morocco.*marketplace\|resonance.engine\|alchemist.*knowledge.*base" app/ docs/ --include="*.tsx" --include="*.ts" --include="*.md" -il`.
