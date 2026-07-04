---
name: shopify-image-enrichment
description: "Verify a brand's Shopify storefront before trusting it in scripts/enrich-images-shopify.mjs, and match fragrance names against real product catalogs instead of slugify-guessing handles. Use before running enrich-images-shopify.mjs, before adding a new brand to SHOPIFY_BRANDS, or when a brand suddenly returns 0 hits."
---

# Skill: shopify-image-enrichment

## Why this exists
On 2026-06-28, `scripts/enrich-images-shopify.mjs --dry-run` returned 0 hits across every brand.
Root cause was never one bug — it was three compounding failures, found only by testing each
brand's storefront directly with curl instead of trusting the hardcoded `SHOPIFY_BRANDS` domain map:
1. **Stale domains** — brands rebrand/move domains (`afnanperfumes.com` → `afnan.com`,
   `lattafa.ae` → `lattafa.com`) and the map silently rots.
2. **WAF/Cloudflare blocking** — some stores 403/406 the public `/products.json` API even with a
   browser User-Agent (Lattafa, Rasasi, Lalique). These brands are not scrapeable this way, full stop.
3. **Handle-guessing is wrong** — `toHandle("9 PM")` → `9-pm`, but the real Shopify handle is
   `9pm-night-out`. Naive slugify-and-fetch-by-handle misses real products even on healthy stores.

Don't re-diagnose this from scratch next time. Run the verification step below before trusting
any brand in the map, and use the title-matching strategy (not handle-guessing) for new code.

## Known brand status

Domain reachability verified 2026-06-28 (re-verify if >3 months old or a brand returns 0 hits).
**Live-run results verified against the DB** the same day, after `scripts/enrich-images-shopify.mjs`
(no `--dry-run`) actually ran — see "Live run results" below; domain reachability alone does not
guarantee hits.

| Brand | Domain | Domain status | Live-run hits (verified in DB) |
|---|---|---|---|
| Armaf | www.armaf.com | ✅ reachable | 95 |
| Swiss Arabian | www.swissarabian.com | ✅ reachable | 81 |
| Amouage | www.amouage.com | ✅ reachable | 46 |
| Afnan | ~~www.afnanperfumes.com~~ → `afnan.com` | ✅ fixed, reachable | 38 |
| Initio | ~~www.initio-parfums.com~~ → `www.initioparfums.com` | ✅ fixed, reachable | 16 |
| Xerjoff | www.xerjoff.com | ✅ reachable | 10 |
| Montale | ~~www.montaleparis.com~~ — domain fully dead | ❌ removed from `SHOPIFY_BRANDS` | n/a — `montaleparis.com` now serves a JS-redirect parked-domain stub (GoDaddy), and `montale.com` redirects to a domain-marketplace listing (atom.com). No live Shopify storefront found for this brand. Re-check periodically in case the brand relaunches a store. |

**Running total across these 6 brands: 286 fragrances enriched** (verified against DB 2026-06-28,
after fixing Initio's domain and a fuzzy-match bug — see below).

## Multi-brand retailer stores (`--retailer=<name>`, added 2026-07-04)

The script also supports multi-brand retailers via `RETAILER_STORES`. Retailer products carry a
`vendor` field, so matching requires normalised brand (through `BRAND_ALIASES` — DB "Dior"/"dior"
↔ vendor "Christian Dior", "YSL" ↔ "Yves Saint Laurent", "MFK" ↔ "Maison Francis Kurkdjian")
AND name to agree. Retailer misses append to `scripts/data/image-misses.txt` (cumulative, same
caveat as shopify-misses.txt).

| Retailer | Domain | Status | Live-run hits (verified in DB) |
|---|---|---|---|
| Scentoria | scentoria.co.in | ✅ verified 2026-07-04 | 5,744 (path prefix `/s/files/1/0679/6096/3326/`) |

**Scentoria authenticity profile (checked 2026-07-04):** genuine-goods decant/tester reseller in
India — ~8.5k products, 400+ vendors, authentic-market pricing, zero clone/dupe language. BUT
~24% of its images are hand-taken phone photos of used bottles ("Partial" listings, filenames like
`IMG_4461-Photoroom.png`). The `skipTitle`/`skipImage` filters in its `RETAILER_STORES` entry
exclude those — do not remove them. Known imperfection: some kept images show tester-cap bottles
(title clean, only the filename says tester, e.g. `Ciel_Woman_With_tester_Cap.webp`) — genuine
product, plain cap.

**Before adding a new retailer:** run the same curl verification procedure below, PLUS an
authenticity check — pull ~10 designer products and sanity-check price/name/vendor (clone sellers
price 100ml designer at ₹500–800; genuine-market is 3–10×), scan titles for
partial/decant/tester/inspired/clone language, and check image filename patterns for phone photos.
Set per-retailer `skipTitle`/`skipImage` accordingly.

**Every image host needs a `next.config.ts` remotePatterns entry (AGENTS.md L16).** The 2026-06-28
brand run wrote `cdn.shopify.com` URLs without adding the host — a live L16 bug (next/image throws
at render) that sat unnoticed until 2026-07-04. Fixed; verified via `/_next/image` returning 200.

### What "0 hits, 0 catalog products" actually meant for Initio (don't assume WAF/Cloudflare)
The first live run logged Initio and Montale both as `catalog_size=0` and assumed it was an auth
wall or Cloudflare block, same as Lattafa/Rasasi/Lalique. **That assumption was wrong for Initio** —
the real cause was a stale domain in `SHOPIFY_BRANDS` (`initio-parfums.com` doesn't resolve to the
brand at all). The correct domain is `www.initioparfums.com` (no hyphen), confirmed working with 121
catalog products. Montale's domain genuinely is dead (parked page), so that one really has no fix
available right now — but don't assume "0 catalog products" means the same root cause across brands
without checking each one with curl. The Xerjoff "0 hits AND 0 misses logged" result from the same
run turned out to be a one-off network blip in that session — a later run got 10 hits from the same
domain with no code change, so it was never actually broken.
| Lattafa / Lattafa Pride | ~~www.lattafa.ae~~ → `lattafa.com` | ❌ domain fixed but Cloudflare 403s `/products.json` — unusable via this method |
| Rasasi | www.rasasi.com | ❌ Cloudflare 406 |
| Lalique | www.lalique.com | ❌ WAF 403 |
| Byredo | www.byredo.com | ❌ 404 on products.json — site restructured, not confirmed Shopify anymore |
| Khadlaj | www.khadlajperfumes.com | ❌ 405, suspicious WAF response |
| Zimaya | www.zimaya.com | ❌ 404 on products.json, no Shopify markers found |
| Creed | www.creedfragrances.com | ❌ domain dead. Unconfirmed candidate: `creedperfume.com` (200 on root only, not verified as same brand or as Shopify) |
| Kilian | www.kilianparis.com | ❌ domain dead. Unconfirmed candidate: `bykilian.com` (200 on root only, unverified) |
| Mancera | www.manceraparis.com | ❌ domain dead. `manceraparfums.com` redirects but products.json also redirects — unresolved |
| Parfums de Marly | www.parfumsdemarly.com | ❌ domain dead, no verified replacement found |
| Nusuk | www.nusuk.com | ❌ domain dead. `nusukperfumes.com` resolves (200 root) but products.json untested |

**Do not write an unconfirmed candidate domain into `SHOPIFY_BRANDS` as if verified** — "200 on root"
is not the same as "confirmed Shopify products.json for this exact brand." Mark it unconfirmed in
this table and in code comments until the verification procedure below has actually been run against it.

## Verification procedure (run before adding/trusting any brand)

```bash
# 1. Does the domain even resolve and serve HTTPS?
curl -s -o /dev/null -w "%{http_code}\n" --max-time 6 https://www.<domain>

# 2. Follow redirects to find the real current domain
curl -s -I --max-time 6 https://www.<domain> | grep -i location

# 3. Confirm it's a live Shopify store with a real catalog
curl -s -A "Mozilla/5.0" --max-time 8 "https://<real-domain>/products.json?limit=5" -o /tmp/check.json -w "%{http_code}\n"
node -e "console.log(require('/tmp/check.json').products.map(p => ({handle:p.handle, title:p.title})))"
```

- `200` + real product titles in the JSON = usable.
- **`200` with a tiny HTML body (a few hundred bytes, a `<script>window.location...</script>` stub,
  or "Temporary Redirect" to `forsale.godaddy.com` / a domain marketplace) = the domain is dead and
  parked, not a working store.** A bare status-code check (step 1) will report this as "200, looks
  fine" — always inspect the actual body in step 3, don't stop at the status code.
- `403`/`406` = Cloudflare/WAF blocking the public API — do not add to the map, it'll never work
  with plain `fetch()`, no amount of retrying or header-tweaking from a script is worth it.
- `404` on `/products.json` with a 200 on the root = probably not a Shopify store (or migrated
  off Shopify) — don't assume "200 root" implies a usable products API.
- Connection refused / DNS failure = dead domain, search for the current one, then re-run step 3
  on the new domain before trusting it.

## Matching strategy: fuzzy title match, not handle-guessing

Don't fetch by guessed handle (`/products/<slugified-name>.json`) — it misses real products whose
actual Shopify handle doesn't match a naive slugify. Instead:

1. Fetch the brand's full catalog once: `GET /products.json?limit=250` (paginate via `page=` if
   the brand has >250 products).
2. Build a normalized-title index: lowercase, strip punctuation, strip common noise words
   (`eau de parfum`, `edp`, `edt`, `for men`, `for women`).
3. Match each DB fragrance's `name` against that index (exact match first, then a fuzzy/Levenshtein
   fallback for near-misses like "9 PM" vs "9pm Night Out").
4. Log non-matches with the brand's actual catalog size, so a 0-hit brand is distinguishable from
   "catalog has 5 products and none of them match" vs "catalog fetch itself failed."

**Trailing numbers are distinguishing, like gender terms.** The 0.85 similarity threshold treats a
single-digit difference in a short name as a near-match — Initio's "Magnetic Blend 1" matched
"Magnetic Blend 7" in testing (one digit difference, ~93% similarity). Fixed by comparing trailing
digit sequences exactly before considering a fuzzy match (see `trailingNumber()` in the script) —
the same principle as not stripping gender terms from normalization. Any numbered product line
("Opus I/II/III", "Library Collection", "Amphorae 16/17/27") is at risk of this; if you add fuzzy
matching elsewhere, carry this check with it.

## When a brand returns 0 hits in a future run
Don't assume the matching logic regressed. Re-run the verification procedure against that one
brand's domain first — domains/WAFs change without warning, the script's matching logic usually isn't
the thing that broke.

## Never trust an agent's self-reported hit/miss numbers — verify against the DB

On 2026-06-28, after the live run, two different AI-generated summaries of the *same run* gave two
different, both-wrong numbers ("41 hits / 19 brands" from one summary, "154 hits" from another).
The real number, confirmed by querying Supabase directly, was **195 hits** (Afnan 38 + Armaf 95 +
Amouage 46 + Swiss Arabian 16, with Initio/Montale/Xerjoff at 0). Neither summary was malicious —
they were just wrong, and they read as confident and specific enough to sound trustworthy.

**Rule: after any run of this script (dry or live), verify hit counts by querying the DB directly**
rather than accepting the agent's printed summary at face value:

```bash
cd ~/Projects/scentral-hub
cat > scripts/_tmp_check.mjs << 'EOF'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const brands = ['Afnan','Armaf','Amouage','Initio','Montale','Swiss Arabian','Xerjoff']
for (const b of brands) {
  const { count } = await supabase.from('fragrances').select('id',{count:'exact',head:true})
    .eq('brand', b).not('image_url','is',null).like('image_url','%shopify%')
  console.log(b, '->', count)
}
EOF
node scripts/_tmp_check.mjs && rm scripts/_tmp_check.mjs
```

Also note: `scripts/data/shopify-misses.txt` is written with `fs.appendFileSync`, so it accumulates
across every run (dry-run included) — its line count is not "misses from the last run," it's
cumulative. Use `sort -u` and check brand totals against the catalog size logged per miss line, not
raw line counts, when sizing up how much work remains.
