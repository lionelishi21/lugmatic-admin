import React from 'react';
import { BarChart3, FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Reports
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive analytics and reporting dashboard for platform insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Reports */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Track earnings, revenue trends, and financial performance across the platform.
          </p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Generate Report
          </button>
        </div>

        {/* User Analytics */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Weekly</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">User Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">
            Monitor user engagement, growth metrics, and platform adoption rates.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            View Analytics
          </button>
        </div>

        {/* Content Performance */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Daily</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Performance</h3>
          <p className="text-gray-600 text-sm mb-4">
            Analyze content engagement, popular tracks, and trending artists.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Analyze Content
          </button>
        </div>

        {/* Platform Statistics */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Real-time</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Statistics</h3>
          <p className="text-gray-600 text-sm mb-4">
            Real-time platform metrics, server performance, and system health.
          </p>
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            View Stats
          </button>
        </div>

        {/* Export Reports */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">On-demand</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Generate and download comprehensive reports in various formats.
          </p>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Export Data
          </button>
        </div>

        {/* Custom Reports */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">Custom</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create personalized reports with custom filters and date ranges.
          </p>
          <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Create Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600">$45,678</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">12,345</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">8,901</div>
          <div className="text-sm text-gray-600">Content Items</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">234</div>
          <div className="text-sm text-gray-600">Live Streams</div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 