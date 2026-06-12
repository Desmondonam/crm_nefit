export const PIPELINE_STAGES = [
  { key: 'New Inquiry',   color: '#6366f1', bg: '#eef2ff', desc: 'Showed initial interest'               },
  { key: 'Contacted',     color: '#0ea5e9', bg: '#e0f2fe', desc: 'Team has reached out'                  },
  { key: 'Qualified',     color: '#8b5cf6', bg: '#ede9fe', desc: 'Confirmed budget & genuine interest'   },
  { key: 'Consultation',  color: '#f59e0b', bg: '#fef3c7', desc: 'Course walkthrough scheduled or done'  },
  { key: 'Proposal Sent', color: '#f97316', bg: '#fff7ed', desc: 'Pricing & course details shared'       },
  { key: 'Negotiation',   color: '#ec4899', bg: '#fdf2f8', desc: 'Discussing payment terms & start date' },
  { key: 'Enrolled',      color: '#10b981', bg: '#d1fae5', desc: 'Registered — ready to convert'         },
]

export const LOST_STAGE = { key: 'Lost', color: '#ef4444', bg: '#fee2e2', desc: 'Lead dropped off' }

export const ALL_STAGES = [...PIPELINE_STAGES, LOST_STAGE]

export const LEAD_SOURCES = [
  'WhatsApp', 'Instagram', 'LinkedIn', 'Facebook',
  'Website Form', 'Walk-in', 'Referral', 'Phone Call', 'Email', 'Event', 'Other',
]

export const ACTIVITY_TYPES = [
  { key: 'Call',     label: 'Phone Call', color: '#0ea5e9' },
  { key: 'WhatsApp', label: 'WhatsApp',   color: '#10b981' },
  { key: 'Email',    label: 'Email',      color: '#6366f1' },
  { key: 'Meeting',  label: 'Meeting',    color: '#f59e0b' },
  { key: 'Note',     label: 'Note',       color: '#94a3b8' },
]

export const LOST_REASONS = [
  'No budget',
  'Chose competitor',
  'Not interested anymore',
  'No response',
  'Wrong timing',
  'Course not suitable',
  'Other',
]

export function getStageInfo(stageKey) {
  return ALL_STAGES.find(s => s.key === stageKey) ?? PIPELINE_STAGES[0]
}
