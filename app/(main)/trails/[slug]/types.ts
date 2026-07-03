export type StepType =
  | 'hook'
  | 'fact'
  | 'term'
  | 'experience'
  | 'people_like_you'
  | 'tip'
  | 'creator'
  | 'data'

export type HookContent = { headline: string; body?: string }
export type FactContent = { headline: string; body: string }
export type TermContent = { term: string; definition: string }
export type ExperienceContent = { trace_id?: string; body: string; author_label?: string }
export type PeopleLikeYouContent = { insight: string }
export type TipContent = { headline: string; body: string }
export type CreatorContent = { creator_name: string; quote: string }
export type DataContent = { stat_label: string; stat_value: string; source: string }

export type StepContent =
  | HookContent
  | FactContent
  | TermContent
  | ExperienceContent
  | PeopleLikeYouContent
  | TipContent
  | CreatorContent
  | DataContent

export type TrailStep = {
  id: string
  trail_id: string
  position: number
  step_type: StepType
  content: StepContent
}
