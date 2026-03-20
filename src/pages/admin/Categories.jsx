import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/admin", icon: "📊", label: "Dashboard" },
  { to: "/admin/shops", icon: "🏪", label: "Shops" },
  { to: "/admin/categories", icon: "📂", label: "Categories" },
  { to: "/admin/users", icon: "👥", label: "Users" }
];

const defaultForm = { name: "", icon: "📦", description: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCats = () => api.get("/admin/categories").then(r => { setCategories(r.data.data); setLoading(false); });
  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    if (editing) await api.put("/admin/categories/" + editing, form);
    else await api.post("/admin/categories", form);
    setForm(defaultForm); setEditing(null); setShowForm(false);
    await fetchCats();
    setSaving(false);
  };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-gray-900">Categories ({categories.length})</h1>
          <button className="btn-primary text-sm" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(defaultForm); }}>
            {showForm ? "Cancel" : "+ Add Category"}
          </button>
        </div>

        {showForm && (
          <div className="card border-2 border-lavender-light">
            <h2 className="font-semibold mb-4">{editing ? "Edit Category" : "New Category"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Icon (Emoji)</label>
                <input className="input-field" maxLength={4} value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Name</label>
                <input required className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                <input className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="sm:col-span-3 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-400">{cat.subcategories?.length || 0} subcategories</p>
                  </div>
                </div>
                <button onClick={() => { setForm({ name: cat.name, icon: cat.icon, description: cat.description || "" }); setEditing(cat._id); setShowForm(true); }}
                  className="text-xs text-lavender-dark hover:underline">Edit</button>
              </div>
              {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
              {cat.subcategories?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.subcategories.slice(0,4).map(sub => (
                    <span key={sub._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sub.icon} {sub.name}</span>
                  ))}
                  {cat.subcategories.length > 4 && <span className="text-xs text-gray-400">+{cat.subcategories.length - 4} more</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}