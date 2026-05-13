import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Settings, Shield, Database, Bell, Users, Monitor, 
  Save, RefreshCw, AlertTriangle, CheckCircle, Globe, 
  Lock, Upload, Mail, Clock, HardDrive, Wifi, Eye, 
  EyeOff, Info, ChevronRight, Zap, Server, 
  Key, FileText, Palette, LayoutGrid, Activity, 
  ShieldCheck, ArrowRight, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Preloader from '../../components/ui/Preloader';

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'input' | 'select' | 'textarea';
  value: string | number | boolean;
  category: string;
  required: boolean;
  icon?: React.ElementType;
  options?: { label: string; value: string }[];
  hint?: string;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Setting[]>([
    // General
    { id: 'site_name', name: 'Platform Name', description: 'The public identity of the network', type: 'input', value: 'Lugmatic', category: 'general', required: true, icon: Globe },
    { id: 'site_description', name: 'SEO Description', description: 'Metadata for search and social indexers', type: 'textarea', value: 'Discover, stream, and share music with Lugmatic.', category: 'general', required: false, icon: FileText },
    { id: 'default_language', name: 'Default Language', description: 'Global interface localization', type: 'select', value: 'en', category: 'general', required: true, icon: Globe, options: [{ label: 'English', value: 'en' }, { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }] },
    { id: 'theme_mode', name: 'Default Theme', description: 'Initial visual mode for new accounts', type: 'select', value: 'dark', category: 'general', required: false, icon: Palette, options: [{ label: 'Dark Mode', value: 'dark' }, { label: 'Light Mode', value: 'light' }] },
    { id: 'maintenance_mode', name: 'Maintenance Mode', description: 'Restrict access to all non-admin users', type: 'toggle', value: false, category: 'general', required: false, icon: Settings },
    // Security
    { id: 'user_registration', name: 'User Registration', description: 'Enable public account creation', type: 'toggle', value: true, category: 'security', required: false, icon: Users },
    { id: 'email_verification', name: 'Email Verification', description: 'Enforce authentication before activation', type: 'toggle', value: true, category: 'security', required: false, icon: Mail },
    { id: 'two_factor_auth', name: 'Two-Factor Auth', description: 'Require MFA for privileged accounts', type: 'toggle', value: false, category: 'security', required: false, icon: Lock },
    { id: 'session_timeout', name: 'Session Timeout', description: 'Inactivity duration before auto-logout (min)', type: 'input', value: 60, category: 'security', required: true, icon: Clock },
    { id: 'api_key', name: 'Master API Key', description: 'Primary secret for external integrations', type: 'input', value: 'lug_sk_4f8a2b1c9d3e7f6a0b5c8d2e1f4a7b3c', category: 'security', required: true, icon: Key },
    // Uploads
    { id: 'max_file_size', name: 'Audio Payload Max', description: 'Maximum file size allowed for uploads (MB)', type: 'input', value: 50, category: 'uploads', required: true, icon: Upload },
    { id: 'allowed_file_types', name: 'Audio Formats', description: 'Permitted audio file extensions', type: 'input', value: 'mp3, wav, flac', category: 'uploads', required: true, icon: FileText },
    { id: 'storage_provider', name: 'Storage Infrastructure', description: 'Cloud infrastructure for media persistence', type: 'select', value: 'aws_s3', category: 'uploads', required: true, icon: HardDrive, options: [{ label: 'AWS S3', value: 'aws_s3' }, { label: 'Google Cloud', value: 'gcs' }] },
    // Notifications
    { id: 'email_notifications', name: 'Email Broadcasts', description: 'Enable transactional email signals', type: 'toggle', value: true, category: 'notifications', required: false, icon: Mail },
    { id: 'push_notifications', name: 'Push Alerts', description: 'Enable mobile and web push signals', type: 'toggle', value: true, category: 'notifications', required: false, icon: Bell },
    { id: 'admin_alerts', name: 'Admin Alert List', description: 'Critical system alert recipients', type: 'input', value: 'admin@lugmatic.com', category: 'notifications', required: true, icon: AlertTriangle },
    // Performance
    { id: 'cache_enabled', name: 'Data Caching', description: 'Improve response times via edge caching', type: 'toggle', value: true, category: 'performance', required: false, icon: Zap },
    { id: 'cache_ttl', name: 'Cache TTL', description: 'Time-to-live for cached assets (sec)', type: 'input', value: 3600, category: 'performance', required: true, icon: Clock },
    { id: 'stream_quality', name: 'Stream Quality', description: 'Default audio delivery fidelity', type: 'select', value: '320', category: 'performance', required: true, icon: Monitor, options: [{ label: 'High (256k)', value: '256' }, { label: 'Ultra (320k)', value: '320' }, { label: 'Lossless', value: 'lossless' }] },
  ]);

  const categories = [
    { id: 'general', name: 'Platform', icon: Settings, description: 'Core system variables' },
    { id: 'security', name: 'Security', icon: Shield, description: 'Access and encryption' },
    { id: 'uploads', name: 'Storage', icon: Database, description: 'Data ingestion' },
    { id: 'notifications', name: 'Signals', icon: Bell, description: 'Alert propagation' },
    { id: 'performance', name: 'Engine', icon: Activity, description: 'Latency and throughput' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await adminService.getSystemSettings();
        if (response.data.success && response.data.data.length > 0) {
          const fetchedSettings = response.data.data;
          setSettings(prev => prev.map(s => {
            const found = fetchedSettings.find((fs: any) => fs.key === s.id);
            return found ? { ...s, value: found.value } : s;
          }));
        }
      } catch (err) {
        toast.error('Failed to load system configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(prev => prev.map(setting => setting.id === id ? { ...setting, value } : setting));
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingId = toast.loading('Synchronizing configuration...');
    try {
      const updates = settings.map(s => ({ key: s.id, value: s.value, category: s.category }));
      await adminService.updateSystemSettings(updates);
      toast.success('Configuration synchronized', { id: loadingId });
    } catch (err) {
      toast.error('Sync failed', { id: loadingId });
    } finally {
      setSaving(false);
    }
  };

  if (loading && settings.length === 0) return <Preloader isVisible={true} text="Accessing core configuration..." />;

  const filteredSettings = settings.filter(s => s.category === activeTab);
  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Settings className="text-zinc-400" size={32} />
            System Settings
          </h1>
          <p className="text-zinc-500">Configure core platform parameters and infrastructure protocols.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 !px-8">
            <Save size={18} />
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card !p-2">
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = activeTab === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left group relative ${
                      active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      active ? 'bg-white/10 text-emerald-400' : 'bg-zinc-900 border border-white/5 group-hover:border-white/10'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight">{category.name}</p>
                      <p className={`text-[10px] font-medium mt-0.5 truncate ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${active ? 'rotate-90 text-emerald-500' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Infrastructure Stats */}
          <div className="premium-card space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Health
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Database', ok: true, lat: '12ms' },
                { name: 'S3 Storage', ok: true, lat: '45ms' },
                { name: 'Cache (Redis)', ok: true, lat: '2ms' },
                { name: 'API Nodes', ok: true, lat: '31ms' },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_#10b981]`} />
                    <span className="text-[11px] font-medium text-zinc-400">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 font-mono">{s.lat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-3">
          <div className="premium-card !p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                  {activeCategory && <activeCategory.icon size={24} className="text-emerald-400" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{activeCategory?.name} Protocol</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Parameters for {activeCategory?.description.toLowerCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Executive Access</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredSettings.map((setting) => {
                const Icon = setting.icon || Settings;
                return (
                  <div key={setting.id} className="px-8 py-8 hover:bg-white/[0.01] transition-all group">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-emerald-500/20 transition-all">
                        <Icon size={20} className="text-zinc-600 group-hover:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-bold text-white">{setting.name}</h3>
                          {setting.required && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg uppercase tracking-widest">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed mb-6 max-w-2xl">{setting.description}</p>

                        <div className="max-w-xl">
                          {setting.type === 'toggle' ? (
                            <button
                              onClick={() => handleSettingChange(setting.id, !setting.value)}
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                                setting.value ? 'bg-emerald-500' : 'bg-zinc-800'
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                                setting.value ? 'left-7 shadow-[0_0_10px_white]' : 'left-1'
                              }`} />
                            </button>
                          ) : setting.type === 'textarea' ? (
                            <textarea
                              value={String(setting.value)}
                              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                              rows={4}
                              className="input-field resize-none h-auto"
                            />
                          ) : setting.type === 'select' ? (
                            <div className="relative">
                              <select
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                className="input-field appearance-none pr-10 cursor-pointer"
                              >
                                {setting.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90 pointer-events-none" />
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type={typeof setting.value === 'number' ? 'number' : setting.id === 'api_key' ? (showApiKey ? 'text' : 'password') : 'text'}
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, typeof setting.value === 'number' ? Number(e.target.value) : e.target.value)}
                                className="input-field font-mono"
                              />
                              {setting.id === 'api_key' && (
                                <button
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                                >
                                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
