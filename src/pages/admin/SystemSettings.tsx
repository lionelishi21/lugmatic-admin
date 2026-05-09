import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Settings,
  Shield,
  Database,
  Bell,
  Users,
  Monitor,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Upload,
  Mail,
  Clock,
  HardDrive,
  Wifi,
  Eye,
  EyeOff,
  Info,
  ChevronRight,
  Zap,
  Server,
  ToggleLeft,
  ToggleRight,
  Key,
  FileText,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group";
const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 italic";
const inputClass = "w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold italic uppercase tracking-tight";
const titleClass = "text-3xl font-black text-white tracking-tighter uppercase italic";

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Setting[]>([
    // General
    { id: 'site_name', name: 'Platform Name', description: 'The public name of your music streaming platform', type: 'input', value: 'Lugmatic', category: 'general', required: true, icon: Globe },
    { id: 'site_description', name: 'Platform Description', description: 'Short description shown in SEO and social previews', type: 'textarea', value: 'Discover, stream, and share music with Lugmatic — the next generation music platform.', category: 'general', required: false, icon: FileText },
    { id: 'default_language', name: 'Default Language', description: 'Primary language for the platform interface', type: 'select', value: 'en', category: 'general', required: true, icon: Globe, options: [{ label: 'English', value: 'en' }, { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }, { label: 'German', value: 'de' }, { label: 'Japanese', value: 'ja' }] },
    { id: 'theme_mode', name: 'Default Theme', description: 'Default theme for new users', type: 'select', value: 'dark', category: 'general', required: false, icon: Palette, options: [{ label: 'Dark Mode', value: 'dark' }, { label: 'Light Mode', value: 'light' }, { label: 'System Default', value: 'system' }] },
    { id: 'maintenance_mode', name: 'Maintenance Mode', description: 'Temporarily restrict access for all non-admin users', type: 'toggle', value: false, category: 'general', required: false, icon: Settings, hint: 'Users will see a maintenance page when enabled' },
    // Security
    { id: 'user_registration', name: 'User Registration', description: 'Allow new users to create accounts', type: 'toggle', value: true, category: 'security', required: false, icon: Users },
    { id: 'email_verification', name: 'Email Verification', description: 'Require email verification before account activation', type: 'toggle', value: true, category: 'security', required: false, icon: Mail },
    { id: 'two_factor_auth', name: 'Two-Factor Authentication', description: 'Enforce 2FA for admin and artist accounts', type: 'toggle', value: false, category: 'security', required: false, icon: Lock },
    { id: 'session_timeout', name: 'Session Timeout (minutes)', description: 'Auto-logout inactive users after this duration', type: 'input', value: 60, category: 'security', required: true, icon: Clock },
    { id: 'api_key', name: 'API Key', description: 'Primary API key for external integrations', type: 'input', value: 'lug_sk_4f8a2b1c9d3e7f6a0b5c8d2e1f4a7b3c', category: 'security', required: true, icon: Key },
    { id: 'max_login_attempts', name: 'Max Login Attempts', description: 'Lock account after this many failed login attempts', type: 'select', value: '5', category: 'security', required: true, icon: Shield, options: [{ label: '3 attempts', value: '3' }, { label: '5 attempts', value: '5' }, { label: '10 attempts', value: '10' }, { label: 'Unlimited', value: '0' }] },
    // Uploads
    { id: 'max_file_size', name: 'Max File Size (MB)', description: 'Maximum file size allowed for audio uploads', type: 'input', value: 50, category: 'uploads', required: true, icon: Upload },
    { id: 'allowed_file_types', name: 'Allowed Audio Formats', description: 'Supported audio file extensions', type: 'input', value: 'mp3, wav, flac, aac, ogg', category: 'uploads', required: true, icon: FileText },
    { id: 'max_image_size', name: 'Max Image Size (MB)', description: 'Maximum size for album art and profile images', type: 'input', value: 10, category: 'uploads', required: true, icon: Upload },
    { id: 'auto_transcode', name: 'Auto Transcoding', description: 'Automatically transcode uploads to multiple quality levels', type: 'toggle', value: true, category: 'uploads', required: false, icon: Zap },
    { id: 'storage_provider', name: 'Storage Provider', description: 'Cloud storage service for media files', type: 'select', value: 'aws_s3', category: 'uploads', required: true, icon: HardDrive, options: [{ label: 'AWS S3', value: 'aws_s3' }, { label: 'Google Cloud Storage', value: 'gcs' }, { label: 'Azure Blob', value: 'azure' }, { label: 'Local Storage', value: 'local' }] },
    // Notifications
    { id: 'email_notifications', name: 'Email Notifications', description: 'Send email notifications for important events', type: 'toggle', value: true, category: 'notifications', required: false, icon: Mail },
    { id: 'push_notifications', name: 'Push Notifications', description: 'Enable browser and mobile push notifications', type: 'toggle', value: true, category: 'notifications', required: false, icon: Bell },
    { id: 'digest_frequency', name: 'Digest Frequency', description: 'How often to send activity digest emails', type: 'select', value: 'daily', category: 'notifications', required: false, icon: Clock, options: [{ label: 'Real-time', value: 'realtime' }, { label: 'Hourly', value: 'hourly' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }] },
    { id: 'admin_alerts', name: 'Admin Alert Emails', description: 'Email addresses for critical system alerts (comma-separated)', type: 'input', value: 'admin@lugmatic.com', category: 'notifications', required: true, icon: AlertTriangle },
    // Performance
    { id: 'cache_enabled', name: 'Enable Caching', description: 'Cache frequently accessed data to improve response times', type: 'toggle', value: true, category: 'performance', required: false, icon: Zap },
    { id: 'cache_ttl', name: 'Cache TTL (seconds)', description: 'Time-to-live for cached responses', type: 'input', value: 3600, category: 'performance', required: true, icon: Clock },
    { id: 'cdn_enabled', name: 'CDN Enabled', description: 'Serve static assets and media through CDN', type: 'toggle', value: true, category: 'performance', required: false, icon: Globe },
    { id: 'stream_quality', name: 'Default Stream Quality', description: 'Default audio streaming quality for users', type: 'select', value: '320', category: 'performance', required: true, icon: Monitor, options: [{ label: '128 kbps (Low)', value: '128' }, { label: '192 kbps (Medium)', value: '192' }, { label: '256 kbps (High)', value: '256' }, { label: '320 kbps (Ultra)', value: '320' }, { label: 'Lossless (FLAC)', value: 'lossless' }] },
    { id: 'rate_limiting', name: 'API Rate Limiting', description: 'Maximum API requests per minute per user', type: 'input', value: 100, category: 'performance', required: true, icon: Server },
  ]);

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
        console.error('Failed to fetch settings:', err);
        setError('Could not load system settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const categories = [
    { id: 'general', name: 'Platform Protocol', icon: Settings, description: 'Core system variables' },
    { id: 'security', name: 'Access Control', icon: Shield, description: 'Authority & encryption' },
    { id: 'uploads', name: 'Storage Matrix', icon: Database, description: 'Data ingestion config' },
    { id: 'notifications', name: 'Alert Grid', icon: Bell, description: 'Signal propagation' },
    { id: 'performance', name: 'Processing Core', icon: Monitor, description: 'Latency & throughput' },
  ];

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(prev => prev.map(setting => setting.id === id ? { ...setting, value } : setting));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const updates = settings.map(s => ({ key: s.id, value: s.value, category: s.category }));
      await adminService.updateSystemSettings(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const filteredSettings = settings.filter(s => s.category === activeTab);
  const activeCategory = categories.find(c => c.id === activeTab);

  const systemHealth = [
    { name: 'Database Grid', status: 'Online', ok: true, latency: '12ms' },
    { name: 'API Services', status: 'Stable', ok: true, latency: '45ms' },
    { name: 'S3 Storage Matrix', status: 'Available', ok: true, latency: '23ms' },
    { name: 'CDN Nodes', status: 'Active', ok: true, latency: '8ms' },
    { name: 'Redis Cache', status: 'Optimal', ok: true, latency: '2ms' },
    { name: 'Signal Hub', status: 'Synchronized', ok: true, latency: '89ms' },
  ];

  const recentAlerts = [
    { type: 'warning', message: 'Ingestion rate exceeding nominal thresholds', time: '2 hours ago' },
    { type: 'success', message: 'Global system sync completed successfully', time: '6 hours ago' },
    { type: 'info', message: 'Encryption protocols updated to v4.2', time: '1 day ago' },
    { type: 'success', message: 'Database integrity check: 100%', time: '2 days ago' },
    { type: 'warning', message: 'Unauthorized access attempts blocked (x12)', time: '3 days ago' },
  ];

  if (loading && settings.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Accessing Core Config...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">System Configuration Interface</p>
           <h1 className={titleClass}>
             Command Protocol
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Adjusting critical system parameters and executive authority levels.
           </p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {saved && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded border border-emerald-500/20 uppercase italic"
              >
                <CheckCircle className="h-3 w-3" />
                PROTOCOL_SYNCED
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-zinc-500 border border-white/5 rounded text-[10px] font-black uppercase tracking-widest hover:text-white transition-all italic"
          >
            <RefreshCw className="h-4 w-4" />
            RESET_BUFFER
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all italic shadow-xl"
          >
            <Save className="h-4 w-4" />
            COMMIT_CHANGES
          </button>
        </div>
      </div>

      {/* Quick Health Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'System Integrity', value: 'NOMINAL', icon: CheckCircle, color: 'emerald', pulse: true },
          { label: 'Active Signal Nodes', value: '1,234', icon: Users, color: 'blue' },
          { label: 'Storage Matrix Load', value: '67%', icon: HardDrive, color: 'amber', bar: 67 },
          { label: 'Network Uptime', value: '99.9%', icon: Wifi, color: 'indigo' },
        ].map((stat) => {
          const colors: Record<string, string> = { emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20', amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20', indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
          return (
            <div key={stat.label} className={cardClass + " p-6"}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center border ${colors[stat.color]}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.pulse && (
                  <div className="flex gap-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                     <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse delay-75" />
                     <div className="w-1 h-1 rounded-full bg-emerald-500/10 animate-pulse delay-150" />
                  </div>
                )}
              </div>
              <p className={labelClass}>{stat.label}</p>
              <p className="text-xl font-black text-white italic uppercase tracking-tighter">{stat.value}</p>
              {stat.bar !== undefined && (
                <div className="mt-4 h-1 bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${stat.bar}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <div className={cardClass + " p-2"}>
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = settings.filter(s => s.category === category.id).length;
                const active = activeTab === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded transition-all text-left group relative ${
                      active ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                      active ? 'bg-emerald-500/20' : 'bg-zinc-950 border border-white/5 group-hover:border-white/10'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-tight">{category.name}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 truncate ${active ? 'text-emerald-500/60' : 'text-zinc-700'}`}>
                        {category.description}
                      </p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border italic ${
                      active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-950 border-white/5 text-zinc-700'
                    }`}>
                      {count}
                    </span>
                    {active && (
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className={cardClass + " p-6"}>
            <p className={labelClass}>Emergency Protocol</p>
            <div className="space-y-2">
              {[
                { label: 'Flush Cache Matrix', icon: RefreshCw },
                { label: 'Export System Log', icon: FileText },
                { label: 'Reboot Core Hub', icon: Server, warning: true },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded text-[9px] font-black uppercase tracking-widest transition-all border italic ${
                    action.warning ? 'bg-rose-500/5 border-rose-500/10 text-rose-500 hover:bg-rose-500/10' : 'bg-zinc-950 border-white/5 text-zinc-600 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </span>
                  <ChevronRight className="h-3 w-3 opacity-30" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className={cardClass}>
            {/* Tab Header */}
            <div className="px-8 py-6 border-b border-white/[0.06] bg-zinc-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {activeCategory && (
                    <div className="w-12 h-12 rounded bg-zinc-900 border border-white/5 flex items-center justify-center">
                      <activeCategory.icon className="h-6 w-6 text-emerald-500" />
                    </div>
                  )}
                  <div>
                    <p className={labelClass}>Sub-system Parameters</p>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{activeCategory?.name} Protocol</h2>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Authority Level</p>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic mt-1">L7_EXECUTIVE</p>
                </div>
              </div>
            </div>

            {/* Settings List */}
            <div className="divide-y divide-white/[0.04]">
              {filteredSettings.map((setting) => {
                const Icon = setting.icon || Settings;
                return (
                  <div key={setting.id} className="px-8 py-8 hover:bg-white/[0.01] transition-all">
                    <div className="flex items-start gap-6">
                      <div className="w-10 h-10 rounded bg-zinc-950 border border-white/5 flex items-center justify-center mt-1 shrink-0 group-hover:border-emerald-500/30 transition-colors">
                        <Icon className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-black text-white uppercase italic tracking-widest">{setting.name}</h3>
                          {setting.required && (
                            <span className="text-[8px] font-black px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded uppercase italic tracking-widest">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-6 leading-relaxed italic">{setting.description}</p>

                        <div className="max-w-xl">
                          {setting.type === 'toggle' ? (
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleSettingChange(setting.id, !setting.value)}
                                className="relative transition-all"
                              >
                                {setting.value ? (
                                  <ToggleRight className="h-10 w-10 text-emerald-500 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                ) : (
                                  <ToggleLeft className="h-10 w-10 text-zinc-800" />
                                )}
                              </button>
                              <span className={`text-[10px] font-black uppercase tracking-widest italic ${setting.value ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                {setting.value ? 'PROTOCOL_ENABLED' : 'PROTOCOL_DISABLED'}
                              </span>
                            </div>
                          ) : setting.type === 'textarea' ? (
                            <textarea
                              value={String(setting.value)}
                              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                              rows={4}
                              className={inputClass + " resize-none"}
                            />
                          ) : setting.type === 'select' ? (
                            <div className="relative">
                              <select
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                className={inputClass + " appearance-none cursor-pointer"}
                              >
                                {setting.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 rotate-90 pointer-events-none" />
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type={typeof setting.value === 'number' ? 'number' : setting.id === 'api_key' ? (showApiKey ? 'text' : 'password') : 'text'}
                                value={String(setting.value)}
                                onChange={(e) => handleSettingChange(setting.id, typeof setting.value === 'number' ? Number(e.target.value) : e.target.value)}
                                className={inputClass + " font-mono"}
                              />
                              {setting.id === 'api_key' && (
                                <button
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-emerald-500"
                                >
                                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {setting.hint && (
                          <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded">
                            <Info className="h-3 w-3 text-amber-500" />
                            <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest italic">
                              NOTICE: {setting.hint}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Infrastructure Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* System Health */}
            <div className={cardClass}>
              <div className="px-6 py-5 border-b border-white/[0.06] bg-zinc-800/20 flex items-center justify-between">
                 <div>
                    <p className={labelClass}>Infrastructure Node</p>
                    <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Real-time Health</h3>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                 </div>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {systemHealth.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-zinc-700 tabular-nums italic">{item.latency}</span>
                      <span className={`text-[9px] font-black italic tracking-widest ${item.ok ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alert Logs */}
            <div className={cardClass}>
              <div className="px-6 py-5 border-b border-white/[0.06] bg-zinc-800/20 flex items-center justify-between">
                 <div>
                    <p className={labelClass}>Transmission Log</p>
                    <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Critical Alert Stream</h3>
                 </div>
                 <span className="text-[9px] font-black text-zinc-700 uppercase italic">{recentAlerts.length} ENTRIES</span>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.01]">
                    <div className={`w-8 h-8 rounded bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-zinc-400 uppercase italic tracking-widest leading-relaxed">{alert.message}</p>
                      <p className="text-[9px] font-bold text-zinc-700 mt-1 uppercase tracking-widest italic">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
