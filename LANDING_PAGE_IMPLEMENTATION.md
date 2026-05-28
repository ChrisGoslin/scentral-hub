# Scentral Landing Page: Implementation Guide

## Overview

5 visual sections have been designed following the **Ambient Elegance** philosophy:
1. **Hero** — Email capture + primary CTA
2. **Value Props** — 3 core benefits (Identity, Confidence, Community)
3. **Feature Showcase** — How Accord Creator works
4. **Social Proof** — Testimonials + stats
5. **FAQ & Footer** — Questions answered + final CTA

---

## Design Assets

All 5 sections are provided as **1200×630px+ reference PNGs** in:
- `scentral-landing-01-hero.png`
- `scentral-landing-02-value-props.png`
- `scentral-landing-03-feature.png`
- `scentral-landing-04-social-proof.png`
- `scentral-landing-05-faq-footer.png`

**Use these as visual references**, not direct screenshot imports. The actual landing page will be:
- **Built in React/Next.js** (same stack as Accord Creator)
- **Responsive** (adapts to mobile, tablet, desktop)
- **Dynamic** (email signup connected to backend; fragrances pulled from API)

---

## Color System (Implementation)

Create CSS variables in your Scentral design system:

```css
:root {
  --color-cream: #f5f1ed;
  --color-amber: #b45309;
  --color-charcoal: #1a1a1a;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: rgba(26, 26, 26, 0.6);
  --color-text-muted: rgba(26, 26, 26, 0.4);
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f1ed;
  --color-accent: #b45309;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #f5f1ed;
    --color-text-secondary: rgba(245, 241, 237, 0.6);
    --color-bg-primary: #1a1a1a;
    --color-bg-secondary: #2d2d2d;
  }
}
```

---

## Typography (Implementation)

Use **Satoshi** for headlines (via Google Fonts or local):

```css
@import url('https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;700&display=swap');

h1, h2, h3 {
  font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-primary);
}
```

**Typography hierarchy:**
- **H1** (Hero): 48–56px, bold
- **H2** (Section headers): 28–32px, bold
- **H3** (Card titles): 18–20px, semibold
- **Body**: 14–16px, regular
- **Small text** (hints, labels): 12–13px, regular

---

## Component Breakdown

### Section 1: Hero
```
[Top accent bar - 4px amber]
[Large headline - centered]
[Subheading - italic, muted]
[Email input field - minimal outline]
[CTA button - amber background, white text]
[Footer hint - "Free. No account needed."]
```

**Key elements:**
- Email input is **uncontrolled** until form submission
- CTA button disabled until email is valid
- No form submission yet; just capture email in state for now

### Section 2: Value Props
```
[Section label]
[3 value prop cards - cream background, amber accent dot]
  - Identity + description
  - Confidence + description
  - Community + description
[Dividing line - subtle amber]
[Supporting text - italic]
```

**Key elements:**
- Cards are **not clickable** yet (future: link to /features)
- Accent dots position top-left of each card
- Text is **centered** within cards

### Section 3: Feature Showcase
```
[Section label]
[3-step flow: Select → Score → Share]
  [Step boxes with descriptions]
  [Arrows between steps]
[Accordion Creator demo mockup]
  [Top/Heart/Base note layers - amber bars]
  [Vibe Match score - 82% in amber]
[Supporting text explaining note harmony]
```

**Key elements:**
- Mockup shows **placeholder fragrance names** (not real data)
- Harmony score is **visual only** (no interaction)
- Steps are **informational**, not interactive

### Section 4: Social Proof
```
[Section headline]
[3 testimonial cards - cream background]
  [Name - bold]
  [Quote - italic]
  [Role - muted]
[Stats row]
  50+ Fragrances
  1000s Accords
  Growing Community
```

**Key elements:**
- Testimonials are **static** for now (future: fetch from database)
- Stats are **hardcoded** (update manually as growth metrics change)

### Section 5: FAQ & Footer
```
[Dark background (charcoal)]
[Headline - white text]
[3 FAQ items]
  [Question - amber text]
  [Answer - white text, muted]
  [Divider line]
[CTA button - amber, white text]
[Footer links + copyright - muted white]
```

**Key elements:**
- FAQ is **non-expandable** (all 3 visible)
- CTA button links to `/app` (Accord Creator)

---

## Data & Integrations (Phase 1 vs. Phase 2)

### Phase 1 (MVP): Static Content
- ✅ Email signup form (captures email, stores in state or local)
- ✅ Static testimonials (hardcoded names + quotes)
- ✅ Static stats (50+ fragrances placeholder)
- ✅ Feature mockup shows placeholder fragrance names
- ❌ No fragrance library integration
- ❌ No email list backend (implement later)
- ❌ No analytics tracking (implement later)

### Phase 2 (Post-Launch): Dynamic Content
- [ ] Connect email signup to Supabase (store emails for launch list)
- [ ] Fetch testimonials from database
- [ ] Fetch real fragrance count from API
- [ ] Add analytics event tracking (landing page views, CTA clicks)
- [ ] A/B test email copy variations
- [ ] Track conversion rate (email signup → Accord Creator visit)

---

## Responsive Behavior

Landing page should adapt to all screen sizes:

| Breakpoint | Changes |
|---|---|
| **Mobile (< 768px)** | Hero headline → 32px; value prop cards stack vertically; 3-step flow becomes 3 rows; FAQ items condense |
| **Tablet (768–1024px)** | Hero headline → 40px; value prop cards → 2 per row; normal layout otherwise |
| **Desktop (> 1024px)** | Full width layouts per design; max-content width 1200px |

**Mobile-first approach:** Design for mobile first, then enhance for larger screens.

---

## Build Strategy

### Option A: Next.js + React (Recommended)
- Create `/pages/landing.tsx` or use `/app` directory structure
- Import design philosophy colors as CSS variables
- Use Tailwind for spacing/layout (if desired) OR plain CSS for tighter control
- Component structure:
  ```
  /components
    /landing
      Hero.tsx
      ValueProps.tsx
      FeatureShowcase.tsx
      SocialProof.tsx
      FAQ.tsx
      Footer.tsx
  /pages
    landing.tsx (or index.tsx if this is the homepage)
  ```

### Option B: Separate Landing (Recommended for SEO)
- Build landing on `scentral.vercel.app` or domain TBD
- Accord Creator lives on `/app` or `/accord-creator`
- CTA buttons link from landing → `/app`
- Cleaner separation of concerns

---

## Email Signup Implementation

### Phase 1: Capture Only
```tsx
const [email, setEmail] = useState('');
const [submitted, setSubmitted] = useState(false);

const handleSubmit = (e) => {
  e.preventDefault();
  // Validate email
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;
  
  // Store in state or localStorage for now
  localStorage.setItem('scentral_email_signup', email);
  setSubmitted(true);
  
  // Show success message
  // Redirect to /app after 2s
  setTimeout(() => router.push('/app'), 2000);
};
```

### Phase 2: Backend Integration
```tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // POST to /api/email-signup
  const res = await fetch('/api/email-signup', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  
  if (res.ok) {
    setSubmitted(true);
    setTimeout(() => router.push('/app'), 2000);
  }
};
```

---

## SEO Setup

Add to landing page metadata:

```tsx
// pages/landing.tsx or next.config.js

const head = {
  title: "Build Fragrance Layering Combos | Scentral",
  description: "Create 2–3 fragrance layering combos, discover harmony scores, and share your Accords. Free, no account needed.",
  keywords: ["fragrance combos", "fragrance layering", "accord creator", "scent mixer"],
  ogImage: "/og-image.png", // 1200×630px
  ogDescription: "Build your signature fragrance layering combos with Scentral.",
};
```

---

## Next Steps

1. **Review design references** — Look at the 5 PNG sections
2. **Choose build approach** — Next.js component library or separate landing
3. **Start with Hero section** — Get email signup working
4. **Iterate through sections** — Build out Value Props → Feature → Social Proof → FAQ
5. **Test responsiveness** — Mobile, tablet, desktop
6. **Setup analytics** — Vercel Analytics or Plausible (optional for MVP)
7. **Deploy** — Push to Vercel; share URL with early users

---

## Success Metrics (Month 1)

- ✅ Landing page live and indexed by Google
- ✅ 20%+ email signup rate (visitors → emails captured)
- ✅ Mobile-responsive on all devices
- ✅ 50%+ CTA click-through to Accord Creator
- ✅ No broken links or console errors

---

**Ready to build.** Design philosophy provided. Reference visuals ready. Implementation is straightforward Next.js work — no hardcoding required.
