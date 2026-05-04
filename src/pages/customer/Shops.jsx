import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, Filter, Star, Clock, ChevronRight, MapPin, X } from "lucide-react";

// White + Grey + Purple palette
const P = {
  plum:    '#4A2766',
  base:    '#7B5C9E',
  mid:     '#9B7CBD',
  light:   '#C9ABDF',
  pale:    '#EDE8F4',
  grey50:  '#F7F5FB',
  text:    '#1e1b2e',
  textSub: '#6B5F82',
};

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "" });

  useEffect(() => {
    const init = async () => {
      try {
        const [catsRes, shopsRes] = await Promise.all([api.get("/categories"), api.get("/shops")]);
        setCategories(catsRes.data.data);
        setShops(shopsRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const fetchShops = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.category) params.category = f.category;
      if (f.search) params.search = f.search;
      const { data } = await api.get("/shops", { params });
      setShops(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilter = (key, val) => {
    const nf = { ...filters, [key]: val };
    setFilters(nf);
    fetchShops(nf);
  };
  const clearFilters = () => { setFilters({ category: "", search: "" }); fetchShops({ category: "", search: "" }); };
  const hasFilters = filters.search || filters.category;

  if (loading && shops.length === 0) return (
    <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div></MainLayout>
  );

  return (
    <MainLayout>
      <div className="min-h-screen relative overflow-hidden">

        {/* Removed animated glow orbs to ensure perfectly clean background */}

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8 xl:px-14 py-10 space-y-10 fade-in">

          {/* ── Header ── */}
          <header className="text-center max-w-3xl mx-auto flex flex-col items-center slide-in-left">

            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: P.pale, border: `1px solid ${P.light}` }}>
              <MapPin size={11} style={{ color: P.base }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: P.base }}>
                Merchant Discovery
              </span>
            </div>

            <div className="mb-8 space-y-3">
              <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight"
                style={{ color: P.text }}>
                Discover{' '}
                <span style={{
                  background: `linear-gradient(135deg, ${P.plum}, ${P.base})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Services</span>
              </h1>
              <p className="font-medium text-lg" style={{ color: P.textSub }}>
                Browse shops, compare wait times, and join from anywhere
              </p>
            </div>

            {/* Search bar — white card, purple filter button */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-3xl border w-full max-w-2xl"
              style={{ borderColor: '#E5E7EB', boxShadow: `0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(92,58,138,0.08)` }}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text"
                  placeholder="Search shops, services, locations..."
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 font-semibold placeholder:text-slate-400 text-sm"
                  value={filters.search}
                  onChange={e => handleFilter("search", e.target.value)}
                />
              </div>
              <div className="hidden sm:block w-px h-10 self-center bg-slate-100" />
              <select
                className="w-full sm:w-44 px-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none font-semibold cursor-pointer appearance-none text-sm"
                style={{ color: P.textSub }}
                value={filters.category}
                onChange={e => handleFilter("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <button onClick={() => fetchShops()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base} 60%, ${P.mid})`, boxShadow: `0 4px 16px rgba(74,39,102,0.35)` }}
              >
                <Filter size={15} /> Filter
              </button>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {filters.search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: P.pale, color: P.base, border: `1px solid ${P.light}` }}>
                    🔍 "{filters.search}"
                    <button onClick={() => handleFilter("search", "")} className="hover:text-rose-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: P.pale, color: P.base, border: `1px solid ${P.light}` }}>
                    🏷 {categories.find(c => c._id === filters.category)?.name || "Category"}
                    <button onClick={() => handleFilter("category", "")} className="hover:text-rose-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs font-bold text-rose-400 hover:text-rose-500 transition-colors">Clear all</button>
              </div>
            )}
          </header>

          {/* ── Results ── */}
          <section className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black flex items-center gap-2.5" style={{ color: P.text }}>
                <span className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base})` }}>
                  <MapPin size={13} className="text-white" />
                </span>
                Available Shops
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: P.pale, color: P.base, border: `1px solid ${P.light}` }}>
                  {shops.length}
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
            ) : shops.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-100"
                style={{ boxShadow: `0 4px 20px rgba(92,58,138,0.08)` }}>
                <div className="text-6xl mb-5 grayscale opacity-40">🏪</div>
                <h3 className="text-xl font-black text-slate-600 mb-2">No matching results</h3>
                <p className="text-slate-400 font-medium">Try broadening your search criteria.</p>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="mt-6 px-6 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all"
                    style={{ borderColor: P.light, color: P.plum }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              /* WHITE cards with subtle grey shadow — clean professional look */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {shops.map((shop, i) => (
                  <Link key={shop._id} to={`/shops/${shop._id}`}
                    className={`card-enter stagger-${(i % 6) + 1} group relative bg-white rounded-3xl p-5 flex gap-5 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
                    style={{ border: `1px solid #EDE8F4`, boxShadow: `0 1px 4px rgba(0,0,0,0.04), 0 4px 18px rgba(92,58,138,0.08)` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = P.light; e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.06), 0 12px 36px rgba(92,58,138,0.16)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE8F4'; e.currentTarget.style.boxShadow = `0 1px 4px rgba(0,0,0,0.04), 0 4px 18px rgba(92,58,138,0.08)`; }}
                  >
                    {/* Soft purple shimmer on hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, rgba(237,232,244,0.50) 0%, rgba(201,171,223,0.08) 100%)` }} />

                    {/* Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={shop.logo || `https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=300&q=80`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={shop.shopName} />
                      <div className={`absolute bottom-0 inset-x-0 h-1.5 ${shop.isOpen ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    </div>

                    {/* Info */}
                    <div className="relative flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-slate-800 text-base leading-tight truncate group-hover:text-[#4A2766] transition-colors">
                            {shop.shopName}
                          </h3>
                          <ChevronRight size={16} className="flex-shrink-0 mt-0.5 text-slate-300 group-hover:translate-x-1 group-hover:text-[#9B7CBD] transition-all" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={11} fill="currentColor" />
                            <span className="text-[11px] font-black text-amber-500">4.8</span>
                          </div>
                          <span className="text-slate-200 text-xs">•</span>
                          <span className="text-slate-500 text-[11px] font-bold truncate">{shop.category?.name || "Premium Store"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          shop.isOpen
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          <Clock size={11} />{shop.isOpen ? 'Open Now' : 'Closed'}
                        </div>

                        {shop.isOpen && (
                          <div className="flex items-center gap-2">
                            {[
                              { label: 'Service', value: `${shop.avgServiceTime || 15}m` },
                              { label: 'Wait', value: `~${shop.waitTime || 0}m` },
                              { label: 'Queue', value: shop.totalAhead || 0 },
                            ].map((stat, j) => (
                              <div key={j} className="flex items-center gap-1.5">
                                {j > 0 && <div className="w-px h-6 bg-slate-100" />}
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: P.mid }}>{stat.label}</span>
                                  <span className="text-xs font-black text-slate-700">{stat.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}