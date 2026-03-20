import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Bell, 
  Mail, 
  Trash2, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  Settings as SettingsIcon,
  Smartphone,
  Wallet,
  CreditCard,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

export default function Settings() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifSettings, setNotifSettings] = useState({
    emailTracks: true,
    emailGifts: true,
    pushLive: true,
    pushMessages: true
  });
  
  const [payoutData, setPayoutData] = useState({
    method: 'bank_transfer',
    paypalEmail: '',
    bankAccount: {
      accountNumber: '',
      routingNumber: '',
      accountHolder: '',
      bankName: ''
    }
  });
  const [isUpdatingPayout, setIsUpdatingPayout] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPayout(true);
    try {
      await (userService as any).updatePayoutInfo(payoutData);
      toast.success('Payout information updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update payout info');
    } finally {
      setIsUpdatingPayout(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-gray-900 rounded-xl shadow-lg">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">Manage your security and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Navigation / Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Security Score
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Password Status</span>
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full">Secure</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Two-Factor Auth</span>
                <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full">Disabled</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[65%]" />
              </div>
              <p className="text-[10px] text-gray-400">Your account security is good. Enable 2FA for maximum protection.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl shadow-gray-200">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-400" />
              Artist Studio App
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">Download the mobile app to go live and manage your fans on the go.</p>
            <button className="w-full py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Get Artist App
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Change Password */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              Update Password
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className={inputClass}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={inputClass}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      className={inputClass}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>

          {/* Payout Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-400" />
              Payout Settings
            </h2>
            
            <form onSubmit={handlePayoutSubmit} className="space-y-6">
              <div>
                <label className={labelClass}>Payment Method</label>
                <div className="flex gap-4">
                  {(['bank_transfer', 'paypal'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayoutData({...payoutData, method: m})}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                        payoutData.method === m
                          ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m === 'paypal' ? <Mail className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      {m === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              {payoutData.method === 'paypal' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className={labelClass}>PayPal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="paypal@example.com"
                      value={payoutData.paypalEmail}
                      onChange={(e) => setPayoutData({...payoutData, paypalEmail: e.target.value})}
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input
                        type="text"
                        className={inputClass.replace('pl-10', 'px-4')}
                        value={payoutData.bankAccount.bankName}
                        onChange={(e) => setPayoutData({...payoutData, bankAccount: {...payoutData.bankAccount, bankName: e.target.value}})}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Holder</label>
                      <input
                        type="text"
                        className={inputClass.replace('pl-10', 'px-4')}
                        value={payoutData.bankAccount.accountHolder}
                        onChange={(e) => setPayoutData({...payoutData, bankAccount: {...payoutData.bankAccount, accountHolder: e.target.value}})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input
                        type="text"
                        className={inputClass.replace('pl-10', 'px-4')}
                        value={payoutData.bankAccount.accountNumber}
                        onChange={(e) => setPayoutData({...payoutData, bankAccount: {...payoutData.bankAccount, accountNumber: e.target.value}})}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Routing Number</label>
                      <input
                        type="text"
                        className={inputClass.replace('pl-10', 'px-4')}
                        value={payoutData.bankAccount.routingNumber}
                        onChange={(e) => setPayoutData({...payoutData, bankAccount: {...payoutData.bankAccount, routingNumber: e.target.value}})}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPayout}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-100"
                >
                  {isUpdatingPayout ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Payout Info
                </button>
              </div>
            </form>
          </motion.div>

          {/* Notifications */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-400" />
              Notification Settings
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Weekly summaries and track approvals</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Tracks</span>
                    <input 
                      type="checkbox" 
                      checked={notifSettings.emailTracks} 
                      onChange={(e) => setNotifSettings({...notifSettings, emailTracks: e.target.checked})}
                      className="w-4 h-4 rounded-md border-gray-300 text-green-600"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Gifts</span>
                    <input 
                      type="checkbox" 
                      checked={notifSettings.emailGifts} 
                      onChange={(e) => setNotifSettings({...notifSettings, emailGifts: e.target.checked})}
                      className="w-4 h-4 rounded-md border-gray-300 text-green-600"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Push Notifications</h4>
                    <p className="text-xs text-gray-500">Live stream events and chat mentions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Live</span>
                    <input 
                      type="checkbox" 
                      checked={notifSettings.pushLive} 
                      onChange={(e) => setNotifSettings({...notifSettings, pushLive: e.target.checked})}
                      className="w-4 h-4 rounded-md border-gray-300 text-green-600"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Chat</span>
                    <input 
                      type="checkbox" 
                      checked={notifSettings.pushMessages} 
                      onChange={(e) => setNotifSettings({...notifSettings, pushMessages: e.target.checked})}
                      className="w-4 h-4 rounded-md border-gray-300 text-green-600"
                    />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-8"
          >
            <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-red-600 mb-6 font-medium">Permanently delete your artist account and all your music content.</p>
            <button
              onClick={() => {
                if (window.confirm("Are you absolutely sure? This cannot be undone and all your music will be removed.")) {
                  toast.error("Account deletion requested. Please check your email to confirm.");
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Delete Artist Account
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}