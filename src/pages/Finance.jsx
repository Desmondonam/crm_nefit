import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, AlertCircle,
  Plus, Pencil, Trash2, X, Search, Filter, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import {
  QAR, COURSE_FEES, EXPENSE_CATEGORIES,
  PAYMENT_STATUS_COLORS, EXPENSE_CATEGORY_COLORS
} from '../data/financeData'
import { COURSES, getCourseColor, getInitials } from '../data/mockData'
import {
  getStudents, getStudentPayments, recordPayment,
  getExpenses, createExpense, updateExpense, deleteExpense
} from '../lib/api'
import Spinner, { ErrorMsg } from '../components/Spinner'

// ─── helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const c = PAYMENT_STATUS_COLORS[status] ?? { bg: '#f1f5f9', text: '#64748b' }
  const icons = { Paid: CheckCircle2, Partial: Clock, Unpaid: XCircle }
  const Icon  = icons[status] ?? CheckCircle2
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>
      <Icon size={11} /> {status}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm border border-slate-100">
      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {QAR(p.value)}</p>)}
    </div>
  )
}

// ─── Expense Modal ───────────────────────────────────────────────────────────

const EMPTY_EXPENSE = { category: 'Salaries', description: '', amount: '', date: '', recurring: false }

function ExpenseModal({ expense, onClose, onSave, saving }) {
  const [form,   setForm]   = useState(expense ? { ...expense } : { ...EMPTY_EXPENSE })
  const [errors, setErrors] = useState({})
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function handleSave(e) {
    e.preventDefault()
    const errs = {}
    if (!form.description.trim()) errs.description = 'Required'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount'
    if (!form.date) errs.date = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, amount: Number(form.amount) })
  }

  const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <input className={inp} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Office Rent — June 2024" />
            {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (QAR) *</label>
              <input className={inp} type="number" min="1" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
              {errors.amount && <p className="text-red-500 text-xs mt-0.5">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input className={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              {errors.date && <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={form.recurring} onChange={e => set('recurring', e.target.checked)} />
            Recurring monthly expense
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              {expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Payment Modal ───────────────────────────────────────────────────────────

function PaymentModal({ record, student, onClose, onSave, saving }) {
  const courseFee = COURSE_FEES[student?.course] ?? 0
  const balance   = courseFee - Number(record.amount_paid)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Bank Transfer')
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0])
  const [error,  setError]  = useState('')

  function handleSave(e) {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0)   { setError('Enter a valid amount'); return }
    if (amt > balance)      { setError(`Max: ${QAR(balance)}`); return }
    onSave(record.id, { amountToAdd: amt, method, date, courseFee })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Record Payment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm font-medium text-slate-700">{student?.name}</p>
          <p className="text-xs text-slate-400 mb-3">{student?.course}</p>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1 mb-4">
            <div className="flex justify-between"><span>Course Fee</span><span className="font-medium">{QAR(courseFee)}</span></div>
            <div className="flex justify-between"><span>Already Paid</span><span className="font-medium text-green-600">{QAR(record.amount_paid)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-1 mt-1"><span>Outstanding</span><span className="font-semibold text-red-600">{QAR(balance)}</span></div>
          </div>
        </div>
        <form onSubmit={handleSave} className="px-6 pb-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (QAR) *</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="number" min="1" max={balance} value={amount}
              onChange={e => { setAmount(e.target.value); setError('') }}
              placeholder={`Max: ${QAR(balance)}`}
            />
            {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={method} onChange={e => setMethod(e.target.value)}>
                <option>Bank Transfer</option><option>Cash</option><option>Card</option><option>Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center gap-2">
              {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function Overview({ payments, students, expenses }) {
  const totalRevenue     = payments.reduce((s, p) => s + Number(p.amount_paid), 0)
  const totalFees        = students.reduce((s, st) => s + (COURSE_FEES[st.course] ?? 0), 0)
  const totalOutstanding = totalFees - totalRevenue
  const totalExpenses    = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit        = totalRevenue - totalExpenses

  // Monthly chart from real data
  const monthlyIncome = {}
  payments.forEach(p => {
    if (!p.payment_date || !p.amount_paid) return
    const d   = new Date(p.payment_date)
    const key = `${d.toLocaleString('default', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`
    monthlyIncome[key] = (monthlyIncome[key] || 0) + Number(p.amount_paid)
  })
  const monthlyExp = {}
  expenses.forEach(e => {
    const d   = new Date(e.date)
    const key = `${d.toLocaleString('default', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`
    monthlyExp[key] = (monthlyExp[key] || 0) + Number(e.amount)
  })
  const allMonths   = [...new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExp)])]
    .sort((a, b) => new Date('1 ' + a) - new Date('1 ' + b))
  const chartData   = allMonths.map(m => ({ month: m, income: monthlyIncome[m] || 0, expenses: monthlyExp[m] || 0 }))

  const catTotals = EXPENSE_CATEGORIES.map(cat => ({
    name: cat, value: expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
    color: EXPENSE_CATEGORY_COLORS[cat],
  })).filter(c => c.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}   label="Total Revenue Collected" value={QAR(totalRevenue)}      color="#10b981" sub={`${payments.filter(p=>p.status==='Paid').length} fully paid`}           />
        <StatCard icon={AlertCircle}  label="Outstanding Balance"      value={QAR(totalOutstanding)}  color="#ef4444" sub={`${payments.filter(p=>p.status==='Unpaid').length} unpaid + ${payments.filter(p=>p.status==='Partial').length} partial`} />
        <StatCard icon={TrendingDown} label="Total Expenses"           value={QAR(totalExpenses)}     color="#f59e0b" sub="All recorded operational costs"                                           />
        <StatCard icon={Wallet}       label="Net Position"             value={QAR(Math.abs(netProfit))} color={netProfit >= 0 ? '#6366f1' : '#ef4444'} sub={netProfit >= 0 ? 'Surplus' : 'Deficit'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Revenue vs Expenses</h3>
          <p className="text-slate-400 text-xs mb-4">Monthly income and operational costs (QAR)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Expense Breakdown</h3>
          <p className="text-slate-400 text-xs mb-4">By category</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catTotals} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {catTotals.map(c => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [QAR(v), n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {catTotals.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </span>
                <span className="font-medium text-slate-700">{QAR(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Paid in Full',     count: payments.filter(p=>p.status==='Paid').length,    color: '#10b981', amount: payments.filter(p=>p.status==='Paid').reduce((s,p)=>s+Number(p.amount_paid),0) },
          { label: 'Partial Payments', count: payments.filter(p=>p.status==='Partial').length, color: '#ca8a04', amount: payments.filter(p=>p.status==='Partial').reduce((s,p)=>s+Number(p.amount_paid),0) },
          { label: 'No Payment Yet',   count: payments.filter(p=>p.status==='Unpaid').length,  color: '#dc2626', amount: 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            {s.amount > 0 && <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{QAR(s.amount)} collected</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Student Payments ───────────────────────────────────────────────────

function StudentPayments({ payments, setPayments, students }) {
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [recording,    setRecording]    = useState(null)
  const [saving,       setSaving]       = useState(false)

  const rows = useMemo(() => {
    return payments
      .map(p => {
        const student   = students.find(s => s.id === p.student_id)
        const courseFee = COURSE_FEES[student?.course] ?? 0
        const balance   = courseFee - Number(p.amount_paid)
        return { ...p, student, courseFee, balance }
      })
      .filter(r => {
        const q = search.toLowerCase()
        return (
          (!q || r.student?.name.toLowerCase().includes(q) || r.student?.course.toLowerCase().includes(q)) &&
          (filterStatus === 'All' || r.status === filterStatus)
        )
      })
  }, [payments, students, search, filterStatus])

  async function handlePaymentSaved(paymentId, args) {
    setSaving(true)
    try {
      const updated = await recordPayment(paymentId, args)
      setPayments(prev => prev.map(p => p.id === paymentId ? updated : p))
      setRecording(null)
    } catch (e) {
      alert('Error recording payment: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by student name or course…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          {['All','Paid','Partial','Unpaid'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus===s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">{rows.length} records</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className={thClass}>Student</th>
                <th className={thClass}>Course</th>
                <th className={thClass}>Course Fee</th>
                <th className={thClass}>Paid</th>
                <th className={thClass}>Balance</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Last Payment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No records match your filters.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: getCourseColor(r.student?.course) }}>
                        {getInitials(r.student?.name ?? '?')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.student?.name}</p>
                        <p className="text-xs text-slate-400">{r.student?.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCourseColor(r.student?.course) }} />
                      {r.student?.course}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{QAR(r.courseFee)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{QAR(r.amount_paid)}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: r.balance > 0 ? '#dc2626' : '#16a34a' }}>
                    {r.balance > 0 ? QAR(r.balance) : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {r.payment_date ?? <span className="text-slate-300 italic">No payment</span>}
                    {r.method && <span className="block text-xs text-slate-400">{r.method}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status !== 'Paid' ? (
                      <button onClick={() => setRecording(r)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors">
                        + Record
                      </button>
                    ) : (
                      <span className="text-xs text-green-500 font-medium">Settled ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recording && (
        <PaymentModal
          record={recording}
          student={recording.student}
          onClose={() => setRecording(null)}
          onSave={handlePaymentSaved}
          saving={saving}
        />
      )}
    </div>
  )
}

// ─── Tab: Expenses ───────────────────────────────────────────────────────────

function Expenses({ expenses, setExpenses }) {
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [adding,    setAdding]    = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [deleting,  setDeleting]  = useState(null)
  const [saving,    setSaving]    = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return expenses.filter(e =>
      (!q || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) &&
      (filterCat === 'All' || e.category === filterCat)
    )
  }, [expenses, search, filterCat])

  async function handleSave(data) {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateExpense(editing.id, data)
        setExpenses(prev => prev.map(e => e.id === editing.id ? updated : e))
      } else {
        const created = await createExpense(data)
        setExpenses(prev => [created, ...prev])
      }
      setAdding(false); setEditing(null)
    } catch (e) {
      alert('Error saving expense: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteExpense(deleting.id)
      setExpenses(prev => prev.filter(e => e.id !== deleting.id))
      setDeleting(null)
    } catch (e) {
      alert('Error deleting: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Total: <span className="text-red-600">{QAR(totalFiltered)}</span></span>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No expenses found.</td></tr>
              ) : filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[exp.category] ?? '#94a3b8' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{exp.description}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{QAR(exp.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{exp.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${exp.recurring ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {exp.recurring ? '↻ Recurring' : 'One-off'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(exp)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleting(exp)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <ExpenseModal expense={editing} onClose={() => { setAdding(false); setEditing(null) }} onSave={handleSave} saving={saving} />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h2 className="font-semibold text-slate-800 mb-1">Delete Expense</h2>
            <p className="text-slate-500 text-sm mb-1"><strong>{deleting.description}</strong></p>
            <p className="text-red-600 text-sm font-semibold mb-6">{QAR(deleting.amount)}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2">
                {saving && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Finance Page ───────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview'        },
  { key: 'payments', label: 'Student Payments' },
  { key: 'expenses', label: 'Expenses'         },
]

export default function Finance() {
  const [tab,      setTab]      = useState('overview')
  const [students, setStudents] = useState([])
  const [payments, setPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [s, p, e] = await Promise.all([getStudents(), getStudentPayments(), getExpenses()])
      setStudents(s); setPayments(p); setExpenses(e)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  if (loading) return <Spinner message="Loading finance data…" />
  if (error)   return <ErrorMsg message={error} onRetry={load} />

  const totalRevenue  = payments.reduce((s, p) => s + Number(p.amount_paid), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit     = totalRevenue - totalExpenses

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">All amounts in Qatari Riyal (QAR)</p>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-xs text-slate-500">Net Position:</span>
          <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netProfit < 0 ? '-' : '+'}{QAR(Math.abs(netProfit))}
          </span>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview payments={payments} students={students} expenses={expenses} />}
      {tab === 'payments' && <StudentPayments payments={payments} setPayments={setPayments} students={students} />}
      {tab === 'expenses' && <Expenses expenses={expenses} setExpenses={setExpenses} />}
    </div>
  )
}
