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
