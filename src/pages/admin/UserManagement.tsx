import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Shield, Music2, 
  User as UserIcon, ChevronDown, X, UserPlus, UserCheck, 
  Ban, Loader2, Key, MoreVertical, AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-500/5', text: 'text-amber-500', border: 'border-amber-500/10' },
  'super admin': { label: 'Super Admin', icon: Shield, bg: 'bg-purple-500/5', text: 'text-purple-500', border: 'border-purple-500/10' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/10' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-white/5', text: 'text-zinc-400', border: 'border-white/5' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'Active', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', dot: 'bg-zinc-600' },
  suspended: { label: 'Suspended', dot: 'bg-rose-500' },
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Users</h1>
          <p className="text-zinc-500">Manage platform access, roles, and account status.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500">Role</span>
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-xl p-1 gap-1">
              {['all', 'admin', 'artist', 'user'].map(role => (
                <button
                  key={role}
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === role ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500">Status</span>
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-xl p-1 gap-1">
              {['all', 'active', 'inactive', 'suspended'].map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === status ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="premium-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <AlertTriangle className="h-8 w-8 text-zinc-800 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const role = roleConfig[user.role.toLowerCase()] || roleConfig.user;
                  const status = statusConfig[user.status.toLowerCase()] || statusConfig.inactive;
                  return (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {getInitials(user)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                              {user.firstName || 'Unknown'} {user.lastName || ''}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${role.bg} ${role.text} ${role.border}`}>
                          <role.icon size={12} />
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <span className="text-xs font-medium text-zinc-400">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setTargetUser(user); setNewRole(user.role); setIsRoleModalOpen(true); }}
                            className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                            title="Change Role"
                          >
                            <Shield size={18} />
                          </button>
                          <button
                            onClick={() => { setTargetUser(user); setIsResetModalOpen(true); setTempPassword(''); }}
                            className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                            title="Reset Password"
                          >
                            <Key size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                              className={`p-2.5 rounded-xl transition-all ${openMenu === user._id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                              <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                              {openMenu === user._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute right-0 mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-30 p-2 overflow-hidden"
                                >
                                  <button onClick={() => handleStatusChange(user._id, 'active')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left">
                                    <UserCheck size={16} className="text-emerald-500" /> Activate Account
                                  </button>
                                  <button onClick={() => handleStatusChange(user._id, 'suspended')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-left">
                                    <Ban size={16} className="text-rose-500" /> Suspend Account
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-5 border-t border-white/5 bg-[#080808] flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-white font-semibold">{users.length}</span> of <span className="text-white font-semibold">{totalUsers}</span> users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                    page === i + 1 
                      ? 'bg-white text-black border-white shadow-lg' 
                      : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Add User</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block">First Name</label>
                    <input type="text" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="input-field" placeholder="First Name" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block">Last Name</label>
                    <input type="text" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="input-field" placeholder="Last Name" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block">Email Address</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="input-field" placeholder="Email" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block">Role</label>
                  <div className="relative">
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="input-field appearance-none pr-10 cursor-pointer">
                      <option value="user">User</option>
                      <option value="artist">Artist</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isRoleModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsRoleModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-sm text-center" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Change Role</h3>
              <p className="text-sm text-zinc-500 mb-8 px-4">Update access level for <span className="text-white font-semibold">{targetUser.email}</span></p>
              
              <div className="space-y-6">
                <div className="relative text-left">
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field appearance-none pr-10 cursor-pointer">
                    <option value="user">User</option>
                    <option value="artist">Artist</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsRoleModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleRoleChange} disabled={isSubmitting} className="btn-primary flex-1">Update</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isResetModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsResetModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-sm text-center" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Key className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reset Password</h3>
              <p className="text-sm text-zinc-500 mb-8 px-4">Generate a temporary password for this user.</p>
              
              {tempPassword ? (
                <div className="bg-white/5 border border-emerald-500/30 p-8 rounded-3xl mb-8">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-3">Temporary Password</p>
                  <code className="text-3xl font-mono font-bold text-white tracking-widest">{tempPassword}</code>
                </div>
              ) : (
                <div className="space-y-4">
                   <button onClick={handleResetPassword} disabled={isResetting} className="w-full btn-primary flex items-center justify-center gap-2">
                     {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                     Reset Now
                   </button>
                   <button onClick={() => setIsResetModalOpen(false)} className="w-full btn-secondary">Close</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
