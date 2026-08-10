# Spike: Buzz repo provenance, Buzz value assessment, alignment-sweep health

> **Archived cross-silo investigation.** This file grants no authority to inspect,
> modify, promote, or delete `~/Projects/buzz`, scheduled skills, account-level skills,
> or any other repository. Re-open only under a fresh task that names those targets.

**Owner:** Cowork (this spike is written for a Cowork session to execute — sandboxed
investigation, no filesystem-destructive steps required for Part 1–2; Part 3 is read-only).
**Opened:** 2026-08-09
**Context:** A 7.8GB untracked directory `buzz/` was found sitting inside the scentral-hub
repo root during an unrelated commit-script cleanup. It was moved out to
`~/Projects/buzz` (sibling location, not registered in the portfolio router yet). It was
**never git-tracked in scentral-hub** (`git log --all -- buzz` returns nothing) — so it
arrived as loose filesystem content, not a commit, merge, or checkout.

---

## ⚠️ Findings that change this spike — added 2026-08-09, verified

**1. Part 2 is already answered. `buzz` is not your IP.**
```
$ git -C ~/Projects/buzz remote -v
origin  https://github.com/block/buzz.git (fetch)
$ git -C ~/Projects/buzz log --oneline -1
96ae14176 fix(desktop): skip native notifications outside app bundles (#5004)
```
It is **Block's open-source project**, cloned intact with its own history and origin.
So Part 2's questions — "is this Christopher's own IP", "should parts be promoted into
`claude-global/`" — have a definite answer: **no, and no.** Promoting anything from a
third-party OSS clone into personal canon would violate the hard-siloing rule in
`claude-global/CLAUDE.md`. Part 2 collapses from an investigation to a one-line
disposition: **keep the clone as a reference, or delete 7.8GB.** Nothing to assess.

**2. Part 1's mechanism is effectively confirmed.** Never tracked in `scentral-hub`,
carries its own `origin` → someone ran `git clone https://github.com/block/buzz.git`
with cwd `~/Projects/scentral-hub` instead of `~/Projects`. The filesystem cannot say
*which* session; the 175 stored session transcripts can. Steps 1–3 and 5 below are
largely spent — go straight to step 4, and keep the guardrail recommendation.

**3. Part 3 risks duplicating existing work.** The `alignment-sweep` visibility gap was
diagnosed on 2026-08-02: it exists in **five** copies, and the only one that runs
unattended (`~/Claude/Scheduled/monthly-alignment-sweep/SKILL.md`) is outside
`~/Projects`, invisible to Cowork, and lacks the integrity checks. That is open item 11
with **Prompt 6 already written**, including a self-check pass. Read
`docs/HANDOVER-2026-08-02-memory-durability.md` and
`docs/todo/claude-code-prompts-2026-08-02.md` **before** running Part 3.

**4. Ordering — this matters more than the spike.** As of 2026-08-09 the entire
2026-08-02 durability work is **still untracked**: handover, prompt pack, commit script
and addenda are all present on disk and none are committed. Prompts 0, 1, 2, 5 and 6
have not run. Running Part 3 now would rediscover a documented gap against a system
whose repairs were specified and never applied.

**Land the durability work first** (`docs/todo/RUNBOOK-2026-08-09.md`). Part 3 then
becomes *verify the fix worked* rather than *rediscover the problem*.

---

## Part 1 — Provenance: how did buzz/ get inside scentral-hub?

**Goal:** determine which session/tool/action placed it there, and close the hole so it
can't recur silently in another repo.

Investigate:
1. Filesystem timestamps — `stat` on `buzz/` top-level files and a few nested dirs
   (`buzz/.git`, `buzz/Cargo.lock`) to bracket when it landed. Compare against scentral-hub
   session history / commit timestamps around that window.
2. Check `buzz/.git` (if present) for its own remote/origin and clone date —
   `git -C buzz log -1`, `git -C buzz remote -v` — to confirm what was cloned and when,
   independent of scentral-hub's history.
3. Search recent HANDOVER/session docs in `docs/` and `docs/todo/` for any mention of
   "buzz" — a session may have described intending to reference or vendor it.
4. Check shell history / Cowork session transcripts if available for a `git clone`,
   `cp -r`, or `mv` invocation whose destination resolved into scentral-hub's working
   directory — the likely failure mode is a relative-path command run from the wrong cwd
   (Cowork mount ambiguity has precedent — see GL-5/GL-6 in AGENTS.md canon on Cowork
   mount and lock issues).
5. Confirm scentral-hub's `.gitignore` — did it ever risk staging buzz/ (e.g. a stray
   `git add -A` in a script)? Check `docs/todo/commit-2026-08-02.sh` and any other
   `git add -A` usage repo-wide — this repo's canon (`safe-commit-shared-repo` skill)
   explicitly forbids `git add -A` for exactly this class of risk.

**Deliverable:** one paragraph naming the likely mechanism (tool + action + probable
cwd mistake), plus one concrete guardrail recommendation (e.g. a pre-commit check that
fails if an untracked dir >100MB appears at repo root) if the mechanism is proveable.
If not proveable, say so plainly rather than guessing.

---

## Part 2 — What is Buzz, and is it worth keeping?

Christopher's read: Buzz felt useful to his **global working patterns**, not tied to any
one app (nota., Household Finance, ABunDance). Verify or correct that read from the
repo's own content — do not take the instinct as settled fact.

Investigate (`~/Projects/buzz`, read-only):
1. Read `VISION.md`, `VISION_SOVEREIGN.md`, `VISION_AGENT.md`, `VISION_MESH.md`,
   `VISION_MODERATION.md`, `VISION_PROJECTS.md`, `VISION_ACTIVITY.md`, `ARCHITECTURE.md`,
   `README.md`, `GOVERNANCE.md` — synthesize: what does Buzz actually do (product
   category, e.g. federated social/messaging, agent mesh, moderation tooling)?
2. Check `buzz/.git` remote — is this Christopher's own fork/original work, or a clone of
   someone else's open-source project? This changes the "value" framing entirely (owned
   IP vs. reference material vs. dependency).
3. Check `Cargo.toml` / `package.json` workspace structure, `crates/`, `web/`,
   `admin-web/`, `desktop/` — is this a shipped/shippable product, a prototype, or
   scaffolding?
4. Check `.claude/`, `.codex/`, `.agents/`, `.goose/`, `.hermit/`, `.intersect/` dirs
   inside buzz — these look like agent-tooling config directories. Do any of them contain
   reusable skills, hooks, or agent patterns that are genuinely cross-project (matching
   Christopher's instinct) versus Buzz-specific?
5. Check `CHANGELOG.md` / `RELEASING.md` / last commit date for how alive/stale the
   project is.

**Deliverable:** a verdict — (a) what Buzz is in one sentence, (b) whether it's
Christopher's own work or external, (c) whether any part of it belongs promoted into
`claude-global/` as reusable tooling (per AGENTS.md §16.4/§12 — cross-project patterns get
proposed, never auto-applied), and (d) a recommendation: register it in `PROJECTS.md` as
its own silo, archive it, or discard the copy.

---

## Part 3 — alignment-sweep: why no visible output?

**Context:** the `alignment-sweep` skill exists in scentral-hub
(`.claude/skills/alignment-sweep/SKILL.md`, currently showing as locally modified/uncommitted)
and is described as a "monthly whole-system drift check" producing "one ranked report."
Christopher hasn't seen output from it comparable to what he sees from tools like
`last30days` or other starred/actively-used skills — investigate why.

Investigate:
1. Read the current `.claude/skills/alignment-sweep/SKILL.md` in full, and diff it against
   `git show HEAD:.claude/skills/alignment-sweep/SKILL.md` to see exactly what's
   uncommitted and unresolved right now.
2. Search `docs/` for any report artifacts the skill is supposed to produce — does it
   write output to a file, or only to chat? If chat-only, that's likely why it "hasn't
   been seen" — nothing persists to point back to.
3. Check whether alignment-sweep has ever actually been invoked — search session
   handovers/lessons (`docs/lessons.md`, `docs/HANDOVER-*.md`) for any prior run record,
   output summary, or "ran the sweep" mention.
4. Compare its trigger conditions ("monthly, before a release, after a multi-session
   sprint") against actual usage cadence — is it simply never being triggered because
   nothing prompts it proactively?
5. Contrast with `last30days`: that skill has a visible `doctor` health check and reports
   "Last run" status directly in session context (see SessionStart hook). alignment-sweep
   has no equivalent status surface — confirm this gap and note it as the likely root
   cause of "not seeing it."

**Deliverable:** state plainly (a) whether alignment-sweep has ever produced real output,
(b) where that output would live if it had, (c) the specific reason Christopher hasn't seen
results (never run vs. output not surfaced vs. still uncommitted/broken skill definition),
and (d) one concrete fix — e.g. give it a status line like last30days' `doctor`, or make it
write a dated report file under `docs/` that later sessions can list.

---

## Ground rules for this spike

- Read-only for Part 2 and Part 3. Part 1 is read-only except the guardrail
  recommendation, which is a proposal, not an applied change.
- No deletion of `buzz/` or any scentral-hub file without separate explicit approval.
- No `git add -A`, no force operations.
- Report findings as evidence (file path + line/quote), not inference dressed as fact —
  per AGENTS.md §5 (no inherited claims, no invented authority).
