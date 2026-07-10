---
name: nota-identity-consolidation-campaign
description: THE executable campaign to retire nota.'s (repo scentral-hub) two dual-data-model splits — (A) anon_id-text-keyed legacy tables vs user_id-uuid auth tables, and (B) legacy collections.shelf_tier+affinity_score vs shelf_items.rank — which together block Shelf v2 (20-slot tiered shelf; app code is already at SHELF_SIZE=20 as of commit fdbab61, verify before assuming 10). Load this BEFORE writing any migration or code touching identity claiming, shelf seeding/eligibility, or the anon_id-to-user_id boundary; when asked "how do we finish the identity migration", "why do two shelf systems exist", "is it safe to drop anon_id yet", or "fix the shelf 500 on ineligible add". Numbered phases, each with an exact verification query, an expected-vs-actual gate, and a named next phase or rollback branch. Does NOT restate the architecture rationale (see `nota-architecture-contract` for why the split exists and which decisions are load-bearing), the RLS/GDPR checklist for routes and migrations in general (see `security-hardening`), the bug→test loop or CI staging (see `qe-automation`), or how to run/deploy the app (see `nota-run-and-operate`). This skill is the sequencing and gating logic that ties those three together for this one campaign. This skill directs future sessions — it does not itself change any code, schema, or data.
---

# nota. Identity + Shelf Consolidation Campaign

**Plain-language summary (for Christopher):** nota. currently tracks "who a user is" two different ways at once (a temporary anonymous ID before signup, and a permanent account ID after), and tracks "what's on a user's Shelf" two different ways at once (an old tier+score system and a new ranked-slot system). Both overlaps exist because features were built in phases and the older plumbing was never removed. This is not broken today — but it blocks Shelf v2 (the 20-slot tiered shelf with rules about what's allowed on it), and every new feature built on top of the messy state makes the eventual cleanup harder. This skill is the step-by-step plan for retiring the old plumbing safely, in an order that never loses data and never locks anyone out.

This skill is a **runbook, not an executor**. Every phase ends in a gate. Do not proceed past a gate on judgement alone — run the query, compare to "expected", and follow the stated branch.

Read `nota-architecture-contract` first if you have not already — it explains *why* both splits exist and which decisions (RLS pattern, eligibility trigger, doctrine) are locked and must not be routed around. This skill assumes that context and focuses on *sequencing the fix*.

---

## 0. Ground truth as of 2026-07-05 — verify every line before trusting it

| Claim | Verify with |
|---|---|
| App-layer Shelf is already 20 slots, not 10 | `grep -n "SHELF_SIZE" "app/(main)/shelf/page.tsx" app/api/shelf/route.ts` — both should show `const SHELF_SIZE = 20`. **If either still says 10, the campaign's Phase 3 (app-layer cutover) has not landed — do not assume it has.** |
| DB-side shelf tier/eligibility model is live | `grep -n "enforce_shelf_eligibility\|set_blind_buy_on_reveal\|shelf_items_rank_range" supabase/migrations/20260704_db003_shelf_tiers_eligibility.sql supabase/migrations/20260704_db007_blind_buy_propagation.sql` |
| Legacy shelf columns still read by app code | `grep -rn "shelf_tier\|affinity_score" "app/(main)/shelf/page.tsx"` — currently used inside `seedShelfItems()` to order legacy `collections` rows when bridging into `shelf_items` |
| `user_xp` / `user_streaks` are anon_id-keyed with no migration file in this repo | `grep -rln "user_xp\|user_streaks" --include="*.sql" supabase/migrations/` returns **nothing** — these tables predate the tracked-migrations era (created directly in the dashboard). Confirm live schema with `list_tables` (Supabase MCP) or `\d user_xp` before writing any migration against them — do not trust column names from memory. |
| The anon_id problem is bigger than two tables | `grep -rln "anon_id" app/api/ --include="*.ts"` — as of this writing hits `insights`, `strip/post`, `spritz/log-wear`, `admin/feedback/[id]`, `contribute`, `evolution/detect`. `grep -rn "anon_id" supabase/migrations/*.sql` shows `shelf_events`, `evolution_events`, `noseprint_history`, `temptations`, `insights_cache`, `trace_reactions`, `traces`, `wear_posts`, `profiles`, and legacy `collections` all carry or carried an `anon_id` column. **Treat "(A) = user_xp/user_streaks" in any older brief as a simplification, not the full scope.** |
| A partial migration already exists — do not re-do it, extend it | `cat supabase/migrations/20260704_db006_identity_model_migration.sql` — this migration already added a nullable `user_id uuid` column + dual-mode RLS (`auth.uid() = user_id OR anon_id = current_setting(...)`) to `temptations`, `shelf_events`, `evolution_events`, `noseprint_history`. It explicitly did **not** touch `insights_cache`, `trace_reactions`, `collections`, `traces`, `user_xp`, `user_streaks`. |
| A claim function already exists but is incomplete | `cat lib/auth/claimLegacyData.ts` — claims `temptations`, `shelf_events`, `evolution_events`, `noseprint_history` by `UPDATE ... SET user_id WHERE anon_id = ? AND user_id IS NULL`. The `user_xp` block (lines ~46-56) is a stub — it reads the anon_id row but explicitly does nothing ("this just marks it claimed" — it does not). **This stub is Phase 2's starting point, not a finished migration.** |
| Where `claimLegacyData` is called from | `grep -rn "claimLegacyData\|claimLegacyWishlist" app/ --include="*.tsx" --include="*.ts"` — confirm it is actually wired into the sign-in flow before assuming claiming happens automatically. If the grep returns only the definition file, it is dead code and Phase 2 must wire it in, not just extend it. |
| The friendly-409 UX fix **shipped 2026-07-08** (commit `aeea36e`) — but not the way this campaign sketched | `grep -n "409\|isShelfEligibilityError" app/api/shelf/route.ts` — an `isShelfEligibilityError(error)` helper (regex message-sniffing: `/not eligible for shelf|eligible for shelf|shelf eligibility/i`, **not** `error.code === 'P0001'`) is checked in the catch block and returns `{code:'shelf_eligibility_required', error:'Mark this fragrance as tested before it can live on your Shelf.', canMarkTested:true}` at 409 before falling through to the generic 500. Phase 4's code sketch (P0001 SQLSTATE check) is now historical context, not a to-do — the acceptance *gate* (an automated test asserting exactly 409) is still the real remaining gap, see Phase 4 below. |
| Stale in-repo comments to fix opportunistically, not treat as spec | `app/(main)/shelf/page.tsx` line ~42-43 comment says "Remaining slots (up to 10)" and `app/api/shelf/route.ts` line ~93 error string says `'fragranceId and a rank 1-10 are required'` — both are leftovers from the pre-fdbab61 10-slot era. Cosmetic, but fix in the same PR that touches those lines so they don't mislead the next session. |
| `e2e/shelf.spec.ts` now exists (added 2026-07-08, same commit as the 409 fix) but does NOT cover eligibility-rejection | `cat e2e/shelf.spec.ts` — only 2 tests: signed-out shelf empty-state, and bottom-nav routing to login. No test posts to `/api/shelf` with an ineligible fragrance and asserts 409. No `e2e/security/rls.spec.ts` exists either (the path `security-hardening`'s SKILL.md references as aspirational). Phase 4's acceptance check (the eligibility-rejection 409 test) must still be created — the blanket "no shelf e2e spec at all" claim this row used to make is stale, but the specific test Phase 4 needs is still missing. |

If any row above no longer matches what you observe, **stop and re-derive the phase you're in** — do not proceed on stale assumptions from this table.

---

## 1. The two splits, precisely

### (A) Identity split: anon_id (text) vs user_id (uuid)

- Signed-out visitors get a `scentral_anon_id` UUID in `localStorage`. Signed-in users get a Supabase Auth `user_id` (uuid, `auth.users`).
- `profiles.anon_id` is the bridge row referenced by several tables' FKs.
- Two sub-populations of legacy tables, not one:
  1. **Dual-write-ready** (has both columns today, thanks to `20260704_db006_identity_model_migration.sql`): `temptations`, `shelf_events`, `evolution_events`, `noseprint_history`. RLS already accepts either `auth.uid() = user_id` or the anon session-var match.
  2. **anon_id-only, untouched**: `insights_cache` (PK is `anon_id text`), `trace_reactions`, `traces`, `user_xp`, `user_streaks`, and (for the identity dimension specifically) `collections` still carries an `anon_id` column read by `app/api/insights/route.ts`.
- `user_xp` / `user_streaks` schemas are **not verified in any migration file** — measure first (see §0) before writing DDL against them.

### (B) Shelf split: shelf_items.rank vs collections.shelf_tier + affinity_score

- `shelf_items` (new): `rank int` (1–20, negative used transiently for two-phase reorder, never 0), `tier text` GENERATED from rank (S 1–5 / A 6–10 / B 11–15 / C 16–20), `blind_buy bool`, `source`, `locked`, gated by the `enforce_shelf_eligibility` trigger (insert/update of `fragrance_id` fails unless a `collections` row exists with `status IN ('owned','tested','past_purchase')`).
- `collections.shelf_tier` (int, default 2) + `collections.affinity_score` (int, nullable, app-enforced 0–20 range — see `app/api/affinity/route.ts`) is the older "Living Wardrobe" ranking, still actively written by `app/(main)/collection/*` and `app/api/affinity/route.ts`.
- **The bridge already exists**: `seedShelfItems()` in `app/(main)/shelf/page.tsx` reads legacy `collections.shelf_tier`/`affinity_score` (ordered tier ASC, affinity DESC) to fill `shelf_items` rows the first time a user visits `/shelf`, and it opportunistically upserts matching `collections` rows to `status='tested'` so the eligibility trigger doesn't block the seed. This is a **read-time, one-shot bridge**, not a backfill — it only runs for users who haven't been seeded yet, and it never touches `collections` rows that already exist for other reasons.
- App-layer `SHELF_SIZE` is **already 20** in both `app/(main)/shelf/page.tsx` and `app/api/shelf/route.ts` (commit `fdbab61`). Re-verify per §0 — do not assume this skill is describing a still-open cutover for that specific number.

---

## 2. Solution menu — pick per sub-problem, don't assume one strategy fits both splits

| Strategy | What it means | Best for | Derivation obligations before choosing it |
|---|---|---|---|
| **Lazy migration on sign-in** | Claim/convert a user's anon_id-keyed rows to user_id the moment they authenticate (extend `claimLegacyData`) | (A) — low write volume per user, no need to touch rows for users who never come back | Confirm `claimLegacyData` is actually called in the sign-in path (`grep -rn "claimLegacyData" app/`); decide the `user_xp`/`user_streaks` merge rule if a user_id-keyed row will ever also exist (currently it won't, since nothing writes those two tables by user_id yet — confirm with `grep -rn "user_xp\|user_streaks" app/api/`) |
| **One-shot backfill** | A single migration/script UPDATEs all rows for all known anon_id→user_id mappings at once | (A) tables with a reliable anon_id→user_id mapping already recorded somewhere (e.g. if `profiles` links both) — NOT safe for anon_id rows with no corresponding signed-in user yet (there is no user_id to backfill to) | Must first answer: how many anon_id rows have zero matching signed-in user and will simply never be claimed? (measure first — see Phase 1 gate). A backfill that ignores this leaves permanent orphans that look successfully migrated but aren't reachable by any RLS policy once anon_id support is dropped |
| **Dual-write bridge** | New code path writes both anon_id and user_id (or both `collections.shelf_tier` and `shelf_items.rank`) until the old reader is retired | (B) — already effectively how `seedShelfItems()` behaves for the shelf split; also right for (A) tables mid-transition where some readers haven't been updated yet | Must name the exact retirement condition (e.g. "drop `collections.shelf_tier` read in `seedShelfItems` once zero rows have `shelf_items` unseeded" — a measurable count, not a date) |

**Recommendation given current state:** (A) → lazy migration on sign-in, because a one-shot backfill can't reach never-returning anonymous visitors and dual-write doesn't reduce the table count. (B) → the dual-write bridge is already half-built (`seedShelfItems`); the remaining work is retiring the *read* of `collections.shelf_tier`/`affinity_score` once every active user has been seeded into `shelf_items`, not building a new bridge. Do not build a second bridge alongside the existing one.

---

## 3. Phase plan

Each phase: **Goal → Commands/SQL sketch → Expected observation → If you see X, branch to Y → Acceptance gate.**

### Phase 0 — Baseline measurement (read-only, no schema/code change)

**Goal:** know the actual blast radius before touching anything.

Run against the live DB (Supabase MCP `execute_sql`, read-only role is enough):

```sql
-- How many anon_id-only rows exist per table, and how many already have a user_id?
select 'temptations' as tbl, count(*) filter (where user_id is null) as anon_only, count(*) filter (where user_id is not null) as claimed from temptations
union all
select 'shelf_events', count(*) filter (where user_id is null), count(*) filter (where user_id is not null) from shelf_events
union all
select 'evolution_events', count(*) filter (where user_id is null), count(*) filter (where user_id is not null) from evolution_events
union all
select 'noseprint_history', count(*) filter (where user_id is null), count(*) filter (where user_id is not null) from noseprint_history;

-- anon_id-only tables with no user_id column at all yet — just row counts
select 'insights_cache' as tbl, count(*) from insights_cache
union all
select 'trace_reactions', count(*) from trace_reactions
union all
select 'user_xp', count(*) from user_xp
union all
select 'user_streaks', count(*) from user_streaks;

-- Shelf split: how many collections rows still carry legacy tier/affinity data,
-- vs how many users already have shelf_items (i.e. already bridged)?
select count(distinct user_id) as users_with_shelf_items from shelf_items;
select count(*) as collections_with_legacy_tier from collections where shelf_tier is not null or affinity_score is not null;

-- Orphan check for (A): anon_id rows with NO plausible path to a user_id ever
-- (no matching profiles.anon_id row, or profiles.anon_id row with no auth user)
select count(*) from temptations t
where t.user_id is null
  and not exists (select 1 from profiles p where p.anon_id = t.anon_id);
```

**Expected observation:** none — this phase has no "expected" number, it establishes the actual one. **Mark every number you get "measured <date>: <number>" and paste it into this file's Phase 0 section or a linked doc** so the next session doesn't re-run this blind.

**If you see** a large `anon_only` count with a large orphan count (no `profiles` row at all) **→** those rows are permanently unclaimable; decide with the user whether to leave them (cheapest, they simply age out and are RLS-invisible to everyone once anon session-var support is dropped) or explicitly delete them (irreversible — needs explicit approval per the project's migration-gating rule, see §5).

**Gate to proceed to Phase 1:** you have a written-down row count for every table in §1(A) and §1(B). No code or schema changes yet.

---

### Phase 1 — Close the identity migration gap (dual-write-ready tables)

**Goal:** every row in `temptations`, `shelf_events`, `evolution_events`, `noseprint_history` that *can* be claimed, is — for users who sign in.

**Solution:** lazy migration on sign-in (§2). This is mostly already built:

1. Verify `claimLegacyData(supabase, userId, anonId)` (in `lib/auth/claimLegacyData.ts`) is called somewhere in the sign-in flow: `grep -rn "claimLegacyData" app/ components/ --include="*.ts" --include="*.tsx"`.
2. **If it is not called anywhere** → this is dead code from an earlier session. Wire it into the post-auth callback (find it with `grep -rln "onAuthStateChange\|auth.getUser" app/ | grep -i login`) — this is a code change, not a schema change, no migration gate needed, but it is a security-relevant auth-path change, so run it past `security-hardening`'s "New/changed API route" checklist first.
3. **If it is called** → confirm it actually fires by testing sign-in with a browser session that has an anon_id with existing `temptations`/`shelf_events` rows, then re-run the Phase 0 count query — `claimed` count for that anon_id's rows should move from 0 to the full count.

**Expected observation:** after one full sign-in test, the specific anon_id's rows in all four tables show `user_id = <the signed-in user's id>`.

**If you see** rows still `user_id IS NULL` after sign-in **→** branch: check `claimLegacyData` is awaited (not fire-and-forget) and that `.throwOnError()` isn't silently swallowed by a try/catch wrapper upstream; check RLS isn't blocking the UPDATE itself (the policy requires `auth.uid() = user_id OR anon_id = current_setting(...)` — an UPDATE that sets `user_id` while filtering `WHERE anon_id = ?` should pass the anon_id branch of the USING clause, but verify the WITH CHECK clause doesn't reject the *new* row under the `auth.uid() = user_id` branch before the anon session var is even relevant here — test this with the actual RLS policies live, don't reason about it in the abstract).

**Do NOT** extend this to `user_xp`, `user_streaks`, `insights_cache`, `trace_reactions`, or `collections.anon_id` yet — they need schema changes first (Phase 2). Keep this phase scoped to tables that already have the `user_id` column.

**Acceptance gate (routed through `qe-automation`):** an API/integration test exists that signs in a fixture user with pre-seeded anon_id rows and asserts all four tables show non-null `user_id` after the claim call — not eyeballed once in a browser. If no such test exists yet, writing it is the deliverable of this phase, per `qe-automation`'s "a check that exists but isn't wired into CI or a hook does not exist" rule.

---

### Phase 2 — Extend the schema to the remaining anon_id-only tables

**Goal:** `user_xp`, `user_streaks`, `insights_cache`, `trace_reactions`, and `collections`'s anon_id usage get the same dual-column treatment as Phase 1's tables — additive only, nothing dropped.

**Before writing any DDL:** run `list_tables` (Supabase MCP) or equivalent to get `user_xp`/`user_streaks`'s actual live column list — the dossier and this skill both flag these as unverified-in-migrations. Do not guess the primary key shape.

**SQL sketch (pattern to mirror from `20260704_db006_identity_model_migration.sql` — adapt column/table names after the `list_tables` check, do not paste blind):**

```sql
-- Additive only. Nullable during transition. Mirrors db006's pattern.
ALTER TABLE user_xp ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_streaks ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);

-- insights_cache's PK is anon_id text — cannot add a uuid FK as a second PK column casually.
-- Decide: composite key, or a new user_id-keyed cache row created alongside, with the anon_id
-- row left to expire. Do NOT alter the PK without showing the exact DDL and getting approval —
-- PK changes are higher-risk than an additive nullable column.
```

**This is a migration.** Per the project's binding rule (AGENTS.md: "Before DB/auth changes: inspect first; SHOW the migration/SQL and wait for explicit 'approved' before applying" — also encoded in `security-hardening`'s migration checklist), you must show this exact SQL to the user and get an explicit "approved" before running it. This skill does not grant that approval.

**Expected observation post-apply:** `list_tables` shows the new `user_id` columns; a fresh Phase 0-style count query shows `claimed = 0, anon_only = <original count>` (nothing auto-populates from an ALTER — Phase 1's claim-on-sign-in pattern must be extended to cover these tables next, in the same PR or a fast-follow, so newly-added columns don't sit permanently empty).

**If you see** the ALTER fail because `insights_cache` or another table has a NOT NULL/PK constraint that blocks an additive nullable column **→** stop, that table needs a different pattern (composite key or shadow table) — do not weaken the constraint just to make the ALTER succeed; that is exactly the "never widen [a constraint] to make queries 'work'" trap (§4).

**Acceptance gate (routed through `security-hardening` + migration gating):** after apply, run Supabase advisors (`get_advisors`, both security and performance lenses) — zero new high-severity findings. RLS policies for the newly-dual-keyed tables follow the exact `(auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))` pattern already proven in `db006` — no ad hoc variants.

---

### Phase 3 — Shelf split: retire the legacy read, not just the legacy write

**Goal:** `seedShelfItems()` stops depending on `collections.shelf_tier`/`affinity_score` to determine ranking, because every active user's shelf state already lives in `shelf_items`.

**This is NOT about bumping SHELF_SIZE — that's already done.** Re-verify with `grep -n "SHELF_SIZE" "app/(main)/shelf/page.tsx" app/api/shelf/route.ts` before starting this phase; if it's not 20 yet in your checkout, that specific cutover is a separate, smaller task that precedes this phase.

**Expected observation before starting:** from Phase 0's `users_with_shelf_items` vs total active-user count — if this ratio isn't near 100%, most users haven't been seeded yet and it is too early to retire the legacy read; the seed function will run for them, which is fine, but you cannot yet delete `collections.shelf_tier`/`affinity_score` columns because `seedShelfItems` still depends on them for users not yet seeded.

**If you see** `users_with_shelf_items` at or near total active users **→** the legacy read is now dead weight for seeding purposes (it will simply never fire, since `seedShelfItems` only runs "for a first-time visitor (zero rows so far)" per its own doc comment). Confirm this precisely: `grep -n "seedShelfItems" "app/(main)/shelf/page.tsx"` to see the zero-rows guard, then decide whether to leave the legacy read in place (cheap, dead code for fully-seeded users, harmless) or remove it (small cleanup, not urgent).

**Do NOT drop `collections.shelf_tier`/`affinity_score` columns even after this** — they are still actively written by `app/(main)/collection/*` (Living Wardrobe) and `app/api/affinity/route.ts`, which is a **separate, still-live feature**, not dead legacy code. Consolidating the Shelf's *read path* is not the same as retiring Living Wardrobe. Confirm this distinction holds with `grep -rln "affinity_score" app/ | grep -v shelf` before assuming any column is droppable.

**Acceptance gate (routed through `qe-automation`):** an e2e spec (none currently exists — `ls e2e/*.spec.ts`) covering: new user with no `shelf_items` rows visits `/shelf` and is correctly seeded from `collections`; a user who already has `shelf_items` rows is NOT reseeded (idempotency). This is the first Shelf e2e coverage in the repo — writing it is part of this phase's deliverable, not optional polish.

---

### Phase 4 — Fix the friendly-409 UX gap for trigger rejections

**STATUS: the code fix shipped 2026-07-08 (commit `aeea36e`). Only the acceptance-gate test below is still open.**

**Goal:** an ineligible shelf add (fragrance not in `collections` with status owned/tested/past_purchase) returns a calm, specific 409, not a generic 500.

**Current state (re-verified 2026-07-10):** `app/api/shelf/route.ts` now has an `isShelfEligibilityError(error)` helper, checked in the outer catch block before the generic 500:

```ts
function isShelfEligibilityError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /not eligible for shelf|eligible for shelf|shelf eligibility/i.test(message)
}
```

catch block returns `{ code: 'shelf_eligibility_required', error: 'Mark this fragrance as tested before it can live on your Shelf.', canMarkTested: true }` at **409**. This is **message-sniffing on the Postgres exception text**, not the `error.code === 'P0001'` SQLSTATE check this campaign originally sketched (kept below as historical context — do not re-implement it, the shipped approach works and is simpler):

<details><summary>Original fix sketch (superseded, do not re-apply)</summary>

```ts
// Superseded 2026-07-08 — shipped code uses message-sniffing instead, see above.
if (error.code === 'P0001' && /not eligible for shelf/.test(error.message ?? '')) {
  return NextResponse.json(
    { error: 'Add this fragrance to your collection as tested, owned, or a past purchase before shelving it.' },
    { status: 409 }
  )
}
throw error
```
</details>

**Expected observation:** POST `/api/shelf` with `action:'add'` for a `fragranceId` that has no eligible `collections` row for that user returns **409** with the friendly message, not 500. Verify: `grep -n "409\|isShelfEligibilityError" app/api/shelf/route.ts`.

**Acceptance gate — STILL OPEN (routed through `qe-automation`, not eyeballed):** an API-layer test asserts `POST /api/shelf {action:'add', fragranceId: <ineligible id>}` returns exactly 409 with a message that does not contain the word "failed" or leak the raw Postgres exception text (per `security-hardening`'s "never leak stack traces or SQL" rule). `e2e/shelf.spec.ts` exists (added in the same commit as the fix) but only covers signed-out UX — it does NOT test the eligibility-rejection path. Add this to the coverage map this skill's Phase 3 also touches (`e2e` or API test directory — match whichever layer `qe-automation`'s "layer decision rule" assigns to route-status-code behaviour: API/integration, not e2e). This is the one concrete deliverable remaining in this phase.

---

### Phase 5 — Final validation and promotion

**Goal:** confirm the campaign's exit criteria before calling either split "done."

Exit criteria (all must be true, each with its own measurement — do not eyeball):

1. Phase 0's orphan/claimed counts, re-run: `anon_only` counts for `temptations`/`shelf_events`/`evolution_events`/`noseprint_history` are at or near the true orphan floor (rows with no matching `profiles.anon_id` — these can never be claimed and are expected to remain).
2. `user_xp`/`user_streaks`/`insights_cache`/`trace_reactions` have the `user_id` column live, RLS updated, and the sign-in claim path extended to cover them (Phase 2's fast-follow).
3. Phase 3's shelf e2e spec is green in CI (`npm run test:e2e -- --project=chromium`), not just passing locally once.
4. Phase 4's 409 test is green and `tsc --noEmit` + `npm run build` both pass (project-standard definition-of-done per `qe-automation`).
5. `get_advisors` (Supabase MCP, security + performance) shows zero new high-severity findings introduced by this campaign's migrations.
6. Nothing in `collections.shelf_tier`/`affinity_score` or `user_xp`/`user_streaks` anon_id columns has been **dropped** — this campaign is additive/claiming only; column drops are explicitly out of scope until a separate, later, explicitly-approved cleanup (see §4).

**If any exit criterion fails** → do not mark the campaign done; name which phase regressed and re-enter it. "Mostly done" is not a valid state to hand off — the next session with zero memory needs a clean phase boundary, not a partial one.

---

## 4. Fenced wrong paths — never do these, regardless of how tempting

- **Never drop `anon_id` columns from any table before Phase 0/5's backfill-verification counts confirm zero reachable rows depend on them.** A dropped column with live orphaned data is silent, permanent data loss with no error to catch it.
- **Never widen an RLS policy to make a broken query "work."** If a query fails under RLS after this campaign's changes, the fix is to correct the query's identity assumption (is it using the right column for this user's auth state?), not to loosen the policy's `USING`/`WITH CHECK` clause. A widened policy is a security regression, not a migration fix — route any RLS question through `security-hardening` before touching a policy.
- **Never bypass `enforce_shelf_eligibility` to make a shelf add "just work."** If a legitimate add is being rejected, the fix is Phase 4 (surface the rejection cleanly) or fixing the underlying `collections` status (the backfill INSERT pattern shown in `20260704_db003_shelf_tiers_eligibility.sql`'s trailing comment), never disabling or weakening the trigger. The trigger is a locked architectural decision (see `nota-architecture-contract`) enforcing that only tested/owned/past-purchase fragrances reach the Shelf — it is doctrine, not a bug.
- **No schema change without the migration gate.** Every ALTER/CREATE/DROP in this campaign — including the Phase 2 sketches above — must be shown as exact SQL and receive an explicit "approved" before being applied, per AGENTS.md's binding rule and `security-hardening`'s migration checklist. This applies even to "obviously safe" additive nullable columns.
- **Never treat a phase as complete by eyeballing the UI once.** Every phase's acceptance gate above names a specific automated check (API test, e2e spec, advisor scan, count query). If that check doesn't exist yet, creating it is part of the phase's deliverable — a manual click-through is not a substitute per `qe-automation`'s definition of done.
- **Never assume `user_xp`/`user_streaks` column names or constraints from this document or any prior session's memory.** They are explicitly unverified against a tracked migration file — always re-check live schema first.

---

## 5. Validation-and-promotion protocol (how this campaign's work gets checked, every time)

Every phase above routes through the same three gates before being called done — do not skip any:

1. **Migration gating** (AGENTS.md, binding): any schema change is shown as exact SQL, explicit "approved" required before apply. No exceptions for "small" or "additive" changes.
2. **`security-hardening` skill**: every new/changed API route and every migration goes through its checklists (session check, input validation, RLS policy shape, GDPR reachability for personal data, advisor scan post-apply). This campaign touches personal data (`temptations`, `noseprint_history`, `insights_cache` are all listed as personal data in that skill) — the GDPR reachability check applies: newly-added `user_id` columns must remain reachable by the DSAR cascade-delete path from `auth.users`.
3. **`qe-automation` skill**: every phase's acceptance check is a named, automated test at the cheapest layer that catches it (unit for pure logic, API/integration for route status codes and trigger-rejection surfacing, e2e for user-visible flows) — never "looks right in the browser." Append a lesson to that skill's `LESSONS.md` if this campaign surfaces a new bug class (e.g. the 500-vs-409 gap, once fixed, is exactly the kind of thing that skill's loop expects a `QE-n` entry for).

No phase in this campaign is "done" until it has passed all three of the above, in that order — migration approval before apply, security checklist alongside the change, automated test as the acceptance gate.

---

## 6. When NOT to use this skill

- For the architecture *rationale* (why the eligibility trigger exists, why RLS uses the dual-clause pattern, what's locked vs. still open) — use `nota-architecture-contract`.
- For the general RLS/GDPR/secrets checklist that applies to *any* route or migration, not just this campaign — use `security-hardening`.
- For deciding test layer/CI wiring mechanics outside this campaign's specific gates — use `qe-automation`.
- For running the app, deploying, or operating enrichment scripts — use `nota-run-and-operate`.
- For history of *other* incidents (build failures, image crashes, batch-yield events) not related to identity/shelf — use `nota-failure-archaeology`.
- If the question is about the fragrance domain model (personas, projection enum, notes) rather than the identity/shelf data model — use `fragrance-domain-reference`.

---

## Provenance and maintenance

**Derived from (re-verify each on drift):**
- `supabase/migrations/20260704_db001_collections_status_enum.sql`, `20260704_db002_shelf_items_blind_buy.sql`, `20260704_db003_shelf_tiers_eligibility.sql`, `20260704_db006_identity_model_migration.sql`, `20260704_db007_blind_buy_propagation.sql`, `20260704_backfill_shelf_items_eligibility.sql`, `20260704_drop_legacy_shelf_rank_check.sql`, `20260615_add_affinity_score.sql`, `20260703_shelf_events_table.sql`, `20260703_noseprint_evolution.sql`, `20260703_temptations.sql`, `20260703_insights_cache_table.sql`, `20260703_trace_reactions_table.sql`.
- `app/api/shelf/route.ts`, `app/(main)/shelf/page.tsx`, `lib/auth/claimLegacyData.ts`, `app/api/insights/route.ts`, `app/api/evolution/detect/route.ts`, `app/api/affinity/route.ts`.
- `AGENTS.md` (migration-gating rule), repo `CLAUDE.md` §3/§5/§6/§11 (identity model, database, shelf gap, operational rules).
- `.claude/skills/security-hardening/SKILL.md`, `.claude/skills/qe-automation/SKILL.md` (cross-referenced, not duplicated).

**Re-verification commands (run these whenever this skill is loaded, not just once):**
```bash
# SHELF_SIZE — the single most likely fact to drift again
grep -n "SHELF_SIZE" "app/(main)/shelf/page.tsx" app/api/shelf/route.ts

# Which tables still have anon_id-only reads in app code
grep -rln "anon_id" app/api/ --include="*.ts"

# Whether db006's dual-write columns have been extended to the remaining tables
grep -n "user_id" supabase/migrations/20260704_db006_identity_model_migration.sql
ls supabase/migrations/ | grep -i "identity\|anon" # any newer migration continuing this work?

# Friendly-409 fix: shipped 2026-07-08 via isShelfEligibilityError (message-sniffing, not P0001) — confirm still shipped:
grep -n "409\|isShelfEligibilityError" app/api/shelf/route.ts

# Whether claimLegacyData is wired into the sign-in path yet
grep -rn "claimLegacyData" app/ components/ --include="*.ts" --include="*.tsx"

# e2e/shelf.spec.ts exists (2026-07-08) but doesn't cover eligibility-rejection — confirm whether it's been extended:
cat e2e/shelf.spec.ts | grep -n "409\|eligib\|ineligible"
```

**Last verified:** 2026-07-05, by direct Read/Grep against `/Users/christophergoslin/Projects/scentral-hub` (no live DB query — all row-count SQL in this file is labelled "measure first," not stated as fact).
