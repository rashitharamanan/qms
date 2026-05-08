import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    try {
      setLoading(true);
      await api.post('/auth/forgotpassword', { email });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lavender-pale flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-lavender rounded-2xl items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">Q</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 mt-2">
            {!success ? "Enter your email to receive a reset link" : "Check your inbox"}
          </p>
        </div>

        <div className="card shadow-xl border-0">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
              >
                <Send size={18} /> {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Sent!</h3>
              <p className="text-gray-500 mb-6">
                We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>. 
                Please check your inbox.
              </p>
              <button onClick={() => setSuccess(false)} className="text-sm font-medium text-lavender-dark hover:underline">
                Try another email
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-lavender-dark transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
