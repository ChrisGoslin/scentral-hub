export type ScheduleFragrance = {
  id: string
  brand: string
  name: string
  phase: number | null
  phase_label: string | null
  family: string | null
  projection: string | null
  anosmia_risk: string | null
  spritz_count: number | null
  application_zone: string | null
  lean: string | null
  wear_count?: number
}

export type SlotKey = 'morning' | 'midday' | 'evening'

export type SlotConfig = {
  key: SlotKey
  label: string
  time: string
  phaseHint: string
  preferredPhases: number[]
}

export const SLOTS: SlotConfig[] = [
  {
    key: 'morning',
    label: 'Morning',
    time: '7:30 am',
    phaseHint: 'Anchors preferred — long-lasting base',
    preferredPhases: [1],
  },
  {
    key: 'midday',
    label: 'Midday',
    time: '12:30 pm',
    phaseHint: 'Modulators preferred — layer over morning',
    preferredPhases: [2],
  },
  {
    key: 'evening',
    label: 'Evening',
    time: '6:00 pm',
    phaseHint: 'Any phase — fresh reset or top note',
    preferredPhases: [1, 2, 3],
  },
]

export type SavedSchedule = {
  id: string
  name: string
  occasion: string | null
  created_at: string | null
  morning_sprays: number | null
  midday_sprays: number | null
  evening_sprays: number | null
  morning_frag: ScheduleFragrance | null
  midday_frag: ScheduleFragrance | null
  evening_frag: ScheduleFragrance | null
}
