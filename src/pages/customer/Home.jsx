import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, Filter, Star, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopsRes, catsRes] = await Promise.all([
          api.get("/shops"),
          api.get("/categories")
        ]);
        setShops(shopsRes.data.data);
        setCategories(catsRes.data.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const filteredShops = shops.filter(shop => {
    const name = shop.shopName || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || shop.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <MainLayout><LoadingSpinner size="lg" /></MainLayout>;

  return (
    <MainLayout>
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-40 animate-pulse delay-700"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px]"></div>

        <div className="w-full px-4 sm:px-8 xl:px-16 py-10 max-w-[1700px] mx-auto space-y-16 fade-in relative z-10">
          
          {/* Hero & Search Header */}
          <header className="space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender/10 text-lavender-dark text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-lavender/20 mb-2">
                Discovery Dashboard
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                {getGreeting()}!
              </h1>
              <p className="text-slate-500 font-bold text-xl">What service are you looking for today?</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center max-w-4xl">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lavender transition-all" size={20} />
                <input 
                  type="text" 
                  placeholder="Search salons, clinics, spas..." 
                  className="w-full pl-16 pr-6 py-6 bg-white/80 backdrop-blur-xl rounded-[2rem] border-none shadow-2xl shadow-lavender/10 focus:ring-2 focus:ring-lavender/50 text-slate-700 font-bold transition-all placeholder:text-slate-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-lavender/10 flex items-center justify-center text-slate-500 hover:text-lavender transition-all active:scale-95 border border-white/50">
                <Filter size={24} />
              </button>
            </div>
          </header>

        {/* Categories Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory("all")}
            className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === "all" 
              ? "gradient-bg shadow-lg shadow-lavender/30" 
              : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button 
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedCategory === cat._id 
                ? "bg-lavender/10 text-lavender-dark border-lavender/20" 
                : "bg-white text-slate-500 hover:bg-slate-50 border-transparent shadow-sm"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>


        {/* Nearby Places Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nearby Places</h2>
            <span className="text-lavender font-black bg-lavender/10 px-4 py-1.5 rounded-2xl text-xs uppercase tracking-widest border border-lavender/20">
              {filteredShops.length} stores found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.length === 0 ? (
              <div className="col-span-full py-24 text-center glass-card border-dashed border-2 border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest">No shops matching your search</p>
              </div>
            ) : (
              filteredShops.map((shop) => (
                <Link key={shop._id} to={`/shops/${shop._id}`} className="glass-card p-6 flex items-center gap-6 group hover:border-lavender hover:shadow-2xl hover:shadow-lavender/10 transition-all border-white/80">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl bg-slate-50 flex-shrink-0 relative">
                    <img 
                      src={`https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=200&q=80`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-lavender transition-colors">{shop.shopName}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-black tracking-widest">4.8</span>
                        </div>
                        <span className="text-slate-200">•</span>
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase">1.2 KM AWAY</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service</span>
                        <span className="text-xs font-black text-slate-700 leading-none">{shop.avgServiceTime || 15}m</span>
                      </div>
                      <div className="w-px h-6 bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Wait</span>
                        <span className="text-xs font-black text-lavender italic leading-none">~{shop.waitTime || 0}m</span>
                      </div>
                      <div className="w-px h-6 bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Queue</span>
                        <span className="text-xs font-black text-slate-700 leading-none">{shop.totalAhead || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

      </div> {/* This closes the div with className="w-full px-4 sm:px-8 xl:px-16 py-10 max-w-[1700px] mx-auto space-y-16 fade-in relative z-10" */}
      </div>
    </MainLayout>
  );
}