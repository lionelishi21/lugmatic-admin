import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, Plus, MoreHorizontal, Shield, Music2, 
  User as UserIcon, Mail, ChevronDown, X, UserPlus, UserCheck, 
  UserX, Ban, Loader2, Key, RefreshCw, BarChart3, Clock, AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 italic";
const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";
const inputClass = "w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold italic uppercase tracking-tight";

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-500/20' },
  'super admin': { label: 'Super Admin', icon: Shield, bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-500', border: 'border-purple-500/20' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-zinc-800', text: 'text-zinc-400', dot: 'bg-zinc-600', border: 'border-white/5' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', bg: 'bg-zinc-800', text: 'text-zinc-500', dot: 'bg-zinc-600' },
  suspended: { label: 'Suspended', bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
};

function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = [
  'from-emerald-400 to-emerald-600',
  'from-blue-400 to-blue-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-indigo-400 to-indigo-600',
  'from-cyan-400 to-cyan-600',
];

function getAvatarColor(id: string) {
  if (!id) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % avatarColors.length;
  return avatarColors[idx];
}

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
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

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUsers(next);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      toast.loading(`Updating user status...`, { id: 'status-update' });
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`, { id: 'status-update' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status', { id: 'status-update' });
    }
    setOpenMenu(null);
  };

  const handleRoleChange = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    try {
      await adminService.updateUserRole(targetUser._id, newRole);
      toast.success(`Role updated for ${targetUser.email}`);
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
      toast.success('User invitation sent successfully');
      setIsAddModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Total Identities', value: totalUsers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Sessions', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Access', value: users.filter(u => u.status === 'inactive').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Security Blocks', value: users.filter(u => u.status === 'suspended').length, icon: Ban, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Accessing Identity Grid...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Identity Access Management</p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
             User Registry
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Auditing global credentials and authority vectors.
           </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Initialize New Identity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={card + " p-6 hover:border-emerald-500/20 transition-all"}>
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded flex items-center justify-center ${bg} border border-white/5`}>
                 <Icon className={`w-5 h-5 ${color}`} />
               </div>
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
               </div>
            </div>
            <p className={labelClass}>{label}</p>
            <p className="text-2xl font-black text-white italic uppercase tracking-tighter tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter/Search Bar */}
      <div className={card + " p-4"}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH IDENTITIES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass + " pl-11 py-2.5"}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex bg-zinc-950 border border-white/5 rounded p-1 gap-1">
                {['all', 'admin', 'artist', 'user'].map(role => (
                   <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest italic transition-all ${
                      roleFilter === role ? 'bg-zinc-800 text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                   >
                     {role}
                   </button>
                ))}
             </div>
             <button
               onClick={() => setShowFilters(!showFilters)}
               className={`p-2.5 rounded border transition-all ${showFilters ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-950 border-white/5 text-zinc-600'}`}
             >
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className={card + " overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-4">
                  <button onClick={toggleSelectAll} className="w-5 h-5 rounded border border-white/10 bg-zinc-950 flex items-center justify-center">
                    {selectedUsers.size === users.length && users.length > 0 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Identity Signature</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Authority Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Transmission Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((user) => {
                const role = roleConfig[user.role.toLowerCase()] || roleConfig.user;
                const status = statusConfig[user.status.toLowerCase()] || statusConfig.inactive;
                return (
                  <tr key={user._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <button onClick={() => toggleSelectUser(user._id)} className="w-5 h-5 rounded border border-white/5 bg-zinc-950 flex items-center justify-center">
                        {selectedUsers.has(user._id) && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarColor(user._id)} flex items-center justify-center text-white font-black text-xs border border-white/10 shadow-lg`}>
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white uppercase italic tracking-tight truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-[9px] font-black uppercase tracking-widest italic ${role.bg} ${role.text} ${role.border}`}>
                        <role.icon size={10} />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot} shadow-[0_0_8px_currentColor]`} />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{status.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setTargetUser(user);
                            setNewRole(user.role);
                            setIsRoleModalOpen(true);
                          }}
                          className="w-9 h-9 rounded bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                          title="Shift Authority"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setTargetUser(user);
                            setIsResetModalOpen(true);
                            setTempPassword('');
                          }}
                          className="w-9 h-9 rounded bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-blue-500 hover:border-blue-500/30 transition-all"
                          title="Reset Credentials"
                        >
                          <Key size={16} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                            className="w-9 h-9 rounded bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          <AnimatePresence>
                            {openMenu === user._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-30 p-2 overflow-hidden"
                              >
                                <button onClick={() => handleStatusChange(user._id, 'active')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest italic hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                                  <UserCheck size={14} /> REACTIVATE_SYNC
                                </button>
                                <button onClick={() => handleStatusChange(user._id, 'suspended')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest italic hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                  <Ban size={14} /> SUSPEND_SIGNAL
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-6 border-t border-white/[0.06] bg-zinc-800/30 flex items-center justify-between">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
             Showing {users.length} of {totalUsers} Registry Entries
           </p>
           <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded text-[10px] font-black uppercase italic border transition-all ${
                    page === i + 1 
                      ? 'bg-emerald-500 text-black border-emerald-500' 
                      : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleAddUser}>
                <div className="px-8 py-6 border-b border-white/[0.06] bg-zinc-800/30 flex justify-between items-center">
                  <div>
                    <p className={labelClass}>Operational Protocol</p>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Initialize Identity</h3>
                  </div>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-zinc-600 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Designation Name</label>
                      <input type="text" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className={inputClass} placeholder="FIRSTNAME" required />
                    </div>
                    <div>
                      <label className={labelClass}>Lineage Name</label>
                      <input type="text" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className={inputClass} placeholder="LASTNAME" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Identity Locator (Email)</label>
                    <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className={inputClass} placeholder="EMAIL_SIGNAL" required />
                  </div>
                  <div>
                    <label className={labelClass}>Initial Authority</label>
                    <div className="relative">
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className={inputClass + " appearance-none cursor-pointer"}>
                        <option value="user">USER_SIGNAL</option>
                        <option value="artist">ARTIST_ORIGIN</option>
                        <option value="admin">COMMAND_EXEC</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-zinc-950 border-t border-white/5 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors">Abort</button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all italic shadow-xl disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    INIT_PROTOCOL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isRoleModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-lg shadow-2xl p-10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
              
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 relative">
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Authority Shift</h3>
              <p className="text-[11px] text-zinc-500 mb-8 uppercase font-bold tracking-widest leading-relaxed italic px-4">
                Updating access level for <span className="text-white">{targetUser.email}</span>. Operation is immediate.
              </p>
              <div className="space-y-6">
                <div className="relative">
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className={`${inputClass} text-center appearance-none cursor-pointer`}
                  >
                    {Object.keys(roleConfig).map(r => (
                      <option key={r} value={r}>{roleConfig[r].label.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors">Abort</button>
                  <button onClick={handleRoleChange} disabled={isSubmitting} className="flex-1 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-indigo-400 transition-all italic shadow-xl shadow-indigo-500/10 disabled:opacity-50">Sync Authority</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isResetModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-lg shadow-2xl p-10 text-center relative"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <Key className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Credential Reset</h3>
              <p className="text-[11px] text-zinc-500 mb-8 uppercase font-bold tracking-widest italic">Requesting emergency password override for identity signal.</p>
              
              {tempPassword ? (
                <div className="bg-zinc-950 border border-emerald-500/30 p-4 rounded mb-8">
                  <p className="text-[9px] text-emerald-500 uppercase tracking-widest mb-2 font-black">Temporal Passkey Generated:</p>
                  <code className="text-lg font-mono font-black text-white tracking-widest">{tempPassword}</code>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                   <button onClick={handleResetPassword} disabled={isResetting} className="w-full py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-amber-400 transition-all italic shadow-xl shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
                     {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                     EXECUTE_RESET
                   </button>
                   <button onClick={() => setIsResetModalOpen(false)} className="w-full py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic hover:text-white transition-colors">Close_Hub</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
