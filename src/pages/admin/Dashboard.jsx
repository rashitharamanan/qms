import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const navItems = [
  { to: "/admin", icon: "📊", label: "Dashboard" },
  { to: "/admin/shops", icon: "🏪", label: "Shops" },
  { to: "/admin/categories", icon: "📂", label: "Categories" },
  { to: "/admin/users", icon: "👥", label: "Users" }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(r => { setStats(r.data.data); setLoading(false); });
  }, []);

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">System overview and management</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Customers" value={stats?.totalUsers || 0} icon="👥" color="lavender" />
          <StatCard label="Active Shops" value={stats?.totalShops || 0} icon="🏪" color="green" />
          <StatCard label="Pending Approval" value={stats?.pendingShops || 0} icon="⏳" color="amber" />
          <StatCard label="Categories" value={stats?.totalCategories || 0} icon="📂" color="blue" />
          <StatCard label="Today\'s Tokens" value={stats?.todayTokens || 0} icon="🎫" color="lavender" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/admin/shops" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">🏪</div>
            <h3 className="font-semibold text-gray-900">Manage Shops</h3>
            <p className="text-sm text-gray-500 mt-1">{stats?.pendingShops} pending approval</p>
          </Link>
          <Link to="/admin/categories" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">📂</div>
            <h3 className="font-semibold text-gray-900">Manage Categories</h3>
            <p className="text-sm text-gray-500 mt-1">{stats?.totalCategories} categories</p>
          </Link>
          <Link to="/admin/users" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">{stats?.totalUsers} customers</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}