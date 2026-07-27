---
name: brand-terminology-audit
description: "Reports retired-brand terminology and stale prototype branches for review. Never edits copy or deletes branches itself — flags candidates for a human or nota-brand-manager decision."
---

# Skill: brand-terminology-audit

## Purpose
Catch drift back toward retired product names or copy in nota.'s user-facing surfaces, and surface stale prototype branches, without making any change unilaterally. Replaces a prior project-local `repo-tidy` skill that instructed *silent* terminology replacement — that behavior is not used here: silent copy edits bypass review and can break interpolation, tone, or context-specific meaning (see CLAUDE.md §1 "Rebrand debt (RESOLVED 2026-07-08)" — the sweep this addresses is a recurrence check, not a fresh migration).

## When to invoke
- Before finalizing a merge or completing a major feature, as a lightweight terminology sanity check.
- When retired names might have been reintroduced (copy-paste from old docs, an agent working from stale context, etc).
- NOT a substitute for `nota-brand-manager` (the actual copy-review authority) or `repo-tidy` (branch/secrets/build hygiene) — this is narrower than both.

## Instructions
1. Read CLAUDE.md §1 for the current canonical brand name and any explicitly retired names before running — do not hardcode a name list here, since brand doctrine can change.
2. Grep user-facing surfaces (`app/`, `components/`, copy/content files — not test fixtures, not `docs/ARCHIVE/`) for retired names.
3. For every hit, **report it** — file, line, surrounding context — grouped as "likely stale copy" vs "likely intentional (e.g. archived docs, historical changelog, code comments about history)". Do not edit anything.
4. Hand the report to `nota-brand-manager` (or the user) for a copy decision. That skill owns tone/phrasing judgment calls this skill should not make on its own.
5. Separately, list Git branches with no commits in 30+ days whose name suggests prototyping (e.g. contains "test", "experiment", "wip", "old-", "shadow-", or a feature name not in current locked scope per the repo's own AGENTS.md/CLAUDE.md). **Prompt** the user per branch — never delete automatically.
6. Do not add scope-specific claims (e.g. "SVG asset pipeline must be used") unless they are traceable to a current doc in this repo. If a candidate rule can't be traced to a source, drop it rather than carrying it forward from an untraceable prior version of this skill.

## Output
```
## Brand Terminology Audit — [Date]

Retired-name hits (need nota-brand-manager review):
- path/to/file.tsx:42 — "old term" in <context>

Likely intentional (archive/history — no action):
- path/to/file.tsx:10 — inside docs/ARCHIVE

Stale-looking branches (prompt only, no deletion):
- branch-name — last commit YYYY-MM-DD, no PR found

Overall: CLEAN / ITEMS FOR REVIEW
```
