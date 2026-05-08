import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setEmailError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "vendor") navigate("/vendor");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-lavender-pale flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-lavender rounded-2xl items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">Q</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your QueueMS account</p>
        </div>
        <div className="card shadow-xl border-0">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <input type="email" required className={`input-field ${emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="you@example.com"
                value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setEmailError(""); }} />
              {emailError && <p className="text-red-500 text-xs mt-1.5">{emailError}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-lavender-dark font-medium hover:underline">Register</Link></p>
            <p className="text-sm"><Link to="/forgot-password" className="text-purple-500 font-medium hover:underline">Forgot Password?</Link></p>
            <p className="text-xs text-gray-400">Demo: admin@qms.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}