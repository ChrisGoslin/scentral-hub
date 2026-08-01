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
