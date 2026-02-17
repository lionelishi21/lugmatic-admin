import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, MoreHorizontal, Shield, Music2, User as UserIcon, Mail, ChevronDown, X, UserPlus, UserCheck, UserX, Ban } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'artist';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  streams?: number;
  subscription: 'free' | 'premium' | 'pro';
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joinDate: '2024-03-01', lastActive: '2 hours ago', streams: 1240, subscription: 'premium' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'artist', status: 'active', joinDate: '2024-03-15', lastActive: '5 min ago', streams: 45200, subscription: 'pro' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', joinDate: '2024-02-01', lastActive: 'Just now', streams: 0, subscription: 'pro' },
  { id: '4', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'suspended', joinDate: '2024-04-10', lastActive: '3 days ago', streams: 320, subscription: 'free' },
  { id: '5', name: 'Sarah Williams', email: 'sarah@example.com', role: 'artist', status: 'active', joinDate: '2024-01-20', lastActive: '1 hour ago', streams: 89100, subscription: 'pro' },
  { id: '6', name: 'Tom Brown', email: 'tom@example.com', role: 'user', status: 'inactive', joinDate: '2024-05-05', lastActive: '2 weeks ago', streams: 50, subscription: 'free' },
  { id: '7', name: 'Emily Davis', email: 'emily@example.com', role: 'user', status: 'active', joinDate: '2024-06-12', lastActive: '30 min ago', streams: 2100, subscription: 'premium' },
  { id: '8', name: 'Alex Chen', email: 'alex@example.com', role: 'artist', status: 'active', joinDate: '2024-02-28', lastActive: '10 min ago', streams: 127500, subscription: 'pro' },
];

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
  const idx = parseInt(id) % avatarColors.length;
  return avatarColors[idx];
}

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(u => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    artists: mockUsers.filter(u => u.role === 'artist').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length,
  }), []);

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
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
              {filteredUsers.length} of {mockUsers.length} users
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pl-4 pr-2 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500/20"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => {
                const role = roleConfig[user.role];
                const status = statusConfig[user.status];
                const sub = subConfig[user.subscription];
                return (
                  <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
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
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg ${sub.bg} ${sub.text}`}>
                        {sub.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 font-medium">{formatNumber(user.streams || 0)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{user.lastActive}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <UserIcon className="w-3.5 h-3.5" /> View Profile
                              </button>
                              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> Change Role
                              </button>
                              {user.status === 'suspended' ? (
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

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Footer / pagination hint */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${p === 1 ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
