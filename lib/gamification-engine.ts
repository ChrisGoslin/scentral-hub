export enum UserExpertiseLevel {
  Novice = 1,
  Enthusiast = 2,
  Sommelier = 3,
  Atelier = 4,
}

export interface GamificationProfile {
  scentsXp: number
  level: UserExpertiseLevel
}

// XP Thresholds for unlocking the next UI/Language tier
const XP_THRESHOLDS = {
  [UserExpertiseLevel.Novice]: 0,
  [UserExpertiseLevel.Enthusiast]: 100,
  [UserExpertiseLevel.Sommelier]: 500,
  [UserExpertiseLevel.Atelier]: 2000,
}

export class GamificationEngine {
  
  static calculateLevel(xp: number): UserExpertiseLevel {
    if (xp >= XP_THRESHOLDS[UserExpertiseLevel.Atelier]) return UserExpertiseLevel.Atelier
    if (xp >= XP_THRESHOLDS[UserExpertiseLevel.Sommelier]) return UserExpertiseLevel.Sommelier
    if (xp >= XP_THRESHOLDS[UserExpertiseLevel.Enthusiast]) return UserExpertiseLevel.Enthusiast
    return UserExpertiseLevel.Novice
  }

  // XP Awards for various actions in the app
  static readonly ACTIONS = {
    LOG_TRACE: 25,
    SAVE_LAYERING_COMBO: 50,
    COMPLETE_NOSEPRINT: 100,
    DAILY_LOGIN: 10,
    ADD_TO_SHELF: 5,
  }

  static getNextMilestone(currentXp: number): { nextLevel: UserExpertiseLevel | null, xpNeeded: number } {
    const currentLevel = this.calculateLevel(currentXp)
    
    if (currentLevel === UserExpertiseLevel.Atelier) {
      return { nextLevel: null, xpNeeded: 0 }
    }

    const nextLevel = (currentLevel + 1) as UserExpertiseLevel
    const xpNeeded = XP_THRESHOLDS[nextLevel] - currentXp
    
    return { nextLevel, xpNeeded }
  }
}
