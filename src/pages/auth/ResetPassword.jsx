import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    
    try {
      setLoading(true);
      await api.put(`/auth/resetpassword/${token}`, { password: newPassword });
      setSuccess(true);
      toast.success('Password reset safely!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lavender-pale flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-lavender rounded-2xl items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">Q</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Create New Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password below</p>
        </div>

        <div className="card shadow-xl border-0">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
             <div className="text-center py-6">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Updated</h3>
              <p className="text-gray-500 mb-6">Your password has been changed successfully. Redirecting you to login...</p>
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
