import { useState, useEffect, useCallback } from 'react'
import {
  Plus, X, Search, Phone, Mail, Globe, MapPin, Calendar, User,
  Building2, FileText, MessageCircle, Pencil, Trash2, LayoutGrid,
  List, Clock, ChevronRight, Activity, Briefcase, Users, DollarSign,
  Link2, Filter
} from 'lucide-react'
import {
  getCompanies, createCompany, updateCompany, deleteCompany,
  getCompanyActivities, createCompanyActivity,
} from '../lib/api'
import {
  B2B_STAGES, B2B_LOST, ALL_B2B_STAGES, COMPANY_INDUSTRIES, COMPANY_SIZES,
  COMPANY_SOURCES, COMPANY_LOST_REASONS, COMPANY_ACTIVITY_TYPES, getB2bStageInfo,
} from '../data/companiesData'
import Spinner, { ErrorMsg } from '../components/Spinner'

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(dateStr) {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function followUpStatus(dateStr) {
  if (!dateStr) return null
  const d     = new Date(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff  = Math.floor((d - today) / 86400000)
  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444', bg: '#fee2e2' }
  if (diff === 0) return { label: 'Today',       color: '#f59e0b', bg: '#fef3c7' }
  if (diff <= 3)  return { label: `In ${diff}d`, color: '#0ea5e9', bg: '#e0f2fe' }
  return { label: dateStr, color: '#94a3b8', bg: '#f1f5f9' }
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function QAR(n) {
  return `QAR ${Number(n || 0).toLocaleString('en-US')}`
}

const ACT_ICONS  = { Call: Phone, Email: Mail, Meeting: Users, LinkedIn: Link2, Proposal: FileText, Note: FileText }
const ACT_COLORS = { Call: '#0ea5e9', Email: '#6366f1', Meeting: '#f59e0b', LinkedIn: '#0077b5', Proposal: '#f97316', Note: '#94a3b8' }

const INDUSTRY_COLORS = {
  'Technology': '#6366f1', 'Finance & Banking': '#0ea5e9', 'Healthcare': '#10b981',
  'Education': '#f59e0b', 'Government & Public Sector': '#8b5cf6', 'Oil & Gas': '#f97316',
  'Construction & Real Estate': '#84cc16', 'Retail & E-commerce': '#ec4899',
  'Hospitality & Tourism': '#06b6d4', 'Logistics & Transport': '#a855f7',
  'Manufacturing': '#14b8a6', 'Media & Telecommunications': '#ef4444',
  'Legal & Consulting': '#64748b', 'Other': '#94a3b8',
}
function industryColor(ind) { return INDUSTRY_COLORS[ind] ?? '#6366f1' }

// ─── Stage Stepper ────────────────────────────────────────────────────────────

function StageStepper({ currentStage, onSelect }) {
  const currentIdx = B2B_STAGES.findIndex(s => s.key === currentStage)
  return (
    <div className="flex items-start gap-0">
      {B2B_STAGES.map((stage, i) => {
        const isPast    = i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture  = i > currentIdx
        return (
          <button key={stage.key} onClick={() => onSelect(stage.key)}
            className="flex flex-col items-center gap-1 group"
            style={{ flex: 1 }}>
            <div className="relative w-full flex items-center">
              {i > 0 && (
                <div className="h-0.5 flex-1" style={{ backgroundColor: isPast || isCurrent ? stage.color : '#e2e8f0' }} />
              )}
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all
                ${isCurrent ? 'scale-110 shadow-md' : 'group-hover:scale-105'}`}
                style={{
                  borderColor: isFuture ? '#e2e8f0' : stage.color,
                  backgroundColor: isCurrent ? stage.color : isPast ? stage.color + '22' : '#fff',
                  color: isCurrent ? '#fff' : isPast ? stage.color : '#94a3b8',
                }}>
                {isPast ? '✓' : i + 1}
              </div>
              {i < B2B_STAGES.length - 1 && (
                <div className="h-0.5 flex-1" style={{ backgroundColor: isPast ? B2B_STAGES[i + 1]?.color : '#e2e8f0' }} />
              )}
            </div>
            <span className={`text-center leading-tight px-0.5 hidden sm:block
              ${isCurrent ? 'font-semibold' : 'font-normal text-slate-400'}`}
              style={{ fontSize: 10, color: isCurrent ? stage.color : undefined }}>
              {stage.key}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, onEdit, onDelete, onOpen, onAdvance }) {
  const stage   = getB2bStageInfo(company.stage)
  const fu      = followUpStatus(company.next_follow_up)
  const days    = daysAgo(company.updated_at)
  const isWon   = company.stage === 'Contract Signed'
  const isLost  = company.stage === 'Lost'
  const nextIdx = B2B_STAGES.findIndex(s => s.key === company.stage) + 1
  const nextStage = nextIdx < B2B_STAGES.length ? B2B_STAGES[nextIdx] : null
  const icolor  = industryColor(company.industry)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(company)}>
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: icolor }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: icolor }}>
              {initials(company.name)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">{company.name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Briefcase size={10} /> {company.industry}
              </p>
            </div>
          </div>
          {isWon && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">Won</span>
          )}
          {isLost && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 shrink-0">Lost</span>
          )}
        </div>

        {company.contact_name && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <User size={10} className="shrink-0" />
            {company.contact_name}{company.contact_role ? ` · ${company.contact_role}` : ''}
          </p>
        )}
        {company.size && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <Users size={10} /> {company.size} employees
          </p>
        )}
        {company.deal_value > 0 && (
          <p className="text-xs font-semibold mt-1" style={{ color: icolor }}>
            {QAR(company.deal_value)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {fu && (
            <span className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: fu.bg, color: fu.color }}>
              <Calendar size={9} /> {fu.label}
            </span>
          )}
          {days >= 7 && !isWon && !isLost && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
              {days}d stale
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50" onClick={e => e.stopPropagation()}>
          {nextStage && !isWon && !isLost && (
            <button onClick={() => onAdvance(company, nextStage.key)}
              className="flex-1 text-xs font-medium py-1 rounded-lg flex items-center justify-center gap-1 transition-colors hover:opacity-90"
              style={{ backgroundColor: nextStage.color + '18', color: nextStage.color }}>
              → {nextStage.key} <ChevronRight size={11} />
            </button>
          )}
          <button onClick={() => onEdit(company)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(company)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Company Form Modal ───────────────────────────────────────────────────────

function CompanyFormModal({ company, onClose, onSave }) {
  const isEdit = !!company?.id
  const [form, setForm] = useState({
    name: '', industry: 'Technology', size: '11–50', website: '', location: '',
    contact_name: '', contact_role: '', contact_email: '', contact_phone: '',
    source: 'LinkedIn', stage: 'Identified', assigned_to: '', next_follow_up: '',
    notes: '', training_interest: '', deal_value: '',
    ...company,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) return alert('Company name is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        deal_value: form.deal_value === '' ? null : Number(form.deal_value),
        next_follow_up: form.next_follow_up || null,
      }
      const saved = isEdit
        ? await updateCompany(company.id, payload)
        : await createCompany(payload)
      onSave(saved, isEdit)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function Field({ label, children }) {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        {children}
      </div>
    )
  }
  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const sel = inp + ' bg-white'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{isEdit ? 'Edit Company' : 'Add Company'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *">
              <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Qatar Petroleum" />
            </Field>
            <Field label="Industry">
              <select className={sel} value={form.industry} onChange={e => set('industry', e.target.value)}>
                {COMPANY_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Company Size">
              <select className={sel} value={form.size} onChange={e => set('size', e.target.value)}>
                {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Doha, Qatar" />
            </Field>
            <Field label="Website">
              <input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="How Did You Find Them">
              <select className={sel} value={form.source} onChange={e => set('source', e.target.value)}>
                {COMPANY_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Primary Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name">
                <input className={inp} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Role / Title">
                <input className={inp} value={form.contact_role} onChange={e => set('contact_role', e.target.value)} placeholder="e.g. HR Manager" />
              </Field>
              <Field label="Email">
                <input className={inp} type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className={inp} value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Deal Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Training Interest">
                <input className={inp} value={form.training_interest} onChange={e => set('training_interest', e.target.value)} placeholder="e.g. Cloud Computing for 20 staff" />
              </Field>
              <Field label="Estimated Deal Value (QAR)">
                <input className={inp} type="number" min="0" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Pipeline Stage">
                <select className={sel} value={form.stage} onChange={e => set('stage', e.target.value)}>
                  {ALL_B2B_STAGES.map(s => <option key={s.key}>{s.key}</option>)}
                </select>
              </Field>
              <Field label="Assigned To">
                <input className={inp} value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Team member name" />
              </Field>
              <Field label="Next Follow-Up">
                <input className={inp} type="date" value={form.next_follow_up ?? ''} onChange={e => set('next_follow_up', e.target.value)} />
              </Field>
            </div>
          </div>

          <Field label="Notes">
            <textarea className={inp + ' resize-none'} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional context..." />
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Company'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Log Activity Modal ───────────────────────────────────────────────────────

function LogActivityModal({ company, onClose, onLogged }) {
  const [type,  setType]  = useState('Note')
  const [title, setTitle] = useState('')
  const [desc,  setDesc]  = useState('')
  const [saving, setSaving] = useState(false)

  async function handleLog() {
    if (!title.trim()) return alert('Title is required')
    setSaving(true)
    try {
      await createCompanyActivity({ company_id: company.id, type, title, description: desc })
      onLogged()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Log Activity — {company.name}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Activity Type</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_ACTIVITY_TYPES.map(t => (
                <button key={t.key} onClick={() => setType(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${type === t.key ? 'text-white border-transparent' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  style={type === t.key ? { backgroundColor: t.color } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Details</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Additional notes…" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleLog} disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Logging…' : 'Log Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Lost Modal ───────────────────────────────────────────────────────────────

function LostModal({ company, onClose, onConfirm }) {
  const [reason, setReason] = useState(COMPANY_LOST_REASONS[0])
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    try {
      const updated = await updateCompany(company.id, { stage: 'Lost', lost_reason: reason })
      await createCompanyActivity({
        company_id: company.id,
        type: 'Note',
        title: 'Marked as Lost',
        description: `Reason: ${reason}`,
      })
      onConfirm(updated)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Mark as Lost</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-600">Why is <strong>{company.name}</strong> being marked as lost?</p>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={reason} onChange={e => setReason(e.target.value)}>
            {COMPANY_LOST_REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleConfirm} disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
            {saving ? 'Saving…' : 'Mark Lost'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Company Detail Modal ─────────────────────────────────────────────────────

function CompanyDetailModal({ company: initialCompany, onClose, onUpdate }) {
  const [company,    setCompany]    = useState(initialCompany)
  const [activities, setActivities] = useState([])
  const [loadingAct, setLoadingAct] = useState(true)
  const [showLog,    setShowLog]    = useState(false)
  const [showLost,   setShowLost]   = useState(false)

  const stage   = getB2bStageInfo(company.stage)
  const fu      = followUpStatus(company.next_follow_up)
  const icolor  = industryColor(company.industry)
  const isWon   = company.stage === 'Contract Signed'
  const isLost  = company.stage === 'Lost'

  const loadActivities = useCallback(() => {
    setLoadingAct(true)
    getCompanyActivities(company.id)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoadingAct(false))
  }, [company.id])

  useEffect(() => { loadActivities() }, [loadActivities])

  async function handleStageChange(newStage) {
    try {
      const updated = await updateCompany(company.id, { stage: newStage })
      await createCompanyActivity({
        company_id: company.id,
        type: 'Note',
        title: `Stage → ${newStage}`,
        description: `Moved from ${company.stage}`,
      })
      setCompany(updated)
      onUpdate(updated)
      loadActivities()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: icolor }}>
              {initials(company.name)}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{company.name}</h2>
              <p className="text-xs text-slate-400">{company.industry} · {company.size} employees</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isWon && !isLost && (
              <button onClick={() => setShowLost(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                Mark Lost
              </button>
            )}
            <button onClick={() => setShowLog(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              + Log Activity
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
          </div>
        </div>

        {/* stage stepper */}
        <div className="px-6 pt-4 pb-2">
          <StageStepper currentStage={company.stage} onSelect={handleStageChange} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* left panel */}
          <div className="w-72 shrink-0 border-r border-slate-100 overflow-y-auto p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Stage</p>
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: stage.bg, color: stage.color }}>
                {company.stage}
              </span>
            </div>

            {company.deal_value > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Deal Value</p>
                <p className="text-lg font-bold" style={{ color: icolor }}>{QAR(company.deal_value)}</p>
              </div>
            )}

            {company.training_interest && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Training Interest</p>
                <p className="text-sm text-slate-700">{company.training_interest}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contact</p>
              {company.contact_name && (
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <User size={12} className="text-slate-400" /> {company.contact_name}
                  {company.contact_role && <span className="text-xs text-slate-400">· {company.contact_role}</span>}
                </p>
              )}
              {company.contact_email && (
                <a href={`mailto:${company.contact_email}`}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1.5 mt-1"
                  onClick={e => e.stopPropagation()}>
                  <Mail size={11} /> {company.contact_email}
                </a>
              )}
              {company.contact_phone && (
                <a href={`tel:${company.contact_phone}`}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 mt-1"
                  onClick={e => e.stopPropagation()}>
                  <Phone size={11} /> {company.contact_phone}
                </a>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Company Info</p>
              {company.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><MapPin size={11} /> {company.location}</p>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1.5 mb-1"
                  onClick={e => e.stopPropagation()}>
                  <Globe size={11} /> {company.website}
                </a>
              )}
              <p className="text-xs text-slate-400">Source: {company.source}</p>
              {company.assigned_to && <p className="text-xs text-slate-400 mt-1">Assigned: {company.assigned_to}</p>}
            </div>

            {fu && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Follow-Up</p>
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                  style={{ backgroundColor: fu.bg, color: fu.color }}>
                  <Calendar size={10} /> {fu.label}
                </span>
              </div>
            )}

            {company.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-xs text-slate-600 leading-relaxed">{company.notes}</p>
              </div>
            )}

            {isLost && company.lost_reason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-500 mb-1">Lost Reason</p>
                <p className="text-xs text-red-600">{company.lost_reason}</p>
              </div>
            )}
          </div>

          {/* right panel — activity timeline */}
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Activity Timeline</p>
            {loadingAct ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-slate-400">No activities yet. Log the first one!</p>
            ) : (
              <div className="space-y-3">
                {activities.map(act => {
                  const Icon  = ACT_ICONS[act.type]  ?? FileText
                  const color = ACT_COLORS[act.type] ?? '#94a3b8'
                  return (
                    <div key={act.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: color + '18' }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-700">{act.title}</p>
                          <p className="text-xs text-slate-400 shrink-0">
                            {new Date(act.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                        {act.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.description}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showLog && (
        <LogActivityModal company={company} onClose={() => setShowLog(false)}
          onLogged={() => { setShowLog(false); loadActivities() }} />
      )}
      {showLost && (
        <LostModal company={company} onClose={() => setShowLost(false)}
          onConfirm={updated => { setCompany(updated); onUpdate(updated); setShowLost(false) }} />
      )}
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ company, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  async function handleDelete() {
    setDeleting(true)
    try { await deleteCompany(company.id); onConfirm(company.id) }
    catch (e) { alert(e.message); setDeleting(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-2">Delete Company?</h2>
        <p className="text-sm text-slate-500 mb-5">
          <strong>{company.name}</strong> and all its activity history will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline (Kanban) View ───────────────────────────────────────────────────

function PipelineView({ companies, onEdit, onDelete, onOpen, onAdvance, showLost }) {
  const stages = showLost ? ALL_B2B_STAGES : B2B_STAGES
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map(stage => {
        const cols = companies.filter(c => c.stage === stage.key)
        const totalValue = cols.reduce((sum, c) => sum + (Number(c.deal_value) || 0), 0)
        return (
          <div key={stage.key} className="shrink-0 w-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-xs font-semibold text-slate-700">{stage.key}</span>
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5 font-medium">{cols.length}</span>
              </div>
              {totalValue > 0 && (
                <span className="text-xs text-slate-400">{QAR(totalValue)}</span>
              )}
            </div>
            <div className="space-y-3">
              {cols.map(c => (
                <CompanyCard key={c.id} company={c}
                  onEdit={onEdit} onDelete={onDelete} onOpen={onOpen} onAdvance={onAdvance} />
              ))}
              {cols.length === 0 && (
                <div className="border-2 border-dashed border-slate-100 rounded-xl p-4 text-center text-xs text-slate-300">
                  No companies
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ companies, onEdit, onDelete, onOpen }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Company</th>
              <th className="px-4 py-3 text-left font-medium">Industry</th>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
              <th className="px-4 py-3 text-left font-medium">Stage</th>
              <th className="px-4 py-3 text-left font-medium">Deal Value</th>
              <th className="px-4 py-3 text-left font-medium">Follow-Up</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {companies.map(c => {
              const stage  = getB2bStageInfo(c.stage)
              const fu     = followUpStatus(c.next_follow_up)
              const icolor = industryColor(c.industry)
              return (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpen(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: icolor }}>
                        {initials(c.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.name}</p>
                        {c.size && <p className="text-xs text-slate-400">{c.size} employees</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.industry}</td>
                  <td className="px-4 py-3">
                    {c.contact_name ? (
                      <div>
                        <p className="text-slate-700">{c.contact_name}</p>
                        {c.contact_role && <p className="text-xs text-slate-400">{c.contact_role}</p>}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: stage.bg, color: stage.color }}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.deal_value > 0
                      ? <span className="font-medium text-slate-700">{QAR(c.deal_value)}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {fu ? (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: fu.bg, color: fu.color }}>
                        {fu.label}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.source}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDelete(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {companies.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">No companies match your filters.</div>
        )}
      </div>
    </div>
  )
}

// ─── Main Companies Component ─────────────────────────────────────────────────

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const [search,     setSearch]     = useState('')
  const [filterInd,  setFilterInd]  = useState('All')
  const [filterStage,setFilterStage]= useState('All')
  const [viewMode,   setViewMode]   = useState('kanban')
  const [showLost,   setShowLost]   = useState(false)

  const [formTarget,   setFormTarget]   = useState(null)
  const [showForm,     setShowForm]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try { setCompanies(await getCompanies()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function handleSave(saved, isEdit) {
    setCompanies(prev => isEdit ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev])
    setShowForm(false)
    setFormTarget(null)
  }

  function handleUpdate(updated) {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  function handleDelete(id) {
    setCompanies(prev => prev.filter(c => c.id !== id))
    setDeleteTarget(null)
  }

  async function handleAdvance(company, nextStage) {
    try {
      const updated = await updateCompany(company.id, { stage: nextStage })
      setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <Spinner message="Loading companies…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    return (
      (!q || c.name.toLowerCase().includes(q) || c.contact_name?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)) &&
      (filterInd === 'All' || c.industry === filterInd) &&
      (filterStage === 'All' || c.stage === filterStage) &&
      (showLost || c.stage !== 'Lost')
    )
  })

  const active    = companies.filter(c => c.stage !== 'Lost' && c.stage !== 'Contract Signed')
  const won       = companies.filter(c => c.stage === 'Contract Signed')
  const lost      = companies.filter(c => c.stage === 'Lost')
  const totalPipe = active.reduce((sum, c) => sum + (Number(c.deal_value) || 0), 0)

  const stats = [
    { label: 'Total Companies',   value: companies.length, color: '#6366f1', icon: Building2 },
    { label: 'Active Pipeline',   value: active.length,    color: '#0ea5e9', icon: Activity  },
    { label: 'Contracts Signed',  value: won.length,       color: '#10b981', icon: Briefcase },
    { label: 'Pipeline Value',    value: QAR(totalPipe),   color: '#f59e0b', icon: DollarSign, small: true },
  ]

  return (
    <div className="space-y-5">
      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className={`font-bold text-slate-800 ${s.small ? 'text-base' : 'text-2xl'}`}>{s.value}</p>
              <p className="text-xs text-slate-400 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
          value={filterInd} onChange={e => setFilterInd(e.target.value)}>
          <option value="All">All Industries</option>
          {COMPANY_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
        </select>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
          value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="All">All Stages</option>
          {ALL_B2B_STAGES.map(s => <option key={s.key}>{s.key}</option>)}
        </select>
        <button onClick={() => setShowLost(v => !v)}
          className={`py-2 px-3 rounded-lg text-sm border transition-colors ${showLost ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
          {showLost ? 'Hide Lost' : 'Show Lost'}
        </button>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setViewMode('kanban')}
            className={`px-3 py-2 transition-colors ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <List size={15} />
          </button>
        </div>
        <button onClick={() => { setFormTarget(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 ml-auto">
          <Plus size={15} /> Add Company
        </button>
      </div>

      {/* view */}
      {viewMode === 'kanban' ? (
        <PipelineView companies={filtered}
          onEdit={c => { setFormTarget(c); setShowForm(true) }}
          onDelete={c => setDeleteTarget(c)}
          onOpen={c => setDetailTarget(c)}
          onAdvance={handleAdvance}
          showLost={showLost} />
      ) : (
        <ListView companies={filtered}
          onEdit={c => { setFormTarget(c); setShowForm(true) }}
          onDelete={c => setDeleteTarget(c)}
          onOpen={c => setDetailTarget(c)} />
      )}

      {showForm && (
        <CompanyFormModal company={formTarget} onClose={() => { setShowForm(false); setFormTarget(null) }} onSave={handleSave} />
      )}
      {deleteTarget && (
        <DeleteConfirm company={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
      {detailTarget && (
        <CompanyDetailModal
          company={companies.find(c => c.id === detailTarget.id) ?? detailTarget}
          onClose={() => setDetailTarget(null)}
          onUpdate={updated => { handleUpdate(updated); setDetailTarget(updated) }} />
      )}
    </div>
  )
}
