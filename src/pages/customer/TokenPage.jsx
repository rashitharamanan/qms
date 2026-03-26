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
  const displayIdx = status === 'pending' ? -0.5 : currentIdx;

  return (
    <div className="flex justify-between items-center relative px-2 py-4 md:py-5 w-full mt-2">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
      <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-lavender to-indigo-500 transition-all duration-1000 -translate-y-1/2 z-0 rounded-full" 
           style={{ width: `${Math.max(0, displayIdx) / (steps.length - 1) * 100}%` }} />
      
      {steps.map((step, idx) => (
        <div key={step.id} className="relative z-10 flex flex-col items-center gap-1 md:gap-2">
          <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-700 shadow-sm ${
            idx <= displayIdx 
              ? 'bg-white border-lavender text-lavender scale-110' 
              : 'bg-white border-slate-100 text-slate-300'
          }`}>
            <span className="text-lg md:text-xl">{idx < displayIdx ? '✓' : step.icon}</span>
          </div>
          <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.15em] ${idx <= displayIdx ? 'text-slate-900' : 'text-slate-400'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const TravelInfo = ({ shopLocation, shopName, queueWaitTime, tokenStatus }) => {
  const [userLoc, setUserLoc] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getTravelData = async () => {
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      const { latitude: uLat, longitude: uLng } = pos.coords;
      setUserLoc({ lat: uLat, lng: uLng });

      let sLat, sLng;
      if (shopLocation?.coordinates?.lat && shopLocation.coordinates.lat !== 0) {
        sLat = shopLocation.coordinates.lat;
        sLng = shopLocation.coordinates.lng;
      } else {
        const addressQuery = `${shopLocation?.address || shopName}, ${shopLocation?.city || ''}, ${shopLocation?.state || ''}`;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`);
        const geoData = await geoRes.json();
        
        if (!geoData || geoData.length === 0) {
          throw new Error('Could not pinpoint shop location exactly.');
        }
        sLat = geoData[0].lat;
        sLng = geoData[0].lon;
      }

      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${sLng},${sLat}?overview=false`);
      const routeData = await routeRes.json();

      if (routeData.code === 'Ok' && routeData.routes.length > 0) {
        setRouteInfo({
          distance: (routeData.routes[0].distance / 1000).toFixed(1),
          duration: Math.ceil(routeData.routes[0].duration / 60),
          sLat, sLng
        });
      } else {
        throw new Error('Could not calculate route.');
      }
    } catch (err) {
      setError(err.message || 'Location access denied or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopLocation) getTravelData();
  }, [shopLocation]);

  const mapQuery = encodeURIComponent(`${shopLocation?.address || ''} ${shopLocation?.city || ''} ${shopName}`);

  let recommendation = null;
  if (tokenStatus === 'called') {
    recommendation = { text: `You've been called! The counter is waiting for you right now. Proceed immediately!`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  } else if (routeInfo && queueWaitTime !== undefined) {
    const travelTime = routeInfo.duration;
    const dif = queueWaitTime - travelTime;

    if (dif < 0) {
      recommendation = { text: `Leave immediately! Travel takes ${travelTime}m but wait is only ${queueWaitTime}m.`, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
    } else if (dif <= 5) {
      recommendation = { text: `Perfect time to leave now! You'll reach just in time.`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    } else if (dif <= 15) {
      recommendation = { text: `Get ready. You should leave in about ${dif - 5} minutes.`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    } else {
      recommendation = { text: `Relax, plenty of time. Leave in ${dif - 5} minutes.`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  }

  return (
    <div className="glass-card border-none overflow-hidden bg-white/40 group relative">
      <div className="h-32 w-full bg-slate-200 relative">
         <iframe 
            width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}>
         </iframe>
         {loading && (
           <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase text-slate-500 mt-3 tracking-widest">Calculating Route...</span>
           </div>
         )}
      </div>
      
      <div className="p-5 md:p-6 flex flex-col gap-4">
        {/* Header and Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-lavender" />
            Travel Estimate
          </h3>

          {routeInfo && (
            <a href={`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${routeInfo.sLat},${routeInfo.sLng}&travelmode=driving`}
               target="_blank" rel="noreferrer"
               className="shadow-md shadow-lavender/30 px-5 py-2.5 rounded-full flex gap-2 items-center justify-center text-[10px] md:text-xs bg-lavender hover:bg-lavender-dark text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
               <MapPin size={14} /> Start Navigation
            </a>
          )}
          {!routeInfo && !loading && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
               target="_blank" rel="noreferrer"
               className="shadow-md shadow-lavender/30 px-5 py-2.5 rounded-full flex gap-2 items-center justify-center text-[10px] md:text-xs bg-lavender hover:bg-lavender-dark text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
               <MapPin size={14} /> Get Directions
            </a>
          )}
        </div>

        {error && !loading && (
           <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 font-bold">
             {error} Open Google Maps for precise directions.
           </div>
        )}

        {recommendation && !loading && (
           <div className={`p-4 rounded-2xl border ${recommendation.border} ${recommendation.bg} flex gap-3 items-center shadow-sm`}>
             <div className="animate-pulse flex-shrink-0">
                {recommendation.bg.includes('emerald') || recommendation.bg.includes('rose') ? '🏃‍♂️' : '⏳'}
             </div>
             <div className={`text-xs md:text-sm font-bold ${recommendation.color}`}>
               {recommendation.text}
             </div>
           </div>
        )}

        {routeInfo && !loading && (
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white/60 p-4 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
               <span className="text-2xl md:text-3xl font-black text-slate-900">{routeInfo.distance} <span className="text-[10px] md:text-sm">KM</span></span>
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Driving Distance</span>
            </div>
            <div className="bg-gradient-to-br from-lavender-pale to-white border-lavender-light/30 border p-4 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-lavender/10 rounded-full blur-xl -mr-8 -mt-8" />
               <span className="text-2xl md:text-3xl font-black text-slate-900">{routeInfo.duration} <span className="text-[10px] md:text-sm">MIN</span></span>
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Travel Time</span>
               <div className="mt-2 text-[8px] md:text-[10px] font-black text-lavender-dark tracking-widest bg-white/50 px-3 py-1 rounded-full w-full truncate">
                 REACH BY {new Date(Date.now() + routeInfo.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            </div>
          </div>
        )}
      </div>
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

  const { token, position, estimatedWaitTime, ahead, avgServiceTime } = tokenData;
  const status = statusConfig[token.status] || statusConfig.waiting;
  const isActive = ['waiting', 'called', 'in-service', 'pending'].includes(token.status);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 h-[100dvh] flex flex-col fade-in overflow-hidden">
      {/* Top Header - strict fixed height */}
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
        <Link to="/my-tokens" className="group flex items-center gap-3 text-slate-500 font-bold hover:text-lavender transition-colors">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-lavender group-hover:text-white group-hover:border-lavender transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="uppercase tracking-widest text-[10px] md:text-xs font-black">Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-5 md:py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm">
          <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Live Sync Active</span>
        </div>
      </div>

      {/* Main Grid: remaining available height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Main App Focus (Fixed full height) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col relative w-full">
          
          <div className="relative flex-1 h-full min-h-0 flex flex-col w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-lavender to-indigo-600 rounded-[2.5rem] md:rounded-[3rem] blur opacity-20 transition duration-1000"></div>
            <div className="relative glass-card border-none overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-6 h-full w-full rounded-[2rem] md:rounded-[2.5rem] bg-white/60 flex flex-col justify-start items-center">
              {/* Header Info */}
              <div className="flex flex-col items-center text-center flex-shrink-0 w-full mb-3 md:mb-5">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2 rounded-full mb-2 md:mb-3 border shadow-sm ${status.border} ${status.bg} ${status.color}`}>
                  <span className="text-base md:text-lg">{status.icon}</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                </div>
                
                <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">{token.shopId?.shopName}</h1>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] md:text-xs">
                   <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                   <span>{token.shopId?.location?.city || 'In-store Service'}</span>
                </div>
              </div>

              {/* Token Number Display */}
              <div className="relative flex justify-center flex-shrink-0 my-2 md:my-4 w-full group">
                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-3xl md:rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center relative z-10 p-2 md:p-3 border border-white/40 transition-transform duration-500 group-hover:scale-105 mx-auto ${
                  isActive ? 'gradient-bg' : 'bg-slate-100 text-slate-400'
                }`}>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-60 mb-1">Your Token</span>
                  <span className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter shadow-black/10 drop-shadow-md leading-none w-full text-center break-words px-2">{token.tokenNumber}</span>
                </div>
                {/* Background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 bg-lavender/10 rounded-full blur-2xl md:blur-3xl" />
              </div>

              {/* ETA Progress */}
              <div className="flex-shrink-0 w-full px-1 md:px-4 mt-auto">
                 {isActive && <ProgressSteps status={token.status} />}
              </div>

              {/* Action Call for 'Called' status */}
              {token.status === 'called' && (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 md:p-5 text-center shadow-xl shadow-blue-100/50 space-y-2.5 md:space-y-3 mt-4 flex-shrink-0 w-full relative z-50">
                  <div className="animate-pulse">
                    <div className="text-blue-600 font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-1">Proceed to Counter</div>
                    <p className="text-blue-800 font-bold text-xs md:text-sm leading-tight">It's your turn! Staff is waiting.</p>
                  </div>
                  <button 
                    onClick={handleCheckIn}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer relative z-50"
                  >
                    I'm Here / Check-in Now
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Details & Travel Estimate (Scrollable natively) */}
        <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto pb-6 space-y-5 scrollbar-hide select-none rounded-[2rem] md:rounded-3xl">

          {/* Stats Grid */}
          {isActive && token.status !== 'completed' && (
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <div className="glass-card p-5 md:p-8 flex flex-col items-center gap-3 md:gap-4 border-none bg-white/40 hover:-translate-y-1 transition-all shadow-sm">
                <span className="w-12 h-12 md:w-14 md:h-14 bg-lavender-pale rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner text-white">⏳</span>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{estimatedWaitTime} <span className="text-[10px] md:text-xs font-bold opacity-70">MIN</span></span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Wait Time</span>
                </div>
              </div>
              <div className="glass-card p-5 md:p-8 flex flex-col items-center gap-3 md:gap-4 border-none bg-white/40 hover:-translate-y-1 transition-all shadow-sm">
                <span className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl md:text-2xl text-indigo-500">👥</span>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{ahead} <span className="text-[10px] md:text-xs font-bold opacity-70">AHEAD</span></span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-1">In Queue</span>
                </div>
              </div>
            </div>
          )}

          {/* Travel Information */}
          {isActive && token.status !== 'completed' && (
            <TravelInfo shopLocation={token.shopId?.location} shopName={token.shopId?.shopName} queueWaitTime={estimatedWaitTime} tokenStatus={token.status} />
          )}

          {/* Details List */}
          <div className="glass-card border-none p-6 md:p-8 bg-white/40 shadow-sm relative overflow-hidden">
            <h3 className="font-black text-slate-900 text-base md:text-lg flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-lg bg-lavender-pale flex items-center justify-center shadow-inner"><Zap className="w-4 h-4 text-lavender" /></span>
              Session Details
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-100">
                 <span className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Service</span>
                 <span className="text-slate-900 font-black text-xs md:text-sm text-right max-w-[50%] truncate">{token.serviceId?.serviceName}</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-100">
                 <span className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Estimated Time</span>
                 <span className="text-slate-900 font-black text-xs md:text-sm">~{token.serviceId?.estimatedTime || 15} mins</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3">
                 <span className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Joined At</span>
                 <span className="text-slate-900 font-black text-xs md:text-sm">{new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Live View Button */}
          <Link to={`/queue/live/${token.shopId?._id}/${token.serviceId?._id}`}
            className="w-full h-14 md:h-16 glass-card border-none bg-slate-900 text-white flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:-translate-y-1 mb-4 mt-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-lavender" />
            View Public Queue List
          </Link>

        </div>
      </div>
    </div>
  );
}
