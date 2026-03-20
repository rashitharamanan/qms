import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };
  const getDashLink = () => user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/dashboard';

  return (
    <nav className="bg-white/40 backdrop-blur-2xl border-b border-white/40 sticky top-0 z-50 transition-all duration-500 shadow-sm shadow-lavender/5">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">Q</div>
            <span className="font-display font-bold text-2xl text-gray-900 tracking-tight">QueueMS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <Link to="/shops" className="text-gray-600 hover:text-lavender font-semibold transition-colors">Browse Shops</Link>
                <Link to="/login" className="btn-secondary text-sm py-2.5 px-6 rounded-xl hover:shadow-md">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-6 rounded-xl shadow-lavender/30">Get Started</Link>
              </>
            ) : (
              <>
                <Link to={getDashLink()} className="text-gray-600 hover:text-lavender font-semibold transition-colors">Dashboard</Link>
                {user.role === 'customer' && <Link to="/my-tokens" className="text-gray-600 hover:text-lavender font-semibold transition-colors">My Tokens</Link>}
                {user.role === 'customer' && <Link to="/shops" className="text-gray-600 hover:text-lavender font-semibold transition-colors">Browse Shops</Link>}
                <div className="flex items-center gap-4 pl-6 border-l-2 border-slate-200/60">
                  <div className="w-9 h-9 bg-lavender-pale text-lavender-dark rounded-full flex items-center justify-center font-bold text-sm shadow-inner tracking-wide">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block tracking-wide">{user.name}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-2">Logout</button>
                </div>
              </>
            )}
          </div>
          <button className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {!user ? (
            <>
              <Link to="/shops" className="block py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50">Browse Shops</Link>
              <Link to="/login" className="block py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50">Login</Link>
              <Link to="/register" className="block py-2 px-3 rounded-lg text-lavender font-medium">Register</Link>
            </>
          ) : (
            <>
              <Link to={getDashLink()} className="block py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50">Dashboard</Link>
              {user.role === 'customer' && <Link to="/my-tokens" className="block py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50">My Tokens</Link>}
              <button onClick={handleLogout} className="block w-full text-left py-2 px-3 rounded-lg text-red-500">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
