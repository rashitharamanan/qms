import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Clock, Users, CheckCircle, ArrowLeft, Bell, Zap, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending Approval', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '⏳' },
  rejected: { label: 'Request Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '❌' },
  waiting: { label: 'In Queue', color: 'text-lavender', bg: 'bg-lavender-pale', border: 'border-lavender/20', icon: '⏳' },
  called: { label: 'Ready for Service', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔔' },
  'in-service': { label: 'In Service', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '⚡' },
  completed: { label: 'Service Completed', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
  skipped: { label: 'Skipped', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', icon: '⏩' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', icon: '🚫' },
};

const ProgressSteps = ({ status }) => {
  const steps = [
    { id: 'waiting', label: 'Joined', icon: '🎟️' },
    { id: 'called', label: 'Called', icon: '🔔' },
    { id: 'in-service', label: 'Serving', icon: '⚡' },
    { id: 'completed', label: 'Done', icon: '✅' }
  ];
  
  const activeStatuses = ['waiting', 'called', 'in-service', 'completed', 'pending'];
  if (!activeStatuses.includes(status)) return null;

  const currentIdx = steps.findIndex(s => s.id === status);
  // If pending, treat as between nothing and joined (idx -1 or 0)
  const displayIdx = status === 'pending' ? -0.5 : currentIdx;

  return (
    <div className="flex justify-between items-center relative px-2 mb-10 mt-4 mx-2">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
      <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-lavender to-indigo-500 transition-all duration-1000 -translate-y-1/2 z-0 rounded-full" 
           style={{ width: `${Math.max(0, displayIdx) / (steps.length - 1) * 100}%` }} />
      
      {steps.map((step, idx) => (
        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-md ${
            idx <= displayIdx 
              ? 'bg-white border-lavender text-lavender scale-110' 
              : 'bg-white border-slate-100 text-slate-300'
          }`}>
            <span className="text-xl">{idx < displayIdx ? '✓' : step.icon}</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${idx <= displayIdx ? 'text-slate-900' : 'text-slate-400'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TokenPage() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchToken = async () => {
    try {
      const { data } = await api.get(`/queue/token/${id}`);
      setTokenData(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchToken().finally(() => setLoading(false));
    const interval = setInterval(fetchToken, 15000); // More frequent for "Live" feel
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!socket || !tokenData) return;
    const shopId = tokenData.token?.shopId?._id;
    if (shopId) {
      socket.emit('join-shop', shopId);
      socket.on('token-called', fetchToken);
      socket.on('queue_updated', fetchToken);
    }
    return () => {
      socket.off('token-called');
      socket.off('queue_updated');
    };
  }, [socket, tokenData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('your_token_called', ({ tokenNumber }) => {
      toast.success(`🔔 Token ${tokenNumber} - It's your turn! Please proceed.`, { duration: 8000, icon: '🔥' });
    });
    return () => socket.off('your_token_called');
  }, [socket]);

  const handleCheckIn = async () => {
    try {
      await api.put(`/queue/${id}/check-in`);
      toast.success('Confirmed! Service starting.');
      fetchToken();
    } catch (err) {
      console.error('Check-in error:', err.response?.data);
      const msg = err.response?.data?.message || 'Check-in failed';
      const debug = err.response?.data?.debug ? ` (Status: ${err.response.data.debug.status})` : '';
      toast.error(msg + debug);
    }
  };

  if (loading) return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
      <div className="h-[400px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
    </div>
  );

  if (!tokenData) return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Token Not Found</h2>
      <p className="text-slate-500 mb-8">This token might have expired or been removed.</p>
      <Link to="/my-tokens" className="btn-primary w-full max-w-xs">Back to My Tokens</Link>
    </div>
  );

  const { token, position, estimatedWaitTime, ahead } = tokenData;
  const status = statusConfig[token.status] || statusConfig.waiting;
  const isActive = ['waiting', 'called', 'in-service', 'pending'].includes(token.status);

  return (
    <div className="max-w-md mx-auto px-6 pb-20 pt-4 space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <Link to="/my-tokens" className="group flex items-center gap-2 text-slate-500 font-bold hover:text-lavender transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-lavender group-hover:text-white group-hover:border-lavender transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-lavender to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-card border-none overflow-hidden p-8 rounded-[2.5rem] bg-white/60">
          {/* Header Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full mb-6 border ${status.border} ${status.bg} ${status.color}`}>
              <span className="text-lg">{status.icon}</span>
              <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
            </div>
            
            <h1 className="font-display text-3xl font-black text-slate-900 mb-1">{token.shopId?.shopName}</h1>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
               <MapPin className="w-4 h-4" />
               <span>{token.shopId?.location?.city || 'In-store'}</span>
            </div>
          </div>

          {/* Token Number Display */}
          <div className="relative flex justify-center mb-10">
            <div className={`w-48 h-48 rounded-[3rem] flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105 ${
              isActive ? 'gradient-bg' : 'bg-slate-100 text-slate-400'
            }`}>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Your Token</span>
                <span className="text-6xl font-display font-black tracking-tighter">{token.tokenNumber}</span>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lavender/10 rounded-full blur-3xl" />
          </div>

          {/* ETA Progress */}
          {isActive && <ProgressSteps status={token.status} />}

          {/* Action Call for 'Called' status */}
          {token.status === 'called' && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center animate-bounce shadow-xl shadow-blue-100/50 space-y-4">
              <div>
                <div className="text-blue-600 font-black uppercase tracking-widest text-xs mb-1">Proceed to Counter</div>
                <p className="text-blue-800 font-bold">It's your turn! The staff is waiting for you.</p>
              </div>
              <button 
                onClick={handleCheckIn}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                I'm Here / Check-in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {isActive && token.status !== 'completed' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 flex flex-col items-center gap-2 border-none bg-white/40 group hover:bg-lavender hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 bg-lavender-pale rounded-2xl flex items-center justify-center text-xl group-hover:bg-white/20 transition-colors">⏳</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors">{estimatedWaitTime} <span className="text-xs">MIN</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/70 transition-colors">Wait Time</span>
            </div>
          </div>
          <div className="glass-card p-6 flex flex-col items-center gap-2 border-none bg-white/40 group hover:bg-indigo-500 hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-white/20 transition-colors">👥</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors">{ahead} <span className="text-xs">AHEAD</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/70 transition-colors">In Queue</span>
            </div>
          </div>
        </div>
      )}

      {/* Details List */}
      <div className="glass-card border-none p-8 space-y-6 bg-white/40">
        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-lavender" />
          Session Details
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
             <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Service</span>
             <span className="text-slate-900 font-black">{token.serviceId?.serviceName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
             <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Estimated Time</span>
             <span className="text-slate-900 font-black">~{token.serviceId?.estimatedTime || 15} mins</span>
          </div>
          <div className="flex justify-between items-center py-3">
             <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Joined At</span>
             <span className="text-slate-900 font-black">{new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Live View Button */}
      <Link to={`/queue/live/${token.shopId?._id}/${token.serviceId?._id}`}
        className="w-full h-16 glass-card border-none bg-slate-900 text-white flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
        <Users className="w-5 h-5 text-lavender" />
        View Public Queue List
      </Link>
    </div>
  );
}
