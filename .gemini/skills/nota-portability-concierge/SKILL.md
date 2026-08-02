---
name: nota-portability-concierge
description: Use when designing or implementing customer fragrance-history imports, export adapters, match previews, or migration assistance for nota. Enforces preview-first matching, authenticated ownership, and third-party access boundaries.
---

# nota. Portability Concierge

Read `docs/nota/11-portability-concierge.md` and `AGENTS.md` before editing.

## Workflow

1. Verify the input came from a customer-controlled file, paste, official API, or explicitly approved source.
2. Add an anonymised fixture for each real export shape. Do not invent a provider format.
3. Parse into source-preserving rows; keep source row numbers and raw values available for review.
4. Run deterministic catalogue matching first. An LLM may explain or suggest, but may not establish identity or silently approve a match.
5. Produce a dry-run with `exact`, `likely`, `ambiguous`, and `unmatched` outcomes.
6. Auto-select only one unique exact match. Require human review for every other outcome.
7. Keep preview and commit separate. A commit path needs authenticated ownership, idempotency, an audit receipt, rollback, and explicit migration approval if schema changes are involved.
8. Run `npm run test:unit`, `npx tsc --noEmit --skipLibCheck`, and the narrow lint check before reporting completion.

## Hard Stops

- Never ask for or store another fragrance platform's password, cookie, or session token.
- Never automate access behind a third-party sign-in without written permission and a separate review.
- Never use service-role access to assign customer data from a browser-supplied identity.
- Never connect nota. portability data to Household Finance or ABunDance.
