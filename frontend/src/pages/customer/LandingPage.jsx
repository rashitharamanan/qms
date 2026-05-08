import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { MapPin, User, ArrowRight, Star, Clock, Search, Smartphone, Zap, Mail, Sparkles } from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const [popularShops, setPopularShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  
  const { user } = useAuth();

  // AI Recommendations
  const [recommendedShops, setRecommendedShops] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await api.get("/shops");
        setPopularShops(data.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch shops for landing page", err);
      } finally {
        setLoadingShops(false);
      }
    };

    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const { data } = await api.get("/ai/recommendations");
        setRecommendedShops(data);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchShops();
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        
        {/* FULL WIDTH HERO SECTION */}
        <div className="relative w-full overflow-hidden h-[calc(100vh-62px)] flex flex-col justify-center px-6 sm:px-16 lg:px-32">
          {/* Background Image - Service Counter / Queue Area */}
          <img 
            src="/images/hero-queue.jpg" 
            alt="Queue Management System" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-900/80 to-transparent"></div>
          
          {/* Removed background objects to optimize cleanliness */}

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/20 shadow-lg w-max delay-75">
              <User size={14} className="text-white animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Smart Queuing</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter drop-shadow-lg delay-100">
              Skip the Line,<br />Save Your Time
            </h1>
            <p className="text-purple-100 text-base md:text-xl font-medium mb-10 max-w-lg leading-relaxed opacity-90 delay-150">
              Book your spot digitally, track real-time queue status, and get served faster — no more standing in physical lines.
            </p>
            <div className="flex flex-wrap items-center gap-4 delay-200">
              <Link to="/register" className="inline-flex items-center justify-center bg-white text-purple-900 hover:bg-purple-50 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-900/20 active:scale-95">
                Get Started Free
              </Link>
              <Link to="/shops" className="inline-flex items-center justify-center bg-transparent border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300">
                Explore Shops
              </Link>
            </div>
          </div>
        </div>


        {/* WELCOME SECTION */}
        <div id="about" className="max-w-[1200px] mx-auto px-6 sm:px-12 py-16 pb-16">
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-20">
            {/* Left Image Component */}
            <div className="relative w-full md:w-[45%] flex justify-center scale-in">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] w-full border-[8px] border-slate-50 shadow-2xl shadow-purple-900/10 bg-slate-100 group">
                 <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80" alt="About" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              
               {/* Floating detail badges */}
               <div className="absolute top-4 -left-4 w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-700/30 border-4 border-white animate-float-slow">
                  <MapPin size={24} className="animate-pulse" />
               </div>
               <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-50 rounded-full flex flex-col items-center justify-center text-purple-700 shadow-xl shadow-purple-900/10 border-4 border-white animate-float-delayed">
                  <span className="font-black text-xs uppercase tracking-widest text-slate-400">Save</span>
                  <span className="font-black text-xl">1hr</span>
               </div>
            </div>

            <div className="w-full md:w-[55%] space-y-6 slide-in-left">
              <h2 className="text-4xl md:text-[54px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-950 via-purple-800 to-purple-600 leading-[1.15] tracking-tight py-2">
                Welcome to QueueMS
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Experience seamless queueing and appointment booking. Say goodbye to crowded waiting rooms and hello to efficiency and convenience. Wait from anywhere.
              </p>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link to="/shops" className="inline-flex items-center gap-3 bg-purple-700 hover:bg-purple-800 text-white px-8 py-3.5 rounded-full font-black text-sm transition-all shadow-lg shadow-purple-700/30">
                  <MapPin size={18} />
                  Explore Places
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 px-6 py-3.5 rounded-full font-bold text-sm transition-colors">
                  Learn more <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div id="work" className="bg-slate-50/50 py-24 relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] opacity-70 animate-float-slow pointer-events-none"></div>
          
          <div className="max-w-[1200px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16 fade-in-up">
              <div className="inline-flex border border-purple-200 bg-white px-4 py-1.5 rounded-full font-black text-[10px] text-purple-600 uppercase tracking-widest mb-4 shadow-sm">
                 Simple Process
              </div>
              <h2 className="text-4xl md:text-[54px] font-extrabold text-[#4A2766] leading-[1.15] tracking-tight py-2">
                How It Works
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
              {[
                { 
                  icon: Search, 
                  title: "Find a Place", 
                  desc: "Discover nearby shops and monitor live queue status before you even leave your house.",
                  badge: "01",
                  gradient: "from-[#4A2766] via-[#5E3380] to-[#7B5C9E]"
                },
                { 
                  icon: Smartphone, 
                  title: "Join Queue", 
                  desc: "Book your spot online right from your device. Secure your place instantly without standing in line.",
                  badge: "02",
                  gradient: "from-[#5a1f7a] via-[#7B5C9E] to-[#9B7CBD]"
                },
                { 
                  icon: Zap, 
                  title: "Get Served", 
                  desc: "Arrive just in time as your token gets called. Experience a seamless service with zero wait time.",
                  badge: "03",
                  gradient: "from-[#3b1554] via-[#4A2766] to-[#7B5C9E]"
                }
              ].map((step, idx) => (
                <div key={idx} className={`relative w-full rounded-[2.5rem] bg-gradient-to-br ${step.gradient} p-8 sm:p-10 text-left flex flex-col items-start overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(74,39,102,0.5)] hover:ring-2 hover:ring-white/20 card-enter stagger-${idx + 1} group cursor-pointer`}>
                  
                  {/* Large ghosted watermark icon — animates on hover */}
                  <div className="absolute -bottom-8 -right-8 text-white/10 group-hover:text-white/20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 ease-out pointer-events-none">
                    <step.icon size={160} strokeWidth={1} />
                  </div>

                  {/* Animated inner glow on hover */}
                  <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>

                  {/* Top row: frosted icon + step badge */}
                  <div className="flex w-full items-center justify-between mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <step.icon size={24} className="text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                    </div>
                    <div className="text-5xl font-black text-white/20 group-hover:text-white/40 transition-colors duration-500 leading-none group-hover:scale-110 transform transition-transform">
                      {step.badge}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white leading-tight mb-3 relative z-10 drop-shadow-sm group-hover:tracking-wide transition-all duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-white/75 font-medium text-[15px] leading-relaxed relative z-10 group-hover:text-white/90 transition-colors duration-300">
                     {step.desc}
                  </p>

                  {/* Top-left glow */}
                  <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-[40px] group-hover:w-56 group-hover:h-56 group-hover:bg-white/15 transition-all duration-700 pointer-events-none z-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI RECOMMENDATIONS SECTION */}
        {recommendedShops.length > 0 && (
          <div className="bg-white py-20 border-t border-purple-100 relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="max-w-[1200px] mx-auto px-6 sm:px-12 relative z-10">
               <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                 <div className="text-left">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                     <Sparkles size={12} />
                     Personalized for You
                   </div>
                   <h2 className="text-4xl md:text-[48px] font-extrabold text-slate-900 leading-tight tracking-tight">
                     Recommended <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">AI Picks</span>
                   </h2>
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {recommendedShops.map((shop, idx) => (
                   <div key={shop._id} className="bg-slate-50/50 rounded-[2.5rem] p-4 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
                     <div className="aspect-video rounded-[2rem] overflow-hidden mb-6 relative shadow-lg">
                       <img src={shop.logo || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                       <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                         <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                           {shop.category?.name}
                         </span>
                       </div>
                     </div>
                     <div className="px-2">
                       <h3 className="text-xl font-black text-slate-900 mb-2">{shop.shopName}</h3>
                       <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                         {shop.description || "Top rated shop in your area based on your previous interests."}
                       </p>
                       <Link to={`/shops/${shop._id}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900 uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                         View Details
                         <ArrowRight size={14} />
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
        <div id="discover" className="bg-purple-50/50 py-20 border-t border-purple-100">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-12 text-center">
            
            <h2 className="text-4xl md:text-[54px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-950 via-purple-800 to-purple-600 leading-[1.15] tracking-tight py-2 mb-12 fade-in-up">
              Popular Places Nearby
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {loadingShops ? (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center py-10">
                    <LoadingSpinner />
                  </div>
               ) : popularShops.length > 0 ? (
                 popularShops.map((shop, idx) => (
                  <div key={shop._id} className={`card-enter stagger-${(idx % 6) + 1} bg-white rounded-[2rem] p-3 shadow-lg hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-300 text-left flex flex-col group border border-purple-100/50 hover:-translate-y-2`}>
                    <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-5 relative bg-slate-100">
                      <img src={shop.logo || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black capitalize shadow-lg backdrop-blur-md ${shop.isOpen ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                        {shop.isOpen ? 'Open Now' : 'Closed'}
                      </div>
                    </div>
                    <div className="px-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">{shop.shopName}</h3>
                         <div className="flex items-center gap-1 text-amber-400 mt-1">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-black text-amber-500">4.8</span>
                         </div>
                      </div>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4 line-clamp-2">
                        {shop.description || "Pre-book your spot and monitor real-time queue length directly from your device."}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold">
                          <User size={16} className="text-purple-500" />
                          <span>{shop.totalAhead || 0} in line</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold">
                          <Clock size={16} className="text-purple-500" />
                          <span>~{shop.waitTime || 0}m wait</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                       <Link to={`/shops/${shop._id}`} className="inline-flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all w-full">
                         Visit Shop
                       </Link>
                    </div>
                  </div>
                 ))
               ) : (
                 <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-slate-500 py-10 font-medium">
                   No popular places available at the moment.
                 </div>
               )}
            </div>

          </div>
        </div>

        {/* CONTACT SECTION */}
        <div id="contact" className="bg-gradient-to-br from-[#4A2766] via-[#613687] to-[#7B5C9E] py-24 relative overflow-hidden flex items-center justify-center">
          {/* Subtle glowing background blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Decorative Floating Elements to fill side spaces */}
          {/* Left Side Group */}
          <div className="absolute top-[15%] left-[6%] hidden xl:block w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-2xl rounded-full border border-white/20 shadow-[inset_0_-10px_20px_rgba(255,255,255,0.1)] animate-float-slow pointer-events-none z-0"></div>
          
          <div className="absolute bottom-[20%] left-[10%] hidden lg:flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-md rounded-[1.5rem] rotate-[15deg] border border-white/10 animate-float-delayed pointer-events-none shadow-xl z-0">
             <MapPin size={28} className="text-white/40" />
          </div>
          
          {/* Right Side Group */}
          <div className="absolute top-[20%] right-[12%] hidden lg:flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-md rounded-full border border-white/10 -rotate-[15deg] animate-float-slow pointer-events-none shadow-xl z-0">
             <Smartphone size={32} className="text-white/40" />
          </div>
          
          <div className="absolute bottom-[10%] right-[5%] hidden xl:block w-40 h-40 bg-gradient-to-bl from-white/10 to-transparent backdrop-blur-2xl rounded-[3rem] rotate-[35deg] border border-white/20 shadow-[inset_0_10px_20px_rgba(255,255,255,0.1)] animate-float-delayed pointer-events-none z-0"></div>

          {/* Sparkle/Star accents */}
          <Star size={20} className="absolute top-24 left-[22%] text-white/30 hidden md:block animate-pulse pointer-events-none z-0" />
          <Star size={16} className="absolute bottom-28 right-[25%] text-white/20 hidden md:block animate-pulse pointer-events-none z-0" style={{ animationDelay: '0.5s' }}/>
          <Star size={24} className="absolute top-[45%] right-[4%] text-white/10 hidden xl:block animate-pulse pointer-events-none z-0" style={{ animationDelay: '1s' }}/>
          <Star size={14} className="absolute bottom-[30%] left-[3%] text-white/10 hidden xl:block animate-pulse pointer-events-none z-0" style={{ animationDelay: '0.7s' }}/>

          <div className="max-w-[1000px] mx-auto px-6 sm:px-12 fade-in-up relative z-10 w-full">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
              
              <div className="text-center md:text-left w-full md:w-1/2">
                <div className="inline-flex border border-white/30 bg-white/10 px-4 py-1.5 rounded-full font-black text-[10px] text-purple-100 uppercase tracking-widest mb-5 shadow-sm">
                   Get In Touch
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Contact Support
                </h2>
                <p className="text-purple-100/90 font-medium text-base leading-relaxed max-w-md mx-auto md:mx-0">
                  Need assistance booking a spot, have general queries, or want to onboard your shop to QueueMS? Reach out to us.
                </p>
              </div>

              <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 flex items-center gap-5 sm:gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)] w-full max-w-sm hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#F8F6FA] border border-slate-100 rounded-2xl flex items-center justify-center text-[#7B5C9E] group-hover:bg-[#4A2766] group-hover:text-white transition-colors duration-300 flex-shrink-0 shadow-sm">
                    <Mail size={26} strokeWidth={2} />
                  </div>
                  <div className="text-left w-full">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Us At</h3>
                    <a href="mailto:rashithaqueue@gmail.com" className="text-lg sm:text-lg font-black text-[#4A2766] group-hover:text-[#7B5C9E] transition-colors break-words w-full block">
                      rashithaqueue@gmail.com
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
