# Scentral — Claude Code Session Guide

Use this file to run your first Claude Code session for Scentral.
All the database work is already done. This session wires up the UI.

---

## What's already done (don't redo)

- Supabase project `lrkdwobnemczvhpixpky` (scentral-mvp) is live
- 76 fragrances imported across 3 phases
- 4 expert layering protocols seeded
- All RLS policies applied (fragrances + layering_protocols are public read)

---

## Step 1 — Create the Next.js project (if starting fresh)

In your terminal, in whatever folder you keep projects:

```bash
npx create-next-app@latest scentral --typescript --tailwind --eslint --app --no-src-dir
cd scentral
```

When prompted: use App Router = Yes, import alias = default (@/*)

---

## Step 2 — Install Supabase client

```bash
npm install @supabase/supabase-js
```

---

## Step 3 — Set env vars

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrkdwobnemczvhpixpky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2R3b2JuZW1jenZocGl4cGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Nzg5NjAsImV4cCI6MjA5NDQ1NDk2MH0.1eXO0aYRLnV8RVfz9kTp0AB1QBwGoM0SLqH47HTehoE
```

---

## Step 4 — Add the collection page

Copy `scentral-collection-page.tsx` from your AI Studio folder into:
`app/collection/page.tsx`

Or paste this exact Claude Code prompt:

---

## The Claude Code Prompt (paste this exactly)

> "I'm building Scentral — a personal fragrance intelligence tool. The Supabase project ID is `lrkdwobnemczvhpixpky` and it's already live with 76 fragrances in 3 phases.
>
> I have a complete collection page ready at `/Users/christophergoslin/AI Studio/scentral-collection-page.tsx`. Please:
>
> 1. Copy that file into `app/collection/page.tsx` in this project
> 2. Verify `.env.local` exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set
> 3. Run `npm run dev` and confirm the page loads at http://localhost:3000/collection
> 4. Tell me what you see — specifically: how many fragrance cards rendered and whether they're grouped into 3 phase sections
>
> Do not change the page code unless something errors. Just get it running."

---

## Step 5 — Deploy to Vercel

Once it runs locally:

```bash
npx vercel --prod
```

When Vercel asks about env vars, add both NEXT_PUBLIC_ vars in the Vercel dashboard under Settings → Environment Variables (scope: Production + Preview + Development).

---

## What the page shows

- Dark theme (slate-950 background)
- 3 phase sections: 🛑 Anchors | 🧬 Modulators | ⚡ Tops
- Each card: Brand, Name, Family, Rating/10, Projection, Lean, Temperature, Application Zone, Maturation status, Anosmia Risk warning
- Cards sorted by projection (Beast Mode first) then rating
- No auth required — public read on fragrances

---

## Next Claude Code sessions (in order)

1. Add a filter bar (season, lean, anosmia_risk) — client component with useState
2. Add a detail slide-over — clicking a card shows all fields including spritz_count, application_method, inspired_by
3. Build `/layering` page — pick a fragrance, see phase-compatible pairings + 4 expert protocols
4. Wire auth — then build `/schedule` page

---

## Risks to watch

- Fragrance images: `image_url` column is null for all rows. Skip images for now — cards look clean without them.
- `export const dynamic = 'force-dynamic'` is already in the page. This prevents Next.js from trying to prerender at build time and failing because env vars aren't set in CI.
- If Tailwind classes don't apply: check tailwind.config.ts includes `'./app/**/*.{ts,tsx}'` in content paths.
