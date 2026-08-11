---
name: nota-architecture-contract
description: >
  Load before touching identity (anon_id/user_id), the Shelf (shelf_items vs
  collections), any LLM route under app/api/, RLS policies, or design
  tokens/theme in nota. (repo scentral-hub). Use when asked "why does X work
  this way", "is it safe to change Y", "which table owns Z", or when a diff
  would touch app/api/shelf, app/api/read/generate, app/api/formulate,
  app/(main)/shelf, supabase/migrations/*shelf*, *identity*, or
  lib/design/tokens.css. States nota.'s load-bearing design decisions, why
  each holds, and where they are currently weak or contradicted by other docs.
  Does NOT cover: RLS/GDPR checklists for new routes or migrations (use
  security-hardening), the identity/shelf consolidation execution plan itself
  — use nota-identity-consolidation-campaign (sibling skill, now exists) for
  execution steps; this skill only states the contract it must satisfy,
  abuse/rate-limit defence ladder (use resilience-abuse — canonical, most
  current source for per-route rate-limit adoption), or bug→test lessons (use
  qe-automation).
---

# nota. Architecture Contract

Plain-language rule first: nota. has two people-identifiers and two "shelf" systems live at once because the product moved from an anonymous demo to real accounts without ever finishing the migration. Nothing is broken today, but every new feature must pick the *current* system deliberately, not the one that's easiest to find by searching the code.

This file states **what holds, why, and where the seams are** — not how to fix them. All facts below were re-verified against the repo on 2026-07-05; re-run the commands in Provenance before trusting anything with a date near this one.

## 1. Dual identity model

**What exists:**

| Identity | Where it lives | Who uses it |
|---|---|---|
| `auth.uid()` (Supabase Auth, `user_id uuid`) | Cookie session via `@supabase/ssr`, set up in `utils/supabase/server.ts` and `proxy.ts` | All nota-era tables: `noseprints`, `shelf_items`, `shelf_events`, `blind_ranking_sessions/choices`, `traces`, `trails`, `temptations`, `evolution_events`, `interactions`, `insights_cache`, `aura_cache`, `profiles` |
| `scentral_anon_id` (localStorage UUID, no server session) | Client-side only, read via `current_setting('app.current_anon_id', true)` in RLS | Legacy tables: `user_xp` (anon_id text **PK**), `user_streaks` (anon_id text **PK**) |

**Why it holds this way:** the product launched signed-out (anon_id) and added real Supabase Auth later. Rather than force a breaking migration, `supabase/migrations/20260704_db006_identity_model_migration.sql` added `user_id uuid` columns *alongside* `anon_id` on `temptations`, `shelf_events`, `evolution_events`, `noseprint_history` and rewrote RLS to accept **either**:

```sql
USING ( (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true)) )
```

This is the **dual RLS policy pattern** — every migrated table's SELECT/INSERT/UPDATE policies OR together both identity checks so neither signed-out nor signed-in users are locked out mid-migration. Confirmed live on `temptations`, `shelf_events`, `evolution_events`, `noseprint_history` (all four policies re-created in that one migration file).

**Invariant:** `auth.uid()` is canonical going forward. `security-hardening/SKILL.md` states it explicitly: "never store new personal data keyed by anon_id." `user_xp`/`user_streaks` are the two tables still fully anon_id-only (no `user_id` column at all — verify with the grep in Provenance before assuming otherwise).

**Known-weak point:** the claim flow that should copy anon_id data onto a user_id on first login is described only as a code comment at the bottom of `20260704_db006_identity_model_migration.sql` ("Claim flow note... implemented in app code, not SQL") — it is NOT a trigger or RPC. If you can't find the actual claim code in `app/`, it may not exist yet; don't assume it runs. UNVERIFIED — check with: `grep -rn "current_anon_id\|claimAnon\|anon_id.*user_id" app/ lib/ --include="*.ts" -i`.

## 2. Dual shelf model — narrower than older docs say

Two systems have existed for "what fragrances does this user have ranked":

| | `shelf_items` (nota Shelf) | `collections.shelf_tier` + `affinity_score` (legacy "Living Wardrobe") |
|---|---|---|
| Rank | `rank int`, range **−20..20, ≠ 0** (`shelf_items_rank_range` CHECK, migration `20260704_db003`) | `shelf_tier int default 2` |
| Tier | `tier text` — **GENERATED ALWAYS** column, read-only, derived from `rank` (S 1–5, A 6–10, B 11–15, C 16–20) | `affinity_score int default 50` |
| Eligibility | DB-enforced (see §3) | none |
| Blind-buy | `blind_buy boolean default false` | n/a |

**Correction to older docs — verify before citing "SHELF_SIZE=10":** `CLAUDE.md` §6/§12 (last touched 2026-07-04 20:26, commit `b17a99`) and any dossier copying it say the UI is still hardcoded to 10 slots with "Shelf v2 (20-slot tiers UI)" as the next build item. **That is now stale.** Commit `fdbab61` ("feat(nota): implement pre-launch tier-1 fixes and shelf expansion", 2026-07-04 00:44 — *before* the CLAUDE.md edit, but the doc was never re-synced on this line) already shipped the app-layer change:

```
app/api/shelf/route.ts:13:   const SHELF_SIZE = 20
app/(main)/shelf/page.tsx:8:  const SHELF_SIZE = 20
```

Both files agree on 20. There is no remaining hardcoded-10 reference anywhere in `app/`, `lib/`, or `components/` (grep in Provenance). Treat "Shelf is capped at 10" as **false as of 2026-07-05** — re-run the grep yourself before repeating it, since this is exactly the kind of fact that drifts.

**Why the dual model still exists:** `shelf_items` is DB-complete (rank, tier, eligibility, blind-buy all live) but nothing has removed `collections.shelf_tier`/`affinity_score` or the code paths that read them. CLAUDE.md §5 calls this out directly: "Two competing shelf models... Both live. Seeding bridges them (`app/(main)/shelf/page.tsx:seedShelfItems`)." No migration path off the legacy fields is defined. Do not delete `collections.shelf_tier`/`affinity_score` or the code that reads them without checking `seedShelfItems` first — it is the bridge, not dead code.

## 3. Shelf eligibility trigger — semantics

`enforce_shelf_eligibility()` (migration `20260704_db003_shelf_tiers_eligibility.sql`), fires `BEFORE INSERT OR UPDATE OF fragrance_id ON shelf_items`:

- If `NEW.fragrance_id IS NULL` (empty slot) → always allowed.
- Otherwise → requires a `collections` row for the same `user_id` + `fragrance_id` with `status IN ('owned','tested','past_purchase')`. No matching row → `RAISE EXCEPTION`, insert/update fails.

**Why:** this is the founder-brief spec ("only Tested/Own/Past-Purchase fragrances can be shelved") enforced at the data layer so no application code path can bypass it — verified in `security-hardening/SKILL.md` ("`enforce_shelf_eligibility` trigger live" is listed as a fixed fact).

**Known-weak point (was confirmed 2026-07-05, FIXED 2026-07-08 in commit `aeea36e`):** the trigger's `RAISE EXCEPTION` used to surface to the client as a generic Postgres error → bare 500. As of `aeea36e`, `app/api/shelf/route.ts` has an `isShelfEligibilityError(error)` helper checked in the catch block, returning `{ code: 'shelf_eligibility_required', error: 'Mark this fragrance as tested before it can live on your Shelf.', canMarkTested: true }` at **409** before falling through to the generic 500. Verified this session: `grep -n "409\|isShelfEligibilityError" app/api/shelf/route.ts`. Re-verify with the same command before relying on this.

**`collections.status` enum** — verify before assuming which values exist: `20260704_db001_collections_status_enum.sql` widens the CHECK constraint to `('owned','tested','past_purchase','wishlist')`. CLAUDE.md's Phase-0 note ("only owned/wishlist") was corrected in the same doc's "Migrations approved & applied" log entry: the wider constraint pre-existed in the live DB before this migration merely mirrored it into `supabase/migrations/`. Trust the migration file, not the Phase-0 paragraph, if the two ever disagree again.

## 4. Rank invariants (shelf_items)

- `rank BETWEEN -20 AND 20 AND rank <> 0` — hard CHECK constraint, not application-level.
- **Negative rank = transient state.** Reorders are two-phase: write negative ranks first (avoids UNIQUE collisions mid-swap), then a second pass writes final positive ranks. If you see negative `rank` values in `shelf_items`, that is either an in-flight reorder or a stuck/failed one — not a data bug by itself, but worth checking `shelf_events` for a matching `rank_changed` audit row.
- `tier` cannot be written directly — it is `GENERATED ALWAYS ... STORED` from `rank`. Any code that tries to `INSERT`/`UPDATE` a `tier` value will fail at the DB level. Change `rank`, never `tier`.

## 5. `fragrances.projection` — exact enum, no others

Valid values, **exactly**, case-sensitive: `Beast Mode`, `Strong`, `Moderate`, `Medium`, `Weak`. Any other string (e.g. "Heavy", "Light", "Very Strong") returns **zero rows** on a filtered query — this is a silent failure mode, not an error. Confirmed against `CLAUDE.md` §5 and the dossier; cross-check with `fragrance-domain-reference`-style skills if one exists before writing new filter UI copy.

## 6. Route-group structure

Verified via `ls`:

| Group | Contains |
|---|---|
| `app/(main)` | Core product: `shelf`, `discover`, `collection`, `compare`, `clones`, `dna-match`, `ingredients`, `insights`, `intelligence`, `layering`, `notes`, `pro`, `profile`, `scanner`, `schedule`, `social`, `spritz`, `traces`, `trails`, `wheel`, `boxes` |
| `app/(community)` | `creators`, `wear-and-share` |
| `app/(account)` | `creator` |

There is no `app/(read)` or similar for the core "The Read" flow — `/read` and `/noseprint` live outside all three route groups at the top level of `app/`. Don't assume every top-level page has a group; check `find app -maxdepth 2 -name page.tsx` if routing a new page.

## 7. LLM route architecture — corrected against dossier

The dossier for this library states "/api/read/generate is rate-limited via Upstash... the ONLY rate-limited route" and lists `/api/chemist` as an Haiku route. **Both claims were wrong as verified in code on 2026-07-05.** Since then, rate limiters were added to several more routes in commit `aeea36e` (2026-07-08). **`resilience-abuse/SKILL.md` is the canonical, most-current source for per-route rate-limit adoption — cross-check there before trusting the table below, which can drift.**

| Route | Calls Anthropic? | Rate limit | Cache |
|---|---|---|---|
| `/api/read/generate` | Yes (Haiku) | Yes — but **DB-query based**, not Upstash: counts `interactions` rows with `event_type='read_generated'` in the last hour per `user_id`, caps at 1. Not the Upstash sliding-window mechanism. | none needed (1×/user/hour by design) |
| `/api/formulate` | Yes (Haiku) | Yes — **Upstash route**: `Ratelimit.slidingWindow(10, '1 m')` per `user.id`, falls open (allows requests) if Upstash env vars are absent | none |
| `/api/pros-cons` | Yes (Haiku) | **Yes — added 2026-07-08** (`lib/rate-limit.ts`, `makeLimiter('pros-cons', 20, '1 m')`) | `chemist_cache` table, upserted |
| `/api/proscons` (no hyphen) | Yes (Haiku) | **Yes — added 2026-07-08** (`makeLimiter('proscons', 20, '1 m')`) | `sommelier_cache` table (wrong table for its purpose — see note below) |
| `/api/sommelier` | Yes (Haiku) | **Yes — added 2026-07-08** (`makeLimiter('sommelier', 20, '1 m')`) | `sommelier_cache` table |
| `/api/clone-confidence` | Yes (Haiku) | **Yes — added 2026-07-08** (`makeLimiter('clone-confidence', 20, '1 m')`) | UNVERIFIED — check route file |
| `/api/dna-match` | Yes (Haiku) | **Yes — added 2026-07-08** (`makeLimiter('dna-match', 20, '1 m')`) | UNVERIFIED — check route file |
| `/api/smells-like` | Yes (Haiku) | **No — still unguarded** | UNVERIFIED — check route file |
| `/api/scan` | Yes (Haiku) | **No — still unguarded** | UNVERIFIED — check route file |
| `/api/chemist` | **No** — pure DB/analytical route (fetches `fragrances.notes`, computes overlap). No `Anthropic` import. Dossier is wrong on this route. | n/a | n/a |
| `/api/generate-image` | Was Vertex AI Imagen | DISABLED 2026-06-28 to stop Google billing (per dossier incident log; not re-verified live) | n/a |

Re-verify: `for f in dna-match sommelier pros-cons proscons clone-confidence smells-like scan; do grep -n "makeLimiter\|Ratelimit" app/api/$f/route.ts; done`.

**Previously-undocumented finding:** `/api/proscons` (no hyphen) is a **near-duplicate** of `/api/pros-cons` — both call Anthropic, but `/api/proscons` writes to `sommelier_cache` (wrong cache table for its purpose — likely copy-paste drift from `/api/sommelier`) while `/api/pros-cons` correctly uses `chemist_cache`. The only frontend caller (`app/(main)/collection/[id]/ProsCons.tsx`) fetches `/api/pros-cons` (hyphenated). `/api/proscons` appears to be dead/orphaned code — grep confirmed zero callers in `app/`. Confirm before deleting; do not delete without explicit approval per the repo's own migration/change-control norms.

**Why this matters:** `security-hardening/SKILL.md` requires "every LLM route needs a server-side rate cap." By that bar, only `/api/smells-like` and `/api/scan` now lack one — the 2026-07-08 commit closed the gap for pros-cons/proscons/sommelier/clone-confidence/dna-match. This narrows, but doesn't close, the dossier's open-problems note ("LLM cost surface... unguarded").

## 8. Design tokens, motion, theme

- Two font families: Unbounded (nav/functional) + Cormorant Garamond italic (emotional/display, self-hosted `.woff2`). Verify: `grep -n "font-display\|Cormorant" app/layout.tsx`.
  - **Correction (2026-07-23):** display font is now **Instrument Serif** (next/font/google, `--font-instrument-serif`), not Cormorant Garamond — Cormorant is now only the fallback in the `--font-display` var chain (`Instrument Serif → Cormorant Garamond → Georgia`, see `app/globals.css`). DESIGN.md canon (Instrument Serif Italic) and CLAUDE.md §8 were both reconciled to this same fact this session. Body-sans is Unbounded + Space Grotesk — DESIGN.md previously said "Geist," which never existed in code; corrected there too. Italic is applied inline per call site (`fontStyle: 'italic'` alongside `fontFamily: 'var(--font-display)'`), not baked into the CSS variable — of ~77 call sites, only ~10-15 in identity/reveal moments (onboarding headlines, persona reveal, noseprint, "Your Scent Identity" name) should carry it, per DESIGN.md §3's 90/10 split; the rest (admin, legal, catalogue labels, section headers) are correctly roman. Re-verify with the grep above plus `grep -rn "fontStyle: 'italic'" app --include="*.tsx" -B2 | grep font-display` before trusting either the font name or the italic-coverage claim again.
- Effective theme is **dark**, hardcoded: `app/layout.tsx` sets `data-theme="dark"` unconditionally (`themeColor: "#0F172A"`), regardless of any light-palette variables defined in `:root`. There is no user-facing theme toggle. Do not "fix" the light-palette CSS variables expecting them to ever render — they are currently unreachable.
- Token bridge: `lib/design/tokens.css` aliases generic names (`--bg`, `--surface`, `--text`, `--accent`, `--line`) to the canonical `--color-*` variables defined in `app/globals.css`, and loads *after* globals.css. If a color looks wrong, check `--color-*` in `globals.css` first, not `tokens.css`.
- Motion tokens (verified, exact names — note the `--motion-` prefix that the dossier drops): `--motion-instant` 80ms, `--motion-responsive` 200ms, `--motion-ceremonial` 480ms, `--motion-organic` 800ms, plus legacy `--motion-fast`/`--motion-base`. There is no `--aura` CSS token — that dossier claim did not verify; the "Aura" feature is a React component tree (`components/aura/`) and a Supabase Edge Function, not a design token.
- Gold accent `#B8913A` confirmed as `--color-primary`.

## 9. What NOT to use this skill for

- Writing/reviewing an RLS policy, GDPR check, or new-route security checklist → **security-hardening** (has the checklist + LESSONS.md).
- Actually executing the identity/shelf consolidation → **nota-identity-consolidation-campaign** (sibling skill, now exists — 8-phase executable campaign). This skill states the contract (what must remain true); the campaign skill carries execution steps, gates, and rollback logic.
- Rate-limit/abuse defence patterns beyond "does this route have one" → **resilience-abuse**.
- Bug-fix-to-regression-test loop → **qe-automation**.
- Deploy mechanics, pre-push hook internals → AGENTS.md L15–L17 directly; not duplicated here.

## Provenance and maintenance

Derived from (2026-07-05 read-only exploration): `CLAUDE.md` (§1, §3, §5, §6, §7, §8, §12), `AGENTS.md` (L15–L17), `.claude/skills/security-hardening/SKILL.md`, `supabase/migrations/20260704_db001_collections_status_enum.sql`, `20260704_db002_shelf_items_blind_buy.sql`, `20260704_db003_shelf_tiers_eligibility.sql`, `20260704_db006_identity_model_migration.sql`, `app/api/shelf/route.ts`, `app/(main)/shelf/page.tsx`, `app/api/read/generate/route.ts`, `app/api/formulate/route.ts`, `app/api/chemist/route.ts`, `app/api/pros-cons/route.ts`, `app/api/proscons/route.ts`, `app/api/sommelier/route.ts`, `app/layout.tsx`, `app/globals.css`, `lib/design/tokens.css`, `proxy.ts`, `git log` on `fdbab61`/`b17a99`.

Re-verify before trusting, in order of how fast these drift:

```bash
# Shelf size — most likely to drift again
grep -n "SHELF_SIZE" app/api/shelf/route.ts "app/(main)/shelf/page.tsx"

# Rank/tier invariants
grep -n "rank" supabase/migrations/20260704_db003_shelf_tiers_eligibility.sql

# LLM route inventory — which routes import Anthropic, which rate-limit
grep -rln "@anthropic-ai/sdk" app/api --include="*.ts"
grep -rln "Ratelimit\|Upstash" app/api --include="*.ts"

# Is /api/proscons still orphaned?
grep -rn "'/api/proscons'\|\"/api/proscons\"" app --include="*.tsx" --include="*.ts"

# Dual identity — which legacy tables are still anon_id-only
grep -n "anon_id" supabase/migrations/*.sql

# Theme / dark mode still hardcoded?
grep -n 'data-theme="dark"' app/layout.tsx

# Motion tokens still named this way?
grep -n "\-\-motion-" app/globals.css

# projection enum unchanged?
grep -rn "Beast Mode.*Strong.*Moderate" CLAUDE.md docs/ 2>/dev/null

# Does a consolidation-execution skill exist yet?
ls .claude/skills/ | grep -i identity
```

If any of the above contradicts this file, this file is stale — correct it in place (append a dated correction line under the relevant section; do not silently rewrite history) rather than deleting the old claim outright.
