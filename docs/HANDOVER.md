# nota. Pre-Launch Implementation — Project Handover

> ## Current CLI Alignment — 2026-07-23
>
> This section is the current cross-CLI handover. The dated implementation record below is preserved for history; it is **not** a complete statement of current product or repository truth.
>
> ### Start here, in order
>
> 1. [`AGENTS.md`](../AGENTS.md) — binding safety, verification, topology, Git, and execution rules.
> 2. [`NOTA_MANIFESTO.md`](../NOTA_MANIFESTO.md) — absolute psychological, material, kinetic, and cognitive-load doctrine.
> 3. [`DESIGN.md`](../DESIGN.md) — executable design-system contract for tokens, typography, materials, and Dot states.
> 4. [`NOTA_LORE.md`](../NOTA_LORE.md) — compressed interaction laws and recurring sensory patterns.
> 5. [`NOTA-BRAND-UIUX-PACK.md`](../NOTA-BRAND-UIUX-PACK.md) — implementation companion, surface glossary, and anti-slop checklist.
> 6. [`CLAUDE.md`](../CLAUDE.md) — living product and implementation memory; verify drift-prone facts against code and live systems.
> 7. [`docs/index.md`](./index.md) — map of the remaining canonical engineering and design documents.
>
> `DESIGN.md` is now present at the repo root and owns the executable token, typography, material, and Dot contract. Use [`docs/nota/03-design-system-audit.md`](./nota/03-design-system-audit.md) as implementation evidence when code and doctrine diverge.
>
> ### Truth and conflict rules
>
> - **Verified implementation outranks narrative history.** Read the relevant code before asserting that a route, token, font, schema, or interaction is live.
> - **Doctrine and implementation are different layers.** The Manifesto and Lore define the intended experience. They do not prove every rule has already been implemented.
> - **Newest explicit direction wins for future work.** When older docs conflict with the Manifesto/Lore, follow the newer doctrine while describing any migration needed from current code.
> - **Database or authentication changes require inspection, shown SQL, and explicit approval before application.**
> - **Never sweep the shared worktree.** Preserve unrelated edits and stage or commit only explicit paths authored for the task.
> - **No destructive cleanup, force-push, deployment, migration, or archive action without the authority required by `AGENTS.md` and the user's request.**
>
> ### Canonical concern ownership
>
> One concern has one owner. Supporting files may explain or operationalise the owner, but they must not redefine it.
>
> | Concern | Canonical owner | Role and precedence |
> |---|---|---|
> | Agent safety, verification, Git, scope, and task protocol | [`AGENTS.md`](../AGENTS.md) | Binding operational law. It may route to other sources but does not own brand or token values. |
> | Brand purpose, positioning, audience psychology, voice boundaries, and experiential principles | [`NOTA_MANIFESTO.md`](../NOTA_MANIFESTO.md) | Brand constitution. This is what nota. means and how it should feel. |
> | Design tokens, contrast, typography implementation, modes, surfaces, component anatomy, and Dot specification | [`DESIGN.md`](../DESIGN.md) | Executable design-system contract. It owns these concerns. |
> | Accumulated sensory patterns and hard-won interaction refinements | [`NOTA_LORE.md`](../NOTA_LORE.md) | Append-only semantic memory. It records reusable learnings but cannot override the Manifesto or DESIGN contract. |
> | Applied UI/UX guidance, examples, migration notes, and the retirement of previous framing | [`NOTA-BRAND-UIUX-PACK.md`](../NOTA-BRAND-UIUX-PACK.md) | Implementation companion. It interprets the Manifesto and DESIGN; it does not outrank them. |
> | Current repository reality, known drift, active branch state, verification, and next action | [`docs/HANDOVER.md`](./HANDOVER.md) | Time-stamped reality boundary and routing layer. It does not invent product doctrine. |
> | Document discovery order | [`docs/index.md`](./index.md) | Index only. It links to canonical owners and never duplicates their rules. |
> | Living product/code memory | [`CLAUDE.md`](../CLAUDE.md) | Useful implementation context. Drift-prone claims must be verified, and it yields to the concern owner above. |
>
> **Conflict resolution:** identify the concern first, follow that row's owner, verify current implementation, then record any unresolved mismatch here. Do not resolve a conflict by choosing whichever file was read first.
>
> **Import status (2026-07-23, content upgraded 2026-07-24):** `DESIGN.md` and `NOTA-BRAND-UIUX-PACK.md` are present at the repo root, the additive topology guidance has been integrated into `AGENTS.md`, the new reconciliation workflow has been codified, and the existing `.claude/skills/verify-cli-claims` and `.claude/skills/repo-tidy` entries have been reconciled against the new doctrine. Remaining unresolved work is implementation drift in code, not missing canon files.
>
> **2026-07-24 update:** the root `DESIGN.md` (249 lines) and `NOTA-BRAND-UIUX-PACK.md` (327 lines) were upgraded from earlier skeletal/front-matter-only versions (64 and 28 lines) to the fuller, route-reconciled versions — same file, same path, same canonical status, content only. `docs/BRAND-RULING-hero-video.md` and `docs/lessons.md` were added. §5b was merged into `AGENTS.md` (UI/UX implementation operating rules — cognitive-load gate, self-review checklist, voice, surface-names pointer) as new, non-duplicative content.
>
> **Token drift — partially resolved 2026-07-24** (see `docs/nota/14-brand-token-drift-verification.md`, verified against shipped code):
> - **Body font — RESOLVED.** Geist is the deliberate *target*; Unbounded currently ships but is a *retired* font per `NOTA-BRAND-UIUX-PACK.md` §4. Docs are intentionally ahead of code; the Unbounded→Geist migration is outstanding implementation work, not doc drift. DESIGN.md §3 and CLAUDE.md §8 now say so. (An earlier note here claiming a `#756A5C` vs `#766E64` DESIGN/Manifesto split was stale — both docs agree at `#766E64`.)
> - **Taupe hex — RESOLVED 2026-07-26.** `#766E64` (10.35:1 on ivory, clears WCAG AA for any text) is now the single value across `DESIGN.md`, `NOTA_MANIFESTO.md`, `NOTA-BRAND-UIUX-PACK.md`, `docs/brand/nota-imagery-briefs.md`, and shipped `app/globals.css`. The old `#B8AC9C` (2.03:1, atmospheric/non-text-only) is retired everywhere except `docs/DESIGN.md`, a stale pre-root-move duplicate — see repo-tidy backlog.
>
> ### Deferred by design, not blockers
>
> - Drive deep-clean for backup and Takeout build junk belongs in a separate cleanup session.
> - ChatGPT and Antigravity pointer updates should be handled the next time each tool is opened.
> - Use a fresh session with the bloat-plan two-line entry test before escalating to plugin pruning from `CONTEXT_BLOAT_RECOVERY_PLAN.md` v2.
> - Treat these items as operational follow-ups, not blockers for nota. repository alignment.
>
> ### Product and experience contract
>
> - Product name is **nota.**; the canonical local checkout is `/Users/christophergoslin/Projects/scentral-hub`.
> - Build for Curators and Contributors: reflective, identity-led, honest about recommendation lineage, and usable at different levels of fragrance fluency.
> - Reject generic SaaS dashboards, numerical anxiety mechanics, glossy storefront language, XP, and standard likes/upvotes.
> - Use material constraints: ivory paper, charcoal wet ink, fading taupe history, olive alignment, amber biological heat, restrained grain, and deliberate analog dissonance.
> - Preserve the 90/10 type intent: functional system typography dominates; italic serif is reserved for emotional identity moments. Verify the actual font tokens before changing a surface.
> - Enforce the cognitive gate: one primary decision and no more than three actions per screen.
> - Silence is the default. Haptics and sound must communicate state, not decorate it. Respect reduced-motion and device capability.
> - Keep the nota. dot meaningful: idle, save, active, and alignment are states—not ornament.
>
> ### Current repository state at handoff
>
> - **Branch:** `brand/sensory-sanctuary`, one local commit ahead of `origin/brand/sensory-sanctuary` when this section was written.
> - **HEAD:** `1cf1a26` — `feat: add sensory trace composer ritual`.
> - **Current focus:** sensory Trace Composer, ritual repair, manifesto/lore consolidation, and cross-CLI alignment.
> - **Manifesto:** present locally as `NOTA_MANIFESTO.md`; it was uncommitted when this section was written.
> - **Shared tree:** unrelated modified API/project files and an untracked maintenance script already exist. Do not stage, revert, or rewrite them as part of brand work.
> - **Verification boundary:** the last sensory commit passed `npm run build`; the subsequently dirty shared tree has not been certified by this handover. Re-run proportionate checks immediately before any new commit or push.
>
> ### Required task loop for every CLI
>
> 1. Orient: verify repository, branch, status, canonical docs, and whether the requested work already exists.
> 2. Critique: name the generic SaaS failure mode and how the proposal avoids it.
> 3. Enhance: add one bounded sensory improvement that supports utility.
> 4. Gate: confirm one decision, at most three actions, accessibility, and reduced-motion behavior.
> 5. Execute: use semantic tokens and existing patterns; keep scope reversible.
> 6. Verify: inspect the real diff, run checks proportionate to risk, and report exact blockers.
> 7. Hand off: state branch, commit or uncommitted paths, tests run, remaining uncertainty, and the next smallest safe action.
>
> ### Cross-CLI three-pass loop
>
> This is the intended execution loop for substantial work unless the user explicitly narrows scope.
> Invoke [`.claude/skills/loop-orchestrator/SKILL.md`](../.claude/skills/loop-orchestrator/SKILL.md) to classify the task as `quick`, `standard`, or `assured`, coordinate the required independent review, and validate the completion record. CLI-specific entries must point back to that file rather than copying its workflow.
>
> 1. Version 1: review the canonical docs, complete the requested task, add one bounded +20 percent stretch, and produce the first concrete output. The stretch improves quality, resilience, accessibility, or automation inside the original acceptance criteria; it does not expand product scope by 20 percent.
> 2. Self-critique pass: review Version 1 for weaknesses, gaps, regressions, overclaims, missed routing updates, or automation opportunities.
> 3. Version 2: patch the issues found in the critique, then record any genuinely reusable lesson in the canonical lesson system or owning doc.
> 4. Self-critique pass again: run the same critical review against Version 2 rather than assuming the first remediation is sufficient.
> 5. Version 3: apply the second-round fixes, verify the result, and only then present the work as complete.
>
> Treat these versions as checkpoints of one evolving artifact, not three duplicated reports. Every critique must cite observed evidence; every patch must have a material purpose. `No patch required` is an acceptable pass result when the evidence supports it.
>
> Use the smallest loop that matches the work: trivial and reversible work may stop at verified Version 1; standard bounded work normally reaches Version 2; substantial, cross-CLI, canonical, risky, or release-affecting work must reach verified Version 3. Declare a reduced loop before execution and report its residual risk.
>
> ### Version-3 completion checklist
>
> Do not label substantial work complete until every item can be answered from live evidence.
>
> - [ ] **Orientation:** repository, branch, dirty-tree boundary, and canonical reading order were verified.
> - [ ] **Version 1:** requested outcome exists and the bounded +20 percent stretch supports the task rather than expanding its scope.
> - [ ] **Critique 1:** weaknesses, overclaims, regressions, routing drift, accessibility, and automation opportunities were inspected.
> - [ ] **Version 2 delta:** each accepted finding was patched or explicitly rejected with a reason.
> - [ ] **Lesson routing:** reusable learning was added to the correct owner, or recorded as `none`; task history was not promoted into permanent canon.
> - [ ] **Critique 2:** Version 2 was reviewed independently for residual risk and unintended consequences.
> - [ ] **Version 3 delta:** second-pass findings were patched, or the evidence records `no patch required`.
> - [ ] **Verification:** relevant tests, build, diff review, routing checks, and claim checks were run and their exact outcomes recorded.
> - [ ] **Reality boundary:** uncommitted files, blockers, uncertainty, and the next smallest safe action are explicit.
> - [ ] **Completion claim:** the final response identifies loop depth reached and does not imply commit, push, deploy, migration, or production state without direct proof.
>
> ### Canon import completion checklist
>
> When adding or promoting a canonical file, do not stop at file creation.
>
> - Confirm the file exists and is readable.
> - Add it to `docs/index.md` in the correct read order.
> - Update `docs/HANDOVER.md` ownership and routing language.
> - Remove stale "missing" warnings.
> - Call out any doctrine-versus-implementation drift explicitly.
> - Verify touched files with `git diff --check` and targeted status output.
>
> ### Cross-agent coordination lessons
>
> - Cross-agent behavior belongs in shared operating rules, not tool-specific skills, when the goal is consistent conduct across CLIs.
> - Before moving, archiving, or otherwise filing a document, check the shared ledger or latest handoff first. Parallel agents on shared storage can create duplicate-action risk.
> - When a cleanup or archive action has already been performed elsewhere, record the outcome and stop. Do not "re-complete" the same file operation.
>
> ### External pointer-update instructions
>
> These are operational instructions for other CLIs. They do not change nota. product doctrine.
>
> - ChatGPT: paste the operating-system instruction into Custom Instructions and begin substantive sessions by pasting the canonical operating file contents, because ChatGPT cannot read the local filesystem directly.
> - Antigravity: replace duplicated local rule copies with a pointer that instructs it to read the canonical operating files before each task, and route changes back through the shared change-control process instead of maintaining a second instruction canon.
> - If a CLI cannot write to the canonical lesson file directly, it must append to its accessible working copy and explicitly flag that a merge is required. Silent dual-write drift is a known failure mode.

---

## Historical implementation snapshot — 2026-07-04

**Date:** 2026-07-04  
**Status:** ✅ LAUNCHED (Tier 1 & 2 complete)  
**PM Owner:** [Your Name]  
**Tech Owner:** Christopher Goslin  
**Repository:** https://github.com/ChrisGoslin/scentral-hub  
**Deployment:** https://scentral-hub.vercel.app  
**Vercel Project:** scentral-hub  
**Database:** scentral-mvp (lrkdwobnemczvhpixpky) — Supabase

---

## What Was Delivered

### Tier 1 (Blocking) — ✅ COMPLETE
All critical pre-launch gaps resolved:
- **Shelf Model:** Expanded from 10 to 20 slots with S/A/B/C tiers and DB-enforced eligibility
- **Blind Buy Tracking:** Column + trigger to identify blind-ranking purchases
- **Identity Migration:** user_id integration with dual-auth (anon_id + authenticated)
- **Rate Limiting:** Server-side 1-per-hour cap on identity generation (/api/read/generate)
- **Brand System:** Unified tone (BRAND.md), Dot component, all BaseNote/AnotherSense refs removed

### Tier 2 (High Priority) — ✅ COMPLETE
- **3 Foundational Trails:** Spraying Technique, Longevity & Skin Chemistry, Anosmia
- **Insights Validation:** "Your Impact" section verified against spec
- **Accessibility:** Motion hooks respect prefers-reduced-motion

### Tier 3 (Post-Launch) — ⏳ DEFERRED
- Imagery brief assets (hero, onboarding, empty-state art)
- Onboarding flow redesign (3-step entry with scent-chip picker)
- Wear-log Aura context
- Swap tables + UI

---

## Live Features

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| **Shelf (20 slots)** | ✅ Live | `/shelf` | Tiers S/A/B/C; add/remove/reorder |
| **Noseprint** | ✅ Live | `/noseprint` | Identity reveal + timeline |
| **The Read** | ✅ Live | `/read` | Haiku-powered identity generation |
| **Blind Ranking** | ✅ Live | `/shelf/blind` | Bias-removal mechanic |
| **Traces** | ✅ Live | `/traces` | Community scent descriptions |
| **Trails** | ✅ Live | `/trails` | 3 guided learning paths |
| **Insights** | ✅ Live | `/insights` | Your Impact, Scentiment, Evolution |
| **Temptations** | ✅ Live | API route | Subtle commerce triggers |
| **Aura Advisory** | ✅ Live | Fragrance detail, Shelf | Contextual AI guidance (24h cache) |
| **Enrichment Queue** | ✅ Live | `/admin/enrichment` | Description backfill + approval UI |

---

## Database Schema Changes

### 7 Applied Migrations

```sql
-- DB-001: Collections status enum
ALTER TABLE collections ADD CONSTRAINT collections_status_check
  CHECK (status IN ('owned','tested','past_purchase','wishlist'));

-- DB-002: Shelf blind buy tracking
ALTER TABLE shelf_items ADD COLUMN blind_buy boolean NOT NULL DEFAULT false;

-- DB-003: Tier model + eligibility
ALTER TABLE shelf_items ADD COLUMN tier text GENERATED ALWAYS AS (
  CASE WHEN rank BETWEEN 1 AND 5 THEN 'S' ... END
) STORED;
-- + trigger: enforce_shelf_eligibility() — only Tested/Owned/Past-Purchase fragrances

-- DB-006: Identity model (user_id to legacy tables)
ALTER TABLE temptations ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE shelf_events ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE evolution_events ADD COLUMN user_id uuid REFERENCES auth.users(id);
-- + RLS policies updated to support (auth.uid() = user_id) OR (anon_id = current_setting(...))

-- DB-007: Blind buy propagation
CREATE TRIGGER set_blind_buy_on_reveal() BEFORE INSERT ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION set_blind_buy_on_reveal();

-- Backfill: Collections entries for existing shelf_items
INSERT INTO collections (user_id, fragrance_id, status, created_at)
SELECT DISTINCT si.user_id, si.fragrance_id, 'tested', now()
FROM shelf_items si WHERE si.fragrance_id IS NOT NULL ...
```

**Migration Status:** All applied to scentral-mvp. Verify with:
```bash
supabase migration list --project-id lrkdwobnemczvhpixpky
```

### Image URL Guardrail

- `fragrances.image_url` now has a DB trigger guardrail that nulls Fragrantica and Parfumo perfume page URLs so the UI falls back to the family gradient placeholder instead of rendering broken images.
- Verify the live cleanup with `npm run audit:image-urls`; it should report `Suspect rows: 0`.

---

## Code Changes (Commit: fdbab61)

### New Files (5)
- `components/ui/Dot.tsx` — Brand component (4 motion states: idle, save, active, alignment)
- `docs/BRAND.md` — Tone doctrine, banned patterns, language system
- `hooks/useReducedMotion.ts` — Respects OS accessibility settings
- `hooks/useClaimLegacyWishlist.ts` — Client-side localStorage migration
- `lib/auth/claimLegacyData.ts` — Server-side anon_id → user_id claim

### Modified Files (13)
| File | Change |
|------|--------|
| `app/(main)/shelf/page.tsx` | SHELF_SIZE: 10→20; backfills collections for matches |
| `app/api/shelf/route.ts` | SHELF_SIZE: 10→20 |
| `app/api/read/generate/route.ts` | +Server-side hourly rate limit |
| `app/auth/callback/route.ts` | +Legacy data claim on auth success |
| `app/components/AuraShareCard.tsx` | BASENOTE→NOTA., ANOTHERSENSE→NOTA.APP |
| `app/(main)/collection/[id]/GiftThis.tsx` | basenote.png→nota.png |
| `app/(main)/terms/page.tsx` | BASENOTE→NOTA. |
| `app/onboarding/page.tsx` | basenote.app→nota.app |

---

## How It Works (Key Systems)

### 1. Shelf Model
```
User creates/updates shelf_items (rank 1-20)
  ↓
DB trigger: enforce_shelf_eligibility()
  - Checks: is fragrance in collections with status='tested'|'owned'|'past_purchase'?
  - If no → raises exception
  - Prevents invalid shelf state
  ↓
Shelf events logged (added/removed/rank_changed)
  ↓
Tier auto-calculated: tier = CASE rank 1-5 'S', 6-10 'A', 11-15 'B', 16-20 'C'
```

**Ops note:** If eligibility trigger blocks a shelf operation, backfill the missing collections entry:
```sql
INSERT INTO collections (user_id, fragrance_id, status, created_at)
VALUES (?, ?, 'tested', now())
ON CONFLICT DO NOTHING;
```

### 2. Identity Model (Auth + Legacy)
```
User logs in via /login (Supabase OTP)
  ↓
/auth/callback exchanges code for session
  ↓
claimLegacyData() runs server-side:
  - UPDATE temptations WHERE anon_id = ? SET user_id = auth.uid()
  - UPDATE shelf_events WHERE anon_id = ? SET user_id = auth.uid()
  - UPDATE evolution_events WHERE anon_id = ? SET user_id = auth.uid()
  ↓
useClaimLegacyWishlist() runs client-side:
  - Reads localStorage.scentral_wishlist
  - Inserts into collections(user_id, status='wishlist')
  ↓
Dual-auth RLS policies allow both:
  - auth.uid() = user_id (authenticated)
  - anon_id = current_setting('app.current_anon_id') (legacy anon)
```

**Ops note:** Monitor for claim failures in logs. If a user's legacy data isn't claimed, manually run the SQL above with their anon_id and new user_id.

### 3. Rate Limiting
```
POST /api/read/generate
  ↓
Check: have they generated in the last hour?
  SELECT COUNT(*) FROM interactions 
  WHERE user_id = ? AND event_type = 'read_generated' 
  AND created_at > now() - interval '1 hour'
  ↓
If count ≥ 1 → return 429 (rate limited)
If count = 0 → generate identity (Haiku call, ~1s)
```

**Ops note:** Adjust rate limit in `app/api/read/generate/route.ts:15` if needed.

### 4. Blind Buy Propagation
```
Blind ranking reveal:
  shelf_items INSERT with source='blind_ranking'
  ↓
Trigger: set_blind_buy_on_reveal()
  - IF source='blind_ranking' AND fragrance NOT IN collections
  - THEN set blind_buy=true
  ↓
Insights query: "Your blind buys outrank your researched buys"
```

---

## Monitoring & Operations

### Health Checks

**Daily (automated via Vercel):**
- TypeScript build passes
- No runtime errors in logs
- Shelf operations succeed (rank updates)

**Weekly (manual):**
```bash
# Check migrations are all applied
supabase migration list --project-id lrkdwobnemczvhpixpky

# Check for rate limit hits
SELECT COUNT(*) as rate_limited_attempts
FROM interactions
WHERE event_type = 'read_generated'
AND created_at > now() - interval '7 days'
GROUP BY user_id
HAVING COUNT(*) > 1;

# Check shelf eligibility trigger
SELECT COUNT(*) as ineligible_insertions
FROM pg_stat_user_tables
WHERE relname = 'shelf_items'
AND n_live_tup < (SELECT COUNT(*) FROM shelf_items);
```

### Common Operations

**Scale shelf from 20→30 slots:**
1. Update `SHELF_SIZE = 30` in both `app/(main)/shelf/page.tsx` and `app/api/shelf/route.ts`
2. Adjust tier ranges in DB-003 trigger: `WHEN rank BETWEEN 16 AND 25 THEN 'B'` etc.
3. Deploy via `npx vercel --prod`

**Disable rate limiting (if needed for testing):**
- Comment out lines 15-24 in `app/api/read/generate/route.ts`
- Re-enable before production use

**Force-claim legacy data for a user:**
```bash
# Get their user_id and anon_id, then:
supabase sql <<EOF
UPDATE temptations SET user_id = '${USER_ID}' WHERE anon_id = '${ANON_ID}';
UPDATE shelf_events SET user_id = '${USER_ID}' WHERE anon_id = '${ANON_ID}';
UPDATE evolution_events SET user_id = '${USER_ID}' WHERE anon_id = '${ANON_ID}';
EOF
```

---

## Rollback Plan

### If Shelf Eligibility Trigger Breaks
```bash
# Disable the trigger temporarily
supabase sql <<EOF
DROP TRIGGER IF EXISTS shelf_eligibility ON shelf_items;
EOF

# Investigate the blocked fragrance
SELECT si.user_id, si.fragrance_id, c.status
FROM shelf_items si
LEFT JOIN collections c ON si.user_id = c.user_id AND si.fragrance_id = c.fragrance_id
WHERE c.status IS NULL;

# Backfill missing collections entries
INSERT INTO collections (user_id, fragrance_id, status, created_at)
SELECT DISTINCT si.user_id, si.fragrance_id, 'tested', now()
FROM shelf_items si
WHERE NOT EXISTS (SELECT 1 FROM collections c WHERE c.user_id = si.user_id AND c.fragrance_id = si.fragrance_id);

# Re-enable the trigger
supabase sql <<EOF
CREATE TRIGGER shelf_eligibility BEFORE INSERT OR UPDATE OF fragrance_id ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION enforce_shelf_eligibility();
EOF
```

### If Auth Claim Fails
1. Check `/auth/callback` logs for errors
2. Verify `profiles.anon_id` exists for the user
3. Run manual claim SQL (see above)
4. Test by logging out and back in

### If Rate Limiting Triggers Too Early
1. Check if user's interactions have old `read_generated` events
2. Clear old events if needed:
   ```sql
   DELETE FROM interactions 
   WHERE user_id = ? AND event_type = 'read_generated' 
   AND created_at < now() - interval '24 hours';
   ```

---

## What to Communicate to Users

### At Launch
> "nota. is now live with an expanded 20-slot shelf, smarter organization with tiers, and a seamless sign-in experience. Your past shelf and wishlists will be automatically preserved when you log in."

### Key Features to Highlight
1. **20-slot Shelf** — organize by tier (S/A/B/C)
2. **Guided Learning** — 3 new trails on spraying, longevity, and olfactory adaptation
3. **Blind Ranking** — discover what you *really* prefer without bias
4. **Persistent Identity** — your noseprint and shelf are now saved forever

### Support Escalation
| Issue | Solution |
|-------|----------|
| "I lost my shelf" | → They didn't auth; shelf is saved when logged in |
| "Rate limit error on Read" | → Max 1 generation per hour; try again in 1h |
| "My old data didn't transfer" | → Claim runs at login; try logging out and back in |
| "Shelf won't let me add X" | → Fragrance must be tested/owned/wishlist first |

---

## Post-Launch Roadmap

### Phase 1 (Week 1–2)
- Monitor error logs and user feedback
- Adjust rate limiting if needed
- Surface issues to design team

### Phase 2 (Week 3–4)
- Imagery assets (hero, onboarding, empty states)
- Onboarding flow redesign (3-step entry)
- Wear-log Aura context

### Phase 3 (Month 2)
- Swap tables + UI (wishlist → swap offers)
- Advanced Insights (blind-buy analysis)

---

## Key Contacts & Resources

| Role | Contact | Responsibility |
|------|---------|-----------------|
| **Tech Lead** | Christopher Goslin | Architecture, DB, deployments |
| **PM** | [Your Name] | Roadmap, user comms, triage |
| **Design** | [Design Lead] | Imagery assets, Onboarding redesign |
| **QA** | [QA Lead] | Test shelf model, auth flow |

**Documentation:**
- `/docs/BRAND.md` — Tone system
- `/docs/nota/04-architecture-plan.md` — Full technical architecture
- `/supabase/migrations/` — All DB change SQL

**Monitoring:**
- Vercel logs: https://vercel.com/christopher-goslins-projects/scentral-hub
- Supabase logs: https://app.supabase.com/project/lrkdwobnemczvhpixpky

---

**Handover Date:** 2026-07-04  
**Status:** Ready for launch ✅
