import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, History, BarChart3, FolderKanban, ChevronDown, Plus, UserCog, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Avatar } from './ui';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const [personaOpen, setPersonaOpen] = useState(false);

  if (!currentUser) return null;

  const memberNav = [
    { to: '/reports/history', label: 'My Reports', icon: History },
    { to: '/report/new', label: 'New Report', icon: Plus },
  ];
  const managerNav = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/manager/projects', label: 'Projects', icon: FolderKanban },
    { to: '/manager/team', label: 'Team', icon: Briefcase },
  ];
  const adminNav = [{ to: '/admin/users', label: 'Users', icon: UserCog }];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Weekly Reports</p>
              <p className="text-xs text-gray-400">Team Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isManager && memberNav.map((item) => <NavItem key={item.to} {...item} />)}
          {isManager && (
            <>
              <div className="pt-2 pb-1 px-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p></div>
              {managerNav.map((item) => <NavItem key={item.to} {...item} />)}
              <div className="pt-4 pb-1 px-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p></div>
              {adminNav.map((item) => <NavItem key={item.to} {...item} />)}
            </>
          )}
        </nav>
        <div className="px-3 py-3 border-t border-gray-200">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <p className="text-sm text-gray-500">{isManager ? 'Manager View' : 'Team Member View'}{currentUser.department && ` · ${currentUser.department}`}</p>
          <div className="relative">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50">
              <Avatar name={currentUser.name} size="sm" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{currentUser.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{isManager ? 'Manager' : 'Team Member'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof FileText }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <Icon className="w-4 h-4" /> {label}
    </NavLink>
  );
}
