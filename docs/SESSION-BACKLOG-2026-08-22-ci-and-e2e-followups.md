# Session Backlog — CI & E2E Follow-ups (2026-08-22)

**Purpose:** Christopher is consolidating scattered canon/backlog docs into one place.
This file is a session-scoped drop for *this* session's findings — fold the relevant
items into whatever the consolidated backlog ends up being; don't treat this filename
as a new permanent canon doc.

**Connected receipt:** [PR #98](https://github.com/ChrisGoslin/scentral-hub/pull/98)
— `fix: dead HeroSection + stale e2e tests, canon doc forks, canon-uniqueness guard`.
Everything already fixed this session (dead `HeroSection.tsx` removal, rewritten
`hero-screen-states.spec.ts`, `big-bets.spec.ts` locator fix, canon doc de-duplication,
the `check-canon-uniqueness.mjs` pre-push guard, the perf-gate repointing) is claimed
fixed and committed there. **Read that PR's diff yourself before relying on any of
it — a commit message or PR description is a claim, not verification (this session's
own incident was exactly this: a prior agent's unverified "done" claim getting
inherited and repeated). Re-derive the state you need from the live diff/tests, don't
just cite the PR.**

Everything below is **not yet fixed** — each entry has enough context for any CLI to
pick up cold.

---

## 1. `/wheel` renders "User ID not found" for the E2E test's auth setup

**Status:** confirmed real, not yet root-caused or fixed.

**How it was found:** fixing `e2e/big-bets.spec.ts`'s broken root-container locator
(it was matching a hidden decoy `<div>` and always failing before reaching its second
assertion) let the test execute further for the first time. The second assertion —
looking for a radar-chart SVG or an empty-state CTA — now fails because the page body
is just `User ID not found / Try again`, not the wheel UI at all.

**Repro:**
```bash
npm run build && npm run start:e2e &
npx playwright test e2e/big-bets.spec.ts:12 --project=chromium
```
or manually: the test's `beforeEach` sets only
`localStorage.scentral_onboarded = 'true'` and `localStorage.scentral_vibe = 'fresh'`
before visiting `/wheel`.

**Working hypothesis, not verified:** `CLAUDE.md` §3 documents a mixed identity model —
newer nota-era tables use real Supabase Auth (`user_id uuid`), while `scentral_*`
localStorage keys are the legacy anon-id system. `/wheel` may now require a real
Supabase session (or a real `anon_id`, not just the two `scentral_onboarded`/`scentral_vibe`
flags) and is correctly refusing to render without one. If so, this is a **test setup
gap**, not a product bug — the test needs whatever `E2E_AUTH_BYPASS` or seeded-user
mechanism the rest of the suite uses (grep other passing e2e specs for how they
establish a signed-in user before treating this as a real regression).

**Next step for whoever picks this up:** read `app/wheel/page.tsx` (or wherever the
"User ID not found" string lives) to find what it actually checks for, then decide:
fix the test's auth setup, or if the page really has no valid entry path for a
returning-but-signed-out user, that's a product gap worth its own ticket.

---

## 2. Repo-wide lint debt: 12 errors, 102 warnings

**Status:** partially being worked by a concurrent session on this same branch as of
2026-08-22 (see commits after `ae69f2a` on `fix/canon-fork-and-taupe-contrast` — check
`git log` before assuming this is still all outstanding).

**Evidence:** `npm run lint` (or the `lint` CI job on PR #98) — as of the last full run
this session, failures included `scripts/demo-spikes.ts:81-82` (`prefer-const` on
`bottleA`/`bottleB`) plus ~100 `no-unused-vars` warnings scattered across
`scripts/`, `tests/spikes/`. None of this is caused by anything in PR #98's diff —
it's pre-existing debt the `lint` CI job has presumably been silently red on top of
for a while (same root cause as item 4 below: red CI landing anyway).

**Next step:** `npm run lint -- --fix` will clear the 2 auto-fixable errors; the
unused-var warnings need an actual pass deciding which are dead code vs. mis-prefixed
intentional exports (repo convention per the eslint rule: unused vars must match `/^_/`).

---

## 3. `Spell & Typo Check` CI job has no exclusions — flags archived docs

**Status:** not fixed. Low priority, cosmetic.

**Evidence:** `crate-ci/typos@master` runs with zero config (`find . -iname
"*.typos*" -o -iname "typos.toml"` returns nothing in repo root). It's flagging
real prose inside `docs/archived/**` and `docs/ARCHIVE/**` — e.g. "SuperValu" (Irish
grocery chain) misread as "Super Value", "Individuel" (a real Montblanc fragrance name)
misread as "Individual". These are historical/archived documents, not live copy.

**Fix:** add a `typos.toml` at repo root excluding `docs/archived/` and `docs/ARCHIVE/`
(both already excluded from other checks — see `.husky/pre-push`'s dead-canon-pointer
check for the existing pattern), or add per-word exceptions if the false positives are
narrow enough. Two-minute fix, just needs someone to own it.

---

## 4. `claude-review` CI job fails — two independent causes, not one

**Status:** not fixed. Infra/secrets + workflow-permissions gap, not a code issue.

**Correction 2026-08-24:** the original diagnosis below (empty
`ANTHROPIC_API_KEY` only) was incomplete. An independent adversarial review of
PR #98 (see `docs/HANDOVER-2026-08-23-pr98-e2e-fix.md`) read the actual failed
run's log and found a **second, distinct failure**: `.github/workflows/claude-review.yml`
declares only `contents: read / pull-requests: write / issues: write` — it is
missing `id-token: write`, so the job fails with
`Could not fetch an OIDC token. Did you remember to add 'id-token: write' to
your workflow permissions?` before it ever gets to the missing-secret problem.
Both defects need fixing, not one.

**Evidence:** `.github/workflows/claude-review.yml:13-16` (permissions block,
missing `id-token: write`) and `:39` (passes `${{ secrets.ANTHROPIC_API_KEY }}`,
arrives empty). This has presumably been silently non-functional since the
workflow was added — it "passes" in the sense of not blocking merges (not a
required check), but does nothing.

**Next step:** add `id-token: write` to the workflow's `permissions:` block,
**and** either set the `ANTHROPIC_API_KEY` repo secret (GitHub Settings →
Secrets and variables → Actions) if automated PR review is wanted, or remove
the workflow if it isn't. Christopher's call — secrets and workflow-permission
changes are not something to do without his explicit sign-off per the
Reversibility Gate.

---

## 5. Branch protection: `enforce_admins` was flipped to `true` this session

**Status:** done, live, verified (`gh api repos/ChrisGoslin/scentral-hub/branches/main/protection
--jq '.enforce_admins.enabled'` → `true`).

**Why it matters going forward:** 15 of the last 20 `main` CI runs had failed while
admin pushes landed directly on `main` anyway, bypassing the already-required `e2e`
check. With `enforce_admins` on, no one — no CLI, no admin — can push straight past a
red required check anymore. **This changes the team's normal workflow** from
direct-push-to-main to PR-based (confirmed working: PR #98 was opened and pushed to
successfully this session, all 5 pre-push hooks fired as expected). Any future
CLAUDE.md/AGENTS.md rule that says "push directly to main" for this repo is now stale
and should be corrected to describe the PR flow instead.

**Rollback if it turns out to block something legitimate:**
`gh api -X DELETE repos/ChrisGoslin/scentral-hub/branches/main/protection/enforce_admins`

---

## 6. `sensory-playground.spec.ts` fails on Mobile Chrome + Mobile Safari — RESOLVED 2026-08-24

**Status:** fixed, committed, and independently verified against live CI (not
just local) at commit `24e6050634eb58423829738a41b7d32cd5a0b7c8`, merged to
`main` in `9e74e71ae6d2ecd398c237627d9136c9fb6c7e8f`. See
`docs/HANDOVER-2026-08-23-pr98-e2e-fix.md` for the full verification chain —
this took three attempts, including one false "already fixed" claim that a
second independent CI check caught; read that handover's retrospective before
trusting a similar "local pass" claim in future.

**Root cause:** `ConsentBanner.tsx` (`position:fixed; bottom:16; zIndex:9999`)
intercepted the "Refill (Wipe Glass)" button's click on narrow (mobile)
viewports. Playwright's `click({force:true})` bypasses Playwright's own
actionability check but still performs a real browser click at the target's
screen coordinates, so the banner still ate the click underneath it.

**Fix:** `test.beforeEach` in `e2e/sensory-playground.spec.ts` now seeds
`nota_consent` / `scentral_onboarded` in localStorage via
`page.addInitScript`, dismissing the banner before it can render — same
pattern as `e2e/fragrance-detail.spec.ts`.

**Known residual flake (undocumented until now):** the DeviceMotion test
("Simulates DeviceMotion to trigger Shake-to-Rattle") fails on first attempt
on `chromium` and `Mobile Chrome` in CI and passes on Playwright's built-in
retry — `2 flaky` in CI runs, not `0 failed`. Not yet root-caused; low
priority since it self-heals via retry, but should not be reported as fully
green without noting this.

---

## 7. Deferred, not started this session

- **"App looks out of date" / `/goal-loop` request:** investigated earlier — the live
  Vercel deployment for `notalabs.io` exactly matched `git rev-parse HEAD` at the time
  checked, so this was very likely a browser-cache issue on Christopher's end, not a
  deployment problem. Not re-verified since — re-check `git rev-parse HEAD` against the
  live Vercel deployment commit SHA before assuming this is still resolved, since more
  commits have landed on `main` since.
- **"Run a full E2E QE audit and log all issues/gaps/UAT/vulnerabilities, fold in fixes,
  loop again":** explicitly deferred pending scoping. Not started. If picked up, scope
  it first — this repo's e2e suite already has real gaps beyond what's in this doc (the
  DeviceMotion permission-gate coverage gap documented in
  `docs/HANDOVER-2026-08-18-Scenthesia-UX-Rebuild.md` is one example already on record).
