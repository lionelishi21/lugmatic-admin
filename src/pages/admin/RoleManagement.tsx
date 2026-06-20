import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Music2, CheckCircle2, ChevronRight, 
  Save, RefreshCw, Layers, SlidersHorizontal, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Preloader from '../../components/ui/Preloader';

// Mock types for Roles & Permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  permissions: Permission[];
}

const mockRoles: RoleConfig[] = [
  {
    id: 'user',
    name: 'User',
    description: 'Base access for fans to stream and interact.',
    icon: Users,
    permissions: [
      { id: 'perm_stream', name: 'Stream Audio', description: 'Can listen to songs and albums', enabled: true },
      { id: 'perm_playlists', name: 'Manage Playlists', description: 'Can create and edit playlists', enabled: true },
      { id: 'perm_comment', name: 'Post Comments', description: 'Can comment on tracks', enabled: true },
    ]
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Creators who upload music and engage in clashes.',
    icon: Music2,
    permissions: [
      { id: 'perm_upload', name: 'Upload Songs', description: 'Can upload tracks for approval', enabled: true },
      { id: 'perm_clashes', name: 'Manage Clashes', description: 'Can participate in and manage clashes', enabled: true },
      { id: 'perm_shell_it', name: 'Shell It', description: 'Access to Shell It features', enabled: true },
      { id: 'perm_earnings', name: 'View Earnings', description: 'Can view artist earnings and analytics', enabled: true },
    ]
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Community members managing content tasks.',
    icon: Layers,
    permissions: [
      { id: 'perm_tasks', name: 'Manage Tasks', description: 'Can view and complete contributor tasks', enabled: true },
      { id: 'perm_articles', name: 'Write Articles', description: 'Can write and publish content', enabled: true },
    ]
  },
  {
    id: 'provider',
    name: 'Provider',
    description: 'External service and infrastructure providers.',
    icon: SlidersHorizontal,
    permissions: [
      { id: 'perm_services', name: 'Service Integration', description: 'Can configure provider services', enabled: true },
      { id: 'perm_billing', name: 'Manage Billing', description: 'Can view provider payments', enabled: true },
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access for moderation and management.',
    icon: Shield,
    permissions: [
      { id: 'perm_manage_users', name: 'Manage Users', description: 'Can view and moderate users', enabled: true },
      { id: 'perm_manage_artists', name: 'Manage Artists', description: 'Can approve and manage artists', enabled: true },
      { id: 'perm_manage_content', name: 'Manage Content', description: 'Can moderate songs, albums, and playlists', enabled: true },
    ]
  },
  {
    id: 'super admin',
    name: 'Super Admin',
    description: 'Full system access and financial control.',
    icon: Settings,
    permissions: [
      { id: 'perm_system_config', name: 'System Settings', description: 'Can modify core platform settings', enabled: true },
      { id: 'perm_financials', name: 'Financial Management', description: 'Can view and manage payouts and revenue', enabled: true },
      { id: 'perm_manage_admins', name: 'Manage Admins', description: 'Can assign admin roles', enabled: true },
    ]
  }
];

const RoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('artist');
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Mock fetching data from backend
    const fetchRoles = async () => {
      setLoading(true);
      setTimeout(() => {
        setRoles(mockRoles);
        setLoading(false);
      }, 600);
    };
    fetchRoles();
  }, []);

  const handlePermissionChange = (roleId: string, permId: string, enabled: boolean) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      return {
        ...r,
        permissions: r.permissions.map(p => p.id === permId ? { ...p, enabled } : p)
      };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingId = toast.loading('Saving permissions...');
    // Mock save to backend
    setTimeout(() => {
      toast.success('Permissions updated successfully', { id: loadingId });
      setSaving(false);
    }, 800);
  };

  if (loading && roles.length === 0) {
    return <Preloader isVisible={true} text="Loading roles..." />;
  }

  const activeRole = roles.find(r => r.id === activeTab);

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Roles & Permissions</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <Shield size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wide">Access Control</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold tracking-wide ml-1">Configure capabilities for different user types.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-14 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:bg-emerald-400 transition-all shadow-2xl flex items-center justify-center gap-4 group"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="premium-card !p-3 bg-zinc-100 dark:bg-zinc-950/40 border-black/5 dark:border-white/5 shadow-inner">
            <nav className="space-y-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const active = activeTab === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveTab(role.id)}
                    className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${
                      active ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xl border border-black/5 dark:border-white/5' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      active ? 'bg-emerald-500 text-black shadow-[0_0_20px_#10b981]' : 'bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 group-hover:scale-110'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold leading-none mb-1.5">{role.name}</p>
                      <p className={`text-[9px] font-bold truncate ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        {role.permissions.length} capabilities
                      </p>
                    </div>
                    <ChevronRight size={14} className={`transition-all duration-500 ${active ? 'translate-x-1 text-emerald-500' : 'text-zinc-500 group-hover:text-zinc-700 group-hover:translate-x-1'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-3">
          <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl">
            <div className="p-10 border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-900 flex items-center justify-center border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5" />
                  {activeRole && <activeRole.icon size={28} className="text-emerald-500 relative z-10" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-none mb-3">{activeRole?.name} Permissions</h2>
                  <p className="text-zinc-500 text-xs font-semibold ml-1">{activeRole?.description}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {activeRole?.permissions.map((perm) => (
                <div key={perm.id} className="p-10 hover:bg-emerald-500/[0.01] transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight italic">{perm.name}</h3>
                      </div>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">{perm.description}</p>
                    </div>
                    
                    <button
                      onClick={() => handlePermissionChange(activeRole.id, perm.id, !perm.enabled)}
                      className={`relative shrink-0 w-16 h-8 rounded-full transition-all duration-500 shadow-inner overflow-hidden group/toggle ${
                        perm.enabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-900 border border-black/5 dark:border-white/5'
                      }`}
                    >
                      <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all duration-500 ${
                        perm.enabled ? 'left-9 bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'left-2 bg-white dark:bg-zinc-700 shadow-sm'
                      }`} />
                      <div className="absolute inset-0 bg-black/10 dark:bg-white/10 translate-y-full group-hover/toggle:translate-y-0 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
