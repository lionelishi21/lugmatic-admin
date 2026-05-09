import { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, Bell, Trash2, AlertTriangle,
  Loader2, Check, CreditCard, Mail, Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

// ── Reusable primitives ───────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2.5 bg-zinc-800 border border-white/[0.08] rounded text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all';

const labelCls =
  'block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 flex-none rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-white/[0.06] rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SaveBtn({
  loading,
  children,
  variant = 'white',
  ...props
}: { loading: boolean; children: React.ReactNode; variant?: 'white' | 'emerald' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50 transition-colors ${
        variant === 'emerald'
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-white text-zinc-900 hover:bg-zinc-100'
      }`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function Settings() {
  // ── Password ───────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false });
  const [savingPw, setSavingPw] = useState(false);

  // ── Payout ────────────────────────────────────────────────────
  const [payout, setPayout] = useState({
    method: 'bank_transfer' as 'bank_transfer' | 'paypal',
    paypalEmail: '',
    bankAccount: { bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' },
  });
  const [savingPayout, setSavingPayout] = useState(false);

  // ── Notifications ──────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    emailTracks: true,
    emailGifts: true,
    pushLive: true,
    pushMessages: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Load saved prefs on mount
  useEffect(() => {
    userService.getUserPreferences()
      .then(res => {
        const prefs = (res.data as any)?.data;
        if (prefs?.notifications) setNotifs(p => ({ ...p, ...prefs.notifications }));
        if (prefs?.payout)        setPayout(p => ({ ...p, ...prefs.payout }));
      })
      .catch(() => {});
  }, []);

  // ── Handlers ───────────────────────────────────────────────────

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPass !== pw.confirm) { toast.error('Passwords do not match'); return; }
    if (pw.newPass.length < 8)    { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await userService.changePassword(pw.current, pw.newPass);
      toast.success('Password updated');
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
      toast.success('Payout settings saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save payout settings');
    } finally { setSavingPayout(false); }
  };

  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifs(true);
    try {
      await userService.updateUserPreferences({ notifications: notifs });
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save notification settings');
    } finally { setSavingNotifs(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      'Are you absolutely sure? This permanently deletes your account and all your content. This cannot be undone.'
    )) return;
    try {
      await userService.requestAccountDeletion();
      toast.success('Deletion requested — check your email to confirm.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request deletion');
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  const NOTIF_ROWS: { key: keyof typeof notifs; label: string; desc: string; tag: string }[] = [
    { key: 'emailTracks', label: 'Track approvals',    desc: 'Email when your tracks are reviewed',  tag: 'Email' },
    { key: 'emailGifts',  label: 'Gift alerts',        desc: 'Email when fans send you gifts',        tag: 'Email' },
    { key: 'pushLive',    label: 'Live & clash events', desc: 'Push when a clash or stream starts',   tag: 'Push'  },
    { key: 'pushMessages',label: 'New messages',       desc: 'Push when fans message you',            tag: 'Push'  },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-4">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-white font-bold text-xl tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account security, payouts, and preferences</p>
      </div>

      {/* ── Password ─────────────────────────────────────────────── */}
      <Section title="Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Field label="Current Password">
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                className={inputCls}
                value={pw.current}
                onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPw.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showPw.newPass ? 'text' : 'password'}
                  className={inputCls}
                  value={pw.newPass}
                  onChange={e => setPw(p => ({ ...p, newPass: e.target.value }))}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, newPass: !p.newPass }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPw.newPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                className={inputCls}
                value={pw.confirm}
                onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </Field>
          </div>

          <div className="pt-1">
            <SaveBtn loading={savingPw}>
              <Lock className="h-4 w-4" />
              Update Password
            </SaveBtn>
          </div>
        </form>
      </Section>

      {/* ── Payout Settings ──────────────────────────────────────── */}
      <Section title="Payout Settings">
        <form onSubmit={handlePayoutSave} className="space-y-5">
          <div>
            <label className={labelCls}>Payment Method</label>
            <div className="flex gap-2">
              {(['bank_transfer', 'paypal'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayout(p => ({ ...p, method: m }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold border rounded transition-colors ${
                    payout.method === m
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-800 border-white/[0.08] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {m === 'paypal' ? <Mail className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                  {m === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                </button>
              ))}
            </div>
          </div>

          {payout.method === 'paypal' ? (
            <Field label="PayPal Email">
              <input
                type="email"
                className={inputCls}
                placeholder="your@paypal.com"
                value={payout.paypalEmail}
                onChange={e => setPayout(p => ({ ...p, paypalEmail: e.target.value }))}
                required
              />
            </Field>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bank Name">
                  <input className={inputCls} placeholder="e.g. NCB Jamaica" value={payout.bankAccount.bankName}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, bankName: e.target.value } }))} required />
                </Field>
                <Field label="Account Holder Name">
                  <input className={inputCls} value={payout.bankAccount.accountHolder}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountHolder: e.target.value } }))} required />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Account Number">
                  <input className={inputCls} value={payout.bankAccount.accountNumber}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountNumber: e.target.value } }))} required />
                </Field>
                <Field label="Routing / Sort Code">
                  <input className={inputCls} value={payout.bankAccount.routingNumber}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, routingNumber: e.target.value } }))} required />
                </Field>
              </div>
            </div>
          )}

          <SaveBtn loading={savingPayout} variant="emerald">
            <Wallet className="h-4 w-4" />
            Save Payout Info
          </SaveBtn>
        </form>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────── */}
      <Section title="Notifications">
        <form onSubmit={handleNotifSave}>
          <div className="space-y-0 divide-y divide-white/[0.05]">
            {NOTIF_ROWS.map(row => (
              <div key={row.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{row.tag}</span>
                    <span className="text-sm text-zinc-200">{row.label}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{row.desc}</p>
                </div>
                <Toggle
                  checked={notifs[row.key]}
                  onChange={v => setNotifs(n => ({ ...n, [row.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="pt-5 mt-1 border-t border-white/[0.05]">
            <SaveBtn loading={savingNotifs}>
              <Bell className="h-4 w-4" />
              Save Preferences
            </SaveBtn>
          </div>
        </form>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-none mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-white">Danger Zone</h2>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Permanently delete your artist account and all your uploaded content. This action cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm font-semibold hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Artist Account
        </button>
      </div>

    </div>
  );
}
