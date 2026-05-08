import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import {
  Star, MapPin, Phone, Clock, Users, ArrowLeft,
  CheckCircle2, Ticket, Zap, MessageSquare, Send, ChevronRight, Shield, Bot
} from "lucide-react";

/* ── tiny hook: animate a number counting up ── */
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

/* ── Stat pill with count-up ── */
function StatPill({ icon: Icon, label, value, color }) {
  const count = useCountUp(Number(value) || 0);
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm min-w-[80px]">
      <Icon size={16} className={color} />
      <span className="text-lg font-black text-slate-800">{isNaN(Number(value)) ? value : count}</span>
      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ── Service icon mapper ── */
function getServiceIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('facial') || n.includes('face')) return '✨';
  if (n.includes('pedicure') || n.includes('foot')) return '🦶';
  if (n.includes('manicure') || n.includes('nail')) return '💅';
  if (n.includes('hair') || n.includes('haircut') || n.includes('trim')) return '✂️';
  if (n.includes('massage') || n.includes('spa')) return '💆';
  if (n.includes('wax') || n.includes('waxing')) return '🕯️';
  if (n.includes('thread') || n.includes('eyebrow')) return '👁️';
  if (n.includes('colour') || n.includes('color') || n.includes('dye')) return '🎨';
  if (n.includes('beard') || n.includes('shave')) return '🪒';
  if (n.includes('consult') || n.includes('doctor')) return '🩺';
  if (n.includes('clean') || n.includes('cleaning')) return '🧹';
  if (n.includes('repair') || n.includes('fix')) return '🔧';
  if (n.includes('teeth') || n.includes('dental')) return '🦷';
  if (n.includes('eye') || n.includes('lash')) return '👀';
  if (n.includes('body') || n.includes('scrub')) return '🧖';
  if (n.includes('bleach') || n.includes('bright')) return '⚡';
  if (n.includes('keratin') || n.includes('smooth')) return '💇';
  return '💼';
}

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Pre-booking states
  const [bookingService, setBookingService] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // AI Prediction
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/shops/" + id),
      api.get("/shops/" + id + "/services"),
      api.get("/shops/" + id + "/reviews"),
    ]).then(([shopRes, servRes, revRes]) => {
      setShop(shopRes.data.data);
      setServices(servRes.data.data);
      setReviews(revRes.data.data);
      setLoading(false);
      setTimeout(() => setVisible(true), 50);

      // Fetch AI Prediction
      setLoadingAI(true);
      api.post("/ai/predict-wait", { shopId: id })
        .then(res => setAiPrediction(res.data))
        .catch(err => console.error("AI Error:", err))
        .finally(() => setLoadingAI(false));
    });
    if (user) {
      api.get("/shops/" + id + "/reviews/check").then(res => {
        setHasReviewed(res.data.hasReviewed);
      }).catch(() => { });
    }
  }, [id, user]);

  const joinQueue = async (serviceId, isPreBooking = false) => {
    if (!user) return navigate("/login");

    if (isPreBooking && (!scheduledDate || !scheduledTime)) {
      setMessage({ type: "error", text: "Please select both date and time" });
      return;
    }

    setJoining(serviceId);
    setMessage(null);
    try {
      const payload = { shopId: id, serviceId };
      if (isPreBooking) {
        payload.scheduledDate = scheduledDate;
        payload.scheduledTime = scheduledTime;
      }

      const { data } = await api.post("/queue/join", payload);

      if (isPreBooking) {
        setMessage({ type: "success", text: "Pre-booking request placed successfully!" });
        setBookingService(null);
        navigate("/my-tokens");
      } else {
        setMessage({ type: "success", text: "Token " + data.data.tokenNumber + " assigned! Est. wait: " + data.data.estimatedWaitTime + " min" });
        navigate("/my-tokens");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to join queue" });
    } finally { setJoining(null); }
  };

  const submitReview = async () => {
    if (!user) return navigate("/login");
    try {
      setSubmittingReview(true);
      const { data } = await api.post("/reviews", { shopId: id, rating: reviewRating, comment: reviewComment });
      setReviews(prev => [{ ...data.data, customerId: { name: user.name } }, ...prev]);
      setHasReviewed(true);
      setReviewComment('');
      const allRatings = [...reviews.map(r => r.rating), reviewRating];
      const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      setShop(prev => ({ ...prev, rating: Math.round(avg * 10) / 10, totalRatings: allRatings.length }));
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit review" });
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto animate-bounce-slow shadow-lg shadow-purple-300">
            <Ticket size={28} className="text-white" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Loading shop details...</p>
        </div>
      </div>
    </MainLayout>
  );

  if (!shop) return (
    <MainLayout>
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Shop Not Found</h2>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
      </div>
    </MainLayout>
  );

  const avgRating = shop.rating || 0;

  return (
    <MainLayout>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(147,51,234,0.3); }
          50%       { box-shadow: 0 0 40px rgba(147,51,234,0.5); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .slide-left { animation: slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .glow-card { animation: glowPulse 3s ease-in-out infinite; }
        .float-badge { animation: floatBadge 2.5s ease-in-out infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .service-card { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .service-card:hover { transform: translateY(-6px) scale(1.01); }
        .join-btn { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .join-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(109,40,217,0.45); }
        .join-btn:active:not(:disabled) { transform: scale(0.96); }
        .star-btn { transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1); }
        .star-btn:hover { transform: scale(1.25); }
      `}</style>

      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="slide-left flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all shadow-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shops
        </button>

        {/* ── Hero Shop Card ── */}
        <div className="slide-up bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_30px_rgba(147,51,234,0.12)] relative">

          {/* Full-width Banner Image */}
          <div className="relative w-full h-56 sm:h-72 overflow-hidden">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-100">
                {shop.category?.icon || "🏪"}
              </div>
            )}
            {/* Dark gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Category + Status badges on image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full">
                {shop.category?.name || 'Shop'}
              </span>
              <span className={`float-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${shop.isOpen
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : 'bg-black/50 text-slate-300 border-white/20'
                }`}>
                <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                {shop.isOpen ? "Open Now" : "Closed"}
              </span>
            </div>

            {/* Shop name overlaid at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">{shop.shopName}</h1>
            </div>
          </div>

          {/* Details below image */}
          <div className="p-5 space-y-4">

            {/* Contact info: Location (Left) - Phone (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-3">
              {shop.location?.address && (
                <p className="flex items-center gap-2 text-base font-semibold text-slate-800">
                  <MapPin size={18} className="text-purple-500 shrink-0" />
                  {[shop.location.address, shop.location.city, shop.location.state].filter(Boolean).join(', ')}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {shop.phone && (
                  <p className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <Phone size={18} className="text-purple-500 shrink-0" />
                    {shop.phone}
                  </p>
                )}
                {(shop.openTime || shop.closeTime) && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    {shop.openTime || '--'} – {shop.closeTime || '--'}
                  </p>
                )}
              </div>
            </div>

            {shop.description && (
              <p className="text-base text-slate-600 leading-relaxed max-w-4xl">{shop.description}</p>
            )}

            {/* Horizontal Shop Info Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  <span className="text-sm font-black text-amber-600">{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
                  <span className="text-xs text-amber-500 font-bold whitespace-nowrap">({shop.totalRatings || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 border border-purple-100">
                  <Ticket size={14} className="text-purple-500" />
                  <span className="text-sm font-bold text-purple-700 whitespace-nowrap">Max {shop.maxQueueLimit}/day</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100">
                  <Zap size={14} className="text-violet-500" />
                  <span className="text-sm font-bold text-violet-700 whitespace-nowrap">{services.length} Services</span>
                </div>
              </div>

              {/* AI Prediction Display */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <Bot size={14} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">AI Wait Estimate</div>
                    <div className="text-sm font-black text-purple-700">
                      {loadingAI ? "Analyzing..." : aiPrediction?.estimate || "N/A"}
                    </div>
                  </div>
                </div>
                {aiPrediction?.explanation && (
                  <span className="text-[10px] text-slate-400 font-medium max-w-[200px] text-right">
                    {aiPrediction.explanation}
                  </span>
                )}
              </div>

              {/* Offers available - aligned right */}
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 shadow-sm">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </div>
                  <span className="text-sm font-black text-rose-600">Offers are available! ✨</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Message alert ── */}
        {message && (
          <div className={`slide-up rounded-2xl p-4 text-sm font-semibold border flex items-center gap-3 ${message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-600 border-rose-200"
            }`}>
            <CheckCircle2 size={18} className="shrink-0" />
            {message.text}
          </div>
        )}

        {/* ── Services Section ── */}
        <div className="slide-up delay-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Available Services</h2>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-black border border-purple-200">
              {services.length}
            </span>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-3xl py-16 text-center border border-slate-100 shadow-sm">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-slate-400 font-medium">No services available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((svc, i) => (
                <div
                  key={svc._id}
                  className={`service-card slide-up bg-white rounded-3xl border border-slate-100 shadow-[0_2px_16px_rgba(147,51,234,0.08)] hover:shadow-[0_8px_32px_rgba(147,51,234,0.18)] hover:border-purple-200 overflow-hidden`}
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  {/* Gradient top accent */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${i % 2 === 0 ? '#7c3aed, #a855f7' : '#6366f1, #8b5cf6'})` }} />

                  <div className="p-5 flex flex-col h-full">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Service icon badge */}
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
                          style={{ background: i % 2 === 0 ? 'linear-gradient(135deg,#ede9fe,#ddd6fe)' : 'linear-gradient(135deg,#faf5ff,#ede9fe)' }}>
                          {getServiceIcon(svc.serviceName)}
                        </div>
                        <h3 className="font-black text-slate-900 text-base capitalize">{svc.serviceName}</h3>
                      </div>
                      <span className="text-[10px] font-black text-purple-400 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-xl tracking-wider flex-shrink-0">
                        {svc.tokenPrefix}###
                      </span>
                    </div>

                    {svc.description && (
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{svc.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <Clock size={13} className="text-purple-400" />
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Base Time</div>
                          <div className="text-sm font-black text-slate-700">{svc.estimatedTime}m</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-purple-50 rounded-xl px-3 py-2 border border-purple-100">
                        <Clock size={13} className="text-purple-500" />
                        <div>
                          <div className="text-[9px] text-purple-400 uppercase font-bold leading-none">Wait</div>
                          <div className="text-sm font-black text-purple-700">~{svc.waitTime || 0}m</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <Users size={13} className="text-slate-400" />
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Queue</div>
                          <div className="text-sm font-black text-slate-700">{svc.ahead || 0}</div>
                        </div>
                      </div>
                      {svc.price > 0 && (
                        <div className="ml-auto">
                          <span className="text-lg font-black" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ₹{svc.price}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Join button */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setBookingService(svc._id)}
                        className="join-btn flex-1 py-3 rounded-2xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 flex items-center justify-center"
                      >
                        Pre-Book
                      </button>
                      <button
                        onClick={() => joinQueue(svc._id)}
                        disabled={!shop.isOpen || joining === svc._id}
                        className={`join-btn flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${!shop.isOpen
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'text-white shadow-[0_4px_14px_rgba(109,40,217,0.35)]'
                          }`}
                        style={shop.isOpen ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)' } : {}}
                      >
                        {joining === svc._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </>
                        ) : shop.isOpen ? (
                          <>
                            <Ticket size={15} />
                            Join Queue
                          </>
                        ) : 'Closed'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Reviews Section ── */}
        <div className="slide-up delay-400 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
              <MessageSquare size={16} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Reviews</h2>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black border border-amber-200">
              {reviews.length}
            </span>
          </div>

          <div className={`grid grid-cols-1 ${(!user || !hasReviewed) ? 'md:grid-cols-2' : ''} gap-4`}>

            {/* Write a review */}
            {(!user || !hasReviewed) && (
              <div className="slide-up delay-500">
                {user ? (
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                    <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                      <Star size={16} className="text-amber-400" fill="currentColor" />
                      Rate Your Experience
                    </h3>
                    {/* Star selector */}
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          className="star-btn"
                          onClick={() => setReviewRating(s)}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            size={28}
                            className={s <= (hoverRating || reviewRating) ? "text-amber-400" : "text-slate-200"}
                            fill={s <= (hoverRating || reviewRating) ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience... (optional)"
                      rows={3}
                      maxLength={500}
                      className="w-full p-3 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm resize-none mb-3 transition-all"
                    />
                    <button
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="join-btn w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(109,40,217,0.35)]"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                    >
                      {submittingReview ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <><Send size={15} /> Post Review</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto">
                      <Shield size={20} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Sign in to leave a review</p>
                    <button onClick={() => navigate('/login')} className="py-2.5 px-6 rounded-2xl text-sm font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Review list */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl py-12 text-center border border-slate-100 shadow-sm">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-slate-400 font-medium text-sm">Be the first to review!</p>
                </div>
              ) : (
                reviews.map((rev, i) => (
                  <div
                    key={rev._id || i}
                    className="slide-up bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all"
                    style={{ animationDelay: `${400 + i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                          {rev.customerId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 leading-none">{rev.customerId?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={11} className={s <= rev.rating ? "text-amber-400" : "text-slate-200"} fill={s <= rev.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed pl-12">{rev.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Pre-Book Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative transform transition-all slide-up">
            <button onClick={() => setBookingService(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Pre-Book Slot</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Select a future date and time to reserve your spot securely.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => joinQueue(bookingService, true)}
              disabled={joining === bookingService || !scheduledDate || !scheduledTime}
              className="w-full mt-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              {joining === bookingService ? 'Sending...' : 'Confirm Pre-Booking'}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}