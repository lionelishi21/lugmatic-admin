import React, { useState } from 'react';
import {
  BarChart3, FileText, TrendingUp, Users, DollarSign, Download,
  Calendar, ChevronRight, Clock, ArrowUpRight, ArrowDownRight,
  Music2, Radio, Filter, Plus, MoreHorizontal, Eye, Trash2,
  RefreshCw, CheckCircle2, AlertCircle, Share2
} from 'lucide-react';

type ReportStatus = 'completed' | 'processing' | 'scheduled' | 'failed';
type TabKey = 'overview' | 'saved' | 'scheduled';

interface SavedReport {
  id: number;
  name: string;
  type: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  dateRange: string;
  generatedAt: string;
  size: string;
  status: ReportStatus;
  format: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
  ];

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'overview', label: 'Overview', count: 6 },
    { key: 'saved', label: 'Saved Reports', count: 8 },
    { key: 'scheduled', label: 'Scheduled', count: 3 },
  ];

  const stats = [
    { label: 'Total Revenue', value: '$45,678', trend: '+12.5%', up: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Users', value: '12,345', trend: '+8.2%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Content Items', value: '8,901', trend: '+15.3%', up: true, icon: Music2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Live Streams', value: '234', trend: '-2.1%', up: false, icon: Radio, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const reportCategories = [
    {
      id: 1, title: 'Revenue Reports', description: 'Track earnings, revenue trends, and financial performance across the platform.',
      icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
      frequency: 'Monthly', metrics: ['Total Revenue', 'ARPU', 'Churn Rate', 'MRR'],
      lastGenerated: '2 hours ago',
    },
    {
      id: 2, title: 'User Analytics', description: 'Monitor user engagement, growth metrics, and platform adoption rates.',
      icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
      frequency: 'Weekly', metrics: ['DAU/MAU', 'Retention', 'Signups', 'Sessions'],
      lastGenerated: '1 day ago',
    },
    {
      id: 3, title: 'Content Performance', description: 'Analyze content engagement, popular tracks, and trending artists.',
      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
      frequency: 'Daily', metrics: ['Streams', 'Saves', 'Shares', 'Skip Rate'],
      lastGenerated: '3 hours ago',
    },
    {
      id: 4, title: 'Platform Statistics', description: 'Real-time platform metrics, server performance, and system health.',
      icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
      frequency: 'Real-time', metrics: ['Uptime', 'Latency', 'Error Rate', 'Bandwidth'],
      lastGenerated: 'Live',
    },
    {
      id: 5, title: 'Export Reports', description: 'Generate and download comprehensive reports in various formats.',
      icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',
      frequency: 'On-demand', metrics: ['CSV', 'PDF', 'Excel', 'JSON'],
      lastGenerated: '5 days ago',
    },
    {
      id: 6, title: 'Custom Reports', description: 'Create personalized reports with custom filters and date ranges.',
      icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
      frequency: 'Custom', metrics: ['Filters', 'Date Range', 'Segments', 'Metrics'],
      lastGenerated: 'N/A',
    },
  ];

  const savedReports: SavedReport[] = [
    { id: 1, name: 'Q4 Revenue Summary', type: 'Revenue', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', dateRange: 'Oct 1 - Dec 31, 2025', generatedAt: 'Jan 5, 2026', size: '2.4 MB', status: 'completed', format: 'PDF' },
    { id: 2, name: 'Monthly User Growth', type: 'Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', dateRange: 'Dec 1 - Dec 31, 2025', generatedAt: 'Jan 2, 2026', size: '1.8 MB', status: 'completed', format: 'Excel' },
    { id: 3, name: 'Top Artists Performance', type: 'Content', icon: Music2, color: 'text-emerald-600', bg: 'bg-emerald-50', dateRange: 'Nov 1 - Dec 31, 2025', generatedAt: 'Jan 8, 2026', size: '3.1 MB', status: 'completed', format: 'PDF' },
    { id: 4, name: 'Platform Health Report', type: 'Platform', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Processing...', size: '—', status: 'processing', format: 'CSV' },
    { id: 5, name: 'Subscription Analytics', type: 'Revenue', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Feb 1, 2026', size: '1.2 MB', status: 'completed', format: 'PDF' },
    { id: 6, name: 'Content Engagement Trends', type: 'Content', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', dateRange: 'Dec 1 - Jan 31, 2026', generatedAt: 'Failed', size: '—', status: 'failed', format: 'Excel' },
    { id: 7, name: 'Regional User Distribution', type: 'Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Feb 5, 2026', size: '4.5 MB', status: 'completed', format: 'CSV' },
    { id: 8, name: 'Live Stream Analytics', type: 'Content', icon: Radio, color: 'text-rose-600', bg: 'bg-rose-50', dateRange: 'Jan 15 - Feb 10, 2026', generatedAt: 'Scheduled', size: '—', status: 'scheduled', format: 'PDF' },
  ];

  const scheduledReports = [
    { id: 1, name: 'Weekly Revenue Summary', frequency: 'Every Monday', nextRun: 'Feb 17, 2026', format: 'PDF', recipients: 3, active: true },
    { id: 2, name: 'Monthly User Report', frequency: '1st of each month', nextRun: 'Mar 1, 2026', format: 'Excel', recipients: 5, active: true },
    { id: 3, name: 'Daily Content Metrics', frequency: 'Every day at 8am', nextRun: 'Feb 12, 2026', format: 'CSV', recipients: 2, active: false },
  ];

  const statusConfig: Record<ReportStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle2 },
    processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50', icon: RefreshCw },
    scheduled: { label: 'Scheduled', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
    failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50', icon: AlertCircle },
  };

  // Revenue trend data
  const revenueData = [
    { month: 'Aug', value: 28500 },
    { month: 'Sep', value: 31200 },
    { month: 'Oct', value: 29800 },
    { month: 'Nov', value: 35400 },
    { month: 'Dec', value: 42100 },
    { month: 'Jan', value: 45678 },
  ];
  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive analytics and reporting dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedPeriod === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 px-5 pt-4 border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === t.key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Report Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportCategories.map(cat => (
                  <div key={cat.id} className={`group bg-white rounded-xl border ${cat.border} p-5 hover:shadow-md transition-all cursor-pointer`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${cat.bg}`}>
                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{cat.frequency}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{cat.title}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{cat.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cat.metrics.map((m, i) => (
                        <span key={i} className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md">{m}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cat.lastGenerated}
                      </span>
                      <button className="flex items-center gap-1 text-xs font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Generate <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Trend + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
                    </div>
                    <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>
                  <div className="flex items-end gap-3 h-40">
                    {revenueData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-500">${(d.value / 1000).toFixed(1)}k</span>
                        <div
                          className="w-full bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors cursor-pointer"
                          style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                          title={`${d.month}: $${d.value.toLocaleString()}`}
                        />
                        <span className="text-[10px] text-gray-400">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                  {[
                    { label: 'Export All Data', desc: 'CSV, PDF, Excel', icon: Download, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Schedule Report', desc: 'Set up recurring', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Share Dashboard', desc: 'Send to team', icon: Share2, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Custom Report', desc: 'Build from scratch', icon: Filter, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((a, i) => (
                    <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all text-left group">
                      <div className={`p-2 rounded-lg ${a.bg}`}>
                        <a.icon className={`w-4 h-4 ${a.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{a.label}</div>
                        <div className="text-[11px] text-gray-400">{a.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Saved Reports Tab */}
          {activeTab === 'saved' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">{savedReports.length} reports</p>
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {savedReports.map(report => {
                  const st = statusConfig[report.status];
                  const StIcon = st.icon;
                  return (
                    <div key={report.id} className="flex items-center gap-4 py-3.5 group hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
                      <div className={`p-2 rounded-xl ${report.bg}`}>
                        <report.icon className={`w-4 h-4 ${report.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{report.name}</span>
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{report.format}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-gray-400">{report.dateRange}</span>
                          {report.size !== '—' && (
                            <span className="text-[11px] text-gray-400">{report.size}</span>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${st.bg}`}>
                        <StIcon className={`w-3 h-3 ${st.color} ${report.status === 'processing' ? 'animate-spin' : ''}`} />
                        <span className={`text-[11px] font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === report.id ? null : report.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {actionMenu === report.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1">
                              {report.status === 'completed' && (
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                              )}
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">{scheduledReports.length} scheduled reports</p>
                <button className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700">
                  <Plus className="w-3.5 h-3.5" /> Add Schedule
                </button>
              </div>
              <div className="space-y-3">
                {scheduledReports.map(sr => (
                  <div key={sr.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-100 transition-colors">
                    <div className={`p-2.5 rounded-xl ${sr.active ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <Calendar className={`w-5 h-5 ${sr.active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{sr.name}</span>
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{sr.format}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" /> {sr.frequency}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Next: {sr.nextRun}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" /> {sr.recipients} recipients
                        </span>
                      </div>
                    </div>
                    <button
                      className={`relative w-10 h-5 rounded-full transition-colors ${sr.active ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sr.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
