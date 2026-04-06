import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, Plus, MoreHorizontal, Shield, Music2, 
  User as UserIcon, Mail, ChevronDown, X, UserPlus, UserCheck, 
  UserX, Ban, Loader2, Key, RefreshCw 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'react-hot-toast';

// Role configuration for UI display
const roleConfig: Record<string, any> = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'super admin': { label: 'Super Admin', icon: Shield, bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const statusConfig: Record<string, any> = {
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  suspended: { label: 'Suspended', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users, roles and permissions</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-green-50 text-green-600', trend: '+12%' },
          { label: 'Active Users', value: stats.active, icon: UserCheck, color: 'bg-blue-50 text-blue-600', trend: '+8%' },
          { label: 'Artists', value: stats.artists, icon: Music2, color: 'bg-emerald-50 text-emerald-600', trend: '+3' },
          { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'bg-red-50 text-red-500', trend: '-2' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {s.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm border rounded-xl transition-colors ${hasActiveFilters ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            <span className="text-xs text-gray-400 ml-auto">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
              ) : (
                `${users.length} of ${totalUsers} users`
              )}
            </span>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</span>
              <div className="flex gap-1.5">
                {['all', 'admin', 'artist', 'user'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${roleFilter === r ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
              <div className="flex gap-1.5">
                {['all', 'active', 'inactive', 'suspended'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { setRoleFilter('all'); setStatusFilter('all'); }}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="pl-4 pr-2 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.size === users.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500/20"
                  />
                </th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Loading platform users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400">No users found matchnig your filters.</td>
                </tr>
              ) : users.map(user => {
                const userId = user._id || '';
                const role = roleConfig[user.role] || roleConfig.user;
                const statusKey = user.isActive ? 'active' : 'suspended';
                const status = statusConfig[statusKey];
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
                
                return (
                  <tr key={userId} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(userId)}
                        onChange={() => toggleSelect(userId)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(userId)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
                          {getInitials(fullName)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{fullName}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${role.bg} ${role.text}`}>
                        <role.icon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenu(openMenu === userId ? null : userId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === userId && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                              <button 
                                onClick={() => { setEditEmail(user.email); setEditingUserId(userId); setOpenMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Mail className="w-3.5 h-3.5" /> Edit Email
                              </button>
                              
                              <button 
                                onClick={() => { setTargetUser(user); setNewRole(user.role); setIsRoleModalOpen(true); setOpenMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Shield className="w-3.5 h-3.5" /> Change Role
                              </button>
                              
                              <button 
                                onClick={() => { setTargetUser(user); setTempPassword(''); setIsResetModalOpen(true); setOpenMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Key className="w-3.5 h-3.5" /> Reset Password
                              </button>

                              {!user.isEmailVerified && (
                                <button
                                  onClick={() => { handleResendInvitation(userId); setOpenMenu(null); }}
                                  className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Resend Invite
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
                                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${user.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                              >
                                {user.isActive ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                {user.isActive ? 'Suspend' : 'Reactivate'}
                              </button>

                              <div className="border-t border-gray-100 my-1" />
                              <button 
                                onClick={() => { handleDeleteUser(userId); setOpenMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <UserX className="w-3.5 h-3.5" /> Delete
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
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalUsers)} of {totalUsers}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs font-medium rounded-lg text-gray-500 hover:bg-white border hover:border-gray-200 disabled:opacity-50 transition-all"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${p === page ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs font-medium rounded-lg text-gray-500 hover:bg-white border hover:border-gray-200 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
                  <p className="text-xs text-gray-500">Create account and send invitation</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">First Name</label>
                  <input
                    type="text" required value={newUser.firstName}
                    onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Last Name</label>
                  <input
                    type="text" required value={newUser.lastName}
                    onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">User Role</label>
                <div className="relative">
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full appearance-none px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                  >
                    {Object.keys(roleConfig).map(r => (
                      <option key={r} value={r}>{roleConfig[r].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {editingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Update User Email</h3>
              <button onClick={() => setEditingUserId(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">New Email Address</label>
                <input
                  type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                  placeholder="new.email@example.com"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingUserId(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => handleUpdateEmail(editingUserId)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200">Update Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {isRoleModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Change User Role</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Update role for <strong>{targetUser.fullName || `${targetUser.firstName} ${targetUser.lastName}`}</strong></p>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select New Role</label>
                <div className="relative">
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                  >
                    {Object.keys(roleConfig).map(r => (
                      <option key={r} value={r}>{roleConfig[r].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleRoleChange} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Shield className="w-4 h-4" />}
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isResetModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!tempPassword ? (
                <>
                  <p className="text-sm text-gray-600">Are you sure you want to reset the password for <strong>{targetUser.email}</strong>?</p>
                  <p className="text-xs text-gray-400 italic">The user will receive an email notification via Resend with the new password.</p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setIsResetModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">No, Cancel</button>
                    <button onClick={handleResetPassword} disabled={isResetting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Yes, Reset
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <p className="text-xs text-green-600 font-medium mb-2 uppercase tracking-wider">New Temporary Password</p>
                    <div className="text-2xl font-mono font-bold text-gray-900 tracking-widest">{tempPassword}</div>
                    <p className="text-xs text-green-600 mt-2">Email notification has been sent via Resend.</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      toast.success('Password copied to clipboard');
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2"
                  >
                    Copy to Clipboard
                  </button>
                  <button onClick={() => setIsResetModalOpen(false)} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
