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

const defaultForm = { name: "", icon: "📦", description: "", subcategories: [] };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newSubcat, setNewSubcat] = useState({ name: "", icon: "🏷️", estimatedTime: 15 });

  const fetchCats = () => api.get("/admin/categories").then(r => { setCategories(r.data.data); setLoading(false); });
  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    if (editing) await api.put("/admin/categories/" + editing, form);
    else await api.post("/admin/categories", form);
    setForm(defaultForm); setEditing(null); setShowForm(false);
    setNewSubcat({ name: "", icon: "🏷️", estimatedTime: 15 });
    await fetchCats();
    setSaving(false);
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!newSubcat.name) return;
    setForm({ ...form, subcategories: [...(form.subcategories || []), newSubcat] });
    setNewSubcat({ name: "", icon: "🏷️", estimatedTime: 15 });
  };
  
  const handleRemoveSubcategory = (index) => {
    const updated = form.subcategories.filter((_, i) => i !== index);
    setForm({ ...form, subcategories: updated });
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

              {/* Subcategories Section */}
              <div className="sm:col-span-3 mt-2 border-t pt-4 border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Subcategories</h3>
                
                {form.subcategories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.subcategories.map((sub, index) => (
                      <div key={index} className="flex items-center gap-1 bg-lavender-light/30 px-3 py-1.5 rounded-lg border border-lavender-light">
                        <span>{sub.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                        <span className="text-xs text-gray-500">({sub.estimatedTime}m)</span>
                        <button type="button" onClick={() => handleRemoveSubcategory(index)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-20">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Icon</label>
                    <input className="input-field py-1.5 text-sm" maxLength={4} value={newSubcat.icon} onChange={e => setNewSubcat({...newSubcat, icon: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Subcategory Name</label>
                    <input className="input-field py-1.5 text-sm" placeholder="e.g. Haircut" value={newSubcat.name} onChange={e => setNewSubcat({...newSubcat, name: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubcategory(e); } }} />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Est. Min</label>
                    <input type="number" className="input-field py-1.5 text-sm" value={newSubcat.estimatedTime} onChange={e => setNewSubcat({...newSubcat, estimatedTime: Number(e.target.value)})} />
                  </div>
                  <button type="button" onClick={handleAddSubcategory} className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap bg-white border-2 border-lavender-dark text-lavender-dark hover:bg-lavender-light/20 rounded-xl font-medium">Add</button>
                </div>
              </div>

              <div className="sm:col-span-3 flex gap-3 mt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : editing ? "Update Category" : "Create Category"}</button>
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
                <button onClick={() => { setForm({ name: cat.name, icon: cat.icon, description: cat.description || "", subcategories: cat.subcategories || [] }); setEditing(cat._id); setShowForm(true); }}
                  className="text-xs font-medium text-lavender-dark hover:underline bg-lavender-light/20 px-3 py-1 rounded-full">Edit</button>
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