/**
 * Olfactory Elo Duel & Preference Convergence Engine (SPIKE-03)
 * Gamified pairwise binary duels to establish ranking and personal taste vectors.
 */

export interface DuelFragrance {
  id: string
  name: string
  brand: string
  eloRating: number
  matchesPlayed: number
}

export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function updateEloRatings(
  winner: DuelFragrance,
  loser: DuelFragrance,
  kFactor = 32
): { updatedWinner: DuelFragrance; updatedLoser: DuelFragrance } {
  const expectedWinner = calculateExpectedScore(winner.eloRating, loser.eloRating)
  const expectedLoser = calculateExpectedScore(loser.eloRating, winner.eloRating)

  const newWinnerElo = Math.round(winner.eloRating + kFactor * (1 - expectedWinner))
  const newLoserElo = Math.round(loser.eloRating + kFactor * (0 - expectedLoser))

  return {
    updatedWinner: {
      ...winner,
      eloRating: newWinnerElo,
      matchesPlayed: winner.matchesPlayed + 1,
    },
    updatedLoser: {
      ...loser,
      eloRating: newLoserElo,
      matchesPlayed: loser.matchesPlayed + 1,
    },
  }
}
