# Scentral Hub — Architecture

> **The canonical TAD is at `docs/executive-suite/TECHNICAL_ARCHITECTURE_DOC.md`.**
> This file is a short summary. For stack details, data model, patterns, and agent rules — read the TAD.

## Core principles

- **Next.js App Router** — group routing under `(main)`, Server Components fetch data, Client Components handle interaction
- **Supabase** — PostgreSQL, Auth via cookies, SSR client (`utils/supabase/server` + `utils/supabase/client`)
- **CSS variables only** — all colours and spacing in `lib/design/tokens.css`. Never hardcode.
- **No secrets in source** — `.env.local` only, gitignored
- **No-auth MVP** — app renders without a session; user features silently degrade to empty

## Engineering guardrails

- `await createClient()` and `await cookies()` inside Server Components — always awaited
- No new state management libraries without discussion
- No new AI providers without discussion
- Additive features commit directly to main; branch only for risky migrations or refactors

## Agent protocol

Read `AGENTS.md` first. State what you grounded on. Verify before asserting. Full rules in the TAD §7.
