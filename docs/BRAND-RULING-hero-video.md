# Brand ruling: homepage hero video

**Subject:** stock video "A Man Making a Fragrance" (Pexels) used as the hero background on `brand/sensory-sanctuary`.
**Status:** RESOLVED 2026-07-23 — Christopher accepted the clip as-is. See "Resolution" below.
**Raised by:** brand review of the homepage/hero handover, 2026-07-22.

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

## Resolution (2026-07-23)

**Attempted the crop path first.** Extracted frames every 0.5s across the full
7-second clip on both `atelier-matter.mp4` (1280×676) and
`atelier-matter-mobile.mp4` (720×1280, same source, different aspect crop).
Finding: only the opening ~1.5s is a wide shot where the face is soft/
background and croppable; from roughly 2s to the 7s end (over 70% of the
clip) the shot cuts to a sustained close-up portrait — face sharp, centered,
fully identifiable — in both the desktop and mobile encodes. There is no crop
that removes the face here without cropping out nearly the whole frame. A
faceless cut of the full clip is **not achievable from this source**, exactly
the scenario point 2 above anticipated.

**On licensing (point 3):** no license/attribution record for this specific
asset existed anywhere in the repo, and the original Pexels source URL
couldn't be identified to check its specific terms. Pexels' general video
license permits commercial use without attribution, but its own terms note
videos featuring identifiable people "may require a model release for
commercial campaigns — Pexels does not guarantee releases are in place."
This clip does feature an identifiable person, so that risk was real and
unverified at the time of this ruling.

**Decision:** ship the clip as-is. Christopher has a Pexels API key and may
use it to pin down the exact source/license before public launch, and may
replace the footage entirely before then. Until replaced, this is a known,
accepted risk — not a silently-waved-through one. Re-open this file (don't
start a new one) if the clip is swapped, so the resolution stays a single
record rather than a second source of truth.
