export type SimilarityBand = 'high' | 'medium' | 'adjacent'

export type SimilarityExplanation = {
  title: string
  summary: string
  guidance: { when_to_choose: string; caveats: string }
}

export function getSimilarityExplanation(
  scorePct: number,     // 0–100 from inspired_by confidence or manual
  targetName: string,   // the designer original
  cloneName: string,    // the nota. catalogue entry
): SimilarityExplanation {
  if (scorePct >= 90) return {
    title: "Practically twins",
    summary: `${cloneName} and ${targetName} share the same backbone. Most people can't tell them apart after 30 minutes on skin.`,
    guidance: {
      when_to_choose: "If you love the drydown of the original but want a smarter price.",
      caveats: "The opening may smell slightly sweeter or lighter on first spray."
    }
  }
  if (scorePct >= 70) return {
    title: "Very close — different first impression",
    summary: `${cloneName} is strongly inspired by ${targetName}. The heart and base are nearly identical; the opening takes a different route.`,
    guidance: {
      when_to_choose: "If you care more about how it wears than how it opens.",
      caveats: "If the first spray of the original is what you love, try a sample first."
    }
  }
  return {
    title: "Same family, different character",
    summary: `${cloneName} shares the olfactory DNA of ${targetName} but brings its own personality. A great alternative, not a copy.`,
    guidance: {
      when_to_choose: "If you want something in the same mood at a different price point.",
      caveats: "Don't expect them to smell identical — that's not the point."
    }
  }
}
