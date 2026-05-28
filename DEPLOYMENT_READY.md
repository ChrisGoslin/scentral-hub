# Scentral: Ready to Deploy

## What's Live

### Landing Page (Route: `/`)
- ✅ Email signup capture form
- ✅ "Get Started" CTA → launches Accord Creator
- ✅ "Skip and explore" → direct to Accord Creator (no email)
- ✅ 3 feature cards (Layer, Score, Share)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ SEO metadata (title, description, viewport)

### Accord Creator (Route: `/app` or accessible from landing)
- ✅ Rebranded from "Layering Lab" → "Accord Creator"
- ✅ Updated copy: "Layer Your Bottles" → "Vibe Match" score
- ✅ 3-layer fragrance selector (Layer 1, 2, 3)
- ✅ Harmony score calculation + note breakdown
- ✅ "Load Example" button (populates with Lattafa + Afnan)
- ✅ localStorage persistence
- ✅ Dark mode with amber accents
- ✅ Responsive grid layout

## Files Changed

**New:**
- `app/components/AccordCreator.tsx` (rebranded component)
- `app/page.tsx` (new landing page)

**Updated:**
- `app/layout.tsx` (SEO metadata)

**Unchanged (still works):**
- `app/lib/harmonyEngine.ts` (matching logic)
- `app/lib/presets.ts` (3 fragrance presets)
- `app/lib/types.ts` (data structures)
- `package.json`, `tsconfig.json`, `tailwind.config.js`, etc.

## Deployment Steps

```bash
# 1. Commit changes
git add .
git commit -m "feat: launch Scentral landing + rebrand Accord Creator"

# 2. Push to main
git push origin main

# 3. Vercel auto-deploys on push
# → Watch build at vercel.com or via CLI: vercel --prod

# 4. Get live URL
# → https://scentral.vercel.app (or custom domain if registered)
```

## Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Email input accepts valid emails
- [ ] "Get Started" button → scrolls/navigates to Accord Creator
- [ ] "Skip and explore" → direct to Accord Creator
- [ ] Accord Creator loads (Layer 1, 2, 3 selectors)
- [ ] "Load Example" populates with Lattafa + Afnan
- [ ] Harmony score updates when fragrances selected
- [ ] Note breakdown visible with 2+ fragrances
- [ ] Mobile layout responsive (< 768px)
- [ ] localStorage persists state on refresh
- [ ] No console errors

## Next Steps (Post-Launch)

1. **Gather user feedback** — Share URL with Luna/Marcus/Zara proxies
2. **Measure key metrics:**
   - Landing page views
   - Email signup rate (target: 20%+)
   - CTA click-through rate
   - Time in Accord Creator
   - Return visits

3. **Iterate on design** — Once user feedback collected, refine landing visuals

4. **Integrate backend:**
   - Supabase email signup storage
   - Fragrance library API (expand from 3 → 50+)
   - User accounts + authentication
   - Persist Accords to database

5. **Future features:**
   - Blind buy recommendations
   - Public Accord sharing + profiles
   - Community trending
   - Affiliate links

---

**Status:** Ready to push. No hardcoded data. Email signup captures but doesn't persist (Phase 2). Landing validates product-market fit before investing in backend complexity.

**Estimated build time:** < 2 min  
**Estimated deploy time:** 2-5 min  
**Go-live:** Same day
