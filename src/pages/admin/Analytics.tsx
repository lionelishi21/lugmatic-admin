import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users, DollarSign, Play, Globe, BarChart3, PieChart, Activity,
  Download, TrendingUp, TrendingDown, ArrowUpRight, Music2,
  Headphones, Clock, Calendar, ChevronRight, Smartphone,
  Monitor, Tablet, MoreHorizontal, LayoutGrid, Zap, ShieldCheck,
  Star, Target, Cpu, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      case 'user': return <Users size={16} className="text-emerald-500" />;
      case 'play': return <Play size={16} className="text-blue-500" />;
      case 'revenue': return <DollarSign size={16} className="text-amber-500" />;
      case 'upload': return <Music2 size={16} className="text-indigo-500" />;
      default: return <Activity size={16} className="text-zinc-500" />;
    }
  };

  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case 'smartphone': return <Smartphone size={18} />;
      case 'monitor': return <Monitor size={18} />;
      case 'tablet': return <Tablet size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="text-emerald-500 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-2">Synchronizing Neural Grid</p>
          <div className="flex gap-1 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Network Identities', value: analyticsData?.totalUsers.toLocaleString() || '0', trend: '+12.5%', color: 'emerald', icon: Users },
    { label: 'Active Signal Nodes', value: analyticsData?.activeUsers.toLocaleString() || '0', trend: '+8.3%', color: 'blue', icon: Activity },
    { label: 'Revenue Credits', value: `$${analyticsData?.totalRevenue.toLocaleString() || '0'}`, trend: '+15.2%', color: 'amber', icon: DollarSign },
    { label: 'Stream Pulses', value: analyticsData?.totalPlays.toLocaleString() || '0', trend: '+22.1%', color: 'indigo', icon: Headphones },
    { label: 'Session Velocity', value: `${analyticsData?.avgSessionMin || 0}m`, trend: 'STABLE', color: 'rose', icon: Clock },
  ];

  const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-500/5', icon: 'text-emerald-500', border: 'border-emerald-500/10' },
    blue:    { bg: 'bg-blue-500/5',    icon: 'text-blue-500',    border: 'border-blue-500/10' },
    amber:   { bg: 'bg-amber-500/5',   icon: 'text-amber-500',   border: 'border-amber-500/10' },
    indigo:  { bg: 'bg-indigo-500/5',  icon: 'text-indigo-500',  border: 'border-indigo-500/10' },
    rose:    { bg: 'bg-rose-500/5',    icon: 'text-rose-500',    border: 'border-rose-500/10' },
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Intelligence Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none italic uppercase">Signal Intelligence</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Neural Link Active</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1 italic">Comprehensive telemetry and behavior analysis for global infrastructure.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-1 flex gap-1 shadow-inner">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeRange === range
                    ? 'bg-white/10 text-white shadow-xl'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-white/5">
            <Download size={16} />
            Export Protocol
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const c = colorMap[card.color];
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="premium-card group hover:border-emerald-500/20 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} border ${c.border} transition-all group-hover:scale-110`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <div className={`text-[9px] font-bold px-2 py-1 rounded bg-black/40 border border-white/5 ${card.trend.includes('+') ? 'text-emerald-500' : 'text-zinc-500'} tracking-widest`}>
                  {card.trend}
                </div>
              </div>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1.5 italic">{card.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums leading-none italic uppercase">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Analytics Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Signal Propagation Matrix */}
        <div className="premium-card lg:col-span-2 !p-0 overflow-hidden flex flex-col border-black/5 dark:border-white/5">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Signal Propagation Matrix</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Growth trajectories and transmission velocity</p>
            </div>
            <div className="flex bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-1">
              {[
                { key: 'users', label: 'NODES' },
                { key: 'revenue', label: 'CREDITS' },
                { key: 'plays', label: 'PULSES' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                    selectedMetric === m.key
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-10 h-80 flex items-end gap-6 relative group">
            {/* Visual Grid Lines */}
            <div className="absolute inset-x-10 top-10 bottom-24 flex flex-col justify-between pointer-events-none">
               {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/[0.02]" />)}
            </div>

            {(analyticsData?.monthlyGrowth || []).map((d: any, i: number) => {
              const val = selectedMetric === 'users' ? d.users : selectedMetric === 'revenue' ? d.revenue : d.plays;
              const maxVal = Math.max(...analyticsData.monthlyGrowth.map((x: any) => selectedMetric === 'users' ? x.users : selectedMetric === 'revenue' ? x.revenue : x.plays));
              const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-4 group/bar relative">
                  <div className="absolute -top-10 px-2 py-1 rounded bg-emerald-500 text-black text-[9px] font-black opacity-0 group-hover/bar:opacity-100 transition-all translate-y-2 group-hover/bar:translate-y-0 shadow-xl shadow-emerald-500/20">
                    {val.toLocaleString()}
                  </div>
                  <div className="w-full h-full flex flex-col justify-end bg-white/[0.01] rounded-2xl p-1 relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: i * 0.05, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                      className="w-full bg-gradient-to-t from-emerald-500/5 via-emerald-500/20 to-emerald-500 rounded-xl relative overflow-hidden group/shine shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    >
                       <div className="absolute inset-0 bg-black/20 dark:bg-white/20 -translate-y-full group-hover/shine:translate-y-full transition-transform duration-1000" />
                    </motion.div>
                  </div>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest tabular-nums">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Semantic Distribution */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-black/5 dark:border-white/5">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Semantic Distribution</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Asset categorization and metadata density</p>
            </div>
            <Target size={16} className="text-zinc-700" />
          </div>

          <div className="p-10 flex flex-col items-center flex-1">
            <div className="relative w-56 h-56 group mb-12">
               {/* Orbital Rings */}
               <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-full scale-110" />
               <div className="absolute inset-0 border border-white/[0.02] rounded-full scale-[1.25]" />
               
               <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(16,185,129,0.1)]">
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
                        strokeWidth="3.5"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-1000 ease-in-out opacity-80 group-hover:opacity-100 group-hover:stroke-[4]"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">
                  {analyticsData.topGenres.reduce((s: number, g: any) => s + g.count, 0).toLocaleString()}
                </p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Analyzed Units</p>
              </div>
            </div>

            <div className="w-full space-y-4 px-4">
              {(analyticsData?.topGenres || []).map((genre, i) => {
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500', 'bg-cyan-500', 'bg-zinc-500'];
                return (
                  <div key={genre.name} className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-all">
                    <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]} shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-150`} />
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 dark:text-white transition-colors flex-1">{genre.name}</span>
                    <div className="text-right">
                       <span className="text-[10px] font-bold text-zinc-900 dark:text-white tabular-nums tracking-tighter">{genre.count.toLocaleString()}</span>
                       <span className="text-[9px] font-bold text-zinc-700 ml-2 uppercase">{genre.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operational Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* High-Impact Signal Source */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-black/5 dark:border-white/5 shadow-2xl">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">High-Impact Asset Analysis</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Peak transmission leaders and engagement spikes</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="text-[9px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all flex items-center gap-2">
                 REGISTRY SPECTRUM <ChevronRight size={14} />
               </button>
            </div>
          </div>
          <div className="p-8 space-y-4">
            {(analyticsData?.topTracks || []).map((track, i) => (
              <div
                key={track.title}
                className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-zinc-800 w-4 tabular-nums">0{i + 1}</span>
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/20 transition-all">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10" />
                  <Music2 size={20} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-200 group-hover:text-zinc-900 dark:text-white transition-colors truncate tracking-tight">{track.title}</p>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{track.artist}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums">
                      {track.plays >= 1000000 ? `${(track.plays / 1000000).toFixed(1)}M` : `${(track.plays / 1000).toFixed(1)}K`}
                    </p>
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-black/40 border border-white/5 ${(track.trend || 0) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {(track.trend || 0) > 0 ? 'GAINING' : 'STABLE'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-zinc-900 dark:text-white transition-all">Analyze Global Performance Spectrum</button>
          </div>
        </div>

        {/* Live Operational Stream */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-black/5 dark:border-white/5 shadow-2xl">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Live Operational Stream</h3>
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Real-time neural sync and system telemetry</p>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                SYNC ACTIVE
              </div>
            </div>
            <MoreHorizontal size={18} className="text-zinc-700 cursor-pointer" />
          </div>
          <div className="p-8 space-y-4">
            {(analyticsData?.recentActivity || []).map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.01] border border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all group cursor-default"
              >
                <div className="p-3 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors leading-relaxed tracking-tight">{activity.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                     <Clock size={12} className="text-zinc-700" />
                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{activity.time.toUpperCase()}</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/40 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-bold text-emerald-500 tabular-nums tracking-tighter">
                    {activity.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-zinc-900 dark:text-white transition-all">Intercept Entire Telemetry Stream</button>
          </div>
        </div>
      </div>

      {/* Global Distribution & Hardware Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Geographic Signal Strength */}
        <div className="premium-card lg:col-span-2 !p-0 overflow-hidden border-black/5 dark:border-white/5">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Geographic Signal Strength</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Regional node density and credit throughput</p>
            </div>
            <Globe size={18} className="text-zinc-700" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-black/5 dark:border-white/5 bg-black/20">
                  <th className="text-left py-6 px-8">Sovereign Region</th>
                  <th className="text-right py-6 px-8">Active Nodes</th>
                  <th className="text-right py-6 px-8">Net Share</th>
                  <th className="text-right py-6 px-8">Credits</th>
                  <th className="py-6 px-8 w-48 text-left">System Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {(analyticsData?.regions || []).map((region) => (
                  <tr key={region.name} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all duration-500">{region.flag}</span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors tracking-tight uppercase">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right text-[11px] font-bold text-zinc-500 tabular-nums">
                      {region.users.toLocaleString()}
                    </td>
                    <td className="py-5 px-8 text-right text-[11px] font-bold text-emerald-500 tabular-nums tracking-widest">
                      {region.percentage}%
                    </td>
                    <td className="py-5 px-8 text-right text-[11px] font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">
                      ${region.revenue.toLocaleString()}
                    </td>
                    <td className="py-5 px-8">
                      <div className="w-full bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${region.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Neural Node Grid */}
        <div className="space-y-10">
          <div className="premium-card space-y-10 border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Neural Node Grid</h3>
                  <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Hardware profile and connection medium</p>
               </div>
               <Cpu size={18} className="text-zinc-700" />
            </div>
            <div className="space-y-8">
              {(analyticsData?.devices || []).map((device) => (
                <div key={device.name} className="group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl group-hover:border-emerald-500/30 transition-all group-hover:scale-110">
                      {React.cloneElement(getDeviceIcon(device.icon) as React.ReactElement, { className: "text-zinc-600 group-hover:text-emerald-500 transition-colors" })}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{device.name}</span>
                        <span className="text-[10px] font-bold text-zinc-900 dark:text-white tabular-nums tracking-tighter">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-full h-1.5 overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${device.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card space-y-8 border-black/5 dark:border-white/5">
             <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">System Protocols</h3>
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">Executive operational shortcuts</p>
             </div>
            <div className="space-y-4">
              {[
                { label: 'EXPORT DATASET', desc: 'CSV, Neural Protocol', icon: Download, color: 'emerald' },
                { label: 'SCHEDULED LOG', desc: 'Recurrent Sync Engine', icon: Calendar, color: 'blue' },
                { label: 'SYSTEM OVERRIDE', desc: 'Reconfigure Interface', icon: BarChart3, color: 'amber' },
              ].map((action) => {
                 const c = colorMap[action.color];
                 const Icon = action.icon;
                 return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10 transition-all text-left group"
                  >
                    <div className={`p-3 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 transition-all group-hover:scale-110`}>
                      <Icon size={18} className={`${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{action.label}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1 truncate">{action.desc}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
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
