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

Source-of-truth docs for Scentral — **verify these paths still exist before trusting them,
they have moved before** (`docs/SCENTRAL-BASELINE.md`, `-HANDOVER.md`, `-CLAUDE-CODE-PACK.md`
were the old names and no longer exist as of 2026-06-24):
- `AGENTS.md` (this repo, root — always read first)
- `docs/AnotherSense_Execution_Brief.md`
- `docs/specs/AnotherSense_Final_UX_Overhaul.md`

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
  (76 → 282 → 127,195 after the 2026-06-24 Kaggle bulk import) and will change again. Always
  run `SELECT count(*) FROM fragrances` instead of citing a number from a prior session.
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
