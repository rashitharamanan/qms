import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Monitor, Plus, X, Laptop, Coffee, CheckCircle2 } from "lucide-react";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

const defaultForm = { name: "", services: [], status: "inactive" };

export default function VendorCounters() {
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [countRes, svcRes] = await Promise.all([
        api.get("/counters"),
        api.get("/vendor/services")
      ]);
      setCounters(countRes.data.data);
      setServices(svcRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editing) {
        await api.put("/counters/" + editing, form);
      } else {
        await api.post("/counters", form);
      }
      setForm(defaultForm); setEditing(null); setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const deleteCounter = async (id) => {
    if (!window.confirm("Abolish this counter? This will disconnect any assigned staff.")) return;
    await api.delete("/counters/" + id);
    fetchData();
  };

  const startEdit = (c) => {
    setForm({ name: c.name, status: c.status, services: c.services.map(s => s._id) });
    setEditing(c._id);
    setShowForm(true);
  };

  const toggleService = (svcId) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svcId) 
        ? prev.services.filter(id => id !== svcId)
        : [...prev.services, svcId]
    }));
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/50 pb-4">
          <div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Active Stations</h1>
            <p className="text-slate-500 font-medium mt-1">Configure physical counters and service assignments</p>
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
              <><X className="w-5 h-5" /> <span>Close</span></>
            ) : (
              <><Plus className="w-5 h-5" /> <span>Launch Station</span></>
            )}
          </button>
        </div>

        {/* Configuration Form */}
        {showForm && (
          <div className="glass-card p-8 border-lavender/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
             <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-lg">{editing ? "✍️" : "🖥️"}</span>
              {editing ? "Refine Station Parameters" : "Provision New Counter"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Station Label</label>
                  <input className="input-field py-4 font-bold" required placeholder="e.g. Counter 01, Room A" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational State</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'active', label: 'Online', icon: <Laptop size={14} />, color: 'peer-checked:bg-emerald-500' },
                      { val: 'break', label: 'Break', icon: <Coffee size={14} />, color: 'peer-checked:bg-amber-500' },
                      { val: 'inactive', label: 'Offline', icon: <X size={14} />, color: 'peer-checked:bg-slate-500' }
                    ].map(status => (
                      <label key={status.val} className="cursor-pointer group">
                        <input type="radio" name="status" value={status.val} checked={form.status === status.val} onChange={e => setForm({...form, status: e.target.value})} className="hidden peer" />
                        <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-white group-hover:bg-slate-50 transition-all ${status.color} peer-checked:text-white peer-checked:border-transparent`}>
                          {status.icon}
                          <span className="text-[9px] font-black uppercase tracking-widest mt-1">{status.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Handled Services (Multi-Select)</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[140px]">
                  {services.map(svc => (
                    <button type="button" key={svc._id} onClick={() => toggleService(svc._id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${
                        form.services.includes(svc._id) 
                        ? 'bg-lavender text-white border-lavender shadow-md shadow-lavender/20' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-lavender/50'
                      }`}>
                      {form.services.includes(svc._id) && <CheckCircle2 size={12} />}
                      {svc.serviceName}
                    </button>
                  ))}
                  {services.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No services available to assign.</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="submit" className="flex-1 py-4 gradient-bg rounded-2xl font-black shadow-xl shadow-lavender/25 text-sm uppercase tracking-widest" disabled={saving}>
                  {saving ? "SAVING..." : editing ? "CONFIRM UPDATE" : "LAUNCH COUNTER"}
                </button>
                <button type="button" className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest" onClick={() => { setShowForm(false); setEditing(null); }}>
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Counters Directory */}
        {counters.length === 0 ? (
          <div className="glass-card py-24 text-center border-dashed border-2 border-slate-200 max-w-2xl mx-auto">
            <div className="text-7xl mb-6 grayscale opacity-30">🖥️</div>
            <h3 className="text-2xl font-black text-slate-400 mb-2">Stations Offline</h3>
            <p className="text-slate-400 font-medium">Add a counter to start processing requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counters.map(c => (
              <div key={c._id} className="glass-card p-6 flex flex-col group hover:border-lavender/40 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
                      {c.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{c.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        Operator: <span className="text-lavender-dark">{c.currentStaffId ? c.currentStaffId.name : "Unstaffed"}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                    c.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    c.status === 'break' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {c.status}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Capabilities</p>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl min-h-[60px] content-start">
                      {c.services.map(s => (
                        <span key={s._id} className="text-[9px] font-black bg-white text-slate-500 border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                          {s.serviceName.toUpperCase()}
                        </span>
                      ))}
                      {c.services.length === 0 && <span className="text-[9px] text-slate-400 italic font-medium p-1">No services authorized</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <button onClick={() => startEdit(c)} className="flex-1 py-2.5 rounded-xl text-xs font-black bg-lavender/5 text-lavender-dark hover:bg-lavender hover:text-white transition-all uppercase tracking-widest">
                    RECONFIGURE
                  </button>
                  <button onClick={() => deleteCounter(c._id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                    <X size={18} />
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
