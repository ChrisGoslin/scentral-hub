# Landing Page Review Checklist

Use this checklist when reviewing the landing page changes and preparing the PR.

## Visual quality

- [ ] Hero layout feels premium and spacious
- [ ] CTA buttons are distinct, polished, and responsive
- [ ] Decorative art is positioned with balance and does not overwhelm the content
- [ ] Color palette feels warm, modern, and fragrant

## Interaction quality

- [ ] Hover states are present on buttons and cards
- [ ] Demo save shows a toast message on success / failure
- [ ] Animations are subtle, smooth, and do not distract
- [ ] Reduced motion is respected

## Accessibility

- [ ] Buttons have visible focus styles
- [ ] Text remains legible and high contrast on dark background
- [ ] Semantic structure uses meaningful headings and sections
- [ ] Toast notifications are announced by screen readers

## PR readiness

- [ ] `docs/ux/scentral-landing-spec.md` is included and clear
- [ ] `PR_DESCRIPTION.md` describes the change set and how to test it
- [ ] `scripts/create-pr.sh` is available for branch creation and push
- [ ] No markdown lint errors remain in docs
