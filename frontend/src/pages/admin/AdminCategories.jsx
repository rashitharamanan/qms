import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Tag, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', icon: '🏪', description: '', subcategories: [] };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newSub, setNewSub] = useState('');
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/admin/categories').then(r => setCategories(r.data.categories || []));
  useEffect(() => { fetch().finally(() => setLoading(false)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/categories', form);
      toast.success('Category created!');
      setShowForm(false);
      setForm(emptyForm);
      fetch();
    } catch (err) {}
    setSaving(false);
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetch();
    } catch (err) {}
  };

  const addSub = async (catId) => {
    if (!newSub.trim()) return;
    try {
      await api.post(`/admin/categories/${catId}/subcategory`, { name: newSub });
      setNewSub('');
      fetch();
    } catch (err) {}
  };

  const addFormSub = () => {
    if (!newSub.trim()) return;
    setForm(f => ({ ...f, subcategories: [...f.subcategories, { name: newSub, icon: '🔹' }] }));
    setNewSub('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage shop categories and subcategories</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">New Category</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="input-field text-center text-2xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="Category name" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field" placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSub} onChange={e => setNewSub(e.target.value)}
                    className="input-field flex-1" placeholder="Add subcategory" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFormSub())} />
                  <button type="button" onClick={addFormSub} className="btn-secondary px-3">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.subcategories.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 bg-lavender-100 text-lavender-700 px-3 py-1 rounded-full text-sm font-medium">
                      {s.name}
                      <button type="button" onClick={() => setForm(f => ({ ...f, subcategories: f.subcategories.filter((_, j) => j !== i) }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat._id} className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(e => ({ ...e, [cat._id]: !e[cat._id] }))}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="font-bold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-500">{cat.subcategories?.length || 0} subcategories</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat._id); }}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expanded[cat._id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {expanded[cat._id] && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cat.subcategories?.map(s => (
                      <span key={s._id} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                        {s.icon} {s.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add subcategory" value={newSub} onChange={e => setNewSub(e.target.value)}
                      className="input-field flex-1 py-2 text-sm" onKeyDown={e => e.key === 'Enter' && addSub(cat._id)} />
                    <button onClick={() => addSub(cat._id)} className="btn-primary px-3 py-2 text-sm">Add</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
///