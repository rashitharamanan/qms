import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";

export default function DashboardLayout({ children, navItems }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 px-4 py-2">
        <nav className="flex justify-around items-center">
          {navItems?.map(item => (
            <Link 
              key={item.to} 
              to={item.to}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                location.pathname === item.to 
                ? "text-lavender-dark" 
                : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              {location.pathname === item.to && (
                <div className="w-1 h-1 bg-lavender rounded-full mt-0.5" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="glass-card p-5 sticky top-28 border-white/60 shadow-xl shadow-lavender/10">
              <div className="mb-6 px-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor Menu</h3>
              </div>
              <nav className="space-y-2">
                {navItems?.map(item => (
                  <Link 
                    key={item.to} 
                    to={item.to}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      location.pathname === item.to 
                      ? "gradient-bg scale-[1.02] shadow-lavender/25" 
                      : "text-slate-600 hover:bg-lavender-pale/50 hover:text-lavender-dark"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-100/50 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center text-lavender font-bold">
                    {user?.name?.charAt(0) || "V"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "Vendor"}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-24 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}