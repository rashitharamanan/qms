import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Store, Tag, Users, LogOut, Ticket, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/shops', label: 'Shops', icon: Store },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-lavender-400 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">QueuePro</div>
            <div className="text-xs text-lavender-300 font-medium">Admin Panel</div>
          </div>
        </div>
      </div>

      <div className="p-4 mx-3 mt-4 bg-gray-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-lavender-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.name[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">Administrator</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-lavender-400 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
            <Icon className="w-5 h-5" />{label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-gray-400 hover:bg-red-900/30 hover:text-red-400 text-sm font-medium transition-all">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col"><Sidebar /></div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col shadow-xl"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 h-16 bg-gray-900 text-white">
          <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-6 h-6" /></button>
          <span className="font-bold">Admin Panel</span>
          <div className="w-9 h-9 bg-lavender-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{user?.name[0].toUpperCase()}</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
