export default function StatCard({ label, value, icon, color = "lavender", sub }) {
  const colorSchemes = {
    lavender: {
      bg: "bg-lavender/10",
      border: "border-lavender/30",
      text: "text-lavender-dark",
      iconBg: "bg-gradient-to-br from-lavender to-indigo-500 text-white"
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-600",
      iconBg: "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-400 to-indigo-600 text-white"
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
    },
    red: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-600",
      iconBg: "bg-gradient-to-br from-rose-400 to-rose-600 text-white"
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.lavender;

  return (
    <div className={`glass-card p-5 border-white/60 relative overflow-hidden group hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${scheme.bg} blur-3xl -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150 duration-700`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
            {sub && <span className="text-[10px] font-medium text-slate-400">{sub}</span>}
          </div>
        </div>
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:rotate-12 duration-300 ${scheme.iconBg}`}>
          {icon}
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-lavender/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}