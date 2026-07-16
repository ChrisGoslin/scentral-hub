---
name: vercel-domain-tls-workflow
description: "Understand Vercel's domain cutover and TLS cert issuance workflow. After pointing A record to Vercel IP, HTTP works immediately; HTTPS certificate issuance runs in parallel (usually 5–30 min). Workflow: DNS live → http check → monitor cert status in Vercel CLI → HTTPS live → set NEXT_PUBLIC_SITE_URL in env. Use after domain A-record changes to Vercel IP."
---

# Skill: vercel-domain-tls-workflow

## Why this exists

2026-07-16: After changing notalabs.io's A record from Shopify (23.227.38.73) to Vercel (216.198.79.1), HTTP responded immediately (site live on Vercel edge), but HTTPS threw SSL connection errors. This is expected: Vercel's cert issuance runs asynchronously after detecting a domain change, not instantly. Knowing this prevents misdiagnosing "cert not ready" as "domain routing broken."

## When to invoke

- Just changed an A record to point to Vercel (via registrar or DNS provider)
- Checking whether HTTPS cert issuance is in progress or complete
- Debugging "SSL_ERROR_SYSCALL" or "certificate validation failed" after domain cutover
- Setting up a new domain or migrating from another host to Vercel

## Procedure

### 1. Confirm DNS is live at authoritative nameservers

**Before proceeding, verify with the DNS propagation skill** (`dns-propagation-under-cache-interference`):

```bash
# Query authoritative NS directly (Vercel watches this, not local resolvers)
dig +tcp +short A notalabs.io @ns-cloud-e1.googledomains.com
# Should show Vercel's IP (e.g., 216.198.79.1)
```

If authoritative doesn't show Vercel's IP yet, cert issuance won't start. Wait 5–15 minutes after the DNS change.

### 2. Test HTTP to confirm Vercel is routing traffic

```bash
curl -I http://notalabs.io --max-time 10
# Expected: HTTP/1.1 200 OK (from Vercel edge)
# Not expected: timeout, "Host not found", or connection refused
```

If HTTP works, Vercel's DNS routing is live. HTTPS cert issuance should start now or very soon.

### 3. Check cert issuance status via Vercel CLI

```bash
npx vercel@56.2.1 domains inspect notalabs.io
```

`vercel domains inspect` reports DNS configuration, not certificate status — it does not have a documented `SSL` row. Check certificate status with:

```bash
npx vercel@56.2.1 certs ls --help
npx vercel@56.2.1 certs ls --limit 100
```
(`certs ls` defaults to 20 results — pass `--limit 100`, or otherwise page/filter, so an existing cert for this domain isn't missed. Confirm current flags with `npx vercel@56.2.1 certs ls --help` since output/options can shift across versions.)

| Status | Meaning | Action |
|--------|---------|--------|
| Cert listed for the domain | Cert is live | Try HTTPS now |
| No cert listed yet / domain shows misconfigured in `domains inspect` | Vercel is checking authoritative DNS + provisioning cert | Wait 5–30 min, re-check |
| Error in either command's output | DNS not seen, or other blocker | Check that A record points to Vercel's IP |

Re-verify the exact field names against the installed CLI version before trusting this table — `vercel` CLI output has changed across major versions.

### 4. Test HTTPS once cert is ready

```bash
curl -I https://notalabs.io --max-time 10
# Expected: HTTP/1.1 200 OK + valid cert chain
# Not expected: SSL errors, hostname mismatch
```

### 5. Update environment variables in Vercel

**Before running either command below, confirm you're linked to the correct project and environment** (`npx vercel@56.2.1 project ls` / check `.vercel/project.json`) — these commands affect production configuration and a deploy.

Once HTTPS is live, set the public site URL so OG previews, canonical tags, and email links use HTTPS:

```bash
npx vercel@56.2.1 env add NEXT_PUBLIC_SITE_URL
# Enter: https://notalabs.io
# Environment: All (or Production + Preview if you need different)
```

Then redeploy or wait for the next deploy to pick it up:

```bash
npx vercel@56.2.1 --prod
```

**Verify the deploy actually promoted to production** — the command output must include an `▲ Aliased` line pointing at the production domain. If it's absent, the deploy did not go live at the expected domain; stop and investigate before assuming step 6 will pass.

### 6. Verify OG/canonical tags work correctly

Test the real OG endpoint (there is no `/noseprint/[id]` page route — the app has a single `/noseprint` page and a separate `/api/og/noseprint` image route that takes query params). `curl -I` only shows headers — it can't confirm `<meta>` tags or the canonical `<link>`, so fetch the body:

```bash
# Status/header check for the OG image endpoint
curl -I "https://notalabs.io/api/og/noseprint?name=Test&descriptor=Test"

# Fetch the actual page body to inspect og: meta tags and the canonical link
curl -fsSL "https://notalabs.io/noseprint" | grep -Ei '<meta property="og:|rel="canonical"'
```

Confirm the canonical tag's `href` points to the HTTPS `notalabs.io` domain (not the old domain or a `myshopify` subdomain).

## What to expect during issuance

| Time | HTTP | HTTPS | Vercel CLI status |
|------|------|-------|-------------------|
| 0–2 min | ✓ Works | ✗ SSL error | Cert pending |
| 2–10 min | ✓ Works | ✗ SSL error | Cert pending |
| 10–30 min | ✓ Works | ✗ SSL error | Cert pending (most complete by here) |
| 30+ min | ✓ Works | ✓ Works | SSL ✓ (ready) |

Typically takes 5–15 minutes. If it takes >60 min, check:
- Does authoritative DNS still show Vercel's IP? (Propagation didn't revert)
- Is there an error message in Vercel domains UI?
- Did you enable DNS validation (not needed for Vercel if A record is correct)?

## Anti-patterns to avoid

- Testing HTTPS before HTTP is working (cert issuance waits for routing to be live)
- Assuming cert delay means the domain routing is broken (they're independent — HTTP and HTTPS issues are different)
- Setting `NEXT_PUBLIC_SITE_URL` before cert is live (creates mixed-protocol issues, cert won't validate)
- Not updating environment variables (old domain in OG tags can break social sharing and email preview)
- Waiting for 100% DNS propagation before moving forward (Vercel checks authoritative NS, which is usually live in <5 min)

## Cleanup checklist after HTTPS is live

- [ ] Verify `NEXT_PUBLIC_SITE_URL` is set in Vercel env
- [ ] Redeploy the app (or wait for next auto-deploy)
- [ ] Test OG preview on a social platform (LinkedIn, Twitter/X, Slack)
- [ ] Check canonical tag in page source (`<link rel="canonical" href="https://notalabs.io...">`)
- [ ] If old domain had traffic, set up 301 redirects or update internal links
- [ ] Test email/notification links point to new domain (search app code for hardcoded domain strings)

## When NOT to use this skill

For DNS provider setup help (Shopify, Route53, etc.), consult that provider's docs. For TLS debugging on non-Vercel hosts, use your provider's cert management interface.

## See also

- `dns-propagation-under-cache-interference` — verifying DNS is actually live (authoritative NS check)
- nota. CLAUDE.md § "Domain & DNS" — notalabs.io cutover notes and remaining cleanup tasks
- `vercel:status` skill (if available in Claude Code) — get live project deployment status

## Provenance and maintenance

Derived from: notalabs.io A-record cutover 2026-07-16, confirmed with `curl -I http://...` (working immediately), `npx vercel@56.2.1 domains inspect notalabs.io` (DNS verified), and `npx vercel@56.2.1 certs ls` (cert pending → cert live), live cert issuance observation (~10 min).

Re-verify on next invocation:
```bash
# Check Vercel CLI works and reports domain status correctly
npx vercel domains list 2>&1 | head -5
# Should list domains without error
```

Last updated: 2026-07-16
Known uncertainty:
- Exact cert issuance time varies by region and load (usually 5–30 min, empirically observed ~10 min for this domain)
- Whether Vercel retries cert issuance if authoritative DNS temporarily reverts (not documented; assume yes)
- Custom domain on non-Vercel registrar behavior (tested with Shopify-registered, Google Cloud DNS-hosted; may differ for other registrars)
