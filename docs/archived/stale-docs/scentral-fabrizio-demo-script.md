# Scentral — Fabrizio Demo Script
_Monday 19 May 2026_

---

## Before you start

- Open Scentral on your phone (or share screen from laptop)
- Make sure you're on the live Vercel URL — not localhost
- Have His Confession and Liam Grey in mind as your hero combo
- Keep it under 10 minutes — show, don't tell

---

## The one-line pitch

> "I built a personal fragrance intelligence tool. It tells you what you own, how the chemistry works, and exactly how to combine them — with AI-generated application steps."

---

## Demo flow (in order)

### 1. Collection screen (~2 min)

Open `/collection`.

Say: *"This is my full collection — 76 fragrances, organised by phase. Phase 1 are your Anchors, they go on first and last all day. Phase 2 are Modulators, they shape what's above and below. Phase 3 are Tops, they project outward and evolve fastest."*

Show the filter bar. Filter by lean → Masculine. Show the count updating live.

Say: *"Every card tells me projection strength, temperature, application zone, and anosmia risk — that's the risk of going nose-blind to a fragrance. No other app does this."*

Tap the Phase 1 section. Point to His Confession.

Say: *"His Confession is my anchor — 10/10, Beast Mode projection, Chest + Neck zone. I need to know what it layers with."*

---

### 2. Layering Lab (~3 min)

Tap the Lab tab in the bottom nav. You're now on `/layering`.

Say: *"The Layering Lab. I search for any fragrance in my collection, and Scentral shows me everything it's compatible with — based on olfactory phase, not just vibes."*

Type "His Confession" in the search. Tap it.

Say: *"Phase 1 Anchor selected. Now Scentral shows me all my Phase 2 and Phase 3 fragrances it can pair with — because you can't layer two Anchors, the chemistry clashes."*

Point to the Expert Protocols section on the right.

Say: *"These 4 protocols were designed by a fragrance chemist — real spray ratios, application sequences, sillage predictions. These are the ones I actually use."*

Select **Liam Grey** from the compatible pairings list.

---

### 3. Formulate (~3 min)

With His Confession + Liam Grey selected, set the context:
- Time of day: Evening
- Weather: Cool  
- Occasion: Date

Hit **✦ Formulate This Combo**.

Wait 2–3 seconds while the AI runs.

Say: *"This is the Formulate engine — it's using Claude AI to generate a bespoke layering protocol for these two specific fragrances, in this specific context."*

When the result appears, read the combo name aloud. Then walk through the steps.

Say: *"Application steps in exact order, spray counts, zones, wait times. Sillage prediction. And an expert note explaining the chemistry of why these two work together."*

Point to the combo name.

Say: *"The name is also AI-generated — designed to be shareable. Something you'd post on TikTok or Instagram."*

---

## If he asks "what's next?"

Three things in order:
1. **Auth** — save your favourite combos, build your wear log
2. **Spritz Schedule** — plan your day (Morning Anchor → Midday Layer → Evening Reset)
3. **Sharing** — shareable combo cards, then eventually a community layer

---

## If he asks "is this just for you?"

*"Right now yes — it's my personal collection. But the data model supports multiple users, and the layering logic works for any collection. The next version opens it up with accounts."*

---

## If something breaks

- If Formulate errors: "The AI call just needs a moment" — try once more, or fall back to showing the Expert Protocols manually.
- If the page is slow: "It's fetching live from my database in real-time" — it'll load.
- If you're on localhost by accident: Close, reopen the Vercel URL.

---

## One thing to remember

The goal isn't to impress with features. It's to show that **you shipped a real thing** — live database, real AI, real UI — in a weekend. That's the story.

