import { STUDENTS, COURSES, getStatusColor, getCourseColor, getInitials } from '../data/mockData';
import { Users, UserCheck, BookOpen, TrendingUp, ArrowUpRight } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm border border-slate-100">
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: color + '18' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function CourseBar({ course, count, total }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-40 shrink-0 truncate">{course}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: getCourseColor(course) }}
        />
      </div>
      <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const total      = STUDENTS.length;
  const active     = STUDENTS.filter(s => s.status === 'Active').length;
  const completed  = STUDENTS.filter(s => s.status === 'Completed').length;
  const completionRate = Math.round((completed / total) * 100);

  const recentStudents = [...STUDENTS]
    .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
    .slice(0, 6);

  const courseCounts = COURSES.map(c => ({
    name: c.name,
    count: STUDENTS.filter(s => s.course === c.name).length,
  })).sort((a, b) => b.count - a.count);

  const stats = [
    { icon: Users,     label: 'Total Students',   value: total,             color: '#6366f1', sub: 'All registered students'     },
    { icon: UserCheck, label: 'Active Students',   value: active,            color: '#10b981', sub: `${Math.round((active/total)*100)}% of total` },
    { icon: BookOpen,  label: 'Courses Offered',   value: COURSES.length,    color: '#0ea5e9', sub: 'Across all disciplines'      },
    { icon: TrendingUp,label: 'Completion Rate',   value: `${completionRate}%`, color: '#f59e0b', sub: `${completed} students graduated` },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Enrollments</h2>
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1 cursor-pointer hover:underline">
              View all <ArrowUpRight size={12} />
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {recentStudents.map(student => {
              const sc = getStatusColor(student.status);
              return (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: getCourseColor(student.course) }}
                  >
                    {getInitials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{student.name}</p>
                    <p className="text-xs text-slate-400 truncate">{student.course}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {student.status}
                    </span>
                    <span className="text-xs text-slate-400">{student.enrollmentDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Students per Course</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            {courseCounts.map(c => (
              <CourseBar key={c.name} course={c.name} count={c.count} total={total} />
            ))}
          </div>
        </div>
      </div>

      {/* Status summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['Active', 'Inactive', 'Completed', 'On Hold'].map(status => {
          const count = STUDENTS.filter(s => s.status === status).length;
          const sc    = getStatusColor(status);
          return (
            <div key={status} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <p className="text-2xl font-bold" style={{ color: sc.text }}>{count}</p>
              <p className="text-sm text-slate-500 mt-1">{status}</p>
              <div
                className="mt-2 mx-auto h-1 w-12 rounded-full"
                style={{ backgroundColor: sc.bg, outline: `1px solid ${sc.text}30` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
