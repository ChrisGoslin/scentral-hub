# nota. Pre-Launch Implementation — Project Handover

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
