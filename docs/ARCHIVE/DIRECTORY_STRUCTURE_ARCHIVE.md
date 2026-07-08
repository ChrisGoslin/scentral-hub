# Archived: DIRECTORY_STRUCTURE.md (from scentral)

**Source:** `ChrisGoslin/scentral` DIRECTORY_STRUCTURE.md  
**Archived:** 2026-07-08 (consolidation to nota)  
**Status:** Reference only; superseded by current structure

---

## Summary

This was an early reference map of the scentral project structure. The current structure in `nota` has evolved and is documented in:
- **CLAUDE.md §4** — Current route surface (58+ routes)
- **CLAUDE.md §5** — Database schema (37 public tables)
- **CLAUDE.md §8** — Design primitives & UI kit

## Current Directory Map

```
app/                    # Next.js App Router
├── (main)/            # Main feature routes
├── (community)/       # Social/discovery routes
├── (account)/         # User account routes
├── api/               # ~58 API endpoints
├── components/        # Page-level components
└── layout.tsx         # Root layout + metadata

lib/                    # Utilities
├── personas.ts        # 6 scent personas
├── affiliates.ts      # AWIN integration
├── shopify.ts         # Shopify Storefront API
├── supabase/          # Server-side Supabase clients
├── familyGradient.ts  # Fallback image gradients
└── design/            # Design tokens (CSS)

components/            # Shared components
├── ui/                # Primitives (Button, Card, etc.)
├── aura/              # Aura advisory UI
├── temptations/       # Temptations flow UI
└── feedback/          # Feedback widget

supabase/             # Database & Edge Functions
├── migrations/        # SQL migrations
└── functions/         # Supabase Edge Functions

public/               # Static assets (icons, fonts)
docs/                 # Markdown docs & guidelines
scripts/              # Utility scripts (enrichment, migration, etc.)
e2e/                  # Playwright end-to-end tests
```

## No Further Action Needed

This archive is kept for completeness. Refer to **CLAUDE.md** for current source of truth.
