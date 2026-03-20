import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'vendor') navigate('/vendor');
      else navigate('/home');
    } catch (err) {
      // handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@qms.com', password: 'admin123' });
    if (role === 'vendor') setForm({ email: 'vendor@qms.com', password: 'vendor123' });
    if (role === 'customer') setForm({ email: 'customer@qms.com', password: 'customer123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lavender-400 rounded-2xl shadow-lg mb-4">
            <Ticket className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">QueuePro</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Demo Credentials */}
        <div className="card mb-6 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Demo Login</p>
          <div className="flex gap-2 flex-wrap">
            {['admin', 'vendor', 'customer'].map(role => (
              <button key={role} onClick={() => fillDemo(role)}
                className="px-3 py-1.5 bg-lavender-50 hover:bg-lavender-100 text-lavender-700 text-xs font-semibold rounded-lg capitalize transition-colors border border-lavender-200">
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-lavender-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
