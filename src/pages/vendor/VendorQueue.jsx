import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { ChevronRight, SkipForward, CheckCircle, Bell, Users, RefreshCw, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const badgeClass = {
  pending: 'bg-gray-100 text-gray-500',
  waiting: 'badge-waiting', called: 'badge-called',
  'in-service': 'badge-in-service', completed: 'badge-completed',
  skipped: 'badge-skipped', cancelled: 'badge-cancelled'
};

export default function VendorQueue() {
  const { socket } = useSocket();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchServices = async () => {
    const { data } = await api.get('/vendor/services');
    setServices(data.services || []);
    if (data.services?.length && !selectedService) {
      setSelectedService(data.services[0]._id);
    }
  };

  const fetchQueue = async () => {
    if (!selectedService) return;
    const { data } = await api.get(`/vendor/queue?serviceId=${selectedService}`);
    setQueue(data.queue || []);
    setStats(data.stats || {});
  };

  const fetchShop = async () => {
    const { data } = await api.get('/vendor/shop');
    setShop(data.shop);
  };

  useEffect(() => {
    Promise.all([fetchServices(), fetchShop()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchQueue(); }, [selectedService]);

  useEffect(() => {
    if (!socket || !shop) return;
    socket.emit('join-shop', shop._id);
    socket.on('new-token', fetchQueue);
    socket.on('token-cancelled', fetchQueue);
    socket.on('queue_updated', fetchQueue);
    return () => { 
      socket.off('new-token'); 
      socket.off('token-cancelled'); 
      socket.off('queue_updated'); 
    };
  }, [socket, shop, selectedService]);

  const callNext = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.put('/vendor/queue/call-next', { serviceId: selectedService });
      if (data.token) toast.success(`Called: ${data.token.tokenNumber}`);
      else toast('Queue is empty', { icon: '📭' });
      fetchQueue();
    } catch (err) {}
    setActionLoading(false);
  };

  const skipToken = async (tokenId) => {
    try {
      await api.put('/vendor/queue/skip', { tokenId });
      toast('Token skipped');
      fetchQueue();
    } catch (err) {}
  };

  const acceptToken = async (tokenId) => {
    setActionLoading(true);
    try {
      await api.put('/vendor/queue/accept', { tokenId });
      toast.success('Token Approved');
      fetchQueue();
    } catch (err) {}
    setActionLoading(false);
  };

  const rejectToken = async (tokenId) => {
    setActionLoading(true);
    try {
      await api.put('/vendor/queue/reject', { tokenId });
      toast('Token Rejected', { icon: '❌' });
      fetchQueue();
    } catch (err) {}
    setActionLoading(false);
  };

  const startService = async (tokenId) => {
    try {
      await api.put('/vendor/queue/start', { tokenId });
      toast.success('Service started!');
      fetchQueue();
    } catch (err) {}
  };

  const completeToken = async (tokenId) => {
    try {
      await api.put('/vendor/queue/complete', { tokenId });
      toast.success('Service completed!');
      fetchQueue();
    } catch (err) {}
  };

  const currentInService = queue.find(t => t.status === 'in-service' || t.status === 'called');
  const pending = queue.filter(t => t.status === 'pending');
  const waiting = queue.filter(t => t.status === 'waiting');
  const done = queue.filter(t => ['completed', 'skipped', 'cancelled', 'rejected'].includes(t.status));

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 rounded" /><div className="h-64 bg-gray-200 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Queue Manager</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchQueue} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={callNext} disabled={actionLoading || !shop?.isOpen}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Bell className="w-5 h-5" />
            {actionLoading ? 'Calling...' : 'Call Next'}
          </button>
        </div>
      </div>

      {!shop?.isOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
          ⚠️ Your shop is currently closed. Open it from the Dashboard to manage queues.
        </div>
      )}

      {/* Service Selector */}
      {services.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {services.map(s => (
            <button key={s._id} onClick={() => setSelectedService(s._id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 border transition-all ${
                selectedService === s._id
                  ? 'bg-lavender text-white border-lavender'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-lavender-light'
              }`}>{s.serviceName}</button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-lavender' },
          { label: 'Pending', value: pending.length || 0, color: 'text-blue-600' },
          { label: 'Waiting', value: stats.waiting || 0, color: 'text-amber-600' },
          { label: 'Done', value: stats.completed || 0, color: 'text-green-600' },
          { label: 'Skipped', value: stats.skipped || 0, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center p-3">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="card border-blue-200 bg-blue-50/30">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Pending Requests ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((t) => (
              <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {t.tokenNumber}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.customerId?.name}</div>
                    <div className="text-xs text-gray-500">Requested a token</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => acceptToken(t._id)} disabled={actionLoading}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all focus:ring-2 focus:ring-green-400 focus:outline-none">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => rejectToken(t._id)} disabled={actionLoading}
                    className="flex items-center gap-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently Serving */}
      {currentInService && (
        <div className={`card ${currentInService.status === 'in-service' ? 'bg-emerald-50 border-emerald-100' : 'bg-lavender-pale border-lavender/20'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center token-pulse ${currentInService.status === 'in-service' ? 'bg-emerald-500' : 'bg-lavender'}`}>
                <span className="text-white font-bold text-xl">{currentInService.tokenNumber}</span>
              </div>
              <div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-3 py-1 rounded-full inline-block ${
                  currentInService.status === 'in-service' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-lavender/20 text-lavender animate-pulse border border-lavender/30'
                }`}>
                  {currentInService.status === 'in-service' ? '● Service in Progress' : '⏳ Waiting for Customer to Arrive'}
                </div>
                <div className="font-bold text-gray-900">{currentInService.customerId?.name || 'Customer'}</div>
                <div className="text-sm text-gray-500">{currentInService.serviceId?.serviceName}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => skipToken(currentInService._id)}
                className="btn-secondary flex items-center gap-1 text-sm py-2 px-4 border-slate-200">
                <SkipForward className="w-4 h-4" /> Skip
              </button>
              {currentInService.status === 'called' ? (
                <button onClick={() => startService(currentInService._id)}
                  className="flex items-center gap-1 bg-lavender hover:bg-lavender-dark text-white font-semibold px-6 py-2 rounded-xl text-sm transition-all shadow-lg shadow-lavender/20">
                  <Zap className="w-4 h-4" /> Start Service
                </button>
              ) : (
                <button onClick={() => completeToken(currentInService._id)}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-all shadow-lg shadow-emerald-100">
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waiting Queue */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-lavender-400" />
          Waiting ({waiting.length})
        </h3>
        {waiting.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No customers waiting 🎉</p>
        ) : (
          <div className="space-y-2">
            {waiting.map((t, idx) => (
              <div key={t._id} className={`flex items-center justify-between p-3 rounded-xl ${
                idx === 0 ? 'bg-lavender-50 border border-lavender-100' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-lavender-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{idx + 1}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{t.tokenNumber}</div>
                    <div className="text-xs text-gray-500">{t.customerId?.name}</div>
                  </div>
                  {idx === 0 && <span className="text-xs text-lavender-500 font-medium bg-lavender-100 px-2 py-0.5 rounded-full">Next</span>}
                </div>
                <button onClick={() => skipToken(t._id)}
                  className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                  Skip
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-500 mb-4">Completed / Skipped ({done.length})</h3>
          <div className="space-y-2">
            {done.map(t => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-70">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-600">{t.tokenNumber}</span>
                  <span className="text-sm text-gray-500">{t.customerId?.name}</span>
                </div>
                <span className={badgeClass[t.status]}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
