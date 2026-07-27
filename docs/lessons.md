# lessons.md — embedded lessons

Append-only. Each entry: what happened, the rule it becomes, how it's enforced. The point is that a rule with no enforcement mechanism is a wish.

---

## 2026-07 — nota. The Read implementation review

Context: designed and converted "The Read" (onboarding scent-identity reveal) from Grimoire → HTML → React → repo, then self-audited as PO+architect. The craft was strong; the product discipline was weak. Seven lessons, each with a trigger and a guard.

### L1 — Read the existing codebase BEFORE building anything
**What happened:** Built a full React suite (`CeremonyProvider`, `TheReadCanvas`, `IdentityReveal`) before cloning the repo, then found a fuller shipped system (`ReadClient.tsx`) already existed. Wasted work; nearly landed a worse duplicate.
**Rule:** For any change to an existing product, the first action is to read the relevant repo surface. No component is authored until the current implementation is understood.
**Enforced by:** `implementation-preflight` skill, gate 1. Ask for repo access up front.

### L2 — A screen is not done until every state is designed
**What happened:** Every Read artifact assumed a successful reveal. No loading, empty, error, or "miss" state — despite doctrine explicitly requiring "The Read missed. That's on us."
**Rule:** No screen ships without its full state matrix: loading · empty · error · success · **plus the product-specific trust state** (for nota.: the "you misread me" recovery). Happy-path-only is an incomplete deliverable, not a draft.
**Enforced by:** `screen-state-completeness` skill (authored from this review).

### L3 — Guard the brand's load-bearing mechanism first, theatre second
**What happened:** Built the reveal's ceremony and animation but omitted the reaction loop (✅ feels like me / 😅 close / ❌ not quite) — the single most important trust mechanism on the screen.
**Rule:** Identify the one element that carries the screen's *target emotion* (recognition, trust, ownership…) and build it first. Polish serves it; it never substitutes for it.
**Enforced by:** `screen-state-completeness` + the nota-customer-experience emotion-map review.

### L4 — Don't commit the violation you were hired to catch
**What happened:** Opened the engagement flagging others' misuse of the dot as decoration, then used olive dots as decorative bullets in my own specimen table.
**Rule:** Before delivering, re-run the brand's own hard-rule checklist against your own output, not just the input you reviewed.
**Enforced by:** self-review step in `implementation-preflight`; run the brand hard-rules over the diff.

### L5 — "Verified" means it compiled, not that the tags balanced
**What happened:** Repeatedly reported work as "verified" on structural checks (tag balance, grep counts) with zero `build`/`tsc`/test runs.
**Rule:** The word "verified" is reserved for output that passed a build, a type-check, and the existing test suite. Structural checks are "reviewed," never "verified." State the distinction explicitly.
**Enforced by:** existing `verify-cli-claims` skill + a hard vocabulary rule; every claim tagged reviewed vs verified.

### L6 — Reduce sources of truth; never add one silently
**What happened:** Repo already had two disagreeing token files; my fix added a third that wins by load order rather than consolidating. Also created a 4th and 5th canonical-ish doc (audit, plan) with no declared owner.
**Rule:** When you touch a system with multiple sources of truth, the change must name the canonical one and reduce the count — or explicitly state why it can't yet. Adding a file that out-ranks rather than replaces is debt.
**Enforced by:** `implementation-preflight` gate: "canonical source named? file count going down?"

### L7 — Instrument every claim that "this needs measuring"
**What happened:** Insisted the 1200ms hold, mode preference, and regeneration rate "must be user-tested," while the app had PostHog and I proposed zero events.
**Rule:** If you assert something needs data, you propose the events to capture it in the same breath. No measurement claim without a measurement plan.
**Enforced by:** `implementation-preflight` gate: "measurement plan attached?"

### L8 — Ask "is this the highest-value thing?" before gold-plating
**What happened:** Spent the whole engagement on the paint of one onboarding screen for a product whose value prop is fragrance discovery / dupes / community. Never raised opportunity cost.
**Rule:** For any sizeable build, state where it sits in the product's value hierarchy and confirm it's the right investment now. Craft on the wrong surface is still waste.
**Enforced by:** `implementation-preflight` opportunity-cost gate (final question before work starts).

### L9 — Don't ask the user to hand you what you already have, or to decide what you should decide
**What happened:** Asked the user to paste a specific section citation from `AGENTS.md` when that exact file was already sitting in my own outputs folder — one Read call would have answered it. Separately, offered an A/B multiple-choice on "inline the loop rules vs. trust the repo config" when that was a call I should have made myself after checking what was actually reachable. Both happened in the SAME session as this lessons file, after L1 was already written.
**Rule:** Before asking the user anything, check: (a) do I already have this file/answer accessible right now via a tool call, and (b) is this actually the user's judgment to make, or am I avoiding a decision that's mine? Only ask when the answer requires information or taste that genuinely only the user has. A repeated ask-instead-of-check is worse than the original miss — it means the lesson wasn't actually embedded, just written down.
**Enforced by:** before sending any clarifying question, run gate 1 of `implementation-preflight` against the question itself, not just the code. If the question can be resolved by a Read/Grep/Bash call available right now, make the call instead of asking.

### L10 — Deliverables that require the user to manually place them are not done
**What happened:** Built brand docs, skills, and guardrails repeatedly into an ephemeral outputs folder and called each one "delivered," requiring the user to paste or place every single one, every time, across chat, Cowork, and CLI sessions — despite the user stating outright they don't want to prompt this every time and expect automation to hold.
**Rule:** A deliverable meant to be "automatic" or "canonical going forward" is only done when it's written to a location the relevant tool actually auto-loads without being told to (repo root for CLAUDE.md/AGENTS.md, `.claude/skills/` for skills, the user's persistent mounted folder for cross-session docs) — not when its content has been shown in chat. If the write destination isn't reachable from the current session, that limitation must be stated as the single concrete blocker, not left implicit while more content gets generated into the same ephemeral spot.
**Enforced by:** `implementation-preflight` gate 4 (canonical source) extended to ask "is this written where the consuming tool will actually find it, unprompted?" — if no, that's the finding, not a footnote.

### L11 — Re-check your actual access before claiming a limitation
**What happened:** Claimed for three consecutive turns that `scentral-hub` was unreachable and wrote prompt files asking the user to relay work to Claude Code — while `~/Projects` (containing the repo) was mounted the whole time. One `ls` would have revealed it. The user had to say "you already should have that permission."
**Rule:** Before stating any access limitation, verify it with a live check in that same turn. Mounts and permissions change between sessions and mid-session; a limitation observed once is not a fact forever. A false "I can't" pushes work back onto the user — the exact opposite of the job.
**Enforced by:** `implementation-preflight` gate 1 extended: any "I don't have access to X" claim must be preceded by a fresh `ls`/read attempt in the same turn.

### L12 — A doc that references a missing file is a broken build
**What happened:** `CLAUDE.md` rule 12 instructed every CLI to invoke `.claude/skills/loop-orchestrator/SKILL.md` — a file that did not exist. Multiple sessions either silently skipped the loop or improvised it. Nobody (including me, across two full review passes) created the file until the user pointed out the miss.
**Rule:** Every skill, doc, or path referenced by an instruction file must exist. When drift is found, fix it in the same change: create the missing file to match the documented rules, or remove the reference. Auditing the reference without repairing it is half a job.
**Enforced by:** loop-orchestrator Critique passes explicitly check "does every file referenced by CLAUDE.md / AGENTS.md exist?"; repo-tidy runbook.

### L13 — Staging copies become sprawl; delete the scaffold once installed
**What happened:** To move guardrails from an ephemeral session into the repo, a staging folder (`~/Projects/Claude/nota-guardrails/`) was created — then left behind after the contents were installed into scentral-hub and ai-ops. Result: lessons.md existed in 4 places, AGENTS.md in 7, with no declared sync direction. The fix for L10 (ephemeral deliverables) directly caused a new instance of L6 (source-of-truth sprawl).
**Rule:** A staging/transfer copy is a temporary artifact. The same change that installs it to its canonical home must delete the staging copy, or explicitly mark it disposable with a pointer to the canonical location. Declared sync direction for any intentional duplicate: ai-ops = canonical for process skills/lessons; repo = working copy; everything else is deletable.
**Enforced by:** `implementation-preflight` gate 4; repo-tidy phase 5 (out-of-scope purge) applied to the machine's folder structure, not just repos.

---

## 2026-07-27 — Performance acceptance and adversarial loop

### L26 — A revised acceptance decision needs an executable contract
**What happened:** Production LCP improved to 2.74–2.83s, but active handoff and launch documents still carried the old `<2.5s` gate. The product decision was correct, yet the documentation system could have sent the next session toward unnecessary work.
**Rule:** When acceptance criteria change, update the canonical record, active references, and an automated consistency check in the same change. Keep historical measurements labelled as historical.
**Enforced by:** `npm run check:performance-criteria` in CI; the homepage follow-up is the canonical source for this gate.

### L27 — A process lesson is incomplete without a guardrail
**What happened:** The loop identified missing performance monitoring and stale-criteria protection, but a lesson alone would not prevent recurrence.
**Rule:** For every process lesson, add the smallest practical system change: CI check, hook, template, or monitored metric. If that is not possible, record the concrete blocker.
**Enforced by:** CI `performance-criteria` job and the loop review checklist.

### L28 — Test auth bypasses must be environment-gated
**What happened:** The Archive import page reused the E2E `fake-session` cookie pattern. A red-team pass correctly flagged that a cookie-only bypass could make a protected page look signed-in outside the test harness, even though the API still required real Supabase auth.
**Rule:** Any fake auth, fixture auth, or bypass path must require an explicit test-only environment flag as well as the test marker. Cookies, headers, or localStorage markers alone are never enough.
**Enforced by:** `E2E_AUTH_BYPASS=1` is required by `start:e2e`; reviews must grep for `fake-session`, `fake-access-token`, and auth bypass markers before accepting protected-route changes.

### L29 — Preview/import features ship preview-first, write-later
**What happened:** The portability concierge work was valuable only because it stayed no-write: users can paste CSV/TSV text, inspect exact/likely/ambiguous/unmatched results, and preserve source values before any database mutation exists.
**Rule:** Imports and migrations of user-owned history must start with a bounded preview surface. The write step is a separate tranche with explicit approval, authenticated ownership, idempotency, audit logging, and rollback receipt.
**Enforced by:** `docs/nota/11-portability-concierge.md` acceptance gates; preview routes must be checked for absence of `insert`, `update`, `upsert`, `delete`, write RPCs, and service-role clients.

### L30 — Do not query schema columns that migrations cannot reproduce
**What happened:** The preview route initially queried `fragrances.full_name`. Red-team found no migration proving that column exists in a fresh schema replay, so the route could have worked only against an out-of-band production drift.
**Rule:** A query may use only columns proven by migrations, generated types, or a live schema check documented in the change. If a column is not reproducible from the repo, either add the migration or avoid the column.
**Enforced by:** before committing database-backed code, search migrations for every newly referenced table/column and record any live-only exception in the PR or handoff.

### L31 — Dirty worktrees require exact staging
**What happened:** The repo contained broad unrelated edits and untracked artifacts while the portability tranche was ready. A broad `git add .` would have bundled unrelated agent work into the feature commit.
**Rule:** In a dirty shared worktree, stage and commit by exact paths. Treat mixed files, staged leftovers, generated artifacts, and unrelated changes as separate concerns.
**Enforced by:** run `git status --short`, `git diff --cached --name-only`, and `git diff --cached --stat` before commit; use exact path staging and never broad-add unless the whole worktree is intentionally owned by the change.

### L32 — Next manifest failures after interrupted builds need a clean rebuild
**What happened:** Full E2E briefly failed with Next client-reference-manifest errors after interrupted or overlapping builds. Moving `.next` aside and rebuilding cleanly separated framework build-state corruption from real app regressions.
**Rule:** If Next reports missing client manifests, missing `500.html`, or route manifest invariants after interrupted builds, do not treat the app as broken until `.next` has been moved aside and rebuilt from scratch.
**Enforced by:** E2E failure triage: check running `next` processes, move generated `.next` state aside, run `npm run build`, then rerun the failing spec before debugging product code.

### L33 — Protected API tests need real auth coverage eventually
**What happened:** The Archive import E2E mocked `/api/portability/preview`, which verified the UI path but not real `401`, `415`, `413`, `429`, Supabase query behavior, or no-write API behavior under authenticated test conditions.
**Rule:** Mocked E2E is acceptable for UI feedback, but protected APIs need a real authenticated integration test before production reliance. Document the gap when test auth is unavailable.
**Enforced by:** backlog item in `docs/nota/05-recommendations-backlog.md`; protected route PRs must identify whether auth behavior is tested by unit, integration, E2E mock, or live smoke.

### L34 — Generated build backups must be ignored before lint claims
**What happened:** A local clean rebuild created `.next.preverify-*` backup state. ESLint traversed that generated bundle under Node 20 and reported thousands of irrelevant generated-code errors, while Node 26 appeared clean because the local generated state differed.
**Rule:** Build backups such as `.next.preverify-*` and `.next.preclean-*` are generated artifacts. They must be ignored by both Git and ESLint, moved out of the repo when found, and never used as evidence of product-code lint failures.
**Enforced by:** `.gitignore` and `eslint.config.mjs` ignore rules; before claiming lint or CI status, check for root-level `.next.pre*` directories and move them aside if present.

### L35 — E2E CI needs a bounded diagnostic failure mode
**What happened:** The `main` E2E job ran long after build, typecheck, lint, performance, Security Audit, and CodeQL were green. While a full Playwright matrix can legitimately take several minutes, an unbounded run leaves agents unable to distinguish slow tests from a hung server or orphaned process.
**Rule:** Long-running CI jobs must have explicit timeouts and diagnostics. A failed or cancelled E2E run should preserve Playwright artifacts so the next session can inspect traces instead of re-running blind.
**Enforced by:** CI `e2e.timeout-minutes` and `Upload E2E diagnostics` artifact step for `test-results/` and `playwright-report/`.

---

## 2026-07-26 — Homepage/hero reconciliation + parallel fixes + security audit

Context: Merged brand-reconciliation branch (hero video, docs, route alignment), fixed 3 follow-up issues (lab pagination, mobile poster, guest redirect) in parallel, resolved 10 npm vulnerabilities. Session revealed gaps in loop discipline and dependency-update hygiene.

### L14 — Concurrent session detection saves rework
**What happened:** Another session committed to a shared branch mid-operation. Risk: `git checkout` would have yanked the branch away. Instead, we detected it, verified HEAD before/after operations, and proceeded safely.
**Rule:** On shared branches, always `git status` and `git log -1` before long operations (merge, rebase, multi-file edits). If HEAD moved unexpectedly, stop and verify the new state. Treat concurrent sessions as normal, not rare.
**Enforced by:** pre-flight check in any multi-step work on main/shared branches; parallelization workflow logs should confirm git state before + after.

### L15 — Check task status before investigating "what needs fixing"
**What happened:** The parallel workflow assigned 4 fixes. Two were already completed (mobile poster, guest redirect) and verified working. We investigated them anyway, wasting time before confirming "no action needed."
**Rule:** Before starting a task, verify its current status with the smallest check: does the code already do this? Is the test passing? Has this already shipped? Only investigate if the answer is "no" or "unknown." For task batches, a quick status sweep saves cycles.
**Enforced by:** pre-flight checklist on every task: "Is this actually broken right now?" (build, test, live check) before diving into the fix.

### L16 — Pick the reversible option when both solve the present problem equally
**What happened:** Cabinet vs Shelf decision: Option A (merge two models) was architectural; Option B (clarify via metadata) was copy-only. Both solved the immediate problem (ambiguity). We chose B because it was reversible and risked no regressions.
**Rule:** When two approaches solve the current problem equally, prefer the one with lower blast radius and no data migration / schema change. The roadmap can always justify an upgrade later if a feature demands consolidation. Reversibility is worth the delay.
**Enforced by:** architecture decision template in `docs/nota/`: "Is there a lower-cost option that postpones the hard decision?" Use it.

### L17 — `npm audit fix --force` changes SemVer; always test the build after
**What happened:** Security vulnerability fix applied `npm audit fix --force`, which upgraded eslint from 9→10 (SemVer breaking change) and eslint-config-next without testing after. Lucky: build passed. Could have landed a breaking linter config change without knowing.
**Rule:** Dependency updates (esp. audit --force) go into a dedicated commit. Always run `npm run build` + `npm run lint` after, verify the output, and commit only if no new errors or strictness appear. If breaking changes found, either roll back or explicitly accept them in the commit message.
**Enforced by:** post-audit checklist: build, lint, tsc; diff the lock file for SemVer changes before committing.

### L18 — The adversarial pass exists for a reason; even "obvious" fixes need it
**What happened:** Multiple fixes in this session skipped the adversarial pass (CLAUDE.md §12, step 2). The security fix was worst: audit → fix → push, no "what could break with eslint 10?" or "are there edge cases I missed?" Only structured verification (build passed) happened, not structured critique (could this break?).
**Rule:** Every change, even one-liners and bug fixes, deserves a 2-minute adversarial pass: "What's the worst thing that could happen? What did I assume? What's not tested?" This is not overthinking; it's the difference between verified and published-without-thinking. For security or dependency changes, it's mandatory.
**Enforced by:** loop-orchestrator; commit templates remind you: "Did you do step 2 (adversarial pass) before pushing?"

### L19 — Copy/metadata changes often resolve confusion cheaper than API changes
**What happened:** Cabinet vs Shelf distinction resolved by updating page metadata descriptions (Cabinet = "complete inventory", Shelf = "curated top 20"). No schema change, no data migration, no component rewiring. Cost: 2 lines per page. Effectiveness: removes ambiguity immediately.
**Rule:** Before proposing a data model or API change to resolve user confusion, check: can copy, metadata (title/description), empty-state text, or navigation labeling clarify it cheaper? Metadata is shipped and versioned like code but costs less to change. Use it first.
**Enforced by:** design-critique: "Is this a copy problem or a schema problem?" for any "users are confused about X" finding.

### L20 — Don't inherit stale "fixed" claims; verify them live
**What happened:** CLAUDE.md claimed Unbounded font was "corrected to Geist" in DESIGN.md. Audit found: DESIGN.md still says Geist, code still ships Unbounded. The claim was wrong and stale. We retracted it and documented the real state (intentional migration target, not done yet).
**Rule:** When a prior session or doc claims "X was fixed", do not trust it. Check the actual code/file. "It says it was fixed" ≠ "it is fixed." Especially true across sessions and for big changes (rebrands, migrations). A retraction + correction in the same change saves cascading misunderstandings.
**Enforced by:** `verify-cli-claims` skill: every "X was done" reference in a doc must be spot-checked against code, commit log, or live state before shipping.

### L21 — A process lesson without a system change is incomplete
**What happened:** Adversarial pass identified L18 (skip adversarial pass on security fixes) as a repeated discipline gap. Response: documented the lesson. Problem: the system (workflow, hooks, templates) was not changed to prevent the same skip next time. Documenting bad behavior without changing the system is performative; the next security fix will face the same temptation.
**Rule:** When a lesson identifies a process/discipline problem (not a code bug), the work is not done until you've changed the system to prevent the same mistake. Either: (a) add a hook / update a workflow / create a template / integrate a checklist, or (b) explicitly name the blocker preventing the fix. Documenting "don't skip this" when the system makes skipping easy is a wish, not a guard.
**Enforced by:** before finalizing a lesson, ask: "What system change would make this mistake harder to repeat?" If the answer is "none — this is just discipline," escalate the lesson to at least a commit-message template or pre-commit reminder. If the answer is "there's a blocker," state it plainly in the lesson.

### L22 — "Verified" means you showed the output, not just ran the command
**What happened:** Security audit committed after running `npm audit fix --force`. Claim: "build passed" (verified). Reality: `npm run lint` output not shown; `npm audit` before/after not shown; `git diff package-lock.json` not reviewed for SemVer breaks. Two commands ran silently; only one check was shown. For a security fix, "I ran the command" is not verification.
**Rule:** For dependency updates, security fixes, and any change that could break the build at CI-time, verification means: show the actual before/after output. For audit: `npm audit` output (before/after, showing resolved count). For major SemVer bumps: `npm run lint` output + `git diff package-lock.json | grep version` to spot major changes. If the output shows warnings/errors, the fix is incomplete until they're addressed.
**Enforced by:** security-audit checklist in commit template: "Before committing: paste `npm audit` before/after, `npm run build` output, `npm run lint` output (for major bumps). Silent runs are not verified."

### L23 — Enforcement tools referenced in lessons must exist and be reachable
**What happened:** L17 says "enforced by: post-audit checklist," L15 says "enforced by: pre-flight checklist," L18 says "enforced by: loop-orchestrator + commit templates." Three of five enforcement mechanisms were named but either (a) don't exist yet, (b) are vague, or (c) were not verified to be reachable in the repo. A lesson that references dead enforcement erodes trust in all lessons.
**Rule:** When a lesson names an enforcement mechanism (gate, hook, skill, checklist, template), verify in the same change that the tool exists, is correctly located, and is reachable from the consuming context. If it doesn't exist, create it as a separate, minimal commit, or remove the reference. "Enforced by X" must mean "X actually runs."
**Enforced by:** before shipping a lesson, grep for every "Enforced by" reference; each one must resolve to an actual file, hook, or declared command in the repo (e.g., `ls ~/.claude/skills/loop-orchestrator/` or `.husky/pre-commit` grep). If a reference doesn't resolve, that's a finding.

### L24 — Reversibility has a cost; know when to stop paying it
**What happened:** Cabinet vs Shelf (L16): chose the reversible option (copy/metadata only) over the architectural option (merge models). This is sound for the *present* problem. But the lesson doesn't address: if the roadmap later demands merging anyway, the metadata approach creates rework. When is reversibility a liability instead of a win?
**Rule:** Reversibility is valuable when the problem is *ambiguous* or *might change*. It's a cost when the problem is *known* and the right solution is *clear* but harder. Before choosing the low-cost reversible option, ask: "Is this problem still ambiguous, or do I actually know the answer?" If the answer is "I know the answer is merge," postponing the hard decision is technical debt, not wisdom. Use reversibility for exploration and proof-of-concept; use it sparingly for known-good solutions that just happen to be bigger.
**Enforced by:** design-decision checklist: "Is the problem still ambiguous?" If no, flag that reversibility is being chosen despite clarity, and document the debt. Do not silently choose cheap when the answer is known.

### L25 — Concurrent-session conflicts are normal; have a merge playbook
**What happened:** L14 detects concurrent sessions + HEAD movement. But detection is not resolution. If two sessions commit to the same branch → conflict on merge, there's no declared strategy: merge first-come-wins, manual conflict resolution, sequential gate (one session locks the branch), or something else. Teams need a playbook.
**Rule:** For any shared branch, declare the merge strategy upfront: (a) fast-forward preferred when histories don't conflict; (b) resolve merge conflicts with the rule "most recent session's state wins" / "oldest session's data survives" / "manual arbitration" — pick based on the feature (log/audit = oldest wins; feature flags = newest wins; code = manual). For conflicts on code/data, document who arbitrates (Christopher, on-call, automated test result). Record the strategy in CLAUDE.md §11.
**Enforced by:** conflict resolution rules in CLAUDE.md; for any shared branch work, state "if HEAD moves, merge strategy is X" before proceeding. CI gate: if a merge conflict is detected, require explicit approval before continuing (do not auto-resolve silently).
