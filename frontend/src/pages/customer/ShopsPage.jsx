import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, Store, MapPin, Clock, ChevronRight } from 'lucide-react';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    api.get('/admin/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('categoryName', selectedCategory);
    api.get(`/shops?${params}`).then(r => setShops(r.data.shops || [])).finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Shops</h1>
        <p className="text-gray-500 mt-1">Find and join queues at shops near you</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search shops..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="input-field sm:w-52">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            !selectedCategory ? 'bg-lavender-400 text-white border-lavender-400' : 'bg-white text-gray-600 border-gray-200 hover:border-lavender-300'
          }`}>All</button>
        {categories.slice(0, 6).map(c => (
          <button key={c._id} onClick={() => setSelectedCategory(c.name)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedCategory === c.name ? 'bg-lavender-400 text-white border-lavender-400' : 'bg-white text-gray-600 border-gray-200 hover:border-lavender-300'
            }`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No shops found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map(shop => (
            <Link key={shop._id} to={`/shops/${shop._id}`}
              className="card hover:shadow-md transition-all group cursor-pointer border hover:border-lavender-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-lavender-50 rounded-xl flex items-center justify-center text-2xl">
                    {shop.category?.icon || '🏪'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-lavender-600 transition-colors leading-tight">
                      {shop.shopName}
                    </h3>
                    <p className="text-xs text-gray-500">{shop.category?.name}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  shop.isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {shop.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>

              {shop.location?.address && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{shop.location.address}, {shop.location.city}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 font-medium">
                    👥 {shop.waitingCount || 0} waiting
                  </span>
                </div>
                <span className="text-lavender-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
