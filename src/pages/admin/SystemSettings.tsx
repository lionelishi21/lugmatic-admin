import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Settings, Shield, Database, Bell, Users, Monitor, 
  Save, RefreshCw, AlertTriangle, CheckCircle, Globe, 
  Lock, Upload, Mail, Clock, HardDrive, Wifi, Eye, 
  EyeOff, Info, ChevronRight, Zap, Server, 
  Key, FileText, Palette, LayoutGrid, Activity, 
  ShieldCheck, ArrowRight, ShieldAlert, CheckCircle2,
  Cpu, Target, Search, SlidersHorizontal, Layers
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
    { id: 'site_name', name: 'Platform Identity', description: 'The public identity and branding of the global network', type: 'input', value: 'Lugmatic', category: 'general', required: true, icon: Globe },
    { id: 'site_description', name: 'Semantic Metadata', description: 'SEO descriptors and social indexing protocols', type: 'textarea', value: 'Discover, stream, and share music with Lugmatic.', category: 'general', required: false, icon: FileText },
    { id: 'default_language', name: 'Linguistic Localization', description: 'Global interface linguistic localization', type: 'select', value: 'en', category: 'general', required: true, icon: Globe, options: [{ label: 'English', value: 'en' }, { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }] },
    { id: 'theme_mode', name: 'Visual Protocol', description: 'Initial aesthetic mode for new identity nodes', type: 'select', value: 'dark', category: 'general', required: false, icon: Palette, options: [{ label: 'Dark Mode', value: 'dark' }, { label: 'Light Mode', value: 'light' }] },
    { id: 'maintenance_mode', name: 'System Quarantine', description: 'Restrict access to all non-executive identity nodes', type: 'toggle', value: false, category: 'general', required: false, icon: Settings },
    // Security
    { id: 'user_registration', name: 'Node Registration', description: 'Enable public identity node creation', type: 'toggle', value: true, category: 'security', required: false, icon: Users },
    { id: 'email_verification', name: 'Email Verification', description: 'Enforce verification before node activation', type: 'toggle', value: true, category: 'security', required: false, icon: Mail },
    { id: 'two_factor_auth', name: 'Multi-Factor Auth', description: 'Require MFA for privileged identity nodes', type: 'toggle', value: false, category: 'security', required: false, icon: Lock },
    { id: 'session_timeout', name: 'Session Latency', description: 'Inactivity duration before node deactivation (min)', type: 'input', value: 60, category: 'security', required: true, icon: Clock },
    { id: 'api_key', name: 'Master Encryption Key', description: 'Primary secret for external node integrations', type: 'input', value: 'lug_sk_4f8a2b1c9d3e7f6a0b5c8d2e1f4a7b3c', category: 'security', required: true, icon: Key },
    // Uploads
    { id: 'max_file_size', name: 'Payload Max', description: 'Maximum file size allowed for asset ingestion (MB)', type: 'input', value: 50, category: 'uploads', required: true, icon: Upload },
    { id: 'allowed_file_types', name: 'Asset Formats', description: 'Permitted spectral file extensions', type: 'input', value: 'mp3, wav, flac', category: 'uploads', required: true, icon: FileText },
    { id: 'storage_provider', name: 'Storage Matrix', description: 'Cloud infrastructure for asset persistence', type: 'select', value: 'aws_s3', category: 'uploads', required: true, icon: HardDrive, options: [{ label: 'AWS S3', value: 'aws_s3' }, { label: 'Google Cloud', value: 'gcs' }] },
    // Notifications
    { id: 'email_notifications', name: 'Email Transmissions', description: 'Enable transactional email signal propagation', type: 'toggle', value: true, category: 'notifications', required: false, icon: Mail },
    { id: 'push_notifications', name: 'Push Telemetry', description: 'Enable mobile and web push signal alerts', type: 'toggle', value: true, category: 'notifications', required: false, icon: Bell },
    { id: 'admin_alerts', name: 'Executive Alert List', description: 'Critical system alert node recipients', type: 'input', value: 'admin@lugmatic.com', category: 'notifications', required: true, icon: AlertTriangle },
    // Performance
    { id: 'cache_enabled', name: 'Edge Caching', description: 'Improve response velocity via edge node caching', type: 'toggle', value: true, category: 'performance', required: false, icon: Zap },
    { id: 'cache_ttl', name: 'Cache Duration', description: 'Time-to-live for cached asset nodes (sec)', type: 'input', value: 3600, category: 'performance', required: true, icon: Clock },
    { id: 'stream_quality', name: 'Transmission Fidelity', description: 'Default audio delivery spectral fidelity', type: 'select', value: '320', category: 'performance', required: true, icon: Monitor, options: [{ label: 'High (256k)', value: '256' }, { label: 'Ultra (320k)', value: '320' }, { label: 'Lossless', value: 'lossless' }] },
  ]);

  const categories = [
    { id: 'general', name: 'Platform Protocol', icon: Globe, description: 'Core system variables' },
    { id: 'security', name: 'Security Matrix', icon: Shield, description: 'Access and encryption' },
    { id: 'uploads', name: 'Storage Engine', icon: Database, description: 'Data ingestion' },
    { id: 'notifications', name: 'Signal Grid', icon: Bell, description: 'Alert propagation' },
    { id: 'performance', name: 'Neural Engine', icon: Activity, description: 'Latency and throughput' },
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
    <div className="space-y-12 pb-24">
      {/* Cinematic Settings Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">System Configuration</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Core Access Active</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Executing high-level infrastructure protocols and global parameter sync.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="h-14 px-8 bg-zinc-950 text-zinc-500 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 hover:text-white hover:bg-white/5 transition-all italic"
          >
            Reset Engine
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-14 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-2xl flex items-center justify-center gap-4 group"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Commit Protocol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Matrix Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="premium-card !p-3 bg-zinc-950/40 border-white/5 shadow-inner">
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = activeTab === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${
                      active ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      active ? 'bg-emerald-500 text-black shadow-[0_0_20px_#10b981]' : 'bg-zinc-900 border border-white/5 group-hover:scale-110'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5 italic">{category.name}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight size={14} className={`transition-all duration-500 ${active ? 'translate-x-1 text-emerald-500' : 'text-zinc-900 group-hover:text-zinc-700 group-hover:translate-x-1'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Real-time Infrastructure Telemetry */}
          <div className="premium-card space-y-8 border-white/5 bg-zinc-950/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic flex items-center gap-3">
                <Activity size={14} className="text-emerald-500" /> Infrastructure Health
              </h3>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-emerald-500 animate-pulse">LIVE</span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { name: 'Core Database', ok: true, lat: '12MS' },
                { name: 'S3 Asset Matrix', ok: true, lat: '45MS' },
                { name: 'Neural Cache', ok: true, lat: '2MS' },
                { name: 'Global API Nodes', ok: true, lat: '31MS' },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_#10b981] group-hover:scale-150 transition-transform`} />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">{s.name}</span>
                  </div>
                  <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-[9px] font-bold text-zinc-400 tabular-nums italic">{s.lat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Protocol Bay */}
        <div className="lg:col-span-3">
          <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
            <div className="p-10 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5" />
                  {activeCategory && <activeCategory.icon size={28} className="text-emerald-500 relative z-10" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic leading-none mb-3">{activeCategory?.name} Protocol</h2>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Executing parameters for {activeCategory?.description.toLowerCase()}</p>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-xl">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] italic">Executive Access Control</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredSettings.map((setting) => {
                const Icon = setting.icon || Settings;
                return (
                  <div key={setting.id} className="p-10 hover:bg-emerald-500/[0.01] transition-all group">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-12">
                      <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-all shadow-inner">
                        <Icon size={24} className="text-zinc-800 group-hover:text-emerald-500 transition-all" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-5 mb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight italic">{setting.name}</h3>
                          {setting.required && (
                            <span className="text-[9px] font-bold px-3 py-1 bg-rose-500/5 text-rose-500 border border-rose-500/10 rounded-lg uppercase tracking-widest italic">Critical</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-3xl italic">{setting.description}</p>

                        <div className="max-w-2xl">
                          {setting.type === 'toggle' ? (
                            <button
                              onClick={() => handleSettingChange(setting.id, !setting.value)}
                              className={`relative w-16 h-8 rounded-full transition-all duration-500 shadow-inner overflow-hidden group/toggle ${
                                setting.value ? 'bg-emerald-500' : 'bg-zinc-900 border border-white/5'
                              }`}
                            >
                              <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all duration-500 ${
                                setting.value ? 'left-9 bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'left-2 bg-zinc-700'
                              }`} />
                              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/toggle:translate-y-0 transition-transform" />
                            </button>
                          ) : setting.type === 'textarea' ? (
                            <textarea
                              value={String(setting.value)}
                              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                              rows={5}
                              className="w-full px-8 py-6 bg-[#0a0a0a] border border-white/5 rounded-3xl text-zinc-300 text-[11px] font-bold tracking-[0.1em] focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner resize-none leading-relaxed placeholder:text-zinc-800"
                            />
                          ) : setting.type === 'select' ? (
                            <div className="relative group/sel">
                              <select
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                className="w-full h-16 px-8 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
                              >
                                {setting.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                                ))}
                              </select>
                              <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:text-emerald-500 transition-all group-focus-within/sel:rotate-180 duration-500" />
                            </div>
                          ) : (
                            <div className="relative group/inp">
                              <input
                                type={typeof setting.value === 'number' ? 'number' : setting.id === 'api_key' ? (showApiKey ? 'text' : 'password') : 'text'}
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, typeof setting.value === 'number' ? Number(e.target.value) : e.target.value)}
                                className="w-full h-16 px-8 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.3em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner italic"
                              />
                              {setting.id === 'api_key' && (
                                <button
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-emerald-500 transition-colors"
                                >
                                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              )}
                              <Target size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 group-focus-within/inp:text-emerald-500/20 transition-colors pointer-events-none" />
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
