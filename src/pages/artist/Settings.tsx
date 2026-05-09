import { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, Bell, Trash2, AlertTriangle,
  Loader2, Check, CreditCard, Mail, Wallet, ShieldLock,
  Smartphone, Activity, Target, ShieldAlert, Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';
const labelCls = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic';
const inputCls = 'w-full px-5 py-3.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
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
      className={`relative h-6 w-11 flex-none rounded-full transition-all duration-300 ${
        checked ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-xl transition-transform duration-300 transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className={`${card} overflow-hidden group`}>
      <div className="px-8 py-6 border-b border-white/[0.04] bg-zinc-900/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
           <Icon className="h-5 w-5 text-emerald-500" />
        </div>
        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">{title} Sector</h2>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function SaveBtn({
  loading,
  children,
  variant = 'white',
  icon: Icon,
  ...props
}: { loading: boolean; children: React.ReactNode; variant?: 'white' | 'emerald'; icon: any } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`h-12 flex items-center justify-center gap-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all italic ${
        variant === 'emerald'
          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20'
          : 'bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl'
      }`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
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
    <div className="max-w-3xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-zinc-950 border border-white/[0.06] rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-emerald-500/50 transition-colors">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <SettingsIcon className="w-7 h-7 text-emerald-500 relative z-10 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Terminal Configuration v4.8</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Settings <span className="text-zinc-600">/</span> Preferences</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium italic">Manage account security, distribution payouts, and network protocols.</p>
          </div>
        </div>
      </div>

      {/* ── Account Security ── */}
      <Section title="Security Intelligence" icon={ShieldLock}>
        <form onSubmit={handlePasswordChange} className="space-y-8">
          <Field label="Current Authentication Key">
            <div className="relative group">
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
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-emerald-500 transition-colors"
              >
                {showPw.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Field label="New Security Sequence">
              <div className="relative group">
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
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-emerald-500 transition-colors"
                >
                  {showPw.newPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Sequence">
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

          <div className="pt-4 flex justify-end">
            <SaveBtn loading={savingPw} icon={Lock} variant="white">
              Update Auth Sequence
            </SaveBtn>
          </div>
        </form>
      </Section>

      {/* ── Payout Matrix ── */}
      <Section title="Payout Distribution Matrix" icon={CreditCard}>
        <form onSubmit={handlePayoutSave} className="space-y-8">
          <div>
            <label className={labelCls}>Primary Transfer Protocol</label>
            <div className="bg-zinc-950 p-1.5 rounded-2xl border border-white/[0.04] flex gap-2 shadow-inner">
              {(['bank_transfer', 'paypal'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayout(p => ({ ...p, method: m }))}
                  className={`flex-1 flex items-center justify-center gap-3 h-12 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl italic ${
                    payout.method === m
                      ? 'bg-white text-zinc-900 shadow-2xl'
                      : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {m === 'paypal' ? <Mail className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  {m === 'paypal' ? 'PayPal Hub' : 'Bank Transfer'}
                </button>
              ))}
            </div>
          </div>

          {payout.method === 'paypal' ? (
            <Field label="Target PayPal Terminal (Email)">
              <div className="relative group">
                <input
                  type="email"
                  className={inputCls}
                  placeholder="IDENTITY@SECTOR.COM"
                  value={payout.paypalEmail}
                  onChange={e => setPayout(p => ({ ...p, paypalEmail: e.target.value }))}
                  required
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 transition-colors group-focus-within:text-emerald-500" />
              </div>
            </Field>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="Financial Institution">
                  <input className={inputCls} placeholder="E.G. GLOBAL RESERVE" value={payout.bankAccount.bankName}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, bankName: e.target.value } }))} required />
                </Field>
                <Field label="Account Holder Identity">
                  <input className={inputCls} placeholder="FULL LEGAL NAME" value={payout.bankAccount.accountHolder}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountHolder: e.target.value } }))} required />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="Account Sequence Number">
                  <input className={inputCls} placeholder="XXXX-XXXX-XXXX" value={payout.bankAccount.accountNumber}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, accountNumber: e.target.value } }))} required />
                </Field>
                <Field label="Routing / Sort Vector">
                  <input className={inputCls} placeholder="ROUTING CODE" value={payout.bankAccount.routingNumber}
                    onChange={e => setPayout(p => ({ ...p, bankAccount: { ...p.bankAccount, routingNumber: e.target.value } }))} required />
                </Field>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <SaveBtn loading={savingPayout} variant="emerald" icon={Wallet}>
              Save Distribution Matrix
            </SaveBtn>
          </div>
        </form>
      </Section>

      {/* ── Notification Protocols ── */}
      <Section title="Network Alert Protocols" icon={Bell}>
        <form onSubmit={handleNotifSave} className="space-y-8">
          <div className="space-y-2">
            {NOTIF_ROWS.map(row => (
              <div key={row.key} className="group flex items-center justify-between p-5 bg-zinc-950/40 rounded-2xl border border-white/[0.02] hover:border-emerald-500/20 transition-all shadow-inner">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner text-zinc-700 group-hover:text-emerald-500 transition-colors">
                      {row.tag === 'Email' ? <Mail size={18} /> : <Smartphone size={18} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{row.tag} PROTOCOL</span>
                        <ChevronRight className="w-3 h-3 text-zinc-800" />
                        <span className="text-[11px] font-black text-white uppercase italic tracking-tight">{row.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic opacity-60 group-hover:opacity-100 transition-opacity">{row.desc}</p>
                   </div>
                </div>
                <Toggle
                  checked={notifs[row.key]}
                  onChange={v => setNotifs(n => ({ ...n, [row.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-end">
            <SaveBtn loading={savingNotifs} icon={Target} variant="white">
              Commit Protocol Changes
            </SaveBtn>
          </div>
        </form>
      </Section>

      {/* ── Terminal Purge Zone ── */}
      <div className={`${card} border-rose-500/20 bg-rose-500/[0.02] p-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/[0.05] rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-500/20 group-hover:scale-110 transition-transform duration-500">
               <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 italic">Terminal Purge Protocol</p>
              <h2 className="text-xl font-black text-white uppercase italic">Danger Zone</h2>
              <p className="text-xs text-zinc-500 mt-2 font-medium italic leading-relaxed max-w-md">
                Permanently eliminate artist identity and all associated sonic assets from the network. This action is irreversible.
              </p>
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="h-14 px-10 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all italic flex items-center gap-3 group-hover:scale-105"
          >
            <Trash2 className="h-4 h-4" />
            Initialize Terminal Purge
          </button>
        </div>
      </div>

    </div>
  );
}
