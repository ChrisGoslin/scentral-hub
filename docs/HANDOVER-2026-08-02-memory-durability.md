# Handover — 2026-08-02 · Session-memory durability

> **ARCHIVED 2026-08-10 — provenance only; no standing authority.** State, counts,
> blockers, owners, and commands below describe the 2026-08-02 session. They are not a
> current task queue and do not authorize lock deletion, commits, rebases, pushes, branch
> deletion, shared configuration changes, or work in another product repository.

## Historical environment blocker (GL-6)

A **stale `.git/index.lock` is present** (0 bytes, created 2026-08-03 00:41). It blocks
every `git add`, `commit`, `rebase` and `status` for **every tool and every human** —
Claude Code, Codex, Gemini, and you — not just the session that made it.

Do not remove `.git/index.lock` based on this handover. Inspect the live lock and active
Git processes first; a current process may own it. A confirmed stale lock still requires
an explicitly scoped cleanup action.

Cause: this Cowork session ran `git status` against the mounted repo. `git status`
refreshes the index, which takes the lock — it is **not** a read-only command. The mount
denies `unlink`, so git could not clean up after itself (`warning: unable to unlink
'.git/index.lock': Operation not permitted`). Recorded as L59.

The related prompt pack is also archived and grants no execution authority.

---

**Environment blocker at authoring time:** none — the lock above was created later, by
this session's own verification pass.
**Cowork constraint (GL-5):** this session ran in Cowork; the mount denies `unlink`,
so **nothing here was committed at authoring time**. That historical fact does not
authorize running the old commit script now.

**Repo state at handover:** `main` is `[ahead 12, behind 4]` of `origin/main`.
Twelve commits of canon/design work from 2026-07-30 → 08-01 are **local only**.
This divergence claim is historical and must not drive a current Git action.

---

## Why this session happened

The 2026-08-02 session produced a handover doc and a branching workflow, both
written to `/home/claude/` and `/tmp/` — sandbox paths wiped at session end. It
also reported having appended a lesson to `docs/lessons.md`; that file's mtime is
2026-07-30 and no file in this repo was modified on 2026-08-02. The reported work
did not happen.

That prompted a full audit of why session memory keeps failing. The answer is not
"Cowork has no memory." It is four separate routing defects, listed below.

---

## Findings

### F1 — `branch-hygiene` already existed; the workflow doc was duplication
`.claude/skills/branch-hygiene/SKILL.md` (150 lines) already specifies sync →
duplicate-check → branch decision → naming → same-session merge → build gate →
e2e gate → branch delete, and cross-references `safe-commit-shared-repo` and
`repo-tidy`. The new workflow doc was a worse copy of a skill already in the repo.
`cowork-session-preflight` step 5 exists to catch exactly this and was not run.

**Action:** no new workflow doc. Two real gaps patched into the existing skill (F1a, F1b).

- **F1a — diverged main.** Step 4 ends `git push origin main` and assumes it
  succeeds. With `main` ahead 12 / behind 4 that push is rejected. The skill has
  no divergence branch.
- **F1b — environment blindness.** The skill prescribes `git add`/`commit`/`build`
  unconditionally, but under Cowork all three fail (GL-5). An agent following it
  from Cowork hits an opaque `EPERM`.

### F2 — GL-3 is marked "Resolved" but its remedy is not in place
`claude-global/LESSONS.md` records GL-3 as *"Resolved — 2026-07-29: `docs/index.md`
repointed external context to `~/Projects/claude-global/PROJECTS.md`."*

`docs/index.md` lines 30–33 still read:

```
- /Users/christophergoslin/.claude/PROJECTS.md
- /Users/christophergoslin/.claude/profile.md
- /Users/christophergoslin/.claude/CLAUDE.md
- /Users/christophergoslin/.claude/LESSONS.md
```

All four are unreachable from Cowork — the exact failure GL-3 documented. Commit
`3620406 docs(canon): fix stale routing pointers` (2026-08-01) touched `index.md`
but left this block intact. **Two remediation attempts, both recorded as done,
neither landing.**

**Action:** block rewritten to the reachable `claude-global/` paths.

### F3 — There are two global-instruction surfaces; only one was ever fixed
GL-3's remedy updated `~/.claude/CLAUDE.md`. But the **Cowork account-level
preferences** are a separate surface, and they still instruct the agent to read
canon from `~/.claude/`. Cowork cannot reach that path, so the instruction fails
silently every session and the agent starts ungrounded — then rediscovers the
same facts, which is the "wasted session" symptom.

**Action:** preferences replacement text below. Christopher must paste it; no
tool can write that surface.

### F4 — Skill trees have diverged badly across CLIs
```
scentral-hub/.claude/skills   29
scentral-hub/.agents/skills   11
scentral-hub/.gemini/skills   10
abundance/{.claude,.agents,.gemini}/skills   0, 0, 0
```
Twenty skills exist only in `.claude/` — including `branch-hygiene`,
`safe-commit-shared-repo`, `security-hardening`, `testing-framework`,
`qe-automation`. Codex and Gemini sessions run without them. Commits `3bea1c3`
and `951012e` show cross-tree sync is a known concern, yet the gap is 20 skills wide.

Separately, the account-level `frontend-design-consultant` and `alignment-sweep`
skills both state they read "each repo's own `.claude/skills/` at run time" for
nota. **and Abundance**. Abundance has no skills in any tree — that premise is
false for half their declared scope.

**Action:** flagged, not fixed. Copying 20 skills across two trees is a
Claude Code job (Cowork cannot delete, so it cannot safely reconcile). Tracked below.

### F5 — GL-5's own probe leaves undeletable litter
GL-5's remedy tells preflight to probe deletability with `touch x && rm x`. When
unlink is denied, the `touch` succeeds and the `rm` fails — leaving a permanent
file the session cannot clean up. This session created `.loop_probe` and cannot
remove it.

**Action:** probe corrected to test an **existing** throwaway path instead of
creating one. `.loop_probe` must be deleted by the commit script.

---

### F6 — `docs/lessons.md` has ten colliding lesson IDs
56 lesson headings, 46 unique. L26–L35 each appear twice with completely different
content (L29 is both "Preview/import features ship preview-first" and "Authoring for
a repo you have not opened"). Introduced by `c4de6f0 docs(lessons): add L29-L43`,
which appended a second series starting at L26 without checking the existing range.

Twenty citations across `alignment-sweep`, `repo-tidy`, `canon-slop-audit`,
`loop-orchestrator/references/engagement-scorecard.md`, the `.agents/` mirror and
`HANDOVER-2026-07-29` point at these IDs. Every one inspected resolves *by content*
to the **second** series — so the **first** (lines ~95–208) is the orphan and is the
one that must move.

**Action:** specified, not executed — see open item 7. A blind renumber from Cowork
would break the citations it exists to protect. Recorded as L47.

---

## Historical proposed first action

The authoring session proposed pasting the preferences block below. It is retained for
audit context only and is not an instruction to modify shared settings.

---

## Historical actions proposed to Christopher (do not execute from this document)

**1. Replace the first block of Cowork → Settings → Personal preferences:**

```
At the start of every session, before anything else: call
request_cowork_directory for ~/Projects, then run the
cowork-session-preflight skill.

Canon lives in ~/Projects/claude-global/ — CLAUDE.md, PROJECTS.md,
LESSONS.md, profile.md. NOT ~/.claude/, which is unreachable from Cowork
and holds only projects/ and skills/.

Cowork authors; Claude Code verifies. Cowork cannot delete files, so it
cannot commit and cannot clean up after git (GL-5). From Cowork the ONLY
permitted git commands are the non-index reads: log, show, rev-list,
ls-files, cat-file, branch --list. NEVER git status, git diff against the
worktree, add, commit, stash or rebase — they take .git/index.lock and
strand it, blocking every tool in the repo for everyone (L59, GL-6).
Repo-state verification is delegated to Claude Code, not attempted here.

Session handovers are repo artifacts: <repo>/docs/HANDOVER-<date>-<topic>.md,
committed. Never /tmp or /home/claude — both are wiped. If it isn't
committed, it didn't happen.
```

**2. Historical commit proposal:** do not run `docs/todo/commit-2026-08-02.sh` from
this handover. Inspect live state and define a new explicit-path commit scope instead.

**3. Historical divergence proposal:** re-measure the branch before any separately
authorized Git operation; the old ahead/behind figures are not current evidence.

---

## Historical open-item ledger (closed as an authority surface)

| # | Item | Owner | Notes |
|---|---|---|---|
| 1 | Paste preferences block | Historical proposal | Requires a fresh shared-settings task |
| 2 | Commit files; remove `.loop_probe` | Historical proposal | No commit or deletion authority remains |
| 3 | Reconcile historical branch divergence | Historical proposal | Re-measure and obtain fresh authority |
| 4 | Classify and sync skills across repositories | Historical cross-silo proposal | Do not execute from nota. |
| 5 | ABunDance skill strategy | Historical cross-silo proposal | ABunDance is a separate product silo |
| 6 | Delete stale local branch | Historical proposal | No branch-deletion authority remains |
| 7 | Renumber the **orphan** L26–L35 series → L48–L57 | Claude Code | F6/L47 — spec below |
| 8 | Mirror `alignment-sweep` into account-level configuration | Historical AI Ops proposal | Requires a fresh AI Ops task |
| 9 | Add canon-integrity checks to `.husky/pre-push` | Historical proposal | Re-verify current hook before any change |
| 11 | Sync out-of-tree `alignment-sweep` copies | Historical AI Ops proposal | No out-of-tree authority remains |
| 12 | Widen sweep scope to Household Finance | Historical cross-silo proposal | Do not execute from nota. |
| 13 | Consolidate GL-3/GL-7/GL-8/GL-10 + the five-copy finding into one rule | Christopher (§5 change control) | They are one rule: *verify the copy that actually executes*. `LESSONS.md` is 82 lines against CLAUDE.md's 30-line cap — appending a sixth entry is the wrong fix |
| 10 | Consolidate `claude-global/LESSONS.md` (78 lines vs CLAUDE.md's stated 30-line cap) | Christopher + Claude Code | CLAUDE.md §4 requires consolidating recurring lessons into rules via §5 change control |

The associated prompt pack is archived. Its prompts may explain prior intent, but they
must not be pasted or executed as current instructions.

`cowork-session-preflight` (open item from the loop) is **done** — saved to the account
2026-08-02 with the GL-8 two-surface check, a non-destructive capability probe fixing
GL-5's litter defect, a Resolved-lesson re-check for GL-7, all-tree duplication checking
for L46, and a new anti-pattern forbidding `Enforced by:` claims for mechanisms that were
never built.

### Open item 7 — renumbering spec (do not improvise)

1. The **first** series (`docs/lessons.md` lines ~95–208) is the orphan. The
   **second** (line ~220+, from `c4de6f0`) is what all twenty citations resolve to
   by content. Move the **first**, never the second.
2. Confirm before editing:
   ```bash
   grep -rnoE '\bL(2[6-9]|3[0-5])\b' docs .claude .agents .gemini AGENTS.md CLAUDE.md \
     | grep -v 'docs/lessons.md:'
   ```
   Read each hit and confirm it matches second-series *content*. If any resolves to
   the first series, stop — the orphan assumption is wrong.
3. Renumber first-series L26→L48 … L35→L57. L45–L47 are taken.
4. Assert afterwards: unique IDs == total headings (`alignment-sweep` Pass 6 addendum).

---

## Verification status of this document

- **Verified** (command output in-session): unlink denial, index.lock clear, skill
  tree counts, branch divergence, `index.md` contents, `lessons.md` mtime, absence
  of 2026-08-02 file modifications, `branch-hygiene` contents.
- **Reviewed, not verified**: that the patched `branch-hygiene` steps run clean —
  Cowork cannot execute `npm run build` or git index operations. First Claude Code
  session must re-verify.
