import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/admin", icon: "📊", label: "Dashboard" },
  { to: "/admin/shops", icon: "🏪", label: "Shops" },
  { to: "/admin/categories", icon: "📂", label: "Categories" },
  { to: "/admin/users", icon: "👥", label: "Users" }
];

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchShops = () => api.get("/admin/shops").then(r => { setShops(r.data.data); setLoading(false); });
  useEffect(() => { fetchShops(); }, []);

  const approve = async (id) => { await api.put("/admin/shops/" + id + "/approve"); fetchShops(); };
  const reject = async (id) => { await api.put("/admin/shops/" + id + "/reject"); fetchShops(); };

  const filtered = filter === "pending" ? shops.filter(s => !s.isApproved) : filter === "approved" ? shops.filter(s => s.isApproved) : shops;

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-gray-900">Shops ({shops.length})</h1>
          <div className="flex gap-2">
            {["all", "pending", "approved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={"px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all " + (filter === f ? "bg-lavender text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">No shops found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(shop => (
              <div key={shop._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-lavender-pale rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {shop.category?.icon || "🏪"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                    <p className="text-sm text-gray-500">{shop.category?.name} • Owner: {shop.vendorId?.name}</p>
                    <p className="text-xs text-gray-400">{shop.location?.city || "No location"} • {shop.vendorId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (shop.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {shop.isApproved ? "Approved" : "Pending"}
                  </span>
                  {!shop.isApproved ? (
                    <button onClick={() => approve(shop._id)} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                  ) : (
                    <button onClick={() => reject(shop._id)} className="bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">Revoke</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}