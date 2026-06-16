import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Shield, Music2, 
  User as UserIcon, ChevronDown, X, UserPlus, UserCheck, 
  Ban, Loader2, Key, MoreVertical, AlertTriangle,
  ArrowUpRight, ShieldCheck, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-indigo-500/5', text: 'text-indigo-500', border: 'border-indigo-500/10' },
  'super admin': { label: 'Super Admin', icon: Shield, bg: 'bg-purple-500/5', text: 'text-purple-500', border: 'border-purple-500/10' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/10' },
  provider: { label: 'Provider', icon: UserIcon, bg: 'bg-blue-500/5', text: 'text-blue-500', border: 'border-blue-500/10' },
  contributor: { label: 'Contributor', icon: UserIcon, bg: 'bg-teal-500/5', text: 'text-teal-500', border: 'border-teal-500/10' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-white/5', text: 'text-zinc-500', border: 'border-white/5' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'Active', dot: 'bg-emerald-500', shadow: 'shadow-[0_0_8px_#10b981]' },
  inactive: { label: 'Inactive', dot: 'bg-zinc-700', shadow: '' },
  suspended: { label: 'Suspended', dot: 'bg-rose-500', shadow: 'shadow-[0_0_8px_#f43f5e]' },
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
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('user');
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState('');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as const
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortBy === field;
    return (
      <button 
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 hover:text-zinc-900 dark:text-white transition-colors group/btn font-bold uppercase tracking-wider text-xs"
      >
        <span>{label}</span>
        {isSorted ? (
          sortOrder === 'asc' ? <ArrowUp size={12} className="text-emerald-500" /> : <ArrowDown size={12} className="text-emerald-500" />
        ) : (
          <ArrowUpDown size={12} className="text-zinc-600 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {
        sortBy,
        sortOrder
      };
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
  }, [page, pageSize, search, roleFilter, statusFilter, sortBy, sortOrder]);

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
      await adminService.updateUserRole(targetUser._id, newRole, newRoles);
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
    <div className="space-y-8 pb-24">
      {/* Premium Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card !p-12 relative overflow-hidden group shadow-2xl border-black/5 dark:border-white/5"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12 z-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <Users className="w-10 h-10 text-indigo-500" />
             </div>
             <div>
                <h2 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                  User Management
                </h2>
                <p className="text-zinc-500 font-medium max-w-md leading-relaxed">
                   Manage your platform's users, roles, and access privileges.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-4">
               <span className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums leading-none">{totalUsers}</span>
               <span className="text-xs text-zinc-500 font-medium mt-1">Total Users</span>
             </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-14 px-8 bg-white text-black rounded-2xl text-sm font-semibold hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 border border-black/10 dark:border-white/10"
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>
        </div>
      </motion.div>

      {/* Control HUD */}
      <div className="flex flex-col lg:flex-row items-center gap-6 border-black/5 dark:border-white/5">
        <div className="relative w-full lg:max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold focus:outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900 dark:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-8 px-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</span>
            <div className="flex bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 shadow-inner rounded-xl p-1 gap-1">
              {['all', 'admin', 'artist', 'provider', 'contributor', 'user'].map(role => (
                <button
                  key={role}
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-300 ${
                    roleFilter === role ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-md border border-black/5 dark:border-white/5' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</span>
            <div className="flex bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 shadow-inner rounded-xl p-1 gap-1">
              {['all', 'active', 'inactive', 'suspended'].map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-300 ${
                    statusFilter === status ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-md border border-black/5 dark:border-white/5' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
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
      <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">{renderSortHeader('User', 'name')}</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">{renderSortHeader('Role', 'role')}</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">{renderSortHeader('Status', 'status')}</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-sm font-medium text-zinc-500">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 dark:border-white/5">
                      <Users size={32} className="text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No users found</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                       Try adjusting your search or filters to find what you're looking for.
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
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-sm font-bold text-zinc-500 shadow-sm">
                            {getInitials(user)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                              {user.firstName || 'Unknown'} {user.lastName || ''}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${role.bg} ${role.text} ${role.border}`}>
                            <role.icon size={12} />
                            {role.label}
                          </span>
                          {user.roles && user.roles.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {user.roles.map((r: string) => {
                                const addConf = roleConfig[r] || roleConfig.user;
                                const AddIcon = addConf.icon;
                                return (
                                  <span key={r} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${addConf.bg} ${addConf.text} ${addConf.border}`}>
                                    <AddIcon size={10} />
                                    {addConf.label}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${status.dot} ${status.shadow}`} />
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setTargetUser(user); setNewRole(user.role || 'user'); setNewRoles(user.roles || []); setIsRoleModalOpen(true); setOpenMenu(null); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
                            title="Edit Role"
                          >
                            <Shield size={18} />
                          </button>
                          <button
                            onClick={() => { setTargetUser(user); setIsResetModalOpen(true); setTempPassword(''); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent text-zinc-500 hover:text-amber-400 hover:bg-black/5 dark:bg-white/5 transition-colors"
                            title="Reset Password"
                          >
                            <Key size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${openMenu === user._id ? 'bg-white/10 text-white' : 'bg-transparent text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                              <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                              {openMenu === user._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-50 p-2 overflow-hidden backdrop-blur-xl"
                                >
                                  <button onClick={() => handleStatusChange(user._id, 'active')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white hover:bg-emerald-500/10 transition-colors text-left group/opt">
                                    <UserCheck size={16} className="text-emerald-500" /> Activate
                                  </button>
                                  <button onClick={() => handleStatusChange(user._id, 'suspended')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-left group/opt">
                                    <Ban size={16} className="text-rose-500" /> Suspend
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

        {/* Pagination */}
        <div className="px-8 py-5 border-t border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-xs font-medium text-zinc-500">
            Showing <span className="text-zinc-900 dark:text-white">{users.length}</span> of <span className="text-zinc-900 dark:text-white">{totalUsers}</span> users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all border ${
                    page === i + 1 
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' 
                      : 'bg-transparent text-zinc-500 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals Console */}
      <AnimatePresence mode="wait">
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-card w-full max-w-lg shadow-2xl border-black/10 dark:border-white/10 p-8" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <UserPlus className="text-indigo-500" size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Add User</h3>
                      <p className="text-sm text-zinc-500 font-medium">Create a new user account.</p>
                   </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg hover:bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">First Name</label>
                    <input type="text" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Last Name</label>
                    <input type="text" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Email Address</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Role</label>
                  <div className="relative group/sel">
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full h-12 px-4 pr-10 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 appearance-none transition-all cursor-pointer">
                      <option value="user">User</option>
                      <option value="artist">Artist</option>
                      <option value="provider">Provider</option>
                      <option value="contributor">Contributor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within/sel:text-indigo-400 transition-colors" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-black/5 dark:border-white/5 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={18} />}
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isRoleModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-card w-full max-w-sm text-center p-8 border-indigo-500/10 shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6">
                 <Shield className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Update Role</h3>
              <p className="text-sm text-zinc-500 mb-8">
                Change the access level for <br/>
                <span className="text-zinc-900 dark:text-white font-medium">{targetUser.email}</span>
              </p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block text-left">Primary Role</label>
                  <div className="relative text-left group/sel">
                    <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-12 px-4 pr-10 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 appearance-none transition-all cursor-pointer">
                      <option value="user">User</option>
                      <option value="artist">Artist</option>
                      <option value="provider">Provider</option>
                      <option value="contributor">Contributor</option>
                      <option value="admin">Admin</option>
                      <option value="super admin">Super Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within/sel:text-indigo-400 transition-colors" />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Additional Roles</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['artist', 'provider', 'contributor'].filter(r => r !== newRole).map(role => (
                      <label key={role} className="flex items-center gap-2 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:border-indigo-500/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={newRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) setNewRoles([...newRoles, role]);
                            else setNewRoles(newRoles.filter(r => r !== role));
                          }}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500/30"
                        />
                        <span className="capitalize text-sm font-medium text-zinc-700 dark:text-zinc-300">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                  <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">Cancel</button>
                  <button onClick={handleRoleChange} disabled={isSubmitting} className="flex-1 py-2.5 bg-white text-black rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors">Update Role</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isResetModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-card w-full max-w-sm text-center p-8 border-amber-500/10 shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-6">
                 <Key className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Reset Password</h3>
              <p className="text-sm text-zinc-500 mb-8">
                Generate a new temporary password for this user.
              </p>
              
              {tempPassword ? (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-6 rounded-2xl mb-8">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-2">Temporary Password</p>
                  <code className="text-2xl font-mono text-zinc-900 dark:text-white tracking-widest">{tempPassword}</code>
                </div>
              ) : (
                <div className="space-y-4">
                   <button onClick={handleResetPassword} disabled={isResetting} className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                     {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={18} />}
                     Reset Password
                   </button>
                   <button onClick={() => setIsResetModalOpen(false)} className="w-full py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">Cancel</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
