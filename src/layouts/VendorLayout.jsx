import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Store, ListChecks, Users, Monitor, Ticket, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/vendor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vendor/shop', label: 'My Shop', icon: Store },
  { to: '/vendor/services', label: 'Services', icon: ListChecks },
  { to: '/vendor/staff', label: 'Staff members', icon: Users },
  { to: '/vendor/counters', label: 'Counters', icon: Monitor },
  { to: '/vendor/queue', label: 'Live Queue', icon: Ticket },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-gray-100'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-lavender-400 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900">QueuePro</div>
            <div className="text-xs text-lavender-500 font-medium">Vendor Portal</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-3 mt-4 bg-lavender-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-lavender-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.name[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col shadow-xl"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-gray-900">QueuePro Vendor</span>
          <div className="w-9 h-9 bg-lavender-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{user?.name[0].toUpperCase()}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
