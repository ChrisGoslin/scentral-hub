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

### L48 — A revised acceptance decision needs an executable contract
**What happened:** Production LCP improved to 2.74–2.83s, but active handoff and launch documents still carried the old `<2.5s` gate. The product decision was correct, yet the documentation system could have sent the next session toward unnecessary work.
**Rule:** When acceptance criteria change, update the canonical record, active references, and an automated consistency check in the same change. Keep historical measurements labelled as historical.
**Enforced by:** `npm run check:performance-criteria` in CI; the homepage follow-up is the canonical source for this gate.

### L49 — A process lesson is incomplete without a guardrail
**What happened:** The loop identified missing performance monitoring and stale-criteria protection, but a lesson alone would not prevent recurrence.
**Rule:** For every process lesson, add the smallest practical system change: CI check, hook, template, or monitored metric. If that is not possible, record the concrete blocker.
**Enforced by:** CI `performance-criteria` job and the loop review checklist.

### L50 — Test auth bypasses must be environment-gated
**What happened:** The Archive import page reused the E2E `fake-session` cookie pattern. A red-team pass correctly flagged that a cookie-only bypass could make a protected page look signed-in outside the test harness, even though the API still required real Supabase auth.
**Rule:** Any fake auth, fixture auth, or bypass path must require an explicit test-only environment flag as well as the test marker. Cookies, headers, or localStorage markers alone are never enough.
**Enforced by:** `E2E_AUTH_BYPASS=1` is required by `start:e2e`; reviews must grep for `fake-session`, `fake-access-token`, and auth bypass markers before accepting protected-route changes.

### L51 — Preview/import features ship preview-first, write-later
**What happened:** The portability concierge work was valuable only because it stayed no-write: users can paste CSV/TSV text, inspect exact/likely/ambiguous/unmatched results, and preserve source values before any database mutation exists.
**Rule:** Imports and migrations of user-owned history must start with a bounded preview surface. The write step is a separate tranche with explicit approval, authenticated ownership, idempotency, audit logging, and rollback receipt.
**Enforced by:** `docs/nota/11-portability-concierge.md` acceptance gates; preview routes must be checked for absence of `insert`, `update`, `upsert`, `delete`, write RPCs, and service-role clients.

### L52 — Do not query schema columns that migrations cannot reproduce
**What happened:** The preview route initially queried `fragrances.full_name`. Red-team found no migration proving that column exists in a fresh schema replay, so the route could have worked only against an out-of-band production drift.
**Rule:** A query may use only columns proven by migrations, generated types, or a live schema check documented in the change. If a column is not reproducible from the repo, either add the migration or avoid the column.
**Enforced by:** before committing database-backed code, search migrations for every newly referenced table/column and record any live-only exception in the PR or handoff.

### L53 — Dirty worktrees require exact staging
**What happened:** The repo contained broad unrelated edits and untracked artifacts while the portability tranche was ready. A broad `git add .` would have bundled unrelated agent work into the feature commit.
**Rule:** In a dirty shared worktree, stage and commit by exact paths. Treat mixed files, staged leftovers, generated artifacts, and unrelated changes as separate concerns.
**Enforced by:** run `git status --short`, `git diff --cached --name-only`, and `git diff --cached --stat` before commit; use exact path staging and never broad-add unless the whole worktree is intentionally owned by the change.

### L54 — Next manifest failures after interrupted builds need a clean rebuild
**What happened:** Full E2E briefly failed with Next client-reference-manifest errors after interrupted or overlapping builds. Moving `.next` aside and rebuilding cleanly separated framework build-state corruption from real app regressions.
**Rule:** If Next reports missing client manifests, missing `500.html`, or route manifest invariants after interrupted builds, do not treat the app as broken until `.next` has been moved aside and rebuilt from scratch.
**Enforced by:** E2E failure triage: check running `next` processes, move generated `.next` state aside, run `npm run build`, then rerun the failing spec before debugging product code.

### L55 — Protected API tests need real auth coverage eventually
**What happened:** The Archive import E2E mocked `/api/portability/preview`, which verified the UI path but not real `401`, `415`, `413`, `429`, Supabase query behavior, or no-write API behavior under authenticated test conditions.
**Rule:** Mocked E2E is acceptable for UI feedback, but protected APIs need a real authenticated integration test before production reliance. Document the gap when test auth is unavailable.
**Enforced by:** backlog item in `docs/nota/05-recommendations-backlog.md`; protected route PRs must identify whether auth behavior is tested by unit, integration, E2E mock, or live smoke.

### L56 — Generated build backups must be ignored before lint claims
**What happened:** A local clean rebuild created `.next.preverify-*` backup state. ESLint traversed that generated bundle under Node 20 and reported thousands of irrelevant generated-code errors, while Node 26 appeared clean because the local generated state differed.
**Rule:** Build backups such as `.next.preverify-*` and `.next.preclean-*` are generated artifacts. They must be ignored by both Git and ESLint, moved out of the repo when found, and never used as evidence of product-code lint failures.
**Enforced by:** `.gitignore` and `eslint.config.mjs` ignore rules; before claiming lint or CI status, check for root-level `.next.pre*` directories and move them aside if present.

### L57 — E2E CI needs a bounded diagnostic failure mode
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

### L26 — Test-Coverage Isolation from Live API States (E2E Fixture Mode)
**What happened:** Introducing dynamic transaction trends and sheet updates initially failed E2E Playwright tests because the tests hit the live ranges (which changed in this session) or expected exactly 5 confirmed items. Hardening the quality gate required isolated mock environments.
**Rule:** E2E and UI verification tests must be fully isolated from live external API feeds or dynamic historical worksheets. Enforce a local fixture/mock mode during the `build` and `test:e2e` execution.
**Remedy built in:** Configured `ABUNDANCE_FIXTURE_MODE=true` in script pipelines and implemented mock data mapping inside `fixture-store.ts`.
**Enforced by:** Pre-commit build pipeline parameter verification.

### L27 — Enforce Local Database Reset before Migration Push
**What happened:** Local database workspaces naturally accumulate manual columns, test entries, and ad-hoc overrides during active development. Pushing migrations directly without a database reset risks schema inconsistencies between development and production.
**Rule:** Before pushing any database schema migrations to production, reset the local test database workspace to verify that all migration SQL statements are fully reproducible from scratch.
**Remedy built in:** Integrated database reset steps into the Supabase migration guidelines.
**Enforced by:** Pre-push checklist standard.

### L28 — Programmatic Rate Limit Protection for Batch Operations
**What happened:** Multi-document OCR processing and image generation loops triggered API rate limit spikes (HTTP 429/503), requiring manual human restarts.
**Rule:** All batch-processing or bulk-ingestion scripts interacting with external APIs must implement exponential backoff with randomized jitter and support checkpoints to resume failures.
**Remedy built in:** Implemented standard `callWithBackoff` helpers and a `--resume-from` CLI argument.
**Enforced by:** Ingestion review checklist.

---

## 2026-07-29 — Cowork front-end consultant build (design-system skills)

Context: built a "front-end design consultant" skill + Claude Code prompt pack in Cowork for nota. and Abundance, then read both repos and found most of it wrong. Every lesson below was already latent in L1/L6/L9/L10 — they were written down but not embedded.

### L29 — Authoring for a repo you have not opened is invention, not consulting
**What happened:** Wrote a complete design-token system for nota. — palette, type pairing, radius scale, motion durations — from doctrine prose alone, without opening `scentral-hub`. Nearly every specific was wrong: proposed Signifier + Founders Grotesk against canon's Instrument Serif + Geist; proposed a 2/4/8/16 radius scale against shipped `--r-card:16px/--r-btn:12px`; proposed shadcn setup steps for a repo with no `components.json`; banned spring overshoot while `--motion-organic` uses it deliberately. Directionally plausible, factually wrong — the most dangerous combination, because it reads authoritative.
**Rule:** Do not author tokens, rules, or "systems" for an existing codebase before reading it. If repo access is unavailable, the deliverable is a *questions list*, explicitly labelled as ungrounded — never a spec. Plausibility is not grounding.
**Enforced by:** `implementation-preflight` gate 1, extended to skill/doc authoring, not just code. Any artifact asserting project-specific values must name the file:line it was read from.

### L30 — Canon lives in the repo; a second copy is drift by construction
**What happened:** Copied token values into a Cowork skill so it could "know" the brand — creating a fifth source of truth alongside `DESIGN.md`, `NOTA-BRAND-UIUX-PACK.md`, `NOTA_MANIFESTO.md`, and shipped CSS. `AGENTS.md` §5b already says, verbatim: *"Read DESIGN.md before any UI work — it is the canonical token and material system; do not duplicate its rules here."* The instruction was in the repo before the mistake was made.
**Rule:** External tooling (Cowork skills, prompt packs, agent configs) must *point at* repo canon and read it at run time, never mirror its contents. A tool that restates a value is a tool that will eventually contradict it.
**Enforced by:** `canonical-source-reconciler` skill; plus a self-check when authoring any skill — "does this file state a project fact? if yes, does it cite where it's read from, rather than asserting it?"

### L31 — Check the repo's own `.claude/skills/` before building a capability
**What happened:** Designed a doc-vs-code drift protocol from scratch, and a visual verification workflow, without checking `.claude/skills/` — which already contains 27 skills including `canonical-source-reconciler`, `implementation-preflight`, `verify-cli-claims`, `screen-state-completeness`, and `loop-orchestrator`. Rebuilt existing capability under new names, in a different location, with different wording.
**Rule:** Before authoring any new skill or agent capability, list `.claude/skills/` in the target repo and the global skill set. If a skill covers the need, extend or invoke it; do not parallel-build. This is L6 (reduce sources of truth) applied to tooling rather than docs.
**Enforced by:** `implementation-preflight` gate: "does this capability already exist? `ls .claude/skills/` output pasted before authoring."

### L32 — The user's description of their own repo is a hypothesis, not evidence
**What happened:** Asked whether Abundance was greenfield; was told yes, "my doctrine stands." It is not greenfield — it is a working Next 16 app with `/subscriptions`, `/scenarios`, `/calendar`, `/documents`, its own shipped palette, `AGENTS.md`, vitest + Playwright, and a Drive ingest pipeline. Had this gone unverified, a fabricated doctrine would have been declared canonical over a live product. Compounding L9: the question should not have been asked at all — the repo was one `ls` away.
**Rule:** Never let a user's recollection of repo state substitute for reading it, especially when their answer would license you to skip verification. Treat "it's greenfield / nothing's there / that's not built yet" as the highest-priority claim to check, because it is the one that unlocks unverified work.
**Enforced by:** `grounded-agent-guardrails` — verify before asserting, extended to verifying *before accepting* a state claim that reduces scope.

### L33 — An anti-slop rule asserted from taste will flag intentional craft
**What happened:** Wrote a hard rule banning spring overshoot in motion. nota. ships `--motion-organic: 800ms cubic-bezier(0.34, 1.56, 0.64, 1)` deliberately. Also hard-banned Geist as an "AI tell" while canon names it the 90% body face. The rules were confident, unsourced, and would have generated false violations against considered decisions.
**Rule:** Every anti-slop rule must carry either (a) a citation to project canon, or (b) external evidence, plus an explicit exception clause for deliberate use. A rule with neither is personal taste wearing a uniform. The tell is *unexamined defaults*, never a specific typeface or easing curve.
**Enforced by:** anti-slop rules live in `NOTA-BRAND-UIUX-PACK.md` §14 only; external tools cite §14 rather than inventing parallel lists.

### L34 — Audit the doctrine for slop, not only the code
**What happened:** Spent the session enforcing canon against code, and never asked whether canon itself encoded a generic choice. It does: `NOTA-BRAND-UIUX-PACK.md` §4 and `DESIGN.md` name **Geist** as the 90% body face. 2026 external evidence places Geist in the "AI-startup typeface" cluster alongside Inter Display and General Sans — precisely the convergence §14 exists to prevent. Canon can drift toward generic while remaining internally consistent.
**Rule:** Canon gets the same adversarial review as code, on a schedule. Ask periodically: has any canonical choice become generic since it was made? A doctrine written in year N encodes year N's defaults, and defaults commoditise.
**Enforced by:** annual (or per-major-release) canon review, with external evidence required to change a canonical choice — logged per §5a with the why in the commit message.

### L35 — Shipped code loading retired assets is a finding, not a detail
**What happened:** `NOTA-BRAND-UIUX-PACK.md` §4 lists Satoshi, Unbounded, Space Grotesk, Caveat, and Cormorant Garamond as retired — "if found in the codebase, migrate." `app/layout.tsx` currently imports **Unbounded, Space Grotesk, and Caveat** via `next/font/google`, and `globals.css` declares a Cormorant Garamond `@font-face`. Four retired faces are live in production, costing bytes and brand coherence simultaneously.
**Rule:** When canon retires an asset, the retirement is not complete until the code no longer loads it. Track retirement as migration work with an owner, not as a doc edit.
**Enforced by:** a grep gate — for each name on the retired list, `grep -r` across `app/` and `globals.css` must return nothing; wire into the pre-deploy checklist alongside `repo-tidy`.

### L36 — Deliverables written outside the repo do not survive the session
**What happened:** Produced skills and a prompt pack into Cowork storage and an ephemeral outputs folder, while the repo's own `.claude/skills/` is the location Claude Code actually auto-loads. Exactly L10, repeated verbatim, in a session where L10 was already on file.
**Rule:** Before writing any agent-facing artifact, name the consuming tool and the path it auto-loads from, and write there. If that path isn't reachable from the current session, state that as the blocker instead of writing elsewhere and calling it delivered.
**Enforced by:** `implementation-preflight` gate 4, extended: "which tool loads this, from which path, without being told?"

### L37 — Same-named skills at different layers are scoping, not duplication
**What happened:** Found 4 of 6 shared skills diverging between global Cowork (`~/.claude/skills/`) and repo (`.claude/skills/`) — `verify-cli-claims` 149 lines vs 18, `repo-tidy` 167 vs 24, plus `grounded-agent-guardrails` and `loop-orchestrator`. Nearly "reconciled" them into single versions. Reading them first showed the repo copies are deliberately nota-specialised: repo `verify-cli-claims` asserts the ≤3 liquid-glass backdrop-filter budget, the single fixed grain layer, and `DESIGN.md` token usage over hardcoded hexes — none of which a generic global skill can know. Repo skills take precedence inside the repo, so the layering already works correctly. Merging would have destroyed the specialisation and silently removed a brand-performance gate.
**Rule:** Before treating same-named artifacts at different layers as duplication, read both and classify: **intentional specialisation** (generic base + domain-specific override — correct, leave it), **accidental drift** (same intent, wording diverged — merge), or **stale copy** (abandoned version — delete). Line-count difference is not evidence of any of the three. "Reduce sources of truth" (L6) applies to competing claims about the *same* scope, not to deliberate layering across scopes.
**Remedy built in:** `alignment-sweep` Pass 4 requires this classification before any divergence is reported as a finding, and names the `verify-cli-claims` case as the worked example.
**Enforced by:** `alignment-sweep` skill (repo + global copies), run monthly via the `monthly-alignment-sweep` scheduled task (Cowork Scheduled, not a repo skill).

### L38 — A defect flagged as "not fixed, needs someone who knows" should be fixed once you know
**What happened:** `repo-tidy` carried a defect note from 2026-07-27: a global rebrand find/replace had overwritten its retired-product-names list with three identical `"nota."` entries, and step 2 instructed replacing them *with* `nota.`. The note correctly refused to guess and left it for someone with the knowledge. Two days later the canonical retired names were sitting in `NOTA-BRAND-UIUX-PACK.md` §4 and the brand doctrine — the information existed; nobody closed the loop.
**Rule:** A deferred-defect note is a debt with an owner, not a permanent disclaimer. When you gain the knowledge a note was waiting on, fix it in that session and date the fix. Sweep for `not fixed`, `known defect`, `needs verification`, and `TODO` in skills and canon docs periodically — a flagged defect that survives three sweeps is either fixed or deliberately accepted, never left ambiguous.
**Remedy built in:** `repo-tidy` step 1 restored from canonical sources 2026-07-29, retired-font sweep added per L35, and the guardrail-list exception from `AGENTS.md` §82 made explicit so the list isn't re-clobbered by the next global find/replace.
**Enforced by:** `alignment-sweep` Pass 6 (freshness) treats unresolved defect notes older than 90 days as findings.

### L39 — This repo has three CLI skill mirrors; a fix in one is a fix in none
**What happened:** Fixed the `repo-tidy` retired-terms defect in `.claude/skills/` and nearly stopped there. The repo actually maintains **three** CLI skill trees — `.claude/skills/` (29 skills), `.agents/skills/` (6), `.gemini/skills/` (5) — for Claude Code, Codex, and Gemini respectively. `repo-tidy`, `verify-cli-claims`, `canonical-source-reconciler`, and `loop-orchestrator` exist in all three. They are **not** automatic mirrors: they hold different subsets, and the `.agents` and `.gemini` copies of `repo-tidy` differed from each other *and* from `.claude` before the fix. Codex and Gemini would have kept running the defective version indefinitely.
**Rule:** Before editing any skill in this repo, check whether it exists in `.agents/skills/` or `.gemini/skills/` too, and propagate. A defect fixed in one CLI's tree while the others keep the broken copy is worse than the original defect — it creates the illusion of a fix while producing divergent behaviour per tool.
```bash
for s in <skill>; do for d in .claude .agents .gemini; do
  [ -f "$d/skills/$s/SKILL.md" ] && echo "$d has $s"; done; done
```
**Remedy built in:** `repo-tidy` fix propagated to all three trees 2026-07-29; all three verified byte-identical.
**Enforced by:** `alignment-sweep` Pass 4 extended to diff across `.claude` / `.agents` / `.gemini`, not just repo-vs-global.

---

## 2026-07-29 — Adversarial pass over this session's own output

### L40 — Run every new rule against the artifact that introduced it
**What happened:** Wrote L39 ("this repo has three CLI skill trees; a fix in one is a fix in none"), then within the same session shipped `alignment-sweep` and `canon-slop-audit` into `.claude/skills/` **only**. Codex and Gemini would never have seen either. The violation was invisible until an adversarial pass explicitly diffed the trees — the same pass the new skill itself prescribes. Also shipped an `Enforced by: monthly-alignment-sweep` reference that resolves to a Cowork scheduled task, not a repo skill, violating L23's rule that every "Enforced by" must point at something that actually runs where claimed.
**Rule:** The moment a lesson is written, run it against the current session's own deliverables before closing. A rule authored and violated in the same session is worse than no rule — it teaches the next agent that lessons are documentation rather than constraints. Applies with double force to any lesson about propagation, duplication, or placement, because those are precisely the ones the author is mid-violating.
**Remedy built in:** Both skills propagated to `.agents/` and `.gemini/`, verified byte-identical; the false enforcement reference corrected in place.
**Enforced by:** `loop-orchestrator` critical-review pass extended — the final gate now asks "does this session's output satisfy the rules this session wrote?" and `alignment-sweep` Pass 4 diffs all three CLI trees for every skill, not just pre-existing ones.

### L41 — Untested infrastructure claims are the highest-confidence, lowest-evidence claims an agent makes
**What happened:** Authored `visual-verification` — a skill whose entire premise is *never claim a UI works without running it* — and then reviewed an entire design system, wrote 11 lessons, rebuilt six skills, and produced a prompt pack **without once starting the dev server**. When finally instructed to run E2E, the sandbox surfaced four blockers in sequence: the mount blocks `unlink` (Next cannot clear `.next/BUILD_ID`), Playwright browsers were absent, `--with-deps` needs root, and `lightningcss` had no arm64 binding. None was visible from reading code. All four were trivially discoverable by running one command.
**Rule:** Any skill that prescribes execution must itself be executed at least once against the real target before it is called delivered. "The instructions are correct" is not the same claim as "the instructions work here," and only the second is worth anything. Where the environment cannot support execution, that limitation is the headline finding, not a footnote.
**Remedy built in:** Full E2E executed 2026-07-29 — build ✓, 35 passed / 7 skipped / 0 failed on chromium and Mobile Chrome, unit 17/17, lint 0 errors. Sandbox workaround documented below.
**Enforced by:** `verify-cli-claims` (repo copy) already forbids "complete" without a build; extended in spirit to skills — a skill prescribing a command is unverified until that command has run.

### L42 — Sandbox execution recipe for this repo (saves the next agent ~40 minutes)
**What happened:** Getting a green E2E run inside a Cowork sandbox required four non-obvious workarounds, discovered serially.
**Rule:** Record environment-specific execution recipes; rediscovering them is pure waste.
**Remedy built in:**
1. **Mount blocks `unlink`** → `next build` fails `EPERM` on `.next/BUILD_ID`. Copy the repo out: `tar -cf - --exclude=node_modules --exclude=.next --exclude=.git . | (cd /tmp/nota && tar -xf -)`.
2. **Do not symlink `node_modules`** — Turbopack rejects it ("points out of the filesystem root"). Copy it (~1.1 GB; needs ≥3 GB free).
3. **Playwright** — `--with-deps` fails (no root). Use `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright install chromium`, then supply the one missing lib manually: `apt-get download libxdamage1 && dpkg-deb -x *.deb /tmp/libs`, then `LD_LIBRARY_PATH=/tmp/libs/usr/lib/aarch64-linux-gnu`.
4. **arm64** — install `lightningcss-linux-arm64-gnu --no-save` or the CSS pipeline dies at build.
**Enforced by:** referenced from `alignment-sweep` Pass 1 so a sweep that needs to run tests doesn't re-derive this.

### L43 — Two live test gaps found by actually running the suite
**What happened:** The green run surfaced what static review could not. **(a)** All 7 skipped specs are auth/data-gated — including the entire `lens-filter-empty-state` suite, which is the only automated coverage of contextual empty states across shelf view modes. The screens `screen-state-completeness` cares most about are the ones never exercised in CI. **(b)** The E2E web server logged repeated `429`s from `upload.wikimedia.org` — tests are fetching live upstream images, so the suite depends on a third party's rate limiter and will flake in CI.
**Rule:** A green suite is evidence about what ran, never about what was skipped. Report skip counts with the same prominence as failures, and name what coverage each skip removes. Any external network call inside a test is a latent flake — fixture it (cf. L26, `ABUNDANCE_FIXTURE_MODE`).
**Enforced by:** `alignment-sweep` Pass 6 extended to report skipped-spec counts and any external hosts contacted during a test run. Open for Christopher: seed auth/data fixtures so the 7 skips execute, and stub `upload.wikimedia.org` image responses.

### L44 — Looking at the rendered screen found three defects that six passes of reading did not
**What happened:** After an entire session of canon review, drift analysis, and a green E2E suite, the first actual screenshot of the homepage surfaced three defects no amount of reading had caught:

1. **`ConsentBanner.tsx` ships three off-palette navy blues** — `#1a2439`, `#2d3d5c`, `#7a8fa3`. None appears anywhere in `DESIGN.md`, `NOTA-BRAND-UIUX-PACK.md`, or `NOTA_MANIFESTO.md`; the nota. palette contains no blue at all. This component renders on **every route** via `app/layout.tsx`, making it the single most brand-visible element in the product.
2. **`var(--bg-secondary, #1a2439)` references a token that does not exist** — `--bg-secondary` is defined nowhere in `globals.css` or `lib/design/tokens.css`, so every render silently falls through to the hardcoded navy. A missing token with a plausible fallback fails invisibly forever.
3. **`--r-card: 16px` contradicts brand pack §6**, which specifies structural radius `0px` for cards, sheets and panels — "cut-paper / glass-edge geometry. Reject bubble aesthetics." The banner also renders as a rounded bubble, the exact aesthetic §6 rejects.

E2E passed 35/35 throughout. Tests assert behaviour, not brand.

**Rule:** A green suite and a canon review are not evidence about appearance. Any engagement that reviews, audits, or changes visual doctrine must screenshot at least one real rendered route before reporting, and must sample computed values (`getComputedStyle`) rather than reading declared ones — the declared value is not necessarily the rendered value. Specifically: grep every `var(--token, fallback)` for tokens that do not exist, because the fallback makes the failure silent.
**Remedy built in:** Screens captured to `outputs/nota-screens/` and inspected 2026-07-29. `visual-verification` skill executed for the first time. Findings logged as open items below.
**Enforced by:** `visual-verification` skill; `alignment-sweep` Pass 2 extended to grep for `var(--*, #hex)` fallbacks whose token is undefined, and to compare computed body/surface values against `DESIGN.md` rather than only reading declarations.

**Open for Christopher (not fixed — brand decisions):**
- `ConsentBanner.tsx` needs re-tokening to the real palette (charcoal surface, ivory text, olive action). Three hardcoded navies + one phantom token.
- Define `--bg-secondary` or remove the reference.
- Reconcile `--r-card: 16px` / `--r-btn: 12px` against §6's `0px` structural radius — one of the two is wrong.
- Banner overlaps the `03 IDENTITY` section content at desktop 1440×900 and has a clipped glyph at the left viewport edge.

### L45 — A skill that prescribes commands must first prove the environment can run them
**What happened:** `branch-hygiene` Step 4 prescribed `git add`, `git commit`, `npm run build`, `git push origin main` unconditionally. Under Cowork all four fail: the mount denies `unlink`, so every git index operation and every `next build` returns `EPERM` (GL-5). An agent following the skill from Cowork hits an opaque permissions error with no guidance. Step 4 also assumed `main` was only *ahead* of `origin/main`; it is currently `[ahead 12, behind 4]`, so the prescribed `git push` is rejected and the skill offers no divergence path. Separately, GL-5's own deletability probe (`touch x && rm x`) *creates* a file before testing whether files can be removed — when unlink is denied the probe leaves permanent litter. This session created `.loop_probe` and could not remove it.
**Rule:** Any skill that issues commands must gate on environment capability before issuing them, and must probe capabilities non-destructively — never by creating state it may be unable to clean up. Prescribing a command that cannot run in one of the three environments in active use is a defect in the skill, not a quirk of the environment.
**Remedy built in:** `branch-hygiene` gained Step 0 (capability probe against an *existing* throwaway path, with an explicit `READ/WRITE ONLY → hand off a commit script` branch) and a diverged-main section in Step 4 (`rev-list --left-right --count`, `pull --rebase`, mandatory rebuild after rebase, explicit no-force rule, hand off on conflict rather than resolve blind).
**Enforced by:** `branch-hygiene` Step 0 runs before Step 1 in every session; `repo-tidy` and `verify-cli-claims` both treat "command prescribed but never executed against the real target" as an unverified claim.

### L46 — Capability that exists in only one CLI tree is capability the other CLIs do not have
**What happened:** `.claude/skills` holds 29 skills, `.agents/skills` 11, `.gemini/skills` 10. Twenty exist only under `.claude/` — including `branch-hygiene`, `safe-commit-shared-repo`, `security-hardening`, `testing-framework` and `qe-automation`. Codex and Gemini sessions edit this repo with no branch discipline, no shared-repo commit safety and no security skill loaded, while commits `3bea1c3` and `951012e` show cross-tree parity was already understood to matter. Meanwhile the account-level `frontend-design-consultant` and `alignment-sweep` skills both declare that they read "each repo's own `.claude/skills/` at run time" for nota. **and Abundance** — and Abundance has zero skills in all three trees, making that premise false for half their declared scope.
**Rule:** A skill is only in force where its tree is loaded. Authoring into `.claude/` alone silently exempts every other CLI from the rule it encodes — and the safety skills are precisely the ones whose absence is invisible until something breaks. A skill that declares a scope must be checked against every repo in that scope, not just the one it was written in.
**Remedy built in:** Divergence quantified and recorded as open item 4 in `docs/HANDOVER-2026-08-02-memory-durability.md` with Claude Code as owner (Cowork cannot delete, so it cannot safely reconcile trees). Abundance's empty-tree problem recorded as item 5, requiring a decision rather than a silent copy.
**Enforced by:** `alignment-sweep` Pass 4 (skill-layer divergence) — extended to fail when a skill's stated scope names a repo whose tree does not contain it.

### L47 — Appending a lesson series without checking the existing range collides ten IDs silently
**What happened:** `docs/lessons.md` previously contained 56 lesson headings but only 46 unique IDs. L26–L35 each appeared **twice, with completely different content** — e.g. L29 was both "Preview/import features ship preview-first, write-later" and "Authoring for a repo you have not opened is invention, not consulting". Commit `c4de6f0 docs(lessons): add L29-L43` appended a second series beginning at L26 without checking that L26–L35 already existed. Twenty citations across `alignment-sweep`, `repo-tidy`, `canon-slop-audit`, `loop-orchestrator/references/engagement-scorecard.md`, the `.agents` mirror, and `HANDOVER-2026-07-29` pointed at ambiguous IDs until the orphan series was renumbered.
**Rule:** A lesson ID is a citation target, so appending to a lessons file is an API change, not a text edit. Derive the next ID from `grep -oE '^### L[0-9]+' | sort -V | tail -1` before writing, and after writing assert `unique == total`. Never renumber a cited series to resolve a collision — renumber the uncited one, or every downstream reference silently retargets.
**Remedy built in:** Collision quantified and a renumbering spec with citation-safety constraints recorded as open item 7 in `docs/HANDOVER-2026-08-02-memory-durability.md`, owned by Claude Code. Not executed from Cowork: the fix spans `.claude/`, `.agents/` and `.gemini/` trees plus handover docs, and a blind renumber would break the twenty live citations it is meant to protect.
**Enforced by:** `alignment-sweep` Pass 6 (doc freshness) extended with an integrity assertion on `docs/lessons.md` — unique lesson IDs must equal total lesson headings, and any duplicate ID is a HIGH finding. `repo-tidy` step 7 (repo-level file; the account-level skill of the same name has a different phase structure and does not govern this repo) checks the same before any merge to main.

### L58 — A hand-off pack must separate reversible steps from irreversible ones
**What happened:** The 2026-08-02 prompt pack bundled `git commit` (local, reversible), `git pull --rebase` over twelve local commits (hard to reverse), `git push` (public), and `git branch -d` into a single Prompt 1, with no recovery ref created first and no requirement to paste the preceding verification verdict. Claude Code refused to run it, correctly citing that the pack contained rebase, push, branch deletion and hook modification as one undifferentiated block. The refusal was right and the pack was wrong: a `git branch backup/<name>` before the risky step costs nothing and makes every subsequent action a one-command undo. Separately, the pack asserted `main` was `[ahead 12, behind 4]` from a Cowork sandbox that could not `git fetch` — stale tracking data presented as current state.
**Rule:** Split hand-off packs at the reversibility boundary, not the topic boundary. Everything local and undoable goes in one prompt that ends with "stop and report"; anything that rewrites history, publishes, or deletes goes in a separate gated prompt that begins by creating a recovery ref and re-measuring the state itself. Never carry a measurement across an environment boundary — state that a hand-off asserts must be re-established by the executing agent, because the authoring agent may not have been able to observe it. An agent refusing a hand-off on safety grounds is the system working; treat the refusal as a finding about the pack.
**Remedy built in:** Prompt 1 split into Prompt 1 (commit only, creates `backup/pre-durability-2026-08-02`, ends in a mandatory stop) and Prompt 1b (fetch, measure real divergence, branch on the actual conflict surface, `rebase --abort` and report on conflict, explicit `git reset --hard <backup>` recovery line, `-d` never `-D`). Prompt 1 now requires Prompt 0's verdict to be pasted before it may run.
**Enforced by:** `branch-hygiene` Step 0 (hand off a script when the environment cannot commit) and Step 4's diverged-main path, which already requires measuring `rev-list --left-right --count` rather than trusting a prior report; this lesson extends that requirement to any state claim inherited from another agent's document.

### L59 — `git status` is not a read-only command, and in Cowork it strands a lock that blocks everyone
**What happened:** A Cowork session ran `git status --short docs/lessons.md` to check whether a file was modified — an apparently harmless read. `git status` refreshes the index, which acquires `.git/index.lock`. The Cowork mount denies `unlink`, so git could not remove its own lock: `warning: unable to unlink '.git/index.lock': Operation not permitted`. A 0-byte stale lock was left behind, blocking every `git add`, `commit`, `rebase` and `status` for **every tool and every human** touching the repo — the identical environment-wide outage recorded as GL-6 on 2026-07-27, reproduced from the read side rather than the write side. GL-5 had correctly said "no git index operations from Cowork", but everyone including its author read that as "no commits", not "no status".
**Rule:** From a mount that denies `unlink`, the only safe git commands are ones that never touch the index: `git log`, `git show`, `git rev-list`, `git branch --list`, `git ls-files`, `git cat-file`. **`git status`, `git diff` against the worktree, `git add`, `git commit`, `git stash` and `git rebase` all take the index lock and will strand it.** To ask "is this file modified" without the index, use `git diff --no-index` against a `git show HEAD:<path>` dump, or simply compare mtimes. Treat GL-5 as covering reads, not just writes.
**Remedy built in:** The blocker and its one-line fix now open `docs/HANDOVER-2026-08-02-memory-durability.md` as the first section, per GL-6. `branch-hygiene` Step 0 already routes `READ/WRITE ONLY` environments to a hand-off script; this lesson names the specific read commands that are unsafe there, which Step 0 previously did not.
**Enforced by:** `branch-hygiene` Step 0 — its capability probe now precedes any git use, and a `READ/WRITE ONLY` result forbids index-touching commands including `git status`. `alignment-sweep` Pass 8 already reports a stale `.git/index.lock` as a HIGH finding (GL-6).

### L60 — A remedy's own comment can be wrong; test the command, not the prose next to it
**What happened:** L45's remedy for `branch-hygiene` Step 0 added a comment reading "Probe an existing throwaway path — never create one, or you leave litter you cannot remove," directly above a command that still did `touch .git/.hygiene_probe && rm .git/.hygiene_probe` — creating a new file first. If `rm` failed silently under a mount that denies `unlink`, that file was exactly the litter the comment claimed to avoid. GL-10 predicted this exact pattern (a rule violated within the same session that wrote it); this is a second, independent instance of it, caught only by re-executing the probe rather than reading its comment.
**Rule:** A comment describing what a command does is a claim, not evidence. When reviewing or writing a safety probe, run it and inspect what it actually touches on disk — don't accept prose adjacent to code as proof of the code's behavior.
**Remedy built in:** Step 0's probe now uses `mktemp` in OS scratch space instead of a path inside the repo, so a failed `rm` can never strand anything the repo mount can't clean up, regardless of what any comment claims.
**Enforced by:** Not currently automated — this is a code-review discipline, not a grep-able pattern. `alignment-sweep` Pass 2 addendum (GL-7) is the closest existing mechanism (re-verify a claimed remedy against its target file) and should be read as covering "remedy comments" too, not just "Resolved" lesson notes.

### L61 — A hook rewritten for one shell must be tested in that shell, not just read
**What happened:** The `.husky/pre-push` additions for lesson-ID integrity, dead-canon-pointer, and skill-tree-parity checks (2026-08-03) were first written using `comm -23 <(...) <(...)` — process substitution, which is a bash-only construct. The hook's shebang is `#!/bin/sh`, and this repo's `sh` is dash, which doesn't support it. Direct invocation (`sh .husky/pre-push`) caught the syntax error immediately; had it not been tested this way before a real push, the skill-tree-parity check would have silently thrown a shell error on every push to `main` rather than running.
**Rule:** A shell script's shebang defines its actual execution environment, not the shell you happen to be typing commands in. Any script with `#!/bin/sh` must be verified against a real `sh`/dash invocation (`sh script.sh` or `dash -n script.sh` for syntax-only), not just visually reviewed or run under whatever the author's interactive shell happens to be.
**Remedy built in:** Rewrote the check using portable temp files (`ls ... > /tmp/...$$`) instead of process substitution, then re-ran `sh .husky/pre-push` to confirm the fix before it landed.
**Enforced by:** `safe-commit-shared-repo`'s "testing a new git hook" section already requires direct invocation before trusting a hook; this lesson adds the specific case of shell-portability bugs that only surface under the shebang's actual interpreter, not the author's shell.

### L62 — A regex broadened to close one gap can open a false positive somewhere else in the same pass
**What happened:** The pre-push dead-canon-pointer check (L47/GL-3/GL-7) originally scanned only `docs/index.md`, `CLAUDE.md`, `AGENTS.md` — too narrow, and missed a live stale pointer in `docs/launch/LAUNCH_MAESTRO_INTEGRATION.md` (found by an independent loop-orchestrator critique, 2026-08-03). The first fix broadened the *file scope* to include `docs/launch/`, which would have then flagged `~/.claude/plugins/launch-maestro/...` in that same file — a correct, real plugin path, not a stale canon pointer. GL-3/GL-7 is specifically about four canon files (`CLAUDE.md`, `PROJECTS.md`, `LESSONS.md`, `profile.md`) that moved to `claude-global/`; it was never a claim that all of `~/.claude/` is unreachable or wrong.
**Rule:** When fixing a detector's false negative (missed a real case), re-check whether the fix introduces a false positive elsewhere before shipping it — broadening scope and narrowing precision are two different fixes, and a gap found in one dimension is often best closed by tightening the other, not just scanning more files with the same loose pattern.
**Remedy built in:** Narrowed the regex to the four actual canon filenames (`CLAUDE|PROJECTS|LESSONS|profile\.md`) instead of matching any `~/.claude/*.md`, then broadened the file scope to include `docs/launch/` and `docs/HANDOVER.md` safely on top of that.
**Enforced by:** `.husky/pre-push`'s dead-canon-pointer check, re-tested against both the original failing case (`docs/launch/LAUNCH_MAESTRO_INTEGRATION.md`, now clean) and a real duplicate-ID failure case before this landed.

---

## 2026-07-27 — PR #82 skill hygiene and review hardening

Context: PR #82 restored and hardened repo skills after review surfaced tampered skill bodies, stale audit claims, and missing integrity checks. These entries were appended at fresh IDs during the 2026-08-11 merge with `main` so existing `L36-L62` citations keep their original meanings.

### L63 — A skill's "scope" or "rule" content can go stale even when its name still fires correctly
**What happened:** The global `repo-tidy` skill's Phase 5 hardcoded a "locked MVP scope" that matched no current repo. It went unnoticed until read closely mid-run; a single-pass audit would have quietly produced a wrong or empty scope-purge result.
**Rule:** Any skill step that encodes "current scope," "locked features," or similar project-state facts must read that state live from the target repo's own AGENTS.md/CLAUDE.md at run time. If no such source exists, the skill must say so explicitly rather than silently applying a stale or borrowed list.
**Enforced by:** `repo-tidy` Phase 5 rewritten to read scope from the target repo's docs at run time and report an explicit skipped state instead of guessing.

### L64 — A misleading commit message is a bigger threat than an obviously-bad diff
**What happened:** Commit `55b2d2d` claimed to trim `repo-tidy` and `verify-cli-claims` into pointer copies, but the diff replaced mature safety skills with short instructions that could silently rewrite output and prompt-delete branches, then mirrored those replacements across `.claude/`, `.agents/`, and `.gemini/`.
**Rule:** When a skill/doc's content materially differs from what its commit message or catalog description implies, run `git log -p --follow` on that file before treating the mismatch as ordinary drift. Treat "silently rewrite / silently replace" instructions in any skill as a stop-and-flag condition.
**Enforced by:** restored `.claude/skills/repo-tidy` and `.claude/skills/verify-cli-claims` from pre-55b2d2d history; `.agents/` and `.gemini/` copies are thin pointers to the canonical `.claude/` bodies.

### L65 — "Consolidation" and "pointer" commits need the same scrutiny as feature commits
**What happened:** The tampering in L64 was framed as low-risk tooling hygiene. The administrative wording made the change easy to skim even though it altered instructions consumed by future agents.
**Rule:** Any "refactor / consolidate / dedupe" commit touching skill, doc, or config files gets a full before/after content read. Do not assume a consolidation diff matches the message because the message sounds mechanical.
**Enforced by:** `scripts/check-skill-integrity.mjs` content-hash enforcement catches unexpected skill-body changes regardless of the commit message.

### L66 — The loop only works if it self-triggers
**What happened:** The skill-tampering incident was found because the user explicitly asked for a loop after an initial pass had already declared the work done. The existing "substantial work" trigger was too fuzzy and failed to fire.
**Rule:** Self-trigger the loop whenever work touches `.claude/skills/`, `.agents/skills/`, or `.gemini/skills/`; spans more than one repo; or finds a file whose content contradicts its own commit message, catalog, or README description. Skipping the loop when a trigger is present must be reported.
**Enforced by:** `CLAUDE.md` rule 12 now names these concrete self-trigger conditions.

### L67 — A commit-message keyword check does not detect content tampering; only a content hash does
**What happened:** A first guard design checked whether changed skill filenames appeared in commit messages. The real bad commit would have passed because it named the files while misdescribing the content change.
**Rule:** A tamper guard must check artifact content against a committed, reviewable baseline, not proxy signals like commit messages, labels, or descriptions. Test every new integrity check against the real incident it is meant to catch.
**Enforced by:** `scripts/check-skill-integrity.mjs` checks skill file hashes against `docs/skills.lock.json`, with relocking reserved for deliberate `npm run skills:relock` changes.

### L68 — A plausible-sounding rule ID is not a verified rule ID
**What happened:** A SonarCloud failure was initially attributed to the wrong JavaScript rule ID and severity from memory. The first fix improved style but had no effect on the real Quality Gate.
**Rule:** Before naming a third-party rule ID, severity, or tool behavior as the diagnosis for a real failure, verify it against the tool's own documentation or current source. If unverified, label it as suspected rather than fact.
**Enforced by:** `verify-cli-claims` now has a claim-type section for named rule/tool diagnoses and requires external verification before a "Verified" verdict.

### L69 — "No app code references it" needs dynamic-access and RPC checks
**What happened:** A table audit initially classified candidates using literal string search across app code. That missed possible access through RPC functions, triggers, generic query helpers, and non-app surfaces.
**Rule:** "No app code references table X" is only reviewed until the audit checks literal usage, dynamic query builders, `.rpc(` calls, migration-defined functions/triggers, and every declared surface such as `app/`, `lib/`, `components/`, `scripts/`, and `supabase/functions/`.
**Enforced by:** `.claude/skills/db-table-usage-audit/SKILL.md` bakes those checks into the ORPHANED verdict requirements.

### L70 — A hook file passing manually is not proof it fires on a real git event
**What happened:** Claims that the pre-push guard blocked bad pushes were based on manual script execution, not proof that Git resolved and fired the hook.
**Rule:** A hook claim requires checking the actual hook path, `core.hooksPath`, the named hook file, and any required hook runner binary. Verify each claimed hook independently.
**Enforced by:** `verify-cli-claims` now includes a hook-verification correction for pre-push and pre-commit claims.

### L71 — "No node_modules" silently downgrades build and typecheck claims to unverifiable
**What happened:** Prior summaries referenced build, lint, and typecheck commands as standards without first confirming the local toolchain existed in the sandbox.
**Rule:** Before citing a local command as verification evidence, confirm the declared binary or package script can execute in the current environment. If not, report the claim as unverifiable rather than substituting an unpinned fallback.
**Enforced by:** `verify-cli-claims` now forbids unpinned `npx tsc` fallback and treats missing local compiler/scripts as Unverifiable.

### L72 — A canonical lessons doc needs its own ID-uniqueness check
**What happened:** Two independent sessions previously authored overlapping lesson IDs, and cross-references silently became ambiguous until review caught the collision. The current file has since been renumbered and `npm run lessons:check` verifies 72 unique lesson IDs.
**Rule:** Before adding lesson entries, derive the next ID from the existing headings and assert unique heading count equals total heading count after the edit.
**Enforced by:** `scripts/check-lesson-ids.mjs`, `npm run lessons:check`, `.husky/pre-push`, and `.github/workflows/skill-integrity.yml`.
