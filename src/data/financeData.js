// Finance UI constants — payments and expenses live in Supabase.

export const QAR = (n) =>
  `QAR ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const COURSE_FEES = {
  'Web Development':    4500,
  'Data Science':       5500,
  'Cybersecurity':      5000,
  'Cloud Computing':    6000,
  'UI/UX Design':       4000,
  'Mobile Development': 5000,
}

export const EXPENSE_CATEGORIES = [
  'Salaries', 'Rent', 'Utilities', 'Software', 'Marketing', 'Equipment', 'Miscellaneous',
]

export const PAYMENT_STATUS_COLORS = {
  Paid:    { bg: '#dcfce7', text: '#16a34a' },
  Partial: { bg: '#fef9c3', text: '#ca8a04' },
  Unpaid:  { bg: '#fee2e2', text: '#dc2626' },
}

export const EXPENSE_CATEGORY_COLORS = {
  Salaries:      '#6366f1',
  Rent:          '#0ea5e9',
  Utilities:     '#f59e0b',
  Software:      '#8b5cf6',
  Marketing:     '#10b981',
  Equipment:     '#ef4444',
  Miscellaneous: '#94a3b8',
}
