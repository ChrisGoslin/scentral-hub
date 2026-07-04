---
name: QE & Automation
description: This skill should be used after fixing any bug in scentral-hub (nota.), before declaring any feature done, when changing CI, and when the user asks to "add tests", "why did this break again", "set up CI", "improve quality", or mentions regressions or flaky tests. Encodes the bug→test→lesson loop, the test-layer decision rule, and the CI staging plan; grows via LESSONS.md. For raw Playwright/smoke-test how-to, defer to the testing-framework skill.
version: 0.1.0
---

# QE & Automation (nota. / scentral-hub)

**Read `LESSONS.md` in this directory first.** For Playwright/smoke-test mechanics, use the `testing-framework` skill — this skill is the *policy* layer: what gets tested, at which layer, and how the suite grows.

Companion doc: `docs/nota/06-testing-security-abuse.md` §1 (layers, coverage map, CI YAML).

## The bug→test loop (non-negotiable)

Every confirmed bug:
1. **Reproduce** with a failing test at the **cheapest layer that catches it**: unit > API/integration > e2e. If it can be caught by a pure function test, do not write an e2e test for it.
2. **Fix** — the test goes green.
3. **Record** — append a `QE-n` entry to `LESSONS.md` naming the *class* of bug and the guard.
4. If the same class appears twice, the guard was wrong — escalate (lint rule, husky hook, CI job, or type change), and say so in the lesson.

## Layer decision rule

- **Unit (Vitest, `*.test.ts` beside `lib/` source):** pure domain logic — shelf tier/eligibility math, insight mappers, affiliate fallbacks, formatters. No DB, no network.
- **API/integration:** route behaviour — status codes, DB writes, trigger rejections surfacing as clean 4xx, rate-limit 429s, RLS adversarial suite.
- **E2E (Playwright):** user-visible flows only, `getByRole` selectors (L17), chromium-only in CI, full 4-browser matrix before releases.
- **Smoke (`npm run test:smoke:prod`):** after every production deploy.

## Definition of done (any feature)

1. `tsc --noEmit` + `npm run build` pass locally (L14).
2. New domain logic has unit coverage; new routes have at least a happy-path + one rejection-path API test.
3. Nota-core flows touched? The corresponding e2e spec (coverage map in 06 §1.1) runs green: `npm run test:e2e -- --project=chromium`.
4. Copy changed? Re-run e2e (text-selector risk, L17).
5. New public endpoint? Rate-limit + pagination decision made (resilience-abuse skill) — quality includes abuse posture.

## CI state & staging (update this section when it changes)

- **Stage 1 (live):** `.github/workflows/ci.yml` — tsc + lint on PR/push to main. Zero secrets, cannot flake.
- **Stage 2 (pending repo secrets):** build job — YAML ready in 06 §1.2.
- **Stage 3 (pending test user):** chromium e2e — YAML ready in 06 §1.2.
- Also live: `security-audit.yml` (npm audit, high+).
- Deploy gate remains manual `npx vercel --prod` after local green (L14) until Stage 2/3 are stable, then flip branch protection to require CI.

## Automation rules

- A check that exists but isn't wired into CI or a hook **does not exist**. Every new gate lands in one of: husky pre-push, `ci.yml`, or a documented npm script that the definition-of-done references.
- Flaky test → fix or quarantine within the same session it's noticed; a red-but-ignored suite is worse than none. Quarantines are `QE-n` lessons with an expiry.
- Never let CI stages block on secrets that aren't set — jobs must be added only when their inputs exist (that's why staging exists).

## Learning loop (mandatory)

```
## QE-<n> (<date>) — <one-line title>
**Bug class:** <what kind of failure this was>
**Guard now in place:** <test file / hook / CI job>
```

Append after every bug fix, CI change, or flake investigation. Newest at the bottom of `LESSONS.md`.
