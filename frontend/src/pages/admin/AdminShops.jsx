import { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Store, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const statusTabs = ['all', 'pending', 'approved', 'rejected'];

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchShops = (status = '') => {
    setLoading(true);
    api.get(`/admin/shops${status && status !== 'all' ? `?status=${status}` : ''}`)
      .then(r => setShops(r.data.shops || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShops(activeTab); }, [activeTab]);

  const approveShop = async (id, status) => {
    try {
      await api.put(`/admin/shops/${id}/approve`, { status });
      toast.success(`Shop ${status}!`);
      fetchShops(activeTab);
    } catch (err) {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shops Management</h1>
        <p className="text-gray-500 mt-1">Review and approve vendor shops</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {statusTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-lavender-400 text-lavender-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>{tab}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : shops.length === 0 ? (
        <div className="card text-center py-16">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-medium">No shops found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop._id} className="card flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-lavender-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {shop.category?.icon || '🏪'}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{shop.shopName}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    by {shop.vendorId?.name} · {shop.category?.name}
                  </div>
                  {shop.location?.city && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" /> {shop.location.city}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3" /> {new Date(shop.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${
                  shop.isApproved === 'approved' ? 'bg-green-100 text-green-700' :
                  shop.isApproved === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-600'
                }`}>{shop.isApproved}</span>

                {shop.isApproved === 'pending' && (
                  <>
                    <button onClick={() => approveShop(shop._id, 'approved')}
                      className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => approveShop(shop._id, 'rejected')}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {shop.isApproved === 'approved' && (
                  <button onClick={() => approveShop(shop._id, 'rejected')}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
                    Revoke
                  </button>
                )}
                {shop.isApproved === 'rejected' && (
                  <button onClick={() => approveShop(shop._id, 'approved')}
                    className="text-sm text-green-600 hover:text-green-800 px-3 py-2 rounded-xl hover:bg-green-50 transition-all">
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
