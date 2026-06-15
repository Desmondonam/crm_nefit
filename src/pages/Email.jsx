import { useState, useEffect, useMemo } from 'react'
import {
  Mail, Search, Send, Eye, Users, CheckSquare, Square,
  CheckCircle2, XCircle, ChevronDown, X, AlertCircle, RefreshCw
} from 'lucide-react'
import { getStudents } from '../lib/api'
import { getCourseColor, getInitials } from '../data/mockData'
import { useCourses } from '../context/CoursesContext'
import Spinner, { ErrorMsg } from '../components/Spinner'

const STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold']

// ─── Email Preview ────────────────────────────────────────────────────────────

function EmailPreview({ subject, body, sampleName }) {
  const htmlBody = (body || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
      {/* email chrome */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 space-y-1.5">
        <div className="flex gap-3 text-xs">
          <span className="text-slate-400 w-12 shrink-0">From</span>
          <span className="text-slate-700 font-medium">NextEdge IT Training &lt;info@nextedgeforit.com&gt;</span>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-slate-400 w-12 shrink-0">To</span>
          <span className="text-slate-600">{sampleName} &lt;student@example.com&gt;</span>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-slate-400 w-12 shrink-0">Subject</span>
          <span className="text-slate-800 font-semibold">{subject || '(no subject)'}</span>
        </div>
      </div>

      {/* email body preview */}
      <div className="bg-slate-100 p-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-lg mx-auto">
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '24px 32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>N</div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>NextEdge</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '4px 0 0' }}>IT Training School · Doha, Qatar</p>
          </div>
          <div style={{ padding: '28px 32px 24px', fontFamily: 'system-ui,sans-serif' }}>
            <p style={{ color: '#475569', fontSize: 14, margin: '0 0 16px' }}>
              Dear <strong style={{ color: '#1e293b' }}>{sampleName || 'Student'}</strong>,
            </p>
            <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}
              dangerouslySetInnerHTML={{ __html: htmlBody || '<span style="color:#94a3b8">(message will appear here)</span>' }} />
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 16px' }} />
            <p style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              NextEdge IT Training School · Doha, Qatar<br />
              info@nextedgeforit.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function ResultsPanel({ results, onDone }) {
  const sent   = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{sent.length}</p>
          <p className="text-xs text-emerald-500 mt-1">Emails Sent</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${failed.length > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <p className={`text-3xl font-bold ${failed.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>{failed.length}</p>
          <p className={`text-xs mt-1 ${failed.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>Failed</p>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1.5">
        {results.map(r => (
          <div key={r.email} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            ${r.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {r.success
              ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              : <XCircle     size={14} className="text-red-400     shrink-0" />}
            <span className={`flex-1 truncate ${r.success ? 'text-emerald-700' : 'text-red-600'}`}>
              {r.name} &lt;{r.email}&gt;
            </span>
            {!r.success && r.error && (
              <span className="text-xs text-red-400 truncate max-w-32" title={r.error}>{r.error}</span>
            )}
          </div>
        ))}
      </div>

      <button onClick={onDone}
        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
        Send Another Email
      </button>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ count, subject, onConfirm, onCancel, sending }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={22} className="text-indigo-600" />
        </div>
        <h2 className="font-semibold text-slate-800 text-center mb-1">Send Email?</h2>
        <p className="text-sm text-slate-500 text-center mb-1">
          You're about to send <strong>"{subject}"</strong>
        </p>
        <p className="text-sm text-slate-500 text-center mb-5">
          to <strong className="text-indigo-600">{count} {count === 1 ? 'student' : 'students'}</strong> from <span className="font-medium">info@nextedgeforit.com</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={sending}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={sending}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {sending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {sending ? 'Sending…' : 'Send Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Email Page ──────────────────────────────────────────────────────────

export default function EmailPage() {
  const courses = useCourses()

  const [students,  setStudents]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // recipient filters
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('Active')
  const [filterCourse,  setFilterCourse]  = useState('All')
  const [selected,      setSelected]      = useState(new Set())

  // compose
  const [tab,     setTab]     = useState('compose') // 'compose' | 'preview' | 'results'
  const [subject, setSubject] = useState('')
  const [body,    setBody]    = useState('')

  // send state
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending,     setSending]     = useState(false)
  const [results,     setResults]     = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try { setStudents(await getStudents()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students.filter(s =>
      (filterStatus === 'All' || s.status === filterStatus) &&
      (filterCourse === 'All' || s.course === filterCourse) &&
      (!q || s.name.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
    )
  }, [students, filterStatus, filterCourse, search])

  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id))

  function toggleStudent(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    setSelected(prev => {
      const next = new Set(prev)
      filtered.forEach(s => next.add(s.id))
      return next
    })
  }

  function clearAllFiltered() {
    setSelected(prev => {
      const next = new Set(prev)
      filtered.forEach(s => next.delete(s.id))
      return next
    })
  }

  const selectedStudents = students.filter(s => selected.has(s.id))

  async function handleSend() {
    setSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedStudents.map(s => ({ name: s.name, email: s.email })),
          subject,
          body,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')
      setResults(json.results)
      setTab('results')
    } catch (err) {
      alert(`Failed to send: ${err.message}`)
    } finally {
      setSending(false)
      setShowConfirm(false)
    }
  }

  function resetCompose() {
    setSubject('')
    setBody('')
    setSelected(new Set())
    setResults(null)
    setTab('compose')
  }

  const canSend = selected.size > 0 && subject.trim() && body.trim()
  const sampleStudent = selectedStudents[0]

  if (loading) return <Spinner message="Loading students…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />

  return (
    <div className="space-y-5">
      {/* stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students',  value: students.length,                          color: '#6366f1' },
          { label: 'Active Students', value: students.filter(s => s.status === 'Active').length, color: '#10b981' },
          { label: 'Selected',        value: selected.size,                             color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Recipient Picker ── */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col" style={{ maxHeight: 680 }}>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm mb-3">Select Recipients</p>

            {/* filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                    <option value="All">All Courses</option>
                    {courses.map(c => <option key={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>

              {/* select / clear */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{filtered.length} shown · {selected.size} selected</span>
                <div className="flex gap-2">
                  <button onClick={selectAllFiltered}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Select all
                  </button>
                  {selected.size > 0 && (
                    <button onClick={clearAllFiltered}
                      className="text-xs text-slate-400 hover:text-slate-600">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* student list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-300 text-sm">No students match filters</div>
            ) : filtered.map(s => {
              const isSelected = selected.has(s.id)
              const color = getCourseColor(s.course)
              return (
                <button key={s.id} onClick={() => toggleStudent(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left
                    ${isSelected ? 'bg-indigo-50' : ''}`}>
                  <div className={`shrink-0 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: color }}>
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.email}</p>
                  </div>
                  <span className="text-xs text-slate-300 shrink-0">{s.status}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right: Compose / Preview / Results ── */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col" style={{ maxHeight: 680 }}>

          {/* tab bar */}
          <div className="flex border-b border-slate-100 px-4">
            {tab !== 'results' && (
              <>
                {['compose', 'preview'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors -mb-px
                      ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    {t === 'compose' ? '✏️ Compose' : '👁 Preview'}
                  </button>
                ))}
              </>
            )}
            {tab === 'results' && (
              <div className="px-4 py-3 text-xs font-semibold text-indigo-600 border-b-2 border-indigo-600 -mb-px">
                ✅ Send Results
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === 'results' && results && (
              <ResultsPanel results={results} onDone={resetCompose} />
            )}

            {tab === 'compose' && (
              <div className="space-y-4 h-full flex flex-col">
                {/* selected chips */}
                {selected.size > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudents.slice(0, 6).map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                          style={{ backgroundColor: getCourseColor(s.course) }}>
                          {getInitials(s.name)[0]}
                        </div>
                        {s.name.split(' ')[0]}
                        <button onClick={() => toggleStudent(s.id)} className="text-indigo-300 hover:text-indigo-600"><X size={10} /></button>
                      </span>
                    ))}
                    {selected.size > 6 && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        +{selected.size - 6} more
                      </span>
                    )}
                  </div>
                )}
                {selected.size === 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <AlertCircle size={13} /> Select at least one recipient from the left panel.
                  </div>
                )}

                {/* subject */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Subject *</label>
                  <input
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                    placeholder="e.g. Important update about your course"
                    value={subject} onChange={e => setSubject(e.target.value)} />
                </div>

                {/* body */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Message * <span className="text-slate-400 font-normal">(each email will start with "Dear [Student Name],")</span>
                  </label>
                  <textarea
                    className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-300 leading-relaxed"
                    style={{ minHeight: 220 }}
                    placeholder={`We are pleased to inform you that...\n\nBest regards,\nNextEdge Team`}
                    value={body} onChange={e => setBody(e.target.value)} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    From: <span className="font-medium text-slate-600">info@nextedgeforit.com</span>
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setTab('preview')} disabled={!body.trim() && !subject.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                      <Eye size={13} /> Preview
                    </button>
                    <button onClick={() => setShowConfirm(true)} disabled={!canSend}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white transition-colors disabled:opacity-40"
                      style={{ backgroundColor: canSend ? '#6366f1' : undefined }}>
                      <Send size={13} /> Send to {selected.size || ''} {selected.size === 1 ? 'student' : 'students'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Previewing for: <strong className="text-slate-700">{sampleStudent?.name ?? '(select a student)'}</strong></p>
                  <button onClick={() => setTab('compose')} className="text-xs text-indigo-600 hover:underline">← Edit</button>
                </div>
                <EmailPreview subject={subject} body={body} sampleName={sampleStudent?.name ?? 'Student'} />
                <button onClick={() => setShowConfirm(true)} disabled={!canSend}
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: canSend ? '#6366f1' : '#94a3b8' }}>
                  <Send size={15} /> Send to {selected.size} {selected.size === 1 ? 'student' : 'students'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          count={selected.size}
          subject={subject}
          sending={sending}
          onConfirm={handleSend}
          onCancel={() => !sending && setShowConfirm(false)} />
      )}
    </div>
  )
}
