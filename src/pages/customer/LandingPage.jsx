import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <MainLayout>
      <div className="relative min-h-[calc(100-80px)] overflow-hidden bg-white">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lavender/5 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 xl:px-16 pt-20 pb-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left Content */}
            <div className="flex-1 space-y-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-lavender/30 shadow-sm transition-all hover:border-lavender/50 group">
                <span className="w-2 h-2 bg-lavender rounded-full animate-ping"></span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-lavender-dark">Real-time Queue Management</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="font-display text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] lg:leading-[1.1]">
                  Skip the Wait, <br />
                  <span className="text-lavender">Not the Service</span>
                </h1>
                <p className="text-slate-500 font-bold text-xl md:text-2xl leading-relaxed max-w-xl">
                  Join queues at your favourite shops digitally. Get real-time updates and never stand in a physical line again.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-10 py-5 gradient-bg text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-lavender/40 hover:scale-105 active:scale-95 transition-all text-center">
                  Get Started Free
                </Link>
                <Link to="/login" className="px-10 py-5 bg-white text-lavender border-2 border-lavender/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-lavender/5 hover:border-lavender transition-all text-center">
                  Sign In
                </Link>
              </div>
            </div>
            
            {/* Right Image/Illustration */}
            <div className="flex-1 w-full max-w-3xl relative p-4 bg-white/20 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-2xl">
               <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80" 
                    alt="POS Terminal and Customer Interaction" 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Notification Badge UI Mockup */}
                  <div className="absolute top-10 right-10 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white flex items-center gap-4 animate-bounce-slow">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                       <ChevronRight size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Turn</div>
                      <div className="text-sm font-black text-slate-900">Please Proceed</div>
                    </div>
                  </div>
               </div>
               
               {/* Decorative ring */}
               <div className="absolute -inset-4 border-2 border-lavender/10 rounded-[3.5rem] -z-10 animate-pulse"></div>
            </div>
            
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
