import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile(data.data);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/profile', {
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar
      });
      setProfile(data.data);
      // Update local storage user
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.name = data.data.name;
      localStorage.setItem('user', JSON.stringify(stored));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill in all password fields');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    try {
      setChangingPassword(true);
      await api.put('/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #4A2766, #9B7CBD)', boxShadow: '0 8px 30px rgba(74,39,102,0.35)' }}
            >
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your account details</p>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white rounded-3xl p-6 space-y-5" style={{ border: '1px solid #EDE8F4', boxShadow: '0 4px 20px rgba(92,58,138,0.08)' }}>
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <User size={14} style={{ color: '#7B5C9E' }} /> Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                  <Shield size={12} className="text-purple-500" />
                  <span className="text-xs font-bold text-purple-700 uppercase">{profile.role || user?.role}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4A2766, #7B5C9E)', boxShadow: '0 4px 18px rgba(74,39,102,0.35)' }}
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-3xl p-6 space-y-4" style={{ border: '1px solid #EDE8F4', boxShadow: '0 4px 20px rgba(92,58,138,0.08)' }}>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} style={{ color: '#7B5C9E' }} /> Change Password
              </h2>
              <span className="text-xs font-bold text-purple-500">{showPasswordSection ? 'Hide' : 'Show'}</span>
            </button>

            {showPasswordSection && (
              <div className="space-y-4 pt-2">
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium transition-all pr-10"
                  />
                  <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium transition-all pr-10"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium transition-all"
                />

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7B5C9E, #9B7CBD)', boxShadow: '0 4px 18px rgba(74,39,102,0.25)' }}
                >
                  <Lock size={15} /> {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
