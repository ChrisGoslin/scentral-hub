export const BRAND_EMOJI: Record<string, string> = {
  Lattafa: '🌙',
  Afnan: '⚡',
  Rasasi: '🔥',
  Armaf: '👑',
  'Swiss Arabian': '🌹',
  'Al Haramain': '✨',
  Khadlaj: '💎'
}

export function getBrandEmoji(brand: string): string {
  const key = Object.keys(BRAND_EMOJI).find(k => brand.toLowerCase().includes(k.toLowerCase()))
  return key ? BRAND_EMOJI[key] : '🫧'
}
