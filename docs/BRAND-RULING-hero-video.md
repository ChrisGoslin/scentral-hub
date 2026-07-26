# Brand ruling: homepage hero video

**Subject:** stock video "A Man Making a Fragrance" (Pexels) used as the hero background on `brand/sensory-sanctuary`.
**Status:** RESOLVED 2026-07-24 — replaced, not cropped. See resolution below.
**Raised by:** brand review of the homepage/hero handover, 2026-07-22.

## Resolution (2026-07-24)

Christopher's call: **replace the clip with a faceless one that captures fragrance
and modernity**, rather than attempt a face-crop. Verified why a crop was not
viable: the source is a continuous camera push-in — the perfumer's face is soft
in the opening ~1.3s (top ~15%, croppable) but grows and sharpens to fill the
frame by ~2.5s, so no single static crop removes it across the 7s.

**Replacement shipped:** "Abstract close up of black ink in water" (Mixkit, clip
154). Charcoal ink blooming through a light ground — faceless, no people, no
neon/gloss, and a literal reading of nota.'s core "wet ink sinks into paper"
material metaphor (DESIGN.md §5–6). Re-encoded to the exact existing asset
dimensions/paths (desktop 1280×676 mp4+webm, mobile 720×1280 mp4, two posters),
7-second loop, all files smaller than the originals. `HeroSection.tsx`
attribution comment, `img` alt, and video `aria-label` updated to describe the
ink (were: "a perfumer measuring amber liquid").

**Licensing (recorded per item 3 below):** Mixkit clip 154 is under the **Mixkit
Stock Video Free License**, which permits commercial use with no attribution
required. Confirmed 2026-07-24 on the clip page. Note for future sourcing: many
literal-perfume Mixkit clips (e.g. the sample-strip and perfume-bottle clips)
are **Mixkit Restricted License — personal use only**, commercial requiring an
Envato Elements subscription; those were rejected on licensing grounds.

The original tension and ruling below are retained for history.

---

## The tension

The visual system requires *"human presence without faces"* and rejects
influencer/stock-person imagery as a banned aesthetic. The current brand
direction is explicitly **hyper-personalised** — the emotional promise is
"someone is formulating *me*," not "here is a professional making fragrance in
general." A stock clip of an identifiable stranger's hands and face is the
visual opposite of that promise: it is authentic-*generic*, not authentic-
*personal*. It is well-shot, on-tone atelier footage — and it is still someone
else's story on the page whose entire pitch is "this one is about you."

This is not a gradients/gold/gloss violation — the clip passes every anti-slop
rule on the checklist. It is a subtler failure: correct texture, wrong subject.

## Ruling

**Conditional pass, pending one edit.** Do not ship the clip as-is with the
maker's face visible. Before this goes live:

1. Re-crop or re-cut to hands, glass, oils, blotters, and bench — remove or
   crop out the face. Tight, tactile, materials-first framing is exactly the
   "living atelier" feeling the direction wants, and it removes the
   generic-stranger problem without losing the footage.
2. If a faceless cut isn't achievable from this source, treat it as a
   **placeholder** only, tracked to be replaced with either (a) real footage
   from nota.'s own asset pipeline once it exists, or (b) a commissioned
   faceless macro shoot (hands, vials, pipettes — see the asset brief in
   `NOTA-BRAND-UIUX-PACK.md` §5). Do not let a placeholder quietly become
   permanent because it shipped and looked good enough.
3. Confirm licensing explicitly — Pexels license permits commercial use, but
   record that check here rather than assuming it.

## What does NOT need to change

`Matter → Memory → Identity` sequencing, the restrained pacing, the absence of
gradients/orbs/gloss, and the "no ecommerce shop framing" — all correct, all
stay.

## Decision owner

Christopher. This ruling is a recommendation with a concrete path (crop the
face), not a hard block — but it should not be waved through silently as
"looks fine, ship it."
