import { useState } from 'react'
import { Plus, X, Pencil, Trash2, BookOpen, Clock, User, AlertCircle } from 'lucide-react'
import { createCourse, updateCourse, deleteCourse } from '../lib/api'
import { useCoursesContext } from '../context/CoursesContext'
import { QAR } from '../data/financeData'

// ─── constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#f97316', '#ec4899',
  '#06b6d4', '#84cc16', '#14b8a6', '#a855f7',
]

const PRESET_ICONS = [
  '💻', '🌐', '📊', '🔐', '☁️', '🎨',
  '📱', '🎯', '🔧', '📈', '🤖', '🛡️',
  '🌟', '💡', '🔬', '📐', '🧠', '✏️',
]

// ─── Course Form Modal ────────────────────────────────────────────────────────

const EMPTY = { name: '', icon: '💻', color: '#6366f1', duration: '', instructor: '', fee: '', active: true }

function CourseModal({ course, onClose, onSave, saving }) {
  const [form,   setForm]   = useState(course ? { ...course, fee: course.fee ?? '' } : { ...EMPTY })
  const [errors, setErrors] = useState({})

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function handleSave(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim())          errs.name = 'Course name is required'
    if (!form.fee || Number(form.fee) < 0) errs.fee  = 'Enter a valid fee'
    if (Object.keys(errs).length)  { setErrors(errs); return }
    onSave({ ...form, fee: Number(form.fee), name: form.name.trim() })
  }

  const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: form.color + '20' }}>
              {form.icon}
            </div>
            <h2 className="font-semibold text-slate-800">{course ? 'Edit Course' : 'Add New Course'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Course Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Machine Learning" />
            {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Icon</label>
            <div className="flex items-center gap-3 mb-2">
              <input className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={2} />
              <span className="text-xs text-slate-400">or pick a preset:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => set('icon', ic)}
                  className={`w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-all border-2 ${form.icon === ic ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(col => (
                <button key={col} type="button" onClick={() => set('color', col)}
                  className={`w-8 h-8 rounded-full transition-all border-2 ${form.color === col ? 'scale-110 border-slate-700' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: col }} />
              ))}
            </div>
          </div>

          {/* Duration + Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
              <input className={inp} value={form.duration} onChange={e => set('duration', e.target.value)}
                placeholder="e.g. 6 months" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Instructor</label>
              <input className={inp} value={form.instructor || ''} onChange={e => set('instructor', e.target.value)}
                placeholder="Instructor name" />
            </div>
          </div>

          {/* Fee */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Course Fee (QAR) *</label>
            <input className={inp} type="number" min="0" value={form.fee}
              onChange={e => set('fee', e.target.value)} placeholder="e.g. 5000" />
            {errors.fee && <p className="text-red-500 text-xs mt-0.5">{errors.fee}</p>}
          </div>

          {/* Active toggle (edit only) */}
          {course && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => set('active', !form.active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700">{form.active ? 'Active' : 'Inactive'}</span>
            </label>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              {course ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ course, onClose, onConfirm, saving }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl"
          style={{ backgroundColor: course.color + '20' }}>
          {course.icon}
        </div>
        <h2 className="font-semibold text-slate-800 mb-1">Delete Course</h2>
        <p className="text-slate-500 text-sm mb-1">
          Delete <strong>{course.name}</strong>?
        </p>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5 text-xs text-amber-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          Existing students enrolled in this course will keep their record but the course won't appear in dropdowns.
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onConfirm} disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2">
            {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${course.active ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
      {/* Color accent header */}
      <div className="h-2" style={{ backgroundColor: course.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: course.color + '15' }}>
              {course.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{course.name}</h3>
              {!course.active && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inactive</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(course)} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(course)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {course.duration && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock size={13} className="text-slate-300 shrink-0" />
              {course.duration}
            </div>
          )}
          {course.instructor && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User size={13} className="text-slate-300 shrink-0" />
              {course.instructor}
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-slate-300 shrink-0" />
            <span className="text-sm font-bold" style={{ color: course.color }}>{QAR(course.fee)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Courses() {
  const { courses, reloadCourses } = useCoursesContext()
  const [adding,   setAdding]   = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving,   setSaving]   = useState(false)

  async function handleSave(data) {
    setSaving(true)
    try {
      if (editing) {
        await updateCourse(editing.id, data)
      } else {
        await createCourse(data)
      }
      reloadCourses()
      setAdding(false); setEditing(null)
    } catch(e) {
      alert('Error saving course: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteCourse(deleting.id)
      reloadCourses()
      setDeleting(null)
    } catch(e) {
      alert('Error deleting course: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const active   = courses.filter(c => c.active)
  const inactive = courses.filter(c => !c.active)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-indigo-600">{courses.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Courses</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-green-600">{active.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-400">{inactive.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Inactive</p>
        </div>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">All courses available at NextEdge — add new ones as your offering grows.</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shrink-0">
          <Plus size={15} /> Add Course
        </button>
      </div>

      {/* Courses grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No courses yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Course" to create your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard key={course.id} course={course}
              onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* Modals */}
      {(adding || editing) && (
        <CourseModal
          course={editing}
          onClose={() => { setAdding(false); setEditing(null) }}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {deleting && (
        <DeleteConfirm
          course={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          saving={saving}
        />
      )}
    </div>
  )
}
