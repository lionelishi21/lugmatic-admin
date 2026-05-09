import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, Plus, MoreHorizontal, Shield, Music2, 
  User as UserIcon, Mail, ChevronDown, X, UserPlus, UserCheck, 
  UserX, Ban, Loader2, Key, RefreshCw 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
  'super admin': { label: 'Super Admin', icon: Shield, bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-400' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-400' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400', dot: 'bg-zinc-400' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-500 dark:text-zinc-400', dot: 'bg-zinc-400' },
  suspended: { label: 'Suspended', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
};

function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = [
  'from-green-400 to-emerald-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
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
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const stats = useMemo(() => {
    return {
      total: totalUsers,
      active: users.filter(u => u.isActive).length,
      artists: users.filter(u => u.role === 'artist').length,
      suspended: users.filter(u => !u.isActive).length,
    };
  }, [users, totalUsers]);

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length && users.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id || '')));
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await adminService.createUser(newUser);
      if (response.data.success) {
        toast.success(response.data.message || 'User created and invitation sent!');
        setIsAddModalOpen(false);
        setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleResendInvitation = async (userId: string) => {
    try {
      await adminService.resendInvitation(userId);
      toast.success('Verification email resent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to resend verification email');
    }
  };

  const handleUpdateEmail = async (userId: string) => {
    if (!editEmail) return;
    try {
      await adminService.updateEmail(userId, editEmail);
      toast.success('Email updated successfully');
      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    }
  };

  const handleRoleChange = async () => {
    if (!targetUser) return;
    const userId = targetUser._id || '';
    setIsSubmitting(true);
    try {
      await adminService.updateUser(userId, { role: newRole as any });
      toast.success('User role updated successfully');
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
    const userId = targetUser._id || '';
    setIsResetting(true);
    try {
      const response = await adminService.resetPassword(userId);
      if (response.data.success) {
        setTempPassword((response.data.data as any).temporaryPassword);
        toast.success('Password reset successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all';

  const StatCard_ = ({
    label, value, icon: Icon, color, bgColor, trend
  }: {
    label: string, value: number, icon: any, color: string, bgColor: string, trend: string
  }) => (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-zinc-400'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Control platform access and user permissions
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard_ label="Total Users" value={stats.total} icon={Users} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-500/10" trend="+12%" />
        <StatCard_ label="Active" value={stats.active} icon={UserCheck} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-500/10" trend="+8%" />
        <StatCard_ label="Artists" value={stats.artists} icon={Music2} color="text-indigo-600 dark:text-indigo-400" bgColor="bg-indigo-50 dark:bg-indigo-500/10" trend="+3" />
        <StatCard_ label="Suspended" value={stats.suspended} icon={Ban} color="text-rose-600 dark:text-rose-400" bgColor="bg-rose-50 dark:bg-rose-500/10" trend="-2" />
      </div>

      {/* Table Card */}
      <div className={card}>
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-all ${hasActiveFilters ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-emerald-500'}`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {loading ? 'Refreshing...' : `${totalUsers} Users Registered`}
            </span>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role</span>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-0.5 gap-0.5">
                  {['all', 'admin', 'artist', 'user'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${roleFilter === r ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-0.5 gap-0.5">
                  {['all', 'active', 'inactive', 'suspended'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${statusFilter === s ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="pl-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.size === users.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                  />
                </th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">User Details</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Access Level</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Account Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-zinc-400" />
                      </div>
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No users found</h3>
                      <p className="text-sm text-zinc-400 mt-1">Refine your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : users.map(user => {
                const userId = user._id || '';
                const role = roleConfig[user.role] || roleConfig.user;
                const statusKey = user.isActive ? 'active' : 'suspended';
                const status = statusConfig[statusKey];
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
                
                return (
                  <tr key={userId} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="pl-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(userId)}
                        onChange={() => toggleSelect(userId)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded bg-gradient-to-br ${getAvatarColor(userId)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                          {getInitials(fullName)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-white">{fullName}</div>
                          <div className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${role.bg} ${role.text} border-current/10`}>
                        <role.icon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${status.bg} ${status.text} border-current/10`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenu(openMenu === userId ? null : userId)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === userId && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-zinc-200 dark:border-white/10 py-1 z-20 overflow-hidden animate-in fade-in slide-in-from-top-1">
                              <button 
                                onClick={() => { setEditEmail(user.email); setEditingUserId(userId); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                              >
                                <Mail className="w-4 h-4" /> Edit Email Address
                              </button>
                              
                              <button 
                                onClick={() => { setTargetUser(user); setNewRole(user.role); setIsRoleModalOpen(true); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                              >
                                <Shield className="w-4 h-4" /> Change Access Level
                              </button>
                              
                              <button 
                                onClick={() => { setTargetUser(user); setTempPassword(''); setIsResetModalOpen(true); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                              >
                                <Key className="w-4 h-4" /> Reset Password
                              </button>

                              {!user.isEmailVerified && (
                                <button
                                  onClick={() => { handleResendInvitation(userId); setOpenMenu(null); }}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-500 hover:bg-emerald-500/5 flex items-center gap-2.5 transition-colors"
                                >
                                  <RefreshCw className="w-4 h-4" /> Resend Invitation
                                </button>
                              )}

                              <button 
                                onClick={async () => {
                                  try {
                                    await adminService.toggleUserStatus(userId, !user.isActive);
                                    toast.success(user.isActive ? 'User suspended' : 'User reactivated');
                                    fetchUsers();
                                  } catch (e: any) { toast.error(e.message); }
                                  setOpenMenu(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2.5 transition-colors ${user.isActive ? 'text-amber-500 hover:bg-amber-500/5' : 'text-emerald-500 hover:bg-emerald-500/5'}`}
                              >
                                {user.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                {user.isActive ? 'Suspend Account' : 'Reactivate Account'}
                              </button>

                              <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                              <button 
                                onClick={() => { handleDeleteUser(userId); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-500/5 flex items-center gap-2.5 transition-colors"
                              >
                                <UserX className="w-4 h-4" /> Delete Account
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/[0.04] flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${card} w-full max-w-md shadow-2xl overflow-hidden`}
            >
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Add New User</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Invitation Flow</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      type="text" required value={newUser.firstName}
                      onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      type="text" required value={newUser.lastName}
                      onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email" required value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">User Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    {Object.keys(roleConfig).map(r => (
                      <option key={r} value={r}>{roleConfig[r].label}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {isRoleModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${card} w-full max-w-sm shadow-2xl p-8 text-center`}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Change User Role</h3>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                Update the access level for <span className="font-bold text-zinc-900 dark:text-white">{targetUser.email}</span>. This will take effect immediately.
              </p>
              <div className="space-y-4">
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer font-bold text-center"
                >
                  {Object.keys(roleConfig).map(r => (
                    <option key={r} value={r}>{roleConfig[r].label}</option>
                  ))}
                </select>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button onClick={handleRoleChange} disabled={isSubmitting} className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">Save Role</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
