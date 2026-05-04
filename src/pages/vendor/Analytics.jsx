import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart3, Clock, Users, TrendingUp, CheckCircle, XCircle, SkipForward, Calendar } from 'lucide-react';

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" },
  { to: "/vendor/analytics", icon: "📈", label: "Analytics" },
];

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/analytics')
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;
  if (!data) return <DashboardLayout navItems={navItems}><div className="text-center py-20 text-slate-400">No analytics data</div></DashboardLayout>;

  const maxDayTotal = Math.max(...data.last7Days.map(d => d.total), 1);
  const maxHourCount = Math.max(...(data.peakHours?.map(h => h.count) || [0]), 1);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-lavender/10 text-lavender-dark text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-lavender/20">
              Analytics
            </span>
          </div>
          <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Queue Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Performance insights for your shop</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={16} className="text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Avg Wait Time</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.avgWaitTime}<span className="text-lg text-slate-400 ml-1">min</span></p>
          </div>
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 size={16} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Avg Service Time</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.avgServiceTime}<span className="text-lg text-slate-400 ml-1">min</span></p>
          </div>
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider">All-Time Tokens</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.allTime.total}</p>
          </div>
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Completion Rate</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.allTime.rate}<span className="text-lg text-slate-400 ml-1">%</span></p>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={16} className="text-purple-500" />
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Last 7 Days</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {data.last7Days.map((day, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end">
                  <span className="text-[10px] font-bold text-slate-500">{day.total}</span>
                  <div className="w-full max-w-[48px] rounded-t-xl transition-all duration-500 relative overflow-hidden"
                    style={{
                      height: `${Math.max((day.total / maxDayTotal) * 100, 8)}%`,
                      background: `linear-gradient(to top, #4A2766, #9B7CBD)`,
                      boxShadow: '0 4px 12px rgba(74,39,102,0.25)'
                    }}>
                    {/* Completed portion */}
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-400/40 rounded-t-sm"
                      style={{ height: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(to top, #4A2766, #9B7CBD)' }} />
              <span className="text-[10px] font-bold text-slate-400">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-400/40" />
              <span className="text-[10px] font-bold text-slate-400">Completed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Service Breakdown (Today)
            </h2>
            {data.serviceBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No services today</p>
            ) : (
              <div className="space-y-3">
                {data.serviceBreakdown.map((svc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-700">{svc.name}</span>
                        <span className="text-xs font-bold text-slate-400">{svc.completed}/{svc.total}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${svc.total > 0 ? (svc.completed / svc.total) * 100 : 0}%`,
                            background: 'linear-gradient(to right, #4A2766, #9B7CBD)'
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peak Hours */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-500" /> Peak Hours (Today)
            </h2>
            {data.peakHours.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No activity today</p>
            ) : (
              <div className="space-y-2">
                {data.peakHours.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-12 shrink-0">{h.hour}</span>
                    <div className="flex-1 h-5 bg-slate-50 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                        style={{
                          width: `${(h.count / maxHourCount) * 100}%`,
                          background: h.count === maxHourCount ? 'linear-gradient(to right, #EF4444, #F97316)' : 'linear-gradient(to right, #7B5C9E, #C9ABDF)',
                          minWidth: '24px'
                        }}>
                        <span className="text-[9px] font-black text-white">{h.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
