# App Store Launch Checklist

Source: `docs/nota/10-customer-competitor-acquisition-teardown.md` §7 "App Store story" — the screenshot sequence, converted into owned tasks. Native leadership stays aspirational until there's a real native build, store-review history, and release operations (per the teardown); this list is the screenshot/story prerequisite work, not a native-app plan.

- [ ] **Identity reveal.** Screenshot of The Read → persona/Noseprint reveal. Depends on the reveal screen looking finished on a real device size, not just desktop dev.
- [ ] **Own/sample/wear memory.** Screenshot of Cabinet or Collection showing owned/sampled/worn state. Needs at least one populated demo account with realistic-looking data (not an empty state).
- [ ] **Humble fit explanation.** Screenshot of a fragrance detail page showing the softened fit language ("Matches your pattern", not "Strong fit" — see Pre-Launch Cut) alongside evidence/why-shown copy.
- [ ] **Layering experiment.** Screenshot of the layering flow (`/layering`) showing a saved combination. Confirm this flow is stable before using it in store assets.
- [ ] **Aligned noses / community.** Screenshot of Traces or a taste-aligned surface. Blocked on Traces reactions actually working end-to-end (see Pre-Launch Cut — code fixed 2026-07-17, needs a live smoke check with a real reaction).
- [ ] **Private/portable history.** Screenshot or copy proving export/deletion — currently deletion is "email us" (see privacy policy §9), not self-serve. Decide whether the store story can honestly say "portable" yet, or whether this claim should wait for a real export feature.

## Before shipping any of these

- Confirm the demo account used for screenshots doesn't leak a real user's private data.
- Each screenshot should reflect the *current* shipped copy/behavior — recheck this list after any UI copy change (fit language, privacy copy, post-Read CTA) lands.
