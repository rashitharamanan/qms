import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" },
  { to: "/vendor/analytics", icon: "📈", label: "Analytics" },
];

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchDashboard = () => api.get("/vendor/dashboard").then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { fetchDashboard(); }, []);

  const toggleShop = async () => {
    setToggling(true);
    await api.put("/vendor/shop/toggle");
    await fetchDashboard();
    setToggling(false);
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;
  
  if (!data?.shop) return (
    <DashboardLayout navItems={navItems}>
      <div className="glass-card text-center py-20 px-6 max-w-2xl mx-auto mt-10">
        <div className="text-7xl mb-6 animate-bounce">🏪</div>
        <h2 className="font-display text-3xl font-black text-slate-900 mb-4 gradient-text text-balance">Your Store is Waiting</h2>
        <p className="text-slate-500 mb-8 text-lg max-w-md mx-auto">Join our platform and start managing your queues with ease. It takes less than 2 minutes to set up.</p>
        <Link to="/vendor/shop" className="btn-primary inline-flex items-center gap-3 px-10 py-4 scale-110">
          <span>Create My Shop</span>
          <span className="text-xl">✨</span>
        </Link>
      </div>
    </DashboardLayout>
  );

  const { shop, total, waiting, completed, called, inService } = data;
  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-10 fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-slate-200/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-lavender/10 text-lavender-dark text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-lavender/20">
                Vendor Console
              </span>
              {!shop.isApproved && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200">
                  Verification Pending
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl font-black text-slate-900 tracking-tight mb-2 drop-shadow-sm">
              {shop.shopName}
            </h1>
            <p className="text-slate-500 font-bold flex items-center gap-3 text-lg">
              <span className="w-2 h-2 rounded-full bg-lavender animate-pulse"></span>
              {shop.category?.name} • <span className="text-slate-400 font-medium">Dashboard Overview</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Tokens Issued" value={total} icon="🎫" color="lavender" sub="lifetime" />
          <StatCard label="Live Waiting List" value={waiting} icon="⏳" color="amber" sub="active now" />
          <StatCard label="Active Sessions" value={inService + called} icon="🔔" color="blue" sub="at counters" />
          <StatCard label="Completed Today" value={completed} icon="✅" color="green" sub="satisfied users" />
        </div>

        {/* Primary Functional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Link to="/vendor/queue" className="glass-card p-5 hover:border-lavender group transition-all relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 shrink-0 gradient-bg rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-500">🎫</div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Queue Management</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">📊 Live Status</span>
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">👥 Token Control</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-2 border-t border-slate-100/60 flex items-center gap-4 w-full relative z-10">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-lavender transition-all duration-1000" style={{ width: `${(completed / (total || 1)) * 100}%` }}></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-lavender shrink-0">
                <span>Enter Console</span>
                <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link to="/vendor/services" className="glass-card p-5 hover:border-indigo-300 group transition-all relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 shrink-0 bg-indigo-100/50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">⚙️</div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Service Catalog</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">🏷️ Pricing</span>
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">⏱️ Durations</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100/60 flex items-center justify-between w-full relative z-10">
               <span className="text-[10px] font-bold text-slate-400">Manage rules & counters</span>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 shrink-0">
                <span>Configure</span>
                <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
          <Link to="/vendor/pre-bookings" className="glass-card p-5 hover:border-purple-300 group transition-all relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 shrink-0 bg-purple-100/50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">📅</div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Pre-bookings</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">🗓️ Reservations</span>
                   <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">✅ Confirm Slot</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100/60 flex items-center justify-between w-full relative z-10">
               <span className="text-[10px] font-bold text-slate-400">Handle future reservations</span>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 shrink-0">
                <span>View Requests</span>
                <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}