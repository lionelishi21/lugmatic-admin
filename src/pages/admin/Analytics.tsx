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
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group";
const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 italic";
const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";
const titleClass = "text-3xl font-black text-white tracking-tighter uppercase italic";

const Analytics: React.FC = () => {
  const [activeRange, setActiveRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-emerald-500" />;
      case 'play': return <Play className="h-4 w-4 text-blue-500" />;
      case 'revenue': return <DollarSign className="h-4 w-4 text-amber-500" />;
      case 'upload': return <Music2 className="h-4 w-4 text-indigo-500" />;
      default: return <Activity className="h-4 w-4 text-zinc-500" />;
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

  const maxBarValue = analyticsData?.monthlyGrowth ? Math.max(...analyticsData.monthlyGrowth.map((d: any) =>
    selectedMetric === 'users' ? d.users : selectedMetric === 'revenue' ? d.revenue : d.plays
  )) : 0;

  const statCards = [
    {
      label: 'Total Identities',
      value: analyticsData?.totalUsers.toLocaleString() || '0',
      trend: '+12.5%',
      trendUp: true,
      icon: <Users className="h-5 w-5" />,
      color: 'emerald',
    },
    {
      label: 'Active Signal Nodes',
      value: analyticsData?.activeUsers.toLocaleString() || '0',
      trend: '+8.3%',
      trendUp: true,
      icon: <Activity className="h-5 w-5" />,
      color: 'blue',
    },
    {
      label: 'Revenue Protocol',
      value: `$${analyticsData?.totalRevenue.toLocaleString() || '0'}`,
      trend: '+15.2%',
      trendUp: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'amber',
    },
    {
      label: 'Stream Pulses',
      value: analyticsData?.totalPlays.toLocaleString() || '0',
      trend: '+22.1%',
      trendUp: true,
      icon: <Headphones className="h-5 w-5" />,
      color: 'indigo',
    },
    {
      label: 'Avg Session Latency',
      value: `${analyticsData?.avgSessionMin || 0}m`,
      trend: '+0.0%',
      trendUp: true,
      icon: <Clock className="h-5 w-5" />,
      color: 'rose',
    },
  ];

  const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', border: 'border-emerald-500/20' },
    blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-500',    border: 'border-blue-500/20' },
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-500',   border: 'border-amber-500/20' },
    indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-500',  border: 'border-indigo-500/20' },
    rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-500',    border: 'border-rose-500/20' },
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Synchronizing Data Grid...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Intelligence Grid Protocol</p>
           <h1 className={titleClass}>
             Platform Analytics
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Monitoring global platform metrics and system performance.
           </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 border border-white/5 rounded p-1 gap-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest italic transition-all ${
                  activeRange === range
                    ? 'bg-zinc-800 text-emerald-500 shadow-lg shadow-black/40'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all italic shadow-xl">
            <Download className="h-4 w-4" />
            Export Protocol
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const c = colorMap[card.color];
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cardClass + " p-6 hover:border-emerald-500/20 transition-all"}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${c.bg} border ${c.border}`}>
                  {React.cloneElement(card.icon as React.ReactElement, { className: `w-5 h-5 ${c.icon}` })}
                </div>
                <span className={`text-[10px] font-black italic ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {card.trend}
                </span>
              </div>
              <p className={labelClass}>{card.label}</p>
              <p className="text-2xl font-black text-white italic uppercase tracking-tighter tabular-nums">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className={cardClass + " lg:col-span-2 p-8"}>
          <div className="flex items-center justify-between mb-8">
            <div>
               <p className={labelClass}>Transmission Trends</p>
               <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Growth Analytics</h3>
            </div>
            <div className="flex bg-zinc-950 border border-white/5 rounded p-1 gap-1">
              {[
                { key: 'users', label: 'Nodes' },
                { key: 'revenue', label: 'Credits' },
                { key: 'plays', label: 'Pulses' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest italic transition-all ${
                    selectedMetric === m.key
                      ? 'bg-zinc-900 text-emerald-500'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4 h-64 mt-12">
            {(analyticsData?.monthlyGrowth || []).map((d: any, i: number) => {
              const val = selectedMetric === 'users' ? d.users : selectedMetric === 'revenue' ? d.revenue : d.plays;
              const heightPct = maxBarValue > 0 ? (val / maxBarValue) * 100 : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="absolute -top-8 text-[9px] font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
                    {val.toLocaleString()}
                  </div>
                  <div className="w-full flex justify-center bg-white/[0.02] rounded-t-lg relative overflow-hidden" style={{ height: '200px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className="w-full max-w-[24px] bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-t shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-auto"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className={cardClass + " p-8"}>
          <div className="flex items-center justify-between mb-8">
            <div>
               <p className={labelClass}>Signal Distribution</p>
               <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Genre Analytics</h3>
            </div>
            <PieChart className="h-4 w-4 text-zinc-700" />
          </div>

          <div className="flex justify-center mb-10 mt-6">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#f43f5e', '#06b6d4', '#9ca3af'];
                  return (analyticsData?.topGenres || []).map((genre, i) => {
                    const dash = (genre.percentage / 100) * 100;
                    const el = (
                      <circle
                        key={genre.name}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={colors[i % colors.length]}
                        strokeWidth="3"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-1000 ease-out"
                        style={{ opacity: 0.8 }}
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-white uppercase italic leading-none">
                  {analyticsData.topGenres.reduce((s: number, g: any) => s + g.count, 0).toLocaleString()}
                </p>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Units</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(analyticsData?.topGenres || []).map((genre, i) => {
               const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500', 'bg-cyan-500', 'bg-zinc-500'];
               return (
                <div key={genre.name} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]} group-hover:scale-125 transition-transform`} />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic flex-1 truncate">{genre.name}</span>
                  <span className="text-[10px] font-black text-zinc-400 italic w-8 text-right">{genre.percentage}%</span>
                  <span className="text-[10px] font-black text-white italic w-12 text-right">
                    {genre.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Tracks */}
        <div className={cardClass + " p-8"}>
          <div className="flex items-center justify-between mb-8">
            <div>
               <p className={labelClass}>Transmission Leaders</p>
               <h3 className="text-sm font-black text-white uppercase italic tracking-widest">High Priority Tracks</h3>
            </div>
            <button className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all flex items-center gap-1.5 italic">
              Full Registry <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {(analyticsData?.topTracks || []).map((track, i) => (
              <div
                key={track.title}
                className="flex items-center gap-4 p-4 rounded bg-zinc-950 border border-white/[0.04] hover:border-emerald-500/20 transition-all group"
              >
                <span className="text-xs font-black text-zinc-800 w-5 italic">{i + 1}</span>
                <div className="w-10 h-10 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/10">
                  <Music2 className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-tight truncate italic">{track.title}</p>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{track.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white italic tabular-nums">
                    {track.plays >= 1000000 ? `${(track.plays / 1000000).toFixed(1)}M` : `${(track.plays / 1000).toFixed(1)}K`}
                  </p>
                  <span className={`text-[9px] font-black uppercase tracking-widest italic ${(track.trend || 0) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {(track.trend || 0) > 0 ? '+' : ''}{track.trend || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className={cardClass + " p-8"}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                 <p className={labelClass}>Real-time Feed</p>
                 <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Live Activity</h3>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded border border-emerald-500/10 uppercase tracking-[0.2em] italic">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Sync
              </div>
            </div>
            <button className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-700">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {(analyticsData?.recentActivity || []).map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded bg-zinc-950 border border-white/[0.04] hover:border-blue-500/20 transition-all group"
              >
                <div className={`p-2.5 rounded bg-zinc-900 border border-white/5`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white uppercase tracking-tight truncate italic">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <Clock className="w-3 h-3 text-zinc-700" />
                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-500 italic uppercase tracking-widest tabular-nums">
                  {activity.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regional Distribution */}
        <div className={cardClass + " lg:col-span-2 p-8"}>
          <div className="flex items-center justify-between mb-8">
            <div>
               <p className={labelClass}>Global Reach</p>
               <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Regional Distribution</h3>
            </div>
            <Globe className="h-4 w-4 text-zinc-700" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic border-b border-white/[0.04]">
                  <th className="text-left pb-4 pl-4">Region</th>
                  <th className="text-right pb-4">Users</th>
                  <th className="text-right pb-4">Share</th>
                  <th className="text-right pb-4 pr-4">Credits</th>
                  <th className="pb-4 pr-4 w-40">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                 {(analyticsData?.regions || []).map((region) => (
                  <tr key={region.name} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{region.flag}</span>
                        <span className="text-[11px] font-black text-white uppercase italic tracking-widest">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-[11px] font-black text-zinc-500 tabular-nums">
                      {region.users.toLocaleString()}
                    </td>
                    <td className="py-4 text-right text-[11px] font-black text-emerald-500 tabular-nums italic">
                      {region.percentage}%
                    </td>
                    <td className="py-4 text-right text-[11px] font-black text-zinc-400 tabular-nums pr-4 italic">
                      ${region.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="w-full bg-zinc-900 border border-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${region.percentage}%` }}
                          className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
        <div className="space-y-8">
          {/* Devices */}
          <div className={cardClass + " p-8"}>
            <div className="flex items-center justify-between mb-8">
               <div>
                  <p className={labelClass}>Node Type</p>
                  <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Device Grid</h3>
               </div>
               <LayoutGrid className="h-4 w-4 text-zinc-700" />
            </div>
            <div className="space-y-6">
              {(analyticsData?.devices || []).map((device) => (
                <div key={device.name} className="group">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded group-hover:border-emerald-500/30 transition-colors">
                      {React.cloneElement(getDeviceIcon(device.icon) as React.ReactElement, { className: "w-4 h-4 text-zinc-600" })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{device.name}</span>
                        <span className="text-[10px] font-black text-white italic tabular-nums">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 border border-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${device.percentage}%` }}
                          className="bg-emerald-500 h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cardClass + " p-8"}>
             <p className={labelClass}>System Operations</p>
             <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-6">Executive Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Export Dataset', desc: 'CSV, PDF Protocol', icon: <Download className="h-4 w-4" />, color: 'emerald' },
                { label: 'Schedule Log', desc: 'Recurrent Sync', icon: <Calendar className="h-4 w-4" />, color: 'blue' },
                { label: 'Custom HUD', desc: 'Reconfigure View', icon: <BarChart3 className="h-4 w-4" />, color: 'amber' },
              ].map((action) => {
                 const c = colorMap[action.color];
                 return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-4 p-4 rounded bg-zinc-950 border border-white/[0.04] hover:border-white/10 transition-all text-left group"
                  >
                    <div className={`p-2.5 rounded bg-zinc-900 border border-white/5 group-hover:${c.border} transition-colors`}>
                      {React.cloneElement(action.icon as React.ReactElement, { className: `w-4 h-4 ${c.icon}` })}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{action.label}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                  </button>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
