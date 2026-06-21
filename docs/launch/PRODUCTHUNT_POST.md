# Scentral Launch — Product Hunt Post (Enhanced)

**Launch date:** T+0, 12:01 AM PST (midnight East Coast time—prime for European/UK audience)  
**Goal:** Top 5 finish on Product Hunt (requires 500–800 upvotes + sustained engagement)  
**Strategy:** Live comment monitoring, genuine responses, showcase data + social proof

---

## Product Hunt Post Copy

### Tagline (One-liner, shown under title)
```
Your fragrance wardrobe in 15 seconds—curated for your personality, no account needed.
```

### Description (Main post body)

**Headline:**
Scentral: Your Fragrance DNA in 15 Seconds

**Lead paragraph:**
I kept blind-buying the same fragrance under five different names. £150 Creed Royal Oud. £35 Niche House. £18 Lattafa. Same scent. Different price.

So I built **Scentral**—a free fragrance wardrobe app that answers one question and curates your entire collection.

---

**[Section 1: The Insight]**

Most fragrance apps are glorified grids. Fragrantica has thousands of fragrances with no personality. Blogs are 10K-word SEO traps. Reddit threads are chaos.

Here's what I noticed: your personality determines what you smell like.

A moody introvert and a bright minimalist don't wear the same fragrances. A sensual experimentalist and a clean, decisive person have zero overlap.

So what if fragrance discovery started with personality—not algorithm?

---

**[Section 2: How It Works]**

1. **Take the Sanctuary Profiler (15 seconds)**  
   One question: where are you when the world gets loud?

2. **Get your persona**  
   Velvet Intellectual (moody, niche-loving), Solar Minimalist (bright, decisive), or Dark Alchemist (experimental, sensual)

3. **See your wardrobe**  
   50+ fragrances curated for your personality, season, and mood

4. **Discover dupes**  
   Every bottle has a price alternative. Your £150 Creed? We found five Lattafas at £18–35 that do 85% of the job.

---

**[Section 3: What's Inside]**

✦ **Apothecary Wardrobe** — 280+ fragrances organized by affinity tier (Top Signatures, Occasion Modifiers, Base Anchors, Holding Zone)

✦ **Dupe Chains** — 200+ researched price alternatives (Creed → Lattafa, Tom Ford → Rasasi, etc.)

✦ **Seasonal View** — Same wardrobe, sorted by optimal season (Spring, Summer, Autumn, Winter)

✦ **Layering Lab** — Mix fragrances. See what happens. (Oud + white musk = ?). Powered by Claude API.

✦ **Fragrance Wheel** — Your olfactory profile visualized as a 9-axis polar graph. Share as PNG.

✦ **Social Proof** — % of Scentral users who own each bottle (builds community context)

✦ **No Account** — localStorage UUID. Privacy by default.

✦ **No Algorithm** — Each persona is hand-curated. No ML black box.

---

**[Section 4: Why This Matters]**

Most people spend £40–150 per fragrance. A £150 bottle per month = £1800/year.

But 80% of fragrance pleasure comes from scent fit—matching personality and moment, not price tag.

Scentral cuts through that. Your personality reveals your wardrobe. Dupes cut your cost. You get the same smell for £100 less.

---

**[Section 5: The Build]**

- **Frontend:** Next.js 16, React 19, dnd-kit (drag-drop wardrobe)
- **Database:** Supabase (PostgreSQL + Auth)
- **API:** Claude Haiku (layering logic), Vercel (hosting)
- **Data:** 280 fragrances hand-researched. 200+ dupe chains verified by blind testing.

No scraping. No copyright infringement. All manual work.

---

**[Section 6: The Ask]**

Try the **Sanctuary Profiler**. It takes 15 seconds. Let me know if it nails your personality.

Then browse your wardrobe. See if the dupes make sense. Break something. Tell me what sucks.

**→ scentral-seven.vercel.app**

Or download: iOS / Android (both live today)

---

**[Section 7: Next (Roadmap teaser)]**

Week 2: Barcode scanner (scan a bottle, see dupes)  
Week 3: Creator partnerships (influencer curated collections)  
Week 4: Dark mode + personalized rituals

---

## Gallery Items (Upload in PH editor)

1. **Cover image** (Hero)
   - Scentral logo + main tagline
   - Background: Subtle fragrance bottle silhouettes, amber/gold color palette
   - Text: "Your fragrance DNA in 15 seconds"

2. **App screenshot 1** (Sanctuary Profiler)
   - Full-screen view of the question: "Where are you when the world gets loud?"
   - Clean, minimal UI
   - CTA: "Next"

3. **App screenshot 2** (Persona reveal)
   - Card showing "VELVET INTELLECTUAL" 
   - Tagline + personality description
   - Wardrobe tiles below (6–8 bottle cards)

4. **App screenshot 3** (Dupe reveal)
   - Split view: £150 Creed vs. £18 Lattafa
   - Olfactory match percentage (85%)
   - Price saving highlight (£132 saved)

5. **Demo video** (15-second)
   - Embedded in main gallery
   - Auto-plays (no sound required)

---

## Response Strategy (Launch Day Monitoring)

**Commit to:** Checking PH every 2 hours on launch day (T+0 12:01 AM → T+0 10:00 PM).

### Common Questions (Template responses)

**Q: "How is this different from Fragrantica?"**
```
A: Fragrantica is a reference—6M+ reviews, amazing database. Scentral is trying something different:
1. Personality-first discovery (not algorithm/filter-based)
2. Instant wardrobe (50+ curated bottles, not 6000 to browse)
3. Built-in dupe chains (price alternatives, not separate research)

Think of it as: Fragrantica = Wikipedia. Scentral = Personal stylist.
```

**Q: "How accurate are your dupes?"**
```
A: I blind-tested each dupe chain personally. "Accurate" doesn't mean identical—it means olfactory family + projection overlap.

Example: Creed Royal Oud (£150) and Lattafa Qisa (£18) are both oud-forward with similar sillage. You'll notice differences (cinnamon notes, etc.), but the DNA is 80–85% aligned.

We're not claiming they're identical. We're saying: if you like Creed, you'll probably like Lattafa.
```

**Q: "Why should I trust your persona categorization?"**
```
A: Fair question. It's not an algorithm—it's a deliberate archetype based on fragrance personality research + my own blind testing.

If the Profiler doesn't nail it, you can switch personas with one tap. See if Solar Minimalist fits you better. Let me know if the wardrobe *doesn't* match your personality—that's how I iterate.
```

**Q: "Is this monetized? How do you sustain this?"**
```
A: Free core features (Discover, My Wardrobe, Layering, Wheel). Free forever.

Long-term monetization (not live yet): affiliate links to retailers (Notino, Fragrantica), possibly a Creator tier for influencer collections. No paywalls planned.

Right now: focused on free + quality. Sustainability is phase 2.
```

**Q: "Can I export my wardrobe?"**
```
A: Not yet. Good idea—adding that this week. Want CSV, JSON, or PDF?
```

**Q: "Fragrance is subjective. How do you scale this?"**
```
A: Completely true. That's why Scentral isn't prescriptive—it's suggestive.

The Profiler reveals a wardrobe of bottles that *statistically* align with your personality. You're in control. Don't like a bottle? Drag it out. Add your own. The app adapts.

Think of it as a starting point, not a final answer.
```

**Q: "Do you have data on dupes being purchased by Scentral users?"**
```
A: Not yet (launched today). But once affiliate links are live, we'll track purchase intent + brand switching. That's the data that'll prove whether dupes actually convert.

For now, I'm betting that the research I did (blind testing, Fragrantica cross-referencing) is solid. Prove me wrong—send feedback.
```

### Red Flag Responses (Don't engage)
- "This is just marketing" → Don't defend. Acknowledge: "Fair take. I'd rather hear what breaks than debate intent."
- "Why isn't this open source?" → "It's not yet. Stabilizing the core first."
- "Your dupes are wrong" → "Possible. Tell me which one? I'll re-verify it."
- Spam / off-topic → Delete and move on.

### Community Building Responses
- Compliments: "Thanks! What's your persona? Let me guess your wardrobe from your Reddit history 😄"
- Fragrance nerd questions: Answer them fully. Show domain expertise.
- Feature requests: "Love this. Adding to the roadmap. Feedback like this is why I shipped this early."

---

## Success Metrics (Launch Day)

✓ **Target:** 500–800 upvotes (Top 5 on PH)  
✓ **Engagement:** 150+ comments (30% comment-to-upvote ratio is good)  
✓ **CTR:** 10%+ of upvoters click through to app (measured via Vercel analytics)  
✓ **Conversion:** 20%+ of visitors add a bottle to wardrobe  
✓ **Sentiment:** 80%+ positive comments (minor edge cases, no ratio'd)

If you hit 500 upvotes by noon, you're on pace for Top 3.

---

## Post-Launch (T+1 through T+7)

- **T+1:** Post update comment with "Day 1 metrics" (downloads, persona distribution, most-added bottle)
- **T+3:** Showcase early user story ("Here's how one user found their scent in 20 seconds")
- **T+7:** Final thank-you comment + invite for Week 2 early access

Keep the thread alive with genuine engagement, not spam.
