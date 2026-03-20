import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Store, Tag, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-700 rounded-2xl" />)}
      </div>
    </div>
  );

  const { stats, recentShops } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Vendors', value: stats?.totalVendors || 0, icon: Store, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Approved Shops', value: stats?.approvedShops || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Pending Shops', value: stats?.pendingShops || 0, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Today */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Clock className="w-8 h-8 text-lavender-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{stats?.todayQueues || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Queue Tokens Today</div>
        </div>
        <div className="card text-center">
          <Tag className="w-8 h-8 text-lavender-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{stats?.totalQueues || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Tokens Ever</div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Pending Shop Approvals ({recentShops?.length || 0})
          </h2>
          <Link to="/admin/shops?status=pending" className="text-sm text-lavender-600 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!recentShops?.length ? (
          <p className="text-center text-gray-400 py-6">No pending approvals 🎉</p>
        ) : (
          <div className="space-y-3">
            {recentShops.map(shop => (
              <div key={shop._id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div>
                  <div className="font-semibold text-gray-900">{shop.shopName}</div>
                  <div className="text-sm text-gray-500">{shop.vendorId?.name} · {shop.category?.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(shop.createdAt).toLocaleDateString()}</div>
                </div>
                <Link to="/admin/shops" className="btn-primary text-sm py-2 px-4">
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/shops', label: 'Manage Shops', icon: Store, desc: 'Approve vendors, view all shops' },
          { to: '/admin/categories', label: 'Categories', icon: Tag, desc: 'Add and manage categories' },
          { to: '/admin/users', label: 'Users', icon: Users, desc: 'View and manage all users' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="card hover:shadow-md transition-all group border hover:border-lavender-200">
            <Icon className="w-8 h-8 text-lavender-400 mb-3" />
            <div className="font-bold text-gray-900 group-hover:text-lavender-600 transition-colors">{label}</div>
            <div className="text-sm text-gray-500 mt-1">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
