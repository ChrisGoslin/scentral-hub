# nota. — Release Notes

## Version 0.1.0 — June 21, 2026

**nota.** is a fragrance discovery and collection management app for iOS, Android, and web. Built for scent enthusiasts to explore, collect, and curate their personal fragrance wardrobe.

### ✨ Core Features

#### 🏠 **Discovery**
- Browse 282+ curated fragrances across families, projection levels, seasons, and use cases
- Advanced filtering: family, longevity, season, ambient environment, top notes
- Search by fragrance name or brand
- View detailed fragrance profiles: notes, inspiration, wear logs, ratings
- Save to wishlist for later

#### 👃 **Collection**
- **Living Wardrobe** — apothecary shelf UI with 3-column drag-and-drop grid
- Four-tier organization: Top Signatures (16–20), Occasion Modifiers (8–15), Base Anchors (1–7), Holding Zone
- Log wear events with temporal curve (when you wore it, how long, how strong)
- Track affinity scores (1–20) to personalize your shelf
- Scent memory notes — capture impressions and occasions

#### 🧬 **Personalization**
- 6-persona fragrance profile system (velvet intellectual, solar minimalist, dark alchemist, ritual keeper, rebel experimentalist, comfort seeker)
- Persona reveal ceremony during onboarding
- Persona-based recommendations and discovery hints

#### 🧪 **Layering Lab**
- Combine two fragrances to explore new scent combinations
- Harmony scoring: evaluate compatibility (top notes, heart notes, projection)
- Save favorite layering recipes
- Browse community recipes

#### 📱 **Community & Insights**
- **You** — personal dashboard with collection summary, wear statistics, fragrance insights
- **Social** — curated TikTok and YouTube fragrance content feed (no login required)
- **Rituals** — create and share personal fragrance routines as public URLs

#### 🔊 **XP & Streaks**
- Earn XP for interactions: wear log (+10 XP), scent memory (+5 XP), wishlist add (+5 XP), onboarding (+20 XP)
- 6-level progression: The Curious → The Enthusiast → The Collector → The Connoisseur → The Curator → The Auteur
- Daily wear streak tracking with longest-streak history

#### ⏰ **Spritz Schedule** *(NEW)*
- Daily AI-curated fragrance recommendation (Aura character)
- Swipe-right to wear, log wear events directly from schedule
- XP rewards for following recommendations

#### 🎡 **Fragrance Wheel** *(NEW)*
- 9-axis polar chart visualization of your collection
- Gap analysis: identify families/projections you're missing
- Export as shareable PNG
- Personalized recommendations based on gaps

### 🎨 **Design & Experience**

- **nota. Aura Design Language** — dark mode with amber-gold accents, walnut cabinet aesthetic
- **Ceremonial animations** — smooth transitions for persona reveals, shelf reorganization, profile discoveries
- **Responsive design** — seamless experience on mobile (iOS/Android) and desktop (PWA)
- **No login required** — anonymous identity via localStorage UUID
- **Privacy-first analytics** — PostHog integration with no session recording, respects Do Not Track header

### 🔒 **Privacy & Trust**

- ✅ No account creation required — zero friction onboarding
- ✅ Anonymous identity via UUID (no email collection)
- ✅ No session recording, no autocapture tracking
- ✅ Respects "Do Not Track" browser header
- ✅ Search queries tracked by length only (no PII)
- ✅ Comprehensive privacy policy and legal compliance
- ✅ All data stored securely on Supabase

### 📊 **Technology Stack**

- **Frontend**: Next.js 16.2.9 (React 19, App Router)
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Deployment**: Vercel (edge-optimized, 60-region global)
- **Analytics**: PostHog (privacy-compliant event tracking)
- **UI Components**: Tailwind CSS, custom design system
- **Drag-and-Drop**: dnd-kit with sortable collections
- **Push Notifications**: Web Push API + Supabase (iOS/Android PWA)

### 🚀 **Getting Started**

1. **Visit**: [scentral-hub.vercel.app](https://scentral-hub.vercel.app)
2. **Onboard**: 3-step ceremony (sanctuary reveal → projection preference → context → persona match)
3. **Discover**: Browse 282+ fragrances, add to collection
4. **Collect**: Drag your bottles onto the Living Wardrobe shelf
5. **Enjoy**: Log wears, earn XP, layer scents, check your daily Spritz

### 📋 **Platform Support**

- ✅ **iOS** — PWA, home screen installable (Safari 18+)
- ✅ **Android** — PWA, home screen installable (Chrome 120+)
- ✅ **Web** — Full desktop experience at scentral-hub.vercel.app

### 🎯 **Roadmap (Post-Launch)**

- **Epic 7**: Social Proof & Engagement UI (creator directory, discovery explanations, follower counts)
- **Epic 8**: XP System Display (level badges, progression bars, achievements)
- **Epic 9**: Aura Evolution (smarter daily recommendations based on seasonal trends)
- **Epic 10**: Fragrance Wheel Enhancements (collaborator sharing, comparison mode)
- **Epic 11**: Toast Notifications & In-App Alerts (wear reminders, new fragrance alerts)
- **Epic 12**: Pro Features (advanced analytics, curator tools, export/backup)

---

### 📞 **Support & Feedback**

- Questions? Email: [christophergoslin@outlook.com](mailto:christophergoslin@outlook.com)
- Found a bug? Create an issue on [GitHub](https://github.com/ChrisGoslin/scentral)

---

**nota.** — *Discover the scent that resonates with you.* ✨
