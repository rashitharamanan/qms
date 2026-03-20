import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/customer/Home";
import Shops from "./pages/customer/Shops";
import ShopDetail from "./pages/customer/ShopDetail";
import MyTokens from "./pages/customer/MyTokens";
import TokenPage from "./pages/customer/TokenPage";
import LiveQueuePage from "./pages/customer/LiveQueuePage";
import CustomerDashboard from "./pages/customer/Home";
import LandingPage from "./pages/customer/LandingPage";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorQueue from "./pages/vendor/Queue";
import VendorServices from "./pages/vendor/Services";
import VendorShop from "./pages/vendor/Shop";
import VendorStaff from "./pages/vendor/VendorStaff";
import VendorCounters from "./pages/vendor/VendorCounters";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminShops from "./pages/admin/Shops";
import AdminCategories from "./pages/admin/Categories";
import AdminUsers from "./pages/admin/Users";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-lavender border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:id" element={<ShopDetail />} />
            <Route path="/dashboard" element={<ProtectedRoute roles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/my-tokens" element={<ProtectedRoute roles={["customer"]}><MyTokens /></ProtectedRoute>} />
            <Route path="/token/:id" element={<ProtectedRoute roles={["customer"]}><TokenPage /></ProtectedRoute>} />
            <Route path="/queue/live/:shopId/:serviceId" element={<LiveQueuePage />} />
            <Route path="/vendor" element={<ProtectedRoute roles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
            <Route path="/vendor/queue" element={<ProtectedRoute roles={["vendor"]}><VendorQueue /></ProtectedRoute>} />
            <Route path="/vendor/services" element={<ProtectedRoute roles={["vendor"]}><VendorServices /></ProtectedRoute>} />
            <Route path="/vendor/shop" element={<ProtectedRoute roles={["vendor"]}><VendorShop /></ProtectedRoute>} />
            <Route path="/vendor/staff" element={<ProtectedRoute roles={["vendor"]}><VendorStaff /></ProtectedRoute>} />
            <Route path="/vendor/counters" element={<ProtectedRoute roles={["vendor"]}><VendorCounters /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/shops" element={<ProtectedRoute roles={["admin"]}><AdminShops /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={["admin"]}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}