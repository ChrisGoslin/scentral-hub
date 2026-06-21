# Scentral Launch — Reddit Post Templates

**Posting strategy:**
- Post to r/fragrance on **T+2** (let Product Hunt die down first, don't spam)
- Post to r/IndieApps on **T+3** (builder community, different day/time)
- Monitor comments: respond to every top-level comment within 4 hours
- Tone: helpful, not salesy. Answer fragrance Q's too.

---

## r/fragrance (500K members) — Post 1

**Title:** "Built an app to solve my fragrance problem—thought you'd find this useful"

**Body:**

I kept blind-buying duplicates. Same scent, five names, £50 difference each time.

So I built **Scentral**—a free app that maps your fragrance DNA and builds your wardrobe in 15 seconds. No account, no algorithm.

**The hook:**
You answer one question: where are you when the world gets loud? That becomes your persona (Velvet Intellectual, Solar Minimalist, Dark Alchemist). Your persona reveals 50+ bottles curated for you.

**The game-changer:**
Every fragrance has its price dupe. Your £150 Creed Royal Oud? We found five Lattafas that do 80–85% of the job for £18–35. I'm not exaggerating—the olfactory DNA is almost identical.

**What's in the app:**
- Your curated wardrobe (based on your persona + season)
- Every bottle's dupe chain (price alternatives)
- Social proof (% of Scentral users who own it)
- The Layering Lab (mix scents, see what happens)
- Fragrance Wheel (your olfactory profile visualized)

**Built for:** people who love fragrance but hate guessing. Collectors who want dupes. Newcomers who don't know where to start.

**Live now:** scentral-seven.vercel.app

**Open to feedback.** If you try it, tell me what broke or what I should add.

(Also: 280+ bottles in the database. 200+ dupe chains. All manually researched—no algorithmic BS.)

---

### Engagement Notes for r/fragrance
If someone asks:
- "Is this a clone recommender?" → "It maps dupes, but that's not the main angle. It's really about your fragrance DNA. Tell me your personality—I can probably guess your wardrobe."
- "How do you find dupes?" → "Olfactory family + blind testing + community feedback. We're not saying they're identical—85% is honest."
- "Why should I use this over Fragrantica?" → "Fragrantica is a reference. We're trying something different: persona-first curation + instant wardrobe. Give it 15 seconds and see."
- "This is just marketing" → "Fair. I built this for me first. Tried to solve a real problem. Happy to discuss what I got wrong."

**Don't engage:** price discourse, "NFT this," "monetization speculation." Stay focused on the fragrance angle.

---

## r/IndieApps (100K members) — Post 2

**Title:** "Scentral—fragrance wardrobe app with a persona reveal engine (built solo, shipped to iOS/Android)"

**Body:**

Hi IndieHackers,

I shipped **Scentral** yesterday—a free fragrance app for iOS and Android. Wanted to share the build and hear what breaks.

**The problem:**
Fragrance discovery is broken. Apps are grids. Blogs are 10K words. Everyone's algorithm is garbage. And dupes? Unmarked. Unpriced. Scattered across Reddit threads.

**The insight:**
Your personality shapes what you smell like. A moody introvert and a bright minimalist don't wear the same fragrances. So I built a 15-second profiler that asks one question, reveals your scent DNA, and curates a wardrobe.

**The tech:**
- Next.js 16 (App Router) + React 19
- Supabase for fragrance DB + user data
- dnd-kit for drag-and-drop wardrobe
- Claude API for layering logic
- Deployed on Vercel

**The data:**
- 280 fragrances (hand-curated, no scraping)
- 200+ dupe chains (manually researched)
- 3 personas with 50+ bottles each
- All prices and notes verified

**The monetization:**
Free forever for core features (Discover, My Wardrobe, Layering, You). Pro features (Intelligence, DNA Match) are gated but not promoted—focus is on free experience first.

**What I learned:**
- Mobile fragrance data is sparse (I built my own DB instead of relying on APIs)
- Dupe research takes forever (200+ chains = 60 hours of blind testing + cross-referencing)
- Personalization matters more than features (one good persona > 10 bad filters)

**The ask:**
Try it. Break it. Tell me what sucks.

→ scentral-seven.vercel.app

Feedback welcome. Happy to answer Q's about the build, the DB, the personas, or the biz model.

---

### Engagement Notes for r/IndieApps
If someone asks:
- "How do you sustain this?" → "Not yet. Thinking affiliate links (Fragrantica, Notino, etc.) once usage is there. Also considering a paid tier for curated collections."
- "How'd you get 280 fragrances?" → "Manual research + partnerships. Building the DB took 6 weeks. Most fragrance APIs are paywalled or outdated."
- "Why personas over algorithms?" → "Algorithms are personalized guessing. Personas are deliberate archetypes. You know who you are—fragrance should follow."
- "Timeline to MVP?" → "6 months part-time. Most time was data. Code was 8 weeks."
- "Open source?" → "Not yet. Once I stabilize the core, maybe. Right now it's too tightly tied to the Supabase schema."

**Lean into the builder angle:** link to the full tech stack, talk about the DB schema, mention specific bottlenecks you solved.

---

## Cross-Post Etiquette
- **Do NOT post both to r/fragrance and r/IndieApps on the same day.** Reddit's spam filter flags duplicate links within 24 hours.
- **Do NOT repost the same title.** Customize each. r/fragrance is "I solved this problem," r/IndieApps is "Here's how I built it."
- **Do NOT link to the same URL in both.** (You can, but different framing for each audience.)

---

## Metrics to Watch
- **r/fragrance:** upvotes to engagement ratio (you want 50%+ of upvotes to be comments)
- **r/IndieApps:** "maker friendly" comments (positive responses from other builders)
- **Both:** if you get >20 downvotes on either, check comments for the objection (sizing is wrong? dupe logic flawed? tone was off?)

---

## Don't Post If...
- HN or Product Hunt are still on front page (competition for attention)
- There's a major fragrance news item that day (celebrity release, scandal, etc.)
- Your metrics on launch day show <500 downloads (wait for T+5 instead)

Post when:
- PH is cooling down (T+2, T+3)
- You have a data point to share ("1K downloads," "60% persona discovery rate")
- You're mentally ready to respond for 4+ hours
