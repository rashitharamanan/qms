import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Store, Save, MapPin, Clock, ShieldCheck, AlertCircle, Crosshair, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

export default function VendorShop() {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: '', description: '', category: '', subcategory: '',
    phone: '', maxQueueLimit: 50, logo: '',
    location: { address: '', city: '', state: '', pincode: '', coordinates: { lat: 0, lng: 0 } },
    openingHours: { open: '09:00', close: '18:00' }
  });

  useEffect(() => {
    Promise.all([
      api.get('/vendor/shop').then(r => {
        setShop(r.data.data);
        const s = r.data.data;
        if (s) {
          setForm({
            shopName: s.shopName || '',
            description: s.description || '',
            category: s.category?._id || '',
            subcategory: s.subcategory || '',
            phone: s.phone || '',
            logo: s.logo || '',
            maxQueueLimit: s.maxQueueLimit || 50,
            location: s.location || { address: '', city: '', state: '', pincode: '', coordinates: { lat: 0, lng: 0 } },
            openingHours: s.openingHours || { open: '09:00', close: '18:00' }
          });
        }
      }).catch(() => { }),
      api.get('/admin/categories').then(r => setCategories(r.data.data || []))
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let submitForm = { ...form };
    const loc = submitForm.location;
    if (!loc.coordinates || (loc.coordinates.lat === 0 && loc.coordinates.lng === 0)) {
       const query = `${loc.address || ''} ${loc.city || ''} ${loc.state || ''}`.trim();
       if (query.length > 3) {
         try {
           const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
           const data = await res.json();
           if (data && data.length > 0) {
             submitForm.location.coordinates = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
             setForm(submitForm);
             toast.success("Automatically snapped coordinates from address!");
           }
         } catch(e) {}
       }
    }

    try {
      if (shop) {
        const { data } = await api.put('/vendor/shop', submitForm);
        setShop(data.data);
        toast.success('Shop identity updated successfully!');
      } else {
        const { data } = await api.post('/vendor/shop', form);
        setShop(data.data);
        toast.success('Registration request sent! Expect approval within 24h.');
      }
    } catch (err) {
      toast.error('Could not save changes. Please check fields.');
    }
    setSaving(false);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLoc = (key, val) => setForm(f => ({ ...f, location: { ...f.location, [key]: val } }));

  const handleGetLocation = () => {
    if (!window.confirm("QueueMS wants to access your device location to pin your shop correctly. Allow?")) return;

    if (navigator.geolocation) {
      toast.loading('Fetching precise location. Please allow browser prompt if asked...', { id: 'loc' });
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLoc('coordinates', { lat, lng });
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.address) {
              setLoc('city', data.address.city || data.address.town || data.address.village || '');
              setLoc('state', data.address.state || '');
              setLoc('pincode', data.address.postcode || '');
              setLoc('address', data.address.road || data.display_name.split(',')[0] || '');
            }
          } catch(e) {}
          
          toast.success('Location pinned and address updated!', { id: 'loc' });
        },
        (err) => {
          toast.error('Location access denied. Please allow map access.', { id: 'loc' });
        }
      );
    }
  };

  const handleGeocodeAddress = async () => {
    const query = `${form.location.address || ''} ${form.location.city || ''} ${form.location.state || ''}`.trim();
    if (query.length < 3) return toast.error("Please enter an address or city first");
    
    toast.loading('Finding coordinates from address...', { id: 'geo' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLoc('coordinates', { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        toast.success(`Found location! Coordinates pinned.`, { id: 'geo' });
      } else {
        toast.error("Could not find exact coordinates. Try Auto-Pin GPS instead.", { id: 'geo' });
      }
    } catch(err) {
      toast.error("Error connecting to Maps API.", { id: 'geo' });
    }
  };

  const selectedCategory = categories.find(c => c._id === form.category);

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8 fade-in pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/50 pb-4">
          <div>
            <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Store Identity</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your shop's presence and operational rules</p>
          </div>

          {shop && (
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-black border uppercase tracking-widest ${shop.isApproved === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                shop.isApproved === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                  'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
              {shop.isApproved === 'approved' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {shop.isApproved === 'approved' ? 'Verified Store' :
                shop.isApproved === 'pending' ? 'Verification Pending' : 'Action Required'}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Core Info */}
            <section className="glass-card p-8 border-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-lavender/5 blur-[60px] -mr-24 -mt-24 rounded-full" />
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                <span className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-lg"><Store size={20} /></span>
                General Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Shop Name</label>
                  <input type="text" value={form.shopName} onChange={e => set('shopName', e.target.value)}
                    className="input-field py-4 font-bold" placeholder="e.g. Apex Electronics & Services" required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Catchphrase / Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    className="input-field resize-none py-4" rows={3} placeholder="Tell customers what makes your shop special..." />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Picture URL</label>
                  <div className="flex gap-4 items-center">
                    <input type="text" value={form.logo} onChange={e => set('logo', e.target.value)}
                      className="input-field py-4 font-bold flex-1" placeholder="Paste an image URL here..." />
                    {form.logo && (
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        <img src={form.logo} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field py-4 font-bold appearance-none bg-slate-50" required>
                    <option value="">Select Domain</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sub-Specialization</label>
                  <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className="input-field py-4 font-bold appearance-none bg-slate-50">
                    <option value="">Specific Category</option>
                    {selectedCategory?.subcategories?.map(s => (
                      <option key={s._id} value={s.name}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="glass-card p-8 border-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[60px] -mr-24 -mt-24 rounded-full" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg"><MapPin size={20} /></span>
                  Store Location
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleGeocodeAddress} className="btn-secondary py-2 px-4 shadow-sm flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none font-bold text-xs uppercase tracking-widest">
                    <Search size={14} /> Find from Address
                  </button>
                  <button type="button" onClick={handleGetLocation} className="btn-secondary py-2 px-4 shadow-sm flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-none font-bold text-xs uppercase tracking-widest">
                    <Crosshair size={14} /> Use Current Location
                  </button>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                {form.location.coordinates?.lat !== 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-emerald-700 font-bold text-xs mb-4">
                     <ShieldCheck size={16} /> Exact GPS Coordinates Saved: {form.location.coordinates.lat.toFixed(4)}, {form.location.coordinates.lng.toFixed(4)}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address</label>
                  <input type="text" value={form.location.address} onChange={e => setLoc('address', e.target.value)}
                    className="input-field py-4 font-medium" placeholder="Building, Street, Area" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                    <input type="text" value={form.location.city} onChange={e => setLoc('city', e.target.value)}
                      className="input-field py-4" placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
                    <input type="text" value={form.location.state} onChange={e => setLoc('state', e.target.value)}
                      className="input-field py-4" placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
                    <input type="text" value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)}
                      className="input-field py-4 text-center font-bold tracking-widest" placeholder="000000" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Operational Panel */}
            <section className="glass-card p-8 border-white/60 bg-slate-900 text-white relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/20 blur-[60px] -mr-16 -mt-16 rounded-full" />
              <h2 className="text-lg font-black mb-8 flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm"><Clock size={16} /></span>
                Operating Rules
              </h2>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Opens</label>
                    <input type="time" value={form.openingHours?.open || '09:00'}
                      onChange={e => setForm(f => ({ ...f, openingHours: { ...f.openingHours, open: e.target.value } }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lavender-light transition-all text-white font-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Closes</label>
                    <input type="time" value={form.openingHours?.close || '18:00'}
                      onChange={e => setForm(f => ({ ...f, openingHours: { ...f.openingHours, close: e.target.value } }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lavender-light transition-all text-white font-black" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-6">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Contact</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-lavender-light transition-all text-white font-bold" placeholder="+91 00000 00000" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Queue Limit Capacity</label>
                  <input type="number" value={form.maxQueueLimit} onChange={e => set('maxQueueLimit', +e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-lavender-light transition-all text-white font-black text-center" min={1} max={500} />
                  <p className="text-[9px] text-slate-500 font-bold text-center mt-1 italic italic">Max shoppers in waiting at once</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                <button type="submit" disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black py-4 shadow-xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  {saving ? 'UPDATING...' : shop ? 'Save All Changes' : 'Launch My Store'}
                </button>
              </div>
            </section>

            {/* Help/Tips */}
            <div className="p-6 bg-lavender/5 border border-lavender/10 rounded-3xl">
              <h4 className="text-sm font-black text-lavender-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>💡</span> Expert Tip
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Keep your shop name concise and categorize correctly. Pinning your exact GPS coordinates ensures accurate tracking for your customers!
              </p>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
