import { useState, useMemo } from 'react';
import {
  STUDENTS as INITIAL_STUDENTS, COURSES, STATUSES, getStatusColor, getCourseColor, getInitials
} from '../data/mockData';
import {
  Search, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, Filter
} from 'lucide-react';

const EMPTY_FORM = {
  name: '', email: '', phone: '', age: '', gender: 'Male',
  location: '', course: COURSES[0].name, status: 'Active', progress: 0, enrollmentDate: '',
};

function Badge({ status }) {
  const sc = getStatusColor(status);
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: sc.bg, color: sc.text }}
    >
      {status}
    </span>
  );
}

function ProgressBar({ value }) {
  const color = value === 100 ? '#10b981' : value >= 60 ? '#6366f1' : value >= 30 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
        <div className="h-1.5 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-slate-500 w-8">{value}%</span>
    </div>
  );
}

function Modal({ student, onClose, onSave }) {
  const [form, setForm] = useState(student ? { ...student } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())           e.name  = 'Name is required';
    if (!form.email.trim())          e.email = 'Email is required';
    if (!form.age || form.age < 15 || form.age > 70) e.age = 'Age must be between 15 and 70';
    if (!form.enrollmentDate)        e.enrollmentDate = 'Enrollment date is required';
    return e;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, age: Number(form.age), progress: Number(form.progress) });
  }

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );

  const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {student ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *" error={errors.name}>
            <input className={input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Alice Mwangi" />
          </Field>

          <Field label="Email *" error={errors.email}>
            <input className={input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="alice@email.com" />
          </Field>

          <Field label="Phone">
            <input className={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
          </Field>

          <Field label="Age *" error={errors.age}>
            <input className={input} type="number" min="15" max="70" value={form.age} onChange={e => set('age', e.target.value)} />
          </Field>

          <Field label="Gender">
            <select className={input} value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Location">
            <input className={input} value={form.location} onChange={e => set('location', e.target.value)} placeholder="City / Town" />
          </Field>

          <Field label="Course Interest">
            <select className={input} value={form.course} onChange={e => set('course', e.target.value)}>
              {COURSES.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select className={input} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Enrollment Date *" error={errors.enrollmentDate}>
            <input className={input} type="date" value={form.enrollmentDate} onChange={e => set('enrollmentDate', e.target.value)} />
          </Field>

          <Field label={`Progress — ${form.progress}%`}>
            <input className="w-full accent-indigo-600" type="range" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} />
          </Field>

          <div className="sm:col-span-2 flex gap-3 pt-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              {student ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ student, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h2 className="font-semibold text-slate-800 mb-1">Remove Customer</h2>
        <p className="text-slate-500 text-sm mb-6">
          Are you sure you want to remove <strong>{student.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [students,   setStudents]   = useState(INITIAL_STUDENTS);
  const [search,     setSearch]     = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey,    setSortKey]    = useState('name');
  const [sortDir,    setSortDir]    = useState('asc');
  const [editing,    setEditing]    = useState(null);
  const [adding,     setAdding]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const filtered = useMemo(() => {
    let list = students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.course.toLowerCase().includes(q);
      const matchCourse = filterCourse === 'All' || s.course === filterCourse;
      const matchStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchSearch && matchCourse && matchStatus;
    });
    list = [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'age' || sortKey === 'progress') { va = Number(va); vb = Number(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, search, filterCourse, filterStatus, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={12} className="text-indigo-500" />
      : <ChevronDown size={12} className="text-indigo-500" />;
  }

  function saveStudent(data) {
    if (editing) {
      setStudents(list => list.map(s => s.id === editing.id ? { ...data, id: editing.id } : s));
    } else {
      setStudents(list => [...list, { ...data, id: Math.max(...list.map(s => s.id)) + 1 }]);
    }
    setEditing(null);
    setAdding(false);
  }

  function deleteStudent() {
    setStudents(list => list.filter(s => s.id !== deleting.id));
    setDeleting(null);
  }

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by name, email or course…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="All">All Courses</option>
              {COURSES.map(c => <option key={c.id}>{c.name}</option>)}
            </select>

            <select
              className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors ml-auto"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">{filtered.length} of {students.length} customers</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className={thClass} onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Name <SortIcon col="name" /></span>
                </th>
                <th className={thClass} onClick={() => toggleSort('age')}>
                  <span className="flex items-center gap-1">Age <SortIcon col="age" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className={thClass} onClick={() => toggleSort('course')}>
                  <span className="flex items-center gap-1">Course <SortIcon col="course" /></span>
                </th>
                <th className={thClass} onClick={() => toggleSort('status')}>
                  <span className="flex items-center gap-1">Status <SortIcon col="status" /></span>
                </th>
                <th className={thClass} onClick={() => toggleSort('progress')}>
                  <span className="flex items-center gap-1">Progress <SortIcon col="progress" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    No customers match your filters.
                  </td>
                </tr>
              ) : filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: getCourseColor(student.course) }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{student.age}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600 truncate max-w-[180px]">{student.email}</p>
                    <p className="text-xs text-slate-400">{student.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCourseColor(student.course) }} />
                      {student.course}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge status={student.status} /></td>
                  <td className="px-4 py-3"><ProgressBar value={student.progress} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditing(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <Modal
          student={editing}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSave={saveStudent}
        />
      )}
      {deleting && (
        <DeleteModal
          student={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={deleteStudent}
        />
      )}
    </div>
  );
}
