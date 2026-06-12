export const B2B_STAGES = [
  { key: 'Identified',        color: '#6366f1', bg: '#eef2ff',  desc: 'Company identified as a potential target for corporate training' },
  { key: 'Initial Outreach',  color: '#0ea5e9', bg: '#e0f2fe',  desc: 'First contact made — email, LinkedIn, or phone' },
  { key: 'Meeting Scheduled', color: '#8b5cf6', bg: '#ede9fe',  desc: 'Company agreed to a discovery / intro meeting' },
  { key: 'Needs Assessment',  color: '#f59e0b', bg: '#fef3c7',  desc: 'Assessing their specific training requirements' },
  { key: 'Proposal Sent',     color: '#f97316', bg: '#fff7ed',  desc: 'Corporate training proposal delivered to decision makers' },
  { key: 'Negotiation',       color: '#ec4899', bg: '#fdf2f8',  desc: 'Discussing terms, pricing, scope and customisation' },
  { key: 'Contract Signed',   color: '#10b981', bg: '#d1fae5',  desc: 'Deal closed — corporate training agreement in place!' },
]

export const B2B_LOST = { key: 'Lost', color: '#ef4444', bg: '#fee2e2', desc: 'Deal lost or company unresponsive' }

export const ALL_B2B_STAGES = [...B2B_STAGES, B2B_LOST]

export const COMPANY_INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Government & Public Sector', 'Oil & Gas', 'Construction & Real Estate',
  'Retail & E-commerce', 'Hospitality & Tourism', 'Logistics & Transport',
  'Manufacturing', 'Media & Telecommunications', 'Legal & Consulting', 'Other',
]

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']

export const COMPANY_SOURCES = [
  'LinkedIn', 'Referral', 'Conference / Event', 'Cold Email',
  'Cold Call', 'Website Form', 'WhatsApp', 'Walk-in', 'Social Media', 'Other',
]

export const COMPANY_LOST_REASONS = [
  'No budget', 'Chose competitor', 'Not interested', 'No response after follow-ups',
  'Wrong timing', 'Training not suitable', 'Decision postponed indefinitely', 'Other',
]

export const COMPANY_ACTIVITY_TYPES = [
  { key: 'Call',     label: 'Phone Call',  color: '#0ea5e9' },
  { key: 'Email',    label: 'Email',       color: '#6366f1' },
  { key: 'Meeting',  label: 'Meeting',     color: '#f59e0b' },
  { key: 'LinkedIn', label: 'LinkedIn',    color: '#0077b5' },
  { key: 'Proposal', label: 'Proposal',    color: '#f97316' },
  { key: 'Note',     label: 'Note',        color: '#94a3b8' },
]

export function getB2bStageInfo(key) {
  return ALL_B2B_STAGES.find(s => s.key === key) ?? B2B_STAGES[0]
}
