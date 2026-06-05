<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Operating rules for ALL CLI agents on Scentral (Claude Code, Antigravity, Gemini, etc.)

**Owner:** Christopher. **Purpose:** prevent invented facts, paths, keys, and scope.
This is the SINGLE canonical instructions file. `CLAUDE.md` and `GEMINI.md` point here. Read this FIRST, every session, before acting. Begin your first reply by stating in one line what you grounded yourself in.
**Supplementary reading:** `skills/grounded-agent-guardrails/SKILL.md` — expands the five safeguards with verification commands, known fabrications list, and a session-start checklist.

## 0. Why this file exists
Prior agent runs produced confident "breakthrough" output full of fabricated detail (fake repo paths,
fictional features, lore like "Agent Luna / Hegemony / Shadow Branching", and hardcoded keys). Root cause =
**confident invention**: stating things as fact without verifying. The failure mode to guard against is not
"being wrong" — it's "sounding certain while being wrong."

## 1. Ground truth (the ONLY accepted facts unless re-verified)
- **Repo:** `ChrisGoslin/scentral` (local folder may be named `scentral-hub` — same repo)
- **Supabase:** project `scentral-mvp` (`lrkdwobnemczvhpixpky`)
- **Data:** 76 fragrances, 4 layering protocols (Alpha–Delta)
- **Stack:** Next.js App Router, Supabase, Vercel, Tailwind. (Verify the exact Next.js version from
  package.json / node_modules — do NOT assert a version from memory.)
- **Architecture:** "Scentral Hub" = customer landing page + orchestrator; Collection, Lab, Scheduler are
  features WITHIN it. Scentral and Scentral Hub are ONE product, single-user MVP.
- **Locked scope:** commerce/affiliate = OUT of MVP (off-by-default disclosed seam only). No social feed,
  no Pro tier, no brand house. 3-tab nav (Collection·Lab·You) unless a real Scheduler "Today" ships.
- **Source-of-truth docs** (Foresight folder): `SCENTRAL-BASELINE.md`, `SCENTRAL-HANDOVER.md`,
  `SCENTRAL-CLAUDE-CODE-PACK.md`, `SCENTRAL-SCHEDULER-PRD.md`, `SCENTRAL-NOTEBOOKLM-INTEGRATION.md`.

If a "fact" is not in these docs, the repo, or the database, it is NOT a fact yet — verify it or label it unverified.

### Known fabrications — never reintroduce
"Morocco Marketplace Demo", "Resonance Engine / pgvector", "Alchemist Knowledge Base / dossiers",
"300+ fragrances", "Next.js 16" (assert only if package.json confirms), "Agent Luna / Sovereign Focus Group",
"Hegemony / Sovereignty", "Shadow Branching / autopilot-shadow", "Olfactory NFTs", "Invisible Commerce",
and any "Elite Council breakthrough" framing.

## 2. The five safeguards (hard rules)
- **S1 — Verify before asserting.** Never state a version, API capability, path, table/column, or third-party
  feature as fact without checking (read the file, run `list_tables`, or web-search with a source).
- **S2 — No secrets in code or docs, ever.** Keys go in `.env.local` (gitignored), referenced via
  `process.env`. If you SEE a hardcoded secret, stop and flag it for rotation — never copy or echo it.
- **S3 — Real paths only.** Confirm a path exists before referencing it. Never invent a plausible directory.
- **S4 — No scope/feature invention.** Build only what the source-of-truth docs specify. Propose, don't build.
- **S5 — Flag confidence honestly.** Label every material claim Verified / Assumption / Unknown. No hype framing.

## 3. Required behaviours
- Start of session: read this file + the relevant source-of-truth doc(s); state what you grounded on.
- Before DB/auth changes: inspect first; SHOW the migration/SQL and wait for explicit "approved" before applying.
- Before claiming a third-party tool does X: web-search and cite, or say it's unverified.
- When unsure: ask one specific question. Do not guess and proceed.

## 4. Forbidden without explicit approval
Hardcoding secrets · inventing paths/features/versions · applying migrations · deleting files · force-push ·
touching existing working routes beyond a task's scope · presenting unverified claims as fact.

## 5. Self-check before finishing any task
1. Did I verify every factual claim (paths, versions, capabilities, schema)? How?
2. Any secrets in my output? (must be no)
3. Did I stay within source-of-truth scope?
4. Did I label assumptions vs verified facts?
Fix any unsatisfactory answer before declaring done.
