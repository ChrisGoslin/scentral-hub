# AnotherSense — Monitoring & Analytics Stack

**Status:** ✅ Production-ready  
**Last verified:** 2026-06-21  
**Owner:** Christopher  
**Stack:** PostHog (behavioral) + Sentry (errors)

---

## 1. Infrastructure Overview

### PostHog (Behavioral Analytics)
- **Project ID:** (from PostHog dashboard)
- **API Host:** `https://eu.i.posthog.com` (EU, GDPR-compliant)
- **API Key:** `NEXT_PUBLIC_POSTHOG_KEY` (in `.env.local`)
- **Session Recording:** Enabled with privacy masking
- **Autocapture:** Disabled (manual tracking only, PII-safe)
- **Persistence:** localStorage (UUID-based, no auth)

### Sentry (Error & Performance Tracking)
- **API Host:** `sentry.io` (global, GDPR project settings)
- **DSN:** `NEXT_PUBLIC_SENTRY_DSN` (in `.env.local`)
- **Environments:** 3 configs
  - `sentry.client.config.ts` — browser errors
  - `sentry.server.config.ts` — server-side errors
  - `sentry.edge.config.ts` — edge function errors
- **Traces Sample Rate:** 10% (performance monitoring)
- **Replays on Error:** 100% (always capture)
- **Replays Session:** 5% (sample rate)

---

## 2. Events Currently Tracked

All events are manually tracked via `lib/posthog.ts:track()` with properties for segmentation.

### Onboarding Flow
| Event | Properties | File |
|-------|-----------|------|
| `onboarding_started` | (none) | `app/onboarding/page.tsx` |
| `persona_revealed` | `persona_id` | `app/onboarding/page.tsx` |
| `persona_to_discover` | `persona_id` | `app/onboarding/page.tsx` |
| `context_selected` | `context`, `selected` | `app/onboarding/page.tsx` |
| `sanctuary_selected` | `sanctuary` | `app/onboarding/page.tsx` |
| `projection_selected` | `projection` | `app/onboarding/page.tsx` |

### Collection Management
| Event | Properties | File |
|-------|-----------|------|
| `bottle_added` | `fragrance_id`, `brand`, `affinity_score` | `app/(main)/collection/CollectionClient.tsx` |
| `wear_logged` | `fragrance_id`, `brand`, `duration` | `app/(main)/collection/[id]/LogWearButton.tsx` |

### Discovery & Exploration
| Event | Properties | File |
|-------|-----------|------|
| `search_used` | `query_length`, `results_count` | `app/(main)/discover/DiscoverClient.tsx` |
| `wishlist_toggled` | `fragrance_id`, `action` | `app/(main)/discover/DiscoverClient.tsx` |
| `feel_filter_applied` | `feels_applied`, `count` | `app/(main)/discover/DiscoverClient.tsx` |
| `filter_applied` | `filter_type`, `values` | `app/(main)/discover/DiscoverClient.tsx` |

### Feature Engagement
| Event | Properties | File |
|-------|-----------|------|
| `dna_match_completed` | `score`, `category`, `match_id` | `app/dna-match/page.tsx` |
| `page_view` | `pathname`, `url` | `app/components/PageTracker.tsx` |

### NEW: Feature Adoption Events (add to codebase)
```typescript
// Layering Lab
track('layering_started', { layer_count: 0 })
track('layering_saved', { layers: string[], name: string })

// Spritz Schedule (Epic 9)
track('spritz_scheduled', { frequency: string })
track('spritz_swiped', { action: 'accept' | 'skip' })

// Fragrance Wheel (Epic 10)
track('wheel_generated', { axis_count: 9 })
track('wheel_shared', { format: 'png' })

// You tab (Profile)
track('profile_viewed', { section: string })
track('xp_earned', { amount: number, source: string })

// Social tab
track('social_content_viewed', { type: 'tiktok' | 'youtube' })
```

---

## 3. PostHog Dashboard Setup

### Prerequisites
1. Create PostHog account: https://posthog.com
2. Create project "AnotherSense"
3. Copy `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local`
4. Add to Vercel production env vars

### Dashboard 1: Launch Day (Live Metrics)

**Purpose:** Real-time health check on launch day.

**Metrics (goals → targets):**
- New sessions (count) → target: >100 by EOD
- `persona_revealed` (count) → target: >50% of sessions
- `bottle_added` (count) → target: >20
- `wear_logged` (count) → target: >5
- Session duration (avg) → target: >2 min
- Bounce rate (%) → target: <40%

**Setup:**
1. PostHog → Dashboards → Create dashboard: "Launch Day"
2. Add insights:
   ```
   NEW INSIGHT: Sessions
   - Type: Trend
   - Event: $pageview
   - Time range: Last 24h
   - Breakdown: None
   
   NEW INSIGHT: Persona Revealed
   - Type: Trend
   - Event: persona_revealed
   - Time range: Last 24h
   
   NEW INSIGHT: Bottles Added
   - Type: Trend
   - Event: bottle_added
   - Time range: Last 24h
   
   NEW INSIGHT: Session Duration
   - Type: Trend
   - Event: $pageview
   - Metric: "Average session duration"
   - Time range: Last 24h
   ```

### Dashboard 2: Onboarding Funnel

**Purpose:** Track drop-off in new user flow.

**Steps:**
1. Sessions
2. `onboarding_started`
3. `persona_revealed`
4. `persona_to_discover`
5. `bottle_added`
6. `wear_logged` (optional: "did they take the next step?")

**Setup:**
1. PostHog → Dashboards → Create dashboard: "Onboarding Funnel"
2. Add insight:
   ```
   NEW INSIGHT: Funnel
   - Event sequence:
     Step 1: $pageview (pathname contains "/onboarding")
     Step 2: persona_revealed
     Step 3: persona_to_discover
     Step 4: bottle_added
     Step 5: wear_logged
   - Time range: Last 7 days
   - Breakdown: None
   ```
3. **Target:** >40% reach Step 4 (bottle_added). If <40%: onboarding flow is broken.

### Dashboard 3: Feature Adoption (Weekly)

**Purpose:** Track which features users engage with.

**Metrics:**
- Discover tab: unique users / sessions
- Layering Lab: clicks on "Suggest a layer"
- Collection: bottles added / unique users
- Social tab: views
- You tab: "Log wear" taps

**Setup:**
1. PostHog → Dashboards → Create dashboard: "Feature Adoption"
2. Add insights:
   ```
   NEW INSIGHT: Discover Usage
   - Type: Trend
   - Event: $pageview
   - Filter: pathname = "/discover"
   - Breakdown: None
   - Time range: Last 7 days
   
   NEW INSIGHT: Collection Usage
   - Type: Trend
   - Event: bottle_added
   - Time range: Last 7 days
   - Breakdown: None
   
   NEW INSIGHT: Layering Usage
   - Type: Trend
   - Event: layering_started
   - Time range: Last 7 days
   
   NEW INSIGHT: Social Views
   - Type: Trend
   - Event: $pageview
   - Filter: pathname = "/social"
   - Time range: Last 7 days
   ```

### Dashboard 4: Error Rate (Sentry + PostHog)

**Purpose:** Monitor stability.

**Metrics:**
- JS errors (count) → target: <5 per day per 1000 users
- API errors (5xx count) → target: 0
- Network errors (offline) → track separately
- Slow routes (>3s load time)

**Setup via Sentry:**
1. Sentry → Project Settings → Alerts → Create Alert Rule
   ```
   Alert 1: High Error Rate
   - Condition: events > 10 in 1 hour
   - Actions: Email + Slack
   
   Alert 2: New Issue
   - Condition: Any new error
   - Actions: Email
   ```

**Setup via PostHog:**
1. PostHog → Dashboards → Create dashboard: "Errors"
2. Add insights:
   ```
   NEW INSIGHT: Error Page Views
   - Type: Trends
   - Event: $pageview
   - Breakdown: None
   
   (Note: JS errors caught by Sentry; PostHog shows page navigations)
   ```

---

## 4. Custom Alerts (PostHog)

### Alert 1: Funnel Dropout
**Trigger:** If `bottle_added` < 10 in 24 hours  
**Action:** Email + Slack  
**Reason:** Indicates onboarding flow broken or low conversion

**Setup:**
1. PostHog → Alerts → Create Alert
2. Insight: "Onboarding Funnel" dashboard
3. Threshold: Step 4 (bottle_added) < 10
4. Frequency: 1x per day

### Alert 2: High Error Rate
**Trigger:** Sentry errors > 5 in 1 hour  
**Action:** Email + Slack  
**Reason:** Immediate stability risk

**Setup (Sentry):**
1. Sentry → Project Settings → Alerts → Create Alert Rule
2. Condition: `event.error.value` exists
3. Threshold: >5 in 1 hour
4. Notification: Email + Slack

### Alert 3: API Latency
**Trigger:** Avg response time > 2000ms  
**Action:** Slack warning  
**Reason:** Performance degradation

**Setup (Sentry):**
1. Sentry → Performance → Transactions
2. Filter: Transactions > 2000ms
3. Alert: Notify Slack

---

## 5. Launch Day Checklist

**Start:** 1 hour before public launch  
**Duration:** 24 hours

### Hour 0 (Pre-launch)
- [ ] PostHog dashboards open in browser tabs (Launch Day, Funnel, Feature Adoption, Errors)
- [ ] Sentry error dashboard open
- [ ] Vercel deployment page open (`scentral-seven.vercel.app`)
- [ ] Slack notifications enabled for PostHog + Sentry alerts
- [ ] Email alerts configured (send to `christophergoslin@outlook.com`)
- [ ] Test a sample event: do a quick onboarding flow and verify events appear in PostHog

### Hour +1 (First checkin)
**Goal:** Validate infrastructure is receiving events and app is stable

- [ ] PostHog shows new sessions > 50
- [ ] Sentry error count < 5
- [ ] `persona_revealed` events > 10
- [ ] `bottle_added` events > 5
- [ ] No critical JS errors in browser console
- [ ] Vercel deployment logs show no 5xx errors

**If metric red:**
1. Check Sentry for stack traces
2. Read Vercel build logs
3. Deploy hotfix if found
4. Notify stakeholders of known issue

### Hour +6 (Mid-day check)
- [ ] Funnel: >30% reach `bottle_added`
- [ ] Avg session duration > 90s
- [ ] Bounce rate < 50%
- [ ] No unresolved Sentry alerts

**If concerning:**
- Post update to Discord / waitlist: "Known issue: [X] being investigated"
- Prioritize fix

### Hour +24 (End of launch day)
- [ ] Total sessions > 500
- [ ] Onboarding funnel: >20% reach `bottle_added`
- [ ] No P0 crashes (Sentry zero critical errors)
- [ ] Session recording captures available in Sentry (for user feedback replay)

**Declare success if:**
- Sessions > 500
- `bottle_added` > 50
- Errors < 20 total
- No unresolved critical issues

---

## 6. Ongoing Monitoring (Week 1+)

### Daily Routine (5 min)
1. Open PostHog Launch Day dashboard
2. Scan: sessions trending? errors spiking?
3. Check Sentry: any new error patterns?
4. Read app store reviews (if shipped to App Store)

### Weekly Review (30 min, end of week)
1. **Analytics Report:**
   - DAU (daily active users)
   - MAU (monthly active users)
   - Funnel health (% reaching each step)
   - Top 5 errors (Sentry)

2. **Feature Adoption:**
   - Which features are most used?
   - Are new features (Spritz, Wheel) being adopted?
   - Any features with 0 usage?

3. **User Feedback Loop:**
   - Replay 2–3 session recordings (Sentry replays on error)
   - Note any confusing UX points
   - Prioritize Phase 8 bugs based on impact

4. **Update MONITORING.md**
   - Any new dashboards added?
   - Any alerts changed?
   - Document insights discovered

### Monthly Review (1 hour)
1. **Cohort Analysis:**
   - Compare personas (velvet_intellectual vs. solar_minimalist vs. dark_alchemist)
   - Which persona has best retention?
   - Which has best feature adoption?

2. **Performance Audit:**
   - Any routes with >3s load time?
   - Which errors are highest volume?
   - Any patterns in user drop-off?

3. **Roadmap Impact:**
   - Adjust Phase 8+ priorities based on data
   - Propose A/B tests if needed

---

## 7. Troubleshooting

### "PostHog events not appearing"
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env.local`
2. Check browser console: `posthog` should be global (type `posthog` in DevTools)
3. Run `posthog.debug()` to enable verbose logging
4. Trigger an event manually: `posthog.capture('test_event', { test: true })`
5. Check PostHog dashboard: may take 30s to appear

### "Sentry not capturing errors"
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set in `.env.local`
2. Trigger test error: go to `/` and check `sentry.client.config.ts` is loaded
3. Check Sentry dashboard: project should show "Releases" with current deployment
4. Verify deployment: `git log --oneline | head -1` should match Sentry release

### "High error rate alert firing"
1. Open Sentry → Issues
2. Click top error to see stack trace
3. Identify: is this a known issue (already fixed) or new?
4. If new: deploy hotfix or rollback previous deploy
5. Update MONITORING.md with resolution

### "Funnel shows low conversion"
1. Check `persona_revealed` is being captured (verify onboarding.tsx is running)
2. Scroll through PostHog session recordings (Sentry replays) — is UI confusing?
3. Check browser console errors during onboarding flow
4. Test onboarding flow locally: `npm run dev` → click through manually

---

## 8. Environment Variables (Verification Checklist)

**Required in `.env.local` (dev):**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**Required in Vercel (production):**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**Verify:**
- [ ] `.env.local` has both keys
- [ ] `git status` shows `.env.local` is gitignored
- [ ] Vercel project env vars match (Settings → Environment Variables)
- [ ] `npm run build` succeeds with keys present

---

## 9. Compliance & Privacy

- **GDPR:** EU data residency (PostHog EU endpoint, Sentry GDPR project)
- **DND:** Respect "Do Not Track" header (posthog config)
- **PII:** No emails, passwords, or personal data in events
  - `lib/analytics.ts` strips email + search queries automatically
  - Session recording masks input fields
- **Autocapture:** Disabled (manual tracking only, reduces false-positive data)

---

## 10. References

- PostHog Docs: https://posthog.com/docs
- Sentry Docs: https://docs.sentry.io
- AnotherSense Design Brief: `docs/AnotherSense_Final_UX_Overhaul.md`
- Sprint Plan: `docs/AnotherSense_Execution_Brief.md`

---

**Last updated:** 2026-06-21  
**Next review:** 2026-06-28 (post-launch day 1)
