> **SUPERSEDED (2026-08-10, same day, discovered post-commit):** The schema-to-code
> reconciliation audit and "don't build Shelf v2 yet" guidance in §3 and §7 below
> are stale as of writing. Two Aug 9 commits — predating this handover — already
> did the work this doc says to do first:
>   - `157de68` backfilled a migration for six untracked tables. Actual list:
>     `houses, layering_protocols, layering_patterns, product_signals,
>     trend_signals, fragrance_facts` — NOT `swap_offers` as this handover's §3/§6
>     claimed. `swap_offers` was a misidentification, not a rename.
>   - `8904a79` already wired `shelf_items.tier`/`blind_buy` into the Shelf UI —
>     the "Shelf v2" work §3/§7 describe as blocked pending audit.
> Also stale: `scripts/dsar-delete-user.mjs` now exists in the repo (§3/§6 said
> "does NOT exist yet") — placed by another session since. And PR #55 is CLOSED,
> not merged/unknown as §3/§8 state.
>
> Treat everything below this note as a dated snapshot of 2026-08-10 reasoning,
> not current state. Re-derive the real backlog from `git log` before acting on
> anything here.

# HANDOVER: nota. (scentral-hub) post-audit backlog + cross-repo drift rule
Date: 2026-08-10 · Repo: ChrisGoslin/scentral-hub (plus household-finance, abundance for one shared item) · Session focus: DB migration cleanup, DSAR/GDPR prep, schema-vs-code reconciliation, three-repo AGENTS.md drift rule

## 1. Goal

Work through a backlog surfaced by an earlier audit + prod bug-fix session: apply an approved DB migration, prepare GDPR/DSAR delete tooling, write Claude Code prompts for a stalled feature branch (homepage/hero), and — the discovery that reshaped priorities — verify whether the database schema (which turned out to be far ahead of what any doc described) is actually wired up in app code.

This session ran in **Cowork**, which has no filesystem access to this repo — only a live Supabase MCP connection to project `lrkdwobnemczvhpixpky`. All code-level work in this handover was *drafted as Claude Code prompts*, not executed. Verify which of them Christopher has actually run before assuming any are done.

## 2. Background and constraints

- Read `AGENTS.md` first — it is canonical for this repo, not `CLAUDE.md`.
- Architecture lock for the MVP: **STRICT NO-AUTH** is the historical instruction in some project config, but per prior audit Supabase magic-link auth has since shipped (auth was un-locked 2026-07-03) — verify current state, don't trust either claim blindly.
- A new rule was added to `AGENTS.md` §S1 this session (see §4 below) specifically because schema and code drift silently in this repo — multiple agents/sessions touch it concurrently.
- Cowork sandbox has no outbound network to Vercel/external APIs — any script touching external services must be run locally by Christopher, not from a Cowork bash tool.

## 3. Current state

**DONE — verified, not just claimed:**
- `fragrances.spritz_count` migration (text → integer) applied directly via Supabase MCP against project `lrkdwobnemczvhpixpky`. 7/127,595 rows were text ranges ("2-3", "1-2 Swipes") — handled via a CASE/regexp USING clause taking the floor of the range, not the originally-proposed `NULLIF(x,'')::integer` (which would have thrown a cast error and aborted). Verified column is now `integer` post-migration.
- DSAR FK-cascade audit against `auth.users`: 14 of 18 user-linked tables are `ON DELETE CASCADE` (safe). 4 are `NO ACTION` and will **block** (not silently orphan) a user deletion: `profiles`, `collections`, `layering_combinations`, `wear_logs`. Confirmed via direct `information_schema` query, not inferred.
- Three-repo AGENTS.md drift rule (schema exists ≠ code uses it ≠ route wired) — added to scentral-hub, household-finance, and abundance. All three **verified via `git log` + content grep**, not taken on the reporting agent's word:
  - scentral-hub: folded into existing §S1, lines ~170–174 (confirm current line numbers — a same-day unrelated commit `8055e4b2a` "reconcile typography and legacy point mechanics" touched the same file afterward without disturbing this text, per grep confirmation).
  - household-finance: commit `d2bd7f1f3`.
  - abundance: commit `35798a328`.
- Corrected a stale internal-memory belief (not a repo artifact, but relevant): DB-001 through DB-007 and the full 11-table nota doctrine migration set were previously believed "not applied, awaiting approval." Direct query of `list_migrations` + `information_schema.tables` shows **all of it is live**, applied 2026-07-03/04, plus two more migrations from 2026-07-17 (`align_trace_reactions_contract`, `align_insights_cache_contract`) that no prior doc/memory referenced at all.

**PARTIAL — drafted, not placed or executed:**
- `scripts/dsar-delete-user.mjs` — full script written (dry-run default, requires explicit `--confirm`, clears the 4 NO-ACTION tables before calling `auth.admin.deleteUser()`). File exists only as a Cowork output; **has not been copied into the repo or dry-run tested.**

**NOT STARTED — prompts written, none confirmed run:**
- Schema-to-code reconciliation audit ("Prompt A") — the highest-priority next step. The database now contains six tables with no corresponding documentation anywhere: `layering_patterns`, `layering_protocols`, `product_signals`, `trend_signals`, `fragrance_facts`, `swap_offers`. Unknown whether app code uses any of them, partially wires them, or they're fully orphaned. **Do not write "build Shelf v2" or "nav rebuild" prompts until this audit has actually run** — that was an explicit instruction from Christopher this session ("I'm all about doing the right way even if it takes longer rather than building in tech debt").
- Homepage/hero follow-up, Prompts 0–5 (brand doc placement → surface glossary verification → hero video face-visibility ruling → LCP/guest-path measurement → scoped commit → E2E spec alignment). These were drafted by a *different* session/agent, not this one — this session only logged them as tasks and sequenced them. Full prompt text is not reproduced here; if lost, they'll need to be regenerated from that session's history or from whatever doc placement Prompt 0 already achieved.
- Original 8-item Claude Code prompt backlog (guarded deploy script, scheduled prod smoke-test + alerting, TemptationProvider `?id=` bug, filter-string injection fix, owner_count field decision, Vercel CLI/branch housekeeping) — all still open, prompts exist in a prior Cowork output (`nota_claude_code_prompts.md`, not committed to the repo — recreate if not still accessible).
- Two dashboard-only items, no prompt possible: enable Vercel Firewall managed rules + bot challenge; add `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` as GitHub repo secrets to unlock CI stages 2–3.
- Install `implementation-preflight` and `screen-state-completeness` as Claude Code skills — Christopher must decide repo-local (`.claude/skills/`) vs global (`~/.claude/skills/`) before this can run; not yet decided.
- PR #55 (`feat/knowledge-engine`, migration file rename) — was pending CI at last mention this session, including a fresh Supabase Preview run. **Never confirmed merged or green.** Check its actual current state before assuming anything about it.

## 4. Key decisions (and why)

- **Verify-first is now a standing rule, not a one-off.** Christopher explicitly confirmed: default to a read-only audit before any build prompt when state is uncertain, even if slower. Triggered by the stale-migration-belief discovery above — don't repeat that mistake by building on unverified assumptions again.
- **spritz_count migration used a floor-of-range cast, not the originally approved exact SQL.** The approved `NULLIF(x,'')::integer` would have failed outright on 7 rows shaped like "2-3". This was a judgment call made and flagged, not silently substituted — worth knowing if anyone re-derives that migration's history.
- **DSAR script is dry-run-by-default with a hard `--confirm` gate**, per this repo's AGENTS.md rule that destructive operations need explicit human sign-off — do not automate a `--confirm` run.
- **Cowork cannot commit.** Everything in this handover that touches actual repo files was either (a) applied directly via the Supabase MCP data-plane connection (the migrations — these are real, live, and don't need re-applying), or (b) written as a file/prompt for Christopher or a Claude Code session to place and commit. Don't assume anything under "PARTIAL" or "NOT STARTED" above is in the repo just because it's described here.

## 5. Traps and dead ends

- **Don't trust a file's last-commit-message as proof of its content.** scentral-hub's AGENTS.md drift-rule was verified present via `grep`, not via `git log`, because a same-day unrelated commit had touched the file afterward with a message that said nothing about the rule. If the log message doesn't mention what you're checking for, grep the actual content before concluding anything.
- **Don't assume the originally-approved SQL for a migration is safe to run verbatim** — always preview affected rows first (`SELECT count(*) ... WHERE <cast would fail>` pattern) before an `ALTER COLUMN TYPE`. This repo has non-numeric text sitting in fields that look numeric (fragrance-brand "spritz count" ranges like "2-3").
- **Multiple agents/sessions work in this repo concurrently** — this is now explicitly documented in AGENTS.md §S1. Any handover or verification step should assume the repo may have moved since it was last read.

## 6. Files and pointers

- `AGENTS.md` — canonical rules, read in full. §S1 (verify-before-asserting) was amended this session; confirm current line numbers, they may have shifted.
- `scripts/dsar-delete-user.mjs` — does NOT exist in the repo yet; full content available in this Cowork session's output if needed, or regenerate from the description in §3 above (dry-run default, `--confirm` flag, clears `profiles`/`collections`/`layering_combinations`/`wear_logs` before `auth.admin.deleteUser()`).
- `docs/nota/06-testing-security-abuse.md` — testing/security/GDPR doc from a prior session; §2.6 has the GDPR minimum-viable path (consent gating + DSAR script) that gates the notalabs.io DNS cutover.
- `docs/BRAND-RULING-hero-video.md`, `DESIGN.md` (repo root), `NOTA-BRAND-UIUX-PACK.md` (repo root), `docs/lessons.md` — referenced by the homepage/hero Prompts 0–5. **Path corrected 2026-08-19:** the design docs are at the repo root, not under `docs/`. Forked `docs/` copies existed and were deleted on 2026-08-19 because they had diverged from root by 87 and 85 diff lines and contradicted it on body font and on a measured contrast ratio. If a `docs/DESIGN.md` or `docs/NOTA-BRAND-UIUX-PACK.md` reappears, it is a fork — read root.
- Supabase project `lrkdwobnemczvhpixpky` (org `xnueswdygglhotwtkrfq`, region eu-west-1) — the six undocumented tables are `layering_patterns`, `layering_protocols`, `product_signals`, `trend_signals`, `fragrance_facts`, `swap_offers`. Run `list_tables` / `list_migrations` fresh rather than trusting this list — it was current as of 2026-08-10 and this repo's schema moves fast.

## 7. Open work

- Schema-to-code reconciliation audit — no dependencies, should run first; several later decisions (Shelf v2, nav rebuild) depend on its findings.
- DSAR script placement + dry run — no dependencies, independent of everything else.
- Homepage/hero Prompts 0–5 — sequential, each gates the next; Prompt 4 (commit) depends on 0–3 all passing or being explicitly deferred with Christopher's sign-off; Prompt 5 depends on Prompt 4.
- Original 8-item backlog (deploy script, smoke-test alerting, TemptationProvider, filter injection, owner_count, CLI/branch housekeeping) — independent of each other, no hard sequencing, but the guarded deploy script is highest-leverage (it's the actual fix for how a 9-day-undetected prod 500 happened).
- Two dashboard-only items — no code dependency, Christopher-only actions.
- Skill install decision (repo-local vs global) — blocks nothing except the skills being auto-loaded by future Claude Code sessions; until decided, any prompt needing preflight-style rigor should say so explicitly rather than assume the skill fires automatically.
- PR #55 status — unknown, check first.

## 8. Verification status

| Claim | Status |
|---|---|
| spritz_count is now `integer` | VERIFIED — queried `information_schema.columns` + spot-checked 2 converted rows |
| 14/18 tables CASCADE, 4 are NO ACTION | VERIFIED — direct `information_schema` FK query |
| All 11 doctrine migrations + DB-001–007 applied | VERIFIED — `list_migrations` + `list_tables` |
| 6 undocumented tables exist | VERIFIED table existence — NOT verified whether app code uses them (that's the point of Prompt A) |
| AGENTS.md drift rule present in all 3 repos | VERIFIED — git log for 2, git log + content grep for the third |
| DSAR script is correct/safe | REVIEWED only — written carefully against the FK audit findings, but never actually run, even in dry-run mode |
| Homepage/hero Prompts 0–5 are ready to run as written | REVIEWED only — inherited from another session's output, not independently re-verified against current repo state |
| PR #55 status | UNKNOWN — not checked this session |
| Original 8-item prompt backlog still accurately reflects open bugs | REVIEWED only — based on a single audit session's findings; repo has moved since (see the "multiple agents" trap above), re-verify before running any of them blind |

---
## Prompt for the fresh agent

You're picking up backlog work on nota. (repo scentral-hub, Supabase project `lrkdwobnemczvhpixpky`) after a Cowork session that had no filesystem access to this repo — everything above was either applied directly via a live Supabase data-plane connection (verified real) or drafted as prompts/files never placed or run (not real yet, despite being fully written). Christopher's stated priority: correctness over speed, explicitly reject building on unverified assumptions, even if it's slower.

Before responding, read every file listed under "Files and pointers" above. Do not summarize, paraphrase, or claim you already have context — actually read each file. Treat every claim in this handover as context to verify against the code, not fact to trust. Then wait for instructions before taking any action.
