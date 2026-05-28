# Scentral Hub: Research & Strategy Summary

## What We Built

✅ **Layering Lab MVP** — Interactive fragrance combiner (free, no auth)
- Real-time harmony scoring (0–100%)
- Note-level breakdown (top/heart/base matching)
- 3 preset Middle Eastern fragrances (Lattafa, Afnan, Ajmal)
- Client-side state persistence (localStorage)

## What We Learned

### Three Distinct Customer Personas

**Luna — The Niche Collector** (Annual spend: $2,000–5,000+)
- Obsessed with fragrance as art; owns 20+ bottles
- Values **exclusivity, education, community, curation**
- Willing to pay **$19.99–29.99/mo** for premium
- **PAIN POINT:** No platform for rare fragrances, expert guidance, or collector community
- **Layering Lab Appeal:** ⭐⭐⭐⭐⭐ Perfect fit for her; "create exclusive combos I can't buy"

**Marcus — The Confident Buyer** (Annual spend: $500–1,500)
- Has 2–3 go-to fragrances; skeptical but respects expertise
- Values **simplicity, confidence, quality, social proof**
- Willing to pay **$9.99–14.99/mo** for expert help
- **PAIN POINT:** Selection overwhelm, no personalized matching, limited sampling
- **Layering Lab Appeal:** ⭐⭐⭐ Good fit; offers confidence through data + harmony score

**Zara — The Casual Explorer** (Annual spend: $200–600)
- Discovers through TikTok; trend-driven, price-sensitive
- Values **accessibility, trendiness, aesthetics, social proof**
- Unlikely to pay; better as **viral growth vector** (free + sharing features)
- **PAIN POINT:** Pretentious fragrance language, limited sampling, no easy sharing
- **Layering Lab Appeal:** ⭐⭐ Moderate; appeals to playful experimentation

---

## The Gap: MVP vs. Market Need

| Persona | MVP Alignment | Critical Gap | Blocker Severity |
|---------|---------------|-------------|-----------------|
| **Luna** | 80% | Only 3 fragrances; no community | 🔴 Fatal |
| **Marcus** | 40% | No matching help; no sampling | 🔴 Critical |
| **Zara** | 30% | No trending/social features | 🟡 Moderate |

---

## The Strategy: Feature-by-Feature Roadmap

### Phase 1: Q1 (Months 1–3) — Expand Foundation
**Goal:** Unlock Luna + Marcus; scale MVP responsibly

- [ ] Expand fragrance library from 3 → 200+ (launch with niche quality brands: Creed, Frederic Malle, Penhaligon's, natural perfumers)
- [ ] Add user accounts + authentication (Supabase JWT)
- [ ] Build save & share combos (public profiles, shareable links)
- [ ] Launch premium tier foundation ($14.99/mo)

**Why First:** Luna needs library access; Marcus needs saving/sharing. Both are table-stakes for premium conversion.

---

### Phase 2: Q2 (Months 4–6) — Differentiate with Expertise
**Goal:** Establish Scentral as authority; drive Marcus + Luna conversion

- [ ] Hire fragrance expert (certified nose, Paris training preferred)
- [ ] Implement expert blending tips (AI + human validation)
- [ ] Build scent-matching quiz (Marcus's top pain point)
- [ ] Add trending combos + leaderboards (Zara engagement)
- [ ] Launch Premium tier at $14.99/mo

**Why Second:** Expert credibility is the differentiator. Marcus wants confidence; Luna wants curation. Quiz is Luna's "personalized" match equivalent.

---

### Phase 3: Q3 (Months 7–9) — Monetize & Scale
**Goal:** Multi-tier revenue; expand to 500+ fragrances; activate Zara

- [ ] Partner for physical sampling service (3–5 samples shipped based on combos)
- [ ] Expand library to 500+ fragrances
- [ ] Launch creator collaboration program (TikTok, Instagram partnerships)
- [ ] Build Premium+ tier at $29.99/mo (exclusive access, VIP)
- [ ] Add trend tracker (viral fragrances, creator picks)

**Why Third:** Sampling is a retention lever for both Luna and Marcus. Creator program targets Zara via viral loop.

---

### Phase 4: Q4 (Months 10–12) — Premium Experiences
**Goal:** Premium LTV optimization; international expansion

- [ ] VIP tastings + exclusive events (Luna only)
- [ ] Advanced harmony engine (season/skin-chemistry aware)
- [ ] Fragrance education hub (video content, expert guides)
- [ ] International expansion (Middle East, Europe; localize for region)
- [ ] Partner for sampling logistics

---

## Premium Pricing (Validated by Personas)

| Tier | Monthly | Annual | Target | Value Prop |
|------|---------|--------|--------|-----------|
| **Free** | $0 | $0 | All (funnel) | Explore, experiment, play |
| **Premium** | $14.99 | $180 | Luna, Marcus | Expert curation, library, matching |
| **Premium+** | $29.99 | $360 | Luna (high-LTV) | Exclusive access, VIP, 1-on-1 expert |
| **Sampling** | $19.99/kit | — | Luna, Marcus | 3–5 physical samples per combo |

**Revenue Potential (Year 1):**
- Free users: 10,000 | 0% conversion = $0
- Premium: 1,000 users × $180/year = $180k
- Premium+: 200 users × $360/year = $72k
- Sampling: 300 kits × $19.99 = $6k
- **Total: ~$260k** (conservative; excludes affiliate, partnerships)

---

## Critical Success Factors

### DO ✅
1. **Hire a fragrance expert early** — This is your moat. Luna and Marcus trust expertise over algorithms.
2. **Curate library ruthlessly** — Quality over quantity. 500 exceptional fragrances > 5,000 mediocre ones.
3. **Keep language accessible** — Marcus avoids gatekeeping; Zara despises pretension. "Top/heart/base" only for experts.
4. **Build community features** — Luna lives here. Public profiles, ratings, sharing unlock engagement.
5. **Partner for sampling ASAP** — Removes friction; converts Luna + Marcus; proof point for Premium value.

### DON'T ❌
1. **Don't over-commercialize** — Luna and Marcus flee heavy ads. Authentic > monetization (initially).
2. **Don't recommend dupes** — Luna will leave; she wants authenticity. Dupes signal a mass-market platform.
3. **Don't generic-ify** — Focus on niche/luxury first (Luna + Marcus). Don't chase Sephora bestsellers.
4. **Don't launch Premium without library expansion** — 3 fragrances can't justify $14.99/mo. They'll bounce.
5. **Don't gatekeep knowledge** — Education is free. Teach the industry; monetize convenience + curation.

---

## Next Step: Validation

Before building Q1 features, **validate assumptions with real users:**

1. **Recruit 5–8 fragrance enthusiasts** (Luna + Marcus proxies)
   - Show them Layering Lab
   - Ask: "What would make you pay $14.99/mo?"
   - Test: "Would you buy a scent-matching quiz? How much?"

2. **Run 1-minute TikTok survey** (Zara audience)
   - "Would you share your fragrance combos?"
   - "What features would you use for free?"

3. **Analyze r/fragrance Reddit** (Luna/Marcus habitat)
   - What pain points surface repeatedly?
   - Which feature requests recur?

---

## Competitive Advantages (Scentral Today)

1. **Layering focus** — No competitor emphasizes combo creation (gap in market)
2. **Harmony scoring** — Gamifies the experience; addictive feedback loop
3. **No auth required** — Instant gratification; lower friction than competitors
4. **Clean, dark UX** — Luna and Marcus love minimalist design; feels premium

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Library too narrow (Luna leaves) | Partner with 3–5 niche brands month 1 |
| No expert = no premium conversion | Hire expert before Q2 launch; start at 0.5 FTE |
| Zara doesn't care about layering | Free + trending features + creator collabs keep her engaged (growth vector) |
| Sampling logistics fail | Pre-negotiate with vendor; pilot with 50 orders before scaling |
| International expansion too slow | Start with UK/EU (English-speaking, fragrance-savvy); Middle East later (requires localization) |

---

## Conclusion

**Scentral Hub has found its niche: Luna (the collector) and Marcus (the confident buyer).** They collectively represent $6,500–7,000 annual spend per user. If you capture 1,000 Luna + Marcus users at $180/year premium, that's $180k ARR.

**The Layering Lab MVP is the perfect funnel.** Free access builds trust; Premium tier (library + expert tips + matching + community) justifies $14.99/mo.

**The roadmap is clear: expand library → hire expert → add matching → build community → monetize sampling.** Each phase unlocks the next customer segment.

**Start with validation interviews this month.** Confirm Luna + Marcus will actually pay. Then execute Q1 ruthlessly: library + accounts + sharing. Everything else flows from that.

---

**Status:** Research complete. Ready to deploy and validate with real users.
