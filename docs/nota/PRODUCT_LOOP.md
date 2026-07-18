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
(20/min, plus a 300/day per-IP cap, both via `lib/rate-limit.ts`). It
validates the source/text fields, caps raw text at 12k characters, caps
serialized metadata at 10KB, and stores the signal without doing synchronous
LLM enrichment. That keeps the public intake fast and avoids spending LLM
budget before the weekly clustering job. The 300/day cap is defense-in-depth
against one IP sustaining a flood for hours — it does not by itself prevent
one source crowding out others; that fairness guarantee lives in the
selection policy below, since `source` is client-supplied and unauthenticated
(can't be trusted as a quota identity on its own).

`product_signals.raw_text` is intentionally short-lived. Run
`select public.redact_old_product_signal_raw_text();` after the retention
window to replace old raw text with a redaction marker while preserving source,
metadata, tags, and future derived fields for reporting.

**Not wired yet (TODO):** a Zapier zap pointed at this endpoint for
form/email/DM sources. The endpoint is public and unauthenticated by design —
`app/api/signals/ingest/route.ts` writes with the anon key, not the
service-role key, through an anon INSERT-only RLS policy on
`product_signals` (`supabase/migrations/20260711000002_product_signals.sql`).
That policy is also reachable directly via the Supabase Data API with the
public anon key, so a caller can bypass the route's IP rate limits and post
straight to `/rest/v1/product_signals` — the policy constrains row shape
(size caps, no client-set enrichment fields, `created_at` within a narrow
window) but not request volume. Treat `source`/`raw_text`/`metadata` as
untrusted input downstream regardless of which path a row arrived through.

## How the weekly brief is generated

**Currently manual-only:** the `schedule` trigger in
`.github/workflows/weekly_product_brief.yml` is commented out until the
`product_signals` migration is confirmed applied and the repo secrets are
live — see that file's header. Until then, nothing runs automatically; use
`workflow_dispatch` (or `npm run brief:weekly` locally) to generate a brief.
Once re-enabled, Sunday 23:00 UTC will run
`npm run brief:weekly` (`scripts/generate_weekly_product_brief.ts`), which:

1. Pulls the last 7 days of `product_signals` — up to a 5,000-row fetch
   ceiling (logged, never silent, if hit — that would mean ingest volume
   needs its own investigation, not a bigger number here) so the selection
   step below sees the whole week, not just the newest slice of it.
2. Selects which signals actually reach the LLM, capped at 200
   (`MAX_SIGNALS_PER_RUN`) total, via a three-step policy in
   `selectSignalsForBrief()` — not pure recency truncation:
   - **Dedup** — collapses same-source, same-normalized-text repeats to one
     representative (earliest) row. Kills naive copy-paste bulk submission
     outright, regardless of volume.
   - **Fair-share allocation across sources** — max-min fair queuing: each
     source's equal share of the 200-signal budget rolls over to other
     sources if unused, so a single source with thousands of rows only
     consumes what's left after every other source's *actual* volume is
     satisfied — it can never crowd another source out. A week with only one
     active source is not capped at all, since there's nothing to protect.
   - **Stratified-by-day pick within a source's quota** — when a source's own
     volume exceeds its allocated quota, picks are spread round-robin across
     the 7 calendar days (earliest-in-day first) instead of taking that
     source's most recent rows. This is what stops "one caller fills the
     window in the last 10 minutes before the run" from silently erasing
     that same source's earlier legitimate signals — they're still in this
     run's 200, just possibly not the ones closest to the deadline.
   - Every drop (dedup count, which sources got capped and by how much,
     fetch-ceiling hits) is logged to the run output and folded into the
     brief's header line — never silent.
3. Sends the selected signals to the LLM to cluster into 3–7 themes, mapped
   to:
   - **Personas** — from `SCENTRAL_PERSONAS.md` (Gavan, Christopher).
   - **Feature areas** — from the route surface in `CLAUDE.md` §4 and
     `docs/ANOTHERSENSE_GAP_ANALYSIS_2026-06-23.md`. (Note:
     `AnotherSense_Final_UX_Overhaul.md`, referenced when this pipeline was
     scoped, does not exist in this repo as of 2026-07-11 — the gap-analysis
     doc was used instead. Reconcile if that file turns up elsewhere.)
4. Writes `docs/weekly/PRODUCT_BRIEF_<YYYY-MM-DD>.md` with Overview, Signals
   & Themes, Persona Impact, and 3–5 Recommended Bets (effort/impact rated).
5. The Action commits the new file directly to the branch it runs on.

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
