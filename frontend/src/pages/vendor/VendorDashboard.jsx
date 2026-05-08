import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Users, CheckCircle, Clock, SkipForward, Store, ArrowRight, Power } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    try {
      const { data: d } = await api.get('/vendor/dashboard');
      setData(d);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket || !data?.shop) return;
    socket.emit('join_shop', data.shop._id);
    socket.on('new_token', fetchData);
    socket.on('queue_updated', fetchData);
    return () => { socket.off('new_token'); socket.off('queue_updated'); };
  }, [socket, data?.shop?._id]);

  const toggleShop = async () => {
    setToggling(true);
    try {
      const res = await api.put('/vendor/shop/toggle');
      toast.success(res.data.message);
      fetchData();
    } catch (err) {}
    setToggling(false);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  const { shop, stats, currentToken } = data || {};

  if (!shop) return (
    <div className="card text-center py-16">
      <Store className="w-16 h-16 mx-auto mb-4 text-gray-200" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">No Shop Registered</h2>
      <p className="text-gray-500 mb-6">Set up your shop to start managing queues</p>
      <Link to="/vendor/shop" className="btn-primary inline-flex items-center gap-2">
        Register Shop <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in w-full px-4 sm:px-8 xl:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shop.shopName}</h1>
          <p className="text-gray-500 mt-1">
            {shop.isApproved === 'approved' ? '✅ Approved' :
             shop.isApproved === 'pending' ? '⏳ Pending Approval' : '❌ Rejected'}
          </p>
        </div>
        {shop.isApproved === 'approved' && (
          <button onClick={toggleShop} disabled={toggling}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
              shop.isOpen
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
            }`}>
            <Power className="w-5 h-5" />
            {toggling ? 'Updating...' : shop.isOpen ? 'Close Shop' : 'Open Shop'}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Today', value: stats?.total || 0, icon: Users, color: 'text-lavender-500', bg: 'bg-lavender-50' },
          { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Waiting', value: stats?.waiting || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Completed', value: stats?.completed || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Skipped', value: stats?.skipped || 0, icon: SkipForward, color: 'text-red-500', bg: 'bg-red-50' },
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

      {/* Current Token */}
      {currentToken ? (
        <div className="card bg-lavender-pale border-lavender/20 border">
          <h3 className="font-bold text-gray-700 mb-3">Currently Serving</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-lavender-400 rounded-2xl flex items-center justify-center token-pulse">
                <span className="text-white font-bold text-xl">{currentToken.tokenNumber}</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">{currentToken.customerId?.name}</div>
                <div className="text-sm text-gray-500">{currentToken.serviceId?.serviceName}</div>
                <div className="badge badge-in-service mt-1">In Service</div>
              </div>
            </div>
            <Link to="/vendor/queue" className="btn-primary text-sm">
              Manage Queue
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-dashed border-2 border-gray-200 text-center py-8">
          <p className="text-gray-400 font-medium">No customer being served right now</p>
          <Link to="/vendor/queue" className="btn-primary inline-flex items-center gap-2 mt-4">
            Open Queue Manager <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/vendor/queue', label: 'Manage Queue', icon: Users, desc: 'Call next, skip, complete' },
          { to: '/vendor/services', label: 'Services', icon: CheckCircle, desc: 'Add or edit services' },
          { to: '/vendor/shop', label: 'Shop Settings', icon: Store, desc: 'Update shop details' },
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
