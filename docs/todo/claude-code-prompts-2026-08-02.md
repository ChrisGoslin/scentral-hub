# Claude Code prompt pack — 2026-08-02 durability handoff

Paste these into Claude Code **in order**. Prompt 0 is the verification gate: if it
fails, stop and fix before running 1–5. Each prompt is self-contained.

Context for all prompts: `docs/HANDOVER-2026-08-02-memory-durability.md`.

## ⛔ Before any prompt below

```bash
rm -f ~/Projects/scentral-hub/.git/index.lock
```
A stale 0-byte lock was stranded by a Cowork `git status` (see L59). Every git command
is blocked for every tool until it is removed.

## Corrections since authoring — read these

- **Prompt 3 (lesson renumbering) has already been run.** The orphan series is now
  L48–L57; the cited L26–L35 series is intact. Verified: 59 headings, 59 unique IDs.
  **Skip Prompt 3.** Re-verify integrity rather than re-running it.
- **Prompt 1 has been split** into Prompt 1 (commit only, creates a recovery ref, ends
  in a mandatory stop) and Prompt 1b (rebase/push, separately gated). The original
  bundled reversible and irreversible work in one block — see L58.
- **The `[ahead 12, behind 4]` figure is unverified.** It came from a sandbox that could
  not `git fetch`. Prompt 1b re-measures it rather than trusting it.
- **No risk-tier system exists in canon.** `PROJECTS.md` defines no tiers for nota.; its
  only rule is *"Read repository-level `CLAUDE.md` and `AGENTS.md` before starting any
  work."* The sole "Tier" string in the repo is `AGENTS.md:11`, describing launch
  phases. If a risk tier is wanted, it must be added to `PROJECTS.md` deliberately —
  not inferred.

---

## Prompt 0 — Independent verification (RUN FIRST)

> You are verifying another agent's work, not extending it. Be adversarial. The
> session that produced this ran in Cowork, which cannot delete files, cannot run
> `git`, and cannot run `npm run build` — so **nothing below was executed against a
> build**. Treat every claim as unverified until you prove it.
>
> Read `docs/HANDOVER-2026-08-02-memory-durability.md`, then verify each claim and
> report **Verified / Unverified / False** per line. Do not fix anything yet.
>
> 1. `docs/index.md` "External Context" cites only reachable `~/Projects/claude-global/`
>    paths, and no `~/.claude/*.md`.
> 2. `claude-global/LESSONS.md` contains GL-7 and GL-8; `docs/lessons.md` contains
>    L45, L46, L47. Each has all four fields (What happened · Rule · Remedy built in ·
>    Enforced by).
> 3. **Every `Enforced by:` in GL-7, GL-8, L45, L46, L47 names a mechanism that
>    actually exists and runs where claimed.** This is the highest-risk item — the
>    prior session wrote four false `Enforced by` claims and caught them only on a
>    self-review pass. Open each named file and confirm.
> 4. `alignment-sweep` contains an "Integrity assertions — added 2026-08-02" block in
>    **all three** trees (`.claude`, `.agents`, `.gemini`), byte-identical.
> 5. `repo-tidy` contains step 7 (lesson-ID integrity) in all three trees.
> 6. `branch-hygiene` has Step 0 (capability probe) and a diverged-main section, and
>    the Step 0 probe does **not** create a file it cannot remove.
> 7. Run every bash snippet added to those skills verbatim. Report actual output.
>    Expected: lesson-ID check reports 10 duplicates; tree counts 29/11/10.
> 8. `bash -n docs/todo/commit-2026-08-02.sh` passes and every path in its `PATHS`
>    array exists.
> 9. **Run `npx tsc --noEmit` and `npm run build`.** Cowork could not. Confirm this
>    session's edits (all markdown/shell) broke nothing.
>
> Then state one overall verdict: SAFE TO COMMIT / DO NOT COMMIT — with reasons.

---

## Prompt 1 — Commit only (local, reversible)

> **Do not run this until you have pasted Prompt 0's verdict and it reads
> SAFE TO COMMIT.** If it reads DO NOT COMMIT, stop and report.
>
> This prompt is deliberately scoped to local, reversible work. It does **not**
> rebase, push, or delete anything. That is Prompt 1b, after a checkpoint exists.
>
> 1. Create a recovery ref before touching anything. This makes every later step
>    reversible with a single command, and costs nothing:
>    ```bash
>    git branch backup/pre-durability-2026-08-02 main
>    git rev-parse --short backup/pre-durability-2026-08-02   # note this SHA
>    ```
> 2. Run `bash docs/todo/commit-2026-08-02.sh`. It prompts before touching the
>    index and commits by explicit pathspec only.
> 3. `git show --stat HEAD` — confirm only the intended paths landed.
> 4. Confirm `.loop_probe` is gone (Cowork created it and could not remove it).
> 5. **Stop here.** Report the commit SHA and the backup SHA. Do not push.

---

## Prompt 1b — Reconcile main (RISKY — separate gate on purpose)

> Prerequisite: Prompt 1 complete, `backup/pre-durability-2026-08-02` exists.
>
> The Cowork session reported `main` as `[ahead 12, behind 4]`, but that reading
> came from **stale tracking data in a sandbox that could not fetch**. Treat the
> "behind 4" as unverified. Establish the real state yourself before acting:
>
> ```bash
> git fetch --all
> git rev-list --left-right --count origin/main...main   # behind<TAB>ahead
> git log --oneline main..origin/main                    # what is actually upstream
> git diff --name-only main...origin/main | sort > /tmp/remote.txt
> git diff --name-only origin/main...main | sort > /tmp/local.txt
> comm -12 /tmp/remote.txt /tmp/local.txt                # true conflict surface
> ```
>
> Decide from that output, not from this document:
> - **behind 0** → fast-forward push, no rebase needed. Preferred outcome.
> - **behind N, empty overlap** → rebase is low-risk. Proceed.
> - **behind N, non-empty overlap** → **stop and report the overlapping files.**
>   Twelve local commits over a contested surface is not a blind-rebase situation.
>
> If you proceed:
> ```bash
> git pull --rebase origin main
> npm run build     # MANDATORY — a rebase can produce a broken tree neither side had
> git push origin main
> ```
> Never `push --force`. If the rebase conflicts, abort (`git rebase --abort`) and
> report — do not resolve blind. A mis-resolved rebase silently discards a concurrent
> session's work, the exact failure `safe-commit-shared-repo` exists to prevent.
>
> Recovery at any point: `git reset --hard backup/pre-durability-2026-08-02`.
>
> Finally, the stale branch. It **is** merged into main (verified), so `-d` is safe
> and will refuse if that ever stops being true — never use `-D`:
> ```bash
> git branch -d integration/homepage-brand-and-fixes
> ```

---

## Prompt 2 — Skill tree parity (handover item 4)

> `scentral-hub` skill trees have diverged: `.claude/skills` 29, `.agents/skills` 11,
> `.gemini/skills` 10. Twenty skills exist only under `.claude/` — including
> `branch-hygiene`, `safe-commit-shared-repo`, `security-hardening`,
> `testing-framework`, `qe-automation`. Codex and Gemini sessions currently run this
> repo with no branch discipline and no shared-repo commit safety loaded. See
> `docs/lessons.md` L46.
>
> For each of the 20: decide **port** or **deliberately Claude-only**, and say why.
> Port the ones that encode safety or repo rules. Do not bulk-copy — some may
> legitimately be Claude-specific (e.g. `claude-in-chrome-bridge-diagnostics`).
> Record the deliberate exclusions in `.claude/skills/README.md` so the next
> divergence check doesn't re-flag them.
>
> Then verify parity:
> `for d in .claude .agents .gemini; do echo "$d: $(ls $d/skills | wc -l)"; done`

---

## Prompt 3 — Lesson-ID collision (handover item 7)

> `docs/lessons.md` has 57 lesson headings but 47 unique IDs. L26–L35 each appear
> **twice with completely different content**. See L47 and handover item 7 for the
> full spec — follow it exactly, it has a citation-safety constraint that matters.
>
> Summary: the **first** series (lines ~95–208) is the orphan; the **second**
> (line ~220+, from commit `c4de6f0`) is what all twenty external citations resolve
> to by content. Renumber the **first** series to L48–L57. L45–L47 are taken.
>
> Before editing, run the citation check in the spec and confirm every hit resolves
> to second-series content. **If any resolves to the first series, stop** — the
> orphan assumption is wrong and renumbering would silently retarget live references.
>
> Afterwards assert: unique IDs == total headings.

---

## Prompt 4 — Abundance skills decision (handover item 5)

> `~/Projects/abundance` has **zero** skills in `.claude/`, `.agents/` and `.gemini/`.
> But two account-level skills — `frontend-design-consultant` and `alignment-sweep` —
> both declare that they read "each repo's own `.claude/skills/` at run time" for
> nota. **and Abundance**. That premise is false for half their declared scope.
>
> Two options, recommend one:
> - **(a)** Seed Abundance with the subset that applies (branch/commit safety,
>   grounding guardrails), adapted to its constraints — local-only, local Postgres,
>   no public Vercel deploy, protect the €1,000/month savings target (`PROJECTS.md`).
> - **(b)** Narrow both skills' declared scope to nota. only, and state that Abundance
>   is governed by `AGENTS.md` alone.
>
> Do not do both. Whichever you pick, the skill descriptions and the repo state must
> agree afterwards.

---

## Prompt 6 — Sync the two out-of-tree `alignment-sweep` copies (DO THIS EARLY)

> `alignment-sweep` exists in **five** places. Three (`.claude`, `.agents`, `.gemini`)
> were updated on 2026-08-02 with an integrity-assertions block and a scope correction.
> Two were not, because they live outside `~/Projects` and a Cowork session cannot see
> them:
>
> - `~/Claude/Scheduled/monthly-alignment-sweep/SKILL.md` — **the only copy that runs
>   unattended** (day 1 monthly). It ran 2026-08-01 and caught none of this session's
>   findings, because it lacks the checks that would have found them.
> - The Cowork account-level skill.
>
> Both have a shorter, divergent base (127 lines vs 251). **Append, never overwrite.**
> The exact blocks and the append command are in
> `docs/todo/alignment-sweep-addenda-2026-08-02.md`.
>
> After syncing, confirm all five carry the block, and report which of the five you
> could not reach. Then trigger one manual sweep run and check it now reports: the
> ten duplicate lesson IDs (if Prompt 3's renumber has not landed), the `.claude`-only
> skill divergence, and the missing `household-finance/docs/lessons.md`.
>
> If a sweep run reports zero findings, treat that as a failure of the sweep, not a
> clean bill of health — verify it is reading the file you just edited.

---

## Prompt 5 — Promote canon checks into the pre-push hook (the safety net)

> `.husky/pre-push` already encodes lessons L15 and L16 as **involuntary** checks that
> block a push to main. That pattern works and is the only enforcement in this repo
> that does not depend on an agent choosing to invoke a skill.
>
> Extend it with three canon-integrity checks. Keep the existing fast-path budget
> (~15–20s) — these are all `grep`, sub-second.
>
> 1. **Lesson-ID integrity** (L47) — block if `docs/lessons.md` has duplicate IDs:
>    ```sh
>    u=$(grep -oE "^### L[0-9]+" docs/lessons.md | sort -u | wc -l)
>    t=$(grep -cE "^### L[0-9]+" docs/lessons.md)
>    [ "$u" -eq "$t" ] || { echo "❌ $((t-u)) duplicate lesson IDs"; FAILED=1; }
>    ```
> 2. **Dead canon pointers** (GL-3, GL-7) — block if any doc under `docs/` cites
>    `~/.claude/*.md` or `/Users/*/.claude/*.md`. Those paths are unreachable from
>    Cowork and have silently broken grounding twice.
> 3. **Skill tree parity** (L46) — warn (do not block) if `.claude/skills` contains a
>    skill absent from `.agents/skills` or `.gemini/skills`, excluding anything listed
>    as a deliberate exclusion in `.claude/skills/README.md`.
>
> Follow the existing hook's structure: accumulate failures, print all of them, exit 1
> once at the end. Only run on pushes to `main`, as it already does.
>
> Then **test it deliberately**: introduce a duplicate lesson ID in a scratch commit,
> confirm the push is blocked, revert. A hook that has never been observed failing is
> an untested hook.
