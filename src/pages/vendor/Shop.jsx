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

export default function VendorShop() {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ shopName: "", category: "", description: "", phone: "", logo: "", maxQueueLimit: 50, "location.address": "", "location.city": "", "location.state": "", openTime: "09:00", closeTime: "21:00" });
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
        setForm({ shopName: s.shopName, category: s.category?._id || "", description: s.description || "", phone: s.phone || "", logo: s.logo || "", maxQueueLimit: s.maxQueueLimit, "location.address": s.location?.address || "", "location.city": s.location?.city || "", "location.state": s.location?.state || "", openTime: s.openingHours?.open || "09:00", closeTime: s.openingHours?.close || "21:00" });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    const payload = { shopName: form.shopName, category: form.category, description: form.description, phone: form.phone, logo: form.logo, maxQueueLimit: form.maxQueueLimit, location: { address: form["location.address"], city: form["location.city"], state: form["location.state"] }, openingHours: { open: form.openTime, close: form.closeTime } };
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
              <input required className="input-field" value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
              <select required className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Shop Image URL</label>
              <input className="input-field" placeholder="https://..." value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Max Queue Limit</label>
              <input type="number" min={1} max={500} className="input-field" value={form.maxQueueLimit} onChange={e => setForm({...form, maxQueueLimit: +e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Opening Time</label>
              <input type="time" className="input-field" value={form.openTime} onChange={e => setForm({...form, openTime: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Closing Time</label>
              <input type="time" className="input-field" value={form.closeTime} onChange={e => setForm({...form, closeTime: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Address</label>
              <input className="input-field" value={form["location.address"]} onChange={e => setForm({...form, "location.address": e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
              <input className="input-field" value={form["location.city"]} onChange={e => setForm({...form, "location.city": e.target.value})} />
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