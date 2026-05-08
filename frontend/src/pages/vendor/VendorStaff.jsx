import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Users, UserPlus, Shield, X, MapPin } from "lucide-react";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

const defaultForm = { name: "", role: "operator", counterId: "" };

export default function VendorStaff() {
  const [staff, setStaff] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [staffRes, countRes] = await Promise.all([
        api.get("/staff"),
        api.get("/counters")
      ]);
      setStaff(staffRes.data.data);
      setCounters(countRes.data.data);
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
    const payload = { ...form };
    if (!payload.counterId) delete payload.counterId;
    
    try {
      if (editing) {
        await api.put("/staff/" + editing, payload);
      } else {
        await api.post("/staff", payload);
      }
      setForm(defaultForm); setEditing(null); setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const deleteStaff = async (id) => {
    if (!window.confirm("Remove this staff member? This will revoke their access.")) return;
    await api.delete("/staff/" + id);
    fetchData();
  };

  const startEdit = (s) => {
    setForm({ name: s.name, role: s.role, counterId: s.counterId?._id || "" });
    setEditing(s._id);
    setShowForm(true);
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/50 pb-4">
          <div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Team Members</h1>
            <p className="text-slate-500 font-medium mt-1">Manage operators and their counter assignments</p>
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
              <><UserPlus className="w-5 h-5" /> <span>Onboard Staff</span></>
            )}
          </button>
        </div>

        {/* Onboarding Form */}
        {showForm && (
          <div className="glass-card p-8 border-lavender/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
             <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-lg">{editing ? "✍️" : "👤"}</span>
              {editing ? "Update Team Member Details" : "Invite New Member"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity</label>
                <input className="input-field py-4 font-bold" required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role / Designation</label>
                <input className="input-field py-4" placeholder="e.g. Senior Operator" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Station</label>
                <select className="input-field py-4 font-bold appearance-none bg-slate-50" value={form.counterId} onChange={e => setForm({...form, counterId: e.target.value})}>
                  <option value="">Awaiting Assignment</option>
                  {counters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-3 pt-4 flex gap-4">
                <button type="submit" className="flex-1 py-4 gradient-bg rounded-2xl font-black shadow-xl shadow-lavender/25 text-sm uppercase tracking-widest" disabled={saving}>
                  {saving ? "SAVING..." : editing ? "CONFIRM UPDATE" : "COMPLETE ONBOARDING"}
                </button>
                <button type="button" className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest" onClick={() => { setShowForm(false); setEditing(null); }}>
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Directory */}
        {staff.length === 0 ? (
          <div className="glass-card py-24 text-center border-dashed border-2 border-slate-200 max-w-2xl mx-auto">
            <div className="text-7xl mb-6 grayscale opacity-30">🤝</div>
            <h3 className="text-2xl font-black text-slate-400 mb-2">Team is Empty</h3>
            <p className="text-slate-400 font-medium">Onboard your first operator to start managing counters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {staff.map(s => (
              <div key={s._id} className="glass-card p-6 flex flex-col group hover:border-lavender/40 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-lavender/5 text-lavender-dark rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-lavender group-hover:text-white transition-all duration-500 shadow-inner">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{s.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.role}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                    s.isActive 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}>
                    {s.isActive ? "ONLINE" : "OFFLINE"}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                      <Shield size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Station Assignment</p>
                      <p className="text-sm font-bold text-slate-700">
                        {s.counterId ? s.counterId.name : "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <button onClick={() => startEdit(s)} className="flex-1 py-2.5 rounded-xl text-xs font-black bg-lavender/5 text-lavender-dark hover:bg-lavender hover:text-white transition-all uppercase tracking-widest">
                    CONFIGURE
                  </button>
                  <button onClick={() => deleteStaff(s._id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
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
