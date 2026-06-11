import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../data/mockData';

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-slate-800 font-semibold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user ? getInitials(user.name) : 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
