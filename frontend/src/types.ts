export interface ActionItem {
  task: string
  deadline?: string | null
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
}

export interface EvidenceItem {
  topic: string
  quote_text: string
  context?: string | null
}

export interface CalendarEvent {
  title: string
  description: string
  start_iso?: string | null
  end_iso?: string | null
  location?: string | null
  is_confirmed_ready: boolean
  date_type: 'deadline' | 'event' | string
  confidence_score: number
}

export interface NoticeAnalysisResponse {
  title: string
  simple_summary: string
  event_date?: string | null
  registration_deadline: string
  is_deadline_certain: boolean
  location?: string | null
  eligibility: string[]
  required_documents: string[]
  action_checklist: ActionItem[]
  source_evidence: EvidenceItem[]
  missing_or_ambiguous_info: string[]
  warnings: string[]
  suggested_calendar_event?: CalendarEvent | null
  is_blurry_or_unreadable: boolean
}

export interface StudentProfile {
  name: string
  department: string
  year: string
  rollNumber: string
}

export interface SavedNotice {
  id: string
  dateAdded: string
  category: 'Competition' | 'Academic' | 'Administrative' | 'Workshop' | 'General'
  imageSrc?: string
  imageFileName: string
  analysis: NoticeAnalysisResponse
  isStarred?: boolean
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

export interface SampleNotice {
  id: string
  title: string
  category: string
  badgeColor: string
  description: string
  imageFileName: string
  imageSrc: string
  data: NoticeAnalysisResponse
}

export type ActiveTab = 'scanner' | 'feed' | 'deadlines' | 'tasks'
