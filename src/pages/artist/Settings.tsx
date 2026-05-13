import { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, Bell, Trash2, AlertTriangle,
  Loader2, Check, CreditCard, Mail, Wallet, ShieldCheck,
  Smartphone, Activity, Target, ShieldAlert, Settings as SettingsIcon,
  ChevronRight, AlertCircle, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const labelCls = "text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1";
const inputCls = "w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all";

export default function Settings() {
  // Password State
  const [pw, setPw] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false });
  const [savingPw, setSavingPw] = useState(false);

  // Payout State
  const [payout, setPayout] = useState({
    method: 'bank_transfer' as 'bank_transfer' | 'paypal',
    paypalEmail: '',
    bankAccount: { bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' },
  });
  const [savingPayout, setSavingPayout] = useState(false);

  // Notifications State
  const [notifs, setNotifs] = useState({
    emailTracks: true,
    emailGifts: true,
    pushLive: true,
    pushMessages: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  useEffect(() => {
    userService.getUserPreferences()
      .then(res => {
        const prefs = (res.data as any)?.data;
        if (prefs?.notifications) setNotifs(p => ({ ...p, ...prefs.notifications }));
        if (prefs?.payout) setPayout(p => ({ ...p, ...prefs.payout }));
      })
      .catch(() => {});
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPass !== pw.confirm) { toast.error('Passwords do not match'); return; }
    if (pw.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await userService.changePassword(pw.current, pw.newPass);
      toast.success('Password updated successfully');
      setPw({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const handlePayoutSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    try {
      await userService.updatePayoutInfo(payout);
      toast.success('Payout settings updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save payout settings');
    } finally { setSavingPayout(false); }
  };

  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifs(true);
    try {
      await userService.updateUserPreferences({ notifications: notifs });
      toast.success('Preferences updated');
    } catch {
      toast.error('Failed to save settings');
    } finally { setSavingNotifs(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) return;
    try {
      await userService.requestAccountDeletion();
      toast.success('Deletion request sent. Please check your email.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request deletion');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Account Settings</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Secure</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage your account security, payment methods, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Password Section */}
        <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                <Lock size={20} className="text-emerald-500" />
             </div>
             <h2 className="text-xl font-bold text-white">Security & Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-8 max-w-2xl">
            <div className="space-y-2">
              <label className={labelCls}>Current Password</label>
              <div className="relative">
                <input
                  type={showPw.current ? 'text' : 'password'}
                  className={inputCls}
                  value={pw.current}
                  onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                  {showPw.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input
                    type={showPw.newPass ? 'text' : 'password'}
                    className={inputCls}
                    value={pw.newPass}
                    onChange={e => setPw(p => ({ ...p, newPass: e.target.value }))}
                    minLength={8}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, newPass: !p.newPass }))} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                    {showPw.newPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" className={inputCls} value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
            </div>

            <button type="submit" disabled={savingPw} className="h-14 px-8 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50">
              {savingPw ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Update Password
            </button>
          </form>
        </div>

        {/* Payout Section */}
        <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                <CreditCard size={20} className="text-emerald-500" />
             </div>
             <h2 className="text-xl font-bold text-white">Payment & Payouts</h2>
          </div>

          <form onSubmit={handlePayoutSave} className="space-y-8 max-w-2xl">
            <div className="space-y-2">
              <label className={labelCls}>Preferred Payout Method</label>
              <div className="flex gap-4">
                {['bank_transfer', 'paypal'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayout(p => ({ ...p, method: m as any }))}
                    className={`flex-1 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      payout.method === m ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:text-white'
                    }`}
                  >
                    {m === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>

            {payout.method === 'paypal' ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <label className={labelCls}>PayPal Email Address</label>
                <input type="email" className={inputCls} placeholder="email@example.com" value={payout.paypalEmail} onChange={e => setPayout(p => ({ ...p, paypalEmail: e.target.value }))} required />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-2">
                  <label className={labelCls}>Bank Name</label>
                  <input className={inputCls} value={payout.bankAccount.bankName} onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, bankName: e.target.value } }))} required />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Account Holder</label>
                  <input className={inputCls} value={payout.bankAccount.accountHolder} onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountHolder: e.target.value } }))} required />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Account Number</label>
                  <input className={inputCls} value={payout.bankAccount.accountNumber} onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountNumber: e.target.value } }))} required />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Routing Number</label>
                  <input className={inputCls} value={payout.bankAccount.routingNumber} onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, routingNumber: e.target.value } }))} required />
                </div>
              </div>
            )}

            <button type="submit" disabled={savingPayout} className="h-14 px-8 bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50">
              {savingPayout ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
              Save Payment Settings
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                <Bell size={20} className="text-emerald-500" />
             </div>
             <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>

          <form onSubmit={handleNotifSave} className="space-y-4 max-w-2xl">
            {[
              { key: 'emailTracks', label: 'Email: Track Approvals', desc: 'Get notified when your track status changes.' },
              { key: 'emailGifts', label: 'Email: Gift Alerts', desc: 'Receive emails when fans send you gifts.' },
              { key: 'pushLive', label: 'Push: Live Events', desc: 'Alerts for upcoming clashes and live streams.' },
              { key: 'pushMessages', label: 'Push: New Messages', desc: 'Real-time notifications for fan messages.' },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between p-6 bg-zinc-950/40 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
                <div>
                   <p className="text-sm font-bold text-white uppercase tracking-tight">{row.label}</p>
                   <p className="text-xs text-zinc-500 font-medium mt-1">{row.desc}</p>
                </div>
                <div 
                  onClick={() => setNotifs(n => ({ ...n, [row.key]: !n[row.key as keyof typeof notifs] }))}
                  className={`relative h-7 w-12 rounded-full cursor-pointer transition-all duration-300 ${notifs[row.key as keyof typeof notifs] ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                >
                   <div className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${notifs[row.key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}

            <div className="pt-6">
              <button type="submit" disabled={savingNotifs} className="h-14 px-8 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50">
                {savingNotifs ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Update Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account */}
        <div className="premium-card p-10 border-rose-500/20 bg-rose-500/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 rounded-[2.5rem]">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-900/20">
               <AlertTriangle size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Account</h2>
              <p className="text-sm text-zinc-400 font-medium mt-1 max-w-md">Permanently remove your artist profile and all associated music from the platform.</p>
            </div>
          </div>
          <button onClick={handleDeleteAccount} className="h-14 px-8 bg-rose-600/10 text-rose-500 border border-rose-600/30 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-3">
            <Trash2 size={18} />
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
