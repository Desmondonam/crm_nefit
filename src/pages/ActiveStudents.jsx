import { useState, useEffect } from 'react'
import { Search, BookOpen, Clock, MapPin, Mail, Phone } from 'lucide-react'
import { getStudents } from '../lib/api'
import { COURSES, getCourseColor, getInitials, getStatusColor } from '../data/mockData'
import Spinner, { ErrorMsg } from '../components/Spinner'

function StudentCard({ student }) {
  const [expanded, setExpanded] = useState(false)
  const sc = getStatusColor(student.status)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5" style={{ backgroundColor: getCourseColor(student.course) }} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
            style={{ backgroundColor: getCourseColor(student.course) }}>
            {getInitials(student.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {student.location}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: sc.bg, color: sc.text }}>
                {student.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCourseColor(student.course) }} />
              <span className="text-xs text-slate-600">{student.course}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Course Progress</span>
            <span className="font-medium" style={{ color: getCourseColor(student.course) }}>{student.progress}%</span>
          </div>
          <div className="bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${student.progress}%`, backgroundColor: getCourseColor(student.course) }} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} /> Enrolled {student.enrollment_date}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> Age {student.age}</span>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          {expanded ? 'Hide details ▲' : 'View contact ▼'}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <a href={`mailto:${student.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600">
              <Mail size={12} className="text-slate-400" /> {student.email}
            </a>
            <a href={`tel:${student.phone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600">
              <Phone size={12} className="text-slate-400" /> {student.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActiveStudents() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [search,   setSearch]   = useState('')
  const [course,   setCourse]   = useState('All')
  const [sortBy,   setSortBy]   = useState('name')

  async function load() {
    setLoading(true); setError(null)
    try { setStudents(await getStudents()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <Spinner message="Loading active students…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />

  const active = students.filter(s => s.status === 'Active')

  const filtered = active
    .filter(s => {
      const q = search.toLowerCase()
      return (
        (!q || s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q)) &&
        (course === 'All' || s.course === course)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'course')   return a.course.localeCompare(b.course)
      return 0
    })

  const courseBreakdown = COURSES.map(c => ({
    ...c,
    count: active.filter(s => s.course === c.name).length,
  })).filter(c => c.count > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {courseBreakdown.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: c.color + '18' }}>
              {c.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{c.count}</p>
              <p className="text-xs text-slate-400 leading-tight">{c.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search active students…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          value={course} onChange={e => setCourse(e.target.value)}>
          <option value="All">All Courses</option>
          {COURSES.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="progress">Sort: Progress</option>
          <option value="course">Sort: Course</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} active students</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No active students match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => <StudentCard key={s.id} student={s} />)}
        </div>
      )}
    </div>
  )
}
