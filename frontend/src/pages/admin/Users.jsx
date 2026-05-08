import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const navItems = [
  { to: "/admin", icon: "📊", label: "Dashboard" },
  { to: "/admin/shops", icon: "🏪", label: "Shops" },
  { to: "/admin/categories", icon: "📂", label: "Categories" },
  { to: "/admin/users", icon: "👥", label: "Users" }
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/admin/users").then(r => { setUsers(r.data.data); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  const roleColors = { admin: "bg-purple-100 text-purple-700", vendor: "bg-blue-100 text-blue-700", customer: "bg-green-100 text-green-700" };

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-display text-2xl font-bold text-gray-900">Users ({filtered.length})</h1>
          <div className="flex gap-2">
            {["all", "customer", "vendor", "admin"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={"px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all " + (filter === f ? "bg-lavender text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">{user.name[0]?.toUpperCase()}</div>
                      <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4"><span className={"px-2 py-1 rounded-full text-xs font-semibold " + (roleColors[user.role] || "bg-gray-100")}>{user.role}</span></td>
                  <td className="px-6 py-4 text-xs text-gray-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}