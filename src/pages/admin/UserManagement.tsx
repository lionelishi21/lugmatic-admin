import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Shield, Music2, 
  User as UserIcon, ChevronDown, X, UserPlus, UserCheck, 
  Ban, Loader2, Key, MoreVertical, AlertTriangle,
  Target, Activity, Globe, Zap, Cpu, ArrowUpRight,
  ShieldCheck, Filter, SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'ADMIN_NODE', icon: Shield, bg: 'bg-amber-500/5', text: 'text-amber-500', border: 'border-amber-500/10' },
  'super admin': { label: 'EXECUTIVE_NODE', icon: Shield, bg: 'bg-purple-500/5', text: 'text-purple-500', border: 'border-purple-500/10' },
  artist: { label: 'ARTIST_NODE', icon: Music2, bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/10' },
  user: { label: 'STANDARD_NODE', icon: UserIcon, bg: 'bg-white/5', text: 'text-zinc-500', border: 'border-white/5' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'ACTIVE_LINK', dot: 'bg-emerald-500', shadow: 'shadow-[0_0_8px_#10b981]' },
  inactive: { label: 'INACTIVE', dot: 'bg-zinc-700', shadow: '' },
  suspended: { label: 'QUARANTINED', dot: 'bg-rose-500', shadow: 'shadow-[0_0_8px_#f43f5e]' },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('user');
  const [tempPassword, setTempPassword] = useState('');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as const
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (search) filters.search = search;
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await adminService.getAllUsers(page, pageSize, filters);
      const apiResponse = response.data;
      const usersData = apiResponse.data || [];
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalUsers(apiResponse.pagination?.total || 0);
      setTotalPages(apiResponse.pagination?.pages || 0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
    setOpenMenu(null);
  };

  const handleRoleChange = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    try {
      await adminService.updateUserRole(targetUser._id, newRole);
      toast.success('Role updated successfully');
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!targetUser) return;
    setIsResetting(true);
    try {
      const response = await adminService.resetUserPassword(targetUser._id);
      setTempPassword(response.data.data.temporaryPassword || 'Password reset link sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createUser(newUser);
      toast.success('User invitation sent');
      setIsAddModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || '??';
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Identity Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Identity Grid</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{totalUsers} Nodes Registered</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Managing global identity nodes, access privileges, and system throughput.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <UserPlus size={18} />
          Register New Node
        </button>
      </div>

      {/* Identity Control HUD */}
      <div className="premium-card !p-4 bg-zinc-950/40 flex flex-col lg:flex-row items-center gap-6 border-white/5 shadow-inner">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN IDENTITY ARCHIVE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-10 px-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Privilege</span>
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1.5 gap-1 shadow-inner">
              {['all', 'admin', 'artist', 'user'].map(role => (
                <button
                  key={role}
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    roleFilter === role ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Status</span>
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1.5 gap-1 shadow-inner">
              {['all', 'active', 'inactive', 'suspended'].map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    statusFilter === status ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Node Table Grid */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Identity Node</th>
                <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Privilege Profile</th>
                <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Link Status</th>
                <th className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic text-right">Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-40 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                      <Cpu className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] italic">Scanning Node Registry...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-40 text-center">
                    <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl group cursor-default">
                      <AlertTriangle size={36} className="text-zinc-800 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3 italic">Scan Result: Null</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto leading-relaxed opacity-60">
                       Adjust your scan parameters or register a new identity node to the grid.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const role = roleConfig[user.role.toLowerCase()] || roleConfig.user;
                  const status = statusConfig[user.status.toLowerCase()] || statusConfig.inactive;
                  return (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-500/[0.01] transition-all group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-700 shadow-inner group-hover:border-emerald-500/30 transition-all group-hover:scale-110">
                            {getInitials(user)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none mb-2">
                              {user.firstName || 'UNKNOWN'} {user.lastName || ''}
                            </p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{user.email.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${role.bg} ${role.text} ${role.border} shadow-inner`}>
                          <role.icon size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] italic">{role.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.shadow}`} />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => { setTargetUser(user); setNewRole(user.role); setIsRoleModalOpen(true); }}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/20 transition-all shadow-inner group-hover:shadow-emerald-500/5"
                            title="Reconfigure Privilege"
                          >
                            <Shield size={20} />
                          </button>
                          <button
                            onClick={() => { setTargetUser(user); setIsResetModalOpen(true); setTempPassword(''); }}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-amber-500 border border-white/5 hover:border-amber-500/20 transition-all shadow-inner group-hover:shadow-amber-500/5"
                            title="Reset Access Link"
                          >
                            <Key size={20} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${openMenu === user._id ? 'bg-white/10 text-white border border-white/10 shadow-2xl' : 'bg-[#0a0a0a] text-zinc-700 hover:text-white border border-white/5 hover:border-white/10 shadow-inner'}`}
                            >
                              <MoreVertical size={20} />
                            </button>
                            <AnimatePresence>
                              {openMenu === user._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                  className="absolute right-0 mt-4 w-64 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-3 overflow-hidden backdrop-blur-2xl"
                                >
                                  <div className="px-6 py-4 border-b border-white/5 mb-2">
                                     <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Override Protocol</p>
                                  </div>
                                  <button onClick={() => handleStatusChange(user._id, 'active')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-emerald-500/10 transition-all text-left uppercase tracking-widest italic group/opt">
                                    <UserCheck size={18} className="text-emerald-500 group-hover/opt:scale-110 transition-transform" /> Activate Node
                                  </button>
                                  <button onClick={() => handleStatusChange(user._id, 'suspended')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all text-left uppercase tracking-widest italic group/opt">
                                    <Ban size={18} className="text-rose-500 group-hover/opt:scale-110 transition-transform" /> Quarantine Node
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Neural Pagination */}
        <div className="px-10 py-8 border-t border-white/5 bg-[#080808] flex items-center justify-between">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
            Scanning <span className="text-white">{users.length}</span> / <span className="text-white">{totalUsers}</span> Node Matrix
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 text-zinc-600 hover:text-white disabled:opacity-20 transition-all italic"
            >
              PREV_CYCLE
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-12 h-12 rounded-xl text-[10px] font-bold transition-all border ${
                    page === i + 1 
                      ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-transparent text-zinc-700 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 text-zinc-600 hover:text-white disabled:opacity-20 transition-all italic"
            >
              NEXT_CYCLE
            </button>
          </div>
        </div>
      </div>

      {/* Modals Console */}
      <AnimatePresence mode="wait">
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,1)] border-emerald-500/10 p-12" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <UserPlus className="text-emerald-500" size={28} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Register Node</h3>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Identity Induction Protocol</p>
                   </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">First Identity</label>
                    <input type="text" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner" placeholder="FIRST_NAME" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Last Identity</label>
                    <input type="text" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner" placeholder="LAST_NAME" required />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Signal Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner" placeholder="EMAIL_ADDRESS" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Privilege Profile</label>
                  <div className="relative group/sel">
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full h-16 px-8 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all italic cursor-pointer">
                      <option value="user">STANDARD_NODE</option>
                      <option value="artist">ARTIST_NODE</option>
                      <option value="admin">ADMIN_NODE</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 pointer-events-none group-focus-within/sel:text-emerald-500 transition-all group-focus-within/sel:rotate-180 duration-500" />
                  </div>
                </div>
                <div className="pt-10 flex justify-end gap-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="h-16 px-10 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all italic">ABORT_PROTOCOL</button>
                  <button type="submit" disabled={isSubmitting} className="h-16 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-400 transition-all flex items-center gap-4">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={20} />}
                    EXECUTE_INDUCTION
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isRoleModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => setIsRoleModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-sm text-center p-12 border-indigo-500/10" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-20 h-20 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                 <Shield className="h-10 w-10 text-indigo-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic mb-3">Privilege Sync</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-10 italic leading-relaxed">Update neural access level for <br/><span className="text-emerald-500">{targetUser.email.toUpperCase()}</span></p>
              
              <div className="space-y-8">
                <div className="relative text-left group/sel">
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-16 px-8 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-indigo-500/30 appearance-none shadow-inner transition-all italic cursor-pointer">
                    <option value="user">STANDARD_NODE</option>
                    <option value="artist">ARTIST_NODE</option>
                    <option value="admin">ADMIN_NODE</option>
                    <option value="super admin">EXECUTIVE_NODE</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsRoleModalOpen(false)} className="h-16 flex-1 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all italic">ABORT</button>
                  <button onClick={handleRoleChange} disabled={isSubmitting} className="h-16 flex-1 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all">COMMIT_SYNC</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isResetModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => setIsResetModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-sm text-center p-12 border-amber-500/10" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-20 h-20 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                 <Key className="h-10 w-10 text-amber-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic mb-3">Access Reset</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-10 italic leading-relaxed">Generate temporary neural access link for node.</p>
              
              {tempPassword ? (
                <div className="bg-[#0a0a0a] border border-emerald-500/20 p-10 rounded-[2.5rem] mb-10 shadow-inner group">
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.4em] mb-4 italic">TEMPORARY_ACCESS_KEY</p>
                  <code className="text-4xl font-mono font-black text-white tracking-[0.3em] group-hover:text-emerald-400 transition-colors">{tempPassword}</code>
                </div>
              ) : (
                <div className="space-y-6">
                   <button onClick={handleResetPassword} disabled={isResetting} className="w-full h-16 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 group">
                     {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />}
                     INITIALIZE_RESET
                   </button>
                   <button onClick={() => setIsResetModalOpen(false)} className="w-full h-16 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all italic">ABORT_PROTOCOL</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
