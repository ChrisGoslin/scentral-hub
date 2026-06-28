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
| Amouage | www.amouage.com | ✅ reachable | 46 |
| Afnan | ~~www.afnanperfumes.com~~ → `afnan.com` | ✅ fixed, reachable | 38 |
| Swiss Arabian | www.swissarabian.com | ✅ reachable | 16 |
| Initio | www.initio-parfums.com | ✅ reachable | 0 — `/products.json` returned 0 products on the live run despite the domain resolving. Possible auth wall or schema difference. Logged in misses file with `catalog_size=0`. |
| Montale | www.montaleparis.com | ✅ reachable | 0 — same symptom as Initio, logged with `catalog_size=0`. |
| Xerjoff | www.xerjoff.com | ✅ reachable | **0, and zero entries in the misses log at all** — distinct from Initio/Montale. This brand appears to not have been processed in the run (likely the script errored or was cut short right after Swiss Arabian; Xerjoff is last in the `SHOPIFY_BRANDS` object). Before re-running: check the script's console output/exit code for an error after the Swiss Arabian catalog fetch, not just the misses file. |
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
