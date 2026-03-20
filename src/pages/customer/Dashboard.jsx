import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TokenBadge from "../../components/common/TokenBadge";
import { useAuth } from "../../context/AuthContext";
import { Star, Clock, Ticket, CheckCircle, Bell, LayoutDashboard } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/queue/my-tokens").then(r => { 
      setTokens(r.data.data); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  const active = tokens.filter(t => ["pending", "waiting", "called", "in-service"].includes(t.status));

  if (loading) return <MainLayout><LoadingSpinner size="lg" /></MainLayout>;

  return (
    <MainLayout>
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lavender/10 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

        <div className="w-full px-4 sm:px-8 xl:px-16 py-10 max-w-[1700px] mx-auto space-y-12 fade-in relative z-10">
          
          {/* Welcome Header */}
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-lavender-dark text-white overflow-hidden relative shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-lavender/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                  Customer Console
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">Welcome back, {user?.name}! 👋</h1>
                <p className="text-white/60 font-bold text-lg max-w-xl">Your live service dashboard. Track tokens, estimated wait times, and history in one place.</p>
              </div>
              <div className="flex gap-4">
                 <Link to="/shops" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                   Browse Shops
                 </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Tokens", value: active.length, icon: <Ticket size={24} />, color: "lavender" },
              { label: "Remaining", value: tokens.filter(t => t.status === "waiting").length, icon: <Clock size={24} />, color: "amber" },
              { label: "Called", value: tokens.filter(t => t.status === "called").length, icon: <Bell size={24} />, color: "blue" },
              { label: "Completed", value: tokens.filter(t => t.status === "completed").length, icon: <CheckCircle size={24} />, color: "emerald" }
            ].map((stat, i) => (
              <div key={stat.label} className="glass-card p-6 flex flex-col items-center justify-center space-y-3 border-white/60 hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${
                  stat.color === 'lavender' ? 'bg-lavender/10 text-lavender' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                  {stat.icon}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Tokens Section */}
          {active.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-lavender rounded-full animate-pulse"></span>
                  Ongoing Tokens
                </h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {active.map(token => (
                  <Link to={"/queue/token/" + token._id} key={token._id} 
                    className={`glass-card p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-lavender transition-all relative overflow-hidden ${
                      token.status === "called" ? "ring-2 ring-lavender pulse-ring" : "border-white/80"
                    }`}>
                    <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl relative z-10 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {token.tokenNumber}
                    </div>
                    <div className="flex-1 space-y-4 text-center sm:text-left relative z-10 w-full min-w-0">
                      <div>
                        <h3 className="font-black text-slate-900 text-xl truncate group-hover:text-lavender transition-colors">{token.serviceId?.serviceName}</h3>
                        <p className="text-slate-500 font-bold flex items-center justify-center sm:justify-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {token.shopId?.shopName}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <TokenBadge status={token.status} />
                        {(token.status === "waiting" || token.status === "pending") && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 font-black text-[10px] uppercase tracking-widest">
                            <Clock size={12} />
                            ~{token.estimatedWaitTime} min wait
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:h-20 sm:w-px bg-slate-100 hidden sm:block"></div>
                    <div className="relative z-10 w-full sm:w-auto">
                      <button className="w-full sm:w-auto px-6 py-3 bg-slate-50 text-slate-400 group-hover:bg-lavender group-hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        View Details
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Quick Links Section */}
          <div className="bg-slate-50/50 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-white/60">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Link to="/shops" className="glass-card hover:-translate-y-2 transition-all p-10 group bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-lavender/10 text-lavender rounded-[2rem] flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">🏪</div>
                <h3 className="font-black text-slate-900 text-2xl mb-2">Discovery Shops</h3>
                <p className="text-slate-500 font-bold">Find and join queues near you instantly.</p>
                <div className="mt-8 flex items-center gap-2 text-lavender font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Launch Explorer <span>→</span>
                </div>
              </Link>

              <Link to="/my-tokens" className="glass-card hover:-translate-y-2 transition-all p-10 group bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[2rem] flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">🎫</div>
                <h3 className="font-black text-slate-900 text-2xl mb-2">Full History</h3>
                <p className="text-slate-500 font-bold">Review all your previous tokens and sessions.</p>
                <div className="mt-8 flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Access Daily Log <span>→</span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}