import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

export default function VendorShop() {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ shopName: "", category: "", description: "", phone: "", logo: "", maxQueueLimit: 50, "location.address": "", "location.city": "", "location.state": "", "location.coordinates": {lat:0, lng:0}, openTime: "09:00", closeTime: "21:00" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/categories"),
      api.get("/vendor/shop").catch(() => ({ data: { data: null } }))
    ]).then(([catRes, shopRes]) => {
      setCategories(catRes.data.data);
      if (shopRes.data.data) {
        const s = shopRes.data.data;
        setShop(s);
        setForm({ shopName: s.shopName, category: s.category?._id || "", description: s.description || "", phone: s.phone || "", logo: s.logo || "", maxQueueLimit: s.maxQueueLimit, "location.address": s.location?.address || "", "location.city": s.location?.city || "", "location.state": s.location?.state || "", "location.coordinates": s.location?.coordinates || {lat:0, lng:0}, openTime: s.openingHours?.open || "09:00", closeTime: s.openingHours?.close || "21:00" });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    let submitForm = { ...form };
    
    if (submitForm["location.coordinates"].lat === 0 && submitForm["location.coordinates"].lng === 0) {
      const query = `${submitForm["location.address"]} ${submitForm["location.city"]}`.trim();
      if (query.length > 3) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            submitForm["location.coordinates"] = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            setForm(submitForm);
            setMsg({ type: "success", text: "Automatically snapped coordinates from address!" });
          }
        } catch(e) {}
      }
    }

    const payload = { shopName: submitForm.shopName, category: submitForm.category, description: submitForm.description, phone: submitForm.phone, logo: submitForm.logo, maxQueueLimit: submitForm.maxQueueLimit, location: { address: submitForm["location.address"], city: submitForm["location.city"], state: submitForm["location.state"], coordinates: submitForm["location.coordinates"] }, openingHours: { open: submitForm.openTime, close: submitForm.closeTime } };
    try {
      if (shop) {
        await api.put("/vendor/shop", payload);
        setMsg({ type: "success", text: "Shop updated successfully!" });
      } else {
        const { data } = await api.post("/vendor/shop", payload);
        setShop(data.data);
        setMsg({ type: "success", text: "Shop created! Awaiting admin approval." });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error saving shop" });
    } finally { setSaving(false); }
  };

  const handleGetLocation = () => {
    if (!window.confirm("QueueMS wants to access your device location to pin your shop correctly. Allow?")) return;
    if (navigator.geolocation) {
      setMsg({ type: "success", text: "Fetching location..." });
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let newForm = { ...form, "location.coordinates": { lat, lng } };
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.address) {
              newForm["location.city"] = data.address.city || data.address.town || data.address.village || newForm["location.city"];
              newForm["location.state"] = data.address.state || newForm["location.state"];
              newForm["location.address"] = data.address.road || data.display_name.split(',')[0] || newForm["location.address"];
            }
          } catch(e) {}
          
          setForm(newForm);
          setMsg({ type: "success", text: "Location pinned and address updated!" });
        },
        () => setMsg({ type: "error", text: "Location access denied." })
      );
    }
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{shop ? "My Shop" : "Register Shop"}</h1>
          <p className="text-gray-500 text-sm mt-1">{shop ? "Update your shop details" : "Set up your shop to start managing queues"}</p>
        </div>
        {shop && (
          <div className={"inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium " + (shop.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
            {shop.isApproved ? "✅ Shop Approved" : "⏳ Pending Admin Approval"}
          </div>
        )}
        {msg && <div className={"rounded-xl p-4 text-sm font-medium " + (msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200")}>{msg.text}</div>}
        <div className="card">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Shop Name</label>
              <input required className="input-field" value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
              <select required className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Shop Image</label>
              <div className="flex items-center gap-3">
                {form.logo && <img src={form.logo} alt="Preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                <input type="file" accept="image/*" className="input-field pt-2" onChange={async e => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      setSaving(true);
                      const formData = new FormData();
                      formData.append('logo', file);
                      const { data } = await api.post('/upload/shop-logo', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setForm(f => ({ ...f, logo: data.data.url }));
                      setMsg({ type: "success", text: "Logo uploaded successfully" });
                    } catch (err) {
                      setMsg({ type: "error", text: "Failed to upload logo: " + (err.response?.data?.message || err.message) });
                    } finally {
                      setSaving(false);
                    }
                  }
                }} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Max Queue Limit</label>
              <input type="number" min={1} max={500} className="input-field" value={form.maxQueueLimit} onChange={e => setForm({ ...form, maxQueueLimit: +e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Opening Time</label>
              <input type="time" className="input-field" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Closing Time</label>
              <input type="time" className="input-field" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Address</label>
              <input required className="input-field" value={form["location.address"]} onChange={e => setForm({ ...form, "location.address": e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
              <input className="input-field" value={form["location.city"]} onChange={e => setForm({ ...form, "location.city": e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-start">
              <button type="button" onClick={handleGetLocation} className="btn-secondary py-2 px-4 shadow-sm border border-gray-200 bg-white">
                📍 Use Current Location
              </button>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary py-3 px-8">
                {saving ? "Saving..." : shop ? "Update Shop" : "Create Shop"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}