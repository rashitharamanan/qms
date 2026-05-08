import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Store, Ticket, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/shops', label: 'Browse Shops', icon: Store },
    ...(user ? [{ to: '/my-tokens', label: 'My Tokens', icon: Ticket }] : [])
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50 shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lavender-400 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Queue<span className="text-lavender-500">Pro</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === to
                      ? 'bg-lavender-100 text-lavender-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-lavender-50 px-3 py-2 rounded-xl">
                    <div className="w-7 h-7 bg-lavender-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm px-3 py-2 rounded-xl hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to ? 'bg-lavender-100 text-lavender-700' : 'text-gray-600'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-red-500 text-sm font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-6 text-center text-sm text-gray-400">
        © 2024 QueuePro — Smart Queue Management System
      </footer>
    </div>
  );
}
