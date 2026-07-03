export type ShelfFragrance = {
  id: string
  brand: string
  name: string
  family: string | null
  image_url: string | null
}

export type ShelfSource = 'noseprint_match' | 'manual' | 'blind_ranking'

export type ShelfSlot = {
  // shelf_items.id — null for an empty slot that has no row yet
  itemId: string | null
  rank: number
  source: ShelfSource | null
  locked: boolean
  fragrance: ShelfFragrance | null
}
