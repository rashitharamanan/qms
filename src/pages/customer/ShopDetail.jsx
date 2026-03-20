import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/shops/" + id),
      api.get("/shops/" + id + "/services")
    ]).then(([shopRes, servRes]) => {
      setShop(shopRes.data.data);
      setServices(servRes.data.data);
      setLoading(false);
    });
  }, [id]);

  const joinQueue = async (serviceId) => {
    if (!user) return navigate("/login");
    setJoining(serviceId);
    setMessage(null);
    try {
      const { data } = await api.post("/queue/join", { shopId: id, serviceId });
      setMessage({ type: "success", text: "Token " + data.data.tokenNumber + " assigned! Est. wait: " + data.data.estimatedWaitTime + " min" });
      navigate("/my-tokens");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to join queue" });
    } finally { setJoining(null); }
  };

  if (loading) return <MainLayout><LoadingSpinner size="lg" /></MainLayout>;
  if (!shop) return <MainLayout><div className="text-center py-20">Shop not found</div></MainLayout>;

  return (
    <MainLayout>
      <div className="w-full px-4 sm:px-8 xl:px-12 py-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm mb-6 flex items-center gap-2">← Back</button>
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.shopName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md flex-shrink-0 bg-gray-100" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-lavender-pale rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                  {shop.category?.icon || "🏪"}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">{shop.shopName}</h1>
                <p className="text-gray-500">{shop.category?.name}</p>
                {shop.location?.address && <p className="text-sm text-gray-400 mt-1">📍 {shop.location.address}, {shop.location.city}</p>}
                {shop.phone && <p className="text-sm text-gray-400">📞 {shop.phone}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={"px-4 py-1.5 rounded-full text-sm font-semibold " + (shop.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                {shop.isOpen ? "● Open Now" : "○ Currently Closed"}
              </span>
              <span className="text-xs text-gray-400">Max {shop.maxQueueLimit} tokens/day</span>
            </div>
          </div>
          {shop.description && <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">{shop.description}</p>}
        </div>

        {message && (
          <div className={"rounded-xl p-4 mb-6 text-sm font-medium " + (message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200")}>
            {message.text}
          </div>
        )}

        <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Available Services</h2>
        {services.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No services available</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(svc => (
              <div key={svc._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{svc.serviceName}</h3>
                  <span className="text-xs bg-lavender-pale text-lavender-dark px-2 py-1 rounded-lg font-medium">{svc.tokenPrefix}###</span>
                </div>
                {svc.description && <p className="text-sm text-gray-500 mb-3">{svc.description}</p>}
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">
                  <div className="flex flex-col">
                    <span className="text-slate-300">Base Time</span>
                    <span className="text-slate-700">{svc.estimatedTime}m</span>
                  </div>
                  <div className="w-px h-6 bg-slate-50" />
                  <div className="flex flex-col">
                    <span className="text-lavender/50">Current Wait</span>
                    <span className="text-lavender font-italic">~{svc.waitTime || 0}m</span>
                  </div>
                  <div className="w-px h-6 bg-slate-50" />
                  <div className="flex flex-col">
                    <span className="text-slate-300">Queue</span>
                    <span className="text-slate-700">{svc.ahead || 0}</span>
                  </div>
                  {svc.price > 0 && <div className="ml-auto text-emerald-600 font-bold">₹{svc.price}</div>}
                </div>
                <button
                  onClick={() => joinQueue(svc._id)}
                  disabled={!shop.isOpen || joining === svc._id}
                  className={"w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg " + (shop.isOpen ? "btn-primary shadow-lavender/20" : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none")}>
                  {joining === svc._id ? "Processing..." : shop.isOpen ? "Join This Queue" : "Service Unavailable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}