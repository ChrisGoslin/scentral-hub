/**
 * Affiliate link builders for nota.
 *
 * Network: AWIN (primary — covers EU fragrance market)
 * Publisher ID: 2955445 (approved 2026-06-28)
 *
 * To activate merchant links:
 *   1. Apply to Notino + Douglas programmes within AWIN dashboard
 *   2. Await merchant approval (they review separately from AWIN publisher approval)
 *   3. Replace each AWIN_MID_* with the merchant ID from the AWIN programme page
 *   4. Add NEXT_PUBLIC_AWIN_PUBLISHER_ID=2955445 to Vercel environment variables
 *
 * Until merchant IDs are set, all links fall back to plain search URLs (functional, no commission).
 */

// ─── AWIN config ─────────────────────────────────────────────────────────────
// AWIN publisher ID — approved 2026-06-28. Add to Vercel as NEXT_PUBLIC_AWIN_PUBLISHER_ID=2955445
const AWIN_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID || '2955445'

// Merchant IDs — find these on each programme's page inside AWIN
const AWIN_MID_NOTINO = 'PENDING'    // Notino IE/EU — dominant EU fragrance retailer
const AWIN_MID_DOUGLAS = 'PENDING'   // Douglas — major EU perfumery (DE/AT/PL/NL/etc)
const AWIN_MID_FEELUNIQUE = 'PENDING' // Cult Beauty / Feel Unique (backup, UK/EU)

// ─── Types ────────────────────────────────────────────────────────────────────
export type AffiliateNetwork = 'awin' | 'direct'

export type AffiliateRetailer = {
  name: string
  network: AffiliateNetwork
  merchantId?: string         // AWIN merchant ID (awinmid)
  searchUrl: string           // base search URL (used for direct fallback)
  searchParam: string         // query param name (e.g. "q", "search")
  logoEmoji: string
  markets: string[]           // ISO country codes this retailer covers well
  isActive: boolean           // false = placeholder, won't render affiliate links
}

// ─── Retailer registry ────────────────────────────────────────────────────────
export const AFFILIATE_RETAILERS: AffiliateRetailer[] = [
  {
    name: 'Notino',
    network: 'awin',
    merchantId: AWIN_MID_NOTINO,
    searchUrl: 'https://www.notino.ie/search/',
    searchParam: 'q',
    logoEmoji: '🛍️',
    markets: ['IE', 'DE', 'FR', 'IT', 'ES', 'PL', 'CZ', 'SK', 'HU', 'RO'],
    isActive: AWIN_MID_NOTINO !== 'PENDING',
  },
  {
    name: 'Douglas',
    network: 'awin',
    merchantId: AWIN_MID_DOUGLAS,
    searchUrl: 'https://www.douglas.de/de/search',
    searchParam: 'searchterm',
    logoEmoji: '🌹',
    markets: ['DE', 'AT', 'PL', 'NL', 'IT', 'FR', 'ES'],
    isActive: AWIN_MID_DOUGLAS !== 'PENDING',
  },
  {
    name: 'Feel Unique',
    network: 'awin',
    merchantId: AWIN_MID_FEELUNIQUE,
    searchUrl: 'https://www.feelunique.com/search',
    searchParam: 'q',
    logoEmoji: '✨',
    markets: ['IE', 'GB', 'EU'],
    isActive: AWIN_MID_FEELUNIQUE !== 'PENDING',
  },
]

// ─── Link builders ────────────────────────────────────────────────────────────

/**
 * Build a proper AWIN deep link for a search query.
 * Format: https://www.awin1.com/cread.php?awinmid=MID&awinaffid=PUBID&p=ENCODED_DEST
 *
 * When AWIN IDs are PENDING, falls back to a plain search URL so buttons
 * still work during development — they just won't earn commission yet.
 */
export function buildAffiliateUrl(
  retailer: AffiliateRetailer,
  searchTerm: string
): string {
  const encoded = encodeURIComponent(searchTerm)
  const destinationUrl = `${retailer.searchUrl}?${retailer.searchParam}=${encoded}`

  if (
    retailer.network === 'awin' &&
    retailer.merchantId &&
    retailer.merchantId !== 'PENDING' &&
    AWIN_PUBLISHER_ID !== 'PENDING'
  ) {
    // Proper AWIN click-tracking link
    const dest = encodeURIComponent(destinationUrl)
    return `https://www.awin1.com/cread.php?awinmid=${retailer.merchantId}&awinaffid=${AWIN_PUBLISHER_ID}&p=${dest}`
  }

  // Fallback: plain search URL (no commission, but functional)
  return destinationUrl
}

/**
 * Build an AWIN deep link to a specific product page (not a search).
 * Use this when you have an exact product URL (e.g. from image enrichment).
 */
export function buildAffiliateProductUrl(
  retailer: AffiliateRetailer,
  productUrl: string
): string {
  if (
    retailer.network === 'awin' &&
    retailer.merchantId &&
    retailer.merchantId !== 'PENDING' &&
    AWIN_PUBLISHER_ID !== 'PENDING'
  ) {
    const dest = encodeURIComponent(productUrl)
    return `https://www.awin1.com/cread.php?awinmid=${retailer.merchantId}&awinaffid=${AWIN_PUBLISHER_ID}&p=${dest}`
  }
  return productUrl
}

/**
 * Returns retailers active for a given market (ISO country code).
 * Falls back to all retailers if market is unknown.
 */
export function getRetailersForMarket(market = 'IE'): AffiliateRetailer[] {
  return AFFILIATE_RETAILERS.filter(r => r.markets.includes(market) || r.markets.includes('EU'))
}
