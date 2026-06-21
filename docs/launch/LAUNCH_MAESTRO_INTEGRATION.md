# Launch Maestro Integration Guide

**Plugin location:** `~/.claude/plugins/launch-maestro/`  
**Available agents:** `launch-coordinator`, `engagement-responder`  
**Status:** Ready to use immediately

---

## What Launch Maestro Does

You've built an incredible launch asset pack (8 documents, 50KB of ready-to-execute copy). Launch Maestro is the agent automation layer that:

1. **Orchestrates the timeline** — Tells you what's due when, verifies posts are queued, tracks metrics
2. **Manages engagement** — Triages comments in real-time, suggests templated responses, flags edge cases
3. **Compiles daily briefings** — Every morning, tells you what's due, what happened yesterday, what needs attention
4. **Tracks metrics** — Logs downloads, upvotes, engagement %, sentiment, bugs
5. **Archives everything** — Keeps a record of all posts and responses for post-mortems

---

## Integration: Assets + Agents

```
docs/launch/
├── LAUNCH_DATE.md                   ← Set T+0 here (all timelines relative to this)
├── LAUNCH_ASSET_CHECKLIST.md        ← Daily operations checklist
├── README.md                        ← Master index
├── TWEET_QUEUE.md                   ← 8 tweets + response templates
├── REDDIT_POSTS.md                  ← 2 Reddit posts + FAQ
├── EMAIL_TEMPLATE.md                ← 3 emails (HTML + text)
├── PRODUCTHUNT_POST.md              ← PH post + response templates
└── DEMO_VIDEO_SCRIPT.md             ← 15s video storyboard

                    ↓ Agents reference ↓

~/.claude/plugins/launch-maestro/
├── agents/
│   ├── coordinator.md               ← Daily briefings, post coordination, metrics
│   └── engagement-responder.md       ← Comment triage, response templates, sentiment
├── plugin.json                      ← Configuration + file paths
└── README.md                        ← How to invoke agents
```

The agents pull template responses directly from your launch asset documents. They're connected.

---

## Setup (One-Time)

### 1. Set Your Launch Date

Edit `/Users/christophergoslin/Projects/scentral-hub/docs/launch/LAUNCH_DATE.md`:

```markdown
# Scentral Launch Date + Key Milestones

**SET THIS FIRST. All timeline references are relative to T+0.**

## Launch Day (T+0)

**Date:** [YOUR DATE HERE]  
**Time:** 12:01 AM PST (3:01 AM EST / 8:01 AM GMT)
```

Fill in your launch date. All agent briefs will be relative to this T+0.

### 2. Verify Plugin Loads

In Claude Code, ask:

```
@launch-coordinator morning briefing for T-7
```

If the agent loads, you're set. (Don't worry about the actual T-7 date; this is a test.)

---

## Launch Week Workflow

### T-7 (Lockdown Day)

**Morning:**
```
@launch-coordinator pre-launch checklist
```

Verify:
- All copy assets locked (tweets, Reddit, email, PH post)
- All visual assets locked (video, images)
- All social scheduling queued
- Infrastructure QA complete
- Monitoring setup ready

**Checkpoint:** If coordinator says "GO", you're ready to proceed.

### T-3 (Scheduling Day)

**Morning:**
```
@launch-coordinator scheduling verification
```

Verify:
- All tweets queued in Buffer/Later (T+0 through T+7)
- Email campaigns queued (T+1, T+3, T+14)
- Reddit posts ready to publish (T+2, T+3)
- PH draft created and scheduled for midnight T+0

### T-1 (Final Check)

**Morning:**
```
@launch-coordinator final pre-launch check
```

Verify:
- Vercel deployment live (<3s load, no errors)
- Supabase connection working
- Analytics monitoring configured
- Sentry error tracking live
- Browser tabs open (PH, Twitter, Reddit, email)

### T+0 (Launch Day)

**12:01 AM PST (Post goes live)**

**Every 30 minutes (for first 6 hours):**
```
@engagement-responder triage new comments — last 30 minutes
```

Real-time monitoring. Use suggested templated responses. Escalate edge cases.

**9 AM UTC (Morning report):**
```
@launch-coordinator morning briefing for T+0
```

Check: What's live, early metrics, any blockers.

**Evening (T+0 end):**
```
@launch-coordinator daily metrics for T+0
```

Log: Downloads, PH upvotes/rank, comments, sentiment.

### T+1 through T+7

**Each morning (9 AM UTC):**
```
@launch-coordinator morning briefing for T+[day]
```

You'll get:
- Today's scheduled posts (with status)
- Yesterday's metrics (complete table)
- Top engagement Q&A (with suggested responses)
- Action items for today
- Any risk alerts

**Every 2–4 hours (during active engagement):**
```
@engagement-responder triage comments — last 2 hours
```

Quick sentiment check, template responses, escalations.

**Evening (each day):**
```
@launch-coordinator daily metrics for T+[day]
```

Compile day's numbers into archive.

### T+8 through T+30

**Weekly briefing (Monday 9 AM UTC):**
```
@launch-coordinator weekly summary for Week [#]
```

Get: Top posts, sentiment trends, feature requests, roadmap impact.

**As-needed engagement:**
```
@engagement-responder new comments on [platform]
```

Keep responding, keep archiving.

---

## Agent Invocation Cheat Sheet

### Launch Coordinator (Timeline + Metrics)

**Daily:**
```
@launch-coordinator morning briefing for T+[0-30]
@launch-coordinator daily metrics for T+[0-30]
```

**Verification:**
```
@launch-coordinator pre-launch checklist
@launch-coordinator scheduling verification
@launch-coordinator final pre-launch check
```

**Weekly:**
```
@launch-coordinator weekly summary for Week [1-4]
@launch-coordinator launch archive — Week [1-4]
```

**Specific queries:**
```
@launch-coordinator verify [post type] is queued
@launch-coordinator what's due today?
@launch-coordinator are we on track for [metric]?
```

### Engagement Responder (Comments + Sentiment)

**Real-time:**
```
@engagement-responder triage new comments — last 2 hours
@engagement-responder sentiment pulse check
```

**Per-platform:**
```
@engagement-responder check Twitter replies on main launch post
@engagement-responder new comments on Reddit r/fragrance
@engagement-responder Product Hunt thread — last 50 comments
```

**Specific:**
```
@engagement-responder log response to [comment text]
@engagement-responder flag bugs from comments
@engagement-responder highlight enthusiastic users
```

---

## Response Template Lookup

If an agent suggests a template, it tells you the source:

```
"Response template from TWEET_QUEUE.md §Engagement + Response Templates"
"Response template from REDDIT_POSTS.md §r/fragrance Engagement Notes"
"Response template from PRODUCTHUNT_POST.md §Response Strategy + FAQ"
```

Open that document + section to see the exact template.

---

## Dashboard / Tracking

**Launch Coordinator provides:**
- **Daily briefing** — Today's schedule, yesterday's metrics, action items
- **Metrics table** — Downloads, upvotes, comments, engagement %, conversion
- **Sentiment summary** — % positive/neutral/negative + trends
- **Risk alerts** — Missed deadlines, low engagement, bugs, negative spikes
- **Archive** — Every post, every response, every metric logged

**Engagement Responder provides:**
- **Comment triage** — Sentiment, type, templated response (or escalation)
- **Sentiment pulse** — Updated after every batch of comments
- **Opportunity alerts** — Enthusiastic users, feature requests, bugs
- **Response log** — Which templates work best, user reactions

---

## Key Metrics (Watch These)

By **T+7**, aim for:

| Metric | Target | Status |
|--------|--------|--------|
| Downloads | 1000+ | ⏳ |
| PH Upvotes | 500–800 | ⏳ |
| PH Rank | Top 5 | ⏳ |
| PH Comments | 150+ | ⏳ |
| Reddit (both) | 50+ comments each | ⏳ |
| Twitter impressions | 50K+ | ⏳ |
| Persona completion | 60%+ | ⏳ |
| Bottle-add conversion | 40%+ | ⏳ |
| Sentiment | 80%+ positive | ⏳ |
| Bugs | 0 major, <5 min downtime | ⏳ |

The coordinator tracks all of these daily. If you miss a target, you'll see it in the briefing and can adjust strategy on T+8.

---

## Contingencies

### If engagement is slow (Day 3):

Coordinator will flag it. Suggested actions:
- Boost Twitter presence (thread, reply to mentions)
- Reddit outreach (answer every question thoroughly)
- Reach out to influencers / early users
- Post a "day 2 metrics" update to PH comments

### If sentiment turns negative:

Responder will flag it immediately. Suggested actions:
- Investigate which comments are driving negativity
- Use escalation responses (diplomatic, not defensive)
- Post clarifying tweet or FAQ response
- Don't ignore criticism — acknowledge and explain

### If a bug is reported:

Responder flags it. You decide whether to:
- Quick fix + deploy + post update
- Acknowledge, log for post-launch fix
- Request more details (device/OS/reproduction steps)

### If you miss a scheduled post:

Coordinator flags it by T-3 (or earlier). Suggested actions:
- Manually queue in Buffer immediately
- Adjust timing if needed
- Don't skip — momentum matters

---

## Example Daily Briefing (T+1)

```
## Launch Briefing — Day 2 (T+1)

**Today's Schedule:**
- [x] Email sent (waitlist notification) — 9:00 AM — Completed
- [ ] Tweet 4 posted — 2:00 PM — Queued in Buffer
- [ ] Tweet 5 posted — 7:00 PM — Queued in Buffer
- [ ] Engagement monitoring — Ongoing — Active

**Yesterday's Metrics (T+0):**
- Downloads: 1,240 (target: 1000+) ✅
- PH upvotes: 487 (rank: #8)
- PH comments: 42 (engagement: 8.6%)
- Twitter impressions: 18,200
- Sentiment: 88% positive ✅
- Bugs: 0 ✅

**Top Engagement Questions (Need Response):**
1. "How accurate are your dupes?" → Suggest: Template from REDDIT_POSTS.md §Engagement
2. "Why personas over algorithm?" → Suggest: Template from PRODUCTHUNT_POST.md §FAQ
3. "Can I export my wardrobe?" → Suggest: "Not yet! Adding this week. What format do you need?"

**Flagged Comments (Manual Review):**
- [Reddit] "Your methodology is flawed" → Reason: Technical criticism, needs detailed response
- [PH] "Is my data private?" → Reason: Legal question, needs careful wording

**Action Items for Christopher:**
1. Post Tweet 4 at 2pm (templated, queued) — Priority: Medium
2. Respond to "data privacy" comment ASAP — Priority: High
3. Decide: Export feature feasible for Week 2? (3 requests for it)

**Risk Alerts:**
- None. All metrics green. Sentiment strong. Keep the pace!

**Next 24h Summary:**
On track for Top 5 PH finish. Engagement strong. Respond to privacy Q today.
```

---

## Debugging

**Agent doesn't load:**
- Check `~/.claude/plugins/launch-maestro/plugin.json` exists
- Verify file paths in `relatedFiles` section point to actual docs
- Check `docs/launch/LAUNCH_DATE.md` is set

**Agent gives wrong metrics:**
- Verify launch asset files are up-to-date
- Check agent is reading from correct source docs (should be cited in response)
- Confirm T+0 date in LAUNCH_DATE.md is correct

**Agent suggests wrong template:**
- Check if template exists in cited document
- Verify you haven't edited templates inline (agents pull exact text)
- If needed, manually provide the correct template

---

## Next Steps

1. **Set your launch date** in `docs/launch/LAUNCH_DATE.md`
2. **Read the coordinator agent** (`~/.claude/plugins/launch-maestro/agents/coordinator.md`)
3. **Read the responder agent** (`~/.claude/plugins/launch-maestro/agents/engagement-responder.md`)
4. **Test with a preview briefing:** `@launch-coordinator morning briefing for T-7`
5. **Follow the T-7 workflow above** starting now

You're ready to launch. Let the maestro orchestrate. 🚀

---

## One More Thing

The agents are **autonomous**. They can be invoked proactively if you want Claude Code to say:

> "It's 9 AM UTC on launch day. Time for your morning briefing."

You can set this up via Claude Code hooks if you want truly hands-free daily briefings. But for now, just invoke them when you need them.

Good luck. You've got a complete launch playbook + agent automation. Execute.
