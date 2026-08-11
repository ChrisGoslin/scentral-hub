export type ShelfFragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  image_url: string | null
}

export type ShelfSource = 'noseprint_match' | 'manual' | 'blind_ranking'

export type ShelfTier = 'S' | 'A' | 'B' | 'C'

export type ShelfSlot = {
  // shelf_items.id — null for an empty slot that has no row yet
  itemId: string | null
  rank: number
  source: ShelfSource | null
  locked: boolean
  fragrance: ShelfFragrance | null
  // GENERATED column, derived from rank server-side (db003) — S 1-5 / A 6-10 / B 11-15 / C 16-20
  tier: ShelfTier | null
  blindBuy: boolean
}
