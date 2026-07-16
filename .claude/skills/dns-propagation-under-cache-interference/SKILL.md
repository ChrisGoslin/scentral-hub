---
name: dns-propagation-under-cache-interference
description: "Verify DNS changes when ISP or transparent DNS interception caches hide real zone state. Techniques: DNS-over-HTTPS (dns.google, cloudflare-dns.com), TCP queries to bypass UDP interception, direct authoritative nameserver checks, TTL monitoring. Use when local dig/nslookup shows stale results even after A record is updated at source."
---

# Skill: dns-propagation-under-cache-interference

## Why this exists

2026-07-16: After changing notalabs.io's A record from Shopify (23.227.38.73) to Vercel (216.198.79.1), local DNS queries showed the old IP for 15+ minutes. Appeared to be propagation delay or zone sync issue. Root cause: the local network (via ISP or router) was transparently intercepting all DNS queries — both UDP to standard resolvers and TCP to authoritative nameservers — and serving a cached answer with ~21h TTL remaining. Only DNS-over-HTTPS (DoH) bypassed the interception and revealed the real zone state (new IP was live at Google's authoritative servers). Lesson: don't trust local DNS until you've verified against at least two independent paths (authoritative NS + public DoH resolvers).

## When to invoke

- DNS A/CNAME/MX record updated but local `dig` / `nslookup` shows old value
- Change is confirmed at source (registrar admin, DNS provider UI) but clients still see old data
- Need to know whether the problem is propagation delay vs. local cache pollution
- Zone cutover (e.g., Shopify → Vercel domain handoff) where you need proof the new target is live before cert issuance

## Procedure

### 1. Check local resolver state (expect it to be stale, don't stop here)

```bash
dig +short A notalabs.io
# If this shows old IP, local cache or ISP DNS is interfering — continue to step 2
```

### 2. Query the authoritative nameserver directly (TCP, to bypass transparent UDP interception)

```bash
# Get the authoritative nameservers for the domain
dig NS notalabs.io +short

# Query one of the returned nameservers directly via TCP (UDP can be intercepted, TCP usually isn't).
# Don't hard-code a specific nameserver — use one from the `dig NS` output above, since
# delegation can change. Example, substituting an actual result from that command:
dig +tcp +short A notalabs.io @<nameserver-from-dig-NS-output>
```

If you need to confirm the response actually came from an authoritative server (not a resolver), drop `+short` and check the `aa` (authoritative answer) flag in the full `dig` output.

If this shows the **old** value, the zone change truly hasn't propagated yet (give it 5–15 minutes).

If this shows the **new** value, the zone is live at authoritative servers, but your local path is cached.

### 3. Query via DNS-over-HTTPS to bypass local network interception

Public DoH resolvers (not interceptable by ISP/router transparent DNS):

```bash
# Google DNS
curl -s "https://dns.google/resolve?name=notalabs.io&type=A" | grep -o '"data":"[^"]*"'

# Cloudflare DNS
curl -s -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=notalabs.io&type=A" | grep -o '"data":"[^"]*"'
```

**Expected DoH output (new IP):**
```json
"data":"216.198.79.1"
```

If DoH shows new + authoritative shows new + local shows old → local cache is the only problem.

### 4. Check TTL to estimate cache expiration

```bash
dig A notalabs.io @<nameserver-from-dig-NS-output> +noall +answer
```

Look for the number after the domain name (TTL in seconds):
```
notalabs.io.		21600	IN	A	216.198.79.1
                        ↑
                    TTL (6 hours)
```

**Important:** this is the authoritative record's TTL — the cache lifetime for a *newly retrieved* answer, not the remaining time on a stale answer some ISP or local resolver is already serving. It does not tell you how much longer an old cached value will stick around; that depends on when each individual resolver last fetched it. To estimate remaining staleness on a specific affected resolver, query that resolver directly and compare its returned TTL to this authoritative value.

If the authoritative TTL is large (3600+ seconds / 1+ hour), expect any resolver that fetches (or fetched) the record to hold it for that long from its own fetch time. You can't force this to go faster on others' machines; only way to accelerate is:
- Lower TTL **before** the change (should have been done 24h prior, too late now)
- Use the new IP for HTTPS cert provisioning in parallel (Vercel will recognize it's live even if clients still see old IP)

### 5. Understand what each test tells you

| Source | Shows Old | Shows New | Interpretation |
|--------|-----------|-----------|-----------------|
| Local dig | ✓ | ✗ | Your ISP/router caching |
| Authoritative NS (TCP) | ✓ | ✗ | Zone change hasn't applied yet; wait 5–15 min |
| Authoritative NS (TCP) | ✗ | ✓ | Zone is live; local cache is stale |
| DoH (Google/CF) | ✗ | ✓ | Public resolvers see it; ISP cache is older than TTL |

### 6. What to do at each state

**Zone live (authoritative + DoH both show new):**
- HTTPS certificate issuance can proceed (Vercel, AWS, Let's Encrypt will check authoritative NS, not ISP DNS)
- Users will gradually see new IP as their local TTL expires
- Some clients (company networks, VPNs with forced DNS) may stay on old IP until their cache expires — this is expected
- Don't wait for 100% propagation before declaring the change successful

**Zone not yet live (authoritative shows old):**
- Check the source system (Shopify admin, registrar, DNS provider UI) — is the update saved/committed?
- For Shopify-managed DNS: changes may take 2–5 minutes to sync to Google Cloud DNS
- If it's been >15 minutes, contact DNS provider or check for error messages in their UI

## Anti-patterns to avoid

- Assuming local `dig` failures mean the zone change didn't work; always check authoritative NS directly
- Waiting for 100% propagation before declaring victory (cert issuance, traffic routing can proceed with 50%+)
- Not lowering TTL before a planned migration (should be done 24h prior, not after)
- Trusting a single public resolver (Google's DoH can be outdated if it hasn't queried recently; check 2–3 sources)
- Reloading a cached page in browser without hard-refresh or incognito mode (browser also caches DNS)

## When NOT to use this skill

For DNS record creation/deletion, DNSSEC validation, or deep DNS debugging beyond A/CNAME records, use your provider's native tools or a specialist DNS tool (DNSchecker, MXToolbox, etc.).

## See also

- `vercel-domain-tls-workflow` — cert issuance normally proceeds in parallel with DNS propagation (authoritative is what matters, not client propagation)
- nota. CLAUDE.md § "Domain & DNS" — the notalabs.io deployment notes and what records still need cleanup

## Provenance and maintenance

Derived from: notalabs.io A-record cutover 2026-07-16, confirmed with DoH queries (dns.google, cloudflare-dns.com), TCP dig to authoritative nameservers (ns-cloud-e1.googledomains.com).

Re-verify on next invocation:
```bash
# Confirm the technique still works (services don't change):
curl -s "https://dns.google/resolve?name=google.com&type=A" | head -c 100
# Should return valid JSON with "data" key
```

Last updated: 2026-07-16
Known uncertainty:
- ISP/network behavior is per-location — some networks may also intercept TCP to authoritative NS (less common but possible; DoH is more reliable)
- How quickly Vercel's cert issuance checks authoritative vs. public resolvers (empirically ~5min, but not documented)
