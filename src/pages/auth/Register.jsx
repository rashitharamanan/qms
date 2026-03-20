import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "vendor") navigate("/vendor");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-lavender-pale flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-lavender rounded-2xl items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">Q</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join QueueMS today</p>
        </div>
        <div className="card shadow-xl border-0">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
              <input type="text" required className="input-field" placeholder="John Doe"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone (Optional)</label>
              <input type="tel" className="input-field" placeholder="+91 9876543210"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {["customer", "vendor"].map(role => (
                  <button key={role} type="button"
                    className={"py-3 rounded-xl border-2 font-medium capitalize transition-all " + (form.role === role ? "border-lavender bg-lavender text-white" : "border-gray-200 text-gray-600 hover:border-lavender")}
                    onClick={() => setForm({...form, role})}>
                    {role === "customer" ? "👤 Customer" : "🏪 Vendor"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <input type="password" required minLength={6} className="input-field" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Already registered? <Link to="/login" className="text-lavender-dark font-medium hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}