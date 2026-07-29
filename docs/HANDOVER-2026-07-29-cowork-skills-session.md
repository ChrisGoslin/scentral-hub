# Handover — 2026-07-29 Cowork session (front-end consultant + drift tooling)

**Status:** work complete and verified. **Nothing committed** — blocked, see below.
**Branch:** `main`, in sync with `origin/main` (0 ahead / 0 behind at session end).

---

## 🚨 BLOCKER — stale git lock, must be cleared on your Mac

```
.git/index.lock  — 0 bytes, dated 2026-07-27 22:25, no live git process
```

A git process crashed two days ago and left the lock. **Every index operation in this repo is currently blocked** — `git add`, `git commit`, `git stash`, `git rebase`. This affects Claude Code, Codex, Gemini, and you, not just this session.

I could not remove it: the Cowork sandbox mounts your folder with `unlink` denied, so `rm` fails with `EPERM`. This must be run by you, locally:

```bash
cd ~/Projects/scentral-hub
rm -f .git/index.lock
git status --short          # should now work normally
```

**Also delete this stray file I created while probing the mount restriction** (same `unlink` reason — I couldn't remove it myself):

```bash
rm -f .next-write-test
```

---

## What was done (all verified, none committed)

### New skills — present in all three CLI trees, byte-identical
| Skill | Purpose |
|---|---|
| `alignment-sweep` | Monthly read-only whole-system drift check. 8 passes: grounding · canon-vs-code · retired assets · skill divergence across `.claude`/`.agents`/`.gemini` · routing chains · doc freshness · canon-slop · uncommitted canon. Reports, never edits. |
| `canon-slop-audit` | Asks whether canon *itself* has gone generic. Requires dated external evidence. Produces a memo; never edits canon. |

### Modified skills
- **`repo-tidy`** — restored the retired-terms list clobbered by a global find/replace (defect flagged 2026-07-27, previously left unfixed). Added the `Scentiment` exception, the AGENTS.md §82 guardrail-list rule so it can't be re-clobbered, and a retired-font sweep per L35. Propagated to all three trees.
- **`loop-orchestrator`** — new §7 **Rate / Critique** engagement scorecard, plus `references/engagement-scorecard.md`. Triggers on `Rate`, `Critique`, `score this`, `how did we do`, `retro`. Dual-voice: solutions architect + non-technical client, leading with the **unprompted-defect-discovery ratio** (provider-found ÷ total corrections). Runs an adversarial pass over the session's own output before publishing.

### Docs
- **`docs/lessons.md`** — L29–L43 appended (117 lines, pure append, no deletions). Covers: authoring for an unopened repo · canon duplicated into tooling · rebuilding existing capability · treating user recollection as evidence · anti-slop rules asserted from taste · auditing doctrine not just code · retired assets still shipping · delivering outside the repo · three-CLI-tree propagation · violating a rule in the session that wrote it · untested infrastructure claims · the sandbox execution recipe · test gaps found by actually running the suite.
- **`~/Projects/claude-global/LESSONS.md`** — GL-1 to GL-4 (cross-project grounding failures + RCA).

### Cowork account skills (saved, outside this repo)
`cowork-session-preflight` (new, Definition-of-Ready gate) · `alignment-sweep` · `canon-slop-audit` · `visual-verification` · `frontend-design-consultant` (rebuilt pointer-based) · `nota-brand-manager` and `nota-customer-experience` (realigned to the chemist's-workshop direction; retired quiet-luxury framing removed) · `loop-orchestrator` (scorecard added).

### Scheduled
`monthly-alignment-sweep` — 1st of each month, 08:00 local. Recommend clicking **Run now** once to pre-approve its tools so it doesn't stall on permission prompts.

---

## Verification evidence — E2E run, this session

Run from a `/tmp` copy (see L42 for why and how). **Verified**, not merely reviewed:

```
build                 PASS
e2e chromium          35 passed / 7 skipped / 0 failed  (28.5s)
e2e Mobile Chrome     35 passed / 7 skipped / 0 failed  (28.0s)
unit                  17/17 PASS
lint                  0 errors / 81 warnings
```

**Two findings the green run exposed:**

1. **All 7 skipped specs are auth/data-gated** — including the entire `lens-filter-empty-state` suite, the only automated coverage of contextual empty states across shelf view modes. The screens `screen-state-completeness` cares most about are never exercised in CI.
2. **Tests fetch live upstream images** — repeated `429`s from `upload.wikimedia.org` during the run. The suite depends on a third party's rate limiter and will flake. Wants the `ABUNDANCE_FIXTURE_MODE` treatment from L26.

---

## Uncommitted files — mine vs not mine

**Mine — safe to commit** (script below):
```
 M .claude/skills/repo-tidy/SKILL.md          .agents/… .gemini/…
 M .claude/skills/loop-orchestrator/SKILL.md  .agents/… .gemini/…
 M docs/lessons.md                            (pure append, L29–L43)
?? .claude/skills/alignment-sweep/            .agents/… .gemini/…
?? .claude/skills/canon-slop-audit/           .agents/… .gemini/…
?? .claude/skills/loop-orchestrator/references/engagement-scorecard.md  + .agents/ .gemini/
```

**NOT mine — pre-existing from a concurrent session. Left untouched per `safe-commit-shared-repo`. Review before committing:**
```
 M CLAUDE.md                                              (+23)
 M docs/index.md                                          (+4 −5)
 M .claude/.agents/.gemini/skills/verify-cli-claims       (+13 −4)
 M .agents/skills/canonical-source-reconciler             (+1 −49)  ← large deletion, check intent
?? .gemini/skills/canonical-source-reconciler/
?? scripts/validate-project-standards.mjs
```

⚠️ `.agents/skills/canonical-source-reconciler` shows **49 lines deleted**. That's a big reduction someone made deliberately or accidentally — worth `git diff` before it goes in.

---

## Commit script — run after clearing the lock

Explicit pathspecs only, per `safe-commit-shared-repo`. Does not touch the other session's files.

```bash
cd ~/Projects/scentral-hub
rm -f .git/index.lock .next-write-test

# 1 — repo-tidy defect fix
git add .claude/skills/repo-tidy/SKILL.md .agents/skills/repo-tidy/SKILL.md .gemini/skills/repo-tidy/SKILL.md
git commit -m "fix(skills): restore repo-tidy retired-terms list across all three CLI trees

Step-1 legacy-terms list had been clobbered by a global rebrand find/replace,
leaving three identical 'nota.' entries and a step-2 instruction to replace
them *with* nota. Defect noted 2026-07-27, correctly left unguessed then.

Restored from NOTA-BRAND-UIUX-PACK.md s4 and nota-brand-manager doctrine.
Added the Scentiment exception and the AGENTS.md s82 guardrail-list rule so a
future find/replace cannot re-clobber it, plus the retired-font sweep (L35).

Propagated to .agents/ and .gemini/, verified byte-identical: the repo runs
three CLI skill trees which had silently diverged (L39)."

# 2 — new drift tooling
git add .claude/skills/alignment-sweep .agents/skills/alignment-sweep .gemini/skills/alignment-sweep \
        .claude/skills/canon-slop-audit .agents/skills/canon-slop-audit .gemini/skills/canon-slop-audit
git commit -m "feat(skills): add alignment-sweep and canon-slop-audit

alignment-sweep: monthly read-only whole-system drift check in one pass -
canon vs shipped code, retired assets still loading, skill divergence across
the three CLI trees, routing chains, doc freshness, uncommitted canon.
Classifies divergence as intentional specialisation / accidental drift /
stale copy before reporting, so deliberate layering is not 'fixed' away (L37).

canon-slop-audit: asks whether canon itself has gone generic, using dated
external evidence rather than taste (L33, L34). Produces a memo; never edits
canon - AGENTS.md s5a exists because DESIGN.md's body-sans flipped across
sessions with no record.

Scheduled monthly via Cowork task 'monthly-alignment-sweep'."

# 3 — engagement scorecard
git add .claude/skills/loop-orchestrator .agents/skills/loop-orchestrator .gemini/skills/loop-orchestrator
git commit -m "feat(skills): add Rate/Critique engagement scorecard to loop-orchestrator

New s7 plus references/engagement-scorecard.md. Triggers on Rate, Critique,
score this, how did we do, retro.

Two mandatory voices: solutions architect scoring Discovery/Analysis/
Implementation/Review/Output, and the client - non-technical, dependent on
provider expertise to find defects. Leads with the unprompted-defect-discovery
ratio (provider-found / total corrections), because the measure of value is
not whether work ended up correct but how much correctness the client had to
enforce. Rebuilds cap the Implementation score.

Ends with an adversarial pass over the session's own output before publishing
- prompted by this session writing L39 and violating it 30 minutes later."

# 4 — lessons
git add docs/lessons.md
git commit -m "docs(lessons): add L29-L43 from the Cowork consultant session

Grounding failures (authoring for an unopened repo, canon duplicated into
tooling, rebuilding existing capability, treating user recollection as
evidence), anti-slop rules asserted from taste, auditing doctrine rather than
only code, retired assets still shipping, three-CLI-tree propagation, a rule
violated in the session that wrote it, untested infrastructure claims, the
sandbox execution recipe (L42, saves ~40 min), and two live test gaps found
by actually running E2E (L43).

Every entry carries Remedy built in and Enforced by; each named mechanism was
checked to resolve to something that actually runs."

git log --oneline -4
```

**Push** — not done, needs your call. `main` pushes likely trigger a Vercel production deploy. These are docs/skills only (no app code), so functionally a no-op, but it is still a deploy:

```bash
git push origin main
```

---

## Open items, ranked

| # | Item | Owner |
|---|---|---|
| 1 | Clear `.git/index.lock`, delete `.next-write-test`, run the commit script | Christopher |
| 2 | Review the 6 not-mine uncommitted files — especially the −49 line deletion in `canonical-source-reconciler` | Christopher |
| 3 | **Geist decision.** Canon names it the 90% body face; 2026 evidence places it in the AI-startup typeface cluster, conflicting with brand pack §14/§15. Run `canon-slop-audit` for the full memo. | Christopher |
| 4 | **5 retired fonts still ship** — Unbounded, Space Grotesk, Caveat (`app/layout.tsx`, `globals.css`), Cormorant Garamond (`globals.css`, `WearAndShareClient.tsx`), Satoshi (`globals.css`) | dev |
| 5 | Seed auth/data fixtures so the 7 skipped E2E specs actually run | dev |
| 6 | Stub `upload.wikimedia.org` in tests to remove the external-flake dependency | dev |
| 7 | `visual-verification` still never run against a rendered nota screen | next session |
| 8 | Abundance doctrine unreconciled against its shipped `globals.css` and the real `PROJECTS.md` constraints (local-only, no public deploy, €1,000/month target) | next session |
| 9 | Fix routing: `docs/index.md` External Context → superseded stub; `~/.claude/*.md` cited as source of truth but absent; global instruction points at unreachable `ai-studio` | Christopher |
| 10 | No PostHog events proposed for any of this session's work (L7 unmet) | next session |

---

## Session self-assessment

Delivered via the new scorecard. Provider **5/10**, client **4/10**. Unprompted-defect-discovery ratio was poor: every material correction in the engagement originated from Christopher, not from me. Roughly 40% of spend was rework on work that should never have been produced — two design-token systems, a brand doctrine, personas, a prompt pack and 17 hard rules were all authored before either repo was opened, and all binned.

Root cause was not missing documentation. The canon was correct and reachable the whole time; the folder was simply never mounted, and no gate blocked output without it. `cowork-session-preflight` is the fix and now runs at account level, where it can fire before any folder exists.
