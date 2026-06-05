export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  notes: FragranceNotes;
  image_url?: string | null;
  family?: string;
  accords?: string[];
  clone_target?: string;
  versatility_score?: number;
}

export interface CombinerState {
  fragrances: (Fragrance | null)[];
  harmonyScore: number;
  breakdown: ProfileBreakdown;
}

export interface ProfileBreakdown {
  topMatchPct: number;
  heartMatchPct: number;
  baseMatchPct: number;
  dominantProfile: "top" | "heart" | "base" | "balanced";
}
