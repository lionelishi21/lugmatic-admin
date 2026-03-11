import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Search, Filter, Plus, MoreHorizontal, Shield, Music2, User as UserIcon, Mail, ChevronDown, X, UserPlus, UserCheck, UserX, Ban, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'sonner';

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

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  artist: { label: 'Artist', icon: Music2, bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  user: { label: 'User', icon: UserIcon, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const statusConfig = {
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  suspended: { label: 'Suspended', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const subConfig = {
  free: { label: 'Free', bg: 'bg-gray-100', text: 'text-gray-600' },
  premium: { label: 'Premium', bg: 'bg-green-50', text: 'text-green-700' },
  pro: { label: 'Pro', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return n.toString();
}

function getInitials(name: string) {
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
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (search) filters.search = search;
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await adminService.getAllUsers(page, pageSize, filters);
      setUsers(response.data);
      setTotalUsers(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const stats = useMemo(() => {
    // These could also come from the API, but for now we'll sum from the current list or total count if available
    return {
      total: totalUsers,
      active: users.filter(u => u.isActive).length, // Current page count
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
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id || u._id || '')));
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
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
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
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

            {/* Result count */}
            <span className="text-xs text-gray-400 ml-auto">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
              ) : (
                `${users.length} of ${totalUsers} users`
              )}
            </span>
          </div>

          {/* Expanded filters */}
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

        {/* Bulk actions */}
        {selectedUsers.size > 0 && (
          <div className="px-4 py-2.5 bg-green-50 border-b border-green-100 flex items-center gap-3">
            <span className="text-sm text-green-700 font-medium">{selectedUsers.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Export</button>
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Suspend</button>
              <button className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100">Delete</button>
            </div>
          </div>
        )}

        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={8} className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Loading platform users...</p>
              </td>
            </tr>
          ) : users.map(user => {
            const userId = user.id || user._id || '';
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
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600`}>
                    {user.isArtist ? 'Artist' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700 font-medium">{formatNumber(user.coins || 0)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenMenu(openMenu === userId ? null : userId)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === userId && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5" /> View Profile
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> Change Role
                          </button>
                          {!user.isActive ? (
                            <button className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5" /> Reactivate
                            </button>
                          ) : (
                            <button className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                              <Ban className="w-3.5 h-3.5" /> Suspend
                            </button>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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

        {/* Footer / pagination */ }
  {
    !loading && users.length > 0 && (
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalUsers)} of {totalUsers} users
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${p === page ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    )
  }
      </div >
    </div >
  );
}
