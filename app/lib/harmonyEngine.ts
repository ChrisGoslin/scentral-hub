import { Fragrance, ProfileBreakdown } from './types';

export interface ScentDebtRecommendation {
  base_layer_id: string;
  top_layer_id: string;
  synergy_justification: string;
  expected_harmony: number;
}

// Calculate note intersection and similarity
function calculateNoteMatch(notesA: string[], notesB: string[]): number {
  if (notesA.length === 0 || notesB.length === 0) return 0;
  const intersection = notesA.filter(n => 
    notesB.some(b => b.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(b.toLowerCase()))
  );
  return Math.round((intersection.length / Math.max(notesA.length, notesB.length)) * 100);
}

// Aggregate matches across multiple fragrances
function aggregateMatches(fragrances: (Fragrance | null)[], noteLevel: 'top' | 'heart' | 'base'): number {
  const active = fragrances.filter((f): f is Fragrance => f !== null);
  if (active.length < 2) return 0;

  let totalMatch = 0;
  let comparisons = 0;

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const notesA = active[i].notes[noteLevel];
      const notesB = active[j].notes[noteLevel];
      totalMatch += calculateNoteMatch(notesA, notesB);
      comparisons++;
    }
  }

  return comparisons > 0 ? Math.round(totalMatch / comparisons) : 0;
}

export function calculateHarmonyScore(fragrances: (Fragrance | null)[]): {
  score: number;
  breakdown: ProfileBreakdown;
} {
  const active = fragrances.filter((f): f is Fragrance => f !== null);

  if (active.length < 2) {
    return {
      score: 0,
      breakdown: {
        topMatchPct: 0,
        heartMatchPct: 0,
        baseMatchPct: 0,
        dominantProfile: 'balanced'
      }
    };
  }

  const topMatchPct = aggregateMatches(fragrances, 'top');
  const heartMatchPct = aggregateMatches(fragrances, 'heart');
  const baseMatchPct = aggregateMatches(fragrances, 'base');

  // Harmony Score: weighted average (heart notes carry more weight in fragrance harmony)
  const score = Math.round((topMatchPct * 0.25 + heartMatchPct * 0.5 + baseMatchPct * 0.25));

  // Determine dominant profile
  const matches = { topMatchPct, heartMatchPct, baseMatchPct };
  const max = Math.max(topMatchPct, heartMatchPct, baseMatchPct);
  let dominantProfile: 'top' | 'heart' | 'base' | 'balanced' = 'balanced';
  
  if (max > 50) {
    if (topMatchPct === max) dominantProfile = 'top';
    else if (heartMatchPct === max) dominantProfile = 'heart';
    else if (baseMatchPct === max) dominantProfile = 'base';
  }

  return {
    score: Math.min(100, score),
    breakdown: {
      topMatchPct,
      heartMatchPct,
      baseMatchPct,
      dominantProfile
    }
  };
}

/**
 * 🧪 Scent Debt Optimization Protocol
 * Pairs the lower 20% (Debt) with the upper 80% (Staples)
 */
export function optimizeScentDebt(
  debtFragrances: Fragrance[],
  stapleFragrances: Fragrance[]
): ScentDebtRecommendation[] {
  const recommendations: ScentDebtRecommendation[] = [];

  for (const debt of debtFragrances) {
    let bestMatch: Fragrance | null = null;
    let highestHarmony = 0;
    let justification = "";

    for (const staple of stapleFragrances) {
      const harmony = calculateHarmonyScore([debt, staple]);
      
      // Look for contrasting but complementary profiles
      // e.g., A heavy Amber (Debt) base with a Fresh Citrus (Staple) top
      const isContrasting = 
        (debt.family === 'Oriental' && staple.family === 'Fresh') ||
        (debt.family === 'Woody' && staple.family === 'Floral') ||
        (debt.family === 'Gourmand' && staple.family === 'Spicy');

      // Bonus score for contrast in optimization mode
      const adjustedScore = harmony.score + (isContrasting ? 20 : 0);

      if (adjustedScore > highestHarmony) {
        highestHarmony = adjustedScore;
        bestMatch = staple;
        
        if (isContrasting) {
          justification = `Synthesizing ${debt.name}'s dense ${debt.family} architecture with ${staple.name}'s high-velocity ${staple.family} profile for a transformational refactor.`;
        } else {
          justification = `Reinforcing ${debt.name}'s core accords with the established ${staple.name} protocol to reduce olfactory entropy.`;
        }
      }
    }

    if (bestMatch) {
      recommendations.push({
        base_layer_id: debt.id,
        top_layer_id: bestMatch.id,
        synergy_justification: justification,
        expected_harmony: Math.min(100, highestHarmony)
      });
    }
  }

  return recommendations.sort((a, b) => b.expected_harmony - a.expected_harmony);
}
