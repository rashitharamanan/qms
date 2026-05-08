import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, Clock, Users, ChevronRight, Star } from 'lucide-react';

const categories = [
  { name: 'Food & Restaurant', icon: '🍽️', color: 'bg-orange-50 border-orange-100' },
  { name: 'Pharmacy', icon: '💊', color: 'bg-green-50 border-green-100' },
  { name: 'Salon & Beauty', icon: '✂️', color: 'bg-pink-50 border-pink-100' },
  { name: 'Hospital / Clinic', icon: '🏥', color: 'bg-blue-50 border-blue-100' },
  { name: 'Government Services', icon: '🏛️', color: 'bg-purple-50 border-purple-100' },
  { name: 'Electronics', icon: '📱', color: 'bg-cyan-50 border-cyan-100' },
  { name: 'Grocery Store', icon: '🛒', color: 'bg-yellow-50 border-yellow-100' },
  { name: 'Home Appliances', icon: '🏠', color: 'bg-red-50 border-red-100' },
];

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shops?limit=6').then(r => setShops(r.data.shops)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Queue System Active
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Skip the wait,<br />not the service
          </h1>
          <p className="text-lavender-100 text-lg mb-8">
            Browse shops, get tokens, and track your queue position in real-time.
          </p>
          <Link to="/shops" className="inline-flex items-center gap-2 bg-white text-lavender-600 font-bold px-6 py-3 rounded-xl hover:bg-lavender-50 transition-all shadow-lg">
            Browse Shops <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Store, label: 'Active Shops', value: '50+', color: 'text-lavender-500' },
          { icon: Users, label: 'Customers Served', value: '10K+', color: 'text-green-500' },
          { icon: Clock, label: 'Avg Wait Saved', value: '25 min', color: 'text-blue-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center p-4">
            <Icon className={`w-7 h-7 mx-auto mb-2 ${color}`} />
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/shops" className="text-sm text-lavender-600 font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(({ name, icon, color }) => (
            <Link key={name} to={`/shops?category=${encodeURIComponent(name)}`}
              className={`${color} border rounded-2xl p-4 text-center hover:shadow-md transition-all group cursor-pointer`}>
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
              <div className="text-sm font-semibold text-gray-700 leading-tight">{name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Shops */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Open Shops Nearby</h2>
          <Link to="/shops" className="text-sm text-lavender-600 font-semibold hover:underline flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No shops available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.filter(s => s.isOpen).slice(0, 6).map(shop => (
              <Link key={shop._id} to={`/shops/${shop._id}`}
                className="card hover:shadow-md transition-all group border hover:border-lavender-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{shop.category?.icon || '🏪'}</div>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <span className={`text-xs font-medium ${shop.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                      {shop.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-lavender-600 transition-colors">{shop.shopName}</h3>
                <p className="text-sm text-gray-500 mt-1">{shop.category?.name}</p>
                {shop.location?.city && (
                  <p className="text-xs text-gray-400 mt-1">📍 {shop.location.city}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-xs font-semibold">{shop.waitingCount || 0} waiting</span>
                  </div>
                  <span className="text-xs text-lavender-600 font-semibold group-hover:underline">
                    Get Token →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
