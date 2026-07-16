# Product Signal → Weekly Product Brief Loop

> Added 2026-07-11. Closes the loop between raw user feedback and a weekly,
> persona-mapped set of recommended bets.

## How signals arrive

```
form / email forwarder / DM / Zapier
        │  POST /api/signals/ingest  { source, text, metadata? }
        ▼
  bounded raw signal capture — source, text, metadata
        ▼
  product_signals table (Supabase)
```

`app/api/signals/ingest/route.ts` accepts any JSON payload of the shape
`{ source: string, text: string, metadata?: any }`, rate-limited per IP
(20/min via `lib/rate-limit.ts`). It validates the source/text fields, caps
raw text at 12k characters, caps serialized metadata at 10KB, and stores the
signal without doing synchronous LLM enrichment. That keeps the public intake
fast and avoids spending LLM budget before the weekly clustering job.

`product_signals.raw_text` is intentionally short-lived. Run
`select public.redact_old_product_signal_raw_text();` after the retention
window to replace old raw text with a redaction marker while preserving source,
metadata, tags, and future derived fields for reporting.

**Not wired yet (TODO):** a Zapier zap pointed at this endpoint for
form/email/DM sources. The endpoint is public and unauthenticated by design
(server-side service-role writes, no anon RLS policy) — anyone with the URL
can post a signal, so treat `source`/`metadata` as untrusted input downstream.

## How the weekly brief is generated

Sunday 23:00 UTC, `.github/workflows/weekly_product_brief.yml` runs
`npm run brief:weekly` (`scripts/generate_weekly_product_brief.ts`), which:

1. Pulls the last 7 days of `product_signals` (capped at 200 most recent —
   logged if truncated, never silently).
2. Sends them to the LLM to cluster into 3–7 themes, mapped to:
   - **Personas** — from `SCENTRAL_PERSONAS.md` (Gavan, Christopher).
   - **Feature areas** — from the route surface in `CLAUDE.md` §4 and
     `docs/ANOTHERSENSE_GAP_ANALYSIS_2026-06-23.md`. (Note:
     `AnotherSense_Final_UX_Overhaul.md`, referenced when this pipeline was
     scoped, does not exist in this repo as of 2026-07-11 — the gap-analysis
     doc was used instead. Reconcile if that file turns up elsewhere.)
3. Writes `docs/weekly/PRODUCT_BRIEF_<YYYY-MM-DD>.md` with Overview, Signals
   & Themes, Persona Impact, and 3–5 Recommended Bets (effort/impact rated).
4. The Action commits the new file directly to the branch it runs on.

Run it manually any time with `npm run brief:weekly` (needs
`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` in
`.env.local`), or trigger the Action via `workflow_dispatch`.

## How the product owner should read it

- **Overview** — one paragraph, skim first.
- **Signals & Themes** — what people are actually saying, grouped, with
  quotes. Check this against your own sense of what shipped that week.
- **Persona Impact** — which persona (Gavan/Christopher) is affected by which
  theme. Use this to weigh a bet against "does this serve Gavan or
  Christopher?" (the standing filter in `SCENTRAL_PERSONAS.md`).
- **Recommended Bets** — treat as a starting shortlist, not a backlog. Each
  bet is LLM-generated from that week's signals only — cross-check against
  `docs/FEATURE_ROADMAP.md` and existing architecture constraints
  (`docs/nota/04-architecture-plan.md`) before committing to one.

## Open TODOs

- Wire a Zapier zap → `/api/signals/ingest` for at least one real source
  (form or email forwarder).
- Schedule `public.redact_old_product_signal_raw_text()` after the agreed raw
  text retention window; default retention is 7 days.
- Confirm the exact cron time works for the product owner's timezone (Dublin)
  — currently Sunday 23:00 UTC (Sunday 23:00/00:00 Dublin depending on DST).
- Add repo secrets `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_KEY` (and confirm
  `NEXT_PUBLIC_SUPABASE_URL`) for the Action to run — not yet confirmed set.
- `product_signals` migration is written but not applied (see
  `docs/KNOWLEDGE_ENGINE.md` TODOs) — the ingest route and brief script will
  fail until it's approved and pushed.
