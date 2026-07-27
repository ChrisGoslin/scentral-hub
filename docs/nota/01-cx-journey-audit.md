# nota. — Customer Experience & Journey Audit (Deliverable A)

> Phase 1 of the pre-launch audit, 2026-07-04. Evidence: code walkthrough of every core client (`ReadClient`, `ShelfClient`, `BlindRankingClient`, `TracesClient`, landing, nav) + live dev-server walkthrough (a11y snapshots at 375×812 mobile). Confidence labels: **[V]** verified in code/live, **[A]** assumption.

---

## 1. The headline finding

**The nota. product exists, but the app doesn't lead you to it.** [V]

The main nav is `DISCOVER / WARDROBE / LAB / BRIEF / IDENTITY` under a "nota." wordmark. The Read, Noseprint, My Shelf, Traces, and Trails — the entire "understands me → reflects me → evolves me → connects me" loop — are reachable only by URL or from inside other flows. A new user landing today gets a catalogue app with a price-comparison pitch, and would never discover the identity system that is the whole point.

Everything else in this audit is secondary to fixing that.

## 2. Day-in-the-life narratives

### Story 1 — Saturday store tester (Gavin, newcomer)
Gavin tries three scents at Douglas, comes home, opens the app to record what he felt about Ombré Leather.

- He lands on `/` and reads *"Your £140 bottle has an inspired-by at £18."* That's not why he's here. [V]
- Nothing in the nav says "record what you tested." WARDROBE (`/collection`) is about *owning*; there is no **Tested** state anywhere in the data model (`collections.status` is only `'owned' | 'wishlist'`). [V]
- His actual job-to-be-done — "I smelled something, hold this memory for me" — has no front door. The `scent_memory` column exists but is buried inside collection detail.
- **Missing beat:** the moment nota. says *"Ombré Leather. Third time you've looked at it."* — the recognition dot doing its job.

### Story 2 — The blind-buyer (Christopher, enthusiast)
Christopher blind-bought Lattafa Asad off a TikTok. It arrives; he wants it on his shelf, marked as the gamble it was.

- `/shelf` works and feels honest — "Room to be wrong." in empty slots is exactly the right voice. [V]
- But there is no way to mark it blind-bought (`shelf_items` has no `blind_buy`), so the story of the gamble — the thing he'd share — is untold. [V]
- The shelf is 10 slots, one flat grid. Slot #1 looks identical to slot #10. His S-tier crown jewel gets the same 100px card as a C-tier maybe. [V]
- Share exists on blind-ranking reveal but **not on the Shelf itself** — the brief's "share to Traces now, socials later" is unbuilt. [V]

### Story 3 — Returning collector, three weeks in
She's done The Read, has a Noseprint, wears from her shelf daily.

- The Read → Noseprint arc is the strongest thing in the app: 1200ms hold on the opening line, staggered reveal, reaction capture, honest regeneration. This is a real wow moment. [V]
- But afterwards the Noseprint goes quiet. Evolution detection exists (`evolution_events`, edge function) — the "This evolves me" beat has plumbing but she'll only re-encounter her identity if she seeks it out. [A: no surface proactively resurfaces the Noseprint]
- Temptations exist and are personalised — good. Insights are cached nightly — good architecture, unaudited emotional payoff.

## 3. Screen-by-screen scoring

Scale 1–5: **R** = recognition-before-interaction, **C** = cognitive load (5 = one decision per screen), **E** = emotional payoff.

| Surface | R | C | E | Notes |
|---|---|---|---|---|
| `/` landing | 2 | 3 | 2 | Great first 3 headlines; then pivots to price-war messaging that contradicts doctrine. Two products fighting on one page. [V] |
| `/read` The Read | 5 | 5 | **5** | The model for everything else. Pacing, restraint, reaction capture. Keep. [V] |
| `/noseprint` | 4 | 4 | 4 | Strong artefact + OG share. Needs a "return path" (evolution tease). [A] |
| `/shelf` | 3 | 4 | 2 | Functional, honest copy, optimistic UI — but flat hierarchy, no tiers, no BB, no share, no eligibility gate (search adds *anything* from 127k). [V] |
| `/shelf/blind` | 4 | 5 | 4 | "Once placed, it's locked. No undo." — great stakes. Staggered reveal + share. [V] |
| `/discover` | 2 | 2 | 2 | Feel-chips are on-doctrine; below them it's a conventional catalogue. Client-heavy first paint (empty a11y tree on load). [V] |
| `/collection` Wardrobe | 3 | 3 | 3 | Rich (dnd, tiers, maceration) but now competes with Shelf for the same mental slot. [V] |
| `/traces` | 3 | 5 | 3 | Clean, minimal. Needs Shelf-share artefacts to give it gravity. [V] |
| `/trails` | 3 | 4 | 3 | 3 published trails; player exists. Content problem, not code problem. [V] |
| Nav | 1 | 3 | 1 | Core loop absent; labels describe the old product. [V] |

## 4. Wow-moment scorecard (per founder brief)

| Moment | Surprise | Recognition | Ownership | Reflection | Continuity | Verdict |
|---|---|---|---|---|---|---|
| The Read | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Delivers.** Continuity breaks after save — nothing pulls you back. |
| Shelf completion | ❌ | ⚠️ | ✅ | ❌ | ❌ | No moment fires when slot 10 (or 20) fills. Dead air where the payoff should be. [V] |
| Blind Ranking reveal | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | Good. Choices don't visibly feed Insights yet. [A] |
| First Trace match | ❌ | — | — | — | — | Not built (no match/notify mechanic in `traces`). [V] |
| First Insight | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ | Cached payloads exist; presentation unaudited. |
| Noseprint evolution | ⚠️ | ✅ | ✅ | ✅ | ✅ | Plumbing complete (edge fn + events + choice). Needs its ceremony surface. [V] |
| Full Circle | ❌ | — | — | — | — | Not built. |

## 5. Benchmark gap analysis

**vs Stripe (clarity):** Stripe never makes you guess what a screen is for. nota.'s Read passes this test; the landing page fails it (identity pitch → price pitch → box pitch in one scroll). One page, one promise.

**vs Apple (restraint):** ~130 hardcoded hex values in `app/**.tsx` [V] means surfaces drift from the system — ReadClient alone hardcodes its entire palette. Apple-level polish is a *token discipline* problem here, not a taste problem — the taste is already good.

**vs Uber (status clarity):** Uber always shows where you are in a flow. Blind ranking does this well ("locked, no undo"). The Shelf doesn't distinguish "seeded by us" (only a small Noseprint badge) from "chosen by you" — provenance is data (`source` column) that the UI whispers.

**vs Spotify Wrapped (personalised delight):** The Read *is* a Wrapped moment. What's missing is Wrapped's shareability everywhere: Shelf has no share artefact, Insights have no "give this to me as an image" moment. OG infrastructure exists (`/api/og/*`) — the gap is wiring, not capability.

**vs Fragrantica/Parfumo/Notino (the low bar):**
- **Where nota. already wins [V]:** The Read/Noseprint (no competitor has an identity system); blind ranking (nobody has bias-removal); Traces' plain-language prompt ("what it actually smells like" vs note-pyramid jargon); feel-first discovery chips; design restraint (dark ambient + gold vs Fragrantica's 2005 forum chrome).
- **Where it still feels like them [V]:** the landing's clone-price pitch is Notino energy; `/discover` below the chips is a conventional filter-grid; `/social`'s embedded TikToks are influencer-platform texture that doctrine explicitly rejects.

## 6. Structured findings

```json
[
  {"id":"UX-001","area":"Navigation","severity":"critical","finding":"Core nota loop (Read/Noseprint/Shelf/Traces/Trails) absent from main nav; nav still describes the nota. catalogue product","recommendation":"Rebuild nav around the loop: Today / Discover / My Shelf / Traces / You (Read+Noseprint live under You or as first-run flow)","effort":"medium","priority":"pre-launch"},
  {"id":"UX-002","area":"Landing","severity":"critical","finding":"Landing pitches price-comparison ('£140 bottle → £18') and 'Stop blind buying' marquee — marketplace/salesy tone contradicts doctrine on the first screen","recommendation":"Lead with identity ('You already have a scent identity' is already perfect); move Inspired-By engine to /clones and Discovery Boxes below the fold or into /boxes","effort":"medium","priority":"pre-launch"},
  {"id":"UX-003","area":"My Shelf","severity":"high","finding":"Flat 10-slot grid; no S/A/B/C tier hierarchy; slot 1 visually identical to slot 10","recommendation":"20 slots in 4 named tier rows with S-tier visually elevated (larger cards, gold rim, more air); C-tier labelled as 'at risk'","effort":"large","priority":"pre-launch"},
  {"id":"UX-004","area":"My Shelf","severity":"high","finding":"No blind-buy indicator anywhere (schema or UI)","recommendation":"BB stamp on card corner once shelf_items.blind_buy lands (DB-002)","effort":"small","priority":"pre-launch"},
  {"id":"UX-005","area":"My Shelf","severity":"high","finding":"Shelf search adds any of 127k fragrances — no Tested/Own/Past-Purchase eligibility gate (UI or data)","recommendation":"Search sheet defaults to 'your fragrances' (collections with eligible status); DB constraint enforces it (DB-001/DB-003)","effort":"medium","priority":"pre-launch"},
  {"id":"UX-006","area":"My Shelf","severity":"high","finding":"No share artefact for the Shelf (brief requires Traces-share now, social later); no completion moment when the shelf fills","recommendation":"'Share my Shelf' → OG-card route (infra exists at /api/og) posting to Traces; ceremonial moment on completion","effort":"medium","priority":"pre-launch"},
  {"id":"UX-007","area":"Tested state","severity":"high","finding":"The store-tester journey has no home: no 'Tested' status exists, so the most common real-world act (smelling something in a shop) can't be recorded","recommendation":"Add 'tested' + 'past_purchase' statuses (DB-001) and a 30-second 'I tried something' capture flow from nav/home","effort":"medium","priority":"pre-launch"},
  {"id":"UX-008","area":"Naming","severity":"high","finding":"Two shelf-shaped surfaces (Wardrobe /collection and Shelf /shelf) compete for one mental model","recommendation":"My Shelf = ranked identity (top 20); Collection = everything owned/tested (inventory). Rename nav accordingly; one links to the other","effort":"medium","priority":"pre-launch"},
  {"id":"UX-009","area":"The Read","severity":"medium","finding":"'Close, but not quite' reaction saves identical to 'That feels like me' — user signal is captured but not honoured","recommendation":"On 'close', offer one adjustable axis ('More night. Less polish.') before saving — one decision, big ownership gain","effort":"medium","priority":"post-launch"},
  {"id":"UX-010","area":"Continuity","severity":"medium","finding":"Noseprint goes silent after creation; evolution plumbing exists with no ceremony surface","recommendation":"When detect fires, a single quiet card: 'Your nose has moved. Want to look?' → evolution reveal reusing The Read's pacing","effort":"medium","priority":"post-launch"},
  {"id":"UX-011","area":"Discover","severity":"medium","finding":"Below the feel-chips, discover is a conventional catalogue grid; client-heavy first paint (empty on first snapshot)","recommendation":"Feel-first sections ('For your Noseprint', 'Stretch territory') above the browse-all grid; move first page of results to server render","effort":"large","priority":"post-launch"},
  {"id":"UX-012","area":"Wishlist","severity":"medium","finding":"Wishlist is split across localStorage and collections.status='wishlist'; no viewing/swap affordance exists (brief scope)","recommendation":"Consolidate to DB (DB-004); shop-shelf visual treatment; swap flow needs its own tables (DB-005) — post-launch build, pre-launch schema","effort":"large","priority":"post-launch"},
  {"id":"UX-013","area":"Tone","severity":"medium","finding":"Marquee copy ('The $18 answer…', 'Stop blind buying', 'clone that outperforms') is loud/salesy against doctrine","recommendation":"Rewrite marquee in observational voice or remove; price honesty belongs in /clones with calm framing","effort":"small","priority":"pre-launch"},
  {"id":"UX-014","area":"Social","severity":"low","finding":"/social embedded TikTok/YouTube reels are influencer-platform texture doctrine rejects","recommendation":"Deprecate or fold the best content into Trails steps","effort":"small","priority":"post-launch"}
]
```
