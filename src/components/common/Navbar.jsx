import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, Store, LogOut, Menu, X, Sparkles, ChevronDown, User, History, Settings, Home, Compass, Info, Briefcase, Mail } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const getDashLink = () => user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/dashboard';
  const isActive = (path) => location.pathname === path || location.hash === path.substring(1);

  const handleNavClick = (e, to) => {
    if (to.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const id = to.substring(2);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setMenuOpen(false);
          navigate(to, { replace: true });
        }
      }
    }
  };

  const navItems = user ? [
    { to: getDashLink(), label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    ...(user.role === 'customer' ? [
      { to: '/my-tokens', label: 'My Tokens', icon: <Ticket size={15} /> },
      { to: '/shops', label: 'Shops', icon: <Store size={15} /> },
      { to: '/queue/history', label: 'History', icon: <History size={15} /> },
    ] : []),
    ...(user.role === 'vendor' ? [
      { to: '/vendor/queue', label: 'Queue', icon: <Ticket size={15} /> },
      { to: '/vendor/services', label: 'Services', icon: <Settings size={15} /> },
      { to: '/vendor/shop', label: 'My Shop', icon: <Store size={15} /> },
    ] : []),
  ] : [
    { to: '/#about', label: 'About', icon: <Info size={15} /> },
    { to: '/#work', label: 'Work', icon: <Briefcase size={15} /> },
    { to: '/#discover', label: 'Discover', icon: <Compass size={15} /> },
    { to: '/#contact', label: 'Contact', icon: <Mail size={15} /> }
  ];

  return (
    <>
      <style>{`
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(180,140,230,0.70), 0 0 18px rgba(180,140,230,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(180,140,230,0.00), 0 0 30px rgba(180,140,230,0.55); }
        }
        @keyframes nav-slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes user-ring {
          0%, 100% { box-shadow: 0 0 0 2px rgba(180,140,230,0.80), 0 0 16px rgba(180,140,230,0.30); }
          50%       { box-shadow: 0 0 0 4px rgba(180,140,230,0.40), 0 0 24px rgba(180,140,230,0.55); }
        }
        @keyframes mobile-slide {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(38, 10, 68, 0.92)'
            : 'rgba(48, 15, 85, 0.78)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderBottom: '1px solid rgba(200,160,240,0.18)',
          boxShadow: scrolled ? '0 4px 40px rgba(30,5,60,0.50)' : '0 1px 20px rgba(30,5,60,0.25)',
        }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[62px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-white relative"
                style={{
                  background: 'linear-gradient(135deg, #6B4A7E 0%, #9B7CBD 60%, #C9ABDF 100%)',
                  animation: 'logo-pulse 3s ease-in-out infinite',
                }}
              >
                Q
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#2D0A50]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-lg tracking-tight">QueueMS</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.20em] text-purple-300/70">
                  Smart Queue
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav — pill strip ── */}
            <div className="hidden md:flex items-center">
              <div
                className="flex items-center p-1 rounded-2xl gap-0.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                {navItems.map(({ to, label, icon }) => (
                  <Link
                    key={to} to={to}
                    onClick={(e) => handleNavClick(e, to)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative group"
                    style={isActive(to)
                      ? {
                          background: 'rgba(180,140,230,0.22)',
                          color: '#fff',
                          boxShadow: '0 0 20px rgba(180,140,230,0.25)',
                          border: '1px solid rgba(200,160,255,0.25)',
                        }
                      : { color: 'rgba(220,200,255,0.65)', border: '1px solid transparent' }
                    }
                    onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
                    onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = 'rgba(220,200,255,0.65)'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <span className="opacity-80">{icon}</span>
                    {label}
                    {isActive(to) && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#C9ABDF', boxShadow: '0 0 6px #C9ABDF' }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right Section ── */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link to="/login"
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{ color: 'rgba(220,200,255,0.80)', border: '1px solid rgba(200,160,255,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(220,200,255,0.80)'; }}
                  >Sign In</Link>
                  <Link to="/register"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6B4A7E, #9B7CBD)', boxShadow: '0 4px 18px rgba(107,74,126,0.55)' }}
                  ><Sparkles size={13} /> Get Started</Link>
                </>
              ) : (
                <>
                  {/* Bell — Notification Dropdown */}
                  <NotificationDropdown />

                  {/* User dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(200,160,255,0.18)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white"
                        style={{
                          background: 'linear-gradient(135deg, #6B4A7E, #C9ABDF)',
                          animation: 'user-ring 3s ease-in-out infinite',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-sm font-bold text-white max-w-[90px] truncate">{user.name?.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300/60">{user.role}</span>
                      </div>
                      <ChevronDown size={13} className={`text-purple-300/60 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-2xl py-1.5 shadow-2xl"
                        style={{
                          background: 'rgba(38,10,68,0.95)',
                          border: '1px solid rgba(200,160,255,0.20)',
                          backdropFilter: 'blur(20px)',
                          animation: 'nav-slide-in 0.18s ease',
                          boxShadow: '0 20px 60px rgba(20,5,40,0.60)',
                        }}
                      >
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-purple-200 hover:bg-purple-500/15 transition-colors rounded-xl mx-1 mt-0.5"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <User size={14} /> My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/15 transition-colors rounded-xl mx-1 mt-0.5"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,160,255,0.18)', color: 'rgba(200,160,255,0.80)' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Menu ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col pt-20 px-5 pb-8 overflow-y-auto"
          style={{
            background: 'rgba(30,5,60,0.96)',
            backdropFilter: 'blur(24px)',
            animation: 'mobile-slide 0.25s ease',
          }}
        >
          {/* Nav items */}
          <div className="space-y-2 mt-4">
            {navItems.map(({ to, label, icon }) => (
              <Link
                key={to} to={to}
                onClick={(e) => handleNavClick(e, to)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-base transition-all"
                style={isActive(to)
                  ? { background: 'rgba(180,140,230,0.22)', color: '#fff', border: '1px solid rgba(200,160,255,0.25)' }
                  : { color: 'rgba(220,200,255,0.70)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                <span style={{ color: '#C9ABDF' }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-8 mb-8 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(200,160,255,0.15)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{ background: 'linear-gradient(135deg, #6B4A7E, #C9ABDF)' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-purple-300/60 font-bold uppercase tracking-wider">{user.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-rose-300" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.20)' }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-center py-3.5 rounded-2xl font-bold text-white" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(200,160,255,0.20)' }}>Sign In</Link>
                <Link to="/register" className="block text-center py-3.5 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6B4A7E, #9B7CBD)' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
