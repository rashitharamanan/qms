import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, Users, ArrowLeft, ChevronRight, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  // Pre-booking states
  const [bookingService, setBookingService] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    api.get(`/shops/${id}`).then(r => {
      setShop(r.data.shop);
      setServices(r.data.services || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const joinQueue = async (serviceId, isPreBooking = false) => {
    if (!user) {
      toast.error('Please login to join queue');
      navigate('/login');
      return;
    }

    if (isPreBooking && (!scheduledDate || !scheduledTime)) {
      toast.error('Please select both date and time');
      return;
    }

    setJoining(serviceId);
    try {
      const payload = { shopId: id, serviceId };
      if (isPreBooking) {
        payload.scheduledDate = scheduledDate;
        payload.scheduledTime = scheduledTime;
      }

      const { data } = await api.post('/queue/join', payload);

      if (isPreBooking) {
        toast.success(`🎟 Pre-booking request sent to vendor for approval!`);
        setBookingService(null);
      } else {
        toast.success(`🎟 Token ${data.token.tokenNumber} generated!`);
      }
      navigate(`/token/${data.token._id}`);

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to process request');
    } finally {
      setJoining(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-8 bg-white/20 rounded-2xl w-1/3" />
        <div className="h-52 bg-white/10 rounded-3xl" />
        <div className="h-40 bg-white/10 rounded-3xl" />
      </div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-black text-white mb-2">Shop Not Found</h2>
      <p className="text-purple-200/70 mb-6 font-medium">This shop may have been removed.</p>
      <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-2xl bg-white text-purple-800 font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute top-[-50px] right-[-50px] w-[280px] h-[280px] rounded-full bg-purple-500/20 blur-[90px]" />
        <div className="animate-float-slow absolute bottom-[20%] left-[-60px] w-[200px] h-[200px] rounded-full bg-violet-600/15 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6 fade-in">

        {/* Back button — text version on dark bg */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm transition-colors group"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center group-hover:bg-white/25 transition-all backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Shops
        </button>

        {/* Shop Header Card — WHITE on dark bg */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.40)]">

          {/* Banner */}
          <div className="h-32 sm:h-44 relative overflow-hidden">
            <img
              src={shop.logo || `https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80`}
              className="w-full h-full object-cover"
              alt={shop.shopName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

            <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border backdrop-blur-md ${shop.isOpen
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-slate-800/80 text-slate-300 border-slate-600'
              }`}>
              <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
              {shop.isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>

          {/* Shop info */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                <span className="text-white">{shop.category?.icon || '🏪'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{shop.shopName}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider border border-purple-200">
                    {shop.category?.name || 'Service'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-black text-amber-500">4.8</span>
                  </div>
                </div>
                {shop.description && (
                  <p className="text-slate-500 text-sm font-medium mt-2">{shop.description}</p>
                )}
              </div>
            </div>

            {(shop.location?.address || shop.location?.city) && (
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium pt-3 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>{[shop.location.address, shop.location.city, shop.location.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services — WHITE cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <Zap size={13} className="text-white" />
            </span>
            Available Services
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-purple-200 text-[11px] font-bold border border-white/20">
              {services.length}
            </span>
          </h2>

          {services.length === 0 ? (
            <div className="bg-white rounded-3xl py-16 text-center shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-400 font-medium">No services available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map(service => (
                <div
                  key={service._id}
                  className="group bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_36px_rgba(0,0,0,0.38)] hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                      {service.serviceName}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-slate-500 font-medium">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Clock className="w-4 h-4 text-purple-400" />
                        ~{service.estimatedTime} min/person
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Users className="w-4 h-4 text-purple-400" />
                        {service.waitingCount || 0} waiting
                      </div>
                      {service.price > 0 && (
                        <span className="font-black text-purple-700 text-sm">₹{service.price}</span>
                      )}
                    </div>
                    {service.waitingCount > 0 && (
                      <div className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl w-fit">
                        ⏱ Est. wait: ~{service.waitingCount * service.estimatedTime} min
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap justify-end">
                    <button
                      onClick={() => setBookingService(service._id)}
                      className="px-5 py-2.5 rounded-2xl border-2 border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 transition-all active:scale-95 shadow-sm bg-white"
                    >
                      Pre-Book
                    </button>
                    <button
                      onClick={() => joinQueue(service._id, false)}
                      disabled={!shop.isOpen || joining === service._id}
                      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all ${!shop.isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                    >
                      {joining === service._id && !bookingService ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <ChevronRight size={14} />}
                      {shop.isOpen ? 'Join Now' : 'Closed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Pre-Book Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative transform transition-all">
            <button onClick={() => setBookingService(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Pre-Book Slot</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Select a future date and time to reserve your spot.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => joinQueue(bookingService, true)}
              disabled={joining === bookingService || !scheduledDate || !scheduledTime}
              className="w-full mt-8 py-4 rounded-xl font-black uppercase tracking-wider text-xs text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              {joining === bookingService ? 'Sending Request...' : 'Confirm Pre-Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
