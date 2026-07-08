# Script Security Guidelines

This file documents best practices for writing secure data scripts (enrich-images.mjs, backfill-*.mjs, etc.).

## Credentials: .env.local Only

**Rule:** All scripts must load credentials from `.env.local` using dotenv, never from CLI env vars.

**Why:** CLI env vars are visible in process lists (`ps aux`), shell history, and logs. They're easy to accidentally expose.

**How:**
```javascript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}
```

**Template:** Copy `.env.local.example` to `.env.local` and fill in your actual values. `.env.local` is gitignored — never commit it.

## Never Log Credentials

**Rule:** Do not log, echo, or output any secret values, even if masked or abbreviated.

**Bad:**
```javascript
console.log(`Connecting to ${supabaseUrl}...`);  // ❌ Exposes URL
console.log(`Key: ${supabaseKey.substring(0, 10)}...`);  // ❌ Still exposes part of key
```

**Good:**
```javascript
console.log('✅ Connecting to Supabase...');  // ✅ No secrets revealed
```

The same rule applies to `FIRECRAWL_API_KEY`: never print it and never pass it
on the CLI. Prefer `.env.local`; for local operator flows, reusing the stored
Firecrawl CLI credential file is also acceptable.

## URL Validation: Beyond HTTP Status

**Rule:** Don't trust HTTP status codes alone. Check redirects and final URLs.

**Why:** Parfumo soft-404s return HTTP 200 with a redirect to /404. A HEAD request won't catch this.

**How:**
```javascript
const response = await fetch(url, {
  method: 'GET',
  redirect: 'follow',  // Follow redirects automatically
  headers: { 'User-Agent': '...' },
});

// Check final URL for soft-404 patterns
if (response.status === 200) {
  if (response.url.includes('/404')) {
    return null;  // Soft-404 detected
  }
  return response.url;  // Return final (redirected) URL
}
```

## Dry-Run Before Full Run

**Rule:** Always test with `--limit=5 --dry-run` before running against the full dataset.

**Why:** Catches credential issues, network errors, and logic bugs before touching 127K rows.

**How:**
```bash
node scripts/enrich-images.mjs --limit=5 --dry-run
```

**Checklist:**
- [ ] Script loads env vars from .env.local
- [ ] Validation tests pass (fake URL fails, real URL passes)
- [ ] No DB writes in dry-run mode
- [ ] Progress logging shows no credential values
- [ ] Miss log (if applicable) contains only legitimate misses

Only after dry-run passes should you run:
```bash
node scripts/enrich-images.mjs
```

## Commit Before First Run

**Rule:** Commit the script (with .env.local.example) before running against production data.

**Why:** Creates a safety checkpoint. If something goes wrong, you can revert to a known good state.

**How:**
```bash
git add scripts/enrich-images.mjs .env.local.example
git commit -m "feat: add image URL enrichment script with secure credential handling"
npm run build  # Verify no type errors
npx vercel --prod  # Deploy (if needed for server-side scripts)
```

## Common Mistakes

1. **Passing secrets as CLI args:** `SUPABASE_KEY="..." node script.mjs` ❌ → Use .env.local ✅
2. **Logging URLs/keys for debugging:** `console.log(supabaseUrl)` ❌ → Log metadata only ✅
3. **Trusting HTTP 200 on external sites:** → Check final URL for soft-404s ✅
4. **Running full script without dry-run:** → Always `--limit=5 --dry-run` first ✅
5. **Forgetting to commit before pushing:** → Commit script + example before running ✅
6. **Adding web-enrichment logic to the live request path:** → keep Firecrawl in
   offline/operator scripts only; card rendering should stay DB-backed ✅
7. **Letting runtime and script host allowlists drift:** → keep external image
   hosts in one shared source (`lib/fragranceImageHosts.js`) and make both the
   UI and scripts read from it ✅

## Incident: enrich-images.mjs (2026-06-25)

**What happened:** Script stored page URLs instead of validating them properly. 100% hit rate was a red flag.

**Root cause:** HEAD requests don't follow redirects. Parfumo soft-404s were accepted as valid.

**Fix:** Use GET with `redirect: 'follow'` and check final URL for /404 patterns. Added validation tests at startup.

**Lesson:** Always validate sample data before full run. 100% success on external scraping is suspicious.
