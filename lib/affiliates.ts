/**
 * Affiliate link builders for Scentral Hub
 *
 * Network: AWIN (primary — covers EU fragrance market)
 * Publisher ID: set AWIN_PUBLISHER_ID below once approved
 *
 * To activate:
 *   1. Apply at awin.com/gb/publisher (use "Scentral" as trading name)
 *   2. Get approved, then join Notino + Douglas programmes within AWIN
 *   3. Replace AWIN_PUBLISHER_ID with your real publisher ID
 *   4. Replace each AWIN_MID_* with the merchant ID from the AWIN programme page
 *   5. Add NEXT_PUBLIC_AWIN_PUBLISHER_ID to Vercel environment variables
 */

// ─── AWIN config ─────────────────────────────────────────────────────────────
// Replace with your real AWIN publisher ID after approval
const AWIN_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID || 'PENDING'

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
