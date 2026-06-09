import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera, Save, Crown, Calendar, Shield, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { userStorage } from '@/shared/utils/userStorage';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'subscription'>('profile');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authApi.me().then(r => {
      setUser(r.data);
      setName(r.data.name || '');
      setPicture(r.data.picture || '');
      setLoading(false);
    }).catch(() => {
      setUser(userStorage.getSync());
      setLoading(false);
    });
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { showToast('error', 'Name is required'); return; }
    setSaving(true);
    try {
      const r = await authApi.updateProfile({ name: name.trim(), picture });
      const updatedUser = { ...user, ...r.data.user };
      setUser(updatedUser);
      await userStorage.set(updatedUser);
      if (r.data.token) localStorage.setItem('token', r.data.token);
      showToast('success', 'Profile updated!');
    } catch (e: any) {
      showToast('error', e.response?.data?.error || 'Update failed');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { showToast('error', 'Fill all fields'); return; }
    if (newPassword.length < 6) { showToast('error', 'New password must be 6+ characters'); return; }
    if (newPassword !== confirmPassword) { showToast('error', 'Passwords do not match'); return; }
    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('success', 'Password changed!');
    } catch (e: any) {
      showToast('error', e.response?.data?.error || 'Change failed');
    }
    setSaving(false);
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('error', 'Max 2MB allowed'); return; }
    const reader = new FileReader();
    reader.onload = () => setPicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'subscription', label: 'Subscription', icon: Crown },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B1020' }}>
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1020' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100]">
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </motion.div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-white/40 mt-1 text-sm">Manage your profile and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-xl p-1 border border-white/10 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-white/10">
                  {picture ? <img src={picture} alt="" className="w-full h-full object-cover" /> : (name || 'U')[0]?.toUpperCase()}
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
              </div>
              <div>
                <div className="text-white font-semibold">{name || 'User'}</div>
                <div className="text-white/40 text-sm">{user?.email}</div>
                {user?.picture && !picture && (
                  <button onClick={() => { setPicture(user.picture); }} className="text-xs text-purple-400 hover:text-purple-300 mt-1">Use Google picture</button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={user?.email || ''} readOnly
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
              </div>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Account type:</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                <Shield className="w-3 h-3 inline mr-1" />{user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>

            {/* Save */}
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
            <h3 className="text-white font-semibold mb-4">Change Password</h3>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" />
              </div>
            </div>

            <button onClick={handleChangePassword} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Change Password
            </button>
          </motion.div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user?.is_premium ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-white/5'}`}>
                <Crown className={`w-7 h-7 ${user?.is_premium ? 'text-white' : 'text-white/30'}`} />
              </div>
              <div>
                <div className="text-white font-bold text-lg">{user?.is_premium ? 'Premium Plan' : 'Free Plan'}</div>
                <div className="text-white/40 text-sm">{user?.is_premium ? 'Unlimited access to all features' : 'Upgrade for full access'}</div>
              </div>
            </div>

            {user?.is_premium && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Status</div>
                  <div className="text-sm text-emerald-300 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Renewal</div>
                  <div className="text-sm text-white font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-white/40" /> {user?.subscription_end ? new Date(user.subscription_end).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            )}

            {!user?.is_premium && (
              <Link to="/pricing"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25">
                <Crown className="w-4 h-4" /> Upgrade to Premium — ₹5/month
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
