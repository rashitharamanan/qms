import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { History, CheckCircle, XCircle, SkipForward, Ban, Calendar, ChevronLeft, ChevronRight, Store } from 'lucide-react';

const statusConfig = {
  completed: { label: 'Completed', icon: <CheckCircle size={14} />, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', icon: <XCircle size={14} />, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
  skipped: { label: 'Skipped', icon: <SkipForward size={14} />, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  rejected: { label: 'Rejected', icon: <Ban size={14} />, bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
};

export default function QueueHistory() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/queue/history?page=${page}&limit=15`);
      setTokens(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <History size={22} style={{ color: '#7B5C9E' }} /> Queue History
              </h1>
              <p className="text-sm text-slate-500 font-medium">{pagination.total} past visits</p>
            </div>
          </div>

          {/* Token List */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : tokens.length === 0 ? (
            <div className="bg-white rounded-3xl py-16 text-center" style={{ border: '1px solid #EDE8F4', boxShadow: '0 4px 20px rgba(92,58,138,0.08)' }}>
              <div className="text-5xl mb-4 opacity-40">📋</div>
              <h3 className="font-bold text-slate-700 text-lg mb-1">No history yet</h3>
              <p className="text-sm text-slate-400">Your past queue visits will appear here</p>
              <Link to="/shops" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4A2766, #7B5C9E)', boxShadow: '0 4px 12px rgba(74,39,102,0.30)' }}>
                Browse Shops
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => {
                const status = statusConfig[token.status] || statusConfig.completed;
                return (
                  <div key={token._id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md"
                    style={{ border: '1px solid #EDE8F4', boxShadow: '0 2px 10px rgba(92,58,138,0.06)' }}>
                    
                    {/* Shop icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #EDE8F4, #DDD5EB)' }}>
                      {token.shopId?.logo ? (
                        <img src={token.shopId.logo} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Store size={20} style={{ color: '#7B5C9E' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-sm text-slate-800 truncate">{token.shopId?.shopName || 'Unknown Shop'}</h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.text} border ${status.border}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>{token.serviceId?.serviceName || 'Service'}</span>
                        <span>•</span>
                        <span className="font-bold text-purple-500">{token.tokenNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(token.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(token.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => fetchHistory(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: '#EDE8F4', color: '#4A2766' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchHistory(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: '#EDE8F4', color: '#4A2766' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
