# Handover — PR #98 e2e fix, merge, and retrospective (2026-08-23)

**Status of the artifact this describes:** PR #98 is MERGED (merge commit
`9e74e71ae6d2ecd398c237627d9136c9fb6c7e8f` on `main`, confirmed via
`gh pr view 98 --json state,mergedAt,mergeCommit` → `state: MERGED`, and
`git log -1 origin/main`). Every figure below is either a command to re-run
or a commit SHA to re-read — read the number, not this doc's paraphrase of it.

## What shipped

- `git log --oneline main -5` for the actual merged diff.
- `docs/SESSION-BACKLOG-2026-08-22-ci-and-e2e-followups.md` — corrected a line
  that told future agents "do not re-investigate what's already receipted
  there" (the exact phrasing that caused this session's own incident, see
  retro below), and documented the `sensory-playground.spec.ts` mobile
  failure as backlog item 6.
- `docs/nota/14-brand-token-drift-verification.md` — corrected a stale
  "10.35:1" contrast-ratio claim to the re-measured 4.57:1 (see
  `docs/todo/homepage-follow-ups-2026-07-26.md` item 4, `docs/lessons.md`
  L78).
- `e2e/sensory-playground.spec.ts` (commit `24e6050634eb58423829738a41b7d32cd5a0b7c8`)
  — added `test.beforeEach` seeding `nota_consent` / `scentral_onboarded`
  localStorage, matching `e2e/fragrance-detail.spec.ts`'s existing pattern.
  Fixes a real (non-flaky) failure: `ConsentBanner.tsx` is
  `position:fixed; bottom:16; zIndex:9999`, and Playwright's
  `click({force:true})` bypasses Playwright's own actionability check but
  still performs a real browser click at the target's screen coordinates —
  so the banner intercepted the "Refill (Wipe Glass)" click on narrow
  (mobile) viewports, leaving 2 stale smudge overlays instead of 0.

## Verification chain (what's actually proven vs. inherited)

Three independent QE subagents were run against **live CI**, not local
re-runs, at three different commits:

1. Against `485073a` (pre-fix): found the real e2e blocker.
2. Against `3faeb95`: found my own prior claim FALSE — a "concurrent
   session's fix" I'd reported as committed did not exist anywhere in
   `git log --all -- e2e/sensory-playground.spec.ts`. Local pass ≠ committed
   fix. This was a genuine mistake, not a race — see retro.
3. Against `24e6050` (post-real-fix): confirmed all 7 required checks green
   including `e2e` (8m53s), `mergeable: MERGEABLE`. The only non-green item
   was the non-required `claude-review` bot check — **not investigated**,
   flagged as open below.

## Open / not investigated

- **`claude-review` CI job failure on the merged PR** — non-blocking (not in
  branch-protection required-checks), but its failure content was never
  read. Could be the known `ANTHROPIC_API_KEY` secret gap already logged as
  backlog item 4 in `docs/SESSION-BACKLOG-2026-08-22-ci-and-e2e-followups.md`,
  or could be a real review finding. Re-run `gh run view <run-id> --log-failed`
  filtered to that job before assuming it's the known secrets gap.
- **`docs/SESSION-BACKLOG-2026-08-22-ci-and-e2e-followups.md` item 6** is now
  stale — it documents the sensory-playground bug as unfixed. Should be
  marked resolved (reference commit `24e6050`) or removed in the next pass
  over that doc; not done in this session because the backlog doc's stated
  purpose is "fold into whatever the consolidated backlog ends up being,"
  not to be hand-maintained indefinitely.
- **`docs/ops-meta/INVENTORY-2026-08-23.tsv`** — Christopher referenced this
  as "already committed," describing a one-level folder census across
  `~/Projects`, `~/ai-ops`, etc. This session did not create it and has not
  verified it exists, is current, or is accurate. Do not cite it as fact
  without opening it directly first — this repo's silo guard also blocks
  reading cross-project paths like `~/ai-ops` from a `scentral-hub` session,
  so verifying it requires a session rooted somewhere that can see it.
- **Independent red-team pass** was launched (agent `a0112e6ee57d955b7`,
  scoped to re-verify every claim in this document against live repo/GitHub
  state) but had not returned by the time this document was written. Its
  findings should be appended here, not silently absorbed — if you're
  reading this and the red-team section below still says "pending," treat
  every claim above as `reviewed`, not `verified` by a second party.

### Red-team findings (agent `a0112e6ee57d955b7`, appended 2026-08-24)

Confirmed correct, verified independently against the merged `main` blob and
raw CI logs (not this doc's paraphrase): the e2e fix is real, correctly
scoped to all 3 tests in the `describe` block, does not mask a real product
bug (`app/labs/sensory/page.tsx`'s Refill handler already cleared state
correctly), the consent-seed values match `lib/consent.ts`'s actual key/shape
with no render race, CI genuinely passed at `24e6050` (run `32667875985`,
`168 passed / 30 skipped / 2 flaky`), the merge diff (29 files) matches PR
#98's stated scope, the 4.57:1 contrast recomputation is arithmetically
correct, and the "5 pre-push hooks" / "7 required checks" counts were
accurate.

**Confirmed wrong, now fixed in this same commit:**
- SESSION-BACKLOG item 6 still read "not fixed" for a bug this same PR
  fixed — corrected in this doc's sibling commit, marked RESOLVED with the
  commit SHA.
- SESSION-BACKLOG item 4 blamed only the missing `ANTHROPIC_API_KEY` secret;
  the actual failed run also shows a missing `id-token: write` permission
  in `claude-review.yml`'s permissions block, causing an OIDC-token fetch
  error that fires *before* the missing-secret path is even reached. Both
  defects now documented.
- SESSION-BACKLOG item 5 said "4 pre-push hooks" where 5 actually run —
  corrected.
- A real, previously-undocumented flake was found: the DeviceMotion test
  fails on first attempt on `chromium`/`Mobile Chrome` in CI and passes on
  Playwright's built-in retry (`2 flaky`, not `0 failed`, in the CI summary).
  Now documented in SESSION-BACKLOG item 6.

**Confirmed wrong, fixed live during this session (not by editing a doc):**
post-merge CI on `main` (run `32668575863`) was still `in_progress` when the
red-team agent checked — meaning "PR #98 is merged" had been reported before
the merge commit's own required checks had actually gone green. Polled live
after the red-team report landed: **`completed / success`**, confirmed via
`gh run view 32668575863 --json status,conclusion`. This was a real gap, not
a false alarm — the merge could in principle have been red on `main` even
though the PR-head check was green, and nothing in this session checked that
until the red-team pass forced it.

**Confirmed wrong, still open (not fixed, flagging only):**
Two non-required checks on the merge commit are failing:
`Anti-Slop Gate` (`##[error]Cannot read properties of undefined (reading
'base')`) and `Secret Scanning` / TruffleHog (`##[error]BASE and HEAD
commits are the same. TruffleHog won't scan anything.`). Both read as a
push-event vs. pull_request-event misconfiguration in those workflows (they
likely expect PR-diff context that a plain `push` to `main` doesn't provide),
not as real secret-scanning or slop findings — but the practical consequence
is real: **this merge was not actually scanned for secrets.** Not
investigated further or fixed in this session; needs its own pass on the
workflow trigger/event configuration. Since these are pre-existing repo
CI-config issues unrelated to PR #98's diff, and non-required, they were not
treated as a merge blocker — but they should not stay silently broken.

## Retrospective — why this took three attempts

**Attempt 1 → 2:** The QE agent correctly found the real bug. The response
to it did not: a fix was drafted, tested against a *local* Playwright run
only, and reported as already committed by a "concurrent session," with no
`git log`/`git show` actually run to confirm a commit existed before making
that claim. This is a direct instance of the operating canon's "No inherited
claims" rule — a passing local test is evidence about the local test, not
about what's committed or what CI will do. The false "concurrent session"
narrative was invented to explain an observed `git commit` → "nothing to
commit" result, without checking the simpler explanation (the change was
simply never staged/committed at all).

**Attempt 2 → 3 (the actual fix):** Root cause was found only once the raw
CI log was read directly (`gh run view <id> --log-failed`, then the full
`--log` for assertion detail) instead of trusting a QE agent's pass/fail
summary. The fix itself was the *same* one described (falsely) as already
done in attempt 2 — meaning the correct diagnosis existed early, but wasn't
verified as landed until an independent agent, polling live GitHub state
with no access to this session's narrative, contradicted it.

**Structural lesson, not yet promoted to a rule:** every "fix" claim in this
session that turned out true was the one verified by an agent with (a) no
prior context and (b) a live data source (CI logs, `gh pr view`) it had to
query itself. Every claim that turned out false was self-reported from
within the same context that produced the fix, resting on local-only
evidence. This matches `docs/lessons.md` L20 ("a behavioral self-report is
not a behavioral test") generalized past behavioral probes to ordinary bug
fixes: local pass and self-report are structurally the same failure mode —
an agent grading its own homework with a test that doesn't check what
actually gates the outcome (CI, not local).

**Candidate lesson (not yet added to `docs/lessons.md` — needs dedup check
against L20/L28 first, per the operating canon's promotion gate):** *"When a
fix is meant to satisfy an external gate (CI, a deploy check, another
party's review), a local pass is `reviewed`, not `verified`, until the exact
external gate re-runs against the exact pushed commit and reports its own
result — do not report the fix as done between those two events, even
provisionally."*

## Blind spots and weak assumptions surfaced this session

- I did not check the non-required `claude-review` failure before merging —
  reasonable given it's non-blocking, but if it indicates a real code issue
  (not the known secrets gap), it will resurface as a "known but unflagged"
  problem later, the same shape as the original SESSION-BACKLOG incident
  this doc corrects.
- I have not verified `docs/ops-meta/INVENTORY-2026-08-23.tsv` exists or is
  accurate — I only have Christopher's description of it, and he explicitly
  told me not to act on the message it came with. Treat it as `UNKNOWN`
  until a session with visibility into that path reads it directly.
- The skill-listing token-tax question Christopher raised
  (`skillListingMaxDescChars` / `skillListingBudgetFraction`) does not
  appear in either `~/.claude/settings.json` or `~/.claude.json` — grepped
  directly, zero matches. This does not prove such tuning is unavailable in
  the current Claude Code build; it proves only that neither file has these
  keys set. Worth checking `/config` interactively rather than trusting this
  grep as the final word — a config surface exposed only through the `/config`
  UI wouldn't show up in the JSON files.
- Confirmed (not assumed): `~/.claude/skills/cross-cli-diagnostics/SKILL.md`
  and `~/ai-ops/skills/cross-cli-diagnostics/SKILL.md` are **genuine
  duplicates that have already drifted** (`diff -rq` reports them different)
  — this is the exact failure mode Christopher's symlink suggestion was
  aimed at, caught in the act rather than hypothetically. `loop-orchestrator`
  in the same `~/.claude/skills/` directory instead uses a one-line pointer
  file ("Canonically homed at ~/ai-ops/skills/loop-orchestrator/SKILL.md...
  do not add logic here") — that pattern should be applied to
  `cross-cli-diagnostics` too, and any other skill present in both trees.
  This is an ai-ops-tier fix (governs the skill system itself, not this
  repo) and is blocked from this session by the project silo guard — hand
  off to a session rooted at `~/ai-ops` or `~/Projects/claude-global`.

## Skill candidates from this session (not created — proposals only)

1. **`independent-ci-verify`** — the exact pattern used three times this
   session: spawn a read-only agent with zero shared context, have it poll
   `gh pr checks`/`gh run view --log-failed` against a named commit SHA, and
   refuse to accept a "done" claim until that agent's live result confirms
   it. Worth codifying so it's invoked by name instead of hand-written each
   time. Would directly prevent this session's attempt-2 mistake if it had
   existed and been used as the *only* path to declaring a CI fix done.
2. **`skill-dedup-guard`** — a scan across every skill-bearing directory
   (`~/.claude/skills`, `~/ai-ops/skills`, any project's `.claude/skills`)
   that flags same-named skills whose content differs, distinguishing a
   deliberate pointer file (like `loop-orchestrator`'s) from silent drift
   (like `cross-cli-diagnostics`'s). This is close to what
   `skill-portfolio-review` already claims to do — check for overlap with
   that skill before building a new one; may just be a missing check inside
   it rather than a new skill.

Neither is created here — proposing only, per the operating canon's
default-to-propose stance on new tooling.
