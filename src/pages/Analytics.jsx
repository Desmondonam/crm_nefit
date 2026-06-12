import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getStudents } from '../lib/api'
import { COURSES, getCourseColor } from '../data/mockData'
import Spinner, { ErrorMsg } from '../components/Spinner'

const PIE_COLORS = ['#6366f1','#0ea5e9','#ef4444','#f59e0b','#10b981','#8b5cf6']

function ChartCard({ title, subtitle, children, span = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 ${span}`}>
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      {subtitle && <p className="text-slate-400 text-xs mt-0.5 mb-4">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-700">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Analytics() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try { setStudents(await getStudents()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const charts = useMemo(() => {
    const total = students.length
    if (!total) return null

    // Age distribution
    const ageBuckets = [
      { range: '15–19', min: 15, max: 19 },
      { range: '20–24', min: 20, max: 24 },
      { range: '25–29', min: 25, max: 29 },
      { range: '30–34', min: 30, max: 34 },
      { range: '35+',   min: 35, max: 99 },
    ].map(b => ({ range: b.range, count: students.filter(s => s.age >= b.min && s.age <= b.max).length }))

    // Course enrollment
    const courseData = COURSES.map(c => ({
      name: c.name, students: students.filter(s => s.course === c.name).length, color: c.color,
    }))

    // Gender distribution
    const genderData = ['Male', 'Female', 'Other']
      .map(g => ({ name: g, value: students.filter(s => s.gender === g).length }))
      .filter(d => d.value > 0)

    // Status distribution
    const statusData = [
      { name: 'Active',    value: students.filter(s => s.status === 'Active').length,    color: '#10b981' },
      { name: 'Inactive',  value: students.filter(s => s.status === 'Inactive').length,  color: '#94a3b8' },
      { name: 'Completed', value: students.filter(s => s.status === 'Completed').length, color: '#6366f1' },
      { name: 'On Hold',   value: students.filter(s => s.status === 'On Hold').length,   color: '#f59e0b' },
    ]

    // Average age per course
    const avgAgeData = COURSES.map(c => {
      const cohort = students.filter(s => s.course === c.name)
      const avg    = cohort.length ? Math.round(cohort.reduce((sum, s) => sum + s.age, 0) / cohort.length) : 0
      return { name: c.name.split(' ')[0], avg, color: c.color }
    })

    // Monthly enrollments (computed from real data)
    const monthly = {}
    students.forEach(s => {
      if (!s.enrollment_date) return
      const d   = new Date(s.enrollment_date)
      const key = `${d.toLocaleString('default', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`
      monthly[key] = (monthly[key] || 0) + 1
    })
    const monthlyChart = Object.entries(monthly)
      .sort(([a], [b]) => new Date('1 ' + a) - new Date('1 ' + b))
      .map(([month, enrollments]) => ({ month, enrollments }))

    return { ageBuckets, courseData, genderData, statusData, avgAgeData, monthlyChart, total }
  }, [students])

  if (loading) return <Spinner message="Loading analytics…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />
  if (!charts) return <div className="text-center py-20 text-slate-400">No data yet.</div>

  const { ageBuckets, courseData, genderData, statusData, avgAgeData, monthlyChart, total } = charts

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Age',       value: `${Math.round(students.reduce((s,st) => s + st.age, 0) / total)} yrs` },
          { label: 'Avg. Progress',  value: `${Math.round(students.reduce((s,st) => s + st.progress, 0) / total)}%`  },
          { label: 'Total Enrolled', value: total                                                                       },
          { label: 'Grad Rate',      value: `${Math.round(students.filter(s => s.status === 'Completed').length / total * 100)}%` },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-indigo-600">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Enrollments" subtitle="New student sign-ups per month" span="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution" subtitle="Number of students per age group">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageBuckets} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Students" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Students per Course" subtitle="Enrollment split across all courses">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="students" name="Students" radius={[0,4,4,0]}>
                {courseData.map(c => <Cell key={c.name} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Distribution" subtitle="Male vs. female breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} (${Math.round(v/total*100)}%)`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Enrollment Status" subtitle="Active, completed, on hold, inactive">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value">
                {statusData.map(s => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} (${Math.round(v/total*100)}%)`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Age by Course" subtitle="Mean student age in each programme" span="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgAgeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[18, 35]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" name="Avg. Age" radius={[4,4,0,0]}>
                {avgAgeData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
