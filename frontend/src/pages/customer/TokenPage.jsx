import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Users, CheckCircle, ArrowLeft, Bell, Zap, MapPin, Clock, LocateFixed, Navigation, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-white/20', text: 'text-white' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/80', text: 'text-white' },
  waiting: { label: 'In Queue', bg: 'bg-white/20', text: 'text-white' },
  called: { label: 'Your Turn', bg: 'bg-blue-500', text: 'text-white' },
  'in-service': { label: 'Serving', bg: 'bg-emerald-500/80', text: 'text-white' },
  completed: { label: 'Completed', bg: 'bg-white/20', text: 'text-white' },
  skipped: { label: 'Skipped', bg: 'bg-rose-500/80', text: 'text-white' },
  cancelled: { label: 'Cancelled', bg: 'bg-white/20', text: 'text-white' },
};

const ProgressSteps = ({ status }) => {
  const steps = [
    { id: 'waiting', label: 'Joined' },
    { id: 'called', label: 'Called' },
    { id: 'in-service', label: 'Serving' },
    { id: 'completed', label: 'Done' },
  ];
  const activeStatuses = ['waiting', 'called', 'in-service', 'completed', 'pending'];
  if (!activeStatuses.includes(status)) return null;
  const currentIdx = steps.findIndex(s => s.id === status);
  const displayIdx = status === 'pending' ? -0.5 : currentIdx;

  return (
    <div className="w-full relative px-2 py-4 mt-2">
      <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: `${Math.max(0, displayIdx) / (steps.length - 1) * 100}%` }}
        />
      </div>
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, idx) => {
          const isActive = idx <= displayIdx;
          const isCurrent = idx === Math.floor(displayIdx);
          return (
            <div key={step.id} className="flex flex-col items-center group relative w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${isActive ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110' : 'bg-transparent border-white/30'
                }`}>
                {isActive ? <CheckCircle size={14} className="text-purple-700" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/30" />}
              </div>
              <span className={`absolute top-10 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${isCurrent ? 'text-white' : isActive ? 'text-white/80' : 'text-white/40'
                }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NavigationWidget = ({ shopLocation, shopName }) => {
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { }
    );
  }, []);

  const shopPos = shopLocation?.coordinates?.lat && shopLocation.coordinates.lat !== 0
    ? { lat: shopLocation.coordinates.lat, lng: shopLocation.coordinates.lng }
    : `${shopLocation?.address || shopName}, ${shopLocation?.city || ''}`;

  return (
    <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-purple-50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Need Directions?</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live GPS tracking.</p>
        </div>
      </div>
      {userLoc && shopPos ? (
        <a href={`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${typeof shopPos === 'string' ? encodeURIComponent(shopPos) : `${shopPos.lat},${shopPos.lng}`}&travelmode=driving`}
          target="_blank" rel="noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-purple-800 transition-colors shadow-md">
          <LocateFixed size={14} />
          Start Tracking
        </a>
      ) : (
        <button disabled className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-100">
          <LocateFixed size={14} className="animate-spin-slow" />
          Locating...
        </button>
      )}
    </div>
  );
};

export default function TokenPage() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchToken = async () => {
    try { const { data } = await api.get(`/queue/token/${id}`); setTokenData(data); }
    catch (err) { }
  };

  useEffect(() => {
    fetchToken().finally(() => setLoading(false));
    const iv = setInterval(fetchToken, 15000);
    return () => clearInterval(iv);
  }, [id]);

  useEffect(() => {
    if (!socket || !tokenData) return;
    const shopId = tokenData.token?.shopId?._id;
    if (shopId) { socket.emit('join-shop', shopId); socket.on('token-called', fetchToken); socket.on('queue_updated', fetchToken); }
    return () => { socket.off('token-called'); socket.off('queue_updated'); };
  }, [socket, tokenData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('your_token_called', ({ tokenNumber }) =>
      toast.success(`🔔 Token ${tokenNumber} — It's your turn!`, { duration: 8000, style: { background: '#6B21A8', color: '#fff' } })
    );
    return () => socket.off('your_token_called');
  }, [socket]);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await api.put(`/queue/${id}/check-in`);
      toast.success('✅ Checked in! Service is starting.', { style: { background: '#6B21A8', color: '#fff' } });
      fetchToken();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally { setChecking(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-purple-50/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-purple-600 tracking-widest uppercase">Syncing Queue...</span>
      </div>
    </div>
  );

  if (!tokenData) return (
    <div className="min-h-screen bg-purple-50/30 flex items-center justify-center p-6">
      <div className="bg-white border border-purple-100 p-10 rounded-[2rem] shadow-xl text-center max-w-sm w-full mx-auto">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm font-medium">This token may have expired or been removed.</p>
        <Link to="/my-tokens" className="w-full py-3.5 block bg-purple-700 text-white rounded-xl font-bold uppercase tracking-wide hover:bg-purple-800 transition-colors">Back to Tokens</Link>
      </div>
    </div>
  );

  const { token, estimatedWaitTime, ahead } = tokenData;
  const status = statusConfig[token.status] || statusConfig.waiting;
  const isActive = ['waiting', 'called', 'in-service', 'pending'].includes(token.status);

  return (
    <div className="min-h-screen bg-purple-50/40 text-slate-800 font-sans pb-12">

      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/my-tokens" className="group flex items-center gap-3 text-slate-500 hover:text-purple-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-all text-purple-600">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black hidden sm:block">My Tokens</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-purple-700 rounded-full border border-purple-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* LEFT: Deep Purple Token Card */}
          <div className="flex flex-col gap-6 w-full max-w-[380px] mx-auto md:max-w-none md:mx-0">

            <div className={`relative bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white rounded-[2rem] p-7 shadow-2xl shadow-purple-900/20 border border-purple-600 flex flex-col items-center transition-all duration-300 ${token.status === 'called' ? 'scale-[1.02] ring-4 ring-purple-400/50' : ''}`}>

              {/* Subtle background pattern/glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md ${status.bg} ${status.text} border border-white/10 mb-6 shadow-sm`}>
                {token.status === 'called' ? <Bell className="w-3 h-3 animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                {status.label}
              </div>

              {/* Shop Identity */}
              <div className="text-center w-full mb-8 relative z-10">
                <h1 className="font-display text-2xl font-black text-white tracking-tight leading-tight">{token.shopId?.shopName}</h1>
                <div className="flex items-center justify-center gap-1.5 text-purple-200 text-xs font-semibold mt-1.5">
                  <MapPin className="w-3.5 h-3.5" />{token.shopId?.location?.city || 'In-store Service'}
                </div>
              </div>

              {/* The Token Sphere (Contrasting White inside Deep Purple) */}
              <div className="relative flex justify-center w-full mb-6 z-10">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-125"></div>
                <div className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-[4px] border-white/20 shadow-2xl relative overflow-hidden transition-all duration-500 bg-white`}>
                  <span className="text-[9px] font-black uppercase tracking-widest mb-1 text-purple-400">Token No</span>
                  <span className={`text-6xl font-display font-black tracking-tighter drop-shadow-sm text-purple-800 scale-100`}>
                    {token.tokenNumber}
                  </span>
                </div>
              </div>

              {/* Progress Bar (White on Purple) */}
              {isActive && (
                <div className="w-full mt-2 z-10 relative">
                  <ProgressSteps status={token.status} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {token.status === 'called' ? (
              <div className="rounded-[1.5rem] overflow-hidden shadow-xl border border-purple-200 animate-fade-in-up">
                <div className="bg-white p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                    <Bell className="w-7 h-7 text-blue-600 animate-bounce" />
                  </div>
                  <h3 className="font-black text-xl text-slate-800 mb-1">It's Your Turn!</h3>
                  <p className="text-slate-500 text-xs font-medium mb-5 px-4">Please proceed to the counter immediately. They are waiting for you.</p>

                  <button
                    onClick={handleCheckIn}
                    disabled={checking}
                    className="w-full py-4 bg-purple-700 text-white rounded-[1rem] font-black uppercase tracking-wider text-xs shadow-lg shadow-purple-700/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-purple-800"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {checking ? 'Checking In...' : "Check In Now"}
                  </button>
                </div>
              </div>
            ) : isActive && token.status !== 'completed' ? (
              <Link
                to={`/queue/live/${token.shopId?._id}/${token.serviceId?._id}`}
                className="w-full py-4.5 bg-white hover:bg-purple-50 hover:border-purple-200 border border-purple-100 rounded-[1.5rem] font-bold tracking-wider text-[11px] uppercase text-purple-700 flex items-center justify-center gap-2 transition-all shadow-sm group"
              >
                <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Open Live Sync Display
              </Link>
            ) : null}

          </div>

          {/* RIGHT: Stats & Session Information (White Cards) */}
          <div className="flex flex-col gap-6 w-full">

            {/* Stats Cards */}
            {isActive && !['waiting', 'completed'].includes(token.status) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-purple-50 flex flex-col justify-center items-center text-center transition-transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 text-amber-500">
                    <Clock size={22} />
                  </div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{estimatedWaitTime}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase pb-1">Min</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Est Wait</span>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-purple-50 flex flex-col justify-center items-center text-center transition-transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 text-purple-600">
                    <Users size={22} />
                  </div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{ahead}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase pb-1">Ahead</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">In Queue</span>
                </div>
              </div>
            )}

            {/* Session Overview List */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-purple-50">
              <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 mb-5 uppercase tracking-wider">
                <span className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </span>
                Session Overview
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-50 hover:bg-purple-50/50 transition-colors p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Service</span>
                  <span className="text-slate-800 font-bold text-sm tracking-tight">{token.serviceId?.serviceName}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 hover:bg-purple-50/50 transition-colors p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Duration</span>
                  <span className="text-purple-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm">~{token.serviceId?.estimatedTime || 15} mins</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 hover:bg-purple-50/50 transition-colors p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Joined</span>
                  <span className="text-slate-800 font-bold text-sm">{new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Navigation block */}
            {isActive && token.status !== 'completed' && (
              <NavigationWidget shopLocation={token.shopId?.location} shopName={token.shopId?.shopName} />
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
