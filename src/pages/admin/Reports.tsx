import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  BarChart3, FileText, TrendingUp, Users, DollarSign, Download,
  Calendar, ChevronRight, Clock, ArrowUpRight, ArrowDownRight,
  Music2, Radio, Filter, Plus, MoreHorizontal, Eye, Trash2,
  RefreshCw, CheckCircle2, AlertCircle, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReportHistory();
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch report history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (type: string) => {
    try {
      setGenerating(type);
      const response = await adminService.generateReport(type);
      if (response.data.success) {
        await fetchHistory();
        // alert placeholder - replace with toast if available
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(null);
    }
  };

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
    { label: 'Total Revenue', value: '$45,678', trend: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { label: 'Active Users', value: '12,345', trend: '+8.2%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { label: 'Content Items', value: '8,901', trend: '+15.3%', up: true, icon: Music2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { label: 'Live Streams', value: '234', trend: '-2.1%', up: false, icon: Radio, color: 'text-amber-500', bg: 'bg-amber-500/5' },
  ];

  const reportCategories = [
    {
      id: 1, title: 'Revenue Reports', description: 'Track earnings, revenue trends, and financial performance across the platform.',
      icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10',
      frequency: 'Monthly', metrics: ['Total Revenue', 'ARPU', 'Churn Rate', 'MRR'],
      lastGenerated: '2 hours ago',
    },
    {
      id: 2, title: 'User Analytics', description: 'Monitor user engagement, growth metrics, and platform adoption rates.',
      icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10',
      frequency: 'Weekly', metrics: ['DAU/MAU', 'Retention', 'Signups', 'Sessions'],
      lastGenerated: '1 day ago',
    },
    {
      id: 3, title: 'Content Performance', description: 'Analyze content engagement, popular tracks, and trending artists.',
      icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10',
      frequency: 'Daily', metrics: ['Streams', 'Saves', 'Shares', 'Skip Rate'],
      lastGenerated: '3 hours ago',
    },
    {
      id: 4, title: 'Platform Statistics', description: 'Real-time platform metrics, server performance, and system health.',
      icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10',
      frequency: 'Real-time', metrics: ['Uptime', 'Latency', 'Error Rate', 'Bandwidth'],
      lastGenerated: 'Live',
    },
    {
      id: 5, title: 'Export Reports', description: 'Generate and download comprehensive reports in various formats.',
      icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/10',
      frequency: 'On-demand', metrics: ['CSV', 'PDF', 'Excel', 'JSON'],
      lastGenerated: '5 days ago',
    },
    {
      id: 6, title: 'Custom Reports', description: 'Create personalized reports with custom filters and date ranges.',
      icon: BarChart3, color: 'text-teal-500', bg: 'bg-teal-500/5', border: 'border-teal-500/10',
      frequency: 'Custom', metrics: ['Filters', 'Date Range', 'Segments', 'Metrics'],
      lastGenerated: 'N/A',
    },
  ];

  const savedReports: SavedReport[] = [
    { id: 1, name: 'Q4 Revenue Summary', type: 'Revenue', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5', dateRange: 'Oct 1 - Dec 31, 2025', generatedAt: 'Jan 5, 2026', size: '2.4 MB', status: 'completed', format: 'PDF' },
    { id: 2, name: 'Monthly User Growth', type: 'Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', dateRange: 'Dec 1 - Dec 31, 2025', generatedAt: 'Jan 2, 2026', size: '1.8 MB', status: 'completed', format: 'Excel' },
    { id: 3, name: 'Top Artists Performance', type: 'Content', icon: Music2, color: 'text-emerald-500', bg: 'bg-emerald-500/5', dateRange: 'Nov 1 - Dec 31, 2025', generatedAt: 'Jan 8, 2026', size: '3.1 MB', status: 'completed', format: 'PDF' },
    { id: 4, name: 'Platform Health Report', type: 'Platform', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/5', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Processing...', size: '—', status: 'processing', format: 'CSV' },
    { id: 5, name: 'Subscription Analytics', type: 'Revenue', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Feb 1, 2026', size: '1.2 MB', status: 'completed', format: 'PDF' },
    { id: 6, name: 'Content Engagement Trends', type: 'Content', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', dateRange: 'Dec 1 - Jan 31, 2026', generatedAt: 'Failed', size: '—', status: 'failed', format: 'Excel' },
    { id: 7, name: 'Regional User Distribution', type: 'Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', dateRange: 'Jan 1 - Jan 31, 2026', generatedAt: 'Feb 5, 2026', size: '4.5 MB', status: 'completed', format: 'CSV' },
    { id: 8, name: 'Live Stream Analytics', type: 'Content', icon: Radio, color: 'text-rose-500', bg: 'bg-rose-500/5', dateRange: 'Jan 15 - Feb 10, 2026', generatedAt: 'Scheduled', size: '—', status: 'scheduled', format: 'PDF' },
  ];

  const scheduledReports = [
    { id: 1, name: 'Weekly Revenue Summary', frequency: 'Every Monday', nextRun: 'Feb 17, 2026', format: 'PDF', recipients: 3, active: true },
    { id: 2, name: 'Monthly User Report', frequency: '1st of each month', nextRun: 'Mar 1, 2026', format: 'Excel', recipients: 5, active: true },
    { id: 3, name: 'Daily Content Metrics', frequency: 'Every day at 8am', nextRun: 'Feb 12, 2026', format: 'CSV', recipients: 2, active: false },
  ];

  const statusConfig: Record<ReportStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    completed: { label: 'Completed', color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: CheckCircle2 },
    processing: { label: 'Processing', color: 'text-blue-500', bg: 'bg-blue-500/5', icon: RefreshCw },
    scheduled: { label: 'Scheduled', color: 'text-amber-500', bg: 'bg-amber-500/5', icon: Clock },
    failed: { label: 'Failed', color: 'text-rose-500', bg: 'bg-rose-500/5', icon: AlertCircle },
  };

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
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white leading-none">Reports</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500">Live Database Sync</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Comprehensive platform-wide analytical deep-dives and historical data.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#0a0a0a] border border-white/5 rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key)}
                className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${
                  selectedPeriod === p.key ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="h-12 px-6 bg-emerald-500 text-black rounded-xl text-[10px] font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 flex items-center gap-2">
            <Plus size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} border border-white/5`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-[10px] font-bold text-zinc-600 mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="premium-card !p-0 overflow-hidden border-white/5">
        <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0a] border-b border-white/5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-white/5 text-white border border-white/10 shadow-xl'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-zinc-700'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCategories.map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => handleGenerate(cat.title.toLowerCase().split(' ')[0])}
                    className="group premium-card !bg-zinc-950/40 border-white/5 hover:border-emerald-500/20 p-6 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {generating === cat.title.toLowerCase().split(' ')[0] && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-xl ${cat.bg} border ${cat.border}`}>
                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-white/5">{cat.frequency}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{cat.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {cat.metrics.map((m, i) => (
                        <span key={i} className="text-[9px] font-bold bg-white/5 text-zinc-400 px-2.5 py-1 rounded border border-white/5">{m}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="text-[9px] font-bold text-zinc-700">
                        LAST GENERATED: <span className="text-zinc-500">{cat.lastGenerated}</span>
                      </div>
                      <ArrowUpRight className={`w-4 h-4 ${cat.color} opacity-0 group-hover:opacity-100 transition-all`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 premium-card !bg-zinc-950/40 border-white/5 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-[10px] font-bold text-zinc-500 mb-1">Revenue Forecast</h3>
                      <p className="text-[10px] text-zinc-700 font-bold">Historical revenue data vs forecast</p>
                    </div>
                    <button className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-2 transition-all">
                      <Download size={14} /> EXPORT RAW
                    </button>
                  </div>
                  <div className="flex items-end gap-4 h-56">
                    {revenueData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-700">${(d.value / 1000).toFixed(1)}K</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.value / maxRevenue) * 100}%` }}
                          className="w-full bg-emerald-500/20 border-t-2 border-emerald-500/40 hover:bg-emerald-500/40 transition-colors cursor-crosshair rounded-t-sm"
                          title={`${d.month}: $${d.value.toLocaleString()}`}
                        />
                        <span className="text-[10px] font-bold text-zinc-600">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-zinc-500 mb-4">Available Actions</h3>
                  {[
                    { label: 'Export All Data', desc: 'CSV, PDF, EXCEL', icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Schedule Sync', desc: 'RECURRING TASKS', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'Share Report', desc: 'TEAM', icon: Share2, color: 'text-violet-500', bg: 'bg-violet-500/5' },
                    { label: 'Custom Filter', desc: 'FILTER', icon: Filter, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                  ].map((a, i) => (
                    <button key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-950/40 hover:border-emerald-500/20 hover:bg-zinc-900 transition-all text-left group">
                      <div className={`p-2.5 rounded-xl ${a.bg} border border-white/5`}>
                        <a.icon className={`w-4 h-4 ${a.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white">{a.label}</div>
                        <div className="text-[9px] font-bold text-zinc-600 mt-0.5">{a.desc}</div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Saved Reports Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <p className="text-[10px] font-bold text-zinc-600">SAVED REPORTS ({savedReports.length} REPORTS)</p>
                <button className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-2 transition-all">
                  <Filter size={14} /> FILTER REPORTS
                </button>
              </div>
              <div className="space-y-2">
                {savedReports.map(report => {
                  const st = statusConfig[report.status];
                  const StIcon = st.icon;
                  return (
                    <div key={report.id} className="flex items-center gap-6 p-4 group hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                      <div className={`p-3 rounded-xl ${report.bg} border border-white/5`}>
                        <report.icon className={`w-4 h-4 ${report.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-zinc-200">{report.name}</span>
                          <span className="text-[9px] font-bold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded border border-white/5">{report.format}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-[10px] font-bold text-zinc-600">{report.dateRange}</span>
                          {report.size !== '—' && (
                            <span className="text-[10px] font-bold text-zinc-700">{report.size}</span>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 ${st.bg}`}>
                        <StIcon className={`w-3.5 h-3.5 ${st.color} ${report.status === 'processing' ? 'animate-spin' : ''}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest italic ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === report.id ? null : report.id)}
                          className="p-2 rounded-xl hover:bg-white/10 text-zinc-600 transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {actionMenu === report.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-10 z-20 w-48 bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                              {report.status === 'completed' && (
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all">
                                  <Download size={14} /> DOWNLOAD
                                </button>
                              )}
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all">
                                <Eye size={14} /> VIEW DETAILS
                              </button>
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all">
                                <RefreshCw size={14} /> REGENERATE
                              </button>
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 uppercase tracking-widest transition-all border-t border-white/5 mt-1">
                                <Trash2 size={14} /> DELETE REPORT
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
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">SCHEDULED REPORTS ({scheduledReports.length} RUNNING)</p>
                <button className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all">
                  <Plus size={16} /> NEW SCHEDULE
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduledReports.map(sr => (
                  <div key={sr.id} className="premium-card !bg-zinc-950/40 border-white/5 p-6 hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                       <div className={`p-3 rounded-xl ${sr.active ? 'bg-emerald-500/5' : 'bg-zinc-900'} border border-white/5`}>
                        <Calendar className={`w-5 h-5 ${sr.active ? 'text-emerald-500' : 'text-zinc-600'}`} />
                       </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${sr.active ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${sr.active ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wide">{sr.name}</h4>
                          <span className="text-[9px] font-bold bg-zinc-900 text-zinc-600 px-2 py-0.5 rounded border border-white/5">{sr.format}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3">
                          <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                            <RefreshCw size={12} className="text-emerald-500" /> {sr.frequency}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                            <Clock size={12} className="text-blue-500" /> NEXT: {sr.nextRun}
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">RECIPIENTS: {sr.recipients} USERS</span>
                        <button className="text-zinc-700 hover:text-white transition-all"><MoreHorizontal size={16} /></button>
                      </div>
                    </div>
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
