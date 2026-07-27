# nota. Launch — Complete Asset Checklist + Timeline

**Launch Date:** T+0 (Date TBD — set in LAUNCH_DATE.md)
**Delivery Deadline:** T-7 (all assets locked 7 days before launch)
**Owner:** Christopher

---

## CRITICAL PATH (Do First)

These must be done before anything else ships.

### ☐ Infrastructure (T-14 to T-7)
- [ ] Vercel deployment tested (prod URL + SSL valid)
- [ ] Supabase connection tested (fragrances table readable, no 500 errors)
- [ ] iOS/Android app submissions approved + live in stores (or web-only launch)
- [ ] `scentral-hub.vercel.app` resolves and loads <3s
- [ ] localStorage initialization verified (new user gets UUID, all keys set)
- [ ] Error monitoring live (Sentry or equivalent)

### ☐ Core Features QA (T-7)
- [ ] Sanctuary Profiler loads + completes in <15s
- [ ] Persona reveal accurate for all 3 personas
- [ ] Wardrobe displays correctly (grid layout, no truncation, all bottles visible)
- [ ] Dupe chains present and linkable
- [ ] Layering Lab functional (mix scents, see output)
- [ ] Fragrance Wheel renders + exports as PNG
- [ ] Mobile responsive (<480px breakpoints verified)
- [ ] iOS safe-area padding correct (no notch overlap)

### ☐ Browser/Device Testing (T-7)
- [ ] Chrome (Windows + Mac)
- [ ] Safari (iOS + macOS)
- [ ] Firefox (Windows + Mac)
- [ ] Samsung Internet (Android)
- [ ] Screenshot at each resolution

---

## COPY ASSETS (Locked T-7)

All marketing copy must be locked 7 days before launch to allow scheduling + review.

### ☐ Social Media Copy
- [x] **TWEET_QUEUE.md** (8 tweets + response templates)
  - T+0 main announcement
  - T+0 follow-up (15s demo)
  - T+0 feature highlight (dupes)
  - T+1 social proof (dupe focus)
  - T+1 personal hook (blind-buying story)
  - T+3 thread (how nota. works)
  - T+5 proof tweet (1K downloads)
  - T+7 community poll (persona reveal)
  - Response templates for engagement

- [x] **REDDIT_POSTS.md** (2 posts + engagement Q&A)
  - r/fragrance post (T+2): "Built an app to solve my fragrance problem"
  - r/IndieApps post (T+3): "nota.—fragrance wardrobe app (built solo, shipped to iOS/Android)"
  - r/fragrance engagement FAQ
  - r/IndieApps engagement FAQ
  - Timing + etiquette rules

### ☐ Email Copy
- [x] **EMAIL_TEMPLATE.md** (3 emails)
  - Waitlist notification (T+1 morning)
  - Social proof follow-up (T+3)
  - Retention re-engagement (T+14)
  - Plain-text + HTML versions

### ☐ Product Hunt Copy
- [x] **PRODUCTHUNT_POST.md**
  - Main post (tagline, 7-section body)
  - Gallery + image specs
  - Response strategy + FAQ templates
  - Success metrics
  - Post-launch engagement plan

### ☐ Video Copy
- [x] **DEMO_VIDEO_SCRIPT.md** (15-second video)
  - Shot-by-shot storyboard (0–15s)
  - VO script
  - Production notes (camera, audio, editing)
  - Usage across platforms (Twitter, Instagram, TikTok, PH)
  - A/B testing strategy (optional)

---

## VISUAL ASSETS (Locked T-7)

### ☐ Video Production
- [ ] **Demo video (15s)** — `demo-15s-final.mp4`
  - Resolution: 1440×1440 (or 1080×1920 for vertical)
  - Format: MP4 H.264, 5–8 Mbps
  - Aspect ratio: 9:16 (portrait)
  - Runtime: exactly 15s
  - Audio: VO + ambient music mixed
  - Color grading: Warm (amber/gold tint)
  - Status: Ready for upload to Twitter, TikTok, Instagram, PH

**Alternative (if filming timeline too tight):**
- [ ] **Backup screen recording** (3–5 min polished screen record)
  - Falls back to CapCut editing + text overlays
  - Lower production value but acceptable
  - Timeline: 2–3 hours to produce

### ☐ Product Hunt Assets
- [ ] **Cover image** (Hero image)
  - Specs: 1200×630px minimum (OG image ratio 1.91:1)
  - File: PNG or JPEG, <200KB
  - Design: nota. logo + "Your fragrance DNA in 15 seconds"
  - Color: Aura palette (amber/gold background)
  - Status: Ready for PH gallery

- [ ] **Screenshot 1** — Sanctuary Profiler
  - Device frame: Optional (clean screenshot also works)
  - Show: The single question, clean UI, minimal
  - Annotation: "15 seconds to your persona"

- [ ] **Screenshot 2** — Persona Reveal
  - Show: "VELVET INTELLECTUAL" card + 6–8 bottles below
  - Annotation: "Your curated wardrobe"

- [ ] **Screenshot 3** — Dupe Reveal
  - Show: £150 vs £18 comparison, match percentage
  - Annotation: "Save £100+ per bottle"

### ☐ Social Media Assets
- [ ] **Twitter header image** (updated to match nota. branding)
  - Specs: 1500×500px
  - Updated bio to link to scentral-hub.vercel.app

- [ ] **App store preview images** (if iOS/Android)
  - iOS App Store: Up to 5 screenshots, 1242×2208px each
  - Google Play: Up to 8 screenshots, 1080×1920px each
  - Status: Screenshots + captions ready for submission

### ☐ Email Assets
- [ ] **Email header/logo** (if using templated email)
  - Specs: PNG, 600px wide, <100KB
  - Logo: nota. + tagline

---

## SCHEDULING & DISTRIBUTION (T-7 to T+7)

### ☐ Social Media Scheduling
- [ ] **Buffer account set up** (or Later, TweetDeck, etc.)
  - Account access: Verified
  - Scheduling approval: Set to "auto-publish" or "review queue"

- [ ] **T+0 tweets queued**
  - Tweets 1–3 ready for live posting (not pre-scheduled—need real-time monitoring)
  - Response templates copied into Notes/document

- [ ] **T+1 through T+7 tweets scheduled**
  - Tweets 4–8 scheduled in Buffer for 9am, 2pm, 7pm UK time
  - Confirmation: All tweets appear in calendar

### ☐ Reddit Posting
- [ ] **Accounts verified**
  - r/fragrance account ready (post as /u/christopher or verified handle)
  - r/IndieApps account ready
  - Post karma/age verified (subreddits may have minimums)

- [ ] **T+2 Reddit post (r/fragrance)** — Timed for 2–3pm UK time
  - Draft saved as Reddit post template
  - Timer set: Post at T+2, monitor comments for 4 hours

- [ ] **T+3 Reddit post (r/IndieApps)** — Timed for 9am UK time (different day/audience)
  - Draft saved as Reddit post template
  - Timer set: Post at T+3

### ☐ Email Delivery
- [ ] **Email list exported** (from waitlist, if available)
  - Count: __ emails
  - Format: CSV with email addresses
  - Status: Uploaded to email service (Mailchimp, SendGrid, Postmark, etc.)

- [ ] **T+1 email queued** (Waitlist notification)
  - Status: Scheduled for 9am recipient timezone (if available) or 9am UTC

- [ ] **T+3 + T+14 follow-ups queued** (social proof, re-engagement)
  - Status: Scheduled for respective times

### ☐ Product Hunt Setup
- [ ] **PH account verified** (christophergoslin or @scentral)
  - Profile complete with bio + links
  - Past product (if any) visible

- [ ] **Product draft created in PH admin**
  - Title, tagline, description, gallery all filled in
  - Scheduled for T+0 12:01 AM PST (exact time)
  - Not yet published (save as draft)

- [ ] **Cover image + gallery items uploaded**
  - 5 items queued (hero, screenshot 1–3, demo video)
  - Status: Ready for publish

- [ ] **Maker profile bio updated**
  - Photo: Professional headshot
  - Bio: 2–3 sentences + Twitter handle
  - Website: scentral-hub.vercel.app

### ☐ Maker Outreach (Optional, T-3)
- [ ] **Early supporters notified** (optional: 24h advance notice)
  - List: Contacts, Twitter followers, beta users
  - Message: "Launching nota. tomorrow on Product Hunt. Would mean a lot if you upvoted + left feedback."
  - Channel: Email, DM, or Twitter

---

## LAUNCH DAY OPERATIONS (T+0)

### ☐ Pre-Launch Checklist (T+0 11:00 PM)
- [ ] All tweets queued in Buffer (ready to publish)
- [ ] PH post published (12:01 AM PST exactly)
- [ ] Vercel deployment live (https://scentral-hub.vercel.app loads <3s)
- [ ] Analytics tracking enabled (Vercel dashboard + Sentry monitoring)
- [ ] Monitoring setup ready:
  - [ ] PH tab open in browser (or PH mobile app)
  - [ ] Twitter tab open (or TweetDeck)
  - [ ] Email app open (for support/questions)
  - [ ] Slack/Discord (if applicable) notifications on

### ☐ T+0 Timeline (Launch Day)
- **12:01 AM PST** — PH post published (publish button clicked)
- **12:05 AM** — Post Tweet 1 (main announcement)
- **12:15 AM** — Post Tweet 2 (15s demo)
- **2:00 AM** — Check PH comments, respond to early engagement
- **9:00 AM UK time** — Post Tweet 3 (feature highlight)
- **2:00 PM UK** — Check PH again, response strategy active
- **7:00 PM UK** — Final check of day, note metrics

### ☐ Monitoring Dashboard (T+0 → T+7)
- [ ] **Vercel Analytics**
  - Check: Requests/min, errors, latency
  - Alert threshold: >10% 5xx errors

- [ ] **Supabase Dashboard**
  - Check: Database CPU, storage usage
  - Alert threshold: Any connection errors

- [ ] **Product Hunt Stats**
  - Screenshot upvote count every 2 hours (Day 1)
  - Screenshot ranking (refresh PH homepage)
  - Comment count + sentiment

- [ ] **Twitter/X Analytics**
  - Impressions per tweet
  - Engagement rate
  - Click-throughs to site

---

## POST-LAUNCH (T+1 → T+30)

### ☐ Week 1 (T+1 → T+7) Milestones
- [ ] **Day 1 metrics email** (T+1 8am)
  - Downloads count: __
  - Persona distribution: % Velvet, % Solar, % Dark
  - Most-added bottle: __
  - Send to PH as comment + email to waitlist

- [ ] **Reddit posts live** (T+2 and T+3)
  - Post r/fragrance (T+2)
  - Monitor comments 4+ hours
  - Post r/IndieApps (T+3)
  - Monitor comments 4+ hours

- [ ] **Email follow-ups queued** (T+3, T+7)
  - Social proof email (T+3): "X downloads, Y personas revealed"
  - Retention email (T+7): "Don't sleep on the dupes"

- [ ] **Metrics check** (Daily T+1 to T+7)
  - DAU, new personas revealed, bottles added
  - Any 500+ errors? Address immediately
  - Community sentiment: Positive/negative ratio

### ☐ Week 2–4 (T+8 → T+30) Content Pipeline
- [ ] **Scheduled tweet thread** (T+10)
  - Topic: "Why I blind-tested 200+ dupe chains"
  - Live monitoring + engagement

- [ ] **User story interview** (T+12)
  - Reach out to first 10 users for quote + story
  - Publish 1–2 stories as tweets + email

- [ ] **Feature deep-dive content** (T+14, T+21, T+28)
  - "How the Layering Lab works"
  - "The Fragrance Wheel explained"
  - "Middle Eastern gems your friends don't know about"

### ☐ Feedback Collection (Ongoing)
- [ ] **PH comments** — Respond to all feedback
- [ ] **Reddit comments** — Respond to all questions
- [ ] **Email replies** — Monitor help@scentral.com
- [ ] **Feature requests** — Log in a public roadmap or Twitter thread

---

## ASSET OWNERSHIP + STATUS

| Asset | Owner | Status | Deadline |
|-------|-------|--------|----------|
| TWEET_QUEUE.md | Christopher | ✅ DONE | T-7 |
| REDDIT_POSTS.md | Christopher | ✅ DONE | T-7 |
| EMAIL_TEMPLATE.md | Christopher | ✅ DONE | T-7 |
| PRODUCTHUNT_POST.md | Christopher | ✅ DONE | T-7 |
| DEMO_VIDEO_SCRIPT.md | Christopher | ✅ DONE | T-7 |
| Demo video (MP4) | Christopher | ⏳ IN PROGRESS | T-5 |
| PH cover image | Christopher | ⏳ PENDING | T-5 |
| PH screenshots (3) | Christopher | ⏳ PENDING | T-5 |
| Buffer/Later queued | Christopher | ⏳ PENDING | T-3 |
| Email list export | Christopher | ⏳ PENDING | T-3 |
| Reddit posts queued | Christopher | ⏳ PENDING | T-2 |
| PH draft created | Christopher | ⏳ PENDING | T-1 |
| Vercel deployment QA | Christopher | ⏳ PENDING | T-1 |

---

## Contingency Plans

**If demo video isn't ready by T-5:**
→ Use screen-recording backup (CapCut, 2–3 hours) or static screenshot carousel + voiceover narration

**If email list is small (<100):**
→ Focus on Product Hunt + Reddit + Twitter. Email follow-up is secondary. Still do it, but don't expect major lift.

**If PH ranking drops below Top 20 by T+3:**
→ Increase response rate on comments (every 30 min instead of hourly). Post social proof ("1K downloads") as update comment. Engage with related PH posts. Don't panic—focus on quality engagement over vote farming.

**If Reddit posts get flagged for self-promotion:**
→ Edit posts to be more helpful/educational (move CTA to last line). Emphasize "feedback wanted" framing. Avoid over-posting in same subreddit.

**If Vercel goes down on launch day:**
→ Post status update on Twitter immediately ("Experiencing technical difficulties, back online in X min"). Email support team. Have mobile hotspot ready to post from phone if needed.

---

## Commit Message
```
docs: launch asset pack—tweets, reddit, email, PH, demo script, checklist
```

Keep these docs under version control. Update daily during launch week.
