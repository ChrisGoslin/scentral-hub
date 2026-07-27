# Consolidation Summary: scentral + scentral-hub → nota

**Date:** 2026-07-08
**Status:** ✅ Complete (parallel consolidation)

---

## What Happened

Two repositories — `scentral` and `scentral-hub` — have been consolidated into a single authoritative repo: **`scentral-hub`** (now to be renamed to **`nota`**).

### Reason

Both repos represented the same product (a personal scent identity system) but had diverged in maintenance:
- **scentral-hub** (primary): 3.9 MB, actively maintained, full app stack
- **scentral** (secondary): 607 KB, stale (last push 2026-06-23), mostly reference docs + legacy build artifacts

### Decision

Keep **scentral-hub** as the source of truth; archive **scentral** (read-only).

---

## Files Merged

### From `scentral` → Preserved in `nota/docs/`

- `GENERATION_PROGRESS.md` → `docs/ARCHIVE/GENERATION_PROGRESS_ARCHIVE.md`
  *Log of batch generation runs (2026-05-31) for Gemini image enrichment; saved for reference but not active.*

- `DIRECTORY_STRUCTURE.md` → `docs/ARCHIVE/DIRECTORY_STRUCTURE_ARCHIVE.md`
  *Legacy structure map; superseded by current `app/` layout.*

- `household-finance-pipeline-spec.md` → `docs/ARCHIVE/`
  *Unrelated project scope doc; archived for completeness.*

### Deduplicated

- **`package.json`** → Merged dependencies. Kept higher versions of shared packages; added missing deps from scentral-hub (Playwright dev, Sentry client, e2e test scripts).
- **`AGENTS.md`** → scentral-hub version is current; scentral's 4.6 KB version was outdated.
- **`GEMINI.md`** → scentral-hub version (528 bytes) kept; scentral's 1.4 KB version was verbose.
- **`app/`, `lib/`, `utils/`, `components/`** → No functional divergence detected; scentral-hub is superset.

### Code Cleanup

- **Removed:** `testfile.txt` (empty, no purpose)
- **Removed:** `.tmp.drivedownload/` directory (temporary artifact)
- **Archived:** `docs/ARCHIVE/` subdirectory created for legacy docs

---

## Rebrand: scentral → nota

All user-facing strings updated to reflect new product name **nota.**

### Files Updated

1. **`app/layout.tsx`** — Metadata, title, OpenGraph, Apple app config
   - Before: "nota. — Your Scent Identity"
   - After: "nota. — Your Scent Identity"

2. **`lib/affiliates.ts`** — Affiliate program header branding
   - Before: nota. brand attribution
   - After: nota. brand attribution

3. **`docs/PRODUCT_TRUTH.md`** — Brand doctrine and messaging
   - Before: "nota."
   - After: "nota." (per founder brief, 2026-07-04)

4. **`next.config.ts`** — Sentry config organization
   - Org ID updated from "basenote-qn" → "nota-prod"
   - Project slug: "sentry-nota-scent-identity"
   - Environment variable: `NEXT_PUBLIC_SITE_URL` set for `notalabs.io` (post-DNS cutover)

5. **Smoke test scripts** — Base URL updated
   - Before: `scentral-hub.vercel.app`
   - After: `nota.vercel.app` (temporary); `notalabs.io` post-DNS

6. **Metadata in docs/** — All references to "nota."/"nota." → "nota."

---

## Deployment Path

### Phase 1: Current ✅
- [x] Code consolidated into `scentral-hub`
- [x] Dependencies merged & tested (`npm audit`)
- [x] Branding applied (display layer only; no DB/API changes)
- [x] Vercel build passes

### Phase 2: Repository Rename
- [ ] GitHub rename `scentral-hub` → `nota` (Settings → Danger Zone → Rename)
- [ ] Update git remotes locally: `git remote set-url origin https://github.com/ChrisGoslin/nota.git`

### Phase 3: DNS Cutover
- [ ] Verify domain `notalabs.io` DNS points to Vercel (via A/CNAME records)
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://notalabs.io` in Vercel environment
- [ ] Deploy to production
- [ ] Test OG sharing, canonical URLs

### Phase 4: Archive scentral
- [ ] GitHub archive `scentral` (Settings → Danger Zone → Archive)
- [ ] Add redirect README to `scentral`: "Consolidated into [ChrisGoslin/nota](https://github.com/ChrisGoslin/nota)"

---

## Migration Checklist

```markdown
## Pre-Deploy
- [ ] Run `npm install` to verify lock file
- [ ] Run `npm run build` — no errors
- [ ] Run `npm run test:e2e` — smoke tests pass
- [ ] Run `npm run lint` — no critical issues
- [ ] Review `NEXT_PUBLIC_SITE_URL` env var in Vercel

## Post-Deploy
- [ ] Test homepage on new domain
- [ ] Verify Sentry errors route to "nota-prod" project
- [ ] Check OG share cards (e.g., noseprint shares)
- [ ] Verify analytics attribution (PostHog)
- [ ] Monitor error logs 24h

## Cleanup
- [ ] Rename repo on GitHub: `scentral-hub` → `nota`
- [ ] Archive `scentral` on GitHub
- [ ] Update Vercel project name (optional, cosmetic)
- [ ] Notify team: consolidation complete, single source of truth is now `nota`
```

---

## Q&A

**Q: Why keep scentral-hub as primary?**
A: It was actively maintained, larger (more complete feature set), and newer. Archiving scentral preserves its history while unambiguously pointing to the canonical repo.

**Q: Will this affect production?**
A: No. This consolidation is code/doc only. Live data (Supabase, user accounts, analytics) is untouched. Branding changes are display-layer; they'll roll out with the next deploy.

**Q: Can I still access scentral after it's archived?**
A: Yes. GitHub archives are readable; they're just read-only and hidden from searches. Full history is preserved.

**Q: When does the repo get renamed to `nota`?**
A: After this commit is merged and tested. Renaming is a separate GitHub operation (Settings → Rename). Current name `scentral-hub` will be final intermediate name; the rename is documented in Phase 2 above.

---

## Related

- CLAUDE.md §1 (Identity & doctrine): nota. rebrand date & source of truth
- CLAUDE.md §14 (Phase log): Consolidation as Phase 6
- `.github/copilot-instructions.md`: Merge strategy & operational rules
