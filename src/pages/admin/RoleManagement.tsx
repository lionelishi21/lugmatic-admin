import React, { useState, useEffect } from 'react';
import {
  Shield, RefreshCw, Sparkles, Mic, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import Preloader from '../../components/ui/Preloader';
import { adminService } from '../../services/adminService';
import { User } from '../../types';

// The only real, data-driven permission system in the backend: fine-grained
// capabilities grantable to individual admin accounts. Everything else
// (what a fan/artist/contributor/provider can do) is enforced by route
// middleware in code, not a toggleable matrix — there is no backend
// concept of a generic per-role permission grid, so this page only
// manages what's actually real: PUT /admin/users/:userId/permissions.
const PERMISSIONS: { id: 'ai_lyrics_generation' | 'karaoke_timing'; name: string; description: string; icon: React.ElementType }[] = [
  { id: 'ai_lyrics_generation', name: 'AI Lyrics Generation', description: 'Can trigger AI-assisted lyric generation for songs', icon: Sparkles },
  { id: 'karaoke_timing', name: 'Karaoke Timing', description: 'Can create/edit karaoke line timing for songs', icon: Mic },
];

const RoleManagement: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers(1, 100, { role: 'admin' });
      const list = ((res as any).data?.data ?? (res as any).data ?? []) as User[];
      setAdmins(list);
      if (list.length > 0) setSelectedId((prev) => prev ?? list[0]._id);
    } catch {
      toast.error('Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const selected = admins.find((a) => a._id === selectedId) || null;

  useEffect(() => {
    setPending(selected?.adminPermissions ?? []);
  }, [selectedId, selected]);

  const togglePermission = (permId: string) => {
    setPending((prev) => prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const loadingId = toast.loading('Saving permissions...');
    try {
      await adminService.updateUserPermissions(selected._id, pending);
      setAdmins((prev) => prev.map((a) => a._id === selected._id ? { ...a, adminPermissions: pending as any } : a));
      toast.success('Permissions updated', { id: loadingId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save permissions', { id: loadingId });
    } finally {
      setSaving(false);
    }
  };

  if (loading && admins.length === 0) {
    return <Preloader isVisible={true} text="Loading admin accounts..." />;
  }

  const dirty = selected && JSON.stringify([...pending].sort()) !== JSON.stringify([...(selected.adminPermissions ?? [])].sort());

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Admin Permissions</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <Shield size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wide">Access Control</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold tracking-wide ml-1">
            Grant fine-grained capabilities to individual admin accounts. Super Admins have these implicitly.
            Fan/Artist/Contributor/Provider access is enforced in code, not configurable here.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selected || !dirty}
          className="h-14 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:bg-emerald-400 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
          Save Changes
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="premium-card p-12 text-center text-zinc-500 text-sm font-semibold">
          No admin accounts found. Create one from User Management first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Admin account list */}
          <div className="lg:col-span-1 space-y-8">
            <div className="premium-card !p-3 bg-zinc-100 dark:bg-zinc-950/40 border-black/5 dark:border-white/5 shadow-inner">
              <nav className="space-y-2">
                {admins.map((a) => {
                  const active = selectedId === a._id;
                  return (
                    <button
                      key={a._id}
                      onClick={() => setSelectedId(a._id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left group ${
                        active ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xl border border-black/5 dark:border-white/5' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        active ? 'bg-emerald-500 text-black' : 'bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5'
                      }`}>
                        <UserCog size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold leading-none mb-1.5 truncate">{a.firstName} {a.lastName}</p>
                        <p className={`text-[9px] font-bold truncate ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>{a.email}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Permission toggles */}
          <div className="lg:col-span-3">
            <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl">
              <div className="p-10 border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-none mb-2">
                  {selected ? `${selected.firstName} ${selected.lastName}` : 'Select an admin'}
                </h2>
                <p className="text-zinc-500 text-xs font-semibold">{selected?.email}</p>
              </div>

              <div className="divide-y divide-white/5">
                {PERMISSIONS.map((perm) => {
                  const enabled = pending.includes(perm.id);
                  const Icon = perm.icon;
                  return (
                    <div key={perm.id} className="p-10 hover:bg-emerald-500/[0.01] transition-all">
                      <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                            <Icon size={18} className="text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{perm.name}</h3>
                            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePermission(perm.id)}
                          disabled={!selected}
                          className={`relative shrink-0 w-16 h-8 rounded-full transition-all duration-500 shadow-inner ${
                            enabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-900 border border-black/5 dark:border-white/5'
                          }`}
                        >
                          <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all duration-500 ${
                            enabled ? 'left-9 bg-black' : 'left-2 bg-white dark:bg-zinc-700'
                          }`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
