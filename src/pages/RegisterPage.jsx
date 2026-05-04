import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created successfully!');
      if (data.user.role === 'vendor') navigate('/vendor');
      else navigate('/home');
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lavender-400 rounded-2xl shadow-lg mb-4">
            <Ticket className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-base text-gray-500 mt-1">Join QueuePro today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {['customer', 'vendor'].map(role => (
                  <button key={role} type="button"
                    onClick={() => setForm({...form, role})}
                    className={`py-3 rounded-xl text-base font-semibold border-2 transition-all capitalize ${
                      form.role === role
                        ? 'border-lavender-400 bg-lavender-50 text-lavender-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {role === 'customer' ? '🛒 Customer' : '🏪 Shop Owner'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="input-field pl-10" placeholder="Your full name" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="input-field pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-10 pr-10" placeholder="Min. 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-base text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-lavender-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
