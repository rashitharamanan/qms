import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    api.get(`/shops/${id}`).then(r => {
      setShop(r.data.shop);
      setServices(r.data.services || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const joinQueue = async (serviceId) => {
    if (!user) {
      toast.error('Please login to join queue');
      navigate('/login');
      return;
    }
    setJoining(serviceId);
    try {
      const { data } = await api.post('/queue/join', { shopId: id, serviceId });
      toast.success(`Token ${data.token.tokenNumber} generated!`);
      navigate(`/token/${data.token._id}`);
    } catch (err) {
    } finally {
      setJoining(null);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (!shop) return (
    <div className="card text-center py-16">
      <p className="text-gray-400">Shop not found</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* Shop Header */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-lavender-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {shop.category?.icon || '🏪'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop.shopName}</h1>
              <p className="text-gray-500">{shop.category?.name}</p>
              {shop.description && <p className="text-sm text-gray-600 mt-2 max-w-md">{shop.description}</p>}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${
            shop.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
            {shop.isOpen ? 'Open Now' : 'Closed'}
          </div>
        </div>

        {(shop.location?.address || shop.location?.city) && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
            <MapPin className="w-4 h-4" />
            <span>{[shop.location.address, shop.location.city, shop.location.state].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Services</h2>
        {services.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">No services available</div>
        ) : (
          <div className="grid gap-4">
            {services.map(service => (
              <div key={service._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-lavender-200 border transition-all">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{service.serviceName}</h3>
                  {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-lavender-400" />
                      <span>~{service.estimatedTime} min/person</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{service.waitingCount || 0} waiting</span>
                    </div>
                    {service.price > 0 && (
                      <span className="font-semibold text-gray-800">₹{service.price}</span>
                    )}
                  </div>
                  {service.waitingCount > 0 && (
                    <div className="mt-2 text-xs text-amber-600 font-medium">
                      ⏱ Est. wait: ~{service.waitingCount * service.estimatedTime} min
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/queue/live/${shop._id}/${service._id}`}
                    className="btn-secondary text-sm py-2 px-3">
                    Live Queue
                  </Link>
                  <button onClick={() => joinQueue(service._id)}
                    disabled={!shop.isOpen || joining === service._id}
                    className={`btn-primary text-sm py-2 px-4 flex items-center gap-2 ${
                      !shop.isOpen ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    {joining === service._id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {shop.isOpen ? 'Get Token' : 'Shop Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
