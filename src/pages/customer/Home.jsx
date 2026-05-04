import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, Star, MapPin, Clock, Users, Sparkles, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Light clean theme
const P = {
  plum:    '#4A2766',
  base:    '#7B5C9E',
  mid:     '#9B7CBD',
  light:   '#C9ABDF',
  pale:    '#EDE8F4',
};

export default function Home() {
  const { user } = useAuth();
  const [shops, setShops]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [cat, setCat]               = useState('all');
  const [focused, setFocused]       = useState(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState(null);
  const [locationText, setLocationText] = useState("Select Location");
  const [showLocModal, setShowLocModal] = useState(false);
  const [locInput, setLocInput] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // default, nearest, rating, waitTime
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const getCurrentLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationText("Current Location");
          setLocLoading(false);
          setShowLocModal(false);
        },
        () => {
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocLoading(false);
    }
  };

  const handleManualLocation = async (e) => {
    e.preventDefault();
    if (!locInput) return;
    setLocLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locInput)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setUserLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setLocationText(locInput);
        setShowLocModal(false);
      }
    } catch(err) {
      console.error("Geocoding error", err);
    }
    setLocLoading(false);
  };

  useEffect(() => {
    // Auto-fetch location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationText("Current Location");
        },
        () => console.log('Geolocation denied'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([api.get('/shops'), api.get('/categories')]);
        setShops(s.data.data);
        setCategories(c.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', emoji: '☀️', color: '#FFD580' };
    if (h < 17) return { text: 'Good Afternoon', emoji: '👋', color: '#FFC0CB' };
    return { text: 'Good Evening', emoji: '🌙', color: '#B0C4DE' };
  }, []);

  const firstName = user?.name?.split(' ')[0] || '';

  // Calculate distance between two coordinates (Haversine formula)
  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }, []);

  const filtered = useMemo(() => {
    let result = shops.filter(s =>
      s.shopName.toLowerCase().includes(query.toLowerCase()) &&
      (cat === 'all' || s.category?._id === cat)
    );

    // Apply open filter
    if (showOpenOnly) result = result.filter(s => s.isOpen);

    // Add distance to each shop
    result = result.map(s => ({
      ...s,
      distance: userLocation && s.location?.coordinates?.lat
        ? getDistance(userLocation.lat, userLocation.lng, s.location.coordinates.lat, s.location.coordinates.lng)
        : null
    }));

    // Apply sort
    if (sortBy === 'nearest') {
      result.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'waitTime') {
      result.sort((a, b) => (a.waitTime || 0) - (b.waitTime || 0));
    }

    return result;
  }, [shops, query, cat, showOpenOnly, sortBy, userLocation, getDistance]);

  // ── 3D card tilt ──
  const onCardMove = useCallback((e) => {
    const el = e.currentTarget;
    el.style.transition = 'box-shadow 0.1s ease';
    const r  = el.getBoundingClientRect();
    const x  = e.clientX - r.left, y = e.clientY - r.top;
    const cx = r.width / 2,       cy = r.height / 2;
    const rx = ((y - cy) / cy) * -9;
    const ry = ((x - cx) / cx) * 9;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(14px)`;
    el.style.boxShadow = `${ry * -2}px ${rx * -2}px 30px rgba(50,20,80,0.25), 0 24px 60px rgba(40,10,70,0.38)`;
    const shine = el.querySelector('.card-shine');
    if (shine) { shine.style.opacity = '1'; shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.28) 0%, transparent 60%)`; }
  }, []);
  const onCardEnter = useCallback((e) => { e.currentTarget.style.transition = 'none'; }, []);
  const onCardLeave = useCallback((e) => {
    const el = e.currentTarget;
    el.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
    el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.boxShadow  = '0 4px 20px rgba(40,10,70,0.22)';
    const shine = el.querySelector('.card-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  if (loading) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div></MainLayout>;

  return (
    <MainLayout>
      <style>{`
        @keyframes orb-a {
          0%,100% { transform: translate(0,0) scale(1); opacity:.55; }
          33%      { transform: translate(50px,-60px) scale(1.15); opacity:.75; }
          66%      { transform: translate(-30px,30px) scale(.93); opacity:.45; }
        }
        @keyframes orb-b {
          0%,100% { transform: translate(0,0) scale(1); opacity:.45; }
          50%      { transform: translate(-55px,-40px) scale(1.20); opacity:.68; }
        }
        @keyframes orb-c {
          0%,100% { transform: translate(0,0) scale(1.1); opacity:.40; }
          40%      { transform: translate(35px,45px) scale(.88); opacity:.60; }
          80%      { transform: translate(-20px,-25px) scale(1.05); opacity:.50; }
        }
        @keyframes orb-d {
          0%,100% { transform: translate(0,0); opacity:.50; }
          60%      { transform: translate(40px,-35px) scale(1.12); opacity:.70; }
        }
        @keyframes particle-bob {
          0%,100% { transform: translateY(0) rotate(0deg); opacity:.55; }
          50%      { transform: translateY(-22px) rotate(180deg); opacity:.20; }
        }
        @keyframes badge-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes name-glow {
          0%,100% { text-shadow: 0 0 20px rgba(220,190,255,0.40); }
          50%      { text-shadow: 0 0 40px rgba(220,190,255,0.80), 0 0 80px rgba(180,140,230,0.30); }
        }
        .card-3d {
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.1s ease, box-shadow 0.3s ease;
        }
        .card-shine {
          position: absolute; inset: 0; border-radius: inherit;
          pointer-events: none; z-index: 20; opacity: 0;
          transition: opacity 0.3s ease;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-slate-50/50">

        {/* ── LOCATION SELECTOR MODAL ── */}
        {showLocModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative" style={{ animation: 'nav-slide-in 0.2s ease' }}>
              <button onClick={() => setShowLocModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><span className="text-2xl leading-none">&times;</span></button>
              <h2 className="text-xl font-black text-slate-800 mb-5">Where are you?</h2>
              
              <button 
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all mb-4"
                disabled={locLoading}
              >
                <MapPin size={18} />
                {locLoading && locationText === 'Select Location' ? 'Detecting...' : 'Use Current Location'}
              </button>

              <div className="flex items-center gap-3 mb-4 text-slate-400">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-bold uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <form onSubmit={handleManualLocation}>
                <label className="block text-sm font-bold text-slate-700 mb-2">Type your address</label>
                <input 
                  type="text" 
                  value={locInput} 
                  onChange={(e) => setLocInput(e.target.value)}
                  placeholder="e.g. New York, NY" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 text-slate-700 font-medium placeholder:text-slate-400"
                />
                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-2xl text-white font-bold transition-all shadow-md active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base})` }}
                  disabled={locLoading}
                >
                  {locLoading && locInput ? 'Searching...' : 'Set Location'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Removed orbs based on user feedback */}

        {/* ── PAGE CONTENT ── */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-10 py-4 space-y-4">

          {/* ══════════════════════════════════════════
              HERO HEADER — Redesigned layout
              Left: badge + greeting stack
              Right: quick stats / CTA
          ══════════════════════════════════════════ */}
          <header>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

              {/* Left — greeting */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <button onClick={() => setShowLocModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors border border-purple-100">
                    <MapPin size={12} />
                    <span className="truncate max-w-[150px]">{locationText}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl flex-shrink-0" style={{ animation: 'badge-float 3s ease-in-out infinite 0.5s' }}>
                    {greeting.emoji}
                  </span>
                  <h1 className="font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight leading-tight">
                    {greeting.text}
                    {firstName && (
                      <>,{' '}
                        <span style={{
                          background: `linear-gradient(135deg, ${P.plum}, ${P.base})`,
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                          {firstName}
                        </span>
                      </>
                    )}
                  </h1>
                </div>
              </div>

              {/* Right — Moved Search Bar Here */}
              <div className="flex items-center gap-2 w-full lg:w-96 xl:w-[400px]">
                <div className={`relative flex-1 bg-white rounded-2xl border transition-all duration-300 ${focused ? 'border-[#C9ABDF] shadow-lg shadow-[#9B7CBD]/10 scale-[1.02]' : 'border-slate-200 shadow-sm'}`}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search shops, services..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-0 focus:outline-none text-slate-700 font-semibold text-sm placeholder:text-slate-400 bg-transparent transition-all"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                    />
                  </div>
                </div>
                {/* Filter button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 shadow-sm relative"
                  style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, color: '#fff', boxShadow: '0 4px 12px rgba(90,58,120,0.25)' }}
                >
                  <SlidersHorizontal size={18} />
                  {(sortBy !== 'default' || showOpenOnly) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* ══════════════════════════════════════════
              FILTER PANEL (slides down)
          ══════════════════════════════════════════ */}
          {showFilters && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-lg space-y-4" style={{ animation: 'nav-slide-in 0.2s ease' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Sort & Filter</h3>
                <button onClick={() => { setSortBy('default'); setShowOpenOnly(false); }} className="text-xs font-bold text-purple-500 hover:text-purple-700">Reset</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'default', label: '🔄 Default' },
                  { value: 'nearest', label: '📍 Nearest' },
                  { value: 'rating', label: '⭐ Top Rated' },
                  { value: 'waitTime', label: '⏱️ Shortest Wait' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={sortBy === opt.value
                      ? { background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, color: '#fff', boxShadow: '0 2px 8px rgba(90,58,120,0.25)' }
                      : { background: '#f8f7fc', color: '#64748b', border: '1px solid #e2e8f0' }
                    }
                  >{opt.label}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOpenOnly} onChange={e => setShowOpenOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-600" />
                <span className="text-xs font-bold text-slate-600">Show open shops only</span>
              </label>
            </div>
          )}

          {/* ══════════════════════════════════════════
              CATEGORY PILLS  +  SEARCH BAR  (same row)
          ══════════════════════════════════════════ */}
          <div className="flex items-center gap-3">
            {/* Category pills — scrollable, takes full width now */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
              {[{ _id: 'all', name: 'All' }, ...categories].map((c) => {
                const active = cat === c._id;
                return (
                  <button key={c._id} onClick={() => setCat(c._id)}
                    className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
                    style={active
                      ? { background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, color: '#fff', boxShadow: `0 4px 12px rgba(90,58,120,0.25)` }
                      : { background: 'white', color: P.textSub, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
                    }
                  >{c.name}</button>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              SECTION TITLE
          ══════════════════════════════════════════ */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, boxShadow: `0 4px 12px rgba(90,58,120,0.25)` }}>
                <TrendingUp size={15} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Nearby Places</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: P.pale, color: P.base, border: `1px solid ${P.light}` }}>
              {filtered.length} found
            </span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

          {/* ══════════════════════════════════════════
              3D SHOP CARDS
          ══════════════════════════════════════════ */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="text-5xl mb-4 grayscale opacity-40">🔍</div>
              <h3 className="font-black text-slate-800 text-lg mb-1">No shops found</h3>
              <p className="text-slate-500 font-medium text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-10">
              {filtered.map((shop, i) => (
                <Link
                  key={shop._id} to={`/shops/${shop._id}`}
                  className="group relative rounded-[2rem] flex flex-col overflow-hidden cursor-pointer bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(107,74,126,0.12)]"
                  style={{ 
                    border: '1px solid rgba(220,210,230,0.6)', 
                    boxShadow: '0 10px 30px rgba(40,10,70,0.06)',
                    animation: `nav-slide-in ${0.3 + (i * 0.1)}s ease backwards`
                  }}
                >
                  {/* Image Header */}
                  <div className="relative w-full h-48 overflow-hidden rounded-t-[2rem]">
                    <img
                      src={shop.logo || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=80'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      alt={shop.shopName}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest shadow-lg flex items-center gap-1.5 ${
                        shop.isOpen ? 'bg-emerald-500/95 text-white backdrop-blur-md' : 'bg-slate-800/80 backdrop-blur-md text-white'
                      }`}>
                        {shop.isOpen && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {shop.isOpen ? 'OPEN NOW' : 'CLOSED'}
                      </div>
                      
                      {shop.category?.name && (
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {shop.category.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="p-5 flex-1 flex flex-col space-y-3 relative">
                    <div className="absolute -top-7 right-5 w-12 h-12 rounded-full bg-white shadow-[0_8px_20px_rgba(40,10,70,0.15)] border border-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      <span className="font-black text-2xl -mt-1 ml-1 scale-y-150">›</span>
                    </div>

                    <div className="pr-12">
                      <h3 className="font-extrabold text-xl text-slate-900 leading-tight group-hover:text-purple-700 transition-colors">
                        {shop.shopName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-slate-500 font-bold text-sm">
                        <MapPin size={14} className="text-purple-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{shop.location?.address?.split(',')[0] || 'Location unknown'}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="text-purple-700 shrink-0 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider bg-purple-100/50">
                          {shop.distance != null ? `${shop.distance} km` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 pt-3 mt-1 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="font-black text-amber-600 text-sm">{shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded-xl border border-purple-100/50">
                        <Clock size={14} className="text-purple-600" />
                        <span className="font-black text-purple-800 text-sm">~{shop.avgServiceTime || 15}m</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                        <Users size={14} className="text-slate-500" />
                        <span className="font-black text-slate-700 text-sm">{shop.totalAhead || 0} wait</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}