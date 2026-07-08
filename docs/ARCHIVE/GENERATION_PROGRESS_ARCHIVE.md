# Archived: GENERATION_PROGRESS.md (from scentral)

**Source:** `ChrisGoslin/scentral` GENERATION_PROGRESS.md  
**Archived:** 2026-07-08 (consolidation to nota)  
**Status:** Reference only; not active

---

## Summary

This file logged batch generation runs (2026-05-31 to 2026-06-02) for image enrichment using Gemini API. Most runs failed due to API key/quota issues; later runs succeeded.

## Key Findings

- **Date range:** 2026-05-31 to 2026-06-02
- **Model:** Gemini 2.5 Flash (image) and Gemini Flash (text)
- **Failure rate:** ~70% (mostly 400 Bad Request / API key errors)
- **Success rate:** ~30% starting 2026-06-02 afternoon
- **Impact:** Fragrance image enrichment completed for ~150 entries

## Legacy Data

The log shows fragrance batch processing:
- Azzaro, Afnan, Dolce & Gabbana, French Avenue, Gucci, Khadlaj, Lattafa, Maison Asrar, Mercedes-Benz, Paris Corner, Rayhaan, Rochas, Swiss Arabian, and others.

## Current Status

Image enrichment is now managed by:
- `scripts/enrich-images-shopify.mjs` (production enrichment with circuit-breaker)
- `lib/familyGradient.ts` (fallback gradient when image missing)
- `next.config.ts` remotePatterns (allowed image hosts)

**No action required.** This archive is kept for historical reference only.
