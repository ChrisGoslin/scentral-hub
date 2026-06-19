export type AffiliateRetailer = {
  name: string;
  baseUrl: string;
  searchParam: string;
  affiliateParam: string;
  affiliateId: string;
  logoEmoji: string;
};

export const AFFILIATE_RETAILERS: AffiliateRetailer[] = [
  {
    name: 'Fragrantica',
    baseUrl: 'https://www.fragrantica.com/search/',
    searchParam: 'q',
    affiliateParam: '',
    affiliateId: '',
    logoEmoji: '🌸',
  },
  {
    name: 'Feel Unique',
    baseUrl: 'https://www.feelunique.com/search',
    searchParam: 'q',
    affiliateParam: 'affil',
    affiliateId: 'scentral',
    logoEmoji: '✨',
  },
  {
    name: 'Notino',
    baseUrl: 'https://www.notino.co.uk/search/',
    searchParam: 'q',
    affiliateParam: 'ref',
    affiliateId: 'scentral',
    logoEmoji: '🛍️',
  },
];

export function buildAffiliateUrl(
  retailer: AffiliateRetailer,
  searchTerm: string
): string {
  const encoded = encodeURIComponent(searchTerm);
  const base = retailer.searchParam
    ? `${retailer.baseUrl}?${retailer.searchParam}=${encoded}`
    : `${retailer.baseUrl}${encoded}`;
  if (!retailer.affiliateParam || !retailer.affiliateId) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${retailer.affiliateParam}=${retailer.affiliateId}`;
}
