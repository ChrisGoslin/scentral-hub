# Canonical guardrails — lessons, preflight, state completeness

Paste this entire file into Claude Code Prompt 0 or reference it from the repo once placed at `docs/CANONICAL-GUARDRAILS.md`.

These are the three guardrails that prevent the eight failures documented in `lessons.md`. Read in order: lessons → preflight → state-completeness.

---

## lessons.md — embedded lessons

Append-only. Each entry: what happened, the rule it becomes, how it's enforced. The point is that a rule with no enforcement mechanism is a wish.

### 2026-07 — nota. The Read implementation review

Context: designed and converted "The Read" (onboarding scent-identity reveal) from Grimoire → HTML → React → repo, then self-audited as PO+architect. The craft was strong; the product discipline was weak. Eight lessons, each with a trigger and a guard.

#### L1 — Read the existing codebase BEFORE building anything
**What happened:** Built a full React suite (`CeremonyProvider`, `TheReadCanvas`, `IdentityReveal`) before cloning the repo, then found a fuller shipped system (`ReadClient.tsx`) already existed. Wasted work; nearly landed a worse duplicate.
**Rule:** For any change to an existing product, the first action is to read the relevant repo surface. No component is authored until the current implementation is understood.
**Enforced by:** `implementation-preflight` skill, gate 1. Ask for repo access up front.

#### L2 — A screen is not done until every state is designed
**What happened:** Every Read artifact assumed a successful reveal. No loading, empty, error, or "miss" state — despite doctrine explicitly requiring "The Read missed. That's on us."
**Rule:** No screen ships without its full state matrix: loading · empty · error · success · **plus the product-specific trust state** (for nota.: the "you misread me" recovery). Happy-path-only is an incomplete deliverable, not a draft.
**Enforced by:** `screen-state-completeness` skill (authored from this review).

#### L3 — Guard the brand's load-bearing mechanism first, theatre second
**What happened:** Built the reveal's ceremony and animation but omitted the reaction loop (✅ feels like me / 😅 close / ❌ not quite) — the single most important trust mechanism on the screen.
**Rule:** Identify the one element that carries the screen's *target emotion* (recognition, trust, ownership…) and build it first. Polish serves it; it never substitutes for it.
**Enforced by:** `screen-state-completeness` + the nota-customer-experience emotion-map review.

#### L4 — Don't commit the violation you were hired to catch
**What happened:** Opened the engagement flagging others' misuse of the dot as decoration, then used olive dots as decorative bullets in my own specimen table.
**Rule:** Before delivering, re-run the brand's own hard-rule checklist against your own output, not just the input you reviewed.
**Enforced by:** self-review step in `implementation-preflight`; run the brand hard-rules over the diff.

#### L5 — "Verified" means it compiled, not that the tags balanced
**What happened:** Repeatedly reported work as "verified" on structural checks (tag balance, grep counts) with zero `build`/`tsc`/test runs.
**Rule:** The word "verified" is reserved for output that passed a build, a type-check, and the existing test suite. Structural checks are "reviewed," never "verified." State the distinction explicitly.
**Enforced by:** existing `verify-cli-claims` skill + a hard vocabulary rule; every claim tagged reviewed vs verified.

#### L6 — Reduce sources of truth; never add one silently
**What happened:** Repo already had two disagreeing token files; my fix added a third that wins by load order rather than consolidating. Also created a 4th and 5th canonical-ish doc (audit, plan) with no declared owner.
**Rule:** When you touch a system with multiple sources of truth, the change must name the canonical one and reduce the count — or explicitly state why it can't yet. Adding a file that out-ranks rather than replaces is debt.
**Enforced by:** `implementation-preflight` gate: "canonical source named? file count going down?"

#### L7 — Instrument every claim that "this needs measuring"
**What happened:** Insisted the 1200ms hold, mode preference, and regeneration rate "must be user-tested," while the app had PostHog and I proposed zero events.
**Rule:** If you assert something needs data, you propose the events to capture it in the same breath. No measurement claim without a measurement plan.
**Enforced by:** `implementation-preflight` gate: "measurement plan attached?"

#### L8 — Ask "is this the highest-value thing?" before gold-plating
**What happened:** Spent the whole engagement on the paint of one onboarding screen for a product whose value prop is fragrance discovery / dupes / community. Never raised opportunity cost.
**Rule:** For any sizeable build, state where it sits in the product's value hierarchy and confirm it's the right investment now. Craft on the wrong surface is still waste.
**Enforced by:** `implementation-preflight` opportunity-cost gate (final question before work starts).

---

## implementation-preflight skill

Run BEFORE writing or changing any UI/feature code in an existing product. A six-gate checklist that prevents the recurring failures of building before reading the repo, shipping happy-path-only screens, claiming "verified" without a build, adding sources of truth, asserting things need measuring without a measurement plan, and gold-plating low-value surfaces.

### Six gates

Answer each in writing before authoring code. If a gate can't be passed, that is the finding — surface it and stop, don't proceed on assumption. The gates exist because each maps to a real, expensive mistake already made.

Output a short **Preflight** block (the six answers) before any implementation. Keep it proportional — a few lines per gate, not an essay.

#### Gate 1 — Read before build

- Have I read the existing implementation of this surface in the repo?
- Does something like it already exist that I should extend, not duplicate?
- If I don't have repo access yet, STOP and request it. Never author components for an existing product sight-unseen.

Failure this prevents: building a duplicate suite, then discovering a fuller version already shipped.

#### Gate 2 — Full state matrix, not the happy path

List every state the surface must handle before building any of them:

- loading · empty · error · success
- **the product-specific trust/recovery state** — the moment the product is wrong and must own it gracefully (for nota.: the "you misread me" reaction and regenerate loop)
- accessibility states: keyboard, focus, screen-reader announcement of async changes (`aria-live`), reduced motion

A screen delivered with only the success state is incomplete, not a draft. Build the trust/recovery state FIRST — it carries the emotion.

#### Gate 3 — Reserve the word "verified"

- "Verified" = passed a build, a type-check, and the existing test suite.
- Structural checks (tag balance, grep, file counts) are "reviewed", never "verified". State which one every claim is.
- If you cannot run the build in this environment, say so, and mark the work "reviewed, unbuilt" — do not imply otherwise.

#### Gate 4 — Sources of truth go down, not up

- Am I adding a config/token/canonical file? Does it REPLACE or merely out-rank an existing one?
- Name the single canonical source for this concern. If my change increases the count of competing sources, justify it explicitly or consolidate instead.
- Winning by load order / specificity is debt, not a fix.

#### Gate 5 — Every "needs measuring" ships with its events

- Did I claim any decision "should be tested / measured / validated"?
- Then attach the measurement plan in the same breath: which analytics events, which properties, what threshold would decide it.
- No measurement assertion without a measurement plan.

#### Gate 6 — Opportunity cost

- Where does this work sit in the product's value hierarchy?
- Is this the highest-value thing to build right now, or am I polishing a low-traffic / non-core surface?
- State the answer plainly. Craft on the wrong surface is still waste.

### Self-review before delivery (the seventh, implicit gate)

Re-run the project's own brand/design hard-rules over YOUR diff — not just over the input you were reviewing. The violation you flagged in someone else's work is the one you're most likely to commit in your own.

### Output shape

```
Preflight
1. Read: <what exists / extend vs new>
2. States: <full matrix + which trust state, built first>
3. Verified vs reviewed: <what level of proof this will carry>
4. Canonical source: <named; file count going up/down>
5. Measurement: <events, or "none needed because…">
6. Opportunity cost: <value-hierarchy placement>
```

Then implement. Then run verify-cli-claims on the result.

---

## screen-state-completeness skill

Ensure every screen, component, or flow is designed for ALL of its states, not just the happy path. Trigger when designing, reviewing, or building any user-facing surface.

### Core principle

A surface is not complete when the success case looks good. It is complete when every state a real user will hit is designed, and the state that carries the screen's emotion is built first.

### The state matrix (design all, before building any)

| State | The question | Failure if skipped |
|---|---|---|
| Loading | What does waiting feel like? Skeleton, held breath, or nothing? | Spinner slop, or a flash of empty |
| Empty | First-run and zero-data. Invitation, not void. | Dead-end; user doesn't know what to do |
| Error | The system failed. Own it calmly, offer the next step. | Blame, jargon, or a stuck user |
| Success | The happy path. | (usually the only one built) |
| **Trust / recovery** | The product was *wrong about the user*. How does it own that without shame? | The deepest trust breach — user feels assessed, not seen |
| Partial / thin | Data came back sparse or degraded. | Layout breaks; looks broken |

### Accessibility states (not optional)

- Keyboard: every action reachable and operable, visible focus.
- Screen reader: async content changes announced (`aria-live`), reveals and timed sequences don't leave SR users in silence.
- Reduced motion: the surface arrives without performing.
- Large text / narrow width: no clipping, no overlap.

### Order of construction

1. Identify the screen's **one target emotion** (recognition, ownership, trust, belonging…).
2. Identify the single element that carries it.
3. Build that first — including its failure/recovery state.
4. Then loading/empty/error/partial. Then polish.

Theatre never substitutes for the emotion-carrying mechanism. If you built the animation before the trust state, you built it in the wrong order.

### Review output

```
Target emotion: <one, from the map>
States designed: loading / empty / error / success / trust-recovery / partial  (✓ or GAP each)
Emotion-carrying element: <what it is; built first? y/n>
A11y: keyboard / SR-announce / reduced-motion / large-text  (✓ or GAP each)
Gaps to close before "done": <ranked list>
```

Final test: if the product misreads the user here, does the screen make them feel owned-up-to, or judged? Only the first is acceptable.

---

## How to use this file

**In Claude Code Prompt 0, paste this entire file and say:**

> I'm adding canonical guardrails to the repo. Place this file at `docs/CANONICAL-GUARDRAILS.md`. The file contains three enforcement systems:
> - **lessons.md** — eight lessons and their enforcement gates
> - **implementation-preflight** — six-gate checklist before code
> - **screen-state-completeness** — full state matrix enforcement
>
> Read this file before every prompt, and reference it explicitly when a gate needs to be applied. If installing as skills, extract the `implementation-preflight` and `screen-state-completeness` sections into `.claude/skills/<name>/SKILL.md`.

**Reference in prompts:**
Every Claude Code prompt should open with: "Read docs/CANONICAL-GUARDRAILS.md and apply the preflight + state-completeness checks before proceeding."

This ensures the eight lessons stay active across every build.
