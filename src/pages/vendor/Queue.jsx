import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TokenBadge from "../../components/common/TokenBadge";
import { useSocket } from "../../context/SocketContext";
import { formatTime12 } from "../../utils/helpers";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

export default function VendorQueue() {
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [shop, setShop] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { socket } = useSocket();

  const fetchQueue = useCallback(async () => {
    const params = selectedService ? { serviceId: selectedService } : {};
    const [qRes, sRes, shopRes] = await Promise.all([
      api.get("/vendor/queue", { params }),
      api.get("/vendor/services"),
      api.get("/vendor/shop")
    ]);
    setQueue(qRes.data.data);
    setServices(sRes.data.data);
    setShop(shopRes.data.data);
    setLoading(false);
  }, [selectedService]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    if (!socket || !shop) return;
    socket.emit("join-shop", shop._id);
    const handler = () => fetchQueue();
    socket.on("new-token", handler);
    socket.on("token-cancelled", handler);
    return () => {
      socket.off("new-token", handler);
      socket.off("token-cancelled", handler);
    };
  }, [socket, shop, fetchQueue]);

  const callNext = async () => {
    if (!selectedService) return;
    setActionLoading(true);
    await api.put("/vendor/queue/call-next", { serviceId: selectedService });
    await fetchQueue();
    setActionLoading(false);
  };

  const skipToken = async (tokenId) => {
    await api.put("/vendor/queue/skip", { tokenId });
    fetchQueue();
  };

  const completeToken = async (tokenId) => {
    await api.put("/vendor/queue/complete", { tokenId });
    fetchQueue();
  };

  const acceptToken = async (tokenId) => {
    setActionLoading(true);
    await api.put("/vendor/queue/accept", { tokenId });
    fetchQueue();
    setActionLoading(false);
  };

  const rejectToken = async (tokenId) => {
    setActionLoading(true);
    await api.put("/vendor/queue/reject", { tokenId });
    fetchQueue();
    setActionLoading(false);
  };

  const pending = queue.filter(t => t.status === "pending");
  const waiting = queue.filter(t => t.status === "waiting");
  const active = queue.filter(t => ["called", "in-service"].includes(t.status));
  const done = queue.filter(t => ["completed", "skipped", "cancelled", "rejected"].includes(t.status));

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Queue Management</h1>
            <p className="text-slate-500 font-medium mt-1 italic">Real-time control over your token flow</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <select 
              className="bg-slate-50 border-none outline-none px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 min-w-[200px]" 
              value={selectedService} 
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="">All Active Services</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.serviceName}</option>)}
            </select>
            
            <button 
              onClick={callNext} 
              disabled={actionLoading || !selectedService}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                !selectedService 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "gradient-bg shadow-lavender/25 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="text-lg">▶</span>}
              <span>{actionLoading ? "Calling..." : "Call Next"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Requests", count: pending.length, color: "bg-amber-500" },
            { label: "Waiting", count: waiting.length, color: "bg-indigo-500" },
            { label: "Active", count: active.length, color: "bg-blue-500" },
            { label: "Processed", count: done.length, color: "bg-emerald-500" }
          ].map((stat, i) => (
            <div key={i} className={`glass-card p-4 flex flex-col items-center justify-center border-white/40 group hover:border-white/80 transition-all`}>
              <div className="text-3xl font-black text-slate-900 leading-none mb-2">{stat.count}</div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${stat.color} group-hover:scale-150 transition-transform`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {pending.length > 0 && (
              <section className="fade-in">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-8 bg-amber-400 rounded-full" />
                    New Access Requests
                  </h2>
                </div>
                <div className="space-y-3">
                  {pending.map(token => (
                    <div key={token._id} className="glass-card p-4 border-l-4 border-l-amber-400 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                          {token.customerId?.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{token.customerId?.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{token.serviceId?.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform origin-right">
                        <button onClick={() => acceptToken(token._id)} disabled={actionLoading} className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600">APPROVE</button>
                        <button onClick={() => rejectToken(token._id)} disabled={actionLoading} className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-black rounded-xl border border-rose-100 hover:bg-rose-100">REJECT</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="fade-in">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-500 rounded-full" />
                  Active Sessions
                </h2>
              </div>
              {active.length === 0 ? (
                <div className="glass-card py-12 text-center border-dashed border-2 border-slate-200">
                  <div className="text-4xl mb-3 opacity-30">🛎️</div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active sessions at counters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {active.map(token => (
                    <div key={token._id} className="glass-card overflow-hidden border-blue-100 shadow-blue-50/50">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">{token.tokenNumber}</div>
                            <div>
                              <p className="font-black text-slate-900 text-lg leading-tight">{token.customerId?.name}</p>
                              <TokenBadge status={token.status} />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</span>
                            <span className="text-xs font-bold text-slate-700">{token.serviceId?.serviceName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</span>
                            <span className="text-xs font-bold text-lavender-dark">{formatTime12(token.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => completeToken(token._id)} className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">COMPLETE</button>
                          <button onClick={() => skipToken(token._id)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-sm font-black rounded-xl hover:bg-slate-200 transition-all">SKIP</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="fade-in">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                  Upcoming Queue ({waiting.length})
                </h2>
              </div>
              {waiting.length === 0 ? (
                <div className="glass-card py-10 text-center border-dashed border-2 border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Queue is currently empty</p>
                </div>
              ) : (
                <div className="glass-card p-2 space-y-1">
                  {waiting.map((token, idx) => (
                    <div key={token._id} className="flex items-center justify-between p-3 hover:bg-slate-50/50 rounded-xl transition-all group">
                      <div className="flex items-center gap-4">
                        <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-200 rounded-full">{idx + 1}</span>
                        <div className="w-10 h-10 bg-lavender/5 rounded-xl border border-lavender/10 flex items-center justify-center font-black text-lavender-dark">{token.tokenNumber}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{token.customerId?.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{token.serviceId?.serviceName} • {formatTime12(token.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => completeToken(token._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Instant Complete">✅</button>
                        <button onClick={() => skipToken(token._id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Skip Session">⏭️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass-card p-6 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] -mr-16 -mt-16 rounded-full" />
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="text-2xl italic">📜</span>
                Recent Processed
              </h3>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {done.length === 0 ? (
                  <div className="text-slate-500 text-center py-10 italic text-sm">No activity recorded today</div>
                ) : (
                  done.slice(0, 15).map(token => (
                    <div key={token._id} className="p-3 bg-white/5 border border-white/10 rounded-xl relative group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-black text-white px-2 py-0.5 bg-white/10 rounded-md">#{token.tokenNumber}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{token.customerId?.name}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{token.status}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          token.status === "completed" ? "bg-emerald-400" : 
                          token.status === "skipped" ? "bg-amber-400" : "bg-rose-400"
                        }`} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/40 transition-all uppercase tracking-widest">
                  View Full Daily Log
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}