import { useState, useEffect, useMemo } from 'react'
import {
  Plus, X, Search, Phone, Mail, MapPin, Calendar, User,
  BookOpen, MessageCircle, FileText, AlertCircle, CheckCircle2,
  Pencil, Trash2, LayoutGrid, List, Clock, UserPlus, Tag,
  Activity, Users, Filter
} from 'lucide-react'
import {
  getLeads, createLead, updateLead, deleteLead,
  getLeadActivities, createLeadActivity, createStudent
} from '../lib/api'
import {
  PIPELINE_STAGES, LOST_STAGE, LEAD_SOURCES, ACTIVITY_TYPES,
  LOST_REASONS, getStageInfo
} from '../data/leadsData'
import { getCourseColor, getInitials } from '../data/mockData'
import { useCourses } from '../context/CoursesContext'
import Spinner, { ErrorMsg } from '../components/Spinner'

// ─── helpers ─────────────────────────────────────────────────────────────────

function daysAgo(dateStr) {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function followUpStatus(dateStr) {
  if (!dateStr) return null
  const d     = new Date(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff  = Math.floor((d - today) / 86400000)
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444', bg: '#fee2e2' }
  if (diff === 0) return { label: 'Today',       color: '#f59e0b', bg: '#fef3c7' }
  if (diff <= 3)  return { label: `In ${diff}d`, color: '#0ea5e9', bg: '#e0f2fe' }
  return { label: dateStr, color: '#94a3b8', bg: '#f1f5f9' }
}

const ACT_ICONS  = { Call: Phone, WhatsApp: MessageCircle, Email: Mail, Meeting: Users, Note: FileText }
const ACT_COLORS = { Call: '#0ea5e9', WhatsApp: '#10b981', Email: '#6366f1', Meeting: '#f59e0b', Note: '#94a3b8' }

// ─── Stage Stepper ───────────────────────────────────────────────────────────

function StageStepper({ currentStage, onSelect }) {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStage)
  return (
    <div className="flex items-start gap-0">
      {PIPELINE_STAGES.map((stage, i) => {
        const isPast    = i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture  = i > currentIdx
        return (
          <div key={stage.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onSelect(stage.key)}
                title={stage.key + ' — ' + stage.desc}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 hover:opacity-90"
                style={
                  isCurrent ? { backgroundColor: stage.color, borderColor: stage.color, color: '#fff', transform: 'scale(1.15)', boxShadow: `0 0 0 3px ${stage.color}30` }
                  : isPast   ? { backgroundColor: stage.color, borderColor: stage.color, color: '#fff', opacity: 0.65 }
                             : { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', color: '#cbd5e1' }
                }
              >
                {isPast ? '✓' : i + 1}
              </button>
              <span className={`text-[9px] font-medium whitespace-nowrap px-0.5 ${isCurrent ? 'text-slate-700 font-semibold' : isFuture ? 'text-slate-300' : 'text-slate-400'}`}>
                {stage.key.split(' ')[0]}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-0.5"
                style={{ backgroundColor: isPast ? stage.color + '60' : '#e2e8f0' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Lead Card (Kanban) ───────────────────────────────────────────────────────

function LeadCard({ lead, onView, onAdvance }) {
  const stageIdx  = PIPELINE_STAGES.findIndex(s => s.key === lead.stage)
  const nextStage = stageIdx >= 0 && stageIdx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[stageIdx + 1] : null
  const fu        = followUpStatus(lead.next_follow_up)
  const days      = daysAgo(lead.updated_at)

  return (
    <div
      onClick={() => onView(lead)}
      className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all"
    >
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: getCourseColor(lead.course_interest) }}>
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
          <p className="text-xs text-slate-400 truncate">{lead.course_interest}</p>
        </div>
        {days > 5 && lead.stage !== 'Lost' && (
          <span className="text-[10px] text-amber-500 font-semibold shrink-0" title="Days in this stage">{days}d</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{lead.source}</span>
        {lead.phone && (
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <Phone size={8} />{lead.phone}
          </span>
        )}
      </div>

      {fu && (
        <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: fu.bg, color: fu.color }}>
          <Calendar size={8} />{fu.label}
        </div>
      )}

      {lead.converted_at && (
        <div className="mb-2 flex items-center gap-1 text-[10px] text-green-600 font-semibold">
          <CheckCircle2 size={10} /> Converted to Student
        </div>
      )}

      {lead.stage !== 'Lost' && !lead.converted_at && (
        <div onClick={e => e.stopPropagation()}>
          {nextStage ? (
            <button
              onClick={() => onAdvance(lead, nextStage.key)}
              className="w-full text-[10px] py-1.5 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: nextStage.bg, color: nextStage.color }}>
              → {nextStage.key}
            </button>
          ) : (
            <button
              onClick={() => onView(lead)}
              className="w-full text-[10px] py-1.5 rounded-lg font-semibold bg-green-50 text-green-700 border border-green-200">
              Convert to Student ✓
            </button>
          )}
        </div>
      )}

      {lead.stage === 'Lost' && lead.lost_reason && (
        <p className="text-[10px] text-red-400 italic truncate">{lead.lost_reason}</p>
      )}
    </div>
  )
}

// ─── Lead Form Modal (Add / Edit) ────────────────────────────────────────────

const EMPTY_LEAD = {
  name: '', email: '', phone: '', age: '', gender: 'Male', location: '',
  source: 'WhatsApp', course_interest: 'Web Development',
  assigned_to: '', next_follow_up: '', notes: '',
}

function LeadFormModal({ lead, onClose, onSave, saving }) {
  const courses = useCourses()
  const [form,   setForm]   = useState(lead ? {
    name:            lead.name,
    email:           lead.email           ?? '',
    phone:           lead.phone           ?? '',
    age:             lead.age             ?? '',
    gender:          lead.gender          ?? 'Male',
    location:        lead.location        ?? '',
    source:          lead.source,
    course_interest: lead.course_interest,
    assigned_to:     lead.assigned_to     ?? '',
    next_follow_up:  lead.next_follow_up  ?? '',
    notes:           lead.notes           ?? '',
  } : { ...EMPTY_LEAD, course_interest: courses[0]?.name ?? 'Web Development' })
  const [errors, setErrors] = useState({})

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function handleSave(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name:            form.name.trim(),
      email:           form.email           || null,
      phone:           form.phone           || null,
      age:             form.age             ? Number(form.age) : null,
      gender:          form.gender,
      location:        form.location        || null,
      source:          form.source,
      course_interest: form.course_interest,
      assigned_to:     form.assigned_to     || null,
      next_follow_up:  form.next_follow_up  || null,
      notes:           form.notes           || null,
    })
  }

  const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-800">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ahmed Al-Rashid" />
            {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+974 …" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Course Interest *</label>
              <select className={inp} value={form.course_interest} onChange={e => set('course_interest', e.target.value)}>
                {courses.filter(c => c.active).map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lead Source *</label>
              <select className={inp} value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
              <input className={inp} type="number" min="15" max="70" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select className={inp} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Doha" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
              <input className={inp} value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Team member name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Follow-up</label>
              <input className={inp} type="date" value={form.next_follow_up} onChange={e => set('next_follow_up', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea className={`${inp} resize-none`} rows={3} value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="Any context about this lead…" />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              {lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Log Activity Modal ───────────────────────────────────────────────────────

function LogActivityModal({ lead, onClose, onSave, saving }) {
  const [type,  setType]  = useState('Call')
  const [title, setTitle] = useState('')
  const [desc,  setDesc]  = useState('')
  const [error, setError] = useState('')

  function handleSave(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Please enter a title'); return }
    onSave({ lead_id: lead.id, type, title: title.trim(), description: desc.trim() || null, created_by: 'NextEdge Team' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Log Activity — {lead.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Activity Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {ACTIVITY_TYPES.map(t => {
                const Icon     = ACT_ICONS[t.key]
                const isActive = type === t.key
                return (
                  <button key={t.key} type="button" onClick={() => setType(t.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                    style={isActive ? { backgroundColor: t.color + '18', color: t.color, borderColor: t.color }
                                    : { borderColor: '#e2e8f0', color: '#64748b' }}>
                    <Icon size={12} /> {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title} onChange={e => { setTitle(e.target.value); setError('') }}
              placeholder="e.g. Called — interested, wants payment plan details" />
            {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Details (optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3} value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="What was discussed? What are the next steps?" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Mark as Lost Modal ───────────────────────────────────────────────────────

function LostModal({ onClose, onConfirm, saving }) {
  const [reason, setReason] = useState(LOST_REASONS[0])
  const [notes,  setNotes]  = useState('')
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={20} className="text-red-500" />
        </div>
        <h2 className="font-semibold text-slate-800 mb-1">Mark as Lost</h2>
        <p className="text-slate-500 text-sm mb-4">The lead will move to the Lost column. You can always restore it.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              value={reason} onChange={e => setReason(e.target.value)}>
              {LOST_REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
            <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context…" />
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={() => onConfirm(reason, notes)} disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2">
            {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
            Mark as Lost
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Convert to Student Modal ─────────────────────────────────────────────────

function ConvertModal({ lead, onClose, onConverted }) {
  const courses = useCourses()
  const [form,   setForm]   = useState({
    name:            lead.name,
    email:           lead.email    ?? '',
    phone:           lead.phone    ?? '',
    age:             lead.age      ?? '',
    gender:          lead.gender   ?? 'Male',
    location:        lead.location ?? '',
    course:          lead.course_interest,
    enrollment_date: new Date().toISOString().split('T')[0],
    status:          'Active',
    progress:        0,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleConvert(e) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await createStudent({
        name:            form.name,
        email:           form.email    || null,
        phone:           form.phone    || null,
        age:             form.age      ? Number(form.age) : null,
        gender:          form.gender,
        location:        form.location || null,
        course:          form.course,
        enrollment_date: form.enrollment_date,
        status:          'Active',
        progress:        0,
      })
      const updatedLead = await updateLead(lead.id, { converted_at: new Date().toISOString() })
      onConverted(updatedLead)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-800">Convert to Student</h2>
            <p className="text-xs text-slate-400 mt-0.5">Confirm details before registering as a customer</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleConvert} className="overflow-y-auto p-6 space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
              <input className={inp} type="number" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select className={inp} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Course *</label>
              <select className={inp} value={form.course} onChange={e => set('course', e.target.value)}>
                {courses.filter(c => c.active).map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment Date</label>
              <input className={inp} type="date" value={form.enrollment_date} onChange={e => set('enrollment_date', e.target.value)} />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 flex items-start gap-2">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            This will create a new student record visible in Customers and Active Students.
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Register as Student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadDetailModal({ lead: initialLead, onClose, onUpdate, onDelete }) {
  const [lead,       setLead]       = useState(initialLead)
  const [activities, setActivities] = useState([])
  const [loadingAct, setLoadingAct] = useState(true)
  const [editing,    setEditing]    = useState(false)
  const [logging,    setLogging]    = useState(false)
  const [showLost,   setShowLost]   = useState(false)
  const [converting, setConverting] = useState(false)
  const [delConfirm, setDelConfirm] = useState(false)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    setLoadingAct(true)
    getLeadActivities(lead.id)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoadingAct(false))
  }, [lead.id])

  function pushLocalLead(updated) { setLead(updated); onUpdate(updated) }

  async function handleStageChange(newStage) {
    if (newStage === lead.stage) return
    setSaving(true)
    try {
      const updated = await updateLead(lead.id, { stage: newStage })
      pushLocalLead(updated)
      const act = await createLeadActivity({ lead_id: lead.id, type: 'Note', title: `Stage changed → ${newStage}`, created_by: 'NextEdge Team' })
      setActivities(prev => [act, ...prev])
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function handleMarkLost(reason, notes) {
    setSaving(true)
    try {
      const updated = await updateLead(lead.id, { stage: 'Lost', lost_reason: reason })
      pushLocalLead(updated)
      const act = await createLeadActivity({ lead_id: lead.id, type: 'Note', title: `Marked as Lost: ${reason}`, description: notes || null, created_by: 'NextEdge Team' })
      setActivities(prev => [act, ...prev])
      setShowLost(false)
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function handleRestoreFromLost() {
    setSaving(true)
    try {
      const updated = await updateLead(lead.id, { stage: 'New Inquiry', lost_reason: null })
      pushLocalLead(updated)
      const act = await createLeadActivity({ lead_id: lead.id, type: 'Note', title: 'Restored to pipeline (New Inquiry)', created_by: 'NextEdge Team' })
      setActivities(prev => [act, ...prev])
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function handleLogActivity(data) {
    setSaving(true)
    try {
      const act = await createLeadActivity(data)
      setActivities(prev => [act, ...prev])
      setLogging(false)
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function handleSaveEdit(data) {
    setSaving(true)
    try {
      const updated = await updateLead(lead.id, data)
      pushLocalLead(updated)
      setEditing(false)
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteLead(lead.id)
      onDelete(lead.id)
      onClose()
    } catch(e) { alert('Error: ' + e.message); setSaving(false) }
  }

  const stageInfo  = getStageInfo(lead.stage)
  const isLost     = lead.stage === 'Lost'
  const isEnrolled = lead.stage === 'Enrolled'
  const fu         = followUpStatus(lead.next_follow_up)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onKeyDown={e => e.key === 'Escape' && onClose()}>
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: getCourseColor(lead.course_interest) }}>
                {getInitials(lead.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-slate-800 text-base">{lead.name}</h2>
                  {lead.converted_at && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={9} /> Converted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: stageInfo.bg, color: stageInfo.color }}>
                    {isLost ? '✗ Lost' : stageInfo.key}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{lead.source}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400 truncate">{lead.course_interest}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={15} /></button>
              <button onClick={() => setDelConfirm(true)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
          </div>

          {/* Stage Stepper */}
          {!isLost && (
            <div className="px-6 py-3 border-b border-slate-100 shrink-0 overflow-x-auto">
              <StageStepper currentStage={lead.stage} onSelect={handleStageChange} />
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left: Details + Actions */}
            <div className="md:w-72 shrink-0 p-5 space-y-4 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100">
              {/* Contact */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
                <div className="space-y-1.5">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600">
                      <Phone size={12} className="text-slate-300 shrink-0" />{lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 truncate">
                      <Mail size={12} className="text-slate-300 shrink-0" /><span className="truncate">{lead.email}</span>
                    </a>
                  )}
                  {lead.location && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={12} className="text-slate-300 shrink-0" />{lead.location}
                    </p>
                  )}
                  {(lead.age || lead.gender) && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={12} className="text-slate-300 shrink-0" />
                      {lead.age ? `Age ${lead.age}` : ''}{lead.age && lead.gender ? ' · ' : ''}{lead.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Lead Info */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lead Info</p>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <BookOpen size={12} className="text-slate-300 shrink-0" />
                    <span>{lead.course_interest}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCourseColor(lead.course_interest) }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-slate-300 shrink-0" />
                    <span>Via {lead.source}</span>
                  </div>
                  {lead.assigned_to && (
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-300 shrink-0" />
                      <span>Assigned to {lead.assigned_to}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock size={11} />
                    Added {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              {fu && (
                <div className="rounded-lg px-3 py-2.5 border" style={{ backgroundColor: fu.bg, borderColor: fu.color + '40' }}>
                  <p className="text-[10px] font-bold mb-0.5" style={{ color: fu.color }}>Next Follow-up</p>
                  <p className="text-sm font-semibold" style={{ color: fu.color }}>{lead.next_follow_up}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: fu.color }}>{fu.label}</p>
                </div>
              )}

              {/* Lost Reason */}
              {isLost && lead.lost_reason && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-bold text-red-500 mb-0.5">Lost Reason</p>
                  <p className="text-sm text-red-700">{lead.lost_reason}</p>
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {isEnrolled && !lead.converted_at && (
                  <button onClick={() => setConverting(true)}
                    className="w-full py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2">
                    <UserPlus size={15} /> Convert to Student
                  </button>
                )}
                <button onClick={() => setLogging(true)}
                  className="w-full py-2 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center gap-2">
                  <Activity size={14} /> Log Activity
                </button>
                {isLost ? (
                  <button onClick={handleRestoreFromLost} disabled={saving}
                    className="w-full py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50">
                    {saving && <span className="w-3 h-3 border border-slate-400/30 border-t-slate-600 rounded-full animate-spin" />}
                    Restore to Pipeline
                  </button>
                ) : (
                  <button onClick={() => setShowLost(true)}
                    className="w-full py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl">
                    Mark as Lost
                  </button>
                )}
              </div>
            </div>

            {/* Right: Activity Timeline */}
            <div className="flex-1 p-5 overflow-y-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Activity Timeline</p>
              {loadingAct ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                  <span className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" /> Loading…
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 text-slate-300">
                  <Activity size={28} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">No activities yet</p>
                  <p className="text-xs mt-0.5">Log a call, message, or note to start tracking</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                  <div className="space-y-5">
                    {activities.map(act => {
                      const Icon  = ACT_ICONS[act.type]  ?? FileText
                      const color = ACT_COLORS[act.type] ?? '#94a3b8'
                      return (
                        <div key={act.id} className="flex gap-3 relative">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white"
                            style={{ backgroundColor: color + '18' }}>
                            <Icon size={13} style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                            {act.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">{act.description}</p>}
                            <p className="text-[10px] text-slate-300 mt-1.5">
                              {new Date(act.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {act.created_by && <span className="ml-1">· {act.created_by}</span>}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {editing && (
        <LeadFormModal lead={lead} onClose={() => setEditing(false)} onSave={handleSaveEdit} saving={saving} />
      )}
      {logging && (
        <LogActivityModal lead={lead} onClose={() => setLogging(false)} onSave={handleLogActivity} saving={saving} />
      )}
      {showLost && (
        <LostModal onClose={() => setShowLost(false)} onConfirm={handleMarkLost} saving={saving} />
      )}
      {converting && (
        <ConvertModal lead={lead} onClose={() => setConverting(false)}
          onConverted={updatedLead => { setConverting(false); setLead(updatedLead); onUpdate(updatedLead) }} />
      )}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="font-semibold text-slate-800 mb-1">Delete Lead</h2>
            <p className="text-slate-500 text-sm mb-5">
              This will permanently delete <strong>{lead.name}</strong> and all their activity history.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2">
                {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Pipeline View (Kanban) ───────────────────────────────────────────────────

function PipelineView({ leads, onView, onAdvance, showLost }) {
  const lostLeads = leads.filter(l => l.stage === 'Lost')

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[400px]">
      {PIPELINE_STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.key)
        return (
          <div key={stage.key} className="flex-none w-[268px] flex flex-col">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0"
              style={{ backgroundColor: stage.bg, borderColor: stage.color + '35' }}>
              <div>
                <p className="text-xs font-bold" style={{ color: stage.color }}>{stage.key}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 hidden xl:block">{stage.desc}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: stage.color }}>
                {stageLeads.length}
              </span>
            </div>
            <div className="flex-1 rounded-b-xl border border-t-0 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)] min-h-28"
              style={{ backgroundColor: stage.bg + '60', borderColor: stage.color + '35' }}>
              {stageLeads.length === 0
                ? <div className="flex items-center justify-center h-16 text-slate-300 text-xs">Empty</div>
                : stageLeads.map(lead => <LeadCard key={lead.id} lead={lead} onView={onView} onAdvance={onAdvance} />)
              }
            </div>
          </div>
        )
      })}

      {showLost && (
        <div className="flex-none w-[268px] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0"
            style={{ backgroundColor: '#fee2e2', borderColor: '#ef444430' }}>
            <p className="text-xs font-bold text-red-500">Lost</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-red-400">{lostLeads.length}</span>
          </div>
          <div className="flex-1 rounded-b-xl border border-t-0 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)] min-h-28"
            style={{ backgroundColor: '#fff5f5', borderColor: '#ef444430' }}>
            {lostLeads.length === 0
              ? <div className="flex items-center justify-center h-16 text-slate-300 text-xs">No lost leads</div>
              : lostLeads.map(lead => <LeadCard key={lead.id} lead={lead} onView={onView} onAdvance={onAdvance} />)
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ leads, onView }) {
  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className={thCls}>Lead</th>
              <th className={thCls}>Course Interest</th>
              <th className={thCls}>Source</th>
              <th className={thCls}>Stage</th>
              <th className={thCls}>Follow-up</th>
              <th className={thCls}>Assigned</th>
              <th className={thCls}>Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No leads found.</td></tr>
            ) : leads.map(lead => {
              const si = getStageInfo(lead.stage)
              const fu = followUpStatus(lead.next_follow_up)
              return (
                <tr key={lead.id} onClick={() => onView(lead)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: getCourseColor(lead.course_interest) }}>
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                          {lead.name}
                          {lead.converted_at && <CheckCircle2 size={11} className="text-green-500" />}
                        </p>
                        <p className="text-xs text-slate-400">{lead.phone || lead.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCourseColor(lead.course_interest) }} />
                      {lead.course_interest}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{lead.source}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: si.bg, color: si.color }}>{lead.stage}</span>
                  </td>
                  <td className="px-4 py-3">
                    {fu
                      ? <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: fu.bg, color: fu.color }}>{fu.label}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{lead.assigned_to || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Leads Page ──────────────────────────────────────────────────────────

export default function Leads() {
  const courses = useCourses()
  const [leads,        setLeads]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [view,         setView]         = useState('pipeline')
  const [showLost,     setShowLost]     = useState(false)
  const [search,       setSearch]       = useState('')
  const [filterSource, setFilterSource] = useState('All')
  const [filterCourse, setFilterCourse] = useState('All')
  const [adding,       setAdding]       = useState(false)
  const [viewing,      setViewing]      = useState(null)
  const [saving,       setSaving]       = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try { setLeads(await getLeads()) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter(l => {
      const matchQ      = !q || l.name.toLowerCase().includes(q) || (l.phone ?? '').includes(q) || (l.email ?? '').toLowerCase().includes(q)
      const matchSource = filterSource === 'All' || l.source === filterSource
      const matchCourse = filterCourse === 'All' || l.course_interest === filterCourse
      return matchQ && matchSource && matchCourse
    })
  }, [leads, search, filterSource, filterCourse])

  const stats = useMemo(() => {
    const active    = leads.filter(l => l.stage !== 'Lost')
    const lost      = leads.filter(l => l.stage === 'Lost')
    const enrolled  = leads.filter(l => l.stage === 'Enrolled')
    const converted = leads.filter(l => l.converted_at)
    const overdue   = leads.filter(l => l.next_follow_up && new Date(l.next_follow_up) < new Date() && l.stage !== 'Lost')
    const convRate  = active.length > 0 ? Math.round((enrolled.length / active.length) * 100) : 0
    return { total: active.length, lost: lost.length, enrolled: enrolled.length, converted: converted.length, overdue: overdue.length, convRate }
  }, [leads])

  async function handleAddLead(data) {
    setSaving(true)
    try {
      const created = await createLead({ ...data, stage: 'New Inquiry' })
      setLeads(prev => [created, ...prev])
      setAdding(false)
    } catch(e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  function handleUpdateLead(updated) {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setViewing(v => v?.id === updated.id ? updated : v)
  }

  function handleDeleteLead(id) {
    setLeads(prev => prev.filter(l => l.id !== id))
    setViewing(null)
  }

  async function handleAdvance(lead, newStage) {
    try {
      const updated = await updateLead(lead.id, { stage: newStage })
      handleUpdateLead(updated)
    } catch(e) { alert('Error: ' + e.message) }
  }

  if (loading) return <Spinner message="Loading leads pipeline…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Active Leads',      value: stats.total,     color: '#6366f1' },
          { label: 'Follow-up Overdue', value: stats.overdue,   color: '#ef4444' },
          { label: 'At Enrolled Stage', value: stats.enrolled,  color: '#10b981' },
          { label: 'Converted',         value: stats.converted, color: '#0ea5e9' },
          { label: 'Lost',              value: stats.lost,      color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by name, phone, or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="All">All Sources</option>
          {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="All">All Courses</option>
          {courses.filter(c => c.active).map(c => <option key={c.id}>{c.name}</option>)}
        </select>

        <div className="flex items-center gap-1.5 ml-auto">
          {view === 'pipeline' && (
            <button onClick={() => setShowLost(!showLost)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${showLost ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {showLost ? 'Hide Lost' : 'Show Lost'} ({stats.lost})
            </button>
          )}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('pipeline')} title="Pipeline view"
              className={`px-3 py-2 transition-colors ${view === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setView('list')} title="List view"
              className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <List size={14} />
            </button>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* View */}
      {view === 'pipeline'
        ? <PipelineView leads={filtered} onView={setViewing} onAdvance={handleAdvance} showLost={showLost} />
        : <ListView leads={filtered} onView={setViewing} />
      }

      {/* Modals */}
      {adding && <LeadFormModal onClose={() => setAdding(false)} onSave={handleAddLead} saving={saving} />}
      {viewing && (
        <LeadDetailModal
          lead={viewing}
          onClose={() => setViewing(null)}
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  )
}
