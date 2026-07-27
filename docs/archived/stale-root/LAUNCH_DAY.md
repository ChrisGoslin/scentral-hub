# Launch Day Checklist — nota.

**Launch Date:** [INSERT DATE]
**Owner:** Christopher
**Estimated Duration:** 24 hours

---

## Pre-Launch (Hour -2)

### Infrastructure Checklist
- [ ] PostHog dashboards created (all 4 from MONITORING.md)
- [ ] Sentry project linked to Vercel
- [ ] Alert notifications enabled (email + Slack)
- [ ] `.env.local` has `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Vercel env vars include both keys (Settings → Environment Variables)
- [ ] Test PostHog: run `posthog.capture('test_event', {test: true})` in DevTools
- [ ] Test Sentry: artificially throw error, verify appears on Sentry dashboard

### Code Readiness
- [ ] `npm run build` passes locally
- [ ] All tests pass (if CI/CD present)
- [ ] `git status` is clean (no uncommitted changes)
- [ ] Latest commit deployed to production: `npx vercel --prod`

### Browser Setup
- [ ] PostHog Dashboard tabs open:
  1. Launch Day (Live Metrics)
  2. Onboarding Funnel
  3. Feature Adoption
  4. Errors (Sentry)
- [ ] Sentry Issues page open
- [ ] Vercel Deployments page open
- [ ] Slack notifications window open
- [ ] Email client open (watch for alerts)

### Seed Data (Optional)
- [ ] Onboarding flow tested manually (1–2 min)
- [ ] Ability to add bottles to collection (1–2 min)
- [ ] Layering Lab renders without errors (1–2 min)

---

## Launch Hour (Hour 0 — 60 minutes before public link)

### Final Checks (30 min before launch)
- [ ] Run final deploy: `npx vercel --prod`
- [ ] Verify Vercel status: "Ready" (not "Building")
- [ ] Hit https://scentral-seven.vercel.app/
- [ ] Onboarding loads without errors
- [ ] Collection page renders
- [ ] Discover tab works
- [ ] Network tab shows <3s initial load
- [ ] Sentry confirms no errors

### Broadcast
- [ ] Send launch message to Discord / waitlist
- [ ] Share link: https://scentral-seven.vercel.app/

---

## Hour +1 (First Check-in)

**Goal:** First 50 users arrived, infrastructure holding.

### Metrics to Check
```
PostHog — Launch Day Dashboard:
☐ New sessions ≥ 50 (target: >100 by EOD)
☐ persona_revealed ≥ 10 (target: >50% of sessions by EOD)
☐ bottle_added ≥ 5 (target: >20 by EOD)
☐ Session duration avg ≥ 60s (target: >120s by EOD)
☐ Bounce rate ≤ 60% (target: <40% by EOD)

Sentry — Errors Dashboard:
☐ Error count < 5
☐ No P0 (critical) issues
☐ All errors are minor (e.g., network timeouts, optional API failures)
```

### Actions
- **If all green:** Continue monitoring, no action needed.
- **If any red:**
  1. Open Sentry → Issues to see stack traces
  2. Check browser console on https://scentral-seven.vercel.app
  3. Deploy hotfix if needed: `git commit && npx vercel --prod`
  4. Post update to Discord: "Minor issue identified, fix rolling out"

### Tweet / Discord Update
If metrics on track:
> 🎉 nota. is LIVE! 50+ users exploring their scent profiles. Building your apothecary shelf in real-time. 💫

---

## Hour +6 (Midday Check-in)

**Goal:** Validate onboarding flow health.

### Funnel Analysis
```
PostHog — Onboarding Funnel Dashboard:
☐ Step 1 (Sessions): Should match "Sessions" count from Launch Day
☐ Step 2 (onboarding_started): Should be >80% of sessions
☐ Step 3 (persona_revealed): Should be >60% of sessions
☐ Step 4 (bottle_added): Should be >40% of sessions (CRITICAL)
☐ Step 5 (wear_logged): Should be >20% of sessions
```

### Pass/Fail Criteria
- **Pass:** Step 4 ≥ 40% of sessions
  - Continue monitoring, no action needed
  - Update Discord: "Onboarding funnel healthy, [N] bottles added so far"

- **Fail:** Step 4 < 40% of sessions
  - Users are dropping off in onboarding or collection
  - Actions:
    1. Replay Sentry session recordings (Sentry → Replays) to watch user behavior
    2. Check browser console for any errors during onboarding
    3. Identify step where most users drop (persona selection? bottle search?)
    4. Deploy UI fix or add error messaging
    5. Post to Discord: "Found onboarding friction, deploying fix now"

---

## Hour +24 (End of Launch Day)

**Goal:** Summary report + stability check.

### Final Metrics
```
PostHog Dashboards:
☐ Total sessions ≥ 500 (success threshold)
☐ bottle_added ≥ 50
☐ persona_revealed ≥ 200 (>40% of sessions)
☐ wear_logged ≥ 20 (early adopters)

Sentry:
☐ Total errors ≤ 20 (avg <1 per 25 sessions)
☐ No unresolved P0 issues (critical bugs)
☐ Top 3 error causes understood

Analytics:
☐ Funnel complete: Onboarding → Collection → Use
☐ No patterns of 100% drop-off at any step
☐ Unique users ≥ 400 (80% of sessions are unique)
```

### Launch Report
**Write to MONITORING.md:**
```markdown
## Launch Day Summary — [DATE]

**Status:** ✅ Success / ⚠️ Partial / ❌ Issues

**Metrics:**
- Total sessions: [N]
- Onboarding completed: [N] ([%]% of sessions)
- Bottles added: [N]
- Errors: [N] (top issue: [brief])

**Decisions made:**
- [Any hotfixes deployed?]
- [Any copy/UX changes?]

**Next steps:**
- [Day 2 priorities]
- [Known issues tracking]
```

### Twitter/Discord Announcement
If metrics successful:
> 🚀 nota. Day 1 Wrapped:
> • [N]+ sessions
> • [N]+ scents added to collections
> • Zero critical outages
>
> Thank you early builders. We're just getting started. 💫
>
> Next: Spritz Schedule drops [DATE]

---

## Week 1 Monitoring (Ongoing)

### Daily (5 min)
1. Open PostHog Launch Day dashboard
2. Sessions trending up? Errors stable?
3. Check Sentry for new issues
4. Read any app feedback / Discord messages

### Weekly (End of Friday)
1. Generate analytics report (see MONITORING.md §6)
2. Review feature adoption: which tabs are used most?
3. Identify top 3 user friction points
4. Plan hotfixes + Phase 8 adjustments
5. Update MONITORING.md with findings

---

## Rollback Plan (If Critical Issue Found)

**Only use if:**
- >20% of users get error on launch
- Core feature (onboarding, collection) is completely broken
- OR Vercel shows 500+ error rate

**Steps:**
1. Run `git log --oneline | head -5` to find last known-good commit
2. Run `git revert HEAD` to revert latest commit
3. Deploy: `npx vercel --prod`
4. Verify Vercel status returns to "Ready"
5. Post to Discord: "Rollback deployed. Investigating issue."
6. Fix the bug locally, re-deploy

---

## Success Criteria

✅ **Launch Day Success** = Any 2 of these 3:
1. Total sessions ≥ 500
2. bottle_added ≥ 40
3. Errors < 10

✅ **Week 1 Success** = Consistent:
1. DAU > 200
2. Onboarding funnel > 35% to bottle_added
3. No P0 unresolved errors
4. Feature adoption balanced (not all sessions in one tab)

---

## Contacts & Escalation

**Primary Owner:** Christopher
**Email:** christophergoslin@outlook.com
**Slack:** [Team Slack channel]

**Escalation:**
- If website is down: Check Vercel status, deploy hotfix
- If lots of users report bugs: Post known issue thread in Discord
- If unsure: Default to monitoring + wait for more data (panic-deploy often breaks things)

---

**Document Status:** Ready for launch
**Last Updated:** 2026-06-21
**Next Review:** Post-launch day 1
