# BaseNote Launch Readiness Checklist — Phase 7

**Target Launch Date:** [END OF PHASE 7]  
**Current Date:** July 3, 2026  
**Status:** PRE-LAUNCH PREPARATION  

---

## Part A: Product Completeness (Must-Have Features)

### Core Routes
- [ ] `/` (Landing page) — Hero image, copy locked, CTA to app stores
- [ ] `/discover` — Search + filter working; 127,195 fragrances searchable
- [ ] `/collection` — Personal Shelf (3-tier grid, drag-and-drop) functional
- [ ] `/collection/[id]` — Fragrance detail view; Traces integration ready
- [ ] `/you` — Profile + XP level display + persona card (if persona exists)
- [ ] `/layering` — Lab (optional for MVP; can delay to Phase 8 if risky)

### Phase 7 NEW Features
- [ ] `/spritz` — Aura swipe card + "Wear it"/"Skip" actions; XP logging functional
- [ ] `/wheel` — Fragrance Wheel (9-axis radar SVG); gap analysis logic working
- [ ] `app/(main)/collection/[id]/FragranceTraces.tsx` — Trace creation + list view
- [ ] `app/(main)/trails/` — (If scope includes) Trail progress tracking
- [ ] `app/api/spritz/log-wear` — API endpoint for wear events (XP + streak updates)
- [ ] `app/api/traces/*` — CRUD endpoints for trace entries

### Data & Infrastructure
- [ ] Supabase project configured (scentral-mvp, ID: lrkdwobnemczvhpixpky)
- [ ] All tables live: `fragrances` (127,195 rows), `collections`, `wear_logs`, `user_xp`, `user_streaks`, `spritz_schedules`, etc.
- [ ] GIN trigram indexes on `fragrances` table (name, brand, plain_description, inspired_by)
- [ ] `fragrance-images` bucket in Supabase Storage configured + remote patterns in `next.config.ts`
- [ ] Edge Functions deployed (if Aura copy generation is live): `supabase/functions/`
- [ ] ANTHROPIC_API_KEY in Supabase Vault (NOT in .env.local, NOT hardcoded)

### Authentication & Identity
- [ ] `scentral_anon_id` (UUID) generation on first load (localStorage)
- [ ] All Supabase queries keyed on `anon_id` (PK for user tables)
- [ ] No third-party auth provider needed for MVP (no login screen)
- [ ] Session persistence working (user data preserved on app restart)

### Feature Flags & Paywalls
- [ ] `ProGate` component active; confirms free features only exposed for v1.0
- [ ] `/intelligence` route blocked (Pro-only; not shown in navigation)
- [ ] `/dna-match` route blocked (Pro-only; not shown in navigation)
- [ ] No hardcoded "upgrade to Pro" CTAs in free features
- [ ] `isPro = false` confirmed in PaygateContext or feature check logic

### Testing & QA
- [ ] `npm run test:smoke:prod` passes (smoke tests on live Vercel)
- [ ] All pages load <3s on 4G (Lighthouse throttle, mobile)
- [ ] Core Web Vitals: homepage mobile LCP <=3.0s on slow 4G, CLS <0.1, INP <200ms
- [ ] iOS Safari compatibility tested (iPhone 12–15)
- [ ] Android Chrome compatibility tested (Snapdragon 685+, Android 13+)
- [ ] No hardcoded secrets in source code (grep for API keys, skip .env.local)
- [ ] Console errors: 0 (except expected warnings from deps like Recharts)
- [ ] Crashes: 0 reproducible crashes in testing
- [ ] Offline mode: App degrades gracefully (Supabase query failures handled)

---

## Part B: Technical Launch Checks

### Build & Deployment
- [ ] `npm run build` passes locally (no TypeScript errors)
- [ ] `npm run build` passes in CI/CD pipeline (GitHub Actions or Vercel)
- [ ] `.husky/pre-push` hook installed locally (prevents pushing broken code to main)
- [ ] Pre-push hook blocks: `tsc --noEmit` failures + module-scope `createClient()` calls
- [ ] Latest commit to main is deployment-ready (no feature branches hanging)
- [ ] Vercel deployment alias confirmed: `scentral-hub.vercel.app` (live, not stale)

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel (public, client-side)
- [ ] `SUPABASE_SERVICE_KEY` set in Vercel secrets (server-side only)
- [ ] `ANTHROPIC_API_KEY` in Supabase Vault (not in Vercel env vars)
- [ ] `.env.local` NOT committed to git (verify `.gitignore` entry)
- [ ] `npm ci` installs without warnings (no peer dependency conflicts)

### Next.js Configuration
- [ ] `next.config.ts` remotePatterns include all image CDNs:
  - [ ] `supabase.co` (for Supabase Storage images)
  - [ ] `upload.wikimedia.org` (if Wikidata backfill is live)
  - [ ] Any other external image sources used
- [ ] Image optimization working (no errors on `next/image` components)
- [ ] Font loading optimized (Cormorant Serif + Unbounded preloaded, no layout shift)
- [ ] CSS-in-JS / Tailwind: No runtime compilation (all CSS bundled)

### Error Handling & Logging
- [ ] Sentry integration (if used) configured and receiving errors
- [ ] API errors logged with context (not swallowed silently)
- [ ] User-facing error messages are helpful (not "Error: undefined")
- [ ] Fatal errors trigger error boundary (not white screen)
- [ ] 404 pages return proper HTTP 404 status (SEO compliance)

---

## Part C: App Store & Play Store Compliance

### iOS App Store
- [ ] Apple Developer account active + provisioning profiles set up
- [ ] App ID registered (`com.basenote.app` or similar)
- [ ] Certificates valid (not expired)
- [ ] Privacy manifest updated (`PrivacyInfo.xcprivacy` if using certain SDKs)
- [ ] Privacy policy live and accessible (https://scentral-hub.vercel.app/disclaimer)
- [ ] Data collection practices documented:
  - [ ] "No personal data collected" (or specify what is, per GDPR/CCPA)
  - [ ] "No tracking" (or specify analytics)
  - [ ] "Stored locally on device" (explain Supabase syncing if added later)
- [ ] Screenshots prepared (1242×2688, 5–8 images, annotated)
- [ ] App icon prepared (1024×1024 PNG, no transparency edges)
- [ ] Build number incremented (must be higher than any previous build)
- [ ] Version string set (e.g., "1.0.0")
- [ ] Release notes written and approved
- [ ] Support email set up (support@basenote.co or similar)
- [ ] No hardcoded test data or debug UI visible in build

### Android Google Play
- [ ] Google Play Developer account active + project set up
- [ ] Google Play app signing configured (let Google handle signing keys)
- [ ] App bundle (ABB) or APK built and tested
- [ ] Privacy policy live and accessible
- [ ] Screenshots prepared (1080×1440 or 540×720, 5–8 images)
- [ ] Feature graphic prepared (1024×500)
- [ ] App icon prepared (512×512)
- [ ] Version code incremented (must be higher than any previous version)
- [ ] Version name set (e.g., "1.0.0")
- [ ] Release notes written
- [ ] Support email set up
- [ ] Content rating questionnaire completed (IARC or ESRB)
- [ ] No hardcoded debug UI visible

### Cross-Platform
- [ ] Metadata consistent across platforms (app name, description, keywords)
- [ ] Feature parity verified (same core features on iOS & Android)
- [ ] Performance tested on both platforms (not just emulator)
- [ ] Minimum OS versions verified:
  - [ ] iOS 14+ (or your target minimum)
  - [ ] Android 10+ (or your target minimum)

---

## Part D: Security & Data Privacy

### Secrets Management
- [ ] No API keys in source code (grep: `NEXT_PUBLIC_*` only for public keys)
- [ ] No hardcoded database URLs in code
- [ ] ANTHROPIC_API_KEY stored in Supabase Vault (verified: not in Vercel env vars or code)
- [ ] Supabase Row-Level Security (RLS) policies tested
  - [ ] `collections` table: users see only their own rows (keyed on `anon_id`)
  - [ ] `wear_logs` table: users see only their own rows
  - [ ] `user_xp`, `user_streaks`: users see only their own rows
  - [ ] `fragrances` table: all users can read (public); no writes for users (admin only)
- [ ] No default/weak passwords in seed data

### API Security
- [ ] All API routes validate input (no SQL injection, XSS vectors)
- [ ] Rate limiting on public API routes (if exposed):
  - [ ] `/api/search`: Rate limit to prevent scraping
  - [ ] `/api/fragrances`: Public read-only; rate limit if scraping risk
- [ ] CORS configured correctly (allow `scentral-hub.vercel.app` + localhost dev)
- [ ] No sensitive data in API responses (no internal IDs, no raw Supabase errors)

### Data Handling
- [ ] User data stored locally (localStorage) + optionally in Supabase
- [ ] Supabase connection uses HTTPS (verify in `next.config.ts`)
- [ ] Images served over HTTPS (no http:// image URLs)
- [ ] No PII logged in analytics (avoid logging user emails, full names)
- [ ] Third-party analytics (if used) GDPR-compliant (no tracking cookies without consent)
- [ ] Cache headers set appropriately (static assets: long TTL; dynamic: no cache)

### Compliance
- [ ] Privacy policy covers: data collection, storage, sharing, retention, user rights
- [ ] Disclaimer/legal page created (https://scentral-hub.vercel.app/disclaimer)
- [ ] No warranty claims (clearly state app is "as-is")
- [ ] Terms of service (optional for MVP, but recommended)
- [ ] GDPR disclaimer: "If you're in EU, your data is protected under..."
- [ ] CCPA disclaimer: "If you're in California, you have rights to..."

---

## Part E: Metadata & SEO

### Meta Tags (app/layout.tsx)
- [ ] `<title>` set (e.g., "BaseNote — Your Daily Scent Ritual")
- [ ] `<meta name="description">` set (160 chars, compelling)
- [ ] `og:title` set (same as title)
- [ ] `og:description` set (compelling, not duplicate of meta description)
- [ ] `og:image` set (OG image, 1200×630)
- [ ] `og:type` set ("website" for home, "article" for blog posts if any)
- [ ] `twitter:card` set ("summary_large_image" for social preview)
- [ ] Canonical URL set (https://scentral-hub.vercel.app for home)
- [ ] `lang="en"` set on `<html>` tag
- [ ] Viewport meta tag correct (device-width, initial-scale=1)
- [ ] Favicon set and accessible (/favicon.ico or /icons/favicon.ico)

### OG Image Generation
- [ ] `app/api/og/template/route.tsx` deployed and tested
- [ ] OG image generator accepts query params: `type`, `brand`, `name`, `family`, `persona`, `feeling`, `date`, `theme`
- [ ] Home OG image renders correctly (1200×630)
- [ ] Fragrance detail OG image tested (gradient, brand + name)
- [ ] Insight OG image tested (persona name)
- [ ] All OG images load without CORS errors

### Robots & Sitemap
- [ ] `robots.txt` configured (allow crawlers, point to sitemap)
- [ ] `sitemap.xml` generated and submitted to Google Search Console
- [ ] All routes indexable (no `noindex` accidentally set on public routes)

---

## Part F: Analytics & Monitoring

### Setup & Instrumentation
- [ ] Analytics provider configured (Google Analytics, Plausible, or similar)
- [ ] Verify tracking code is present (check in DevTools Network tab on page load)
- [ ] Page view events firing (GA should show traffic)
- [ ] Custom events implemented for key moments:
  - [ ] Fragrance added to collection
  - [ ] Blind ranking started / completed
  - [ ] Trace entry created
  - [ ] Level up event
  - [ ] Feature clicked (Shelf, Traces, Wheel, Spritz, etc.)
- [ ] Event data sanitized (no PII, no user IDs unless hashed)
- [ ] Goals/conversions defined:
  - [ ] "User onboarded" (app opened, collection viewed)
  - [ ] "Blind ranking started"
  - [ ] "Trace created"

### Error Tracking
- [ ] Sentry or similar error tracking configured (if budget permits)
- [ ] Error reporting captures: stack trace, user session, browser/OS, URL
- [ ] Threshold alerts set (e.g., "Alert if error rate >5% in 1 hour")
- [ ] No error spam (filter out noisy third-party library errors if needed)

### Performance Monitoring
- [ ] Real User Monitoring (RUM) enabled (measure actual user experience)
- [ ] Core Web Vitals tracked: LCP, CLS, FID/INP
- [ ] API response times monitored (especially Supabase queries)
- [ ] Baseline performance recorded (before launch, for comparison)

---

## Part G: Pre-Launch Communication

### Waitlist & Email
- [ ] Waitlist signup form live (capture 500+ emails before launch)
- [ ] Confirmation email template set (welcome + "watch for launch day")
- [ ] Launch day email template ready (download links + feature highlights)
- [ ] Post-launch retention emails drafted (Day 1, Day 7, Day 30)
- [ ] Email list imported into email service (HubSpot, ConvertKit, Mailchimp, etc.)

### Social Media & Press
- [ ] Twitter account created or updated (@basenote or @basenoteapp)
- [ ] Instagram account created or updated (bio + link to waitlist)
- [ ] TikTok account created (if targeting Gen Z fragrance audience)
- [ ] Press release drafted and ready to send
- [ ] Media list compiled (tech blogs, lifestyle journalists, fragrance subreddits)
- [ ] Founder statement / quote written (for press release)
- [ ] Launch day social media posts scheduled (post across platforms 6 AM PT)

### Web & Marketing
- [ ] Landing page copywriting locked and approved
- [ ] App store screenshots uploaded to design tool (Figma or similar) for review
- [ ] App description copy reviewed for tone, brand voice, accuracy
- [ ] Support email configured (support@basenote.co), auto-responder set
- [ ] Discount/promo code (if any) generated for early users

---

## Part H: Day-Before Checklist (24 Hours Before Launch)

### Final QA
- [ ] Full app walkthrough on both iOS and Android (all 6 core features tested)
- [ ] Sign out, clear local storage, sign back in (fresh start works)
- [ ] Sync fragrance data: add to collection on device A, verify on device B (if sync is live)
- [ ] XP/streak system: wear event logs correctly, XP updates, level up on threshold
- [ ] Traces: create trace, save, list view shows trace
- [ ] No console errors (open DevTools, refresh home, check console)
- [ ] No network errors (check Network tab for failed requests)
- [ ] Load times: homepage <3s, /discover <3s, /collection <2s (on 4G)

### Vercel Deployment
- [ ] Latest main branch build is live on `scentral-hub.vercel.app`
- [ ] Verify: `npx vercel --prod` shows READY state
- [ ] Alias confirmed: `scentral-hub.vercel.app` (not stale from earlier build)
- [ ] Deployment preview: test new PR builds (if any pending PRs, don't merge yet)

### App Store Submissions
- [ ] All metadata uploaded (app name, description, keywords, support email)
- [ ] All screenshots uploaded (5–8 per platform, annotated)
- [ ] App icon uploaded (verify no distortion, colors correct)
- [ ] Build/version number confirmed (iOS build: X, Android version code: Y)
- [ ] Privacy policy linked and live
- [ ] Release notes written and final
- [ ] Content rating questionnaire completed (IARC, ESRB)
- [ ] No staging/sandbox builds accidentally submitted (only production)
- [ ] Submission ready for upload (don't submit yet; wait for launch day go signal)

### Communication
- [ ] Launch day email drafted and scheduled (send 6 AM PT, +1 follow-up at 5 PM PT)
- [ ] Social media posts scheduled (Twitter, Instagram, TikTok for 6 AM PT launch)
- [ ] Slack/Discord notifications ready (notify team & community channels)
- [ ] Founder availability confirmed (Christopher available day-of for urgent issues)

---

## Part I: Launch Day (Go / No-Go)

### Go-Live Decision
**Questions to answer:**
1. Are all Phases 1–6 features working? (If broken, delay 24–48 hours)
2. Are Phase 7 features (Spritz, Wheel, Traces) working? (If broken, ship Phase 1–6 only, delay Phase 7)
3. Is main Vercel build live and stable? (If deployment issues, don't submit)
4. Are there any critical security issues? (If yes, fix before launch)

**Decision Matrix:**
- **GO**: All must-have features working, no critical bugs, Vercel stable
- **NO-GO (delay 24h)**: Any critical feature broken, crash on startup, major performance regression
- **SOFT LAUNCH** (web only, app store delayed 48h): Features work, but want 48h of web user testing before app store submission

### Launch Morning (4 AM PT)
- [ ] Verify Vercel deployment one final time
- [ ] Check monitoring/analytics setup (Sentry, GA should be logging data)
- [ ] Send launch day email (6 AM PT)
- [ ] Post social media announcements (6 AM PT across platforms)
- [ ] Reply to incoming questions/replies within 1 hour

### Launch Day (6 AM–6 PM PT)
- [ ] Monitor app store review status (iOS typically 2–4 hrs, Android typically 1–2 hrs)
- [ ] Monitor error tracking dashboard (should see 0 critical errors)
- [ ] Monitor analytics: watch for DAU, feature adoption, crashes
- [ ] Respond to all emails/DMs/comments within 2 hours
- [ ] If critical bug found: decide fast (hotfix + re-deploy, or revert + communicate delay)
- [ ] Track download count + review score (starts appearing 24 hours post-availability)

### Day 1 Post-Launch
- [ ] Verify app is live in both stores (clickable, downloadable)
- [ ] Download app from store; test full user flow (not just simulator)
- [ ] Check crash reports (Firebase Crashlytics, Sentry)
- [ ] Flag any Day-1 crashes for immediate hotfix
- [ ] Compile Day-1 metrics report: installs, sessions, retention, errors

---

## Part J: Post-Launch Monitoring (Week 1)

### Metrics to Track
- **Downloads:** Target 100+ by end of Day 1, 500+ by end of Week 1
- **DAU (Daily Active Users):** Target 50+ by Day 7
- **D1 Retention:** Target >15% (users return within 24 hours)
- **D7 Retention:** Target >5% (users return within 7 days)
- **Session Length:** Target 5+ min average
- **Crash Rate:** Target <0.1% (less than 1 in 1000 sessions)
- **Feature Adoption:** >70% try Shelf, >40% try Blind Ranking, >20% log Traces

### Issues to Address
- **High crash rate (>1%):** Emergency hotfix, re-deploy
- **Store review rejection:** Review rejection reason, fix, resubmit (48–72 hrs)
- **Negative reviews:** Respond to 1–2 star reviews within 24 hours; acknowledge & commit to fix if valid bug
- **Missing feature:** If feature was supposed to ship but didn't, post-mortem & commit to Phase 8 timeline

### Positive Actions
- **Strong D1 retention:** Announce on social, thank community
- **User testimonials:** Request permission to repost, feature on social
- **Press mentions:** Share and amplify with media outlets

---

## Part K: Success Handoff to Operations

### Documentation
- [ ] Incident response runbook created (who to contact if app goes down, how to deploy hotfix)
- [ ] Support FAQ document created (common questions + answers)
- [ ] Feature roadmap shared with users (what's coming in Phase 8, 9, 10)
- [ ] Analytics dashboard shared with team (everyone can see DAU, retention, errors)

### Ongoing Monitoring
- [ ] Weekly review of metrics (every Monday morning)
- [ ] Monthly retrospective (end of month: what went well, what to improve)
- [ ] Quarterly check-in with users (survey or community call)

### Next Phase
- [ ] Phase 8 scope finalized (based on Week-1 feedback)
- [ ] Phase 8 sprint planned (4-week sprint, 12 Epics as per Execution Brief)
- [ ] Team capacity allocated for live support + bug fixes while building Phase 8

---

## Sign-Off

| Role | Name | Sign-Off Date | Status |
|------|------|---------------|--------|
| **Founder/CEO** | Christopher Goslin | [DATE] | GO / NO-GO |
| **Lead Engineer** | [Name] | [DATE] | GO / NO-GO |
| **Product** | [Name] | [DATE] | GO / NO-GO |

---

*Launch Readiness Checklist prepared July 2026, Phase 7. Updated by [NAME] on [DATE].*
