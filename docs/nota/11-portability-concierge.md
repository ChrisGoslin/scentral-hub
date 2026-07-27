# Portability Concierge: PRD and Execution Contract

**Status:** Foundation and preview-only Archive surface implemented; database commit is not yet shipped.
**Product boundary:** nota. only. This work has no runtime, data, webhook, or identity connection to Household Finance or ABunDance.

## Problem

People can want to leave another fragrance service while remaining dependent on the collection, ratings, notes, and wear history they accumulated there. nota. should reduce that switching cost without asking for another service's credentials or silently extracting protected data.

## Smallest Useful Journey

1. The customer uploads or pastes data they already control.
2. nota. parses it locally or in an authenticated, short-lived preview request.
3. Deterministic matching groups rows into exact, likely, ambiguous, and unmatched.
4. Only a unique exact match may be preselected. Every other result needs a human decision.
5. The customer reviews a dry-run summary before any write.
6. A separately approved commit step writes only to that authenticated customer's account and produces a rollback receipt.

## Inputs

**Approved now**

- Customer-uploaded CSV or tab-separated text.
- Customer-pasted lists.
- A data export the customer obtained through a platform's normal export or privacy-request process.

**Separate approval required**

- XLSX and JSON adapters after representative exports are available for fixtures.
- Direct connectors using an official API or written platform permission.
- Any schema migration, persistent import job, production route, or background worker.

**Not allowed by default**

- Third-party usernames, passwords, session cookies, or tokens supplied to nota.
- Automated access behind another platform's sign-in.
- Bypassing rate limits, anti-bot controls, terms, or technical restrictions.
- LLM-generated catalogue identities or automatic acceptance of uncertain matches.

## Implemented Foundation

- `lib/portability/preview.js` parses quoted CSV/TSV-style text, maps common headers, normalises names, and produces a no-write match preview.
- `/archive/import` is a post-onboarding, signed-in preview surface for pasted text and CSV/TSV-as-text imports.
- `/api/portability/preview` is an authenticated, no-write preview route with bounded payload size, bounded request size, bounded row count, content-type checks, and per-user rate limiting.
- `lib/security/wear-log.js` derives ownership from the authenticated nota. user and validates wear-log input.
- `/api/wear-log` now uses the request-scoped Supabase client and row-level security instead of a service-role key and browser-supplied user ID.
- `npm run test:unit` runs the portability and security regression suite.

## Acceptance Gates for the Next Tranche

- Representative, user-supplied exports become anonymised fixtures before adding a source-specific adapter.
- Preview UI clearly shows row counts and all four match outcomes.
- No database writes occur from preview.
- Commit is idempotent, authenticated, audit logged, and reversible.
- Source values are preserved alongside normalised values so a customer can correct a match.
- File size, row count, content type, formula injection, and malformed input are bounded and tested.
- Privacy copy states retention and deletion behaviour before production release.

## Known Security Follow-up

`/api/wear-log/note` and the legacy `/api/spritz/log-wear` flow still use caller-controlled anonymous identity with service-role access. They must be migrated as one identity-compatible flow rather than patched independently and breaking existing Spritz notes. Do not use either route as a pattern for portability work.
