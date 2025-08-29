import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Play, 
  Globe, 
  BarChart3,
  PieChart,
  Activity,
  Download,
  Upload,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalPlays: number;
  topGenres: { name: string; count: number; percentage: number }[];
  recentActivity: { type: string; description: string; time: string; value: string }[];
  monthlyGrowth: { month: string; users: number; revenue: number }[];
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const analyticsData: AnalyticsData = {
    totalUsers: 45678,
    activeUsers: 12345,
    totalRevenue: 234567,
    totalPlays: 987654,
    topGenres: [
      { name: 'Pop', count: 1234, percentage: 25 },
      { name: 'Rock', count: 987, percentage: 20 },
      { name: 'Hip Hop', count: 876, percentage: 18 },
      { name: 'Electronic', count: 654, percentage: 13 },
      { name: 'Jazz', count: 432, percentage: 9 }
    ],
    recentActivity: [
      { type: 'user', description: 'New user registered', time: '2 min ago', value: '+1' },
      { type: 'play', description: 'Song played', time: '5 min ago', value: '+156' },
      { type: 'revenue', description: 'Revenue generated', time: '10 min ago', value: '+$234' },
      { type: 'upload', description: 'New track uploaded', time: '15 min ago', value: '+3' }
    ],
    monthlyGrowth: [
      { month: 'Jan', users: 12000, revenue: 45000 },
      { month: 'Feb', users: 15000, revenue: 52000 },
      { month: 'Mar', users: 18000, revenue: 61000 },
      { month: 'Apr', users: 22000, revenue: 72000 },
      { month: 'May', users: 28000, revenue: 89000 },
      { month: 'Jun', users: 35000, revenue: 110000 }
    ]
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'play':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'upload':
        return <Upload className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive insights into platform performance, user behavior, and revenue metrics.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Metrics</option>
            <option>Users</option>
            <option>Revenue</option>
            <option>Plays</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{analyticsData.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600">+8.3% from last month</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-yellow-600">${analyticsData.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+15.2% from last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Plays</p>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.totalPlays.toLocaleString()}</p>
              <p className="text-sm text-green-600">+22.1% from last month</p>
            </div>
            <Play className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Growth Trends</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('users')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === 'revenue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            
            {/* Mock Chart */}
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Interactive chart will be displayed here</p>
                <p className="text-sm text-gray-500">Showing {selectedMetric} data for the last {timeRange}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Genres</h3>
          <div className="space-y-4">
            {analyticsData.topGenres.map((genre, index) => (
              <div key={genre.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-600' :
                    index === 1 ? 'bg-green-600' :
                    index === 2 ? 'bg-yellow-600' :
                    index === 3 ? 'bg-purple-600' : 'bg-gray-600'
                  }`} />
                  <span className="font-medium text-gray-900">{genre.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{genre.count.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{genre.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{activity.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="font-medium">United States</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">45%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="font-medium">Europe</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">32%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Asia Pacific</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">18%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Other</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Report</h3>
          <p className="text-gray-600 text-sm mb-4">
            Download detailed analytics report in various formats.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <Download className="h-4 w-4 inline mr-2" />
            Export Data
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
          <p className="text-gray-600 text-sm mb-4">
            Monitor live platform activity and performance metrics.
          </p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <Activity className="h-4 w-4 inline mr-2" />
            View Live
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create personalized reports with custom filters and metrics.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <PieChart className="h-4 w-4 inline mr-2" />
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 