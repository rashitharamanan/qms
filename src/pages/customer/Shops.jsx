import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, Filter, Star, Clock, MapPin, ChevronRight } from "lucide-react";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "" });

  useEffect(() => {
    const init = async () => {
      try {
        const [catsRes, shopsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/shops")
        ]);
        setCategories(catsRes.data.data);
        setShops(shopsRes.data.data);
      } catch (err) {
        console.error("Error loading shops data:", err);
      } finally {
        setLoading(false);
      }
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
    } catch (err) {
      console.error("Error filtering shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (key, val) => {
    const nf = { ...filters, [key]: val };
    setFilters(nf);
    fetchShops(nf);
  };

  if (loading && shops.length === 0) return <MainLayout><LoadingSpinner size="lg" /></MainLayout>;

  return (
    <MainLayout>
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[120px] -ml-64 -mt-64 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[110px] -mr-40 truncate"></div>

        <div className="w-full px-4 sm:px-8 xl:px-16 py-10 max-w-[1700px] mx-auto space-y-16 fade-in relative z-10">

          {/* Search & Header */}
          <header className="space-y-10 text-center max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender/10 text-lavender-dark text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-lavender/20 mb-2">
                Merchant Discovery
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">Discover Services</h1>
              <p className="text-slate-500 font-bold text-xl">Browse premium shops and salons in your area</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/80 backdrop-blur-2xl p-3 rounded-[3rem] shadow-2xl shadow-lavender/10 border border-white/50">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lavender transition-all" size={20} />
                <input
                  type="text"
                  placeholder="Search shops, services, or locations..."
                  className="w-full pl-16 pr-6 py-6 bg-transparent border-none focus:ring-0 text-slate-700 font-bold placeholder:text-slate-300 transition-all"
                  value={filters.search}
                  onChange={(e) => handleFilter("search", e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto h-px sm:h-10 sm:w-px bg-slate-100 hidden sm:block" />
              <select
                className="w-full sm:w-auto px-10 py-6 bg-transparent border-none focus:ring-0 text-slate-500 font-bold cursor-pointer appearance-none"
                value={filters.category}
                onChange={(e) => handleFilter("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <button className="w-full sm:w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white shadow-xl shadow-lavender/30 active:scale-95 transition-all">
                <Filter size={24} />
              </button>
            </div>
          </header>

          {/* Results Grid Wrapper */}
          <div className="bg-white/30 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-white/60 shadow-2xl shadow-lavender/5">
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <MapPin className="text-lavender" />
                  Available Shops
                  <span className="text-slate-300 font-bold ml-1">({shops.length})</span>
                </h2>
                {(filters.search || filters.category) && (
                  <button
                    onClick={() => { setFilters({ category: "", search: "" }); fetchShops({ category: "", search: "" }); }}
                    className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                  >
                    Clear all filters ✕
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full py-20 flex justify-center"><LoadingSpinner /></div>
                ) : shops.length === 0 ? (
                  <div className="col-span-full py-24 text-center glass-card border-dashed max-w-2xl mx-auto w-full">
                    <div className="text-6xl mb-6 grayscale opacity-30">🏪</div>
                    <h3 className="text-xl font-black text-slate-400 mb-2">No matching results</h3>
                    <p className="text-slate-400 font-medium italic">Try broadening your search criteria.</p>
                  </div>
                ) : (
                  shops.map((shop, i) => (
                    <Link
                      key={shop._id}
                      to={`/shops/${shop._id}`}
                      className="glass-card p-5 flex items-center gap-6 group hover:border-lavender transition-all relative overflow-hidden"
                    >
                      <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-inner bg-slate-50 flex-shrink-0 relative">
                        <img
                          src={shop.logo || `https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=300&q=80`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute bottom-0 inset-x-0 h-1 ${shop.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-black text-slate-900 text-lg leading-tight truncate group-hover:text-lavender transition-colors">{shop.shopName}</h3>
                            <ChevronRight className="text-slate-200 group-hover:text-lavender group-hover:translate-x-1 transition-all flex-shrink-0" size={18} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star size={12} fill="currentColor" />
                              <span className="text-[10px] font-black tracking-widest uppercase">4.8</span>
                            </div>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase truncate">{shop.category?.name || "Premium Store"}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${shop.isOpen
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}>
                            <Clock size={12} />
                            <span className="text-[10px] font-black tracking-widest uppercase">{shop.isOpen ? 'Open Now' : 'Closed'}</span>
                          </div>

                          {shop.isOpen && (
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service</span>
                                <span className="text-xs font-black text-slate-700">{shop.avgServiceTime || 15}m</span>
                              </div>
                              <div className="w-px h-6 bg-slate-100" />
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wait</span>
                                <span className="text-xs font-black text-lavender italic">~{shop.waitTime || 0}m</span>
                              </div>
                              <div className="w-px h-6 bg-slate-100" />
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Queue</span>
                                <span className="text-xs font-black text-slate-700">{shop.totalAhead || 0}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}