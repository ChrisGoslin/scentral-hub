/**
 * Engagement stats helpers
 * Extracted from YouClient for reuse across multiple profile views
 */

export type EngagementState = {
  isWornToday: boolean
  isAtRisk: boolean
  streak: number
}

export function calculateEngagement(): EngagementState {
  const now = new Date()
  const lastWearRaw = localStorage.getItem('scentral_last_wear')
  const lastWearDate = lastWearRaw ? new Date(lastWearRaw) : null

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const isWornToday = lastWearDate ? lastWearDate >= startOfToday : false
  const currentHour = now.getHours()

  const storedStreak = parseInt(localStorage.getItem('scentral_streak') || '0', 10)

  return {
    isWornToday,
    isAtRisk: !isWornToday && currentHour >= 18,
    streak: storedStreak,
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}
