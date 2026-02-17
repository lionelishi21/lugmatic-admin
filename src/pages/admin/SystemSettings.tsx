import React, { useState } from 'react';
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
  Cpu,
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
  Palette
} from 'lucide-react';

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
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [settings, setSettings] = useState<Setting[]>([
    // General
    {
      id: 'site_name',
      name: 'Platform Name',
      description: 'The public name of your music streaming platform',
      type: 'input',
      value: 'Lugmatic',
      category: 'general',
      required: true,
      icon: Globe,
    },
    {
      id: 'site_description',
      name: 'Platform Description',
      description: 'Short description shown in SEO and social previews',
      type: 'textarea',
      value: 'Discover, stream, and share music with Lugmatic — the next generation music platform.',
      category: 'general',
      required: false,
      icon: FileText,
    },
    {
      id: 'default_language',
      name: 'Default Language',
      description: 'Primary language for the platform interface',
      type: 'select',
      value: 'en',
      category: 'general',
      required: true,
      icon: Globe,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    {
      id: 'theme_mode',
      name: 'Default Theme',
      description: 'Default theme for new users',
      type: 'select',
      value: 'dark',
      category: 'general',
      required: false,
      icon: Palette,
      options: [
        { label: 'Dark Mode', value: 'dark' },
        { label: 'Light Mode', value: 'light' },
        { label: 'System Default', value: 'system' },
      ],
    },
    {
      id: 'maintenance_mode',
      name: 'Maintenance Mode',
      description: 'Temporarily restrict access for all non-admin users',
      type: 'toggle',
      value: false,
      category: 'general',
      required: false,
      icon: Settings,
      hint: 'Users will see a maintenance page when enabled',
    },
    // Security
    {
      id: 'user_registration',
      name: 'User Registration',
      description: 'Allow new users to create accounts',
      type: 'toggle',
      value: true,
      category: 'security',
      required: false,
      icon: Users,
    },
    {
      id: 'email_verification',
      name: 'Email Verification',
      description: 'Require email verification before account activation',
      type: 'toggle',
      value: true,
      category: 'security',
      required: false,
      icon: Mail,
    },
    {
      id: 'two_factor_auth',
      name: 'Two-Factor Authentication',
      description: 'Enforce 2FA for admin and artist accounts',
      type: 'toggle',
      value: false,
      category: 'security',
      required: false,
      icon: Lock,
    },
    {
      id: 'session_timeout',
      name: 'Session Timeout (minutes)',
      description: 'Auto-logout inactive users after this duration',
      type: 'input',
      value: 60,
      category: 'security',
      required: true,
      icon: Clock,
    },
    {
      id: 'api_key',
      name: 'API Key',
      description: 'Primary API key for external integrations',
      type: 'input',
      value: 'lug_sk_4f8a2b1c9d3e7f6a0b5c8d2e1f4a7b3c',
      category: 'security',
      required: true,
      icon: Key,
    },
    {
      id: 'max_login_attempts',
      name: 'Max Login Attempts',
      description: 'Lock account after this many failed login attempts',
      type: 'select',
      value: '5',
      category: 'security',
      required: true,
      icon: Shield,
      options: [
        { label: '3 attempts', value: '3' },
        { label: '5 attempts', value: '5' },
        { label: '10 attempts', value: '10' },
        { label: 'Unlimited', value: '0' },
      ],
    },
    // Uploads
    {
      id: 'max_file_size',
      name: 'Max File Size (MB)',
      description: 'Maximum file size allowed for audio uploads',
      type: 'input',
      value: 50,
      category: 'uploads',
      required: true,
      icon: Upload,
    },
    {
      id: 'allowed_file_types',
      name: 'Allowed Audio Formats',
      description: 'Supported audio file extensions',
      type: 'input',
      value: 'mp3, wav, flac, aac, ogg',
      category: 'uploads',
      required: true,
      icon: FileText,
    },
    {
      id: 'max_image_size',
      name: 'Max Image Size (MB)',
      description: 'Maximum size for album art and profile images',
      type: 'input',
      value: 10,
      category: 'uploads',
      required: true,
      icon: Upload,
    },
    {
      id: 'auto_transcode',
      name: 'Auto Transcoding',
      description: 'Automatically transcode uploads to multiple quality levels',
      type: 'toggle',
      value: true,
      category: 'uploads',
      required: false,
      icon: Zap,
    },
    {
      id: 'storage_provider',
      name: 'Storage Provider',
      description: 'Cloud storage service for media files',
      type: 'select',
      value: 'aws_s3',
      category: 'uploads',
      required: true,
      icon: HardDrive,
      options: [
        { label: 'AWS S3', value: 'aws_s3' },
        { label: 'Google Cloud Storage', value: 'gcs' },
        { label: 'Azure Blob', value: 'azure' },
        { label: 'Local Storage', value: 'local' },
      ],
    },
    // Notifications
    {
      id: 'email_notifications',
      name: 'Email Notifications',
      description: 'Send email notifications for important events',
      type: 'toggle',
      value: true,
      category: 'notifications',
      required: false,
      icon: Mail,
    },
    {
      id: 'push_notifications',
      name: 'Push Notifications',
      description: 'Enable browser and mobile push notifications',
      type: 'toggle',
      value: true,
      category: 'notifications',
      required: false,
      icon: Bell,
    },
    {
      id: 'digest_frequency',
      name: 'Digest Frequency',
      description: 'How often to send activity digest emails',
      type: 'select',
      value: 'daily',
      category: 'notifications',
      required: false,
      icon: Clock,
      options: [
        { label: 'Real-time', value: 'realtime' },
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
      ],
    },
    {
      id: 'admin_alerts',
      name: 'Admin Alert Emails',
      description: 'Email addresses for critical system alerts (comma-separated)',
      type: 'input',
      value: 'admin@lugmatic.com',
      category: 'notifications',
      required: true,
      icon: AlertTriangle,
    },
    // Performance
    {
      id: 'cache_enabled',
      name: 'Enable Caching',
      description: 'Cache frequently accessed data to improve response times',
      type: 'toggle',
      value: true,
      category: 'performance',
      required: false,
      icon: Zap,
    },
    {
      id: 'cache_ttl',
      name: 'Cache TTL (seconds)',
      description: 'Time-to-live for cached responses',
      type: 'input',
      value: 3600,
      category: 'performance',
      required: true,
      icon: Clock,
    },
    {
      id: 'cdn_enabled',
      name: 'CDN Enabled',
      description: 'Serve static assets and media through CDN',
      type: 'toggle',
      value: true,
      category: 'performance',
      required: false,
      icon: Globe,
    },
    {
      id: 'stream_quality',
      name: 'Default Stream Quality',
      description: 'Default audio streaming quality for users',
      type: 'select',
      value: '320',
      category: 'performance',
      required: true,
      icon: Monitor,
      options: [
        { label: '128 kbps (Low)', value: '128' },
        { label: '192 kbps (Medium)', value: '192' },
        { label: '256 kbps (High)', value: '256' },
        { label: '320 kbps (Ultra)', value: '320' },
        { label: 'Lossless (FLAC)', value: 'lossless' },
      ],
    },
    {
      id: 'rate_limiting',
      name: 'API Rate Limiting',
      description: 'Maximum API requests per minute per user',
      type: 'input',
      value: 100,
      category: 'performance',
      required: true,
      icon: Server,
    },
  ]);

  const categories = [
    { id: 'general', name: 'General', icon: Settings, description: 'Platform basics' },
    { id: 'security', name: 'Security', icon: Shield, description: 'Auth & access' },
    { id: 'uploads', name: 'Storage & Uploads', icon: Database, description: 'Media files' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Alerts & emails' },
    { id: 'performance', name: 'Performance', icon: Monitor, description: 'Speed & caching' },
  ];

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSaved(false);
  };

  const filteredSettings = settings.filter(s => s.category === activeTab);
  const activeCategory = categories.find(c => c.id === activeTab);

  const systemHealth = [
    { name: 'Database', status: 'Connected', ok: true, latency: '12ms' },
    { name: 'API Services', status: 'Running', ok: true, latency: '45ms' },
    { name: 'File Storage', status: 'Available', ok: true, latency: '23ms' },
    { name: 'CDN', status: 'Active', ok: true, latency: '8ms' },
    { name: 'Search Engine', status: 'Indexing', ok: true, latency: '156ms' },
    { name: 'Email Service', status: 'Connected', ok: true, latency: '89ms' },
  ];

  const recentAlerts = [
    { type: 'warning', message: 'Storage usage at 67% — approaching limit', time: '2 hours ago' },
    { type: 'success', message: 'System backup completed successfully', time: '6 hours ago' },
    { type: 'info', message: 'SSL certificate renewed automatically', time: '1 day ago' },
    { type: 'success', message: 'Database optimization completed', time: '2 days ago' },
    { type: 'warning', message: 'High API traffic detected from 3 IPs', time: '3 days ago' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure platform, security, and system preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'System Status', value: 'Healthy', icon: CheckCircle, color: 'green', pulse: true },
          { label: 'Active Users', value: '1,234', icon: Users, color: 'blue' },
          { label: 'Storage Used', value: '67%', icon: HardDrive, color: 'amber', bar: 67 },
          { label: 'Uptime', value: '99.9%', icon: Wifi, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`h-4.5 w-4.5 text-${stat.color}-600`} />
              </div>
              {stat.pulse && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            {stat.bar !== undefined && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stat.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = settings.filter(s => s.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === category.id
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === category.id ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className={`text-xs ${activeTab === category.id ? 'text-green-600/70' : 'text-gray-400'}`}>
                        {category.description}
                      </p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                      activeTab === category.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            {[
              { label: 'Clear Cache', icon: RefreshCw },
              { label: 'Export Settings', icon: FileText },
              { label: 'View Logs', icon: Server },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <action.icon className="h-3.5 w-3.5 text-gray-400" />
                  {action.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            {/* Tab Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {activeCategory && (
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <activeCategory.icon className="h-5 w-5 text-green-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{activeCategory?.name} Settings</h2>
                  <p className="text-xs text-gray-500">{filteredSettings.length} configuration options</p>
                </div>
              </div>
            </div>

            {/* Settings List */}
            <div className="divide-y divide-gray-50">
              {filteredSettings.map((setting) => {
                const Icon = setting.icon || Settings;
                return (
                  <div key={setting.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5 shrink-0">
                        <Icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{setting.name}</h3>
                          {setting.required && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{setting.description}</p>

                        {setting.type === 'toggle' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSettingChange(setting.id, !setting.value)}
                              className="relative focus:outline-none"
                            >
                              {setting.value ? (
                                <ToggleRight className="h-8 w-8 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-8 w-8 text-gray-300" />
                              )}
                            </button>
                            <span className={`text-xs font-medium ${setting.value ? 'text-green-600' : 'text-gray-400'}`}>
                              {setting.value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        ) : setting.type === 'textarea' ? (
                          <textarea
                            value={String(setting.value)}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none transition-colors"
                          />
                        ) : setting.type === 'select' ? (
                          <select
                            value={String(setting.value)}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="w-full max-w-sm px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none transition-colors"
                          >
                            {setting.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative max-w-sm">
                            <input
                              type={typeof setting.value === 'number' ? 'number' : setting.id === 'api_key' ? (showApiKey ? 'text' : 'password') : 'text'}
                              value={String(setting.value)}
                              onChange={(e) => handleSettingChange(setting.id, typeof setting.value === 'number' ? Number(e.target.value) : e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-colors font-mono"
                            />
                            {setting.id === 'api_key' && (
                              <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        )}

                        {setting.hint && (
                          <p className="flex items-center gap-1 text-[11px] text-amber-600 mt-2">
                            <Info className="h-3 w-3" />
                            {setting.hint}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* System Health */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">System Health</h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {systemHealth.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono">{item.latency}</span>
                      <span className={`text-xs font-medium ${item.ok ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Alerts</h3>
                  <span className="text-xs text-gray-400">{recentAlerts.length} alerts</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                      alert.type === 'warning' ? 'bg-amber-50' :
                      alert.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                    }`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Info className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{alert.message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{alert.time}</p>
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
