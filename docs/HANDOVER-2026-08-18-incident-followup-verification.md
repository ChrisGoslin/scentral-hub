# Handover: Incident Follow-up — Local Verification of Build Fix

**Date:** 2026-08-18
**Author:** Cowork (incident-response review)
**For:** Claude Code only — this doc contains git-mutating and build commands.

## 1. Context

Cowork reviewed a production build failure on `scentral-hub` reported via a pasted
chat transcript. The transcript's self-diagnosis was wrong (claimed a `DeviceMotionEvent`
/ Vercel `dom`-lib scoping issue); actual root cause, VERIFIED against live Vercel build
logs, was a TypeScript strict-null gap in `app/labs/sensory/page.tsx:23` — a guard checked
`=== null` but not `undefined` before `Math.abs(x - lastX)`.

Three commits were required to reach a green production deploy, not the one commit the
transcript credited:

1. `94732ee` — fix: remove global DeviceMotionEvent TS references for Vercel build
2. `06d6f30` — build: fix Sentry crash on Vercel by enabling dryRun
3. `e89e67f` — build: suppress Sentry release creation errors to unblock Vercel

Current production alias `notalabs.io` → `dpl_4rCQ77Hw1m1Eyp6Ksq7KWxY7drQ8` (commit
`e89e67f`), state `READY`. VERIFIED @ 2026-08-18 via Vercel MCP `get_deployment`. This is
real and current as of this writing — re-verify it hasn't drifted before trusting it (§5).

## 2. What Cowork could not do (and why)

Per project instructions, Cowork uses only non-index git reads (log, show, rev-list,
ls-files, cat-file, branch --list) — no status, diff against worktree, add, commit, stash,
rebase. Cowork also does not run builds. This handover exists so Claude Code can close the
loop with a real local build/test run and, if anything is found, fix and commit it.

## 3. Verification Protocol — re-derive, do not hand-copy (§16.5)

Run these from `scentral-hub` root on `main`, HEAD should be `e89e67f` or later:

```bash
git log --oneline -5
git status --porcelain
```

If `git status` shows unexpected dirt, stop and report before proceeding — do not build
over uncommitted state you didn't create.

```bash
npx tsc --noEmit
```
Expected: clean exit 0. If it fails, the failure is real signal — do not assume it's stale
queuing the way the transcript wrongly did. Read the actual file:line.

```bash
npm run test:spikes
```
Expected per the original handover: 26/26 or higher. Report the actual number, not the
expectation.

```bash
npm run build
```
This is the authoritative check — it's what Vercel actually runs. A passing `tsc --noEmit`
does not guarantee this passes; the original incident was `npm run build` failing while
`tsc` alone can behave differently (e.g. bundler-side type stripping settings). Confirm exit
code and paste the tail if it fails.

## 4. If everything passes clean

No action needed beyond reporting the verified results (with timestamps and commands run,
per the Claim Tiers vocabulary in AGENTS.md §5). Do not add a "we confirmed it's fine" doc
unless something material changed — this handover doc itself is the record.

## 5. If something fails

Fix it directly per canon §2 (Medium-risk: 3–5 bullet plan, then act). Do not re-diagnose
by assumption the way the earlier session did — read the actual compiler/test output before
proposing a fix. Commit with a message naming every file changed and why (§6 Commit Message
Discipline). This is a Low/Medium risk fix (local build config, no schema/auth/billing) —
act, don't wait for confirmation, but do not force-push or touch `main` history.

## 6. Known-suspect artifacts from this session (not yet independently verified)

- `docs/nota/CUSTOMER_WOW_SPIKES_BACKLOG.md` — exists on disk per the handover's own
  verification section, contents not read by Cowork this session.
- Claimed "two new globally-installed skills" (Taste UX No-Slop, Brain to Docs Handover)
  from the chat transcript — not corroborated by the actual `docs/HANDOVER-2026-08-18-*.md`
  on disk, which only mentions one Gemini-config skill path. If a next session references
  these as installed, re-verify before trusting.
