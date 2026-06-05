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

Source-of-truth docs for Scentral:
- `AGENTS.md` (this repo)
- `docs/SCENTRAL-BASELINE.md`
- `docs/SCENTRAL-HANDOVER.md`
- `docs/SCENTRAL-CLAUDE-CODE-PACK.md`

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
□ State in one line what I grounded on: "Grounded on: AGENTS.md + docs/SCENTRAL-BASELINE.md"
□ Verify Next.js version from package.json (not memory)
□ Confirm target file paths exist before referencing them
```

---

## Known Fabrications — Never Reintroduce

These were invented by prior agents and must never appear again:

- "Morocco Marketplace Demo"
- "Resonance Engine / pgvector"
- "Alchemist Knowledge Base / dossiers"
- "300+ fragrances" (actual: 76)
- "Next.js 16" asserted without checking (always verify from package.json)
- "Agent Luna / Sovereign Focus Group"
- "Hegemony / Sovereignty / Shadow Branching / autopilot-shadow"
- "Olfactory NFTs / Invisible Commerce"
- "Elite Council breakthrough" framing

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

| Fact | Value | How to verify |
|------|-------|--------------|
| Repo | `ChrisGoslin/scentral` (local: `scentral-hub`) | `git remote -v` |
| Supabase project | `scentral-mvp` (`lrkdwobnemczvhpixpky`) | Supabase dashboard |
| Fragrances | 76 | `SELECT count(*) FROM fragrances` |
| Layering protocols | 4 (Alpha–Delta) | Source-of-truth docs |
| Stack | Next.js App Router, Supabase, Vercel, Tailwind | package.json |
| Next.js version | Verify from package.json — do not assert from memory | `cat package.json` |
| Architecture | Single product: Collection · Lab · You (3-tab nav) | AGENTS.md |
| Commerce/affiliate | Out of MVP scope | AGENTS.md locked scope |
