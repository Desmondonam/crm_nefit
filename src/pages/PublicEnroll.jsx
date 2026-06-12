import { useState } from 'react'
import { CheckCircle2, User, Mail, Phone, MapPin, Calendar, ChevronDown, AlertCircle } from 'lucide-react'
import { enrollStudentPublic } from '../lib/api'

const COURSE_NAME = 'AI for the Future of Work'
const COURSE_ICON = '🤖'
const COURSE_COLOR = '#6366f1'

const SOURCES = [
  'WhatsApp', 'Instagram', 'LinkedIn', 'Facebook',
  'Website', 'Referral / Friend', 'Email', 'Event / Workshop', 'Other',
]

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-indigo-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inp = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 bg-white'
const sel = inp + ' appearance-none cursor-pointer'

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, refId }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-10 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">You're Registered!</h1>
        <p className="text-slate-500 mb-6">
          Welcome, <strong>{name}</strong>! Your enrollment in{' '}
          <span className="font-semibold text-indigo-600">{COURSE_NAME}</span> has been confirmed.
        </p>
        <div className="bg-indigo-50 rounded-2xl p-5 mb-6 text-left space-y-2">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">What happens next?</p>
          <div className="flex items-start gap-3 text-sm text-slate-600">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            Our team will reach out to you within 24 hours with course access details.
          </div>
          <div className="flex items-start gap-3 text-sm text-slate-600">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            You will receive course materials, schedule, and a welcome message.
          </div>
          <div className="flex items-start gap-3 text-sm text-slate-600">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            Join our WhatsApp group to connect with fellow learners.
          </div>
        </div>
        <p className="text-xs text-slate-400">Reference ID: <span className="font-mono font-semibold text-slate-600">NE-{refId}</span></p>
        <p className="text-xs text-slate-400 mt-1">Questions? Email us at <a href="mailto:info@nextedgeforit.com" className="text-indigo-600 hover:underline">info@nextedgeforit.com</a></p>
      </div>
    </div>
  )
}

// ─── Enrollment Form ──────────────────────────────────────────────────────────

export default function PublicEnroll() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    age: '', gender: '', location: '', source: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [success,    setSuccess]    = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim())  return setError('Please enter your full name.')
    if (!form.email.trim()) return setError('Please enter your email address.')
    if (!form.phone.trim()) return setError('Please enter your phone number.')

    setSubmitting(true)
    try {
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim(),
        age:      form.age      ? parseInt(form.age, 10) : null,
        gender:   form.gender   || 'Other',
        location: form.location || null,
        course:   COURSE_NAME,
      }
      const student = await enrollStudentPublic(payload)
      setSuccess({ name: form.name.split(' ')[0], refId: String(student.id).padStart(5, '0') })
    } catch (err) {
      console.error('Enrollment error:', err)
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setError('This email address is already registered for this course.')
      } else {
        setError(`Registration failed: ${err.message}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return <SuccessScreen name={success.name} refId={success.refId} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">N</div>
            <span className="text-xl font-bold text-slate-800">NextEdge</span>
          </div>
          <p className="text-sm text-slate-500">IT Training School · Doha, Qatar</p>
        </div>

        {/* Course banner */}
        <div className="rounded-3xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-end pr-6 leading-none select-none">🤖</div>
          <div className="relative">
            <span className="inline-block text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              Free Course · Limited Seats
            </span>
            <h1 className="text-2xl font-bold leading-tight mb-2">{COURSE_NAME}</h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Discover how artificial intelligence is reshaping every industry — and how you can stay ahead. No prior tech experience required.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-indigo-100">
                <span className="text-base">🕒</span> Flexible schedule
              </span>
              <span className="flex items-center gap-1.5 text-indigo-100">
                <span className="text-base">🎓</span> Certificate included
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 font-bold text-white">
                FREE
              </span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Register Your Spot</h2>
          <p className="text-sm text-slate-400 mb-6">Fill in the form below to secure your enrollment.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal details */}
            <Field label="Full Name" required>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input className={inp + ' pl-10'} placeholder="e.g. Ahmed Al-Farsi"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" required>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input className={inp + ' pl-10'} type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </Field>

              <Field label="Phone Number" required hint="Include country code, e.g. +974">
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input className={inp + ' pl-10'} placeholder="+974 3XXX XXXX"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Age">
                <div className="relative">
                  <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input className={inp + ' pl-10'} type="number" min="15" max="80" placeholder="25"
                    value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
              </Field>

              <Field label="Gender">
                <div className="relative">
                  <select className={sel} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select…</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </Field>

              <Field label="Location">
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input className={inp + ' pl-10'} placeholder="e.g. Doha"
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </Field>
            </div>

            <Field label="How did you hear about this course?">
              <div className="relative">
                <select className={sel} value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="">Select…</option>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </Field>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              {submitting
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering…</span>
                : 'Register for Free →'
              }
            </button>

            <p className="text-xs text-center text-slate-400">
              By registering, you agree to be contacted by NextEdge about this course.
              <br />Your data is kept private and never shared.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already enrolled or have questions?{' '}
          <a href="mailto:info@nextedgeforit.com" className="text-indigo-600 hover:underline">info@nextedgeforit.com</a>
        </p>
      </div>
    </div>
  )
}
