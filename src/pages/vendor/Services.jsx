import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

const defaultForm = { serviceName: "", estimatedTime: 15, price: 0, tokenPrefix: "T", description: "" };

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchServices = () => api.get("/vendor/services").then(r => { setServices(r.data.data); setLoading(false); });
  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await api.put("/vendor/services/" + editing, form);
    } else {
      await api.post("/vendor/services", form);
    }
    setForm(defaultForm); setEditing(null); setShowForm(false);
    await fetchServices();
    setSaving(false);
  };

  const deleteService = async (id) => {
    if (!confirm("Delete this service? This action cannot be undone.")) return;
    await api.delete("/vendor/services/" + id);
    fetchServices();
  };

  const startEdit = (svc) => {
    setForm({ serviceName: svc.serviceName, estimatedTime: svc.estimatedTime, price: svc.price, tokenPrefix: svc.tokenPrefix, description: svc.description || "" });
    setEditing(svc._id);
    setShowForm(true);
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/50 pb-2">
          <div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Services</h1>
            <p className="text-slate-500 font-medium mt-1">Configure your offerings and token rules</p>
          </div>
          <button 
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${
              showForm 
              ? "bg-rose-50 text-rose-600 border border-rose-100 scale-95" 
              : "gradient-bg shadow-lg shadow-lavender/25 hover:scale-[1.05]"
            }`}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm(defaultForm); }}
          >
            {showForm ? (
              <><span>✖</span> <span>Cancel</span></>
            ) : (
              <><span>✨</span> <span>Add New Service</span></>
            )}
          </button>
        </div>

        {showForm && (
          <div className="glass-card p-8 border-lavender/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <h2 className="text-xl font-black text-slate-900 mb-6 relative z-10 flex items-center gap-3">
              <span className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-lg">{editing ? "✍️" : "🆕"}</span>
              {editing ? "Refine Service Details" : "Launch New Service"}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Title</label>
                <input 
                  className="input-field py-4" 
                  required 
                  placeholder="e.g. Standard Consultation" 
                  value={form.serviceName} 
                  onChange={e => setForm({...form, serviceName: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Token Identifier</label>
                <input 
                  className="input-field py-4 text-center font-black text-lavender-dark text-xl" 
                  maxLength={3} 
                  placeholder="e.g. CONSULT" 
                  value={form.tokenPrefix} 
                  onChange={e => setForm({...form, tokenPrefix: e.target.value.toUpperCase()})} 
                />
                <p className="text-[9px] text-slate-400 text-center font-bold">Result: {form.tokenPrefix || "T"}001</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avg. Duration</label>
                <div className="relative">
                  <input 
                    type="number" min={1} 
                    className="input-field py-4" 
                    value={form.estimatedTime} 
                    onChange={e => setForm({...form, estimatedTime: +e.target.value})} 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MINS</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" min={0} 
                    className="input-field py-4 pl-10" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: +e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Status</label>
                <div className="flex h-[58px] items-center px-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-sm font-bold text-slate-600 flex-1">Publicly Active</span>
                  <div className="w-10 h-5 bg-lavender/20 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-lavender rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Narrative</label>
                <textarea 
                  className="input-field resize-none py-4" 
                  rows={2} 
                  placeholder="Tell customers what to expect..."
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div className="md:col-span-3 pt-2 flex items-center gap-4">
                <button 
                  type="submit" 
                  className="flex-1 py-4 gradient-bg rounded-2xl font-black shadow-xl shadow-lavender/25 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                  disabled={saving}
                >
                  {saving ? "Processing..." : editing ? "Apply Changes" : "Confirm & Launch"}
                </button>
                <button 
                  type="button" 
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200" 
                  onClick={() => { setShowForm(false); setEditing(null); }}
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {services.length === 0 ? (
          <div className="glass-card py-24 text-center border-dashed border-2 border-slate-200 max-w-2xl mx-auto">
            <div className="text-7xl mb-6 grayscale opacity-30">⚡</div>
            <h3 className="text-2xl font-black text-slate-400 mb-2">No Services Configured</h3>
            <p className="text-slate-400 font-medium">Add your first service to start issuing tokens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(svc => (
              <div key={svc._id} className="glass-card p-6 flex flex-col group hover:border-lavender/40 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-lavender/5 flex items-center justify-center text-2xl group-hover:bg-lavender group-hover:text-white transition-all duration-500">
                    {svc.serviceName.charAt(0)}
                  </div>
                  <div className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${
                    svc.isActive 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}>
                    {svc.isActive ? "Live" : "Draft"}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-slate-900 text-xl tracking-tight mb-1">{svc.serviceName}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Sequence: <span className="text-lavender-dark">{svc.tokenPrefix}000</span>
                  </p>
                  
                  {svc.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed italic">
                      "{svc.description}"
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</span>
                    <span className="text-sm font-black text-slate-700">{svc.estimatedTime}m</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking</span>
                    <span className="text-sm font-black text-slate-700">₹{svc.price}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <button 
                    onClick={() => startEdit(svc)} 
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-lavender/5 text-lavender-dark hover:bg-lavender hover:text-white transition-all"
                  >
                    REFINE
                  </button>
                  <button 
                    onClick={() => deleteService(svc._id)} 
                    className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}