// UI constants — course colours, icons, and helper functions.
// Actual student records live in Supabase (students table).

export const COURSES = [
  { id: 1, name: 'Web Development',    color: '#6366f1', icon: '💻', duration: '6 months', instructor: 'Sarah Kamau',   fee: 4500 },
  { id: 2, name: 'Data Science',       color: '#0ea5e9', icon: '📊', duration: '8 months', instructor: 'James Omondi',  fee: 5500 },
  { id: 3, name: 'Cybersecurity',      color: '#ef4444', icon: '🔐', duration: '5 months', instructor: 'Paul Mutua',    fee: 5000 },
  { id: 4, name: 'Cloud Computing',    color: '#f59e0b', icon: '☁️', duration: '6 months', instructor: 'Grace Wanjiku', fee: 6000 },
  { id: 5, name: 'UI/UX Design',       color: '#10b981', icon: '🎨', duration: '4 months', instructor: 'Linda Achieng', fee: 4000 },
  { id: 6, name: 'Mobile Development', color: '#8b5cf6', icon: '📱', duration: '7 months', instructor: 'Kevin Njoroge', fee: 5000 },
]

export const STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold']

// Updated at runtime by CoursesContext after fetching from Supabase
let _coursesCache = null

export function setCoursesCache(courses) {
  _coursesCache = courses
}

export function getCourseColor(courseName) {
  const source = _coursesCache ?? COURSES
  return source.find(c => c.name === courseName)?.color ?? '#6366f1'
}

export function getStatusColor(status) {
  switch (status) {
    case 'Active':    return { bg: '#dcfce7', text: '#16a34a' }
    case 'Inactive':  return { bg: '#f1f5f9', text: '#64748b' }
    case 'Completed': return { bg: '#dbeafe', text: '#2563eb' }
    case 'On Hold':   return { bg: '#fef9c3', text: '#ca8a04' }
    default:          return { bg: '#f1f5f9', text: '#64748b' }
  }
}

export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
