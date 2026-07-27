# nota. App Store Launch — Assets & Requirements

**Platform:** iOS (App Store Connect) + Android (Google Play Console)
**Target Release:** End of Phase 7 (July 2026)
**Region:** US primary (expand EU/Asia in Phase 8)

---

## iOS App Store — Asset Checklist

### 1. App Information

#### Metadata
- **App Name:** nota. (or "nota.: Scent Identity")
- **Subtitle:** "Your Daily Scent Ritual"
- **Category:** Lifestyle
- **Content Rating:** 4+ (no objectionable content)
- **Privacy Policy URL:** https://scentral-hub.vercel.app/disclaimer
- **Support URL:** current nota. support URL or email (set up before launch)
- **Marketing URL:** (optional; use landing page or TikTok link)

#### Description (300 chars max for iTunes, but allow ~300 for App Store)
```
Discover your scent identity. Track the fragrances that move you.
Evolve with intention. nota. is your personal scent journal—
organize your collection, remember how you smell, and understand
the fragrances that define you.
```

#### Keywords (up to 30 total, comma-separated, no spaces between keywords)
```
fragrance,scent,perfume,collection,journal,identity,ritual,
discovery,personal,style,mood,tracker,notes,lifestyle,wellness
```

#### Release Notes (for v1.0)
```
Welcome to nota.

Discover your scent identity:
• Personal Shelf: Organize and rate your fragrance collection
• Blind Ranking: Find your favorites by comparison
• Scent Traces: Journal moments and feelings with each fragrance
• Your Insights: Discover your scent personality (persona)
• Fragrance Wheel: Visual gap analysis of your collection
• Spritz Schedule: Daily AI-suggested scents (via Aura)

No login required. Your collection lives on your device.
```

---

### 2. App Icon Variants

| Size | Filename | Usage |
|------|----------|-------|
| 1024×1024 | `AppIcon_1024.png` | App Store (required) |
| 512×512 | `AppIcon_512.png` | Marketing, web preview |
| 180×180 | `AppIcon_180.png` | iPhone 6s–XS (3x) |
| 120×120 | `AppIcon_120.png` | iPhone 6s–XS (2x) |
| 167×167 | `AppIcon_167.png` | iPad (2x) |
| 152×152 | `AppIcon_152.png` | iPad (1x) |
| 120×120 | `AppIcon_Spotlight_120.png` | Spotlight search (3x) |
| 80×80 | `AppIcon_Spotlight_80.png` | Spotlight search (2x) |

**Design Notes:**
- Icon should be **instantly recognizable** at 180×180 and smaller
- Suggested: Stylized **bottle silhouette** or **shelving abstraction**
- Color: Gold accent on cream/white background (brand-aligned)
- No text inside the icon; nota. wordmark is App Name
- Must be PNG with full opacity (no transparency on rounded corners—iOS handles that)

---

### 3. Screenshots

#### Orientation: Portrait (required for iPhone)
#### Resolutions (generate 2x and 3x versions):
- **iPhone 15 Pro Max:** 1242×2688px (highest priority; used for marketing)
- **iPhone 8 Plus:** 1080×1920px (fallback compatibility)
- **iPad:** 2048×2732px (separate set for iPad-specific entry)

#### Screenshot Sequence (5–8 screens, storytelling order)
1. **Hero / Onboarding**
   - Show nota. wordmark or a clean shelf image
   - Tagline: "Your Daily Scent Ritual"
   - CTA: "Get Started" or "Explore"
   - Annotation: "Discover your scent identity"

2. **Personal Shelf (Collection)**
   - Show 3-tier Apothecary Grid with colorful fragrance cards
   - Highlight drag-and-drop reordering
   - Annotation: "Organize your collection. Rate what you love."

3. **Blind Ranking (Comparison)**
   - Show two fragrance cards side-by-side
   - Annotation: "Rank your favorites blindly. Discover surprises."

4. **Scent Traces (Journal)**
   - Show trace card with date, fragrance, mood/feeling
   - Annotation: "Remember how you smelled. Journal your moments."

5. **Your Insights (Persona)**
   - Show persona card (e.g., "The Ritual Keeper")
   - Annotation: "Discover your scent personality."

6. **Fragrance Wheel (Gap Analysis)**
   - Show 9-axis radar chart
   - Annotation: "Visualize your collection. Find gaps to explore."

7. **Spritz Schedule (Daily Ritual)**
   - Show Aura card with daily suggestion
   - Annotation: "AI-suggested scents for your day."

8. **No Login Required**
   - Show "No account needed" message or empty state
   - Annotation: "Your collection lives on your device."

**Screenshot Tool:** Use preview simulator or Figma with iPhone frame. Export at 2x resolution (1242×2688 for iPhone 15 Pro Max), then scale down to 1x if needed.

#### Annotation Text
- **Font:** System sans-serif (Helvetica Neue, SF Pro Display)
- **Size:** 24–32pt (readable at thumbnail size)
- **Color:** White text with semi-transparent dark overlay (or gold accent text)
- **Placement:** Bottom 1/3 of screen (safe zone for overlays)

---

### 4. App Preview (Video, Optional but Recommended)

- **Format:** MP4 (H.264), 1:1.77 (16:9) or portrait (9:16)
- **Duration:** 15–30 seconds
- **Resolution:** 1242×2688 (iPhone 15 Pro Max native, scaled to fit)
- **Frame Rate:** 30 fps
- **Codec:** H.264, AAC audio

#### Video Sequence
1. **Intro (3s):** Fade in nota. wordmark with tagline
2. **Shelf Interaction (4s):** Show drag-and-drop reordering; highlight smooth motion
3. **Blind Ranking (3s):** Swipe between two fragrance cards
4. **Trace Creation (3s):** Add a trace entry (show form + save animation)
5. **Insights Display (3s):** Show persona card + Wheel chart rotation
6. **Call-to-Action (2s):** "Available now on App Store" + nota. logo

**Audio:** Soft, ambient music (no voiceover). 30–60 seconds of royalty-free lo-fi or meditative track.

**Tools:** Use Xcode simulator screen recording + iMovie/CapCut for editing, or hire a video agency.

---

### 5. Privacy Policy & App Clip (Optional)

#### Privacy Policy
- **URL:** https://scentral-hub.vercel.app/disclaimer
- **Key Points to Cover:**
  - No login required; identity via localStorage UUID
  - User data (collection, traces, XP) stored locally on device OR in Supabase (if syncing added)
  - No third-party trackers (verify analytics setup: should only log anonymized events)
  - Images sourced from Supabase Storage (HTTPS)
  - No sale of user data
  - Right to delete local data (cache clear)

#### App Clip (Optional; not needed for v1.0)
- App Clips allow users to try features without full app install
- Example use case: Deep link to a specific fragrance detail page
- Implement in Phase 8 if growth metrics warrant it

---

## Android Google Play — Asset Checklist

### 1. App Information

#### Metadata
- **App Name:** nota.
- **Short Description (80 chars):** "Your Daily Scent Ritual — Discover Your Fragrance Identity"
- **Full Description (4000 chars):**
```
nota. is your personal fragrance journal. Discover your scent
identity, organize your collection, and understand the fragrances
that define you.

FEATURES:
• Personal Shelf: Rate and organize your fragrance collection
• Blind Ranking: Compare fragrances to find your true favorites
• Scent Traces: Journal moments, moods, and memories with each scent
• Your Insights: Discover your unique scent personality
• Fragrance Wheel: Visual gap analysis of your collection
• Spritz Schedule: Daily AI-suggested scents for your day
• No Login Required: Your collection lives on your device

Whether you're a casual scent explorer or a dedicated fragrance
enthusiast, nota. helps you understand what you love and why.

No account. No tracking. Just you and your scent story.
```

#### Category
- **Primary:** Lifestyle
- **Secondary:** (optional) Health & Fitness or Personalization

#### Contact Email
- Current nota. support email (set up before launch)

#### Privacy Policy
- https://scentral-hub.vercel.app/disclaimer

#### Content Rating
- ESRB: Everyone (or IARC: Unrated, then fill IARC questionnaire during submission)
- No objectionable content

---

### 2. App Icon & Graphics

| Asset | Size | Format | Purpose |
|-------|------|--------|---------|
| App Icon | 512×512 | PNG (no transparency edges) | Play Store listing |
| Feature Graphic | 1024×500 | PNG/JPG | Play Store header banner |
| Screenshots (Phone) | 540×720 (minimum) or 1080×1440 (recommended) | PNG/JPG | Vertical phone previews |
| Screenshots (Tablet) | 1200×1920 | PNG/JPG | Tablet preview (optional) |
| Promo Graphic | 180×120 | PNG/JPG | Category/promotional (optional) |

#### Feature Graphic (1024×500)
- Show the **most compelling feature**: Personal Shelf or Insights persona
- Include nota. wordmark + tagline
- Use brand colors (cream background, gold accents)
- Text should be readable at thumbnail size

#### Phone Screenshots (540×720 or 1080×1440)
- Same story sequence as iOS (Onboarding → Shelf → Blind Ranking → Traces → Insights → Wheel → Spritz → CTA)
- Use the same annotation text and styling
- Generate at 1080×1440 for high-res, then scale to 540×720 if needed

---

### 3. Release Notes

```
v1.0 — Welcome to nota.

Your personal fragrance journey starts here.

🏠 Personal Shelf — Organize and rate your collection
👥 Blind Ranking — Compare scents side-by-side to find favorites
📝 Scent Traces — Journal moments and feelings with each fragrance
💡 Your Insights — Discover your unique scent personality
🎡 Fragrance Wheel — Visualize your collection and spot gaps
🌅 Spritz Schedule — AI-suggested scents for each day
🔓 No Login — Your collection lives on your device

Made for fragrance enthusiasts, curators, and curious explorers.

No account. No tracking. Just your scent story.
```

---

### 4. In-App Purchases & Ads (If Applicable)

**For nota. v1.0 (MVP):**
- **Monetization:** None (free app, no ads, no IAP)
- **Status:** Toggle "This app is free and contains no ads"
- **Future (Phase 8):** Consider Pro tier (gated features) if growth justifies

---

## Screenshot Generation Workflow

### Option A: Manual (Using Simulator)
1. **Open Xcode**
2. **Select Product → Scheme → Select Simulator (iPhone 15 Pro Max)**
3. **Run app** (`Cmd+R`)
4. **Navigate to each screen** (onboarding → shelf → insights → etc.)
5. **Screenshot:** Cmd+S (saves to Desktop)
6. **Annotate:** Use Figma, Sketch, or Preview.app to overlay text
7. **Export:** PNG at 1x (1242×2688) for App Store

### Option B: Automated Script (Next.js Playwright)
Create `scripts/generate-app-store-screenshots.mjs` to:
1. Navigate to each route
2. Capture viewport screenshots
3. Overlay annotations programmatically
4. Export at correct resolutions

**Note:** This requires Playwright + Chrome browser; see AGENTS.md §8 for network constraints.

### Option C: Design Tool (Figma/Sketch)
1. Export app screens as high-res images
2. Create frames (1242×2688 for iPhone, 1080×1440 for Android)
3. Place screenshots inside frames
4. Add annotation text layers
5. Export per-platform

---

## Localization (Phase 8)

For multi-market launch:
- **Supported Languages:** EN (v1.0), FR, DE, ES (Phase 8)
- **Each language requires:**
  - Translated app name, subtitle, description
  - Translated screenshots (or overlay text in target language)
  - Translated release notes
  - Translated in-app strings (already in app/layout.tsx and components)

**Tool:** Use Lokalise or Crowdin for screenshot localization workflows.

---

## Pre-Launch Checklist (1 week before submission)

- [ ] App Icon created and exported (512×512 PNG)
- [ ] 5–8 screenshots generated (1242×2688 for iPhone, 1080×1440 for Android)
- [ ] Screenshots annotated with clear, readable text
- [ ] App preview video recorded and edited (optional)
- [ ] Privacy policy live and accessible
- [ ] Support email address set up (current nota. support email)
- [ ] All in-app text reviewed for typos, tone, brand voice
- [ ] Feature flags verified (ProGate enabled, free features only for v1.0)
- [ ] Analytics verified (no PII in events, GDPR compliant)
- [ ] All routes tested on iOS Safari and Android Chrome
- [ ] Performance: Lighthouse Core Web Vitals > 90 on home, /discover, /collection
- [ ] Release notes written and approved
- [ ] App Store description + keywords finalized

---

## Post-Launch Monitoring

### Week 1–2
- **DAU/MAU:** Target 50+ installs day 1, 200+ by end of week 1
- **Crash Reporting:** Monitor Crashlytics for new errors (iOS) and Firebase Crashlytics (Android)
- **Retention:** Day 1, 7, 30 (target: >15% D1, >5% D7, >2% D30 for MVP)
- **User Feedback:** Monitor App Store reviews; respond to 1-star reviews within 48 hours

### Week 3–4
- **Update 1.0.1:** Fix any critical bugs (crashes, UI layout issues)
- **Update release notes:** "Bug fixes and performance improvements"
- **Social Proof:** Seed reviews from beta users if launch reviews are slow

### Month 2 (Phase 8)
- **Expand to 2–3 new markets** (EU, Asia) with localized screenshots
- **Add new features:** Social sharing, gifting, seasonal recommendations
- **Monitor A/B tests:** If implemented, track variant adoption

---

## Platform-Specific Guidelines

### iOS App Store Specifics
- **Review time:** 24–48 hours typical
- **Rejection reasons (common):** Missing privacy policy, crashes in sandbox, hardcoded secrets, misleading screenshots
- **Metadata updates:** Can be updated without re-review (except app name and category)
- **Versioning:** Use semver (1.0.0, 1.0.1, 1.1.0); iOS auto-increments build number

### Google Play Specifics
- **Review time:** 2–4 hours typical (faster than iOS)
- **Rejection reasons:** Malware, PII collection without consent, crashes, broken links
- **Store listings:** Can be updated anytime without re-review
- **Versioning:** Use semver; versionCode auto-increments

---

## Asset Delivery & File Organization

```
/assets/app-store/
├─ iOS/
│  ├─ app-icon-1024.png
│  ├─ screenshots-1242x2688/
│  │  ├─ 01-hero.png
│  │  ├─ 02-shelf.png
│  │  ├─ 03-blind-ranking.png
│  │  ├─ 04-traces.png
│  │  ├─ 05-insights.png
│  │  ├─ 06-wheel.png
│  │  ├─ 07-spritz.png
│  │  └─ 08-cta.png
│  ├─ preview-video-1242x2688.mp4 (optional)
│  └─ metadata.json (App Store Connect upload helper)
├─ Android/
│  ├─ app-icon-512.png
│  ├─ feature-graphic-1024x500.png
│  ├─ screenshots-1080x1440/
│  │  ├─ 01-hero.png
│  │  ├─ 02-shelf.png
│  │  ├─ 03-blind-ranking.png
│  │  ├─ 04-traces.png
│  │  ├─ 05-insights.png
│  │  ├─ 06-wheel.png
│  │  ├─ 07-spritz.png
│  │  └─ 08-cta.png
│  └─ metadata.json (Google Play upload helper)
└─ shared/
   ├─ privacy-policy.md (source for https://scentral-hub.vercel.app/disclaimer)
   ├─ description-short.txt (80 chars, used by both platforms)
   ├─ description-long.txt (4000 chars, used by both platforms)
   ├─ keywords.txt (comma-separated)
   ├─ release-notes-v1.0.txt
   └─ support-faq.md
```

---

## Success Metrics

**Launch Goal:** 100+ Day-1 installs, 500+ by end of week 1

**Retention Targets (via Analytics):**
- **D1 Retention:** >15% (users return within 24 hours)
- **D7 Retention:** >5% (users return within 7 days)
- **D30 Retention:** >2% (users return within 30 days)

**Key Features to Monitor:**
- Most used: Personal Shelf (should be >80% of DAU)
- Second: Blind Ranking or Traces (>40% of DAU)
- Lower: Wheel, Spritz (>15% of DAU in v1.0; higher in Phase 8 with refinement)

**Review Score Target:** 4.2+ stars (balance enthusiasm with managing expectations)

---

*App Store launch assets prepared for Phase 7. Update screenshots and metadata after each major feature release (Phase 8, 9, 10).*
