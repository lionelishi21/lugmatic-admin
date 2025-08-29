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
  CheckCircle
} from 'lucide-react';

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'input' | 'select';
  value: string | number | boolean;
  category: string;
  required: boolean;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'site_name',
      name: 'Site Name',
      description: 'The name of your platform',
      type: 'input',
      value: 'Lugmatic',
      category: 'general',
      required: true
    },
    {
      id: 'maintenance_mode',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to restrict access',
      type: 'toggle',
      value: false,
      category: 'general',
      required: false
    },
    {
      id: 'user_registration',
      name: 'User Registration',
      description: 'Allow new users to register',
      type: 'toggle',
      value: true,
      category: 'security',
      required: false
    },
    {
      id: 'email_verification',
      name: 'Email Verification',
      description: 'Require email verification for new accounts',
      type: 'toggle',
      value: true,
      category: 'security',
      required: false
    },
    {
      id: 'max_file_size',
      name: 'Maximum File Size',
      description: 'Maximum file size for uploads (MB)',
      type: 'input',
      value: 50,
      category: 'uploads',
      required: true
    },
    {
      id: 'allowed_file_types',
      name: 'Allowed File Types',
      description: 'Comma-separated list of allowed file extensions',
      type: 'input',
      value: 'mp3,wav,flac,aac',
      category: 'uploads',
      required: true
    }
  ]);

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'uploads', name: 'Uploads', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'performance', name: 'Performance', icon: Monitor }
  ];

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    // Reset settings logic here
    console.log('Settings reset');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-4">
          System Settings
        </h1>
        <p className="text-gray-600 text-lg">
          Configure platform settings, security options, and system preferences.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-purple-600">67%</p>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-yellow-600">99.9%</p>
            </div>
            <Monitor className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      activeTab === category.id
                        ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {categories.find(c => c.id === activeTab)?.name} Settings
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {settings
                .filter(setting => setting.category === activeTab)
                .map((setting) => (
                  <div key={setting.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{setting.name}</h3>
                        <p className="text-gray-600 text-sm">{setting.description}</p>
                      </div>
                      {setting.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {setting.type === 'toggle' ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSettingChange(setting.id, !setting.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              setting.value ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-sm text-gray-600">
                            {setting.value ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : setting.type === 'input' ? (
                        <input
                          type={typeof setting.value === 'number' ? 'number' : 'text'}
                          value={String(setting.value)}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      ) : (
                        <select
                          value={String(setting.value)}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        >
                          <option value="option1">Option 1</option>
                          <option value="option2">Option 2</option>
                          <option value="option3">Option 3</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Services</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm">Running</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">File Storage</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm">Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Storage usage approaching limit</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">System backup completed successfully</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings; 