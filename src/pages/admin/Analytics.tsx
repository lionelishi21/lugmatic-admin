import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users,
  DollarSign,
  Play,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Music2,
  Headphones,
  Clock,
  Calendar,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet,
  MoreHorizontal,
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalPlays: number;
  avgSessionMin: number;
  topGenres: { name: string; count: number; percentage: number; color: string }[];
  recentActivity: { type: string; description: string; time: string; value: string }[];
  monthlyGrowth: { month: string; users: number; revenue: number; plays: number }[];
  topTracks: { title: string; artist: string; plays: number; trend: number }[];
  regions: { name: string; flag: string; users: number; percentage: number; revenue: number }[];
  devices: { name: string; percentage: number; icon: string }[];
}

const Analytics: React.FC = () => {
  const [activeRange, setActiveRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // The service method expects a specific period string, mapping month/week/day
        const period = activeRange === 'month' ? 'monthly' : activeRange === 'week' ? 'weekly' : 'daily';
        const response = await adminService.getAnalytics(period as any);
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeRange]);

  const summary = analyticsData?.summary || {
    totalUsers: 0,
    newUsersLast30Days: 0,
    totalArtists: 0,
    totalSongs: 0,
    totalRevenue: 0
  };

  const chartData = analyticsData?.charts?.userGrowth || [];
  const [selectedMetric, setSelectedMetric] = useState('users');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'play':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-amber-600" />;
      case 'upload':
        return <Music2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'user': return 'bg-green-50';
      case 'play': return 'bg-blue-50';
      case 'revenue': return 'bg-amber-50';
      case 'upload': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      case 'monitor': return <Monitor className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const maxBarValue = analyticsData ? Math.max(...analyticsData.monthlyGrowth.map((d: any) =>
    selectedMetric === 'users' ? d.users : selectedMetric === 'revenue' ? d.revenue : d.plays
  )) : 0;

  const statCards = [
    {
      label: 'Total Users',
      value: analyticsData?.totalUsers.toLocaleString() || '0',
      trend: '+12.5%',
      trendUp: true,
      icon: <Users className="h-5 w-5" />,
      iconBg: 'bg-green-50 text-green-600',
    },
    {
      label: 'Active Users',
      value: analyticsData?.activeUsers.toLocaleString() || '0',
      trend: '+8.3%',
      trendUp: true,
      icon: <Activity className="h-5 w-5" />,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Revenue',
      value: `$${analyticsData?.totalRevenue.toLocaleString() || '0'}`,
      trend: '+15.2%',
      trendUp: true,
      icon: <DollarSign className="h-5 w-5" />,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Total Streams',
      value: analyticsData?.totalPlays.toLocaleString() || '0',
      trend: '+22.1%',
      trendUp: true,
      icon: <Headphones className="h-5 w-5" />,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Avg Session',
      value: `${analyticsData?.avgSessionMin || 0}m`,
      trend: '-1.2%',
      trendUp: false,
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-rose-50 text-rose-600',
    },
  ];

  const timeLabels: Record<string, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last year',
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform performance overview &middot; {timeLabels[activeRange] || 'Last 30 days'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>{card.icon}</div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  card.trendUp
                    ? 'text-green-700 bg-green-50'
                    : 'text-red-700 bg-red-50'
                }`}
              >
                {card.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Growth Trends</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monthly platform performance</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[
                { key: 'users', label: 'Users' },
                { key: 'revenue', label: 'Revenue' },
                { key: 'plays', label: 'Streams' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedMetric === m.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-52">
            {analyticsData.monthlyGrowth.map((d: any) => {
              const val =
                selectedMetric === 'users'
                  ? d.users
                  : selectedMetric === 'revenue'
                  ? d.revenue
                  : d.plays;
              const heightPct = maxBarValue > 0 ? (val / maxBarValue) * 100 : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-[10px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {selectedMetric === 'revenue'
                        ? `$${(val / 1000).toFixed(0)}K`
                        : val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : `${(val / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div className="w-full flex justify-center" style={{ height: '180px' }}>
                    <div
                      className="w-full max-w-[40px] rounded-lg bg-green-500 group-hover:bg-green-600 transition-all"
                      style={{
                        height: `${heightPct}%`,
                        marginTop: 'auto',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Genre Breakdown</h3>
            <PieChart className="h-4 w-4 text-gray-400" />
          </div>

          {/* Donut Placeholder */}
          <div className="flex justify-center mb-5">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#f43f5e', '#06b6d4', '#9ca3af'];
                  return analyticsData.topGenres.map((genre, i) => {
                    const dash = (genre.percentage / 100) * 100;
                    const el = (
                      <circle
                        key={genre.name}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="3"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={-offset}
                        className="transition-all"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {analyticsData.topGenres.reduce((s, g) => s + g.count, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {analyticsData.topGenres.map((genre) => (
              <div key={genre.name} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${genre.color}`} />
                <span className="text-sm text-gray-700 flex-1">{genre.name}</span>
                <span className="text-xs font-medium text-gray-400 w-8 text-right">{genre.percentage}%</span>
                <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                  {genre.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tracks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Top Tracks</h3>
              <p className="text-xs text-gray-500 mt-0.5">Most streamed this period</p>
            </div>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {analyticsData.topTracks.map((track, i) => (
              <div
                key={track.title}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Music2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{track.title}</p>
                  <p className="text-xs text-gray-500">{track.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {(track.plays / 1000000).toFixed(1)}M
                  </p>
                  <span
                    className={`text-[10px] font-medium ${
                      track.trend > 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {track.trend > 0 ? '+' : ''}
                    {track.trend}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-gray-900">Live Activity</h3>
              <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="space-y-1">
            {analyticsData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityBg(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                  <p className="text-[10px] text-gray-400">{activity.time}</p>
                </div>
                <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                  {activity.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Regional Distribution</h3>
              <p className="text-xs text-gray-500 mt-0.5">User base by region</p>
            </div>
            <Globe className="h-4 w-4 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 font-medium">
                  <th className="text-left pb-3 pl-3">Region</th>
                  <th className="text-right pb-3">Users</th>
                  <th className="text-right pb-3">Share</th>
                  <th className="text-right pb-3 pr-3">Revenue</th>
                  <th className="pb-3 pr-3 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analyticsData.regions.map((region) => (
                  <tr key={region.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{region.flag}</span>
                        <span className="text-sm font-medium text-gray-900">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm text-gray-700">
                      {region.users.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-gray-900">
                      {region.percentage}%
                    </td>
                    <td className="py-3 text-right text-sm text-gray-700 pr-3">
                      ${region.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices + Quick Actions */}
        <div className="space-y-6">
          {/* Devices */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Devices</h3>
            <div className="space-y-4">
              {analyticsData.devices.map((device) => (
                <div key={device.name} className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                    {getDeviceIcon(device.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{device.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{device.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Export Full Report', desc: 'CSV, PDF, Excel', icon: <Download className="h-4 w-4" /> },
                { label: 'Schedule Report', desc: 'Daily, weekly, monthly', icon: <Calendar className="h-4 w-4" /> },
                { label: 'Custom Dashboard', desc: 'Build your own view', icon: <BarChart3 className="h-4 w-4" /> },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
                >
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-[10px] text-gray-400">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
