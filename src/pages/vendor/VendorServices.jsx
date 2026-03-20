import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Clock, X, Save, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../layouts/DashboardLayout';

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" }
];

const emptyForm = { serviceName: '', description: '', estimatedTime: 15, price: 0, tokenPrefix: 'T', isActive: true };

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/vendor/services').then(r => setServices(r.data.services || []));

  useEffect(() => { fetch().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/vendor/services/${editId}`, form);
        toast.success('Service updated!');
      } else {
        await api.post('/vendor/services', form);
        toast.success('Service added!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetch();
    } catch (err) {}
    setSaving(false);
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/vendor/services/${id}`);
      toast.success('Service deleted');
      fetch();
    } catch (err) {}
  };

  const openEdit = (s) => {
    setForm({ serviceName: s.serviceName, description: s.description || '', estimatedTime: s.estimatedTime, price: s.price, tokenPrefix: s.tokenPrefix, isActive: s.isActive });
    setEditId(s._id);
    setShowForm(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage your shop's services and queues</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name *</label>
                <input type="text" value={form.serviceName} onChange={e => set('serviceName', e.target.value)}
                  className="input-field" placeholder="e.g. Haircut, Dosa" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  className="input-field resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Est. Time (min) *</label>
                  <input type="number" value={form.estimatedTime} onChange={e => set('estimatedTime', +e.target.value)}
                    className="input-field" min={1} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Token Prefix</label>
                  <input type="text" value={form.tokenPrefix} onChange={e => set('tokenPrefix', e.target.value.toUpperCase())}
                    className="input-field" maxLength={3} placeholder="e.g. D, H, M" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input type="number" value={form.price} onChange={e => set('price', +e.target.value)}
                  className="input-field" min={0} placeholder="0 = free" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                  className="w-4 h-4 accent-lavender-400" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editId ? 'Update' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <ListChecks className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="font-semibold text-gray-400">No services yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first service to start taking tokens</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2 mt-6">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map(s => (
            <div key={s._id} className="card flex items-center justify-between gap-4 hover:border-lavender-200 border transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-lavender-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lavender-700 font-bold">{s.tokenPrefix}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{s.serviceName}</h3>
                    {!s.isActive && <span className="badge bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  {s.description && <p className="text-sm text-gray-500 truncate">{s.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.estimatedTime} min</span>
                    {s.price > 0 && <span>₹{s.price}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-xl hover:bg-lavender-50 text-gray-500 hover:text-lavender-600 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteService(s._id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all">
                  <Trash2 className="w-4 h-4" />
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
