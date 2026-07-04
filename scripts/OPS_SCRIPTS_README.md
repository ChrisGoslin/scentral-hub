# nota. Operations Scripts

Quick-reference scripts for common operational tasks. All scripts require Supabase CLI to be installed and authenticated.

## Installation

```bash
# Make all scripts executable
chmod +x scripts/ops-*.sh

# Verify Supabase CLI is installed
supabase --version
```

---

## Scripts

### 1. `ops-migrations-verify.sh`
**Verify all nota. migrations are applied**

```bash
./scripts/ops-migrations-verify.sh
```

Checks for:
- DB-001: Collections status enum
- DB-002: Shelf blind_buy column
- DB-003: Tier model + trigger
- DB-006: Identity migration
- DB-007: Blind buy propagation
- Backfill: Collections entries

**Output:** ✅ All applied or ❌ List missing migrations

---

### 2. `ops-health-check.sh`
**Daily health check for production**

```bash
./scripts/ops-health-check.sh
```

Checks:
- ✅ Vercel deployment active
- ✅ API routes responding
- ✅ Public pages accessible
- ✅ Supabase responsive
- ✅ TypeScript builds

**When to run:** Daily (cron) or before major updates

**Output:** Pass/fail summary with details

---

### 3. `ops-claim-legacy-data.sh`
**Manually claim legacy anon_id data to a user**

```bash
./scripts/ops-claim-legacy-data.sh <user-uuid> <anon-id>
```

**Example:**
```bash
./scripts/ops-claim-legacy-data.sh \
  550e8400-e29b-41d4-a716-446655440000 \
  "550e8400-e29b-legacy"
```

**When to use:**
- User reports missing data after login
- Auth claim didn't run (debugging auth/callback)
- Manual data migration for testing

**What it does:**
- Updates temptations.user_id
- Updates shelf_events.user_id
- Updates evolution_events.user_id
- Updates noseprint_history.user_id

**Note:** Requires confirmation before running

---

### 4. `ops-troubleshoot.sh`
**Diagnostic tools for common issues**

#### 4a. Rate limit usage
```bash
./scripts/ops-troubleshoot.sh rate-limits [days]
```

Shows users who hit read_generated limits in the last N days (default: 7)

**Output:** user_id, count, first/last timestamps

**When to use:** Check if rate limiting is working or blocking legitimate users

---

#### 4b. Shelf eligibility issues
```bash
./scripts/ops-troubleshoot.sh shelf-ineligible
```

Find fragrances that are blocked by the eligibility trigger (not in collections with proper status)

**Output:** user_id, fragrance_id, name, brand, status

**When to use:** User can't add a specific fragrance to shelf

**Fix:**
```sql
INSERT INTO collections (user_id, fragrance_id, status, created_at)
VALUES (?, ?, 'tested', now());
```

---

#### 4c. Auth claim status
```bash
./scripts/ops-troubleshoot.sh auth-claims <user-uuid>
```

Check if a user successfully claimed their legacy data

**Output:** Row counts per table

**When to use:** User says their data disappeared after login

---

#### 4d. Blind purchases
```bash
./scripts/ops-troubleshoot.sh blind-buys <user-uuid>
```

List a user's blind purchases from blind ranking

**Output:** rank, name, brand, blind_buy flag, created_at

**When to use:** Audit blind-buy feature or user's shelf composition

---

#### 4e. Shelf statistics
```bash
./scripts/ops-troubleshoot.sh shelf-stats
```

Aggregate metrics: users, items, tiers, blind-buys

**Output:** Counts and averages across entire shelf

**When to use:** Feature health check, user engagement metrics

---

## Common Issues & Solutions

### "User lost their shelf after login"
```bash
# 1. Check if data was claimed
./scripts/ops-troubleshoot.sh auth-claims $USER_ID

# 2. If empty, manually claim
./scripts/ops-claim-legacy-data.sh $USER_ID $ANON_ID

# 3. Verify
./scripts/ops-troubleshoot.sh auth-claims $USER_ID
```

### "Rate limit error on /api/read/generate"
```bash
# Check the user's limit usage
./scripts/ops-troubleshoot.sh rate-limits 1

# If spamming (testing): clear old events
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
DELETE FROM interactions
WHERE user_id = '$USER_ID'
AND event_type = 'read_generated'
AND created_at < now() - interval '24 hours';
EOF
```

### "Can't add fragrance to shelf"
```bash
# Check shelf eligibility
./scripts/ops-troubleshoot.sh shelf-ineligible

# Backfill missing collection entry
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
INSERT INTO collections (user_id, fragrance_id, status, created_at)
VALUES ('$USER_ID', '$FRAGRANCE_ID', 'tested', now());
EOF
```

### "Deployment isn't working"
```bash
# Run full health check
./scripts/ops-health-check.sh

# If build fails, check logs
cd /Users/christophergoslin/Projects/scentral-hub
npm run build
```

---

## Project IDs & Links

```
Supabase Project ID: lrkdwobnemczvhpixpky
Supabase Project: scentral-mvp
Vercel Project: scentral-hub
Production URL: https://scentral-hub.vercel.app

Supabase Dashboard: https://app.supabase.com/project/lrkdwobnemczvhpixpky
Vercel Dashboard: https://vercel.com/christopher-goslins-projects/scentral-hub
```

---

## Automation Suggestions

### Daily health check (cron)
```bash
# Add to crontab: runs daily at 08:00
0 8 * * * cd /Users/christophergoslin/Projects/scentral-hub && ./scripts/ops-health-check.sh >> /var/log/nota-health.log 2>&1
```

### Weekly statistics report
```bash
# runs every Monday at 09:00
0 9 * * 1 cd /Users/christophergoslin/Projects/scentral-hub && ./scripts/ops-troubleshoot.sh shelf-stats
```

### Daily rate limit check
```bash
# runs daily at 18:00 (end of day)
0 18 * * * cd /Users/christophergoslin/Projects/scentral-hub && ./scripts/ops-troubleshoot.sh rate-limits 1
```

---

## Rollback Procedures

### If Shelf Eligibility Trigger Breaks
```bash
# Disable temporarily
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
DROP TRIGGER IF EXISTS shelf_eligibility ON shelf_items;
EOF

# Investigate
./scripts/ops-troubleshoot.sh shelf-ineligible

# Backfill
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
INSERT INTO collections (user_id, fragrance_id, status, created_at)
SELECT DISTINCT si.user_id, si.fragrance_id, 'tested', now()
FROM shelf_items si
WHERE NOT EXISTS (
  SELECT 1 FROM collections c
  WHERE c.user_id = si.user_id AND c.fragrance_id = si.fragrance_id
);
EOF

# Re-enable
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
CREATE TRIGGER shelf_eligibility BEFORE INSERT OR UPDATE OF fragrance_id ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION enforce_shelf_eligibility();
EOF
```

### If Auth Claim Fails for All Users
1. Check `/auth/callback` logs in Vercel
2. Verify `profiles.anon_id` is populated
3. Manually run batch claim:
```bash
supabase sql --project-id lrkdwobnemczvhpixpky <<EOF
UPDATE temptations t
SET user_id = p.user_id
FROM profiles p
WHERE t.anon_id = p.anon_id AND t.user_id IS NULL;

-- Repeat for shelf_events, evolution_events, noseprint_history
EOF
```

---

## Support

For issues with these scripts:
1. Check script logs
2. Verify Supabase CLI is authenticated
3. Confirm project ID is correct
4. See HANDOVER.md for architecture details

---

**Last updated:** 2026-07-04  
**nota. version:** Launch (Tier 1 + 2)
