import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatTime12 } from "../../utils/helpers";
import { useSocket } from "../../context/SocketContext";
import { Clock, MapPin, ChevronRight, Ticket, ExternalLink } from "lucide-react";

const statusConfig = {
  pending: { label: 'Pending Approval', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  waiting: { label: 'In Queue', color: 'text-lavender', bg: 'bg-lavender-pale', border: 'border-lavender/20' },
  called: { label: 'Your Turn', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'in-service': { label: 'Serving', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  completed: { label: 'Done', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  skipped: { label: 'Skipped', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  cancelled: { label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
};

export default function MyTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchTokens = async () => {
    const { data } = await api.get("/queue/my-tokens");
    setTokens(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const shopIds = [...new Set(tokens.map(t => t.shopId?._id).filter(Boolean))];
    shopIds.forEach(id => socket.emit("join-shop", id));
    
    const handler = () => fetchTokens();
    socket.on("token-called", handler);
    socket.on("token-completed", handler);
    socket.on("token-skipped", handler);
    socket.on("queue_updated", handler);
    
    return () => {
      socket.off("token-called", handler);
      socket.off("token-completed", handler);
      socket.off("token-skipped", handler);
      socket.off("queue_updated", handler);
      shopIds.forEach(id => socket.emit("leave-shop", id));
    };
  }, [socket, tokens.length]);

  const cancelToken = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this token?")) return;
    await api.put("/queue/" + id + "/cancel");
    fetchTokens();
  };

  if (loading) return <MainLayout><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender-pale text-lavender rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
               My Active Sessions
            </div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Today\'s Tokens</h1>
            <p className="text-slate-500 font-medium mt-2">Manage and track your real-time queue status</p>
          </div>
          <Link to="/shops" className="btn-primary px-8 py-4 shadow-xl shadow-lavender/20 group">
             <span>+ New Appointment</span>
             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {tokens.length === 0 ? (
          <div className="glass-card text-center py-24 px-6 border-none bg-white/40">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl grayscale opacity-50">🎫</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Tokens</h2>
            <p className="text-slate-500 mb-10 max-w-xs mx-auto">You haven\'t joined any queues today. Explore nearby shops to get started.</p>
            <Link to="/shops" className="btn-secondary inline-flex">Browse Shops Around Me</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tokens.map(token => {
              const status = statusConfig[token.status] || statusConfig.waiting;
              const isTurn = token.status === 'called';
              
              return (
                <div key={token._id} className={`group relative transition-all duration-300 hover:-translate-y-1 ${isTurn ? 'scale-[1.02] z-10' : ''}`}>
                  {isTurn && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-lavender rounded-[2rem] blur opacity-30 animate-pulse"></div>
                  )}
                  
                  <div className="relative glass-card overflow-hidden p-0 border-none bg-white/60 hover:bg-white/80">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Token Header Part */}
                      <div className={`p-6 sm:w-48 flex flex-col items-center justify-center text-center gap-2 ${isTurn ? 'gradient-bg' : 'bg-slate-50 border-r border-slate-100'}`}>
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTurn ? 'opacity-70' : 'text-slate-400'}`}>Token</span>
                         <span className="text-4xl font-display font-black tracking-tighter">{token.tokenNumber}</span>
                         <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isTurn ? 'bg-white/20 text-white' : status.bg + ' ' + status.color}`}>
                           {status.label}
                         </div>
                      </div>

                      {/* Info Part */}
                      <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-lavender transition-colors">{token.shopId?.shopName}</h3>
                            <div className="flex items-center gap-4 mt-1 text-slate-500 font-bold text-sm">
                              <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> {token.serviceId?.serviceName}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime12(token.createdAt)}</span>
                            </div>
                          </div>
                          
                          {['waiting', 'pending'].includes(token.status) && (
                             <div className="flex items-center gap-6">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</span>
                                 <span className="text-lg font-black text-slate-900">~{token.estimatedWaitTime} <span className="text-xs text-slate-400">MINS</span></span>
                               </div>
                               <div className="w-px h-8 bg-slate-100"></div>
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</span>
                                 <span className="text-lg font-black text-slate-900">#{token.position} <span className="text-xs text-slate-400">IN LINE</span></span>
                               </div>
                             </div>
                          )}
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 self-end sm:self-center">
                          <Link to={`/token/${token._id}`} className="btn-primary py-2 px-6 text-xs uppercase tracking-widest">
                            <ExternalLink className="w-4 h-4" /> Track Live
                          </Link>
                          {["waiting", "pending"].includes(token.status) && (
                            <button onClick={() => cancelToken(token._id)} className="text-xs font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors px-2 py-1">
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}