import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
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
              {shop.category?.name} • <span className="text-slate-400 font-medium">Real-time Performance Overview</span>
            </p>
          </div>
          
          <div className="flex items-center p-2 bg-white/50 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/80 rounded-[2rem]">
            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all ${shop.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
              <div className="relative">
                <span className={`block w-3 h-3 rounded-full ${shop.isOpen ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                {shop.isOpen && <span className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
              </div>
              <span className="text-base font-black uppercase tracking-widest">{shop.isOpen ? "Store is LIVE" : "Store is CLOSED"}</span>
            </div>
            <button 
              onClick={toggleShop} 
              disabled={toggling || !shop.isApproved}
              className={`ml-3 px-8 py-3 rounded-2xl text-sm font-black transition-all ${
                shop.isOpen 
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200/50 hover:-translate-y-0.5" 
                : "gradient-bg hover:shadow-2xl hover:-translate-y-0.5"
              } ${(!shop.isApproved) ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
            >
              {toggling ? "PROCESSING..." : shop.isOpen ? "TAKE OFFLINE" : "GO ONLINE ✨"}
            </button>
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/vendor/queue" className="glass-card p-10 flex flex-col items-start gap-8 hover:border-lavender group transition-all relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
              <div className="w-20 h-20 gradient-bg rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10">🎫</div>
              <div className="relative z-10">
                <h3 className="font-black text-slate-900 text-2xl mb-3">Queue Management</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  Direct the flow of your customers in real-time. Call next tokens, manage counter assignments, and monitor wait times.
                </p>
                <div className="mt-8 flex items-center gap-3 text-lavender font-black text-sm uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                  Access Live Console <span className="text-xl">→</span>
                </div>
              </div>
              
              <div className="mt-auto pt-8 flex items-center gap-6 w-full relative z-10">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lavender transition-all duration-1000" style={{ width: `${(completed / (total || 1)) * 100}%` }}></div>
                </div>
                <span className="text-xs font-black text-slate-400">{waiting} REMAINING</span>
              </div>
            </Link>

            <Link to="/vendor/services" className="glass-card p-10 flex flex-col items-start gap-8 hover:border-indigo-300 group transition-all relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
              <div className="w-20 h-20 bg-indigo-100/50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 relative z-10">⚙️</div>
              <div className="relative z-10">
                <h3 className="font-black text-slate-900 text-2xl mb-3">Service Catalog</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  Optimize your business offerings. Configure service durations, pricing, and specialized counter rules.
                </p>
                <div className="mt-8 flex items-center gap-3 text-indigo-600 font-black text-sm uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                  Configure Settings <span className="text-xl">→</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="glass-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden flex flex-col group min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-lavender/20 blur-[60px] -mr-24 -mt-24 rounded-full" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">📈</span>
              <h3 className="text-xl font-black tracking-tight">Performance</h3>
            </div>
            
            <div className="space-y-6 relative z-10 flex-1">
              {[
                { label: "Peak Efficiency", val: "12 PM - 2 PM", icon: "🔥" },
                { label: "Avg Service Time", val: "14.2 mins", icon: "⏱️" },
                { label: "Satisfaction", val: "98.5%", icon: "⭐" }
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <span className="text-lg font-black">{stat.val}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-900/40 uppercase tracking-[0.2em] relative z-10">
              Detailed Analytics
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}