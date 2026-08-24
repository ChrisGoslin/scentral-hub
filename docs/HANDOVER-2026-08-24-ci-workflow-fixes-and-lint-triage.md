# Handover — CI workflow fixes, lint triage, session close-out (2026-08-24)

**Read `docs/HANDOVER-2026-08-23-pr98-e2e-fix.md` first** — this doc continues
directly from it (PR #98's e2e fix, its retrospective, and its red-team
findings are the foundation for everything below). Do not re-investigate
what that doc already receipted; re-derive from the live commit SHAs it
cites if you need to confirm it, don't just trust the prose.

## What's merged, live, verified

- **PR #98** — e2e fix for `sensory-playground.spec.ts` (consent-banner
  click interception on mobile). Merged `9e74e71`. Verified via 3 rounds of
  independent, context-free CI polling — see prior handover for the full
  chain and the retrospective on why it took three attempts.
- **PR #99** — SESSION-BACKLOG corrections (items 4, 5, 6) + the PR #98
  handover doc itself. Merged `e03f6c7`. Confirmed via `gh pr view 99
  --json state,mergedAt,mergeCommit` → `MERGED`. `e2e` passed at 9m0s before
  merge.
- **Live verification of stale backlog items, done by direct check, not
  inherited claim** (2026-08-24, before writing this doc): items 1
  (`/wheel` "User ID not found"), 2 (lint errors), and 3 (typos CI) had all
  been resolved by concurrent sessions since PR #98 was opened — confirmed
  by reading `app/(main)/wheel/WheelClient.tsx` directly (empty-cabinet path
  now renders correctly, error branch is dead code behind a different
  condition), running `npm run lint` live (0 errors, down from the
  originally-reported 12), and reading `_typos.toml` directly (real
  per-word justifications, not a blanket silence).

## What's open — PR #100, NOT YET MERGED

**PR #100** — `fix(ci): repair three non-required workflow checks broken on
push-to-main`. Branch `fix/ci-workflow-triggers-and-permissions`, head
`0e2c2679ca187008c2d8ebd4ccc431768b6bf0a6`.

**Last known state (2026-08-24, this session did not wait for it to resolve
— usage-limit checkpoint cut polling short):**
`mergeable: MERGEABLE`, `mergeStateStatus: BLOCKED`, `e2e` still `pending`.
Every other required check (`typecheck`, `lint`, `build`, `audit`, `check`,
`performance-criteria`) and the now-fixed `claude-review` were already
`pass` at last check. **`claude-review` passing is itself live confirmation
that this PR's own `id-token: write` fix works** — don't re-verify that part,
it's proven by the PR's own CI run, not by the PR's diff alone.

**Next action for whoever picks this up:** run `gh pr checks 100`, and once
`e2e` resolves and `mergeStateStatus` moves off `BLOCKED`, merge it — the
user has already said "all approved" for this PR, so no further
confirmation is needed for the merge action itself, only live confirmation
that the required checks are actually green (do not merge on the strength of
this doc's "last known state" — that's now stale by definition; re-check).

**What PR #100 fixes**, all three verified by reading the actual failing CI
log and the actual live workflow YAML before editing, not guessed:

1. `.github/workflows/claude-review.yml` — was missing `id-token: write` in
   its `permissions:` block, causing every run to fail on an OIDC
   token-fetch error before it ever reached the (separately, still
   unresolved) missing-`ANTHROPIC_API_KEY`-secret problem.
2. `.github/workflows/secret-scan.yml` — TruffleHog's `base` and `head`
   inputs both resolved to the literal string `"main"` on a push-to-main
   event (`github.event.repository.default_branch` == the branch being
   pushed to), meaning **base and head were the same commit and nothing was
   ever scanned, silently, since this workflow existed.** Fixed to use
   `github.event.before`/`github.event.after` on push events, and the PR's
   actual base/head SHAs on `pull_request` events.
3. `.github/workflows/anti-slop.yml` — the third-party `peakoss/anti-slop`
   action reads `event.pull_request.base`, which doesn't exist on a `push`
   event, crashing with `Cannot read properties of undefined (reading
   'base')` on every push to `main`. Restricted the job to `pull_request`
   only via `if: github.event_name == 'pull_request'`.

None of these three are required checks, so none were ever blocking a
merge — but **#2 means secret scanning has not actually been scanning
merges to `main`**, which is a real, not cosmetic, gap that this PR closes.

**Still not fixed, needs Christopher's call (secrets action, not something
to do without explicit sign-off per the Reversibility Gate):** the
`ANTHROPIC_API_KEY` secret itself is still unset — `claude-review` will keep
passing (job succeeds) but keep no-op'ing on review content until that
secret is actually added in GitHub Settings → Secrets and variables →
Actions, or the workflow is removed if automated review isn't wanted.

## Lint warnings — triaged, NOT yet fixed, deliberately not rushed

`npm run lint` currently reports **0 errors, ~100 warnings**, all
`@typescript-eslint/no-unused-vars`. Full triage done this session, edits
deliberately not made because the warnings split into two risk tiers and
blindly fixing all of them in one pass would mix trivial cleanup with
behavior-risking edits to live product code:

**Tier 1 — low risk, safe to auto-fix or hand-fix in one pass:**
pure unused imports and script/test-only exports with zero risk of behavior
change (nothing else in the codebase references them). Confirmed examples:
`components/labs/LivingShelfGrid.tsx:3` (`useEffect` import unused),
`app/(main)/collection/CollectionClientWrapper.tsx:8` (`EmptyState` import
unused), `app/(main)/you/page.tsx:2` (`cookies` import unused),
`app/api/insights/route.ts:11` (`request` param unused — prefix `_request`,
don't remove, it's a route handler signature), everything in
`scripts/demo-all-50-innovations.ts`, `lib/spikes/spritz-schedule.ts`,
`tests/spikes/*.test.mjs` (dead exports/constants never imported anywhere).

**Tier 2 — higher risk, needs per-file judgment, not blind deletion:**
unused **React state and setters** inside live components — these may
reflect half-wired features rather than pure dead code, and removing them
could silently change behavior in ways lint can't catch. Confirmed
instances: `app/labs/page.tsx:15-16` (`selectedBottle`, `activeReading`),
`components/labs/SynesthesiaMemoryWidget.tsx:63` (`setActiveLifecycle`),
`components/labs/TarotDivinationCard.tsx:10` (`setPlaylist`),
`e2e/lens-filter-empty-state.spec.ts:18` (`isFlipped`),
`lib/portfolio-innovations-matrix.ts:71` (`lensName`). Each of these needs
its component read in full — is the setter called from an event handler
that's also dead, or is the *getter* consumed somewhere via a different
variable name (an aliasing bug), or is this a genuinely half-built feature
that should stay as-is until finished? That's a per-file investigation, not
a lint-fix pass.

**Recommendation for whoever picks this up:** do Tier 1 in one small PR
(near-zero risk, quick), and treat Tier 2 as its own scoped investigation —
possibly one Tier-2 file per PR, or a single PR with a written note per file
explaining what was found, not just what was deleted.

## Known, low-priority, not investigated

- **DeviceMotion flake** in `e2e/sensory-playground.spec.ts` — fails on
  first attempt on `chromium`/`Mobile Chrome` in CI, passes on Playwright's
  built-in retry (documented in `docs/SESSION-BACKLOG-2026-08-22-ci-and-e2e-followups.md`
  item 6, now on `main` via PR #99). Self-heals via retry; not root-caused.
  Not urgent.

## Retrospective note for this session's second half

Everything in this doc that's marked "verified" was checked by directly
reading the live file, running the live command, or querying live GitHub
state in this session — not inherited from an earlier turn's claim. The one
partial exception is PR #100's merge status, which is explicitly marked
stale above because a usage-limit checkpoint cut off polling before it
resolved. That's intentional: reporting a guessed "probably passed by now"
would repeat the exact mistake this session's *first* handover documented
(a local-pass claim reported as done without the external gate actually
confirming it). Whoever reads this should re-poll, not trust the "last known
state" section as current.
