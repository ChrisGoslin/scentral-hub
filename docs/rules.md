# rules.md — operating rules distilled from lessons

This is the short checklist. `docs/lessons.md` remains the detailed history and source of examples.

## Auth and Security

1. Test auth bypasses must require an explicit test-only environment flag. Cookies, headers, or localStorage markers are not enough.
2. Protected routes must verify real auth at the API boundary, not only in page rendering.
3. Preview/import flows must ship no-write first. Any write step needs separate approval, authenticated ownership, idempotency, audit logging, and rollback receipt.
4. Do not use service-role clients or caller-supplied user IDs as patterns for new customer-owned data flows.

## Database and Data Portability

1. Do not query columns that cannot be reproduced from migrations, generated types, or a documented live schema check.
2. Preserve raw source values alongside normalised values in import previews so a customer can review and correct matches.
3. Bound import previews by content type, request size, payload size, row count, malformed input, and rate limit.
4. Direct third-party imports require official APIs or written platform permission. No credentials, session cookies, scraping behind sign-in, or bypassing rate limits.

## Git and Release Hygiene

1. In dirty worktrees, stage by exact path. Never use `git add .` unless the entire worktree is intentionally owned by the change.
2. Before committing, inspect `git status --short`, `git diff --cached --name-only`, `git diff --cached --stat`, and `git diff --cached --check`.
3. Treat generated artifacts separately from source changes. Move build-state backups aside or clean them only when the cleanup scope is explicit.
4. Do not push `main` directly when there are multiple local commits and a dirty shared worktree unless Christopher explicitly asks for that exact push.
5. Root-level `.next.preverify-*` and `.next.preclean-*` directories are generated build backups. Ignore them in Git and ESLint, and move them out of the repo before lint or CI claims.

## Verification

1. Claims require fresh evidence: build, typecheck, test, smoke, or source inspection matched to the claim.
2. Mocked E2E proves UI behavior, not protected API behavior. Record the residual gap and add real authenticated integration coverage when test auth exists.
3. If Next reports missing client manifests or route manifest invariants after interrupted builds, move `.next` aside, rebuild cleanly, then rerun the failing spec before changing product code.
4. When acceptance criteria change, update the canonical doc and add the smallest executable guardrail available.
5. CI E2E jobs must have bounded timeouts and upload Playwright diagnostics on failure or cancellation.

## Cross-Project Boundaries

1. nota. and finance/ABunDance must stay runtime-, data-, webhook-, and identity-separated.
2. Shared infrastructure lessons are allowed only as patterns, not as coupling.
3. Any cross-repo reuse needs an explicit boundary note naming what is shared and what is not.
